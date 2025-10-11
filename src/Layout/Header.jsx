import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import newlogo from "../assets/newlogozirakbookk.png";
import "./header.css";
import ProfileModal from "./ProfileModal";

const Header = ({ onToggleSidebar }) => {
  const [selectedLang, setSelectedLang] = useState("English");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const notificationRef = useRef(null); // dropdown ke liye ref

  // Dummy Notifications
  const notifications = [
    { id: 1, message: "New user registered", time: "2m ago" },
    { id: 2, message: "Order #1234 has been shipped", time: "10m ago" },
    { id: 3, message: "Password changed successfully", time: "1h ago" },
    { id: 4, message: "New message from Admin", time: "2h ago" },
  ];

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang);
    setShowLangDropdown(false);
  };

  // 🟢 Close notification dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="py-3 px-3 header">
      <div className="d-flex align-items-center justify-content-between flex-wrap">
        {/* Left Section */}
        <div className="d-flex align-items-center flex-grow-1 gap-3">
          <button
            className="btn d-lg-none"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars text-white"></i>
          </button>

          {/* Logo */}
          <div className="d-none d-md-block">
            <img
              src={newlogo}
              alt="Logo"
              className="img-fluid sidebar-logo"
              style={{ maxHeight: "40px" }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
          {/* 🌐 Language Dropdown */}
          <div className="lang-dropdown-container position-relative">
            <i
              className="fas fa-globe lang-dropdown-icon"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
            ></i>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-50">
                <li
                  className={`lang-item ${selectedLang === "English" ? "active-lang" : ""}`}
                  onClick={() => handleLanguageSelect("English")}
                >
                  English
                </li>
                <li
                  className={`lang-item ${selectedLang === "Arabic" ? "active-lang" : ""}`}
                  onClick={() => handleLanguageSelect("Arabic")}
                >
                  Arabic
                </li>
                <li
                  className={`lang-item ${selectedLang === "Pashto" ? "active-lang" : ""}`}
                  onClick={() => handleLanguageSelect("Pashto")}
                >
                  Pashto
                </li>
              </div>
            )}
          </div>

          {/* 🔔 Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              className="btn position-relative"
              onClick={() =>
                setShowNotificationDropdown(!showNotificationDropdown)
              }
            >
              <i className="far fa-bell text-white"></i>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle"></span>
            </button>

            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50">
                <div className="px-3 py-2 border-b font-semibold text-black">
                  Notifications
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-black"
                      >
                        <div className="text-sm">{notif.message}</div>
                        <div className="text-xs text-gray-500">{notif.time}</div>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-gray-500 text-sm">
                      No new notifications
                    </li>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 👤 Profile Icon */}
          <div
            className="d-flex align-items-center me-3 ms-2"
            onClick={() => setShowProfileModal(true)}
            style={{ cursor: "pointer" }}
          >
            <div
              className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center"
              style={{ width: "35px", height: "35px" }}
            >
              P
            </div>
          </div>

          {/* Modal */}
          <ProfileModal
            show={showProfileModal}
            handleClose={() => setShowProfileModal(false)}
          />

          {/* 🔓 Logout */}
          <Link to="/">
            <button
              className="btn btn-outline"
              style={{ borderColor: "#53b2a5", color: "#53b2a5" }}
            >
              <i className="fas fa-sign-out-alt me-1"></i> Logout
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;