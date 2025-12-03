import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isMobile, onLinkClick }) => {
  const { pathname } = useLocation();
  const [activePath, setActivePath] = useState(pathname);
  const [role, setRole] = useState("");
  const [userPermissions, setUserPermissions] = useState([]);
  const [expandedMenu, setExpandedMenu] = useState({});
  
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    
    // Get user permissions from localStorage
    if (storedRole === "USER") {
      try {
        const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
        setUserPermissions(permissions);
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setUserPermissions([]);
      }
    }
  }, []);
  
  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  // Helper function to check if user has view permission for a module
  const hasViewPermission = (moduleName) => {
    if (role === "SUPERADMIN" || role === "COMPANY") {
      return true; // Superadmin and Company have access to all modules
    }
    
    const permission = userPermissions.find(p => p.module_name === moduleName);
    return permission ? permission.can_view : false;
  };

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
        <i className={`me-3 ${icon}`}></i>
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
    // For SUPERADMIN role, show all admin menu items
    if (role === "SUPERADMIN") {
      return [
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
      ];
    }
    
    // For COMPANY role, show all company menu items
    if (role === "COMPANY") {
      return [
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
        
          {
            to: "/company/stocktranfer",
            icon: "fas fa-exchange-alt",
            label: "StockTransfer",
          },
          {
            to: "/company/inventory-adjustment",
            icon: "fas fa-warehouse",
            label: "Inventory Adjustment",
          },
        ]),

        renderFlatSection("Sales", [
          {
            to: "/company/Invoice",
            icon: "fas fa-file-invoice",
            label: "Sales Order",
          },
        
          {
            to: "/company/salesreturn",
            icon: "fas fa-money-bill",
            label: "Sales Return",
          },
        ]),
        renderFlatSection("Purchases", [
        
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
         
          {
            to: "/company/contravoucher",
            icon: "fas fa-exchange-alt",
            label: "Contra Voucher",
          },
        ]),

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
        
          {
            to: "/company/rolespermissions",
            icon: "fas fa-user-shield",
            label: "Roles & Permissions",
          },
          { to: "/company/users",
             icon: "fas fa-users", 
             label: "Users" 
          },
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

        ]),
      ];
    }
    
    // For USER role, show only menu items based on permissions
    if (role === "USER") {
      const menuItems = [];
      
      // Dashboard section
      if (hasViewPermission("Dashboard")) {
        menuItems.push(
          renderFlatSection("Admin Dashboard", [
            {
              to: "/company/dashboard",
              icon: "fas fa-tachometer-alt",
              label: "Dashboard",
            },
          ])
        );
      }
      
      // Accounts section
      const accountsItems = [];
      if (hasViewPermission("Charts_of_Accounts")) {
        accountsItems.push({
          to: "/company/allacounts",
          icon: "fas fa-calendar-day",
          label: "Charts of Accounts",
        });
      }
      if (hasViewPermission("Customers/Debtors")) {
        accountsItems.push({
          to: "/company/customersdebtors",
          icon: "fas fa-hand-holding-usd",
          label: "Customers/Debtors",
        });
      }
      if (hasViewPermission("Vendors/Creditors")) {
        accountsItems.push({
          to: "/company/vendorscreditors",
          icon: "fas fa-user-tie",
          label: "Vendors/Creditors",
        });
      }
      if (hasViewPermission("All_Transaction")) {
        accountsItems.push({
          to: "/company/transaction",
          icon: "fas fa-money-check-alt",
          label: "All Transaction",
        });
      }
      if (accountsItems.length > 0) {
        menuItems.push(renderFlatSection("Accounts", accountsItems));
      }
      
      // Inventory section
      const inventoryItems = [];
      if (hasViewPermission("Warehouse")) {
        inventoryItems.push({
          to: "/company/warehouse",
          icon: "fas fa-warehouse",
          label: "Warehouse",
        });
      }
      if (hasViewPermission("Unit_of_measure")) {
        inventoryItems.push({
          to: "/company/unitofmeasure",
          icon: "fas fa-ruler-combined",
          label: "Unit of measure",
        });
      }
      if (hasViewPermission("Product_Inventory")) {
        inventoryItems.push({
          to: "/company/inventorys",
          icon: "fas fa-boxes",
          label: "Product & Inventory",
        });
      }
      if (hasViewPermission("Service")) {
        inventoryItems.push({
          to: "/company/service",
          icon: "fas fa-boxes",
          label: "Service",
        });
      }
      if (hasViewPermission("StockTransfer")) {
        inventoryItems.push({
          to: "/company/stocktranfer",
          icon: "fas fa-exchange-alt",
          label: "StockTransfer",
        });
      }
      if (hasViewPermission("Inventory_Adjustment")) {
        inventoryItems.push({
          to: "/company/inventory-adjustment",
          icon: "fas fa-warehouse",
          label: "Inventory Adjustment",
        });
      }
      if (inventoryItems.length > 0) {
        menuItems.push(renderFlatSection("Inventory", inventoryItems));
      }
      
      // Sales section
      const salesItems = [];
      if (hasViewPermission("Sales_Order")) {
        salesItems.push({
          to: "/company/Invoice",
          icon: "fas fa-file-invoice",
          label: "Sales Order",
        });
      }
      if (hasViewPermission("Sales_Return")) {
        salesItems.push({
          to: "/company/salesreturn",
          icon: "fas fa-money-bill",
          label: "Sales Return",
        });
      }
      if (salesItems.length > 0) {
        menuItems.push(renderFlatSection("Sales", salesItems));
      }
      
      // Purchases section
      const purchasesItems = [];
      if (hasViewPermission("Purchase_Orders")) {
        purchasesItems.push({
          to: "/company/purchasorderr",
          icon: "fas fa-shopping-cart",
          label: "Purchase Orders",
        });
      }
      if (hasViewPermission("Purchase_Return")) {
        purchasesItems.push({
          to: "/company/purchasereturn",
          icon: "fas fa-undo",
          label: "Purchase Return",
        });
      }
      if (purchasesItems.length > 0) {
        menuItems.push(renderFlatSection("Purchases", purchasesItems));
      }
      
      // POS section
      if (hasViewPermission("POS_Screen")) {
        menuItems.push(
          renderFlatSection("POS", [
            {
              to: "/company/ponitofsale",
              icon: "fas fa-desktop",
              label: "POS Screen",
            },
          ])
        );
      }
      
      // Voucher section
      const voucherItems = [];
      if (hasViewPermission("Create_Voucher")) {
        voucherItems.push({
          to: "/company/createvoucher",
          icon: "fas fa-file-invoice",
          label: "Create Voucher",
        });
      }
      if (hasViewPermission("Expenses")) {
        voucherItems.push({
          to: "/company/expense",
          icon: "fas fa-money-bill",
          label: "Expenses",
        });
      }
      if (hasViewPermission("Income")) {
        voucherItems.push({
          to: "/company/income",
          icon: "fas fa-wallet",
          label: "Income",
        });
      }
      if (hasViewPermission("Contra_Voucher")) {
        voucherItems.push({
          to: "/company/contravoucher",
          icon: "fas fa-exchange-alt",
          label: "Contra Voucher",
        });
      }
      if (voucherItems.length > 0) {
        menuItems.push(renderFlatSection("VOUCHER", voucherItems));
      }
      
      // Reports section
      const reportsItems = [];
      if (hasViewPermission("Sales_Report")) {
        reportsItems.push({
          to: "/company/salesreport",
          icon: "fas fa-chart-line",
          label: "Sales Report",
        });
      }
      if (hasViewPermission("Purchase_Report")) {
        reportsItems.push({
          to: "/company/purchasereport",
          icon: "fas fa-file-invoice-dollar",
          label: "Purchase Report",
        });
      }
      if (hasViewPermission("POS_Report")) {
        reportsItems.push({
          to: "/company/posreport",
          icon: "fas fa-shopping-cart",
          label: "POS Report",
        });
      }
      if (hasViewPermission("Tax_Report")) {
        reportsItems.push({
          to: "/company/taxreport",
          icon: "fas fa-file-alt",
          label: "Tax Report",
        });
      }
      if (hasViewPermission("Inventory_Summary")) {
        reportsItems.push({
          to: "/company/inventorysummary",
          icon: "fas fa-clipboard-list",
          label: "Inventory Summary",
        });
      }
      if (hasViewPermission("Balance_Sheet")) {
        reportsItems.push({
          to: "/company/balancesheet",
          icon: "fas fa-balance-scale",
          label: "Balance Sheet",
        });
      }
      if (hasViewPermission("Cash_Flow")) {
        reportsItems.push({
          to: "/company/cashflow",
          icon: "fas fa-coins",
          label: "Cash Flow",
        });
      }
      if (hasViewPermission("Profit_Loss")) {
        reportsItems.push({
          to: "/company/profitloss",
          icon: "fas fa-chart-pie",
          label: "Profit & Loss",
        });
      }
      if (hasViewPermission("Vat_Report")) {
        reportsItems.push({
          to: "/company/vatreport",
          icon: "fas fa-file-invoice-dollar",
          label: "Vat Report",
        });
      }
      if (hasViewPermission("DayBook")) {
        reportsItems.push({
          to: "/company/daybook",
          icon: "fas fa-calendar-day",
          label: "DayBook",
        });
      }
      if (hasViewPermission("Journal_Entries")) {
        reportsItems.push({
          to: "/company/journalentries",
          icon: "fas fa-book",
          label: "Journal Entries",
        });
      }
      if (hasViewPermission("Ledger")) {
        reportsItems.push({
          to: "/company/ledger",
          icon: "fas fa-layer-group",
          label: "Ledger",
        });
      }
      if (hasViewPermission("Trial_Balance")) {
        reportsItems.push({
          to: "/company/trialbalance",
          icon: "fas fa-layer-group",
          label: "Trial Balance",
        });
      }
      if (reportsItems.length > 0) {
        menuItems.push(renderFlatSection("Reports", reportsItems));
      }
      
      // User Management section
      const userManagementItems = [];
      if (hasViewPermission("Users")) {
        userManagementItems.push({
          to: "/company/users",
          icon: "fas fa-users",
          label: "Users",
        });
      }
      if (hasViewPermission("Roles_Permissions")) {
        userManagementItems.push({
          to: "/company/rolespermissions",
          icon: "fas fa-user-shield",
          label: "Roles & Permissions",
        });
      }
      if (userManagementItems.length > 0) {
        menuItems.push(renderFlatSection("User Management", userManagementItems));
      }
      
      // Settings section
      const settingsItems = [];
      if (hasViewPermission("Company_Info")) {
        settingsItems.push({
          to: "/company/companyinfo",
          icon: "fas fa-cog",
          label: "Company Info",
        });
      }
      if (hasViewPermission("Password_Requests")) {
        settingsItems.push({
          to: "/company/password-request",
          icon: "fas fa-lock-open",
          label: "Password Requests",
        });
      }
      if (settingsItems.length > 0) {
        menuItems.push(renderFlatSection("Settings", settingsItems));
      }
      
      return menuItems;
    }
    
    return null;
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
    color: "#ffffffff",
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
        <div className="p-2 sidebar-icons">{getMenuItems()}</div>
      </div>
    </div>
  );
};

export default Sidebar;