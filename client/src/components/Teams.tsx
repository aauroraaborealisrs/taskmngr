import React, { useState, useEffect } from "react";
import CreateTeam from "./CreateTeam";

interface Team {
  team_id: number;
  team_name: string;
  user_role: string;
}

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      const rawToken = localStorage.getItem("token");
      const token = rawToken?.replace(/^"|"$/g, ""); // Sanitize token

      try {
        const response = await fetch("http://localhost:5000/team", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched teams:", data.teams);
          setTeams(data.teams); // Update state with teams
        } else {
          throw new Error("Failed to fetch teams");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load teams. Please try again.");
      }
    };

    fetchTeams();
  }, []);

  // Handle creating a new team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: teamName, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create team");
      }

      const newTeam = await response.json();
      console.log("New team created:", newTeam);
      setTeams((prevTeams) => [...prevTeams, newTeam.team]); // Update teams state
      setTeamName("");
      setDescription("");
      alert("Team created successfully!");
    } catch (err) {
      console.error("Create error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  console.log(JSON.stringify(teams, null, 2));

  return (
    <div className="teams-container">
      <h1 className="teams-title">Teams</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="your-teams">
        <h2>Your Teams</h2>
        {teams.length === 0 ? (
          <p>You are not a member of any teams yet.</p>
        ) : (
          <ul className="teams-list">
            {teams.map((team) => (
              <li key={team.team_id} className="team-item">
                <div className="team-details">
                  <span className="team-name">{team.team_name}</span>
                  <span className="team-role">Role: {team.user_role}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2>Create a New Team</h2>
      <CreateTeam />
    </div>
  );
};

export default Teams;
