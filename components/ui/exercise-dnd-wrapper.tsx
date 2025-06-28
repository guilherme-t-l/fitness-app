import React from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"

interface ExerciseDndWrapperProps {
  items: { id: string; name: string }[]
  onReorder: (newOrder: string[]) => void
  children: (renderProps: { id: string; name: string; attributes: any; listeners: any; ref: any; isDragging: boolean }) => React.ReactNode
}

export function ExerciseDndWrapper({ items, onReorder, children }: ExerciseDndWrapperProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      const newOrder = arrayMove(items, oldIndex, newIndex).map((item) => item.id)
      onReorder(newOrder)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableExerciseItem key={item.id} id={item.id} name={item.name}>
            {children}
          </SortableExerciseItem>
        ))}
      </SortableContext>
    </DndContext>
  )
}

function SortableExerciseItem({ id, name, children }: { id: string; name: string; children: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ id, name, attributes, listeners, ref: setNodeRef, isDragging })}
    </div>
  )
} 