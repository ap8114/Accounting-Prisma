import React, { useState } from "react";
import { FaEye, FaPrint } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { Card, Form } from "react-bootstrap";

const Ledger = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  // New filter states
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("");
  const [voucherNoFilter, setVoucherNoFilter] = useState("");
  
  const transactions = [
    {
      date: "2025-06-20",
      voucherType: "Invoice",
      voucherNo: "INV-2025-001",
      From: "Sales to ABC Ltd",
      debit: "",
      credit: "50000",
      balance: "50000 Cr",
      narration: "Invoice raised for sale of goods",
    },
    {
      date: "2025-06-15",
      voucherType: "Payment",
      voucherNo: "PAY-2025-001",
      From: "Payment received from ABC Ltd",
      debit: "20000",
      credit: "",
      balance: "30000 Cr",
      narration: "Partial payment received",
    },
    {
      date: "2025-06-10",
      voucherType: "Credit Note",
      voucherNo: "CN-2025-001",
      From: "Credit note issued for return",
      debit: "5000",
      credit: "",
      balance: "25000 Cr",
      narration: "Goods returned by customer",
    },
    {
      date: "2025-06-01",
      voucherType: "Invoice",
      voucherNo: "INV-2025-002",
      From: "Sales to XYZ Pvt Ltd",
      debit: "",
      credit: "40000",
      balance: "65000 Cr",
      narration: "Invoice for bulk sales",
    },
  ];
  
  // Extract unique voucher types for the filter dropdown
  const voucherTypes = [...new Set(transactions.map(t => t.voucherType))];
  
  const filtered = transactions.filter((t) => {
    const tDate = new Date(t.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const matchDate = (!from || tDate >= from) && (!to || tDate <= to);
    const s = searchText.toLowerCase();
    const matchSearch =
      t.voucherNo.toLowerCase().includes(s) ||
      t.From.toLowerCase().includes(s) ||
      t.voucherType.toLowerCase().includes(s) ||
      t.narration.toLowerCase().includes(s);
      
    // New filter conditions
    const matchVoucherType = voucherTypeFilter ? t.voucherType === voucherTypeFilter : true;
    const matchVoucherNo = voucherNoFilter ? t.voucherNo.toLowerCase().includes(voucherNoFilter.toLowerCase()) : true;
    
    return matchDate && matchSearch && matchVoucherType && matchVoucherNo;
  });
  
  return (
    <div className="mt-3 p-2">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-4 mb-3">
        <div>
          <h5 className="fw-bold mb-1">Ledger Report</h5>
        </div>
      </div>
      
      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-3 align-items-end">
        <div>
          <label className="form-label mb-1">From Date</label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label mb-1">To Date</label>
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        {/* New Voucher Type Filter */}
        <div>
          <label className="form-label mb-1">Voucher Type</label>
          <Form.Select 
            className="form-control"
            value={voucherTypeFilter}
            onChange={(e) => setVoucherTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {voucherTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Form.Select>
        </div>
        {/* New Voucher Number Filter */}
        <div>
          <label className="form-label mb-1">Voucher No</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter voucher number"
            value={voucherNoFilter}
            onChange={(e) => setVoucherNoFilter(e.target.value)}
          />
        </div>
        <div className="flex-grow-1">
          <label className="form-label mb-1">Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by voucher no, type, narration..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      
      {/* Ledger Table */}
      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Voucher Type</th>
              <th>Voucher No</th>
              <th>From/To</th>
              <th>Make Payment/Debit (₹)</th>
              <th>Receive/Credit (₹)</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((t, i) => (
                <tr key={i}>
                  <td>{t.date}</td>
                  <td>{t.voucherType}</td>
                  <td>{t.voucherNo}</td>
                  <td className="text-start">{t.From}</td>
                  <td className="text-danger">{t.debit}</td>
                  <td className="text-success">{t.credit}</td>
                  <td>{t.balance}</td>
                  <td className="d-flex justify-content-center gap-1">
                    <button
                      className="btn outline-info btn-sm py-1 px-1 text-info" 
                      data-bs-toggle="modal"
                      data-bs-target="#ledgerDetailModal"
                      onClick={() => setSelectedTransaction(t)}
                    >
                      <FaEye size={16}/>
                    </button>
                    <button
                      className="btn btn-sm text-warning bg-transparent border-0"
                      style={{ outline: "none", boxShadow: "none" }}
                    >
                      <FaPrint size={16}/>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted py-3">
                  No entries found for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3 px-3">
        <span className="small text-muted">
          Showing {filtered.length} entries
        </span>
        <ul className="pagination pagination-sm mb-0">
          <li className="page-item disabled">
            <button className="page-link">&laquo;</button>
          </li>
          <li className="page-item active">
            <button className="page-link">1</button>
          </li>
          <li className="page-item">
            <button className="page-link">2</button>
          </li>
          <li className="page-item">
            <button className="page-link">&raquo;</button>
          </li>
        </ul>
      </div>
      
      {/* Modal: Ledger Detail */}
      <div
        className="modal fade"
        id="ledgerDetailModal"
        tabIndex="-1"
        aria-labelledby="ledgerDetailModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Voucher Details</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedTransaction && (
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Date</td>
                      <td>{selectedTransaction.date}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Voucher Type</td>
                      <td>{selectedTransaction.voucherType}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Voucher No</td>
                      <td>{selectedTransaction.voucherNo}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">From</td>
                      <td>{selectedTransaction.From}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Narration</td>
                      <td>{selectedTransaction.narration}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Debit</td>
                      <td className="text-danger">{selectedTransaction.debit}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Credit</td>
                      <td className="text-success">{selectedTransaction.credit}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Balance</td>
                      <td>{selectedTransaction.balance}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <small className="d-block text-dark w-100 p-3 border-top bg-light rounded-bottom">
          <strong>Ledger Report:</strong>  
          <Card className="mb-4 p-3 shadow rounded-4 mt-2">
            <Card.Body>
              {/* Heading */}
              <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
              {/* Ledger Bullet Points */}
              <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
                <li>Provides a detailed record of all financial transactions for a specific account or party.</li>
                <li>Displays both debit and credit entries along with dates and references.</li>
                <li>Maintains a running balance over a selected time period to track account position.</li>
              </ul>
            </Card.Body>
          </Card>
        </small>
      </div>
    </div>
  );
};

export default Ledger;