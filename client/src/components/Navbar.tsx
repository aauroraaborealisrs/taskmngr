import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

interface Team {
  team_id: number;
  team_name: string;
}

const Navbar: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>(
    localStorage.getItem("selectedTeamId") || "" // Изначально берем из localStorage
  );
  const navigate = useNavigate();

  // Fetch списка команд при загрузке Navbar
  useEffect(() => {
    const fetchTeams = async () => {
      const rawToken = localStorage.getItem("token");
      const token = rawToken?.replace(/^"|"$/g, ""); // Убираем кавычки

      try {
        const response = await fetch("http://localhost:5000/team", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTeams(data.teams || []); // Добавляем команды в состояние

          // Если в localStorage нет выбранной команды, устанавливаем первую
          if (!selectedTeam && data.teams.length > 0) {
            const defaultTeamId = data.teams[0].team_id.toString();
            setSelectedTeam(defaultTeamId);
            localStorage.setItem("selectedTeamId", defaultTeamId); // Сохраняем в localStorage
            navigate(`/tasks/${defaultTeamId}`);
          }
        } else {
          throw new Error("Failed to fetch teams");
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };

    fetchTeams();
  }, [selectedTeam, navigate]);

  // Обработчик выбора команды
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);
    localStorage.setItem("selectedTeamId", teamId); // Сохраняем в localStorage
    navigate(`/tasks/${teamId}`); // Редирект на задачи выбранной команды
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h1>TaskManager</h1>
      </div>

      {/* Выбор команды */}
      <div className="sidebar-team-select">
        <label htmlFor="team-select">Select Team:</label>
        <select
          id="team-select"
          value={selectedTeam}
          onChange={handleTeamChange}
          className="team-select"
        >
          {teams.map((team) => (
            <option key={team.team_id} value={team.team_id}>
              {team.team_name}
            </option>
          ))}
        </select>
      </div>

      <ul className="sidebar-links">
        <li>
          <Link to="/tasks">Tasks</Link>
        </li>
        <li>
          <Link to="/teams">Teams</Link>
        </li>
        <li>
          <Link to="/notifications">Notifications</Link>
        </li>
        <li>
          <Link to="/me">Me</Link>
        </li>
        <li>
          <Link to="/pomodoro">PomodoroTimer</Link>
        </li>
      </ul>

      <div className="sidebar-actions">
        <button className="sidebar-logout">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
