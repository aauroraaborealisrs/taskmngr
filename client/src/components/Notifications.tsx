import React, { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

interface TaskAssignedData {
  taskId: number;
  title: string;
  message: string;
  source: "fetch" | "websocket";
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<TaskAssignedData[]>([]);

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const userId = user && user.id ? String(user.id) : "";
  const teamId = localStorage.getItem("selectedTeamId");

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const loadAssignedTasks = async () => {
      if (!teamId) {
        console.error("No team ID found in localStorage");
        return;
      }

      const rawToken = localStorage.getItem("token");
      const token = rawToken?.replace(/^"|"$/g, "");

      try {
        const response = await fetch(
          `http://localhost:5000/tasks/${teamId}/assigned`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const tasks: Task[] = data.tasks;

          setNotifications((prev: TaskAssignedData[]) => [
            ...prev,
            ...tasks.map(
              (task): TaskAssignedData => ({
                taskId: task.id,
                title: task.title,
                message: "You were assigned this task.",
                source: "fetch",
              })
            ),
          ]);
        } else {
          console.error("Failed to fetch assigned tasks");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Error fetching assigned tasks:", err);
        }
      }
    };

    loadAssignedTasks();

    return () => {
      controller.abort();
    };
  }, [teamId]);

  useWebSocket(userId, (newTask) => {
    setNotifications((prev: TaskAssignedData[]) => [
      ...prev,
      { ...newTask, source: "websocket" },
    ]);
  });

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul>
          {notifications.map((notif) => (
            <li
              key={notif.taskId}
              style={{
                color: notif.source === "websocket" ? "red" : "black",
              }}
            >
              <strong>{notif.title}</strong>: {notif.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
