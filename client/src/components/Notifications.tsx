// import React, { useEffect, useState } from "react";

// interface TaskAssignedData {
//   taskId: number;
//   title: string;
//   message: string;
// }

// interface Task {
//   id: number;
//   title: string;
//   description: string;
//   priority: string;
//   status: string;
//   assigned_to: number | null;
//   due_date: string | null;
//   created_at: string;
//   updated_at: string;
// }

// const Notifications: React.FC = () => {
//   const [notifications, setNotifications] = useState<TaskAssignedData[]>([]);

//   useEffect(() => {
//     const loadAssignedTasks = async () => {
//       const teamId = localStorage.getItem("selectedTeamId");
//       if (!teamId) {
//         console.error("No team ID found in localStorage");
//         return;
//       }

//       const rawToken = localStorage.getItem("token");
//       const token = rawToken?.replace(/^"|"$/g, ""); // Убираем кавычки

//       try {
//         const response = await fetch(
//           `http://localhost:5000/tasks/${teamId}/assigned`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (response.ok) {
//           const data = await response.json();
//           const tasks: Task[] = data.tasks;

//           setNotifications((prev) => [
//             ...prev,
//             ...tasks.map((task) => ({
//               taskId: task.id,
//               title: task.title,
//               message: "You were assigned this task.",
//             })),
//           ]);
//         } else {
//           console.error("Failed to fetch assigned tasks");
//         }
//       } catch (err) {
//         console.error("Error fetching assigned tasks:", err);
//       }
//     };

//     loadAssignedTasks();

//     // Подключение WebSocket
//     const userJson = localStorage.getItem("user");
//     const user = userJson ? JSON.parse(userJson) : null;
//     const userId = user?.id;

//     if (userId) {
//       const socket = new WebSocket(`ws://localhost:5000/ws?userId=${userId}`);

//       socket.onmessage = (event) => {
//         const data: TaskAssignedData = JSON.parse(event.data);
//         setNotifications((prev) => [...prev, data]);
//       };

//       socket.onclose = () => {
//         console.log("WebSocket connection closed");
//       };

//       socket.onerror = (error) => {
//         console.error("WebSocket error:", error);
//       };

//       return () => {
//         socket.close();
//       };
//     }
//   }, []);

//   return (
//     <div>
//       <h2>Notifications</h2>
//       {notifications.length === 0 ? (
//         <p>No new notifications.</p>
//       ) : (
//         <ul>
//           {notifications.map((notif) => (
//             <li key={notif.taskId}>
//               <strong>{notif.title}</strong>: {notif.message}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default Notifications;

import React, { useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

// Define the type for the notifications
interface TaskAssignedData {
  taskId: number;
  title: string;
  message: string;
}

const Notifications: React.FC = () => {
  

    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : null; // Проверяем, что значение не null
    const userId = user && user.id ? String(user.id) : ""; // Преобразуем idяем, что user существует и есть id
    
  const [notifications, setNotifications] = useState<TaskAssignedData[]>([]);

  // Use the WebSocket hook
  useWebSocket(userId, (newTask) => {
    setNotifications((prev) => [...prev, newTask]);
    alert(`New Task Assigned: ${newTask.title}`);
  });

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((task, index) => (
          <li key={index}>
            {task.title} - {task.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
