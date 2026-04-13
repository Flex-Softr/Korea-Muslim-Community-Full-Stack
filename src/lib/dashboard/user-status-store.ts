const suspendedUserIds = new Set<string>();

export function isSuspendedUser(userId: string): boolean {
  return suspendedUserIds.has(userId);
}

export function setSuspendedUser(userId: string, suspended: boolean): void {
  if (suspended) {
    suspendedUserIds.add(userId);
    return;
  }
  suspendedUserIds.delete(userId);
}
