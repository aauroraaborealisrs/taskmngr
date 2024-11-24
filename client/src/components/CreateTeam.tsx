import React, { useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
}

interface TeamMember {
  id: number;
  username: string;
}

const CreateTeam: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const rawToken = localStorage.getItem("token");
      const token = rawToken?.replace(/^"|"$/g, "");
      try {
        const response = await fetch("http://localhost:5000/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  );

  // Добавление пользователя в выбранных участников
  const addUser = (user: User) => {
    if (!selectedUsers.some((member) => member.id === user.id)) {
      setSelectedUsers([
        ...selectedUsers,
        { id: user.id, username: user.username },
      ]);
    }
  };

  // Удаление пользователя из выбранных участников
  const removeUser = (id: number) => {
    setSelectedUsers(selectedUsers.filter((member) => member.id !== id));
  };

  // Создание команды
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const rawToken = localStorage.getItem("token");
    const token = rawToken?.replace(/^"|"$/g, "");

    try {
      const response = await fetch("http://localhost:5000/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: teamName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      const data = await response.json();

      // Добавление участников в созданную команду
      for (const member of selectedUsers) {
        await fetch(`http://localhost:5000/team/${data.team.id}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ addUserId: member.id, role: "member" }),
        });
      }

      alert("Team created successfully!");
      setTeamName("");
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error creating team:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-team-container">
      <h1>Create a New Team</h1>
      <form onSubmit={handleCreateTeam}>
        <div>
          <label>Team Name</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Search Users</label>
          <input
            type="text"
            placeholder="Search by username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="user-list">
          <h2>Available Users</h2>
          <ul>
            {filteredUsers.map((user) => (
              <li key={user.id}>
                {user.username} ({user.email})
                <button type="button" onClick={() => addUser(user)}>
                  Add
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="selected-users">
          <h2>Selected Members</h2>
          <ul>
            {selectedUsers.map((member) => (
              <li key={member.id}>
                {member.username}
                <button type="button" onClick={() => removeUser(member.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Team"}
        </button>
      </form>
    </div>
  );
};

export default CreateTeam;
