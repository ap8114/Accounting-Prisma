import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TaxReport = () => {
  const [activeTab, setActiveTab] = useState("purchase");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;

  // Vendors with Arabic names
  const suppliers = [
    "All",
    { name: "A-Z Store", arabic: "إيه-زد ستور" },
    { name: "Apex Computers", arabic: "أبيكس كمبيوترز" },
    { name: "Sigma Chairs", arabic: "سيجما شيرز" },
    { name: "Beats Headphones", arabic: "بيتس هيدفونز" },
    { name: "Aesthetic Bags", arabic: "إيستيتكي باجس" },
    { name: "Hatimi Hardwares", arabic: "حاتمي هاردويرز" },
  ];

  // Customers with Arabic names
  const customers = [
    "All",
    { name: "Mark Joslyn", arabic: "مارك جوسلين" },
    { name: "Carl Evans", arabic: "كارل إيفانز" },
    { name: "Richard Fralick", arabic: "ريتشارد فراليك" },
    { name: "Minerva Rameriz", arabic: "مينيرفا راميريز" },
    { name: "Daniel Jude", arabic: "دانيال جود" },
    { name: "Marsha Betts", arabic: "مارشا بيتز" },
  ];

  const payments = ["All", "Cash", "Stripe", "Paypal"];

  // Updated Purchase Data (as array of objects)
  const purchaseData = [
    {
      reference: "#4237022",
      vendor: "A-Z Store",
      vendorArabic: "إيه-زد ستور",
      date: "06 Nov 2024",
      amount: "$700",
      payment: "Cash",
      discount: "$700",
      tax: "$700",
    },
    {
      reference: "#4237300",
      vendor: "Apex Computers",
      vendorArabic: "أبيكس كمبيوترز",
      date: "24 Dec 2024",
      amount: "$200",
      payment: "Stripe",
      discount: "$200",
      tax: "$200",
    },
    {
      reference: "#7590321",
      vendor: "Sigma Chairs",
      vendorArabic: "سيجما شيرز",
      date: "20 Sep 2024",
      amount: "$450",
      payment: "Stripe",
      discount: "$450",
      tax: "$450",
    },
    {
      reference: "#7590325",
      vendor: "Beats Headphones",
      vendorArabic: "بيتس هيدفونز",
      date: "10 Dec 2024",
      amount: "$50",
      payment: "Paypal",
      discount: "$50",
      tax: "$50",
    },
    {
      reference: "#7590365",
      vendor: "Aesthetic Bags",
      vendorArabic: "إيستيتكي باجس",
      date: "14 Oct 2024",
      amount: "$1200",
      payment: "Paypal",
      discount: "$1200",
      tax: "$1200",
    },
    {
      reference: "#8744439",
      vendor: "Hatimi Hardwares",
      vendorArabic: "حاتمي هاردويرز",
      date: "25 Oct 2024",
      amount: "$1000",
      payment: "Cash",
      discount: "$1000",
      tax: "$1000",
    },
  ];

  // Updated Sales Data (as array of objects)
  const salesData = [
    {
      reference: "#4237022",
      customer: "Mark Joslyn",
      customerArabic: "مارك جوسلين",
      date: "06 Nov 2024",
      amount: "$700",
      payment: "Cash",
      discount: "$700",
      tax: "$700",
    },
    {
      reference: "#4237300",
      customer: "Carl Evans",
      customerArabic: "كارل إيفانز",
      date: "24 Dec 2024",
      amount: "$200",
      payment: "Stripe",
      discount: "$200",
      tax: "$200",
    },
    {
      reference: "#7590321",
      customer: "Richard Fralick",
      customerArabic: "ريتشارد فراليك",
      date: "20 Sep 2024",
      amount: "$450",
      payment: "Stripe",
      discount: "$450",
      tax: "$450",
    },
    {
      reference: "#7590325",
      customer: "Minerva Rameriz",
      customerArabic: "مينيرفا راميريز",
      date: "10 Dec 2024",
      amount: "$50",
      payment: "Paypal",
      discount: "$50",
      tax: "$50",
    },
    {
      reference: "#7590365",
      customer: "Daniel Jude",
      customerArabic: "دانيال جود",
      date: "14 Oct 2024",
      amount: "$1200",
      payment: "Paypal",
      discount: "$1200",
      tax: "$1200",
    },
    {
      reference: "#8744439",
      customer: "Marsha Betts",
      customerArabic: "مارشا بيتز",
      date: "25 Oct 2024",
      amount: "$1000",
      payment: "Cash",
      discount: "$1000",
      tax: "$1000",
    },
  ];

  const renderFilterSection = (type) => (
    <Card className="p-3 rounded-4 mb-3 border">
      <Row className="g-3 align-items-center">
        <Col md={3}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-semibold mb-1">Choose Date</Form.Label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              className="form-control"
              dateFormat="dd/MM/yyyy"
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-semibold mb-1">
              {type === "purchase" ? "Vendor" : "Customer"}
            </Form.Label>
            <Form.Select>
              {(type === "purchase" ? suppliers : customers).map((item, i) => {
                const name = typeof item === "string" ? item : item.name;
                return (
                  <option key={i} value={name}>
                    {name}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-semibold mb-1">Payment Method</Form.Label>
            <Form.Select>
              {payments.map((p, i) => (
                <option key={i}>{p}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3} className="d-flex align-items-end">
          <Button
            className="w-100"
            style={{ backgroundColor: "#53b2a5", border: "none" }}
          >
            Generate Report
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const renderTable = (type) => (
    <Card className="rounded-4 p-4 border">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">
          {type === "purchase" ? "Purchase Tax Report" : "Sales Tax Report"}
        </h5>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" size="sm">
            <FaFilePdf />
          </Button>
          <Button variant="outline-success" size="sm">
            <FaFileExcel />
          </Button>
        </div>
      </div>

      {renderFilterSection(type)}

      <Table hover responsive className="mb-0 border">
        <thead className="bg-light text-dark fw-semibold">
          <tr>
            <th>Reference</th>
            <th>{type === "purchase" ? "Vendor" : "Customer"}</th>
            <th>{type === "purchase" ? "Vendor (Arabic)" : "Customer (Arabic)"}</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Discount</th>
            <th>Tax Amount</th>
          </tr>
        </thead>
        <tbody>
          {(type === "purchase" ? purchaseData : salesData).map((row, idx) => (
            <tr key={idx}>
              <td>{row.reference}</td>
              <td>{type === "purchase" ? row.vendor : row.customer}</td>
              <td
                className="text-end"
                style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}
              >
                {type === "purchase" ? row.vendorArabic : row.customerArabic}
              </td>
              <td>{row.date}</td>
              <td>{row.amount}</td>
              <td>{row.payment}</td>
              <td>{row.discount}</td>
              <td>{row.tax}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
        <span className="small text-muted">
          Showing 1 to 6 of 6 results
        </span>
        <nav>
          <ul className="pagination pagination-sm mb-0 flex-wrap">
            <li className="page-item disabled">
              <button className="page-link rounded-start">&laquo;</button>
            </li>
            <li className="page-item active">
              <button
                className="page-link"
                style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa', color: '#fff' }}
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
    </Card>
  );

  return (
    <div className="p-4 mt-4">
      {/* Tab Buttons */}
      <div className="d-flex gap-2 mb-3">
        <Button
          style={{
            backgroundColor: activeTab === "purchase" ? "#53b2a5" : "transparent",
            border: activeTab === "purchase" ? "none" : "1px solid #ccc",
            color: activeTab === "purchase" ? "#fff" : "#333",
          }}
          onClick={() => setActiveTab("purchase")}
        >
          Purchase Tax
        </Button>

        <Button
          style={{
            backgroundColor: activeTab === "sales" ? "#53b2a5" : "transparent",
            border: activeTab === "sales" ? "none" : "1px solid #ccc",
            color: activeTab === "sales" ? "#fff" : "#333",
          }}
          onClick={() => setActiveTab("sales")}
        >
          Sales Tax
        </Button>
      </div>


      {/* Render Table */}
      {renderTable(activeTab)}
    </div>
  );
};

export default TaxReport;