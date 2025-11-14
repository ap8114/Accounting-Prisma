import React, { useState, useEffect } from "react";
import { FaEye, FaPrint } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { Card, Form } from "react-bootstrap";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/AxiosInstance";

const Ledger = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("");
  const [voucherNoFilter, setVoucherNoFilter] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    opening_balance: 0,
    closing_balance: 0,
    total_debits: 0,
    total_credits: 0
  });

  const companyId = GetCompanyId();

  // Fetch ledger data from API
  useEffect(() => {
    const fetchLedgerData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/transactions/ledger`);
        if (response.data.success) {
          setTransactions(response.data.data.transactions);
          setSummary({
            opening_balance: response.data.data.opening_balance,
            closing_balance: response.data.data.closing_balance,
            total_debits: response.data.data.total_debits,
            total_credits: response.data.data.total_credits
          });
        } else {
          setError(response.data.message || "Failed to fetch ledger data");
        }
      } catch (err) {
        console.error("Error fetching ledger:", err);
        setError(err.message || "An error occurred while fetching ledger data");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchLedgerData();
    }
  }, [companyId]);

  // Extract unique voucher types for the filter dropdown
  const voucherTypes = [...new Set(transactions.map(t => t.voucher_type))];

  const filtered = transactions.filter((t) => {
    const tDate = new Date(t.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const matchDate = (!from || tDate >= from) && (!to || tDate <= to);
    const s = searchText.toLowerCase();
    const matchSearch =
      t.voucher_no.toLowerCase().includes(s) ||
      t.from_to.toLowerCase().includes(s) ||
      t.voucher_type.toLowerCase().includes(s);

    const matchVoucherType = voucherTypeFilter ? t.voucher_type === voucherTypeFilter : true;
    const matchVoucherNo = voucherNoFilter ? t.voucher_no.toLowerCase().includes(voucherNoFilter.toLowerCase()) : true;

    return matchDate && matchSearch && matchVoucherType && matchVoucherNo;
  });

  return (
    <div className="mt-3 p-2">
      {/* Header */}
      <div className="">
        <div>
          <h5 className="fw-bold mb-1">Ledger Report</h5>
          <div className="mt-3 mb-3">
            <Card.Body className="p-3">
              <div className="d-flex flex-wrap gap-2">
                <div className="bg-secondary-subtle rounded p-2 flex-fill text-center">
                  <small className="text-muted d-block">Opening Balance</small>
                  <strong className="text-primary fs-6">{summary.opening_balance.toLocaleString()}</strong>
                </div>
                <div className="bg-danger-subtle rounded p-2 flex-fill text-center">
                  <small className="text-muted d-block">Total Debits</small>
                  <strong className="text-danger fs-6">{summary.total_debits.toLocaleString()}</strong>
                </div>
                <div className="bg-success-subtle rounded p-2 flex-fill text-center">
                  <small className="text-muted d-block">Total Credits</small>
                  <strong className="text-success fs-6">{summary.total_credits.toLocaleString()}</strong>
                </div>
                <div className="bg-primary-subtle rounded p-2 flex-fill text-center">
                  <small className="text-muted d-block">Closing Balance</small>
                  <strong className="text-primary fs-6">{summary.closing_balance.toLocaleString()}</strong>
                </div>
              </div>
            </Card.Body>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-end">
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
        <div>
          <label className="form-label mb-1">Voucher Type</label>
          <Form.Select
            className="form-control"
            value={voucherTypeFilter}
            onChange={(e) => setVoucherTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {voucherTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </Form.Select>
        </div>
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
            placeholder="Search by voucher no, type, from/to..."
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
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.voucher_type}</td>
                  <td>{t.voucher_no}</td>
                  <td className="text-start">{t.from_to}</td>
                  <td className="text-danger">{t.debit > 0 ? `₹${t.debit.toLocaleString()}` : ""}</td>
                  <td className="text-success">{t.credit > 0 ? `₹${t.credit.toLocaleString()}` : ""}</td>
                  <td>{t.balance}</td>
                  <td className="d-flex justify-content-center gap-1">
                    <button
                      className="btn outline-info btn-sm py-1 px-1 text-info"
                      data-bs-toggle="modal"
                      data-bs-target="#ledgerDetailModal"
                      onClick={() => setSelectedTransaction(t)}
                    >
                      <FaEye size={16} />
                    </button>
                    <button
                      className="btn btn-sm text-warning bg-transparent border-0"
                      style={{ outline: "none", boxShadow: "none" }}
                    >
                      <FaPrint size={16} />
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
          Showing {filtered.length} of {transactions.length} entries
        </span>
        <ul className="pagination pagination-sm mb-0">
          <li className="page-item disabled">
            <button className="page-link">&laquo;</button>
          </li>
          <li className="page-item active">
            <button className="page-link">1</button>
          </li>
          <li className="page-item">
            <td className="page-link">2</td>
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
                      <td>{selectedTransaction.voucher_type}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Voucher No</td>
                      <td>{selectedTransaction.voucher_no}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">From/To</td>
                      <td>{selectedTransaction.from_to}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Debit</td>
                      <td className="text-danger">{selectedTransaction.debit > 0 ? `₹${selectedTransaction.debit.toLocaleString()}` : "₹0"}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Credit</td>
                      <td className="text-success">{selectedTransaction.credit > 0 ? `₹${selectedTransaction.credit.toLocaleString()}` : "₹0"}</td>
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
              <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
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