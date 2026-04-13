"use client";

const PENDING_USERS_CHANGED_EVENT = "dashboard:pending-users-changed";

export function emitPendingUsersChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PENDING_USERS_CHANGED_EVENT));
}

export function onPendingUsersChanged(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PENDING_USERS_CHANGED_EVENT, listener);
  return () => window.removeEventListener(PENDING_USERS_CHANGED_EVENT, listener);
}
