import Link from "next/link";
import {
  SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE,
  supporterSubmissionDelegate,
} from "@/lib/prisma-supporter-submission";
import { SubmissionDetailsModal } from "./submission-details-modal";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function SupporterSubmissionsPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const page = Math.max(parseInt((params.page as string) ?? "1"), 1);
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const delegate = supporterSubmissionDelegate();
  if (!delegate?.findMany || !delegate?.count) {
    throw new Error(
      `Supporter submission storage is not ready. ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}`
    );
  }

  const [items, total] = await Promise.all([
    delegate.findMany({ skip, take: pageSize, orderBy: { createdAt: "desc" } }),
    delegate.count(),
  ]);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold mb-4">Supporter Submissions</h1>
      <table className="w-full border-collapse mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Mobile</th>
            <th className="border p-2 text-left">Occupation</th>
            <th className="border p-2 text-left">Created At</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((sub) => (
            <tr key={sub.id} className="odd:bg-white even:bg-gray-50">
              <td className="border p-2">{sub.name}</td>
              <td className="border p-2">{sub.mobileNumber}</td>
              <td className="border p-2">{sub.occupation}</td>
              <td className="border p-2">{new Date(sub.createdAt).toLocaleDateString()}</td>
              <td className="border p-2">
                <SubmissionDetailsModal submission={sub} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav className="flex justify-center space-x-4">
        {page > 1 && (
          <Link href={`/dashboard/supporter-submissions?page=${page - 1}`} className="px-4 py-2 bg-blue-600 text-white rounded">Previous</Link>
        )}
        {page < totalPages && (
          <Link href={`/dashboard/supporter-submissions?page=${page + 1}`} className="px-4 py-2 bg-blue-600 text-white rounded">Next</Link>
        )}
        <span className="self-center">Page {page} of {totalPages}</span>
      </nav>
    </section>
  );
}
