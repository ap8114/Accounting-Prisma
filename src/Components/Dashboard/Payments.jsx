import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaFileExport,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUndoAlt,
  FaEye,
  FaRedo,
  FaCheck,        // ✅ Added
  FaTimes, 
  FaFilePdf,       // ✅ Added
  FaTrash ,    // ✅ Added
} from "react-icons/fa";
import {  BsEye } from "react-icons/bs";


import { SiPaypal } from "react-icons/si";
import { BsCreditCard2FrontFill, BsBank2,  } from "react-icons/bs";
import { MdAccountBalanceWallet } from "react-icons/md";
import "./Payments.css";


const tabs = [
  "All Payments",
  "Failed Transactions",
  // "Refund Requests",
  "Payment Settings",
];




const transactions = [
  {
    id: "TXN-23456",
    date: "Jun 27, 2025",
    customer: "John Smith",
    method: { name: "Credit Card" },
    amount: "$1,299.99",
    status: "Success",
    reason: "",
  },
  {
    id: "TXN-23455",
    date: "Jun 27, 2025",
    customer: "Emily Johnson",
    method: {  name: "PayPal" },
    amount: "$499.50",
    status: "Success",
    reason: "",
  },
  {
    id: "TXN-23454",
    date: "Jun 26, 2025",
    customer: "Michael Brown",
    method: { name: "Credit Card" },
    amount: "$899.00",
    status: "Failed",
    reason: "Insufficient funds",
  },
  {
    id: "TXN-23453",
    date: "Jun 26, 2025",
    customer: "Sarah Williams",
    method: {  name: "Bank Transfer" },
    amount: "$149.99",
    status: "Success",
    reason: "",
  },
  {
    id: "TXN-23452",
    date: "Jun 25, 2025",
    customer: "David Miller",
    method: {  name: "Credit Card" },
    amount: "$2,499.00",
    status: "Pending",
    reason: "",
  },
  {
    id: "TXN-23451",
    date: "Jun 25, 2025",
    customer: "Jessica Davis",
    method: {  name: "Digital Wallet" },
    amount: "$349.95",
    status: "Success",
    reason: "",
  },
  {
    id: "TXN-23450",
    date: "Jun 24, 2025",
    customer: "Robert Wilson",
    method: {  name: "Credit Card" },
    amount: "$799.50",
    status: "Failed",
    reason: "Expired card",
  },
];

const refundRequests = [
  {
    id: "TXN-23447",
    date: "Jun 23, 2025",
    customer: "Lisa Martinez",
    method: {  name: "Credit Card" },
    amount: "$129.95",
    status: "Refund Requested",
  },
  {
    id: "TXN-23445",
    date: "Jun 22, 2025",
    customer: "Amanda White",
    method: {  name: "PayPal" },
    amount: "$999.00",
    status: "Refunded",
  },
];

const Payments = () => {
  const [activeTab, setActiveTab] = useState("All Payments");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [transactionToDelete, setTransactionToDelete] = useState(null)

    const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

    const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    // Here you would typically make an API call to delete the transaction
    console.log("Deleting transaction:", transactionToDelete);
    
    // Close the modal
    setShowDeleteModal(false);
    setTransactionToDelete(null);
    
    // Show a success message or update the UI accordingly
  };

  const filteredTransactions =
    activeTab === "Failed Transactions"
      ? transactions.filter((txn) => txn.status === "Failed")
      : transactions;

  return (
    <div className="payments-page-wrapper bg-light p-4">
      <div className=" payments-dashboard">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
          <div>
            <h4 className="fw-bold d-flex align-items-center gap-2">
              <span role="img" aria-label="coins"></span> Payments
            </h4>
            <p className="text-muted mb-0">Manage all your payment transactions</p>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn- text-white d-flex align-items-center gap-2 px-3 py-2" style={{backgroundColor:"#3daaaa", borderColor:"#3daaaa"}}>
              <FaFileExport /> Export
            </button>
            <FaFilePdf size={18} className="text-danger" style={{ cursor: "pointer" }} />
          </div>
          
        </div>

        <div className="row g-3 mb-4">
  {/* Total Revenue Card */}
  <div className="col-12 col-md-4">
    <div className="card shadow-sm h-100 payments-card">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="payments-icon bg-orange text-white">
            <FaChartLine />
          </div>
          <h6 className="text-muted mb-0">Total Revenue</h6>
        </div>
        <h5 className="fw-bold">$12,345.67</h5>
        <p className="text-success small mb-0">↑ 12.5% from last month</p>
      </div>
    </div>
  </div>

  {/* Success Rate Card */}
  <div className="col-12 col-md-4">
    <div className="card shadow-sm h-100 payments-card">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="payments-icon bg-success text-white">
            <FaCheckCircle />
          </div>
          <h6 className="text-muted mb-0">Success Rate</h6>
        </div>
        <h5 className="fw-bold">94.2%</h5>
        <p className="text-success small mb-0">↑ 2.1% from last month</p>
      </div>
    </div>
  </div>

  {/* Failed Transactions Card */}
  <div className="col-12 col-md-4">
    <div className="card shadow-sm h-100 payments-card">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="payments-icon bg-danger text-white">
            <FaExclamationTriangle />
          </div>
          <h6 className="text-muted mb-0">Failed Transactions</h6>
        </div>
        <h5 className="fw-bold text-danger">24</h5>
        <p className="text-danger small mb-0">↓ 5.3% from last month</p>
      </div>
    </div>
  </div>
</div>

        <ul className="nav nav-tabs mb-3 custom-tab-hover">
          {tabs.map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>

        {/* Search Bar - visible for all tabs */}
<div className="mb-3">
  <input
    type="text"
    className="form-control payments-searchbar"
    placeholder="Search by transaction ID or customer name"
    // You can add value/onChange for search functionality if needed
  />
</div>

        {(activeTab === "All Payments" || activeTab === "Failed Transactions") && (
          <div className="bg-white rounded shadow-sm p-3" >
            <h5 className="fw-bold mb-1">{activeTab}</h5>
            <p className="text-muted small mb-3">
              {activeTab === "All Payments"
                ? "A list of all payment transactions."
                : "Transactions that failed to process."}
            </p>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th><input type="checkbox" /></th>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn, idx) => (
                    <tr key={idx}>
                      <td><input type="checkbox" /></td>
                      <td>{txn.id}</td>
                      <td>{txn.date}</td>
                      <td><strong>{txn.customer}</strong></td>
                      <td>{txn.method.icon} {txn.method.name}</td>
                      <td>{txn.amount}</td>
                      <td>
                        {txn.status === "Success" && (
                          <span className="badge bg-success">Success</span>
                        )}
                        {txn.status === "Failed" && (
                          <>
                            <span className="badge bg-danger">Failed</span><br />
                            <small className="text-danger">{txn.reason}</small>
                          </>
                        )}
                        {txn.status === "Pending" && (
                          <span className="badge bg-warning text-dark">Pending</span>
                        )}
                      </td>
                    <td>
                      <div className="d-flex gap-2">
<button 
  className="btn btn-sm text-info p-0"
  // style={{ color: '#02bfe7' }}   // Sky blue color
  onClick={() => handleViewDetails(txn)}
>
  <BsEye size={18} />
</button>
  {/* <button className="btn btn-link text-success p-0"><FaRedo /></button> */}
          <button 
          className="btn btn-link text-danger p-0" 
          onClick={() => handleDeleteClick(txn)}
        >
          <FaTrash />
        </button>
        </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center px-2 py-2">
              <div className="text-muted small">
                Showing 1 to {filteredTransactions.length} of {filteredTransactions.length} results
              </div>
              <nav className="custom-pagination-success">
                <ul className="pagination pagination-sm mb-0">
                  <li className="page-item disabled">
                    <button className="page-link">«</button>
                  </li>
                  <li className="page-item active">
                    <button className="page-link">1</button>
                  </li>
                  <li className="page-item">
                    <button className="page-link">2</button>
                  </li>
                  <li className="page-item">
                    <button className="page-link">»</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

         {(activeTab === "Refund Requests") && (
          <div className="bg-white rounded shadow-sm p-2 p-md-3">
            <h5 className="fw-bold mb-1">Refund Requests</h5>
            <p className="text-muted small mb-3">Manage customer refund requests.</p>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-primary">
                  <tr>
                    <th><input type="checkbox" /></th>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {refundRequests.map((txn, idx) => (
                    <tr key={idx}>
                      <td><input type="checkbox" /></td>
                      <td>{txn.id}</td>
                      <td>{txn.date}</td>
                      <td><strong>{txn.customer}</strong></td>
                      <td>{txn.method.icon} {txn.method.name}</td>
                      <td>{txn.amount}</td>
                      <td>
                        {txn.status === "Refund Requested" && (
                          <span className="badge" style={{ backgroundColor: '#7e3ff2', color: 'white' }}>Refund Requested</span>
                        )}
                        {txn.status === "Refunded" && (
                          <span className="badge bg-warning text-dark">Refunded</span>
                        )}
                      </td>
                      <td>
                        {txn.status === "Refund Requested" ? (
                          <>
                            <button className="btn btn-link text-warning p-0 me-2"><FaEye/></button>
                            <button className="btn btn-link text-success p-0 me-2"><FaCheck /></button>
                            <button className="btn btn-link text-danger p-0"><FaTimes /></button>
                          </>
                        ) : (
                          <button className="btn btn-link text-warning p-0 me-2"><BsEye/></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-2 py-2 gap-2">
              <div className="text-muted small">
                Showing 1 to {refundRequests.length} of {refundRequests.length} results
              </div>
              <nav className="custom-pagination-orange">
                <ul className="pagination pagination-sm mb-0">
                  <li className="page-item disabled">
                    <button className="page-link">«</button>
                  </li>
                  <li className="page-item active">
                    <button className="page-link">1</button>
                  </li>
                  <li className="page-item">
                    <button className="page-link">»</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        {activeTab === "Payment Settings" && (
          <div className="bg-white rounded shadow-sm p-2 p-md-4">
            <h5 className="fw-bold mb-3">Payment Gateway Settings</h5>
            <p className="text-muted mb-4">Configure your payment gateway settings.</p>

            <div className="mb-4 border rounded p-2 p-md-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                <h6 className="fw-bold mb-0">Razorpay</h6>
                <div className="d-flex align-items-center gap-2">
                  <span>Status:</span>
                  <span className="badge bg-success">Active</span>
                </div>
              </div>
              <div className="row g-2 g-md-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">API Key</label>
                  <input type="password" className="form-control" value="***************" readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Secret Key</label>
                  <input type="password" className="form-control" value="***************" readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Webhook URL</label>
                  <div className="input-group">
                    <input type="text" className="form-control" value="https://yourdomain.com/webhooks/razorpay" readOnly />
                    <button className="btn btn-outline-secondary" type="button">📋</button>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Environment</label>
                  <input type="text" className="form-control" value="Test Mode" readOnly />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-dark">Reset</button>
              <button
  className="btn text-white"
  style={{ backgroundColor: '#53b2a5' }}
>
  Save Changes
</button>

              </div>
            </div>

            <div className="border rounded p-2 p-md-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                <h6 className="fw-bold mb-0">Stripe</h6>
                <div className="d-flex align-items-center gap-2">
                  <span>Status:</span>
                  <span className="badge bg-secondary">Inactive</span>
                </div>
              </div>
              <div className="row g-2 g-md-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Publishable Key</label>
                  <input type="text" className="form-control" value="pk_test_xxxxxxxxxxxxxxxxxx" readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Secret Key</label>
                  <input type="password" className="form-control" value="***************" readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Webhook URL</label>
                  <div className="input-group">
                    <input type="text" className="form-control" value="https://yourdomain.com/webhooks/stripe" readOnly />
                    <button className="btn btn-outline-secondary" type="button">📋</button>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Environment</label>
                  <input type="text" className="form-control" value="Test Mode" readOnly />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-dark">Reset</button>
           <button
  className="btn text-white"
  style={{ backgroundColor: '#53b2a5' }}
>
  Save Changes
</button>

              </div>
            </div>
          </div>
        )}

        
      </div>
        {/* Payment Details Modal */}
      {showModal && selectedTransaction && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Payment Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
              

                <div className="mb-4">
                  <h5>Payment Details</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>Transaction ID:</strong> {selectedTransaction.id}
                    </li>
                    <li className="mb-2">
                      <strong>Customer:</strong> {selectedTransaction.customer}
                    </li>
                    <li className="mb-2">
                      <strong>Amount:</strong> {selectedTransaction.amount}
                    </li>
                    <li className="mb-2">
                      <strong>Status:</strong>{" "}
                      {selectedTransaction.status === "Success" && (
                        <span className="badge bg-success">Success</span>
                      )}
                      {selectedTransaction.status === "Failed" && (
                        <span className="badge bg-danger">Failed</span>
                      )}
                      {selectedTransaction.status === "Pending" && (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                    </li>
                    <li className="mb-2">
                      <strong>Date:</strong> {selectedTransaction.date}
                    </li>
                    <li className="mb-2">
                      <strong>Method:</strong> {selectedTransaction.method.name}
                    </li>
                    {selectedTransaction.reason && (
                      <li className="mb-2">
                        <strong>Reason:</strong> {selectedTransaction.reason}
                      </li>
                    )}
                  </ul>
                </div>

           
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

       {/* Add the Delete Confirmation Modal */}
      {showDeleteModal && transactionToDelete && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this transaction?</p>
                <div className="alert alert-danger">
                  <strong>Transaction ID:</strong> {transactionToDelete.id}<br />
                  <strong>Amount:</strong> {transactionToDelete.amount}<br />
                  <strong>Customer:</strong> {transactionToDelete.customer}
                </div>
                <p>This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;

<style>{`
  .payments-searchbar {
    border-radius: 10px;
    font-size: 1rem;
    padding: 0.7rem 1rem;
    border: 1px solid #e5e7eb;
    background: #fafbfc;
    box-shadow: none;
    transition: border-color 0.2s;
  }
  .payments-searchbar:focus {
    border-color: #2684ff;
    background: #fff;
    box-shadow: 0 0 0 2px #e0eaff;
  }
`}</style>
