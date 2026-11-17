import assert from "node:assert/strict";
import {
  togglePostShowcaseSchema,
  togglePostPinSchema,
  updateWorkspaceShowcaseSchema,
} from "../src/lib/validations/showcase.schema";
import {
  authorizePostShowcaseChange,
  authorizePostPinChange,
  authorizeWorkspaceShowcaseChange,
  curateShowcaseFeed,
  type RawShowcasePost,
} from "../src/lib/services/showcase-visibility.service";

export async function runShowcaseCurationTests(): Promise<void> {
  // 1. Zod boundary validation
  {
    assert.equal(
      togglePostShowcaseSchema.safeParse({ postId: "p1", showOnLanding: false }).success,
      true
    );
    assert.equal(
      togglePostShowcaseSchema.safeParse({ postId: "", showOnLanding: false }).success,
      false
    );
    assert.equal(
      togglePostPinSchema.safeParse({ postId: "p1", isPinnedOnLanding: true }).success,
      true
    );
    assert.equal(
      updateWorkspaceShowcaseSchema.safeParse({ workspaceId: "ws1", showOnLanding: false }).success,
      true
    );
  }

  // 2. RBAC: Super Admin vs Workspace Admin vs Member
  {
    // Super Admin can do everything
    assert.equal(
      authorizePostShowcaseChange({
        isSuperAdmin: true,
        workspaceRole: "ADMIN",
        workspaceShowOnLanding: false,
        nextShowOnLanding: true,
      }).allowed,
      true
    );
    assert.equal(authorizePostPinChange({ isSuperAdmin: true }).allowed, true);
    assert.equal(
      authorizeWorkspaceShowcaseChange({
        isSuperAdmin: true,
        workspaceRole: "ADMIN",
        nextShowOnLanding: true,
      }).allowed,
      true
    );

    // Workspace Admin can hide own post, and unhide ONLY if workspace is enabled
    assert.equal(
      authorizePostShowcaseChange({
        isSuperAdmin: false,
        workspaceRole: "ADMIN",
        workspaceShowOnLanding: false,
        nextShowOnLanding: false,
      }).allowed,
      true
    );
    assert.equal(
      authorizePostShowcaseChange({
        isSuperAdmin: false,
        workspaceRole: "ADMIN",
        workspaceShowOnLanding: false,
        nextShowOnLanding: true,
      }).allowed,
      false
    );
    assert.equal(
      authorizePostShowcaseChange({
        isSuperAdmin: false,
        workspaceRole: "ADMIN",
        workspaceShowOnLanding: true,
        nextShowOnLanding: true,
      }).allowed,
      true
    );

    // Workspace Admin cannot pin globally; can turn workspace OFF, but not force back ON
    assert.equal(authorizePostPinChange({ isSuperAdmin: false }).allowed, false);
    assert.equal(
      authorizeWorkspaceShowcaseChange({
        isSuperAdmin: false,
        workspaceRole: "ADMIN",
        nextShowOnLanding: false,
      }).allowed,
      true
    );
    assert.equal(
      authorizeWorkspaceShowcaseChange({
        isSuperAdmin: false,
        workspaceRole: "ADMIN",
        nextShowOnLanding: true,
      }).allowed,
      false
    );

    // Member & Viewer cannot change showcase visibility
    assert.equal(
      authorizePostShowcaseChange({
        isSuperAdmin: false,
        workspaceRole: "MEMBER",
        workspaceShowOnLanding: true,
        nextShowOnLanding: false,
      }).allowed,
      false
    );
  }

  // 3. Curating showcase feed preserves full platform Hero stats while filtering & pinning cards
  {
    const sample: RawShowcasePost[] = [
      {
        id: "post-older-pinned",
        workspaceId: "ws-odm",
        workspaceName: "ODM",
        workspaceShowOnLanding: true,
        content: "Pinned signature dish",
        publishedTime: new Date("2026-10-01T10:00:00Z"),
        showOnLanding: true,
        isPinnedOnLanding: true,
        images: [],
        channels: [{ platform: "FACEBOOK", accountName: "ODM", status: "PUBLISHED" }],
      },
      {
        id: "post-newer-visible",
        workspaceId: "ws-odm",
        workspaceName: "ODM",
        workspaceShowOnLanding: true,
        content: "Newest coastal dish",
        publishedTime: new Date("2026-11-16T10:00:00Z"),
        showOnLanding: true,
        isPinnedOnLanding: false,
        images: [],
        channels: [
          { platform: "FACEBOOK", accountName: "ODM", status: "PUBLISHED" },
          { platform: "INSTAGRAM", accountName: "ODM IG", status: "PUBLISHED" },
        ],
      },
      {
        id: "post-hidden-single",
        workspaceId: "ws-odm",
        workspaceName: "ODM",
        workspaceShowOnLanding: true,
        content: "Car garage test post",
        publishedTime: new Date("2026-11-15T10:00:00Z"),
        showOnLanding: false,
        isPinnedOnLanding: false,
        images: [],
        channels: [{ platform: "FACEBOOK", accountName: "ODM", status: "PUBLISHED" }],
      },
      {
        id: "post-hidden-workspace",
        workspaceId: "ws-secret",
        workspaceName: "Secret Client",
        workspaceShowOnLanding: false,
        content: "Confidential client campaign",
        publishedTime: new Date("2026-11-17T10:00:00Z"),
        showOnLanding: true,
        isPinnedOnLanding: true,
        images: [],
        channels: [{ platform: "TIKTOK", accountName: "Secret TT", status: "PUBLISHED" }],
      },
    ];

    const publicView = curateShowcaseFeed(sample, { includeHidden: false });
    // Hero counters reflect ALL 4 published posts & 5 published channel reposts & 3 platforms!
    assert.equal(publicView.heroStats.totalPosts, 4);
    assert.equal(publicView.heroStats.totalChannels, 3);
    assert.equal(publicView.heroStats.totalSuccessfulReposts, 5);
    assert.equal(publicView.hiddenCount, 2);
    // Visible gallery has only 2 items, with pinned first!
    assert.deepEqual(
      publicView.posts.map((p) => p.id),
      ["post-older-pinned", "post-newer-visible"]
    );

    const adminPreview = curateShowcaseFeed(sample, { includeHidden: true });
    assert.equal(adminPreview.posts.length, 4);
    assert.equal(adminPreview.posts.filter((p) => !p.effectivelyVisible).length, 2);
  }

  console.log("  ✓ showcase-curation.test.ts passed (3 assertions)");
}
