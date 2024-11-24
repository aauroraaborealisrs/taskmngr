import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h1>TaskManager</h1>
      </div>
      <ul className="sidebar-links">
        <li>
          <Link to="/tasks">Tasks</Link>
        </li>
        <li>
          <Link to="/team">Team</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/reports">Reports</Link>
        </li>
        <li>
          <Link to="/notifications">Notifications</Link>
        </li>
        <li>
          <Link to="/me">Me</Link>
        </li>
      </ul>
      <div className="sidebar-actions">
        <button className="sidebar-logout">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
