import { useEffect, useState } from "react";
import API from "../api/api";
import Column from "./Column";
import TaskForm from "./TaskForm";

import { DndContext } from "@dnd-kit/core";

function Board() {
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await API.get("/tasks");

      setTasks(response.data);

      setError("");
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (
    taskId,
    status
  ) => {
    await API.patch(
      `/tasks/${taskId}/status`,
      {
        status,
      }
    );
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  );

  const progressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  );

  const doneTasks = tasks.filter(
    (task) => task.status === "done"
  );

  const statusMap = {
      "TO DO": "todo",
      "IN PROGRESS": "in_progress",
      "DONE": "done",
    };

    const handleDragEnd = async (event) => {
      const { active, over } = event;

      if (!over) return;

      const taskId = active.id;

      const newStatus =
        statusMap[over.id];

      if (!newStatus) return;

      const previousTasks = [...tasks];

      try {

        // Optimistic Update
        setTasks(
          tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: newStatus,
                }
              : task
          )
        );

        // Persist to backend
        await updateTaskStatus(
          taskId,
          newStatus
        );

      } catch (error) {

        // Rollback
        setTasks(previousTasks);

        alert(
          "Failed to update task status"
        );
      }
    };

  // const handleDragEnd = (event) => {

  //   const { active, over } = event;
    
  //   if (!over) return;

  //   const newStatus = statusMap[over.id];

  //   console.log(
  //     "Task:",
  //     active.id
  //   );

  //   console.log(
  //     "Dropped On:",
  //     over.id
  //   );
  //   console.log(newStatus);
  // };

  return (
    <>
        <TaskForm onTaskCreated={fetchTasks} />

        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

            <Column
                title="TO DO"
                tasks={todoTasks}
            />

            <Column
                title="IN PROGRESS"
                tasks={progressTasks}
            />

            <Column
                title="DONE"
                tasks={doneTasks}
            />

          </div>
        </DndContext>
    </>
    );
}

export default Board;