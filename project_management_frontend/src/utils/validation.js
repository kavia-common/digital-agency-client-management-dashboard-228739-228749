// PUBLIC_INTERFACE
export function validateEmail(email) {
  /** Simple email validation. */
  const v = String(email || "").trim();
  if (!v) return "Email is required.";
  // Simple sanity check (backend uses EmailStr anyway)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
  return null;
}

// PUBLIC_INTERFACE
export function validatePassword(password) {
  /** Password validation used by login/register. */
  const v = String(password || "");
  if (!v) return "Password is required.";
  if (v.length < 6) return "Password must be at least 6 characters.";
  return null;
}

// PUBLIC_INTERFACE
export function requiredText(value, label) {
  /** Required text validation helper. */
  const v = String(value || "").trim();
  if (!v) return `${label} is required.`;
  if (v.length > 255) return `${label} is too long.`;
  return null;
}
