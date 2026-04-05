import { MemberCard } from "@/components/members/member-card";
import type { CommunityMemberListDTO } from "@/lib/members/queries";

export function MemberGrid({ members }: { members: CommunityMemberListDTO[] }) {
  if (members.length === 0) {
    return null;
  }

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((member) => (
        <li key={member.id}>
          <MemberCard member={member} />
        </li>
      ))}
    </ul>
  );
}
