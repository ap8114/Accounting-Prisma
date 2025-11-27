import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });

    const [customColors, setCustomColors] = useState(() => {
        const saved = localStorage.getItem("customColors");
        return saved ? JSON.parse(saved) : {
            primary: "#53b2a5",
            secondary: "#6c757d",
            success: "#198754",
            danger: "#dc3545",
            warning: "#ffc107",
            info: "#0dcaf0",
            light: "#f8f9fa",
            dark: "#212529"
        };
    });

    const [layout, setLayout] = useState(() => {
        return localStorage.getItem("layout") || "default";
    });

    const [sidebarColor, setSidebarColor] = useState(() => {
        return localStorage.getItem("sidebarColor") || "#032d45";
    });

    const [topbarColor, setTopbarColor] = useState(() => {
        return localStorage.getItem("topbarColor") || "#032d45";
    });

    const [sidebarMenuColor, setSidebarMenuColor] = useState(() => {
        return localStorage.getItem("sidebarMenuColor") || "#53b2a5";
    });

    const [buttonsColor, setButtonsColor] = useState(() => {
        return localStorage.getItem("buttonsColor") || "#53b2a5";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        // Apply CSS custom properties for dynamic theming
        const root = document.documentElement;

        if (theme === "dark") {
            root.style.setProperty("--bs-body-bg", "#1a1a1a");
            root.style.setProperty("--bs-body-color", "#ffffff");
            root.style.setProperty("--bs-card-bg", "#2d2d2d");
            root.style.setProperty("--bs-border-color", "#404040");
            root.style.setProperty("--bs-table-bg", "#2d2d2d");
            root.style.setProperty("--bs-table-striped-bg", "#363636");
            root.style.setProperty("--bs-table-hover-bg", "#404040");
            root.style.setProperty("--bs-form-control-bg", "#2d2d2d");
            root.style.setProperty("--bs-form-control-color", "#ffffff");
            root.style.setProperty("--bs-modal-bg", "#2d2d2d");
            root.style.setProperty("--bs-modal-color", "#ffffff");
        } else {
            root.style.setProperty("--bs-body-bg", "#ffffff");
            root.style.setProperty("--bs-body-color", "#212529");
            root.style.setProperty("--bs-card-bg", "#ffffff");
            root.style.setProperty("--bs-border-color", "#dee2e6");
            root.style.setProperty("--bs-table-bg", "#ffffff");
            root.style.setProperty("--bs-table-striped-bg", "#f8f9fa");
            root.style.setProperty("--bs-table-hover-bg", "#f5f5f5");
            root.style.setProperty("--bs-form-control-bg", "#ffffff");
            root.style.setProperty("--bs-form-control-color", "#212529");
            root.style.setProperty("--bs-modal-bg", "#ffffff");
            root.style.setProperty("--bs-modal-color", "#212529");
        }

        // Apply custom colors
        Object.entries(customColors).forEach(([key, value]) => {
            root.style.setProperty(`--bs-${key}`, value);
        });

        // Apply sidebar and topbar colors
        root.style.setProperty("--sidebar-bg", sidebarColor);
        root.style.setProperty("--topbar-bg", topbarColor);
        root.style.setProperty("--sidebar-link-hover-bg", sidebarMenuColor);
        root.style.setProperty("--buttons-bg", buttonsColor);

    }, [theme, customColors, sidebarColor, topbarColor, sidebarMenuColor, buttonsColor]);

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

    const updateSidebarMenuColor = (color) => {
        setSidebarMenuColor(color);
        localStorage.setItem("sidebarMenuColor", color);
    }

    const updateButtonsColor = (color) => {
        setButtonsColor(color);
        localStorage.setItem("buttonsColor", color);
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
            dark: "#212529"
        });
        setLayout("default");
        setSidebarColor("#032d45");
        setTopbarColor("#032d45");
        setSidebarMenuColor("#0dbd88ff");

        localStorage.removeItem("theme");
        localStorage.removeItem("customColors");
        localStorage.removeItem("layout");
        localStorage.removeItem("sidebarColor");
        localStorage.removeItem("topbarColor");
        localStorage.removeItem("sidebarMenuColor");
        localStorage.removeItem("buttonsColor");
    };

    return (
        <ThemeContext.Provider value={{
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
            buttonsColor,
            updateButtonsColor
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => useContext(ThemeContext);

export { ThemeProvider, useTheme };