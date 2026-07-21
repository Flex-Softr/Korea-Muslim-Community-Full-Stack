"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type Submission = {
  id: string;
  name: string;
  mobileNumber: string;
  occupation: string;
  address: string;
  visaType: string;
  whyWantBecomeSupporter: string;
  previouslySupporter: boolean;
  directJoinOnOrganization: boolean;
  createdAt: string | Date;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 border-b border-border py-2 last:border-b-0">
      <span className="text-sm font-medium text-muted-foreground capitalize">
        {label}
      </span>
      <span className="text-sm whitespace-pre-wrap wrap-break-word capitalize">
        {value}
      </span>
    </div>
  );
}

export function SubmissionDetailsModal({
  submission,
}: {
  submission: Submission;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        View
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <div className="flex flex-col gap-4 overflow-y-auto p-6">
            <div className="space-y-1">
              <DialogTitle>{submission.name}</DialogTitle>
              <DialogDescription>
                Supporter submission details
              </DialogDescription>
            </div>
            <div className="rounded-xl border border-border p-4">
              <DetailRow label="Name" value={submission.name} />
              <DetailRow label="Mobile" value={submission.mobileNumber} />
              <DetailRow label="Occupation" value={submission.occupation} />
              <DetailRow label="Address" value={submission.address} />
              <DetailRow label="Visa Type" value={submission.visaType} />
              <DetailRow
                label="Why supporter"
                value={submission.whyWantBecomeSupporter}
              />
              <DetailRow
                label="Previously supporter"
                value={submission.previouslySupporter ? "Yes" : "No"}
              />
              <DetailRow
                label="Direct join"
                value={submission.directJoinOnOrganization ? "Yes" : "No"}
              />
              <DetailRow
                label="Created At"
                value={new Date(submission.createdAt).toLocaleString()}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
