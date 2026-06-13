/** Normalize to E.164-ish: digits with leading + */
export const normalizePhoneNumber = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;

  return hasPlus || digits.length > 10 ? `+${digits}` : `+1${digits}`;
};

export const maskPhoneNumber = (e164: string): { masked: string; last4: string } => {
  const digits = e164.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  const country = e164.startsWith("+1") ? "+1" : `+${digits.slice(0, Math.max(1, digits.length - 10))}`;
  return {
    masked: `${country} ••• ••• ${last4}`,
    last4,
  };
};

export const generateCheckInCode = (): string =>
  String(Math.floor(1000 + Math.random() * 9000));
