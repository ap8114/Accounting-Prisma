import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEnvelopeOpenText } from "react-icons/fa";
import "./RequestPlan.css";
import axios from "axios";
import BaseUrl from "../../Api/BaseUrl";

const initialPlans = [];

const planMapping = {
  "Legacy Plan": { display: "Legacy", bgColor: "#b2dfdb" },
  Basic: { display: "Basic", bgColor: "#b2dfdb" },
  Silver: { display: "Silver", bgColor: "#c0c0c0" },
  Gold: { display: "Gold", bgColor: "#ffd700" },
  Platinum: { display: "Platinum", bgColor: "#e5e4e2" }
};

const RequestPlan = () => {
  const [plans, setPlans] = useState(initialPlans);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // ✅ Fetch Plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`${BaseUrl}requestforplan`);

        let fetchedData = response.data?.data || response.data;

        // ✅ Agar single object aaya hai to array me convert karo
        if (fetchedData && !Array.isArray(fetchedData)) {
          fetchedData = [fetchedData];
        }

        if (Array.isArray(fetchedData)) {
          const formattedPlans = fetchedData.map(item => ({
            id: item.id || item.company, // fallback agar id na ho
            company: item.company,
            email: item.email,
            plan: item.plan,
            billing: item.billing_cycle,
            date: new Date(item.request_date).toISOString().split('T')[0],
            status: item.status
          }));
          setPlans(formattedPlans);
          setApiError(false);
        } else {
          throw new Error("Invalid data structure from API");
        }

      } catch (err) {
        console.error("Axios fetch error:", err);
        setApiError(true);
        // Don't set error message, just set the error flag
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // ✅ Update Plan Status (PUT)
  const handleAction = async (index, newStatus) => {
    const planToUpdate = plans[index];
    const planId = planToUpdate.id;

    const updatedPlans = [...plans];
    updatedPlans[index].status = newStatus;
    setPlans(updatedPlans);

    setActionLoading(prev => ({ ...prev, [planId]: true }));

    try {
      await axios.put(`${BaseUrl}requestforplan/${planId}`, {
        status: newStatus
      });
      console.log(`Plan ID ${planId} updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update plan status:", err);
      updatedPlans[index].status = planToUpdate.status;
      setPlans(updatedPlans);
      // Don't show alert for API errors, just log to console
    } finally {
      setActionLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <span className="badge bg-success px-2 px-sm-3 py-1 py-sm-2 rounded-pill">Approved</span>;
      case "Pending":
        return <span className="badge bg-warning text-dark px-2 px-sm-3 py-1 py-sm-2 rounded-pill">Pending</span>;
      case "Rejected":
        return <span className="badge bg-danger px-2 px-sm-3 py-1 py-sm-2 rounded-pill">Rejected</span>;
      default:
        return <span className="badge bg-secondary px-2 px-sm-3 py-1 py-sm-2 rounded-pill">{status}</span>;
    }
  };

  const renderActionButtons = (status, index, id) => {
    const isLoading = actionLoading[id];

    return (
      <div className="d-flex gap-1 gap-sm-2 justify-content-center flex-wrap">
        <button
          className="btn btn-outline-success btn-sm rounded-pill px-2 px-sm-3"
          disabled={status === "Approved" || isLoading}
          onClick={() => handleAction(index, "Approved")}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            "Approve"
          )}
        </button>
        <button
          className="btn btn-outline-danger btn-sm rounded-pill px-2 px-sm-3"
          disabled={status === "Rejected" || isLoading}
          onClick={() => handleAction(index, "Rejected")}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            "Reject"
          )}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid p-3 p-md-4 bg-light d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading requested plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4 bg-light">
      <div className="mb-4">
        <div className="d-flex align-items-center mb-3">
          <FaEnvelopeOpenText size={24} className="text-primary me-2" />
          <h3 className="fw-bold m-0" style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}>
            Requested Plans
          </h3>
        </div>

        {/* Show a subtle notification if API failed, but still show the dashboard */}
        {apiError && (
          <div
            className="alert alert-warning alert-dismissible fade show mb-4"
            role="alert"
          >
            Unable to fetch requested plans. Showing cached data if available.
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="px-2 px-sm-3 py-3 d-none d-sm-table-cell">Company</th>
                  <th className="px-2 px-sm-3 py-3 d-none d-md-table-cell">Email</th>
                  <th className="px-2 px-sm-3 py-3">Plan</th>
                  <th className="px-2 px-sm-3 py-3 d-none d-lg-table-cell">Billing</th>
                  <th className="px-2 px-sm-3 py-3 d-none d-md-table-cell">Date</th>
                  <th className="px-2 px-sm-3 py-3">Status</th>
                  <th className="px-2 px-sm-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length > 0 ? (
                  plans.map((user, idx) => (
                    <tr key={idx}>
                      <td className="px-2 px-sm-3 py-3 d-none d-sm-table-cell">{user.company}</td>
                      <td className="d-none d-md-table-cell">{user.email}</td>
                      <td>
                        <span
                          className="px-2 px-sm-3 py-1 rounded-pill d-inline-block text-dark fw-semibold"
                          style={{
                            backgroundColor: planMapping[user.plan]?.bgColor || "#dee2e6",
                            minWidth: "70px",
                            fontSize: "0.85rem"
                          }}
                        >
                          {planMapping[user.plan]?.display || user.plan}
                        </span>
                      </td>
                      <td className="d-none d-lg-table-cell">{user.billing}</td>
                      <td className="d-none d-md-table-cell">{user.date}</td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td>{renderActionButtons(user.status, idx, user.id)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      {apiError 
                        ? "No requested plans available. Please check back later." 
                        : "No requested plans found."
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPlan;