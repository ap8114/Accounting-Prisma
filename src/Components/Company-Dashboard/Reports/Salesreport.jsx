import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { BsGear } from 'react-icons/bs';
import { BiSolidReport, BiSolidDollarCircle } from 'react-icons/bi';
import {
  Table,
  Container,
  Card,
  Button,
  Row,
  Col,
  Modal,
  Form,
} from "react-bootstrap";
const Salesreport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [tableData, setTableData] = useState([
    {
      sku: "PT001",
      customerName: "John Doe",
      customerNameArabic: "جون دو", // Arabic: John Doe
      productName: "Laptop",
      category: "Computers",
      soldQty: 5,
      soldAmount: "$1200",
      instockQty: 100,
      status: "Paid",
    },
    {
      sku: "PT002",
      customerName: "Jane Smith",
      customerNameArabic: "جين سميث", // Arabic: Jane Smith
      productName: "Smartphone",
      category: "Electronics",
      soldQty: 10,
      soldAmount: "$800",
      instockQty: 140,
      status: "Pending",
    },
    {
      sku: "PT003",
      customerName: "Michael Brown",
      customerNameArabic: "مايكل براون", // Arabic: Michael Brown
      productName: "Tablet",
      category: "Electronics",
      soldQty: 8,
      soldAmount: "$600",
      instockQty: 300,
      status: "Overdue",
    },
  ]);
  // Filtered data based on search inputs
  const filteredData = tableData.filter((row) =>
    row.customerName.toLowerCase().includes(customerSearch.toLowerCase()) &&
    row.productName.toLowerCase().includes(productSearch.toLowerCase())
  );

  // 🔹 Cycle status function
  const cycleStatus = (index) => {
    const statuses = ["Paid", "Pending", "Overdue"];
    setTableData((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
            ...row,
            status: statuses[(statuses.indexOf(row.status) + 1) % statuses.length],
          }
          : row
      )
    );
  };
  return (
    <div className="container my-4">
      <div className="mb-4">
        <h4 className="fw-bold">Sales Report</h4>
        <p className="text-muted">Manage your Sales report</p>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-success d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Total Amount</small>
              <h5 className="fw-bold">$4,56,000</h5>
            </div>
            <BiSolidDollarCircle size={28} color="#4CAF50" />
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-primary d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Total Paid</small>
              <h5 className="fw-bold">$2,56,42</h5>
            </div>
            <BiSolidDollarCircle size={28} color="#1A73E8" />
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-warning d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Total Unpaid</small>
              <h5 className="fw-bold">$1,52,45</h5>
            </div>
            <BiSolidDollarCircle size={28} color="#EF6C00" />
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-danger d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Overdue</small>
              <h5 className="fw-bold">$2,56,12</h5>
            </div>
            <BiSolidReport size={28} color="#D32F2F" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded mb-3 shadow-sm row g-3">
        {/* Start Date */}
        <div className="col-12 col-md-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="col-12 col-md-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="col-12 col-md-3">
          <label className="form-label">Category</label>
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All</option>
            <option value="Computers">Computers</option>
            <option value="Electronics">Electronics</option>
            <option value="Shoe">Shoe</option>
          </select>
        </div>

        {/* Customer Search */}
        <div className="col-12 col-md-3">
          <label className="form-label">Search Customer Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search Customer..."
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
          />
        </div>

        {/* Product Search */}
        <div className="col-12 col-md-3">
          <label className="form-label">Search Product Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search Product..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
          />
        </div>

        {/* Generate Button */}
        <div className="col-12 col-md-3 d-flex align-items-end">
          <button
            className="btn w-100"
            style={{ backgroundColor: '#3daaaaff', color: '#fff' }}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <h5 className="fw-bold mb-0">Sales Report</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-light">
              <FaFilePdf className="text-danger" />
            </button>
            <button className="btn btn-light">
              <FaFileExcel className="text-success" />
            </button>
            <button className="btn btn-light">
              <BsGear />
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>SKU</th>
                <th>Customer Name</th>
                <th>Customer Name (Arabic)</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Sold Qty</th>
                <th>Sold Amount</th>
                <th>Instock Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <tr key={i}>
                    <td>{row.sku}</td>
                    <td>{row.customerName}</td>
                    <td className="text-end" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {row.customerNameArabic}
                    </td>
                    <td>{row.productName}</td>
                    <td>{row.category}</td>
                    <td>{row.soldQty}</td>
                    <td>{row.soldAmount}</td>
                    <td>{row.instockQty}</td>
                    <td>
                      <span
                        role="button"
                        onClick={() => cycleStatus(i)}
                        className={`badge ${row.status === "Paid"
                            ? "bg-success"
                            : row.status === "Pending"
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                        style={{ cursor: "pointer" }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3 px-3">
            <span className="small text-muted">
              Showing 1 to 3 of 3 results
            </span>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <button className="page-link rounded-start">&laquo;</button>
                </li>
                <li className="page-item active">
                  <button
                    className="page-link"
                    style={{ backgroundColor: '#3daaaaff', borderColor: '#3daaaaff' }}
                  >
                    1
                  </button>
                </li>
                <li className="page-item">
                  <button className="page-link">2</button>
                </li>
                <li className="page-item">
                  <button className="page-link rounded-end">&raquo;</button>
                </li>
              </ul>
            </nav>
          </div>

        </div>
      </div>
      {/* Page Description */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
            <li>Generate and manage detailed sales reports across stores and products.</li>
            <li>Filter reports by date, store, and product for precise insights.</li>
            <li>View key sales metrics: total amount, paid, unpaid, and overdue.</li>
            <li>Export reports in PDF or Excel format for offline use or sharing.</li>
            <li>Analyze product-wise performance including sold quantity and revenue.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Salesreport;