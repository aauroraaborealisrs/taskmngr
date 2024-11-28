import React from "react";
import "../styles/KanbanBoard.css";

export interface KanbanTask {
  id: number;
  title: string;
  status: string;
}

interface KanbanBoardProps {
  tasks: KanbanTask[];
  onTaskClick: (task: KanbanTask) => void;
  onTaskStatusChange: (taskId: number, newStatus: string) => void; // Callback для изменения статуса задачи
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskClick,
  onTaskStatusChange,
}) => {
  const tasksByStatus = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in progress": tasks.filter((task) => task.status === "in progress"),
    completed: tasks.filter((task) => task.status === "completed"),
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, task: KanbanTask) => {
    event.dataTransfer.setData("taskId", task.id.toString());
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, newStatus: string) => {
    event.preventDefault();
    const taskId = parseInt(event.dataTransfer.getData("taskId"));
    onTaskStatusChange(taskId, newStatus);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Разрешить сброс элемента
  };

  return (
    <div className="kanban-board">
      {(["todo", "in progress", "completed"] as const).map((status) => (
        <div
          key={status}
          className="kanban-column"
          onDrop={(e) => handleDrop(e, status)} // Обработка события сброса
          onDragOver={handleDragOver} // Обработка события перетаскивания
        >
          <h2>{status.replace("_", " ").toUpperCase()}</h2>
          <div className="kanban-tasks">
            {tasksByStatus[status].map((task) => (
              <div
                key={task.id}
                className={`kanban-task ${status}`}
                draggable // Делаем задачу перетаскиваемой
                onDragStart={(e) => handleDragStart(e, task)} // Обработка начала перетаскивания
                onClick={() => onTaskClick(task)}
              >
                {task.title} <span className="task-status">({task.status})</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
