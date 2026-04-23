import { prisma } from "@/lib/prisma";

function buildMemberCodeCandidate(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `REG-${y}${m}${d}-${random}`;
}

export async function createUniqueMemberCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = buildMemberCodeCandidate();
    const existing = await prisma.communityMember.findUnique({
      where: { memberCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("Could not generate unique member code");
}
