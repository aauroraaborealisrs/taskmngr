import React, { useState } from "react";

interface TaskModalProps {
  teamId: string;
  onClose: () => void;
  onTaskAdded: (task: any) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ teamId, onClose, onTaskAdded }) => {
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "normal", due_date: "" });

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const createTask = async () => {
    const rawToken = localStorage.getItem("token");
    const token = rawToken?.replace(/^"|"$/g, "");

    try {
      const response = await fetch(`http://localhost:5000/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newTask, team_id: teamId }),
      });

      if (response.ok) {
        const data = await response.json();
        onTaskAdded(data.task); // Передаем новую задачу в родительский компонент
        onClose(); // Закрываем модалку
      } else {
        throw new Error("Failed to create task");
      }
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create New Task</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newTask.title}
          onChange={handleNewTaskChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={newTask.description}
          onChange={handleNewTaskChange}
        ></textarea>
        <select name="priority" value={newTask.priority} onChange={handleNewTaskChange}>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          name="due_date"
          value={newTask.due_date}
          onChange={handleNewTaskChange}
        />
        <button onClick={createTask}>Create</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default TaskModal;
