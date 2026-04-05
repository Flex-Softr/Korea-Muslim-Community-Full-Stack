-- AlterTable
ALTER TABLE "CommunityMember" ADD COLUMN "memberCode" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "nameBn" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "gender" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "dateOfBirth" DATETIME;
ALTER TABLE "CommunityMember" ADD COLUMN "dateOfBirthYearOnly" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CommunityMember" ADD COLUMN "universityKr" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "degree" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "major" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "studyStatus" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "yearAdmission" INTEGER;
ALTER TABLE "CommunityMember" ADD COLUMN "graduationYear" INTEGER;
ALTER TABLE "CommunityMember" ADD COLUMN "locationCity" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "occupationType" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "companyName" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "jobTitle" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "profileVisibility" TEXT NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE "CommunityMember" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "phone" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "whatsApp" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "kakaoId" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "linkedInUrl" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "facebookUrl" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "yearArrivalKorea" INTEGER;
ALTER TABLE "CommunityMember" ADD COLUMN "visaType" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "scholarshipInfo" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "educationBangladesh" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "skillsTechnical" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "koreanLevelTopik" TEXT;
ALTER TABLE "CommunityMember" ADD COLUMN "certifications" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMember_memberCode_key" ON "CommunityMember"("memberCode");
