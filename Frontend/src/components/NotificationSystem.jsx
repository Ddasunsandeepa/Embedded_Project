import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // backend URL

export default function NotificationBell() {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const audioRef = useRef(null); // 🔔 reference to audio

  const timeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec} sec ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    socket.on("alert", (msg) => {
      setAlerts((prev) => {
        const newAlert = { text: msg, time: new Date().toISOString() };
        return [newAlert, ...prev].slice(0, 10);
      });
      setUnreadCount((prev) => prev + 1);

      // 🔔 Play sound
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log("Audio blocked:", err);
        });
      }
    });

    return () => socket.off("alert");
  }, []);

  const toggleDropdown = () => {
    setOpen(!open);
    if (!open) setUnreadCount(0);
  };

  return (
    <div className="notification-wrapper">
      <div className="relative">
        {/* 🔔 preload audio file */}
        <audio ref={audioRef} src="/alert.mp3" preload="auto" />

        {/* Bell icon */}
        <button onClick={toggleDropdown} className="notification-button">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="notification-dropdown">
            {alerts.length === 0 ? (
              <p className="notification-item">No alerts</p>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className="notification-item">
                  <p className="alert-text">{alert.text}</p>
                  <span className="alert-time">{timeAgo(alert.time)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
