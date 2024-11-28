import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Tasks.css";
import EditTaskModal from "./EditTaskModal";
import CalendarView from "./CalendarView";
import CreateTaskModal from "./CreateTaskModal";
import KanbanBoard from "./KanbanBoard"; 

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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortField, setSortField] = useState<keyof Task>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "kanban">(
    "table"
  ); // Добавляем Kanban в переключение вида
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

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    const rawToken = localStorage.getItem("token");
    const token = rawToken?.replace(/^"|"$/g, "");

    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PATCH", // Используем метод PATCH для обновления
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: updatedTask.status } : task
          )
        );
      } else {
        console.error("Failed to update task status");
      }
    } catch (err) {
      console.error("Error updating task status:", err);
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

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeEditModal = () => {
    setSelectedTask(null);
    setShowModal(false);
  };

  return (
    <div className="tasks-container">
      <h1>Tasks for Team: {teamId}</h1>
      <div className="view-switch">
        <button onClick={() => setViewMode("table")}>Table View</button>
        <button onClick={() => setViewMode("calendar")}>Calendar View</button>
        <button onClick={() => setViewMode("kanban")}>Kanban View</button>
      </div>
      {viewMode === "table" ? (
        <>
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
                    {sortField === "priority" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => sortTasks("status")}>
                    Status{" "}
                    {sortField === "status" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Creator</th>
                  <th>Assigned To</th>
                  <th onClick={() => sortTasks("due_date")}>
                    Due Date{" "}
                    {sortField === "due_date" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} onClick={() => openEditModal(task)}>
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
                        <div className="creator-info">
                          <img
                            src={
                              task.assigned_to.avatar || "/default-avatar.png"
                            }
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
          <button
            className="create-task-button"
            onClick={() => setShowModal(true)}
          >
            +
          </button>
        </>
      ) : viewMode === "calendar" ? (
        <>
          <CalendarView
            tasks={tasks.map((task) => ({
              id: task.id,
              title: task.title,
              status: task.status,
              due_date: task.due_date,
            }))}
            onTaskClick={(task) => {
              const fullTask = tasks.find((t) => t.id === task.id);
              if (fullTask) {
                openEditModal(fullTask);
              }
            }}
          />
          <button
            className="create-task-button"
            onClick={() => setShowModal(true)}
          >
            +
          </button>
        </>
      ) : (
        <>
          <KanbanBoard
            tasks={tasks}
            onTaskClick={(task) => {
              const fullTask = tasks.find((t) => t.id === task.id);
              if (fullTask) {
                openEditModal(fullTask);
              }
            }}
            onTaskStatusChange={updateTaskStatus}
          />
          <button
            className="create-task-button"
            onClick={() => setShowModal(true)}
          >
            +
          </button>
        </>
      )}
      {showModal && (
        <CreateTaskModal
          teamId={teamId!}
          onClose={() => setShowModal(false)}
          onTaskUpdated={updateTasks}
        />
      )}
      {showModal && selectedTask && (
        <EditTaskModal
          teamId={teamId!}
          taskId={selectedTask.id}
          taskData={{
            title: selectedTask.title,
            description: selectedTask.description,
            priority: selectedTask.priority,
            status: selectedTask.status,
            assigned_to: selectedTask.assigned_to
              ? parseInt(selectedTask.assigned_to.name.split(" ")[0])
              : null,
            due_date: selectedTask.due_date,
          }}
          onClose={closeEditModal}
          onTaskUpdated={updateTasks}
        />
      )}
    </div>
  );
};

export default Tasks;
