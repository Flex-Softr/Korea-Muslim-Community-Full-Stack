"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import { ReusablePagination } from "@/components/ui/reusable-pagination";
import { useLanguage } from "@/components/providers/language-provider";
import { useToastSystem } from "@/components/ui/toast-system";
import { fetchDashboardContactSubmissions } from "@/lib/services/dashboard-contact-submissions";
import { parseJson } from "@/lib/services/dashboard-users";
import type { ContactOccupationValue } from "@/lib/contact/occupations";

type SubmissionRow = {
  id: string;
  name: string;
  mobileNumber: string;
  occupation: string;
  address: string;
  visaType: string;
  message: string;
  createdAt: string;
};

type ListResponse = {
  items: SubmissionRow[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 10;

const OCC_KEYS: Record<
  ContactOccupationValue,
  | "homeQuickContact.occupationOptionStudent"
  | "homeQuickContact.occupationOptionJobHolder"
  | "homeQuickContact.occupationOptionEps"
> = {
  student: "homeQuickContact.occupationOptionStudent",
  job_holder: "homeQuickContact.occupationOptionJobHolder",
  eps: "homeQuickContact.occupationOptionEps",
};

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateMessage(text: string, max = 72): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function isOccupation(v: string): v is ContactOccupationValue {
  return v === "student" || v === "job_holder" || v === "eps";
}

export function ContactSubmissionsModule() {
  const { t } = useLanguage();
  const { notify } = useToastSystem();
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messageTarget, setMessageTarget] = useState<SubmissionRow | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetchDashboardContactSubmissions(params);
      const data = await parseJson<ListResponse | { error?: string }>(res);
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed");
      }
      const body = data as ListResponse;
      setRows(body.items ?? []);
      setTotalPages(body.pagination?.totalPages ?? 1);
      setTotalItems(body.pagination?.totalItems ?? 0);
    } catch {
      notify(t("dashboard.contactSubmissions.loadError"), "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [notify, page, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const occupationLabel = useCallback(
    (value: string) => {
      if (isOccupation(value)) return t(OCC_KEYS[value]);
      return value;
    },
    [t],
  );

  const columns = useMemo<Array<DataTableColumn<SubmissionRow>>>(() => {
    return [
      {
        key: "createdAt",
        header: t("dashboard.contactSubmissions.colDate"),
        render: (row) => formatDate(row.createdAt),
      },
      {
        key: "name",
        header: t("dashboard.contactSubmissions.colName"),
        render: (row) => row.name,
      },
      {
        key: "mobileNumber",
        header: t("dashboard.contactSubmissions.colMobile"),
        render: (row) => row.mobileNumber,
      },
      {
        key: "occupation",
        header: t("dashboard.contactSubmissions.colOccupation"),
        render: (row) => occupationLabel(row.occupation),
      },
      {
        key: "address",
        header: t("dashboard.contactSubmissions.colAddress"),
        render: (row) => (
          <span className="line-clamp-2 max-w-[14rem] text-start">
            {row.address}
          </span>
        ),
      },
      {
        key: "visaType",
        header: t("dashboard.contactSubmissions.colVisa"),
        render: (row) => row.visaType,
      },
      {
        key: "message",
        header: t("dashboard.contactSubmissions.colMessage"),
        render: (row) => (
          <div className="flex max-w-[18rem] flex-col items-start gap-2">
            <span className="line-clamp-2 text-start text-sm text-muted-foreground">
              {truncateMessage(row.message)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setMessageTarget(row)}
            >
              <MessageSquareText className="me-1.5 size-3.5" aria-hidden />
              {t("dashboard.contactSubmissions.view")}
            </Button>
          </div>
        ),
      },
    ];
  }, [occupationLabel, t]);

  return (
    <section className="space-y-4">
      <PageHeader
        title={t("dashboard.contactSubmissions.title")}
        subtitle={t("dashboard.contactSubmissions.intro")}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          {t("dashboard.contactSubmissions.empty")}
        </p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            getRowId={(row) => row.id}
          />
          <p className="text-sm text-muted-foreground">
            {t("dashboard.contactSubmissions.summary", {
              page,
              totalPages,
              total: totalItems,
            })}
          </p>
          <ReusablePagination
            currentPage={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      )}

      <Dialog
        open={messageTarget !== null}
        onOpenChange={(open) => {
          if (!open) setMessageTarget(null);
        }}
      >
        <DialogContent showCloseButton className="max-w-lg">
          <DialogTitle>
            {t("dashboard.contactSubmissions.dialogTitle")}
            {messageTarget ? (
              <span className="mt-1 block text-sm font-normal text-muted-foreground">
                {messageTarget.name} · {formatDate(messageTarget.createdAt)}
              </span>
            ) : null}
          </DialogTitle>
          {messageTarget ? (
            <div className="max-h-[min(60vh,24rem)] overflow-y-auto pe-1">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {messageTarget.message}
              </p>
            </div>
          ) : null}
          <div className="flex justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setMessageTarget(null)}>
              {t("dashboard.contactSubmissions.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
