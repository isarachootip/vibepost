import { z } from "zod";
import { AuthError } from "@/lib/auth-guard";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

export function zodFail(error: z.ZodError): ActionResult<never> {
  return fail(error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
}

/** Maps thrown errors to a safe user-facing result (never leaks internals). */
export function errorToResult(e: unknown): ActionResult<never> {
  if (e instanceof AuthError) {
    return fail(e.status === 401 ? "กรุณาเข้าสู่ระบบ" : "คุณไม่มีสิทธิ์ทำรายการนี้");
  }
  console.error("[planner] action failed:", e);
  return fail("เกิดข้อผิดพลาด กรุณาลองใหม่");
}
