// import React, { useState, useEffect } from "react";
// import "../styles/Tasks.css";

// interface Task {
//   id: number;
//   title: string;
//   description: string;
//   priority: string;
//   status: string;
//   assigned_to: string | null;
//   due_date: string | null;
// }

// const Tasks: React.FC = () => {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchTasks = async () => {
//     const rawToken = localStorage.getItem("token");
//     const token = rawToken?.replace(/^"|"$/g, ""); // Убираем кавычки из токена

//     try {
//       const response = await fetch("http://localhost:5000/tasks/2/tasks", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setTasks(data.tasks);
//       } else {
//         throw new Error("Failed to fetch tasks");
//       }
//     } catch (err) {
//       setError("Failed to load tasks. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   if (loading) return <p>Loading tasks...</p>;
//   if (error) return <p className="error-message">{error}</p>;

//   return (
//     <div className="tasks-container">
//       <h1 className="tasks-title">Tasks</h1>
//       {tasks.length === 0 ? (
//         <p>No tasks available for this team.</p>
//       ) : (
//         <ul className="tasks-list">
//           {tasks.map((task) => (
//             <li key={task.id} className="task-item">
//               <h3>{task.title}</h3>
//               <p>{task.description}</p>
//               <p>Priority: {task.priority}</p>
//               <p>Status: {task.status}</p>
//               {task.assigned_to && <p>Assigned to: {task.assigned_to}</p>}
//               {task.due_date && <p>Due Date: {new Date(task.due_date).toLocaleDateString()}</p>}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default Tasks;



import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Tasks.css";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  // Function to fetch tasks
  const fetchTasks = async (teamId: string) => {
    const rawToken = localStorage.getItem("token");
    const token = rawToken?.replace(/^"|"$/g, ""); // Remove quotes from the token

    try {
      const response = await fetch(`http://localhost:5000/tasks/${teamId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else {
        throw new Error("Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Effect to handle redirection based on localStorage
  useEffect(() => {
    const selectedTeamId = localStorage.getItem("selectedTeamId");

    // Redirect to the correct team route if not already there
    if (!teamId && selectedTeamId) {
      navigate(`/tasks/${selectedTeamId}`);
    } else if (teamId) {
      fetchTasks(teamId);
    }
  }, [teamId, navigate]);

  return (
    <div className="tasks-container">
      <h1>Tasks for Team: {teamId}</h1>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <p>Priority: {task.priority}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
