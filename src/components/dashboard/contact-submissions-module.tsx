"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquareText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
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
import {
  deleteDashboardContactSubmission,
  fetchDashboardContactSubmissions,
} from "@/lib/services/dashboard-contact-submissions";
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

function DetailField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border/70 bg-muted/30 p-3 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium leading-relaxed text-foreground">
        {value || "N/A"}
      </p>
    </div>
  );
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
  const [deleteTarget, setDeleteTarget] = useState<SubmissionRow | null>(null);

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
      {
        key: "actions",
        header: t("dashboard.contactSubmissions.colActions"),
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (row) => (
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            title={t("dashboard.contactSubmissions.delete")}
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        ),
      },
    ];
  }, [occupationLabel, t]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteDashboardContactSubmission(deleteTarget.id);
      if (!res.ok) {
        const data = await parseJson<{ error?: string }>(res);
        throw new Error(data.error ?? "Failed");
      }
      notify(t("dashboard.contactSubmissions.deleteSuccess"), "success");
      setDeleteTarget(null);
      if (messageTarget?.id === deleteTarget.id) setMessageTarget(null);
      if (rows.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
        return;
      }
      void load();
    } catch {
      notify(t("dashboard.contactSubmissions.deleteError"), "error");
    }
  }, [deleteTarget, load, messageTarget?.id, notify, page, rows.length, t]);

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
        <DialogContent showCloseButton className="max-w-3xl rounded-2xl p-5">
          <DialogTitle>
            {t("dashboard.contactSubmissions.dialogTitle")}
            {messageTarget ? (
              <span className="mt-1 block text-sm font-normal text-muted-foreground">
                {messageTarget.name} · {formatDate(messageTarget.createdAt)}
              </span>
            ) : null}
          </DialogTitle>
          {messageTarget ? (
            <div className="max-h-[min(68vh,34rem)] overflow-y-auto pe-1 pt-2">
              <div className="grid gap-3 md:grid-cols-2">
                <DetailField
                  label={t("dashboard.contactSubmissions.labelSubmissionId")}
                  value={messageTarget.id}
                />
                <DetailField
                  label={t("dashboard.contactSubmissions.colDate")}
                  value={formatDate(messageTarget.createdAt)}
                />
                <DetailField
                  label={t("dashboard.contactSubmissions.colName")}
                  value={messageTarget.name}
                />
                <DetailField
                  label={t("dashboard.contactSubmissions.colMobile")}
                  value={messageTarget.mobileNumber}
                />
                <DetailField
                  label={t("dashboard.contactSubmissions.colOccupation")}
                  value={occupationLabel(messageTarget.occupation)}
                />
                <DetailField
                  label={t("dashboard.contactSubmissions.colVisa")}
                  value={messageTarget.visaType}
                />
                <DetailField
                  label={t("dashboard.contactSubmissions.colAddress")}
                  value={messageTarget.address}
                  className="md:col-span-2"
                />
                <div className="rounded-xl border border-border/70 bg-background p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("dashboard.contactSubmissions.colMessage")}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
                    {messageTarget.message || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="flex flex-col-reverse justify-between gap-2 border-t border-border/80 pt-4 sm:flex-row">
            {messageTarget ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteTarget(messageTarget)}
              >
                <Trash2 className="me-1.5 size-4" aria-hidden />
                {t("dashboard.contactSubmissions.delete")}
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" variant="secondary" onClick={() => setMessageTarget(null)}>
              {t("dashboard.contactSubmissions.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmActionModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("dashboard.contactSubmissions.deleteTitle")}
        description={t("dashboard.contactSubmissions.deleteDescription", {
          name: deleteTarget?.name ?? t("dashboard.contactSubmissions.thisSubmission"),
        })}
        confirmLabel={t("dashboard.contactSubmissions.delete")}
        cancelLabel={t("dashboard.contactSubmissions.cancel")}
        confirmVariant="destructive"
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </section>
  );
}
