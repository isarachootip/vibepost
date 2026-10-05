import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * AES-256-GCM encryption for secrets stored in the DB (social tokens, AI API keys).
 *
 * Format: enc:v1:<keyId>:<iv b64>:<tag b64>:<ciphertext b64>
 *  - ENCRYPTION_KEY       = current key (32 bytes, base64)  -> keyId "k1" by default
 *  - ENCRYPTION_KEY_ID    = optional id of the current key (for rotation)
 *  - ENCRYPTION_KEYS_OLD  = optional "id:base64,id:base64" list of retired keys still usable for decrypt
 *
 * Backward compatible: values without the "enc:v1:" prefix are treated as legacy plaintext.
 * If ENCRYPTION_KEY is not set, values are stored as plaintext (with a warning) so the app keeps working.
 */
const PREFIX = "enc:v1:";

function loadKeys(): { currentId: string | null; keys: Map<string, Buffer> } {
  const keys = new Map<string, Buffer>();
  const currentRaw = process.env.ENCRYPTION_KEY;
  const currentId = process.env.ENCRYPTION_KEY_ID || "k1";
  if (currentRaw) {
    const key = Buffer.from(currentRaw, "base64");
    if (key.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes encoded as base64");
    keys.set(currentId, key);
  }
  for (const pair of (process.env.ENCRYPTION_KEYS_OLD || "").split(",").filter(Boolean)) {
    const [id, b64] = pair.split(":");
    if (id && b64) keys.set(id.trim(), Buffer.from(b64.trim(), "base64"));
  }
  return { currentId: currentRaw ? currentId : null, keys };
}

let warned = false;

export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encryptSecret(plain: string): string;
export function encryptSecret(plain: string | null | undefined): string | null | undefined;
export function encryptSecret(plain: string | null | undefined): string | null | undefined {
  if (plain == null || plain === "" || isEncrypted(plain)) return plain;
  const { currentId, keys } = loadKeys();
  if (!currentId) {
    if (!warned) {
      console.warn("[crypto] ENCRYPTION_KEY not set — secrets are stored UNENCRYPTED.");
      warned = true;
    }
    return plain;
  }
  const key = keys.get(currentId)!;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${currentId}:${iv.toString("base64")}:${tag.toString("base64")}:${ct.toString("base64")}`;
}

export function decryptSecret(value: string): string;
export function decryptSecret(value: string | null | undefined): string | null | undefined;
export function decryptSecret(value: string | null | undefined): string | null | undefined {
  if (!isEncrypted(value)) return value; // legacy plaintext or null
  const [keyId, ivB64, tagB64, ctB64] = value!.slice(PREFIX.length).split(":");
  const key = loadKeys().keys.get(keyId);
  if (!key) throw new Error(`[crypto] No key available for keyId "${keyId}"`);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]).toString("utf8");
}

/** For UI display only, e.g. "••••abcd". Never send the real value to the client. */
export function maskSecret(plain: string | null | undefined): string {
  if (!plain) return "";
  return `••••${plain.slice(-4)}`;
}
