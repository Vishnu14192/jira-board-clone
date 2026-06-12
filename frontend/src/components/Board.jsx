import { useEffect, useState } from "react";
import API from "../api/api";
import Column from "./Column";
import TaskForm from "./TaskForm";

import { DndContext } from "@dnd-kit/core";

function Board() {
  const [tasks, setTasks] = useState([]);

  const [users, setUsers] = useState([]);

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

  const fetchUsers = async () => {
    try {
      const response = await API.get("/users");

      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users", err);
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
    fetchUsers();
  }, []);

  const updateTaskAssignee = async (
    taskId,
    assigneeId
  ) => {
    const response = await API.put(
      `/tasks/${taskId}`,
      {
        assignee_id: assigneeId,
      }
    );

    return response.data;
  };

  const handleAssigneeChange = async (
    taskId,
    assigneeId
  ) => {
    const taskToUpdate = tasks.find(
      (task) => task.id === taskId
    );

    if (
      taskToUpdate &&
      assigneeId === taskToUpdate.assigner?.id
    ) {
      alert(
        "Assignee and assigner cannot be the same person"
      );
      return;
    }

    const previousTasks = [...tasks];

    try {
      const selectedUser = users.find(
        (user) => user.id === assigneeId
      );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                assignee_id: assigneeId,
                assignee: selectedUser
                  ? {
                      id: selectedUser.id,
                      name: selectedUser.name,
                    }
                  : task.assignee,
              }
            : task
        )
      );

      const updatedTask =
        await updateTaskAssignee(
          taskId,
          assigneeId
        );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? updatedTask
            : task
        )
      );
    } catch (error) {
      setTasks(previousTasks);

      alert("Failed to update assignee");
    }
  };

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
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
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
                users={users}
                onAssigneeChange={
                  handleAssigneeChange
                }
            />

            <Column
                title="IN PROGRESS"
                tasks={progressTasks}
                users={users}
                onAssigneeChange={
                  handleAssigneeChange
                }
            />

            <Column
                title="DONE"
                tasks={doneTasks}
                users={users}
                onAssigneeChange={
                  handleAssigneeChange
                }
            />

          </div>
        </DndContext>
    </>
    );
}

export default Board;