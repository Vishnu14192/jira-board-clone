import TaskCard from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";

function Column({
  title,
  tasks,
  users,
  onAssigneeChange,
}) {
  const { setNodeRef } = useDroppable({
    id: title,
  });
  return (
    <div ref={setNodeRef} className="bg-slate-100 rounded-lg p-4 min-h-[500px]">

      <div className="flex justify-between items-center mb-4">

        <h2 className="font-bold text-gray-700">
          {title}
        </h2>

        <span className="bg-gray-300 px-2 py-1 rounded-full text-xs">
          {tasks.length}
        </span>

      </div>

      <div className="space-y-3">

        {tasks.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-10">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              users={users}
              onAssigneeChange={
                onAssigneeChange
              }
            />
          ))
        )}

      </div>

    </div>
  );
}

export default Column;