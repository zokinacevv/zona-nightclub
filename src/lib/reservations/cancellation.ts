import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  return process.env.AUTH_SECRET ?? "local-development-secret";
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createGuestCancellationToken(
  reservationId: string,
  expiresAt: Date,
) {
  const payload = `${reservationId}.${expiresAt.getTime()}`;
  return `${payload}.${signature(payload)}`;
}

export function verifyGuestCancellationToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [reservationId, expiresAtValue, providedSignature] = parts;
  const payload = `${reservationId}.${expiresAtValue}`;
  const expectedSignature = signature(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(providedSignature);
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null;
  }

  const expiresAtMs = Number(expiresAtValue);
  if (!reservationId || !Number.isSafeInteger(expiresAtMs)) return null;
  const expiresAt = new Date(expiresAtMs);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now())
    return null;

  return { reservationId, expiresAt };
}
