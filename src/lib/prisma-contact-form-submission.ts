import { prisma } from "@/lib/prisma";

/**
 * `ContactFormSubmission` exists in `schema.prisma`, but the delegate is only
 * available after a successful `npx prisma generate`. If generate failed (e.g.
 * Windows EPERM while `next dev` holds the query engine), this is `undefined`.
 */
export function contactFormSubmissionDelegate() {
  return Reflect.get(prisma, "contactFormSubmission") as unknown as
    | {
        create: (args: {
          data: {
            name: string;
            mobileNumber: string;
            occupation: string;
            address: string;
            visaType: string;
            message: string;
          };
        }) => Promise<unknown>;
        count: (args?: { where?: object }) => Promise<number>;
        delete: (args: { where: { id: string } }) => Promise<unknown>;
        findMany: (args: {
          orderBy: object;
          skip: number;
          take: number;
          select: {
            id: boolean;
            name: boolean;
            mobileNumber: boolean;
            occupation: boolean;
            address: boolean;
            visaType: boolean;
            message: boolean;
            createdAt: boolean;
          };
        }) => Promise<
          Array<{
            id: string;
            name: string;
            mobileNumber: string;
            occupation: string;
            address: string;
            visaType: string;
            message: string;
            createdAt: Date;
          }>
        >;
      }
    | undefined;
}

export const CONTACT_FORM_PRISMA_SETUP_MESSAGE =
  "Stop the dev server, run: npx prisma generate && npx prisma db push, then restart.";
