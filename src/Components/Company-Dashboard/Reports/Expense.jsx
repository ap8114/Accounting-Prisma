import React, { useState, useEffect, useRef } from "react";
import {
  Tabs,
  Tab,
  Button,
  Form,
  Badge,
  Card,
  Modal,
} from "react-bootstrap";
import {
  FaFilePdf,
  FaFileExcel,
  FaPlusCircle,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import BaseUrl from "../../../Api/BaseUrl";
import GetCompanyId from "../../../Api/GetCompanyId";

const Expense = () => {
  const companyId = GetCompanyId();
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteExpense, setDeleteExpense] = useState(null);
  const [activeTab, setActiveTab] = useState("direct");
  const [filters, setFilters] = useState({
    accountName: "",
    paymentNo: "",
    manualReceiptNo: ""
  });
  
  // State for table rows
  const [tableRows, setTableRows] = useState([
    { id: 1, account: "", amount: "0.00", narration: "" }
  ]);
  
  // State for paid to selection
  const [paidTo, setPaidTo] = useState("");
  
  // State for narration
  const [narration, setNarration] = useState("");
  
  // State for showing narration
  const [showNarration, setShowNarration] = useState(true);
  
  // New states for receipt numbers
  const [autoReceiptNo, setAutoReceiptNo] = useState("");
  const [manualReceiptNo, setManualReceiptNo] = useState("");
  const [nextSequence, setNextSequence] = useState(1);
  
  // New states for API data
  const [accounts, setAccounts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [expenseVouchers, setExpenseVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [vendorsLoaded, setVendorsLoaded] = useState(false);
  const [vouchersLoaded, setVouchersLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPaidFrom, setSelectedPaidFrom] = useState("");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Function to fetch account data
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BaseUrl}account/getAccountByCompany/${companyId}`);
      const result = await response.json();
      
      if (result.status) {
        setAccounts(Array.isArray(result.data) ? result.data : [result.data]);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
      setAccountsLoaded(true);
    }
  };

  // Function to fetch vendor data
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BaseUrl}vendor/getVendorsByCompany/${companyId}`);
      const result = await response.json();
      
      if (result.status) {
        setVendors(Array.isArray(result.data) ? result.data : [result.data]);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    } finally {
      setLoading(false);
      setVendorsLoaded(true);
    }
  };

  // Function to fetch expense vouchers
  const fetchExpenseVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BaseUrl}expensevoucher/company/${companyId}`);
      const result = await response.json();
      
      if (result.status) {
        setExpenseVouchers(Array.isArray(result.data) ? result.data : [result.data]);
      } else {
        setExpenseVouchers([]);
      }
    } catch (error) {
      console.error("Error fetching expense vouchers:", error);
      setExpenseVouchers([]);
    } finally {
      setLoading(false);
      setVouchersLoaded(true);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAccounts();
    fetchVendors();
    fetchExpenseVouchers();
  }, []);

  // Initialize auto receipt number
  useEffect(() => {
    if (expenseVouchers.length > 0) {
      const paymentNumbers = expenseVouchers.map(voucher => voucher.auto_receipt_no);
      const numbers = paymentNumbers.map(p => {
        const match = p.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      }).filter(n => !isNaN(n));
      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
      setNextSequence(maxNumber + 1);
      setAutoReceiptNo(`AUTO-${String(maxNumber + 1).padStart(3, '0')}`);
    } else {
      setNextSequence(1);
      setAutoReceiptNo("AUTO-001");
    }
  }, [expenseVouchers]);
  
  // Handle modal show event to update auto receipt number
  useEffect(() => {
    if (showCreateModal) {
      if (expenseVouchers.length > 0) {
        const paymentNumbers = expenseVouchers.map(voucher => voucher.auto_receipt_no);
        const numbers = paymentNumbers.map(p => {
          const match = p.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        }).filter(n => !isNaN(n));
        const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
        setAutoReceiptNo(`AUTO-${String(maxNumber + 1).padStart(3, '0')}`);
      } else {
        setAutoReceiptNo("AUTO-001");
      }
      setSelectedPaidFrom(accounts.length > 0 ? accounts[0].id : "");
    }
  }, [showCreateModal, expenseVouchers, accounts]);

  const getStatusBadge = (status) => {
    // Since the API doesn't return status, we'll determine it based on the date
    // This is just an example - adjust as needed
    return "badge bg-success"; // Default to "Paid" status
  };
  
  // Calculate total amount
  const calculateTotal = () => {
    return tableRows.reduce((total, row) => {
      return total + parseFloat(row.amount || 0);
    }, 0).toFixed(2);
  };
  
  // Handle adding a new row to the table
  const handleAddRow = () => {
    const newRow = {
      id: tableRows.length + 1,
      account: "",
      amount: "0.00",
      narration: ""
    };
    setTableRows([...tableRows, newRow]);
  };
  
  // Handle deleting a row from the table
  const handleDeleteRow = (id) => {
    if (tableRows.length > 1) {
      setTableRows(tableRows.filter(row => row.id !== id));
    }
  };
  
  // Handle input change in table rows
  const handleRowChange = (id, field, value) => {
    setTableRows(tableRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };
  
  // Handle Paid To selection
  const handlePaidToChange = (e) => {
    const selectedAccount = e.target.value;
    setPaidTo(selectedAccount);
    
    if (selectedAccount) {
      const newRow = {
        id: tableRows.length + 1,
        account: selectedAccount,
        amount: "0.00",
        narration: ""
      };
      setTableRows([...tableRows, newRow]);
      setPaidTo(""); // Reset the dropdown
    }
  };
  
  // Handle Paid From selection
  const handlePaidFromChange = (e) => {
    setSelectedPaidFrom(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const form = e.target;
    
    // Prepare items array with account_name, vendor_id, amount, and narration
    const items = tableRows.map(row => {
      // Find vendor by name
      const vendor = vendors.find(v => v.name_english === row.account);
      return {
        account_name: row.account,
        vendor_id: vendor ? vendor.id : null,
        amount: parseFloat(row.amount || 0),
        narration: row.narration || ""
      };
    });
    
    // Prepare the payload for the API
    const payload = {
      company_id: companyId,
      auto_receipt_no: autoReceiptNo,
      manual_receipt_no: manualReceiptNo,
      voucher_date: form.voucherDate.value,
      paid_from_account_id: parseInt(selectedPaidFrom), // Use the selected ID directly
      narration: narration,
      items: items
    };
    
    console.log("Submitting payload:", payload); // For debugging
    
    try {
      const response = await fetch(`${BaseUrl}expensevoucher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log("API response:", result); // For debugging
      
      if (result.status) {
        alert("Voucher Created Successfully!");
        form.reset();
        setTableRows([{ id: 1, account: "", amount: "0.00", narration: "" }]);
        setNarration("");
        setManualReceiptNo("");
        setSelectedPaidFrom(accounts.length > 0 ? accounts[0].id : "");
        setShowCreateModal(false); // Close the modal using React state
        // Refresh the vouchers list
        fetchExpenseVouchers();
      } else {
        alert("Error creating voucher: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating voucher:", error);
      alert("Error creating voucher. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleEdit = (expense) => {
    setEditExpense(expense);
    setShowEditModal(true);
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const form = e.target;
    
    // Prepare the payload for the API
    const payload = {
      company_id: companyId,
      auto_receipt_no: form.paymentNo.value,
      manual_receipt_no: form.manualReceiptNo.value,
      voucher_date: form.voucherDate.value,
      paid_from_account_id: parseInt(form.paidFrom.value),
      narration: form.narration.value,
      // Note: Items are not being edited in this form, but you might want to add that functionality
    };
    
    console.log("Updating payload:", payload); // For debugging
    
    try {
      const response = await fetch(`${BaseUrl}expensevoucher/${editExpense.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log("API response:", result); // For debugging
      
      if (result.status) {
        alert("Voucher Updated Successfully!");
        setShowEditModal(false);
        setEditExpense(null);
        // Refresh the vouchers list
        fetchExpenseVouchers();
      } else {
        alert("Error updating voucher: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      alert("Error updating voucher. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = (expense) => {
    setDeleteExpense(expense);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (deleteExpense) {
      setSubmitting(true);
      
      try {
        const response = await fetch(`${BaseUrl}expensevoucher/${deleteExpense.id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        console.log("API response:", result); // For debugging
        
        if (result.status) {
          alert("Voucher Deleted Successfully!");
          setShowDeleteModal(false);
          setDeleteExpense(null);
          // Refresh the vouchers list
          fetchExpenseVouchers();
        } else {
          alert("Error deleting voucher: " + (result.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting voucher:", error);
        alert("Error deleting voucher. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Filter expense vouchers based on filter criteria
  const filteredExpenses = expenseVouchers.filter((exp) => {
    return (
      (!filters.accountName || 
        (exp.items && exp.items.some(item => 
          item.account_name && item.account_name.toLowerCase().includes(filters.accountName.toLowerCase())
        ))) &&
      (!filters.paymentNo || 
        (exp.auto_receipt_no && exp.auto_receipt_no.toLowerCase().includes(filters.paymentNo.toLowerCase())))
    );
  });
  
  // Get paid from account name by ID
  const getPaidFromAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.account_name : "Unknown";
  };
  
  // Get vendor name by ID
  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name_english : "Unknown";
  };
  
  return (
    <div className="bg-light p-4 mt-1 product-header">
      {/* Header */}
      <div className="d-flex justify-content-between gap-4 mb-4">
        <div>
          <h5 className="fw-bold mb-1">Expense Voucher</h5>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-light border text-danger">
            <FaFilePdf />
          </button>
          <button className="btn btn-light border text-success">
            <FaFileExcel />
          </button>
          <button
            className="btn text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: "#3daaaa" }}
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlusCircle />
            Create Voucher
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded shadow-sm mb-3">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Payment No</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Payment No..."
              value={filters.paymentNo}
              onChange={(e) => setFilters({ ...filters, paymentNo: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Account</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Account..."
              value={filters.accountName}
              onChange={(e) => setFilters({ ...filters, accountName: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Paid From</label>
            <select
              className="form-select"
              value={filters.paidFrom}
              onChange={(e) => setFilters({ ...filters, paidFrom: e.target.value })}
            >
              <option value="">All</option>
              {accounts.map(account => (
                <option key={`filter-${account.id}`} value={account.id}>
                  {account.account_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Manual Receipt No</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Manual Receipt No..."
              value={filters.manualReceiptNo}
              onChange={(e) => setFilters({ ...filters, manualReceiptNo: e.target.value })}
            />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="direct" title="All Vouchers">
          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>DATE</th>
                  <th>AUTO RECEIPT NO</th>
                  <th>MANUAL RECEIPT NO</th>
                  <th>PAID FROM</th>
                  <th>ACCOUNTS</th>
                  <th>TOTAL AMOUNT</th>
                  <th>STATUS</th>
                  <th>NARRATION</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading && !vouchersLoaded ? (
                  <tr>
                    <td colSpan="9" className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-3">
                      No expense vouchers found
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(exp.voucher_date)}</td>
                      <td>{exp.auto_receipt_no}</td>
                      <td>{exp.manual_receipt_no || "-"}</td>
                      <td>{getPaidFromAccountName(exp.paid_from_account_id)}</td>
                      <td>
                        {exp.items && exp.items.map((item, index) => (
                          <div key={index}>
                            {item.account_name || getVendorName(item.vendor_id)}: {item.amount}
                          </div>
                        ))}
                      </td>
                      <td>{exp.total_amount}</td>
                      <td><span className={getStatusBadge()}>Paid</span></td>
                      <td>{exp.narration}</td>
                      <td>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          {/* View Button */}
                          <button
                            className="btn btn-sm text-info p-2"
                            onClick={() => {
                              setSelectedExpense(exp);
                              setShowViewModal(true);
                            }}
                            aria-label="View details"
                          >
                            <FaEye />
                          </button>

                          {/* Edit Button */}
                          <button
                            className="btn btn-sm text-warning p-2"
                            onClick={() => handleEdit(exp)}
                            aria-label="Edit voucher"
                          >
                            <FaEdit />
                          </button>

                          {/* Delete Button */}
                          <button
                            className="btn btn-sm text-danger p-2"
                            onClick={() => handleDelete(exp)}
                            aria-label="Delete voucher"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Tab>
      </Tabs>
      
      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-2 px-3">
        <span className="small text-muted">
          Showing 1 to {filteredExpenses.length} of {filteredExpenses.length} results
        </span>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className="page-item disabled">
              <button className="page-link">&laquo;</button>
            </li>
            <li className="page-item active">
              <button className="page-link" style={{ backgroundColor: '#3daaaa' }}>1</button>
            </li>
            <li className="page-item">
              <button className="page-link">2</button>
            </li>
            <li className="page-item">
              <button className="page-link">&raquo;</button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* ✅ Create Voucher Modal - Updated */}
      <Modal 
        show={showCreateModal} 
        onHide={() => setShowCreateModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Create Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Auto Receipt No</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={autoReceiptNo} 
                  readOnly 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Manual Receipt No</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={manualReceiptNo}
                  onChange={(e) => setManualReceiptNo(e.target.value)}
                  placeholder="Enter manual receipt number"
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Voucher Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="voucherDate" 
                  defaultValue={new Date().toISOString().split('T')[0]} 
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Paid From</label>
                <select 
                  className="form-select" 
                  value={selectedPaidFrom}
                  onChange={handlePaidFromChange}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((account) => (
                    <option key={`paid-from-${account.id}`} value={account.id}>
                      {account.account_name} ({account.subgroup_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-12">
                <label className="form-label fw-semibold">Paid To</label>
                <select 
                  className="form-select" 
                  value={paidTo}
                  onChange={handlePaidToChange}
                  disabled={loading}
                >
                  <option value="">{loading ? "Loading..." : "Select Account or Vendor"}</option>
                  
                  {/* Accounts from API */}
                  <optgroup label="Accounts">
                    {accounts.length > 0 ? (
                      accounts.map((account) => (
                        <option key={`acc-${account.id}`} value={account.account_name}>
                          {account.account_name} ({account.subgroup_name})
                        </option>
                      ))
                    ) : accountsLoaded ? (
                      <option disabled>No accounts found</option>
                    ) : null}
                  </optgroup>

                  {/* Vendors from API */}
                  <optgroup label="Vendors">
                    {vendors.length > 0 ? (
                      vendors.map((vendor) => (
                        <option key={`vend-${vendor.id}`} value={vendor.name_english}>
                          {vendor.name_english} ({vendor.company_name})
                        </option>
                      ))
                    ) : vendorsLoaded ? (
                      <option disabled>No vendors found</option>
                    ) : null}
                  </optgroup>
                </select>
              </div>
            </div>
            
            {/* Table for Account and Amount */}
            <div className="mb-3">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Amount</th>
                    <th>Narration</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={row.account}
                          onChange={(e) => handleRowChange(row.id, 'account', e.target.value)}
                          list="account-options"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={row.amount}
                          onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Narration for this item"
                          value={row.narration}
                          onChange={(e) => handleRowChange(row.id, 'narration', e.target.value)}
                        />
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteRow(row.id)}
                          disabled={tableRows.length <= 1}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" className="text-end fw-bold">
                      Total: {calculateTotal()}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              
              <datalist id="account-options">
                {accounts.length > 0 && accounts.map((account, idx) => (
                  <option key={`acc-datalist-${idx}`} value={account.account_name} />
                ))}
                {vendors.length > 0 && vendors.map((vendor, idx) => (
                  <option key={`vend-datalist-${idx}`} value={vendor.name_english} />
                ))}
              </datalist>
            </div>

            {/* Add Row Button */}
            <div className="mb-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleAddRow}
              >
                + Add Row
              </button>
            </div>
 
            {/* Narration field */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Voucher Narration</label>
              <textarea 
                className="form-control" 
                rows="3" 
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Enter narration for this voucher..."
              ></textarea>
            </div>
            
            <div className="d-flex justify-content-end gap-2">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn" 
                style={{ backgroundColor: "#3daaaa", color: "white" }}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      
      {/* ✅ View Voucher Modal */}
      <Modal 
        show={showViewModal} 
        onHide={() => {
          setShowViewModal(false);
          setSelectedExpense(null);
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Voucher Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExpense && (
            <div>
              <table className="table table-bordered">
                <tbody>
                  <tr><td><strong>Date</strong></td><td>{formatDate(selectedExpense.voucher_date)}</td></tr>
                  <tr><td><strong>Auto Receipt No</strong></td><td>{selectedExpense.auto_receipt_no}</td></tr>
                  <tr><td><strong>Manual Receipt No</strong></td><td>{selectedExpense.manual_receipt_no || "-"}</td></tr>
                  <tr><td><strong>Paid From</strong></td><td>{getPaidFromAccountName(selectedExpense.paid_from_account_id)}</td></tr>
                  <tr><td><strong>Total Amount</strong></td><td>{selectedExpense.total_amount}</td></tr>
                  <tr><td><strong>Narration</strong></td><td>{selectedExpense.narration}</td></tr>
                </tbody>
              </table>
              
              <h6 className="mt-4 mb-3">Account Details</h6>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Narration</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExpense.items && selectedExpense.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.account_name || "-"}</td>
                      <td>{item.vendor_id ? getVendorName(item.vendor_id) : "-"}</td>
                      <td>{item.amount}</td>
                      <td>{item.narration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
      </Modal>
      
      {/* ✅ Edit Voucher Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => {
          setShowEditModal(false);
          setEditExpense(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editExpense && (
            <form onSubmit={handleEditSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Auto Receipt No</label>
                <input type="text" className="form-control" name="paymentNo" defaultValue={editExpense.auto_receipt_no} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Manual Receipt No</label>
                <input type="text" className="form-control" name="manualReceiptNo" defaultValue={editExpense.manual_receipt_no || ''} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Voucher Date</label>
                <input type="date" className="form-control" name="voucherDate" defaultValue={editExpense.voucher_date.split('T')[0]} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Paid From</label>
                <select className="form-select" name="paidFrom" defaultValue={editExpense.paid_from_account_id}>
                  {accounts.map(account => (
                    <option key={`edit-${account.id}`} value={account.id}>
                      {account.account_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Narration</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  defaultValue={editExpense.narration}
                  name="narration"
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-3 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ backgroundColor: "#3daaaa", color: "white" }}
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>
      
      {/* ✅ Delete Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => {
          setShowDeleteModal(false);
          setDeleteExpense(null);
        }}
        centered
      >
        <Modal.Body className="text-center py-4">
          <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaTrash size={32} color="#F04438" />
          </div>
          <h4 className="fw-bold mb-2">Delete Voucher</h4>
          <p className="mb-4" style={{ color: "#555" }}>
            Are you sure you want to delete this voucher?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-dark" onClick={() => setShowDeleteModal(false)}>No, Cancel</button>
            <button
              className="btn"
              style={{ background: "#3daaaa", color: "#fff", fontWeight: 600 }}
              onClick={confirmDelete}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </Modal.Body>
      </Modal>
      
      {/* Page Info */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>Create and manage payment vouchers for various expenses.</li>
            <li>Each voucher is linked to an account and payment method.</li>
            <li>Helps maintain accurate financial records and expense tracking.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Expense;