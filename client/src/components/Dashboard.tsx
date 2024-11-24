import React from 'react';
import Navbar from './Navbar';
import '../styles/Dashboard.css';

const DashBoard: React.FC = () => {
  return (
    <div className='flex-row'>
      <Navbar />
      <div className="dashboard-content">
        <h2>Welcome to your Dashboard</h2>
        {/* Основной контент дашборда */}
      </div>
    </div>
  );
};

export default DashBoard;
