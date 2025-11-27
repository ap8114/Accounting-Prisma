import React, { useState } from "react";
import { Button, Offcanvas, Form } from "react-bootstrap";
import { useTheme } from "../themeContext";
import "./SettingModal.css";
import defaultsidebar from "../../src/assets/defaultsidebar.jpeg";
import minilayout from "../../src/assets/minilayout.jpeg";
import withoutheader from "../../src/assets/withoutheader.jpeg";
import ThemeSetting from "./SettingModal/ThemeSetting";

const SettingModal = ({ show, handleClose }) => {
  const {
    layout,
    updateLayout,
    sidebarColor,
    updateSidebarColor,
    topbarColor,
    updateTopbarColor,
    resetTheme
  } = useTheme();

  const [layoutWidth, setLayoutWidth] = useState("fluid");

  const layoutImages = [
    { id: "default", src: defaultsidebar, alt: "Default", name: "Default" },
    { id: "mini", src: minilayout, alt: "Mini", name: "Mini Layout" },
    // { id: "no-header", src: withoutheader, alt: "No Header", name: "No-Header" },
  ];

  const topbarColors = [
    "#343a40", "#0d6efd", "#6610f2", "#6366f1", "#032d45", "#6f42c1", "#d63384", "#198754",
    "#ff5733", "#ffc300", "#28a745", "#20c997", "#17a2b8", "#fd7e14", "#6c757d", "#0dcaf0",
    "#ff6b6b", "#845ec2", "#2c73d2", "#0081cf", "#0089ba", "#008e9b", "#00c9a7", "#4b4453"
  ];

  const sidebarColors = [
    "#343a40", "#0d6efd", "#6610f2", "#6366f1", "#032d45", "#6f42c1", "#d63384", "#198754",
    "#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff", "#06d6a0", "#118ab2", "#073b4c",
    "#ef476f", "#ffd166", "#06d6a0", "#26547c", "#fffcf2", "#ccc5b9", "#403d39", "#252422"
  ];

  const { sidebarMenuColor, updateSidebarMenuColor } = useTheme();
  // Save settings and close
  const handleApply = () => {
    handleClose();
  };


  return (
    <Offcanvas show={show} onHide={handleClose} placement="end">
      <Offcanvas.Header closeButton className="border-bottom">
        <Offcanvas.Title className="fw-bold">Theme Customizer</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <small className="text-muted">Choose your themes & layouts etc.</small>

        {/* Layouts */}
        <div className="mt-4">
          <h6 className="fw-semibold">Select Layouts</h6>
          <div className="d-flex gap-3 mt-2">
            {layoutImages.map((item) => (
              <img
                key={item.id}
                src={item.src}
                alt={item.alt}
                className={`layout-img rounded ${layout === item.id ? "border border-primary" : ""}`}
                onClick={() => updateLayout(item.id)}
                style={{ cursor: "pointer", width: "80px" }}
              />
            ))}
          </div>
        </div>

        {/* Layout Width */}
        <div className="mt-4">
          <h6 className="fw-semibold">Layout Width</h6>
          <div className="d-flex gap-3 mt-2">
            <Button
              variant={layoutWidth === "fluid" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setLayoutWidth("fluid")}
            >
              Fluid Layout
            </Button>
            <Button
              variant={layoutWidth === "boxed" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setLayoutWidth("boxed")}
            >
              Boxed Layout
            </Button>
          </div>
        </div>

        {/* Top Bar Color */}
        <div className="mt-4">
          <h6 className="fw-semibold">Top Bar Color</h6>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {topbarColors.map((color) => (
              <div
                key={color}
                className={`color-box rounded ${topbarColor === color ? "border border-dark border-2" : ""}`}
                style={{ backgroundColor: color, width: "30px", height: "30px", cursor: "pointer" }}
                onClick={() => updateTopbarColor(color)}
              ></div>
            ))}
          </div>

          {/* Topbar Color */}
          <div className="mb-4 mt-4">
            <div className="d-flex align-items-center gap-2">
              <input
                type="color"
                value={topbarColor}
                onChange={(e) => updateTopbarColor(e.target.value)}
                className="form-control form-control-color"
                style={{ width: "40px", height: "30px", padding: "2px" }}
              />
              <Form.Control
                type="text"
                value={topbarColor}
                onChange={(e) => updateTopbarColor(e.target.value)}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Color */}
        <div className="mt-4">
          <h6 className="fw-semibold">Sidebar Color</h6>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {sidebarColors.map((color) => (
              <div
                key={color}
                className={`color-box rounded ${sidebarColor === color ? "border border-dark border-2" : ""}`}
                style={{ backgroundColor: color, width: "30px", height: "30px", cursor: "pointer" }}
                onClick={() => updateSidebarColor(color)}
              ></div>
            ))}
          </div>
          <div className="mb-4 mt-4">
            <div className="d-flex align-items-center gap-2">
              <input
                type="color"
                value={sidebarColor}
                onChange={(e) => updateSidebarColor(e.target.value)}
                className="form-control form-control-color"
                style={{ width: "40px", height: "30px", padding: "2px" }}
              />
              <Form.Control
                type="text"
                value={sidebarColor}
                onChange={(e) => updateSidebarColor(e.target.value)}
                size="sm"
              />
            </div>
          </div>
        </div>

        <div>
          {/* Sidebar Menu Hover Color */}
          <div className="mt-4">
            <h6 className="fw-semibold">Sidebar Menu Hover Color</h6>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {sidebarColors.map((color) => (
                <div
                  key={color}
                  className={`color-box rounded ${sidebarMenuColor === color ? "border border-dark border-2" : ""}`}
                  style={{ backgroundColor: color, width: "30px", height: "30px", cursor: "pointer" }}
                  onClick={() => updateSidebarMenuColor(color)}
                ></div>
              ))}
            </div>
          </div>
          <div className="mb-4 mt-4">
            <div className="d-flex align-items-center gap-2">
              <input
                type="color"
                value={sidebarMenuColor}
                onChange={(e) => updateSidebarMenuColor(e.target.value)}
                className="form-control form-control-color"
                style={{ width: "40px", height: "30px", padding: "2px" }}
              />
              <Form.Control
                type="text"
                value={sidebarMenuColor}
                onChange={(e) => updateSidebarMenuColor(e.target.value)}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Theme Mode */}
        <div className="mt-4">
          <ThemeSetting />
        </div>

        {/* Footer Actions */}
        <div className="mt-4 d-flex justify-content-between align-items-center">
          <Button variant="outline-secondary" size="sm" onClick={resetTheme}>
            Reset
          </Button>
          <Button variant="primary" size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default SettingModal;