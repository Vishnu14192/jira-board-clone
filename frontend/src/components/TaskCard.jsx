import { useDraggable } from "@dnd-kit/core";

function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(
          ${transform.x}px,
          ${transform.y}px,
          0
        )`,
      }
    : undefined;

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="bg-white border rounded-lg shadow-sm p-4 cursor-grab"
    >

      <h3 className="font-semibold text-gray-800 mb-2">
        {task.title}
      </h3>

      <p className="text-sm text-gray-600 mb-3">
        {task.description}
      </p>

      <div className="text-sm space-y-1">

        <p>
          📅 <strong>Due:</strong> {task.due_date}
        </p>

        <p>
          👤 <strong>Assignee:</strong>{" "}
          {task.assignee?.name}
        </p>

        <p>
          📝 <strong>Assigner:</strong>{" "}
          {task.assigner?.name}
        </p>

      </div>

      <div className="mt-3 text-right text-xs text-gray-500">
        TASK-{task.id}
      </div>

    </div>
  );
}

export default TaskCard;