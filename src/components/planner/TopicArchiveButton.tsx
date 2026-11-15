"use client";

import { setTopicStatusAction } from "@/lib/actions/planner/topic.actions";
import { usePlannerAction } from "@/hooks/use-planner-action";
import { Button } from "@/components/ui/button";

interface Props {
  workspaceId: string;
  topicId: string;
  archived: boolean;
}

/** ADMIN-only. Archive hides the topic from planning; nothing is deleted. */
export function TopicArchiveButton({ workspaceId, topicId, archived }: Props) {
  const { run, pending, error } = usePlannerAction();

  function toggle() {
    if (!archived && !confirm("Archive Topic นี้? โพสต์และ Campaign เดิมยังอยู่ครบ กู้คืนได้ภายหลัง")) return;
    run(() =>
      setTopicStatusAction({ workspaceId, topicId, status: archived ? "ACTIVE" : "ARCHIVED" })
    );
  }

  return (
    <span className="flex items-center gap-2">
      <Button variant={archived ? "neu" : "destructive"} size="lg" disabled={pending} onClick={toggle}>
        {archived ? "กู้คืน Topic" : "Archive"}
      </Button>
      {error && <span className="text-xs font-semibold text-destructive">{error}</span>}
    </span>
  );
}
