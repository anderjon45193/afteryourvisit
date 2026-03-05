/** Normalize a phone string to 10 digits (strips +1 country code) */
function toDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "1") digits = digits.slice(1);
  return digits;
}

/** Format phone for full display: (555) 123-4567 */
export function formatPhoneDisplay(phone: string): string {
  const digits = toDigits(phone);
  if (digits.length !== 10) return phone;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Mask phone for default display: (555) •••-4567 */
export function maskPhone(phone: string): string {
  const digits = toDigits(phone);
  if (digits.length !== 10) return phone;
  return `(${digits.slice(0, 3)}) •••-${digits.slice(6)}`;
}

/** Format phone as a tel: href: tel:+15551234567 */
export function phoneToTelHref(phone: string): string {
  const digits = toDigits(phone);
  return `tel:+1${digits}`;
}
