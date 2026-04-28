import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Get the first user in the database (acting as the admin/owner)
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "No user found in the database. Please register/login first." }, { status: 400 });
    }

    // 2. Check if ODM Workspace already exists
    let odmWorkspace = await prisma.workspace.findFirst({
      where: { name: "ODM" }
    });

    if (odmWorkspace) {
      // Clean up old ODM data if it exists to regenerate fresh demo data
      await prisma.postTarget.deleteMany({ where: { post: { workspaceId: odmWorkspace.id } } });
      await prisma.postMedia.deleteMany({ where: { post: { workspaceId: odmWorkspace.id } } });
      await prisma.post.deleteMany({ where: { workspaceId: odmWorkspace.id } });
      await prisma.mediaAsset.deleteMany({ where: { workspaceId: odmWorkspace.id } });
      await prisma.socialConnection.deleteMany({ where: { workspaceId: odmWorkspace.id } });
    } else {
      // Create ODM Workspace
      odmWorkspace = await prisma.workspace.create({
        data: {
          name: "ODM",
          ownerId: user.id,
          members: {
            create: { userId: user.id }
          }
        }
      });
    }

    // 3. Create Social Connections for ODM
    const fbConnection = await prisma.socialConnection.create({
      data: {
        workspaceId: odmWorkspace.id,
        platform: "FACEBOOK",
        accountId: "fb-odm-123",
        accountName: "ODM Cafe & Bistro",
        accessToken: "demo-token"
      }
    });

    const igConnection = await prisma.socialConnection.create({
      data: {
        workspaceId: odmWorkspace.id,
        platform: "INSTAGRAM",
        accountId: "ig-odm-123",
        accountName: "@odm_cafe",
        accessToken: "demo-token"
      }
    });

    const liConnection = await prisma.socialConnection.create({
      data: {
        workspaceId: odmWorkspace.id,
        platform: "LINKEDIN",
        accountId: "li-odm-123",
        accountName: "ODM Official Group",
        accessToken: "demo-token"
      }
    });

    // 4. Create Media Assets
    const image1 = await prisma.mediaAsset.create({
      data: {
        workspaceId: odmWorkspace.id,
        fileName: "odm_coffee.jpg",
        fileUrl: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800",
        fileType: "IMAGE",
        status: "APPROVED"
      }
    });

    const image2 = await prisma.mediaAsset.create({
      data: {
        workspaceId: odmWorkspace.id,
        fileName: "odm_cake.jpg",
        fileUrl: "https://images.pexels.com/photos/1055271/pexels-photo-1055271.jpeg?auto=compress&cs=tinysrgb&w=800",
        fileType: "IMAGE",
        status: "APPROVED"
      }
    });

    const video1 = await prisma.mediaAsset.create({
      data: {
        workspaceId: odmWorkspace.id,
        fileName: "odm_vibe.mp4",
        fileUrl: "https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4",
        fileType: "VIDEO",
        status: "APPROVED"
      }
    });

    // 5. Create Posts (Published and Drafts)
    
    // Post 1: Published (FB, IG)
    const post1 = await prisma.post.create({
      data: {
        workspaceId: odmWorkspace.id,
        content: "เริ่มต้นเช้าวันใหม่ที่ ODM Cafe ☕️ กาแฟคั่วบดหอมๆ พร้อมเสิร์ฟแล้ววันนี้! แวะมาเติมพลังกันนะคะ #ODMCafe #MorningCoffee",
        status: "PUBLISHED",
        publishedTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        media: { create: { mediaAssetId: image1.id } },
        targets: {
          create: [
            { socialConnectionId: fbConnection.id, status: "PUBLISHED" },
            { socialConnectionId: igConnection.id, status: "PUBLISHED" }
          ]
        }
      }
    });

    // Post 2: Published Video (FB, IG, LinkedIn)
    const post2 = await prisma.post.create({
      data: {
        workspaceId: odmWorkspace.id,
        content: "บรรยากาศยามบ่ายที่ ODM ✨ มุมพักผ่อนที่ลงตัวที่สุดสำหรับคุณ นั่งทำงานก็เพลิน นั่งชิลก็ฟิน! เข้ามาสัมผัสด้วยตัวคุณเองได้แล้ววันนี้",
        status: "PUBLISHED",
        publishedTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        media: { create: { mediaAssetId: video1.id } },
        targets: {
          create: [
            { socialConnectionId: fbConnection.id, status: "PUBLISHED" },
            { socialConnectionId: igConnection.id, status: "PUBLISHED" },
            { socialConnectionId: liConnection.id, status: "PUBLISHED" }
          ]
        }
      }
    });

    // Post 3: Draft (Waiting Approval)
    const post3 = await prisma.post.create({
      data: {
        workspaceId: odmWorkspace.id,
        content: "โปรโมชั่นพิเศษสุดสัปดาห์นี้! ซื้อเค้ก 1 ชิ้น แถมฟรีเครื่องดื่ม 1 แก้ว 🍰🍹 รีบมาด่วน สินค้ามีจำนวนจำกัด!",
        status: "WAITING_APPROVAL",
        media: { create: { mediaAssetId: image2.id } },
        targets: {
          create: [
            { socialConnectionId: fbConnection.id, status: "DRAFT" },
            { socialConnectionId: igConnection.id, status: "DRAFT" }
          ]
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "ODM Workspace and Demo data created successfully!",
      workspace: odmWorkspace.name
    });

  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
