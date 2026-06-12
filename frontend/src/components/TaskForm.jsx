import { useEffect, useState } from "react";
import API from "../api/api";

function TaskForm({ onTaskCreated }) {
  const [users, setUsers] = useState([]);

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [dueDate, setDueDate] = useState("");

  const [assigneeId, setAssigneeId] = useState("");

  const [assignerId, setAssignerId] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await API.get("/users");

      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title ||
      !description ||
      !dueDate ||
      !assigneeId ||
      !assignerId
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await API.post("/tasks", {
        title,
        description,
        due_date: dueDate,
        assignee_id: Number(assigneeId),
        assigner_id: Number(assignerId),
      });

      setTitle("");
      setDescription("");
      setDueDate("");
      setAssigneeId("");
      setAssignerId("");

      setError("");

      onTaskCreated();
    } catch (error) {
      setError("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow mb-6"
    >
      <h2 className="text-xl font-bold mb-4">
        Create Task
      </h2>

      {error && (
        <p className="text-red-500 mb-3">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-3">

        <input
          type="text"
          placeholder="Title"
          className="border p-2 rounded"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={dueDate}
          onChange={(e) =>
            setDueDate(e.target.value)
          }
        />

        <textarea
          placeholder="Description"
          className="border p-2 rounded md:col-span-2"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <select
          className="border p-2 rounded"
          value={assigneeId}
          onChange={(e) =>
            setAssigneeId(e.target.value)
          }
        >
          <option value="">
            Select Assignee
          </option>

          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}
            >
              {user.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={assignerId}
          onChange={(e) =>
            setAssignerId(e.target.value)
          }
        >
          <option value="">
            Select Assigner
          </option>

          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}
            >
              {user.name}
            </option>
          ))}
        </select>

      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading
          ? "Creating..."
          : "Create Task"}
      </button>
    </form>
  );
}

export default TaskForm;