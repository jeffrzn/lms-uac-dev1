"use client";

import { Assignment, Chapter } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Grip, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AssignmentListProps {
  items: Assignment[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
};

export const AssignmentList = ({
  items,
  onReorder,
  onEdit
}: AssignmentListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [assignment, setAssignment] = useState(items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setAssignment(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(assignment);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedAssignment = items.slice(startIndex, endIndex + 1);

    setAssignment(items);

    const bulkUpdateData = updatedAssignment.map((assignment) => ({
      id: assignment.id,
      position: items.findIndex((item) => item.id === assignment.id)
    }));

    onReorder(bulkUpdateData);
  }

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="assignment">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {assignment.map((assignment, index) => (
              <Draggable 
                key={assignment.id} 
                draggableId={assignment.id} 
                index={index}
              >
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                      assignment.isPublished && "bg-yellow-100 border-yellow-200 text-yellow-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        assignment.isPublished && "border-r-yellow-200 hover:bg-yellow-200"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip
                        className="h-5 w-5"
                      />
                    </div>
                    {assignment.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      {assignment.isFree && (
                        <Badge>
                          Unlocked
                        </Badge>
                      )}
                      <Badge
                        className={cn(
                          "bg-slate-500",
                          assignment.isPublished && "bg-yellow-500"
                        )}
                      >
                        {assignment.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(assignment.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}