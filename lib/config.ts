export function getEventName() {
  return process.env.EVENT_NAME?.trim() || "KZero Conference";
}
