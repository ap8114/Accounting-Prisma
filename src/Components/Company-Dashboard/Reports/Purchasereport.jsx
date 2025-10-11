import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { BsGear } from "react-icons/bs";
import { Card } from "react-bootstrap";
import { BiSolidReport, BiSolidDollarCircle } from "react-icons/bi";

const Purchasereport = () => {
  // 🔹 Make table data stateful
  const [tableData, setTableData] = useState([
    {
      po: "PO001",
      vendor: "TechSupply Inc.",
      vendorArabic: "تيك سपلاي إنك.", // TechSupply Inc. in Arabic style
      product: "Lenovo IdeaPad 3",
      category: "Computers",
      qty: 50,
      unitPrice: "$600",
      total: "$30,000",
      status: "Paid",
    },
    {
      po: "PO002",
      vendor: "Global Electronics",
      vendorArabic: "جلوبال إليكترونيكس", // Global Electronics in Arabic
      product: "Beats Pro",
      category: "Electronics",
      qty: 100,
      unitPrice: "$160",
      total: "$16,000",
      status: "Pending",
    },
    {
      po: "PO003",
      vendor: "Fashion Imports",
      vendorArabic: "فاشن إم्पोर्टس", // Fashion Imports in Arabic
      product: "Nike Jordan",
      category: "Shoes",
      qty: 200,
      unitPrice: "$110",
      total: "$22,000",
      status: "Overdue",
    },
  ]);

  // 🔹 Search states
  const [vendorSearch, setVendorSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  

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

  // 🔹 Apply filters
  const filteredData = tableData.filter((row) => {
    return (
      row.vendor.toLowerCase().includes(vendorSearch.toLowerCase()) &&
      row.category.toLowerCase().includes(categorySearch.toLowerCase())
    );
  });

  return (
    <div className="container my-4">
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-success d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Total Purchase</small>
              <h5 className="fw-bold">$3,25,000</h5>
            </div>
            <BiSolidDollarCircle size={28} color="#4CAF50" />
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-primary d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Paid Amount</small>
              <h5 className="fw-bold">$1,85,000</h5>
            </div>
            <BiSolidDollarCircle size={28} color="#1A73E8" />
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-warning d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Pending Payment</small>
              <h5 className="fw-bold">$1,40,000</h5>
            </div>
            <BiSolidDollarCircle size={28} color="#EF6C00" />
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-danger d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Overdue</small>
              <h5 className="fw-bold">$45,000</h5>
            </div>
            <BiSolidReport size={28} color="#D32F2F" />
          </div>
        </div>
      </div>
      {/* Filters (unchanged) */}
      <div className="bg-white p-3 rounded mb-3 shadow-sm row g-3">
        <div className="col-12 col-md-3">
          <label className="form-label">Choose Date</label>
          <input type="date" className="form-control" />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Search Vendor</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search Vendor..."
            value={vendorSearch}
            onChange={(e) => setVendorSearch(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Search Category</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search Category..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-3 d-flex align-items-end">
          <button
            className="btn w-100"
            style={{ backgroundColor: "#3daaaaff", color: "#fff" }}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>PO #</th>
                <th>Vendor</th>
                <th>Vendor (Arabic)</th>
                <th>Product</th>
                <th>Category</th>
                <th>Qty Ordered</th>
                <th>Unit Price</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <tr key={i}>
                    <td>{row.po}</td>
                    <td>{row.vendor}</td>
                    <td
        className="text-end"
        style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}
      >
        {row.vendorArabic}
      </td> {/* Arabic Vendor Name */}
                    <td>{row.product}</td>
                    <td>{row.category}</td>
                    <td>{row.qty}</td>
                    <td>{row.unitPrice}</td>
                    <td>{row.total}</td>
                    <td>
                      <span
                        role="button"
                        onClick={() => cycleStatus(i)}
                        className={`badge ${
                          row.status === "Paid"
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
                  <td colSpan="8" className="text-center text-muted">
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Purchasereport;
