import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Tasks.css";
import TaskModal from "./TaskModal";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  creator: { name: string; avatar: string };
  assigned_to: { name: string; avatar: string } | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Task>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const fetchTasks = async (
    teamId: string,
    sortField: keyof Task,
    sortOrder: "asc" | "desc"
  ) => {
    const rawToken = localStorage.getItem("token");
    const token = rawToken?.replace(/^"|"$/g, "");

    try {
      const response = await fetch(
        `http://localhost:5000/tasks?teamId=${teamId}&sortField=${sortField}&sortOrder=${sortOrder}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        const mappedTasks = data.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          creator: {
            name: `${task.creator_first_name} ${task.creator_last_name}`,
            avatar: task.creator_avatar_url,
          },
          assigned_to: task.assigned_to_name
            ? {
                name: `${task.assigned_to_name} ${task.assigned_to_last_name}`,
                avatar: task.assigned_to_avatar,
              }
            : null,
          due_date: task.due_date,
          created_at: task.created_at,
          updated_at: task.updated_at,
        }));
        setTasks(mappedTasks);
        console.log(mappedTasks);
      } else {
        throw new Error("Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const updateTasks = () => {
    if (teamId) {
      fetchTasks(teamId, sortField, sortOrder);
    }
  };

  useEffect(() => {
    const selectedTeamId = localStorage.getItem("selectedTeamId");

    if (!teamId && selectedTeamId) {
      navigate(`/tasks/${selectedTeamId}`);
    } else if (teamId) {
      fetchTasks(teamId, sortField, sortOrder);
    }
  }, [teamId, sortField, sortOrder, navigate]);

  const sortTasks = (field: keyof Task) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const addTaskToList = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
  };

  return (
    <div className="tasks-container">
      <h1>Tasks for Team: {teamId}</h1>
      {tasks.length === 0 ? (
        <p>No tasks available for this team.</p>
      ) : (
        <table className="tasks-table">
          <thead>
            <tr>
              <th onClick={() => sortTasks("title")}>
                Title{" "}
                {sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>Description</th>
              <th onClick={() => sortTasks("priority")}>
                Priority{" "}
                {sortField === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => sortTasks("status")}>
                Status{" "}
                {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>Creator</th>
              <th>Assigned To</th>
              <th onClick={() => sortTasks("due_date")}>
                Due Date{" "}
                {sortField === "due_date" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.priority}</td>
                <td>{task.status}</td>
                <td>
                  <div className="creator-info">
                    <img
                      src={task.creator.avatar}
                      alt={task.creator.name}
                      className="creator-avatar"
                    />
                    <span>{task.creator.name}</span>
                  </div>
                </td>
                <td>
                  {task.assigned_to ? (
                    <div className="creator-infoo">
                      <img
                        src={task.assigned_to.avatar || "/default-avatar.png"}
                        alt={task.assigned_to.name}
                        className="creator-avatar"
                      />
                      <span>{task.assigned_to.name}</span>
                    </div>
                  ) : (
                    "Unassigned"
                  )}
                </td>
                <td>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : "No deadline"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="create-task-button" onClick={() => setShowModal(true)}>
        +
      </button>
      {showModal && (
        <TaskModal
          teamId={teamId!}
          onClose={() => setShowModal(false)}
          onTaskUpdated={updateTasks}
        />
      )}
    </div>
  );
};

export default Tasks;
