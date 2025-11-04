import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isMobile, onLinkClick }) => {
  const { pathname } = useLocation();
  const [activePath, setActivePath] = useState(pathname);
  const [role, setRole] = useState("");
  const [expandedMenu, setExpandedMenu] = useState({});
  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);
  console.log("Current Role:", role); // Debugging line to check the role value
  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const handleMenuClick = (path) => {
    setActivePath(path);
    if (isMobile) {
      const offcanvas = window.bootstrap?.Offcanvas.getInstance(
        document.getElementById("mobileSidebar")
      );
      offcanvas?.hide();
    }
    onLinkClick?.();
  };
  const toggleMenu = (menuKey) => {
    setExpandedMenu((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };
  const renderDropdownSection = (title, mainItem, subItems) => {
    const menuKey = mainItem.to; // unique key for expansion
    const isExpanded = expandedMenu[menuKey];

    return (
      <div className="mb-3" key={mainItem.to}>
        {/* Main Dropdown Toggle */}
        <div
          className="nav-item ps-2"
          style={{ cursor: "pointer" }}
          onClick={() => toggleMenu(menuKey)}
        >
          <div
            className={`nav-link d-flex align-items-center sidebar-link px-3 py-2 ${activePath === mainItem.to ||
                subItems.some((item) => item.to === activePath)
                ? "active-link"
                : ""
              }`}
            style={linkStyle}
          >
            <i className={`me-3 ${mainItem.icon}`} style={iconStyle}></i>
            <span>{mainItem.label}</span>
            <i
              className={`ms-auto fas ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"
                }`}
              style={{ fontSize: "0.8rem", opacity: 0.7 }}
            ></i>
          </div>
        </div>

        {/* Submenu Items */}
        {isExpanded && (
          <div className="submenu ps-4">
            {subItems.map((item) => (
              <div className="nav-item" key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => handleMenuClick(item.to)}
                  className={`nav-link d-flex align-items-center sidebar-link px-3 py-1 small ${activePath === item.to ? "active-sublink" : ""
                    }`}
                  style={{
                    ...linkStyle,
                    paddingLeft: "2.8rem",
                    fontSize: "14px",
                    color: "#ccc",
                  }}
                >
                  <i
                    className={`me-2 ${item.icon}`}
                    style={{ ...iconStyle, fontSize: "14px" }}
                  ></i>
                  <span>{item.label}</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  const navItem = (to, icon, label) => (
    <div className="nav-item ps-2" key={to}>
      <Link
        to={to}
        onClick={() => handleMenuClick(to)}
        className={`nav-link d-flex align-items-center sidebar-link px-3 py-2 ${activePath === to ? "active-link" : ""
          }`}
        style={linkStyle}
      >
        <i className={`me-3 ${icon}`} style={iconStyle}></i>
        <span>{label}</span>
      </Link>
    </div>
  );

  const renderFlatSection = (title, items) => (
    <div className="mb-3" key={title}>
      <div className="text-white fw-bold px-3 py-1" style={sectionTitleStyle}>
        {title}
      </div>
      {items.map(({ to, icon, label }) => navItem(to, icon, label))}
    </div>
  );

  const getMenuItems = () => {
    const menuItems = {
      SUPERADMIN: [
        renderFlatSection("Admin Dashboard", [
          {
            to: "/dashboard",
            icon: "fas fa-tachometer-alt",
            label: "Dashboard",
          },
          {
            to: "/superadmin/company",
            icon: "fas fa-building",
            label: "Company",
          },
          {
            to: "/superadmin/planpricing",
            icon: "fas fa-tags",
            label: "Plans & Pricing",
          },
          {
            to: "/superadmin/requestplan",
            icon: "fas fa-envelope-open",
            label: "Request Plan",
          },
          {
            to: "/superadmin/payments",
            icon: "fas fa-credit-card",
            label: "Payments",
          },
          {
            to: "/superadmin/manage-passwords",
            icon: "fas fa-key",
            label: "Manage Passwords",
          },
        ]), 
      ],

      COMPANY: [
        renderFlatSection("Admin Dashboard", [
          {
            to: "/company/dashboard",
            icon: "fas fa-tachometer-alt",
            label: "Dashboard",
          },
        ]),
        renderFlatSection("Accounts", [
          {
            to: "/company/allacounts",
            icon: "fas fa-calendar-day",
            label: "Charts of Accounts",
          },
          {
            to: "/company/customersdebtors",
            icon: "fas fa-hand-holding-usd",
            label: "Customers/Debtors",
          },
          {
            to: "/company/vendorscreditors",
            icon: "fas fa-user-tie",
            label: "Vendors/Creditors",
          },
          // { to: "/company/receiptentry", icon: "fas fa-receipt", label: "Receipt Entry" },
          // { to: "/company/paymententry", icon: "fas fa-money-check-alt", label: "Payment Entry" },
          {
            to: "/company/transaction",
            icon: "fas fa-money-check-alt",
            label: "All Transaction",
          },
        ]),

        renderFlatSection("Inventory", [
          {
            to: "/company/warehouse",
            icon: "fas fa-warehouse",
            label: "Warehouse",
          },
          {
            to: "/company/unitofmeasure",
            icon: "fas fa-ruler-combined",
            label: "Unit of measure",
          },
          {
            to: "/company/inventorys",
            icon: "fas fa-boxes",
            label: "Product & Inventory",
          },
          { to: "/company/service", icon: "fas fa-boxes", label: "Service" },
          // {
          //   to: "/company/createvoucher",
          //   icon: "fas fa-file-invoice",
          //   label: "Create Voucher",
          // },
          {
            to: "/company/stocktranfer",
            icon: "fas fa-exchange-alt",
            label: "StockTransfer",
          },
          {
            to: "/company/inventory-adjustment",
            icon: "fas fa-warehouse", // Changed from "fas fa-exchange-alt"
            label: "Inventory Adjustment",
          },
        ]),

        renderFlatSection("Sales", [
          {
            to: "/company/Invoice",
            icon: "fas fa-file-invoice",
            label: "Sales Order",
          },
          // { to: "/company/deliverychallans", icon: "fas fa-truck-loading", label: "Delivery Challans" },
          // { to: "/company/salesorder", icon: "fas fa-table", label: "Sales Order" },
          // { to: "/company/salesdelivery", icon: "fas fa-money-bill", label: "Sales Delivery" },
          {
            to: "/company/salesreturn",
            icon: "fas fa-money-bill",
            label: "Sales Return",
          },
        ]),
        renderFlatSection("Purchases", [
          // { to: "/company/vendors", icon: "fas fa-users", label: "Vendors" },
          // { to: "/company/bill", icon: "fas fa-file", label: "Bill" },
          // { to: "/company/purchasorder", icon: "fas fa-shopping-cart", label: "Purchase Order" },
          {
            to: "/company/purchasorderr",
            icon: "fas fa-shopping-cart",
            label: "Purchase Orders",
          },
          {
            to: "/company/purchasereturn",
            icon: "fas fa-undo",
            label: "Purchase Return",
          },
        ]),

        renderFlatSection("POS", [
          // { to: "/company/product", icon: "fas fa-box", label: "Product" },
          {
            to: "/company/ponitofsale",
            icon: "fas fa-desktop",
            label: "POS Screen",
          },
        ]),
        renderFlatSection("VOUCHER", [
          {
            to: "/company/createvoucher",
            icon: "fas fa-file-invoice",
            label: "Create Voucher",
          },
          {
            to: "/company/expense",
            icon: "fas fa-money-bill",
            label: "Expenses",
          },
          { to: "/company/income", icon: "fas fa-wallet", label: "Income" },
          // {
          //   to: "/company/receivedcustomer",
          //   icon: "fas fa-arrow-down",
          //   label: "Receipt From Customer",
          // },
          // {
          //   to: "/company/paymnetsupplier",
          //   icon: "fas fa-arrow-up",
          //   label: "Payment To Vendor",
          // },
          {
            to: "/company/contravoucher",
            icon: "fas fa-exchange-alt",
            label: "Contra Voucher",
          },
        ]),

        // renderFlatSection("GST ", [
        //   { to: "/company/taxreport", icon: "fas fa-file-alt", label: "Tax Report" },
        //   {
        //     to: "/company/gstreturns",
        //     icon: "fas fa-file-invoice",
        //     label: "GST Returns",
        //   },
        //   { to: "/company/tdstcs", icon: "fas fa-percent", label: "TDS/TCS" },
        //   {
        //     to: "/company/itcreport",
        //     icon: "fas fa-file-contract",
        //     label: "ITC Report",
        //   },
        //   {
        //     to: "/company/ewaybill",
        //     icon: "fas fa-truck",
        //     label: "e-Way Bill",
        //   },
        // ]),

        renderFlatSection("Reports", [
          {
            to: "/company/salesreport",
            icon: "fas fa-chart-line",
            label: "Sales Report",
          },
          {
            to: "/company/purchasereport",
            icon: "fas fa-file-invoice-dollar",
            label: "Purchase Report",
          },

          {
            to: "/company/posreport",
            icon: "fas fa-shopping-cart",
            label: "POS Report",
          },

          {
            to: "/company/taxreport",
            icon: "fas fa-file-alt",
            label: "Tax Report",
          },
          {
            to: "/company/inventorysummary",
            icon: "fas fa-clipboard-list",
            label: "Inventory Summary",
          },
          {
            to: "/company/balancesheet",
            icon: "fas fa-balance-scale",
            label: "Balance Sheet",
          },
          { to: "/company/cashflow", icon: "fas fa-coins", label: "Cash Flow" },
          {
            to: "/company/profitloss",
            icon: "fas fa-chart-pie",
            label: "Profit & Loss",
          },
          {
            to: "/company/vatreport",
            icon: "fas fa-file-invoice-dollar",
            label: "Vat Report",
          },
          {
            to: "/company/daybook",
            icon: "fas fa-calendar-day",
            label: "DayBook",
          },

          {
            to: "/company/journalentries",
            icon: "fas fa-book",
            label: "Journal Entries",
          },
          {
            to: "/company/ledger",
            icon: "fas fa-layer-group",
            label: "Ledger",
          },
          {
            to: "/company/trialbalance",
            icon: "fas fa-layer-group",
            label: "Trial Balance",
          },
        ]),
        renderFlatSection("User Management", [
          { to: "/company/users", icon: "fas fa-users", label: "Users" },
          {
            to: "/company/rolespermissions",
            icon: "fas fa-user-shield",
            label: "Roles & Permissions",
          },
          // { to: "/company/deleteaccountrequests", icon: "fas fa-user-times", label: "User Request" },
        ]),
        renderFlatSection("Settings", [
          {
            to: "/company/companyinfo",
            icon: "fas fa-cog",
            label: "Company Info",
          },
          {
            to: "/company/password-request",
            icon: "fas fa-lock-open",
            label: "Password Requests"
          }


          // { to: "/company/invoicetemplate", icon: "fas fa-cog", label: "Template Setting" },
        ]),
      ],
    };

    return menuItems[role] || null;
  };

  // Styles
  const linkStyle = {
    fontWeight: 500,
    fontSize: "15px",
    color: "#fff",
    paddingLeft: "2.5rem",
  };

  const iconStyle = {
    width: "16px",
    minWidth: "16px",
    textAlign: "center",
    fontSize: "17px",
    color: "#fff",
  };

  const sectionTitleStyle = {
    fontSize: "13px",
    textTransform: "uppercase",
    color: "#ddd",
    marginBottom: "4px",
  };

  return (
    <div
      className="sidebar d-flex flex-column position-fixed start-0"
      style={{ height: "100vh", width: "250px" }}
    >
      <div className="d-flex justify-content-between align-items-center py-2">
        {isMobile && (
          <div className="d-flex align-items-center ms-3 mt-3">
            <img
              src="https://i.ibb.co/TqtpQyH2/image.png"
              alt="Company Logo"
              style={{ height: "50px", width: "170px" }}
            />
          </div>
        )}
        <button
          type="button"
          className="btn btn-outline-light ms-auto d-lg-none me-2 mt-3"
          onClick={() =>
            window.bootstrap?.Offcanvas.getInstance(
              document.getElementById("mobileSidebar")
            )?.hide()
          }
          style={{ padding: "4px 10px", borderRadius: "6px" }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Scrollable Menu with proper height */}
      <div
        className="sidebar-menu-container"
        style={{
          overflowY: "auto",
          flexGrow: 1,
          paddingBottom: "20px",
          maxHeight: "calc(100vh - 70px)",
        }}
      >
        <div className="p-2">{getMenuItems()}</div>
      </div>
    </div>
  );
};

export default Sidebar;
