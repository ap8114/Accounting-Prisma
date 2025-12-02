import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BsThreeDotsVertical,
  BsCalendarEvent,
  BsClock,
  BsCalendarWeek,
  BsPeopleFill,
  BsPersonPlusFill,
  BsBuildings,
  BsPlusCircle,
  BsPencilSquare,
  BsTrash,
  BsShieldLock,
  BsGear,
  BsSlashCircle,
  BsEye,
  BsCloud,
  BsPerson,
  BsSearch,
} from "react-icons/bs";
import "./Company.css";
import { useNavigate } from "react-router-dom";
import BaseUrl from "../../Api/BaseUrl";
import GetCompanyId from "../../Api/GetCompanyId";
import axiosInstance from "../../Api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Company = () => {
  const companyId = GetCompanyId();
  const [showModal, setShowModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editCompany, setEditCompany] = useState({
    id: "",
    name: "",
    email: "",
    plan_id: "",
    plan_type: "",
    start_date: "",
    expire_date: "",
    logo: null,
    logoPreview: "",
  });
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [resetIndex, setResetIndex] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [viewUserIndex, setViewUserIndex] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [resetting, setResetting] = useState(false); // ✅ New state for reset loading
  const [filter, setFilter] = useState({
    plan: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    start_date: "",
    expire_date: "",
    plan_id: "",
    plan_type: "",
    logo: null,
    logoPreview: "",
    password: "",
    confirmPassword: "",
  });
  const [companyUsers, setCompanyUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // 🔁 Normalize company object to match UI expectations
  const normalizeCompany = (company) => {
    return {
      ...company,
      branding: {
        company_logo_url: company.company_logo_url?.trim() || "",
      },
      user_plans: Array.isArray(company.user_plans) ? company.user_plans : [],
    };
  };

  // 📥 Fetch companies
  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get(`auth/Company`);
      const rawCompanies = response.data.data || [];
      const normalized = rawCompanies.map(normalizeCompany);
      setCompanies(normalized);
      setApiError(false);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setApiError(true);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // 📥 Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get(`plans`);
        const plansData = response.data.data || [];
        setPlans(Array.isArray(plansData) ? plansData : []);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setPlans([]);
      }
    };
    fetchPlans();
  }, [companyId]);

  // 👥 Fetch users for a company
  useEffect(() => {
    const fetchCompanyUsers = async () => {
      if (viewUserIndex === null) return;
      const company = companies[viewUserIndex];
      if (!company?.id) return;
      setUsersLoading(true);
      setUsersError(null);
      try {
        const response = await axiosInstance.get(
          `/auth/User/company/${company.id}`
        );
        setCompanyUsers(response.data.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setCompanyUsers([]);
        } else {
          console.error("Error fetching company users:", err);
          setCompanyUsers([]);
        }
      } finally {
        setUsersLoading(false);
      }
    };
    fetchCompanyUsers();
  }, [viewUserIndex, companies]);

  // ✅ NEW: Reset Password via API
  const handleResetPasswordAPI = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const company = companies[resetIndex];
    if (!company?.id) {
      toast.error("Invalid company selected.");
      return;
    }

    setResetting(true);
    try {
      const response = await axiosInstance.patch(
        `password/requests/${company.id}/approve`,
        { new_password: newPassword },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        toast.success("Password reset successfully!");
        setResetIndex(null);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while resetting password.";
      toast.error(msg);
    } finally {
      setResetting(false);
    }
  };

  // 🔍 Filter logic
  const filteredCompanies = companies.filter((company) => {
    const matchSearch =
      filter.search === "" ||
      company.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      company.email.toLowerCase().includes(filter.search.toLowerCase());
    const matchPlan =
      filter.plan === "" ||
      (company.user_plans.length > 0 &&
        company.user_plans[0]?.plan?.id === parseInt(filter.plan));
    const matchStart =
      filter.startDate === "" ||
      new Date(company.startDate) >= new Date(filter.startDate);
    const matchEnd =
      filter.endDate === "" ||
      new Date(company.expireDate) <= new Date(filter.endDate);
    return matchSearch && matchPlan && matchStart && matchEnd;
  });

  const navigate = useNavigate();

  const toggleMenu = (index) => {
    setActiveMenuIndex(activeMenuIndex === index ? null : index);
  };

  const handleEdit = (index) => {
    const company = companies[index];
    setEditCompany({
      id: company.id,
      name: company.name,
      email: company.email,
      plan_id: company.user_plans?.[0]?.plan?.id || "",
      plan_type: company.user_plans?.[0]?.planType || "Monthly",
      start_date: company.startDate?.split("T")[0] || "",
      expire_date: company.expireDate?.split("T")[0] || "",
      logo: null,
      logoPreview: company.branding?.company_logo_url || "",
    });
    setEditIndex(index);
    setActiveMenuIndex(null);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setActiveMenuIndex(null);
  };

  const confirmDelete = async () => {
    if (deleteIndex === null) return;
    const companyToDelete = companies[deleteIndex];
    setDeleting(true);
    try {
      await axiosInstance.delete(`auth/Company/${companyToDelete.id}`);
      const updated = companies.filter((_, i) => i !== deleteIndex);
      setCompanies(updated);
      setDeleteIndex(null);
      toast.success("Company deleted successfully!");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error(`Failed to delete company: ${error.response?.data?.message || error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const saveChanges = async () => {
    if (
      !editCompany.name ||
      !editCompany.email ||
      !editCompany.plan_id ||
      !editCompany.plan_type ||
      !editCompany.start_date ||
      !editCompany.expire_date
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", editCompany.name);
      formData.append("email", editCompany.email);
      formData.append("plan_id", parseInt(editCompany.plan_id));
      formData.append("plan_type", editCompany.plan_type.toLowerCase());
      formData.append("start_date", editCompany.start_date);
      formData.append("expire_date", editCompany.expire_date);
      if (editCompany.logo) {
        formData.append("logo", editCompany.logo);
      }

      const response = await axiosInstance.patch(
        `auth/Company/${editCompany.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const updatedCompany = normalizeCompany(response.data.data || response.data);
      setCompanies((prev) =>
        prev.map((comp, i) => (i === editIndex ? updatedCompany : comp))
      );
      setEditIndex(null);
      toast.success("Company updated successfully!");
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error(`Failed to update company: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddCompany = async () => {
    if (
      !newCompany.name ||
      !newCompany.email ||
      !newCompany.start_date ||
      !newCompany.expire_date ||
      !newCompany.plan_id ||
      !newCompany.plan_type ||
      !newCompany.password
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (newCompany.password !== newCompany.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", newCompany.name);
      formData.append("email", newCompany.email);
      formData.append("password", newCompany.password);
      formData.append("startDate", newCompany.start_date);
      formData.append("expireDate", newCompany.expire_date);
      formData.append("plan_id", parseInt(newCompany.plan_id));
      formData.append("planType", newCompany.plan_type);
      if (newCompany.logo) {
        formData.append("profile", newCompany.logo);
      }

      const response = await axiosInstance.post(`auth/Company`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newComp = normalizeCompany(response.data.data);
      setCompanies((prev) => [newComp, ...prev]);
      resetForm();
      setShowModal(false);
      toast.success("Company created successfully!");
    } catch (error) {
      console.error("Error creating company:", error);
      toast.error(`Failed to create company: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    if (newCompany.logoPreview) {
      URL.revokeObjectURL(newCompany.logoPreview);
    }
    setNewCompany({
      name: "",
      email: "",
      start_date: "",
      expire_date: "",
      plan_id: "",
      plan_type: "",
      logo: null,
      logoPreview: "",
      password: "",
      confirmPassword: "",
    });
  };

  const badgeStyles = {
    Bronze: {
      backgroundImage: "linear-gradient(to right, #ad7c59, #cd7f32, #a97142)",
      color: "#fff",
      boxShadow: "0 0 8px rgba(173, 124, 89, 0.5)",
    },
    Silver: {
      backgroundImage: "linear-gradient(to right, #a9a9a9, #bdbdbd, #d3d3d3)",
      color: "#000",
      boxShadow: "0 0 10px rgba(140, 140, 140, 0.5)",
      buttonColor: "#6e6e6e",
    },
    Gold: {
      backgroundImage: "linear-gradient(to right, #f5d76e, #ffd700, #e6be8a)",
      color: "#000",
      boxShadow: "0 0 8px rgba(255, 215, 0, 0.6)",
    },
    Platinum: {
      backgroundImage: "linear-gradient(to right, #cfe9f9, #e3f2fd, #f5f7fa)",
      color: "#000",
      boxShadow: "0 0 10px rgba(120, 160, 200, 0.4)",
      buttonColor: "#4a6fa5",
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4 mt-4 mt-md-0">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {apiError && (
        <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
          Unable to fetch company data. Please try again later.
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}

      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <h4 className="fw-bold mb-0 d-flex align-items-center">
              <BsBuildings className="me-2 fs-4 text-warning" />
              Manage Companies
            </h4>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm d-flex align-items-center gap-2 ${
                  viewMode === "card" ? "btn-dark" : "btn-outline-secondary"
                }`}
                onClick={() => setViewMode("card")}
                style={{
                  backgroundColor: viewMode === "card" ? "#53b2a5" : "transparent",
                  color: viewMode === "card" ? "#fff" : "#53b2a5",
                  borderColor: "#53b2a5",
                  padding: "6px 12px",
                  borderRadius: "25px",
                }}
              >
                <i className="fas fa-border-all"></i>
              </button>
              <button
                className={`btn btn-sm d-flex align-items-center gap-2 ${
                  viewMode === "table" ? "btn-dark" : "btn-outline-secondary"
                }`}
                onClick={() => setViewMode("table")}
                style={{
                  backgroundColor: viewMode === "table" ? "#53b2a5" : "transparent",
                  color: viewMode === "table" ? "#fff" : "#53b2a5",
                  borderColor: "#53b2a5",
                  padding: "6px 12px",
                  borderRadius: "25px",
                }}
              >
                <i className="fas fa-list-alt"></i>
              </button>
            </div>
            <button
              className="btn btn-sm d-flex align-items-center gap-2"
              onClick={() => setShowModal(true)}
              style={{
                backgroundColor: "#53b2a5",
                borderColor: "#53b2a5",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "25px",
                fontWeight: "500",
                boxShadow: "0 4px 10px rgba(83, 178, 165, 0.3)",
              }}
            >
              <BsPlusCircle className="fs-6" />
              Add Company
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="d-flex flex-wrap gap-3">
          {/* Search */}
          <div className="d-flex align-items-center" style={{ minWidth: "220px" }}>
            <label className="form-label mb-0 fw-semibold small me-2" style={{ width: "80px" }}>
              Search
            </label>
            <div className="position-relative" style={{ flex: 1 }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search companies..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                style={{ paddingLeft: "30px" }}
              />
              <BsSearch
                className="position-absolute text-muted"
                style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="d-flex align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center" style={{ minWidth: "220px" }}>
              <label className="form-label mb-0 fw-semibold small me-2" style={{ width: "80px", whiteSpace: "nowrap" }}>
                Start Date
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filter.startDate}
                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              />
            </div>
            <div className="d-flex align-items-center" style={{ minWidth: "220px" }}>
              <label className="form-label mb-0 fw-semibold small me-2" style={{ width: "80px", whiteSpace: "nowrap" }}>
                Expiry Date
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filter.endDate}
                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Plan */}
          <div className="d-flex align-items-center" style={{ minWidth: "220px" }}>
            <label className="form-label mb-0 fw-semibold small me-2" style={{ width: "80px" }}>
              Plan
            </label>
            <select
              className="form-select form-select-sm"
              value={filter.plan}
              onChange={(e) => setFilter({ ...filter, plan: e.target.value })}
            >
              <option value="">All Plans</option>
              {Array.isArray(plans) &&
                plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.plan_name} - {plan.base_price} {plan.currency}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Card/Table View */}
      {viewMode === "card" ? (
        <div className="row g-4">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company, index) => (
              <div className="col-lg-3 col-md-6" key={company.id}>
                <div className="card shadow-sm rounded-4 p-3 border-0 card-hover position-relative" style={{ minHeight: "260px" }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span
                      className="badge px-3 py-2 rounded-pill fw-semibold"
                      style={badgeStyles[company.user_plans?.[0]?.plan?.plan_name] || badgeStyles.Bronze}
                    >
                      {company.user_plans?.[0]?.plan?.plan_name || "N/A"}
                    </span>
                    <div className="dropdown-icon position-relative">
                      <BsThreeDotsVertical
                        className="text-muted"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleMenu(index)}
                      />
                      {activeMenuIndex === index && (
                        <div className="custom-dropdown shadow rounded-3 p-2" style={{ minWidth: "180px" }}>
                          <div
                            className="dropdown-item d-flex align-items-center text-warning fw-semibold mb-2"
                            onClick={() => handleEdit(index)}
                            style={{ cursor: "pointer", borderRadius: "6px", padding: "8px 10px" }}
                          >
                            <BsPencilSquare className="me-2" /> Edit
                          </div>
                          {/* <div
                            className="dropdown-item d-flex align-items-center text-primary fw-semibold mb-2"
                            onClick={() => setResetIndex(index)}
                            style={{ cursor: "pointer", borderRadius: "6px", padding: "8px 10px", color: "#007bff" }}
                          >
                            <BsGear className="me-2" /> Reset Password
                          </div> */}
                          <div
                            className="dropdown-item d-flex align-items-center fw-semibold text-success mb-2"
                            onClick={() => navigate("/login")}
                            style={{ cursor: "pointer", borderRadius: "6px", padding: "8px 10px", color: "#338871" }}
                          >
                            <BsShieldLock className="me-2" /> Login as Company
                          </div>
                          {/* <div
                            className="dropdown-item d-flex text-secondary align-items-center fw-semibold"
                            style={{ cursor: "pointer", borderRadius: "6px", padding: "8px 10px" }}
                          >
                            <BsSlashCircle className="me-2" /> Login Disable
                          </div> */}
                          <div
                            className="dropdown-item d-flex align-items-center text-danger fw-semibold"
                            onClick={() => handleDelete(index)}
                            style={{ cursor: "pointer", borderRadius: "6px", padding: "8px 10px" }}
                          >
                            <BsTrash className="me-2" /> Delete
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-2">
                    <img
                      src={company.branding?.company_logo_url || "https://i.ibb.co/Pzr45DCB/image5.jpg"}
                      alt={company.name}
                      className="rounded-circle"
                      width="45"
                      height="45"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://i.ibb.co/Pzr45DCB/image5.jpg";
                      }}
                    />
                    <div>
                      <h6 className="mb-0 fw-semibold">{company.name}</h6>
                      <small className="text-muted">{company.email}</small>
                    </div>
                  </div>

                  <div className="text-muted small mb-2 mt-3 px-1">
                    <div className="d-flex align-items-center mt-1 mb-1">
                      <BsCalendarWeek className="me-3 text-info" />
                      <strong className="me-1">Type:</strong>{" "}
                      {company.user_plans?.[0]?.planType
                        ? company.user_plans[0].planType.charAt(0).toUpperCase() + company.user_plans[0].planType.slice(1)
                        : "Monthly"}
                    </div>
                    <div className="mb-1 d-flex align-items-center">
                      <BsCalendarEvent className="me-3 text-primary" />
                      <strong className="me-1">Start:</strong> {formatDate(company.startDate)}
                    </div>
                    <div className="d-flex align-items-center">
                      <BsCalendarEvent className="me-3 text-danger" />
                      <strong className="me-1">End:</strong> {formatDate(company.expireDate)}
                    </div>
                  </div>

                  <div className="d-flex justify-content-center gap-2 mt-2">
                    <button
                      className="btn btn-sm py-1 px-2 text-white"
                      style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5", fontSize: "0.75rem" }}
                      onClick={() => navigate("/superadmin/planpricing")}
                    >
                      Upgrade
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm py-1 px-2"
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => setViewUserIndex(index)}
                    >
                      <BsPeopleFill className="me-1" /> Users
                    </button>
                    <button className="btn btn-outline-secondary btn-sm py-1 px-2" style={{ fontSize: "0.75rem" }}>
                      <BsCloud className="me-1" /> Storage
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <BsBuildings className="text-muted mb-3" style={{ fontSize: "3rem" }} />
              <h5 className="text-muted">No companies found</h5>
              <p className="text-muted">
                {apiError
                  ? "Unable to fetch company data. Please try again later."
                  : "Add a new company to get started."}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="card mt-4 shadow-sm rounded-4">
          <div className="mt-3 mb-2 rounded-4">
            <div className="card-header bg-white border-bottom-0">
              <h5 className="mb-0 fw-bold">Company Table View</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Start Date</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company, index) => (
                      <tr key={company.id}>
                        <td>{index + 1}</td>
                        <td>
                          <img
                            src={company.branding?.company_logo_url || "https://i.ibb.co/Pzr45DCB/image5.jpg"}
                            alt={company.name}
                            className="rounded-circle"
                            width="40"
                            height="40"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://i.ibb.co/Pzr45DCB/image5.jpg";
                            }}
                          />
                        </td>
                        <td>{company.name}</td>
                        <td>{company.email}</td>
                        <td>
                          <span
                            className="badge px-3 py-2 rounded-pill fw-semibold"
                            style={badgeStyles[company.user_plans?.[0]?.plan?.plan_name] || badgeStyles.Bronze}
                          >
                            {company.user_plans?.[0]?.plan?.plan_name || "N/A"}
                          </span>
                        </td>
                        <td>{formatDate(company.startDate)}</td>
                        <td>{formatDate(company.expireDate)}</td>
                        <td>
                          <span
                            className={`badge ${
                              company.user_plans?.[0]?.status === "Active" ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {company.user_plans?.[0]?.status || "N/A"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleEdit(index)}
                              title="Edit Company"
                            >
                              <BsPencilSquare />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(index)}
                              title="Delete Company"
                            >
                              <BsTrash />
                            </button>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => navigate("/login")}
                              title="Login as Company"
                            >
                              <BsShieldLock />
                            </button>
                            <button
                              className="btn btn-sm btn-info text-black"
                              onClick={() => setViewUserIndex(index)}
                              title="View Users"
                            >
                              <BsEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <BsBuildings className="text-muted mb-3" style={{ fontSize: "2rem" }} />
                        <h5 className="text-muted">No companies found</h5>
                        <p className="text-muted">
                          {apiError
                            ? "Unable to fetch company data. Please try again later."
                            : "Add a new company to get started."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals: Add, Edit, Delete, Reset, View Users — keep exactly as before */}
      {/* ➡️ All modals remain UNCHANGED because data structure is now consistent */}

      {/* Add Company Modal */}
      {showModal && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 p-3 position-relative">
              <button
                type="button"
                className="btn btn-sm btn-danger rounded-circle position-absolute"
                style={{
                  width: "35px",
                  height: "35px",
                  top: "10px",
                  right: "10px",
                  zIndex: 10,
                }}
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
              >
                ×
              </button>
              <div className="modal-header border-0 pt-3 pb-1">
                <h5 className="modal-title fw-bold">Create Company</h5>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label fw-semibold">Company Logo</label>
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "10px",
                      backgroundColor: "#f0f0f0",
                      border: "1px solid #ddd",
                      overflow: "hidden",
                    }}
                  >
                    {newCompany.logoPreview ? (
                      <img
                        src={newCompany.logoPreview}
                        alt="Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#aaa",
                          fontSize: "12px",
                          textAlign: "center",
                        }}
                      >
                        No Logo
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 4 * 1024 * 1024) {
                            alert("Image size should be less than 4MB");
                            return;
                          }
                          if (newCompany.logoPreview) {
                            URL.revokeObjectURL(newCompany.logoPreview);
                          }
                          const previewUrl = URL.createObjectURL(file);
                          setNewCompany({
                            ...newCompany,
                            logo: file,
                            logoPreview: previewUrl,
                          });
                        }
                      }}
                      style={{ display: "none" }}
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="btn btn-sm btn-outline-primary"
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                    >
                      Choose Logo
                    </label>
                    {newCompany.logoPreview && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          if (newCompany.logoPreview) {
                            URL.revokeObjectURL(newCompany.logoPreview);
                          }
                          setNewCompany({
                            ...newCompany,
                            logo: null,
                            logoPreview: "",
                          });
                        }}
                        style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <small className="text-muted">Max 4MB, JPG/PNG preferred</small>
              </div>
              <div className="modal-body pt-1">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Company Name"
                      value={newCompany.name}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={newCompany.email}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Start Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={newCompany.start_date}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          start_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Expire Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={newCompany.expire_date}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          expire_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Plan <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={newCompany.plan_id}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          plan_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Plan</option>
                      {Array.isArray(plans) &&
                        plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.plan_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Plan Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={newCompany.plan_type}
                      onChange={(e) => {
                        const type = e.target.value;
                        setNewCompany({ ...newCompany, plan_type: type });
                        if (type) {
                          const startDate = new Date();
                          let endDate = new Date();
                          if (type === "Monthly") {
                            endDate.setMonth(startDate.getMonth() + 1);
                          } else if (type === "Yearly") {
                            endDate.setFullYear(startDate.getFullYear() + 1);
                          }
                          const formatDate = (date) =>
                            date.toISOString().split("T")[0];
                          setNewCompany((prev) => ({
                            ...prev,
                            start_date: formatDate(startDate),
                            expire_date: formatDate(endDate),
                          }));
                        }
                      }}
                    >
                      <option value="">Select Type</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter password"
                      value={newCompany.password}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm password"
                      value={newCompany.confirmPassword}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-3">
                <button
                  className="btn btn-dark px-4"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success px-4"
                  onClick={handleAddCompany}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal, Delete Modal, Reset Modal, View Users Modal — unchanged */}
      {/* (Keep them exactly as in your original code) */}

      {/* Edit Company Modal */}
      {editIndex !== null && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 p-4 position-relative">
              <button
                type="button"
                className="btn btn-sm btn-danger rounded-circle position-absolute"
                style={{
                  width: "35px",
                  height: "35px",
                  top: "10px",
                  right: "10px",
                }}
                onClick={() => setEditIndex(null)}
              >
                ×
              </button>
              <div className="modal-header border-0 pt-3 pb-1">
                <h5 className="modal-title fw-bold">Edit Company</h5>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label fw-semibold">Company Logo</label>
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "10px",
                      backgroundColor: "#f0f0f0",
                      border: "1px solid #ddd",
                      overflow: "hidden",
                    }}
                  >
                    {editCompany.logoPreview ? (
                      <img
                        src={editCompany.logoPreview}
                        alt="Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#aaa",
                          fontSize: "12px",
                          textAlign: "center",
                        }}
                      >
                        No Logo
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 4 * 1024 * 1024) {
                            alert("Image size should be less than 4MB");
                            return;
                          }
                          if (editCompany.logoPreview) {
                            URL.revokeObjectURL(editCompany.logoPreview);
                          }
                          const previewUrl = URL.createObjectURL(file);
                          setEditCompany({
                            ...editCompany,
                            logo: file,
                            logoPreview: previewUrl,
                          });
                        }
                      }}
                      style={{ display: "none" }}
                      id="edit-logo-upload"
                    />
                    <label
                      htmlFor="edit-logo-upload"
                      className="btn btn-sm btn-outline-primary"
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                    >
                      Change Logo
                    </label>
                    {editCompany.logoPreview && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          if (editCompany.logoPreview) {
                            URL.revokeObjectURL(editCompany.logoPreview);
                          }
                          setEditCompany({
                            ...editCompany,
                            logo: null,
                            logoPreview: "",
                          });
                        }}
                        style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <small className="text-muted">Max 4MB, JPG/PNG preferred</small>
              </div>
              <div className="modal-body pt-1">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Company Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editCompany.name}
                      onChange={(e) =>
                        setEditCompany({ ...editCompany, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={editCompany.email}
                      onChange={(e) =>
                        setEditCompany({
                          ...editCompany,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Start Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={editCompany.start_date}
                      onChange={(e) =>
                        setEditCompany({
                          ...editCompany,
                          start_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Expire Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={editCompany.expire_date}
                      onChange={(e) =>
                        setEditCompany({
                          ...editCompany,
                          expire_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Plan <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={editCompany.plan_id}
                      onChange={(e) =>
                        setEditCompany({
                          ...editCompany,
                          plan_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Plan</option>
                      {Array.isArray(plans) &&
                        plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.plan_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Plan Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={editCompany.plan_type}
                      onChange={(e) =>
                        setEditCompany({
                          ...editCompany,
                          plan_type: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Type</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-3">
                <button
                  className="btn btn-dark px-4"
                  onClick={() => setEditIndex(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-warning px-4 text-white"
                  onClick={saveChanges}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteIndex !== null && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content rounded-4 p-4 text-center">
              <p className="fw-semibold fs-5 mb-4">
                Are you sure you want to delete this company?
              </p>
              <p className="text-muted mb-4">This action cannot be undone.</p>
              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn btn-dark px-4"
                  onClick={() => setDeleteIndex(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger px-4"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {/* ✅ UPDATED: Reset Password Modal */}
      {resetIndex !== null && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content rounded-4 p-4 position-relative">
              <button
                type="button"
                className="btn btn-sm btn-danger rounded-circle position-absolute"
                style={{ width: "35px", height: "35px", top: "10px", right: "10px" }}
                onClick={() => setResetIndex(null)}
              >
                ×
              </button>
              <div className="modal-header border-0 pb-1 pt-3">
                <h5 className="modal-title fw-bold">Reset Password</h5>
              </div>
              <div className="modal-body pt-0">
                <p className="mb-3">
                  Reset password for <strong>{companies[resetIndex]?.name || "Company"}</strong>
                </p>
                <div className="mb-3">
                  <label className="form-label">New Password*</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password*</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setResetIndex(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-success px-4"
                  onClick={handleResetPasswordAPI}
                  disabled={resetting || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                >
                  {resetting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* User Details Modal */}
      {viewUserIndex !== null && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 p-4 position-relative">
              <button
                type="button"
                className="btn btn-sm btn-danger rounded-circle position-absolute"
                style={{
                  width: "35px",
                  height: "35px",
                  top: "10px",
                  right: "10px",
                }}
                onClick={() => setViewUserIndex(null)}
              >
                ×
              </button>
              <div className="modal-header border-0 pb-1 pt-3">
                <h5 className="modal-title fw-bold">
                  Users of {companies[viewUserIndex]?.name || "Company"}
                </h5>
              </div>
              <div className="modal-body pt-0">
                {usersLoading ? (
                  <div className="d-flex justify-content-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading users...</span>
                    </div>
                  </div>
                ) : usersError ? (
                  <div className="alert alert-danger" role="alert">
                    Error: {usersError}
                  </div>
                ) : companyUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <BsPerson
                      className="text-muted mb-3"
                      style={{ fontSize: "3rem" }}
                    />
                    <p className="text-muted">
                      No users found for this company.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Profile</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Created Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companyUsers.map((user, index) => (
                          <tr key={user.id}>
                            <td>{index + 1}</td>
                            <td>
                              <img
                                src={
                                  user.profile ||
                                  "https://i.ibb.co/Pzr45DCB/image5.jpg"
                                }
                                alt={user.name || "User"}
                                className="rounded-circle"
                                width="40"
                                height="40"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://i.ibb.co/Pzr45DCB/image5.jpg";
                                }}
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {user.name}
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className="badge bg-info">
                                {user.role?.replace(/_/g, " ") || "N/A"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${user.UserStatus === "Active" ||
                                    user.UserStatus === null
                                    ? "bg-success"
                                    : "bg-danger"
                                  }`}
                              >
                                {user.UserStatus || "Active"}
                              </span>
                            </td>
                            <td>{formatDate(user.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer border-top-0 pt-3">
                <button
                  className="btn btn-secondary px-4"
                  onClick={() => setViewUserIndex(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Company;