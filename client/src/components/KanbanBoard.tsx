import React from "react";
import "../styles/KanbanBoard.css";

export interface KanbanTask {
  id: number;
  title: string;
  status: string;
  description: string;
}

interface KanbanBoardProps {
  tasks: KanbanTask[];
  onTaskClick: (task: KanbanTask) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskClick }) => {
  // Группируем задачи по статусу
  const tasksByStatus = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in progress": tasks.filter((task) => task.status === "in progress"),
    completed: tasks.filter((task) => task.status === "completed"),
  };

  return (
    <div className="kanban-board">
      {(["todo", "in progress", "completed"] as const).map((status) => (
        <div key={status} className="kanban-column">
          <h2>{status.replace("_", " ").toUpperCase()}</h2>
          <div className="kanban-tasks">
            {tasksByStatus[status].map((task) => (
              <div
                key={task.id}
                className={`kanban-task ${status}`}
                onClick={() => onTaskClick(task)}
              >
                {task.title}
                {task.description}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
