"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookmarkPlus, Layers } from "lucide-react";

interface StudioDraftSavedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToDrafts: () => void;
}

export function StudioDraftSavedDialog({
  open,
  onOpenChange,
  onGoToDrafts,
}: StudioDraftSavedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 text-center">
        <div className="py-4 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 neu-tint-primary rounded-full flex items-center justify-center">
            <BookmarkPlus className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="font-display text-xl font-extrabold text-foreground">
              บันทึกเข้าคลังแบบร่างเรียบร้อย! 🎉
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              คอนเทนต์ถูกเก็บไว้ใน <strong>&ldquo;คลังแบบร่างรอโพสต์ (Drafts Queue)&rdquo;</strong> คุณสามารถเปิดดูและคลิกสั่งโพสต์ได้ทุกเมื่อ
            </DialogDescription>
          </div>
          <div className="flex gap-3 pt-3 w-full">
            <Button
              variant="neu"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-xs font-bold rounded-xl h-11"
            >
              ✨ สร้างเนื้อหาต่อ
            </Button>
            <Button
              variant="tactile"
              onClick={onGoToDrafts}
              className="flex-1 text-xs font-bold rounded-xl h-11 flex items-center justify-center gap-1.5"
            >
              <Layers className="w-4 h-4" /> ไปดูคลังแบบร่าง
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
