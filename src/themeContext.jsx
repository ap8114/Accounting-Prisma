import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// 👉 Function to detect if color is light or dark
const isColorLight = (hex) => {
    if (!hex) return false;
    const cleaned = hex.replace("#", "");
    const bigint = parseInt(cleaned, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
};

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() =>
        localStorage.getItem("theme") || "light"
    );

    const [customColors, setCustomColors] = useState(() => {
        const saved = localStorage.getItem("customColors");
        return saved
            ? JSON.parse(saved)
            : {
                  primary: "#53b2a5",
                  secondary: "#6c757d",
                  success: "#198754",
                  danger: "#dc3545",
                  warning: "#ffc107",
                  info: "#0dcaf0",
                  light: "#f8f9fa",
                  dark: "#212529",
              };
    });

    const [layout, setLayout] = useState(() =>
        localStorage.getItem("layout") || "default"
    );

    const [sidebarColor, setSidebarColor] = useState(() =>
        localStorage.getItem("sidebarColor") || "#032d45"
    );

    const [sidebarMenuColor, setSidebarMenuColor] = useState(() =>
        localStorage.getItem("sidebarMenuColor") || "#09b9abff"
    );

    const [buttonColor, setButtonColor] = useState(() =>
        localStorage.getItem("buttonColor") || "#053d3cff"
    );

    const [topbarColor, setTopbarColor] = useState(() =>
        localStorage.getItem("topbarColor") || "#032d45"
    );

    useEffect(() => {
        const root = document.documentElement;

        // 🌙 DARK THEME FIXED COMPLETELY
        if (theme === "dark") {
            root.setAttribute("data-theme", "dark");

            root.style.setProperty("--bs-body-bg", "#292929ff");
            root.style.setProperty("--bs-body-color", "#ffffff");
            root.style.setProperty("--bs-card-bg", "#000000ff");
            root.style.setProperty("--bs-card-color", "#ffffff");
            root.style.setProperty("--bs-border-color", "#969696ff");

            // 🟣 Table Fix
            root.style.setProperty("--bs-table-bg", "#1e1e1e");
            root.style.setProperty("--bs-table-color", "#ffffff");
            root.style.setProperty("--bs-table-striped-bg", "#242424");
            root.style.setProperty("--bs-table-hover-bg", "#2a2a2a");

            // Input / Form Fix
            root.style.setProperty("--bs-form-control-bg", "#1e1e1e");
            root.style.setProperty("--bs-form-control-color", "#ffffff");
            root.style.setProperty("--bs-form-control-border-color", "#444");

            // Modal Fix
            root.style.setProperty("--bs-modal-bg", "#1e1e1e");
            root.style.setProperty("--bs-modal-color", "#ffffff");
        } else {
            // ☀️ LIGHT THEME
            root.setAttribute("data-theme", "light");

            root.style.setProperty("--bs-body-bg", "#ffffff");
            root.style.setProperty("--bs-body-color", "#212529");
            root.style.setProperty("--bs-card-bg", "#ffffff");
            root.style.setProperty("--bs-card-color", "#212529");
            root.style.setProperty("--bs-border-color", "#dee2e6");

            root.style.setProperty("--bs-table-bg", "#ffffff");
            root.style.setProperty("--bs-table-color", "#212529");
            root.style.setProperty("--bs-table-striped-bg", "#f8f9fa");
            root.style.setProperty("--bs-table-hover-bg", "#f4f4f4");

            root.style.setProperty("--bs-form-control-bg", "#ffffff");
            root.style.setProperty("--bs-form-control-color", "#212529");
            root.style.setProperty("--bs-modal-bg", "#ffffff");
            root.style.setProperty("--bs-modal-color", "#212529");
        }

        // Custom Colors
        Object.entries(customColors).forEach(([key, value]) => {
            root.style.setProperty(`--bs-${key}`, value);
        });

        // Sidebar / Topbar / Hover
        root.style.setProperty("--sidebar-bg", sidebarColor);
        root.style.setProperty("--topbar-bg", topbarColor);
        root.style.setProperty("--sidebar-link-hover-bg", sidebarMenuColor);

        // Button
        root.style.setProperty("--button-bg", buttonColor);

        // Auto-detect text color on hover
        const hoverTextColor = isColorLight(sidebarMenuColor)
            ? "#000000"
            : "#ffffff";

        root.style.setProperty("--sidebar-link-hover-text", hoverTextColor);

        // LocalStorage
        localStorage.setItem("theme", theme);
        localStorage.setItem("buttonColor", buttonColor);
        localStorage.setItem("sidebarMenuColor", sidebarMenuColor);
    }, [theme, customColors, sidebarColor, topbarColor, sidebarMenuColor, buttonColor]);

    // ---------------- Actions -------------------

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    const updateCustomColors = (newColors) => {
        setCustomColors(newColors);
        localStorage.setItem("customColors", JSON.stringify(newColors));
    };

    const updateLayout = (newLayout) => {
        setLayout(newLayout);
        localStorage.setItem("layout", newLayout);
    };

    const updateSidebarColor = (color) => {
        setSidebarColor(color);
        localStorage.setItem("sidebarColor", color);
    };

    const updateButtonColor = (color) => {
        setButtonColor(color);
        localStorage.setItem("buttonColor", color);
    };

    const updateSidebarMenuColor = (color) => {
        setSidebarMenuColor(color);
        localStorage.setItem("sidebarMenuColor", color);
    };

    const updateTopbarColor = (color) => {
        setTopbarColor(color);
        localStorage.setItem("topbarColor", color);
    };

    const resetTheme = () => {
        setTheme("light");

        setCustomColors({
            primary: "#53b2a5",
            secondary: "#6c757d",
            success: "#198754",
            danger: "#dc3545",
            warning: "#ffc107",
            info: "#0dcaf0",
            light: "#f8f9fa",
            dark: "#212529",
        });

        setLayout("default");
        setSidebarColor("#032d45");
        setTopbarColor("#032d45");

        localStorage.clear();
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme,
                customColors,
                updateCustomColors,
                layout,
                updateLayout,
                sidebarColor,
                updateSidebarColor,
                topbarColor,
                updateTopbarColor,
                resetTheme,
                sidebarMenuColor,
                updateSidebarMenuColor,
                buttonColor,
                updateButtonColor,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => useContext(ThemeContext);

export { ThemeProvider, useTheme };
