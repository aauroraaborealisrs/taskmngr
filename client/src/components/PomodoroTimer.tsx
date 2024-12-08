import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const PomodoroTimer: React.FC = () => {
  const [workInterval, setWorkInterval] = useState(25);
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem("timeLeft");
    return savedTime ? parseInt(savedTime, 10) : 25 * 60;
  });
  const [isRunning, setIsRunning] = useState(() => {
    const savedRunning = localStorage.getItem("isRunning");
    return savedRunning === "true";
  });
  const [startTime, setStartTime] = useState<number | null>(() => {
    const savedStartTime = localStorage.getItem("startTime");
    return savedStartTime ? parseInt(savedStartTime, 10) : null;
  });

  let interval: ReturnType<typeof setInterval> | null = null;

  useEffect(() => {
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remainingTime = Math.max(0, workInterval * 60 - elapsed);

        setTimeLeft(remainingTime);
        localStorage.setItem("timeLeft", remainingTime.toString());

        if (remainingTime === 0) {
          clearInterval(interval as NodeJS.Timeout);
          handleReset();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, workInterval]);

  useEffect(() => {
    localStorage.setItem("timeLeft", timeLeft.toString());
    localStorage.setItem("isRunning", isRunning.toString());
    if (startTime) {
      localStorage.setItem("startTime", startTime.toString());
    } else {
      localStorage.removeItem("startTime");
    }
  }, [timeLeft, isRunning, startTime]);

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      setStartTime(null);
      localStorage.setItem("timeLeft", timeLeft.toString());
    } else {
      setIsRunning(true);
      setStartTime(Date.now() - (workInterval * 60 - timeLeft) * 1000);
      localStorage.setItem("startTime", Date.now().toString());
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(workInterval * 60);
    setStartTime(null);
    localStorage.removeItem("timeLeft");
    localStorage.removeItem("isRunning");
    localStorage.removeItem("startTime");
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = (1 - timeLeft / (workInterval * 60)) * 100;

  return (
    <div className="pomodoro-timer">
      <h1>Pomodoro Timer</h1>
      <div className="settings">
        <label>
          Work Interval (min):
          <input
            type="number"
            value={workInterval}
            onChange={(e) => {
              const newWorkInterval = parseInt(e.target.value, 10) || 25;
              setWorkInterval(newWorkInterval);
              if (!isRunning) {
                setTimeLeft(newWorkInterval * 60);
                localStorage.setItem("timeLeft", (newWorkInterval * 60).toString());
              }
            }}
          />
        </label>
      </div>
      <div className="progress-container">
        <CircularProgressbar
          value={progress}
          text={formatTime(timeLeft)}
          styles={buildStyles({
            textColor: "#333",
            pathColor: isRunning ? "#3e98c7" : "#ff6347",
            trailColor: "#d6d6d6",
          })}
        />
      </div>
      <div className="controls">
        <button onClick={handleStartPause}>
          {isRunning ? "Pause" : "Start"}
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
