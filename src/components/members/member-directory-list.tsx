"use client";

import { DataPagination } from "@/components/ui/pagination";
import { MemberGrid } from "@/components/members/member-grid";
import type { CommunityMemberListDTO } from "@/lib/members/queries";
import { usePagination } from "@/hooks/use-pagination";

const PAGE_SIZE = 8;

export function MemberDirectoryList({
  members,
}: {
  members: CommunityMemberListDTO[];
}) {
  const { page, setPage, totalPages, offset } = usePagination({
    totalItems: members.length,
    pageSize: PAGE_SIZE,
  });

  const pageMembers = members.slice(offset, offset + PAGE_SIZE);

  if (members.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-8 text-sm text-muted-foreground sm:mb-10">
        Showing{" "}
        <span className="font-medium text-foreground">
          {offset + 1}–{offset + pageMembers.length}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">{members.length}</span>{" "}
        members
      </p>

      <MemberGrid members={pageMembers} />

      <DataPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-10"
        ariaLabel="Member directory pagination"
        showSummary
        align="center"
      />
    </div>
  );
}
