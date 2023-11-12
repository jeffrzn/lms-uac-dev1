import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; assignmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      }
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assignment = await db.assignment.findUnique({
      where: {
        id: params.assignmentId,
        courseId: params.courseId,
      }
    });

    if (!assignment) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const deletedassignment = await db.assignment.delete({
      where: {
        id: params.assignmentId
      }
    });

    const publishedassignmentsInCourse = await db.assignment.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true,
      }
    });

    if (!publishedassignmentsInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        }
      });
    }

    return NextResponse.json(deletedassignment);
  } catch (error) {
    console.log("[assignment_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; assignmentId: string } }
) {
  try {
    const { userId } = auth();
    const { isPublished, ...values } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId
      }
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assignment = await db.assignment.update({
      where: {
        id: params.assignmentId,
        courseId: params.courseId,
      },
      data: {
        ...values,
      }
    });


    return NextResponse.json(assignment);
  } catch (error) {
    console.log("[COURSES_ASSIGNMENT_ID]", error);
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}