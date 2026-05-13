const suspendedUserIds = new Set<string>();

/** Used for DB filters (pagination, counts) so suspended accounts stay consistent with `getStatus`. */
export function getSuspendedUserIds(): string[] {
  return [...suspendedUserIds];
}

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
