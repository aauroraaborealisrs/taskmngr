import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Me from "./components/Me";
import Teams from "./components/Teams";
import Tasks from "./components/Tasks";
import Navbar from "./components/Navbar";
import PomodoroTimer from "./components/PomodoroTimer";

import "./App.css";


const Layout: React.FC = () => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        {/* Здесь будут рендериться вложенные маршруты */}
        <Outlet />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Роут для страниц с Navbar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="me" element={<Me />} />
          <Route path="pomodoro" element={<PomodoroTimer />} />
          <Route path="teams" element={<Teams />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="/tasks/:teamId" element={<Tasks />} />
        </Route>

        {/* Роуты без Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
