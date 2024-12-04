import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "../styles/CreateTaskModal.css";

interface EditTaskModalProps {
  teamId: string;
  taskId: number;
  onClose: () => void;
  onTaskUpdated: () => void; 
  taskData: {
    title: string;
    description: string;
    priority: string;
    status: string;
    assigned_to: number | null;
    due_date: string | null;
  };
}

interface TeamMember {
  id: number;
  username: string;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  teamId,
  taskId,
  onClose,
  onTaskUpdated,
  taskData,
}) => {
  const [updatedTask, setUpdatedTask] = useState(taskData); 
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isEditMode, setIsEditMode] = useState(false); 

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const rawToken = localStorage.getItem("token");
      const token = rawToken?.replace(/^"|"$/g, "");

      try {
        const response = await fetch(`http://localhost:5000/team/${teamId}/members`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const members = data.members.map((member: any) => ({
            id: member.id,
            username: member.username,
          }));
          setTeamMembers(members);
        } else {
          throw new Error("Failed to fetch team members");
        }
      } catch (err) {
        console.error("Error fetching team members:", err);
      }
    };

    fetchTeamMembers();
  }, [teamId]);

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedTask({ ...updatedTask, [name]: value });
  };

  const saveTask = async () => {
    const rawToken = localStorage.getItem("token");
    const token = rawToken?.replace(/^"|"$/g, ""); 

    try {
      const response = await fetch(`http://localhost:5000/tasks/${teamId}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...updatedTask,
          assigned_to: updatedTask.assigned_to || null, 
        }),
      });

      if (response.ok) {
        onTaskUpdated(); 
        onClose(); 
      } else {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isEditMode ? "Редактирование задачи" : ""}</h2>
        {isEditMode ? (
          <>
            {/* Режим редактирования */}
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={updatedTask.title}
              onChange={handleTaskChange}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={updatedTask.description || ""}
              onChange={handleTaskChange}
            ></textarea>
            <select name="priority" value={updatedTask.priority} onChange={handleTaskChange}>
              <option value="low">Низкий</option>
              <option value="normal">Нормальный</option>
              <option value="high">Высокий</option>
            </select>
            <select name="status" value={updatedTask.status} onChange={handleTaskChange}>
              <option value="todo">Выполнить</option>
              <option value="in progress">В процессе</option>
              <option value="completed">Выполнено</option>
            </select>
            <select
              name="assigned_to"
              value={updatedTask.assigned_to || ""}
              onChange={handleTaskChange}
            >
              <option value="">Никому не назначено</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="due_date"
              value={updatedTask.due_date || ""}
              onChange={handleTaskChange}
            />
            <button onClick={saveTask}>Сохранить</button>
            <button onClick={() => setIsEditMode(false)}>Отменить редактирование</button>
          </>
        ) : (
          <>
            {/* Режим просмотра */}
            <p>
              <strong>Название:</strong> {updatedTask.title}
            </p>
            <p>
              <strong>Описание:</strong>
              {updatedTask.description ? (
                <div>
                  <ReactMarkdown>{updatedTask.description}</ReactMarkdown>
                </div>
              ) : (
                " нет описания"
              )}
            </p>
            <p>
              <strong>Приоритет:</strong> {updatedTask.priority}
            </p>
            <p>
              <strong>Статус:</strong> {updatedTask.status}
            </p>
            <p>
              <strong>Назначено:</strong>{" "}
              {updatedTask.assigned_to
                ? teamMembers.find((member) => member.id === updatedTask.assigned_to)?.username ||
                  "Unknown"
                : "Никому не назначено"}
            </p>
            <p>
              <strong>Сделать до:</strong> {updatedTask.due_date || "Не указано"}
            </p>
            <button onClick={() => setIsEditMode(true)}>Редактировать</button>
          </>
        )}
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default EditTaskModal;
