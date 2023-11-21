import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, LayoutDashboard, File } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { AssignmentAccessForm } from "./_components/assignment-access-form";
import { AttachmentForm } from "./_components/assignment-attachment-form";
import { AssignmentDescriptionForm } from "./_components/assignment-description-form";
import { AssignmentTitleForm } from "./_components/assignment-title-form";
import { AssignmentActions } from "./_components/assignment-actions";


const AssignmentIdPage = async ({
  params
}: {
  params: { courseId: string; assignmentId: string }
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const assignment = await db.assignment.findUnique({
    where: {
      id: params.assignmentId,
      courseId: params.courseId
    },

  });

  if (!assignment) {
    return redirect("/")
  }

  const requiredFields = [
    assignment.title,
    assignment.description,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!assignment.isPublished && (
        <Banner
          variant="warning"
          label="This schoolwork is unpublished. It will not be visible in the course"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${params.courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">
                  Schoolwork Creation
                </h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText}
                </span>
              </div>
              <AssignmentActions
                disabled={!isComplete}
                courseId={params.courseId}
                assignmentId={params.assignmentId}
                isPublished={assignment.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">
                  Customize your schoolwork
                </h2>
              </div>
              <AssignmentTitleForm
                initialData={assignment}
                courseId={params.courseId}
                assignmentId={params.assignmentId}
              />
              <AssignmentDescriptionForm
                initialData={assignment}
                courseId={params.courseId}
                assignmentId={params.assignmentId}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Eye} />
                <h2 className="text-xl">
                  Access Settings
                </h2>
              </div>
              <AssignmentAccessForm
              initialData={assignment}
              courseId={params.courseId}
              assignmentId={params.assignmentId}
            />
            </div>
          </div>
          <div>


          </div>
        </div>
      </div>
    </>
   );
}
 
export default AssignmentIdPage;