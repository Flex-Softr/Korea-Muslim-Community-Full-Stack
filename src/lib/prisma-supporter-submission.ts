import { prisma } from "@/lib/prisma";

export function supporterSubmissionDelegate() {
  return Reflect.get(prisma, "supporterSubmission") as unknown as
    | {
        create: (args: {
          data: {
            name: string;
            mobileNumber: string;
            occupation: string;
            address: string;
            visaType: string;
            whyWantBecomeSupporter: string;
            previouslySupporter: boolean;
            directJoinOnOrganization: boolean;
          };
        }) => Promise<unknown>;
        count: (args?: { where?: object }) => Promise<number>;
        delete: (args: { where: { id: string } }) => Promise<unknown>;
        findUnique: (args: { where: { id: string } }) => Promise<{
          id: string;
          name: string;
          mobileNumber: string;
          occupation: string;
          address: string;
          visaType: string;
          whyWantBecomeSupporter: string;
          previouslySupporter: boolean;
          directJoinOnOrganization: boolean;
          createdAt: Date;
        } | null>;
        findMany: (args: {
          orderBy?: object;
          skip?: number;
          take?: number;
          select?: object;
        }) => Promise<
          Array<{
            id: string;
            name: string;
            mobileNumber: string;
            occupation: string;
            address: string;
            visaType: string;
            whyWantBecomeSupporter: string;
            previouslySupporter: boolean;
            directJoinOnOrganization: boolean;
            createdAt: Date;
          }>
        >;
      }
    | undefined;
}

export const SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE =
  "Stop the dev server, run: npx prisma generate && npx prisma db push, then restart.";
