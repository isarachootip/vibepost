"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createTopicAction, updateTopicAction } from "@/lib/actions/planner/topic.actions";
import { usePlannerAction } from "@/hooks/use-planner-action";
import { Field, fieldClass } from "./planner-ui";

export interface TopicFormValues {
  id: string;
  name: string;
  color: string;
  audience: string | null;
  sellingPoints: string | null;
  keywords: string[];
  forbidden: string | null;
  tone: string | null;
}

interface Props {
  workspaceId: string;
  topic?: TopicFormValues;
  triggerLabel: string;
  triggerVariant?: "tactile" | "neu";
}

export function TopicFormDialog({ workspaceId, topic, triggerLabel, triggerVariant = "tactile" }: Props) {
  const [open, setOpen] = useState(false);
  const { run, pending, error, clearError } = usePlannerAction();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = (k: string): string => String(f.get(k) ?? "");
    const payload = {
      workspaceId,
      name: text("name"),
      color: text("color"),
      audience: text("audience"),
      sellingPoints: text("sellingPoints"),
      keywords: text("keywords").split(","),
      forbidden: text("forbidden"),
      tone: text("tone"),
    };
    run(
      () => (topic ? updateTopicAction(topic.id, payload) : createTopicAction(payload)),
      () => setOpen(false)
    );
  }

  return (
    <>
      <Button variant={triggerVariant} size="lg" onClick={() => { clearError(); setOpen(true); }}>
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{topic ? "แก้ไข Topic" : "สร้าง Topic ใหม่"}</DialogTitle>
            <DialogDescription>ข้อมูลนี้ AI จะใช้ร่างแผนโพสต์ให้ตรงกลุ่มเป้าหมาย (Phase 2)</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-3">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Field label="ชื่อ Topic *">
                <input name="name" required defaultValue={topic?.name} placeholder="เช่น ยาง, แบตเตอรี่" className={fieldClass} />
              </Field>
              <Field label="สี">
                <input name="color" type="color" defaultValue={topic?.color ?? "#6366f1"} className="h-9 w-14 cursor-pointer rounded-lg" />
              </Field>
            </div>
            <Field label="กลุ่มเป้าหมาย" hint="ใครคือคนที่อยากให้เห็นโพสต์">
              <textarea name="audience" rows={2} defaultValue={topic?.audience ?? ""} placeholder="เช่น เจ้าของรถเก๋ง อายุ 25-45 ในกรุงเทพฯ" className={fieldClass} />
            </Field>
            <Field label="จุดขาย / สินค้า">
              <textarea name="sellingPoints" rows={2} defaultValue={topic?.sellingPoints ?? ""} placeholder="เช่น ยางรีดน้ำดี รับประกัน 5 ปี ติดตั้งฟรี" className={fieldClass} />
            </Field>
            <Field label="Keyword" hint="คั่นด้วยเครื่องหมายจุลภาค ( , )">
              <input name="keywords" defaultValue={topic?.keywords.join(", ")} placeholder="ยางรถยนต์, หน้าฝน, เบรกมั่นใจ" className={fieldClass} />
            </Field>
            <Field label="สิ่งที่ห้ามพูด">
              <input name="forbidden" defaultValue={topic?.forbidden ?? ""} placeholder="เช่น ห้ามเอ่ยชื่อคู่แข่ง" className={fieldClass} />
            </Field>
            <Field label="โทนการเขียน">
              <input name="tone" defaultValue={topic?.tone ?? ""} placeholder="เช่น เป็นกันเอง ให้ความรู้" className={fieldClass} />
            </Field>
            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            <Button type="submit" variant="tactile" size="lg" disabled={pending}>
              {pending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
