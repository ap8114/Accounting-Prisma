// components/AssetDetails.js
import React, { useState } from "react";
import { Container, Card, Button, Table, Badge, Form, Row, Col } from "react-bootstrap";

const allAssetDetails = {
  cash: {
    title: "Cash Inflows",
    data: [
      { customer: "ABC Traders", amount: "$15,000", date: "2025-07-01", mode: "Cash" },
      { customer: "Retail Shop", amount: "$22,000", date: "2025-07-03", mode: "Cash" },
      { customer: "John Doe", amount: "$38,000", date: "2025-07-05", mode: "Cash" },
    ],
  },
  bank: {
    title: "Bank Transactions",
    data: [
      { customer: "TechCorp", amount: "$85,000", date: "2025-07-02", ref: "NEFT-8890", bank: "HDFC" },
      { customer: "Global Ltd", amount: "$60,000", date: "2025-07-04", ref: "IMPS-1234", bank: "SBI" },
      { customer: "Innovate Inc", amount: "$100,000", date: "2025-07-06", ref: "RTGS-5678", bank: "Axis" },
    ],
  },
  stock: {
    title: "Inventory Details",
    data: [
      { product: "Laptops", qty: 50, value: "$150,000", category: "Electronics" },
      { product: "Chairs", qty: 200, value: "$70,000", category: "Furniture" },
      { product: "Cables", qty: 1000, value: "$100,000", category: "Accessories" },
    ],
  },
  receivable: {
    title: "Outstanding Receivables",
    data: [
      { customer: "FutureTech", amount: "$95,000", due: "2025-07-15", status: "Overdue" },
      { customer: "Smart Solutions", amount: "$90,000", due: "2025-07-20", status: "Pending" },
    ],
  },
};

// 💡 फंक्शन: अमाउंट को नंबर में बदलें और जोड़ें
const calculateTotal = (data, valueKey = "amount") => {
  return data.reduce((sum, item) => {
    const num = parseFloat(item[valueKey].replace(/[$,]/g, "")) || 0;
    return sum + num;
  }, 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const AssetDetails = () => {
  // 🔍 फ़िल्टर स्टेट्स
  const [cashFilter, setCashFilter] = useState({ customer: "", date: "" });
  const [bankFilter, setBankFilter] = useState({ customer: "", bank: "", date: "" });
  const [stockFilter, setStockFilter] = useState({ product: "", category: "" });
  const [receivableFilter, setReceivableFilter] = useState({ customer: "", status: "", due: "" });

  // 🔎 फ़िल्टर्ड डेटा
  const filteredCash = allAssetDetails.cash.data.filter((item) => {
    return (
      item.customer.toLowerCase().includes(cashFilter.customer.toLowerCase()) &&
      (!cashFilter.date || item.date === cashFilter.date)
    );
  });

  const filteredBank = allAssetDetails.bank.data.filter((item) => {
    return (
      item.customer.toLowerCase().includes(bankFilter.customer.toLowerCase()) &&
      item.bank.toLowerCase().includes(bankFilter.bank.toLowerCase()) &&
      (!bankFilter.date || item.date === bankFilter.date)
    );
  });

  const filteredStock = allAssetDetails.stock.data.filter((item) => {
    return (
      item.product.toLowerCase().includes(stockFilter.product.toLowerCase()) &&
      item.category.toLowerCase().includes(stockFilter.category.toLowerCase())
    );
  });

  const filteredReceivable = allAssetDetails.receivable.data.filter((item) => {
    return (
      item.customer.toLowerCase().includes(receivableFilter.customer.toLowerCase()) &&
      (!receivableFilter.status || item.status === receivableFilter.status) &&
      (!receivableFilter.due || item.due === receivableFilter.due)
    );
  });

  // 🧮 टोटल्स
  const totalCash = calculateTotal(filteredCash, "amount");
  const totalBank = calculateTotal(filteredBank, "amount");
  const totalStock = calculateTotal(filteredStock, "value");
  const totalReceivable = calculateTotal(filteredReceivable, "amount");

  const grandTotal = (
    parseFloat(totalCash.replace(/[$,]/g, "")) +
    parseFloat(totalBank.replace(/[$,]/g, "")) +
    parseFloat(totalStock.replace(/[$,]/g, "")) +
    parseFloat(totalReceivable.replace(/[$,]/g, ""))
  ).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <Container className="py-5">
      <Row className="align-items-center mb-4">
  {/* Left: Heading */}
  <Col xs={6} className="text-start">
    <h3 className="mb-0" style={{ color: "#002d4d" }}>
      📊 All Asset Details
    </h3>
  </Col>

  {/* Right: Back Button */}
  <Col xs={6} className="text-end">
    <Button
      variant="secondary"
      onClick={() => window.history.back()}
      style={{
        backgroundColor: "#53b2a5",
        borderColor: "#53b2a5",
        padding: "6px 12px",
        fontSize: "14px",
        fontWeight: 500,
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      ← Back to Balance Sheet
    </Button>
  </Col>
</Row>

      {/* Cash */}
      <Card className="mb-4">
        <Card.Header bg="success" text="white">
          <strong>{allAssetDetails.cash.title}</strong>
        </Card.Header>
        <Card.Body>
          {/* Cash Filters */}
          <Row className="mb-3 g-2">
            <Col xs={12} md={5}>
              <Form.Control
                type="text"
                placeholder="Search Customer"
                value={cashFilter.customer}
                onChange={(e) => setCashFilter({ ...cashFilter, customer: e.target.value })}
              />
            </Col>
            <Col xs={12} md={5}>
              <Form.Control
                type="date"
                value={cashFilter.date}
                onChange={(e) => setCashFilter({ ...cashFilter, date: e.target.value })}
              />
            </Col>
            <Col xs={12} md={2}>
              <Button variant="outline-secondary" size="sm" onClick={() => setCashFilter({ customer: "", date: "" })}>
                Clear
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {filteredCash.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.customer}</td>
                    <td>{row.amount}</td>
                    <td>{row.date}</td>
                    <td>{row.mode}</td>
                  </tr>
                ))}
                <tr className="table-light font-weight-bold">
                  <td colSpan="1"><strong>Total</strong></td>
                  <td colSpan="3" className="text-end"><strong>{totalCash}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Bank */}
      <Card className="mb-4">
        <Card.Header bg="primary" text="white">
          <strong>{allAssetDetails.bank.title}</strong>
        </Card.Header>
        <Card.Body>
          {/* Bank Filters */}
          <Row className="mb-3 g-2">
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Customer"
                value={bankFilter.customer}
                onChange={(e) => setBankFilter({ ...bankFilter, customer: e.target.value })}
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Bank"
                value={bankFilter.bank}
                onChange={(e) => setBankFilter({ ...bankFilter, bank: e.target.value })}
              />
            </Col>
            <Col xs={12} md={3}>
              <Form.Control
                type="date"
                value={bankFilter.date}
                onChange={(e) => setBankFilter({ ...bankFilter, date: e.target.value })}
              />
            </Col>
            <Col xs={12} md={1}>
              <Button variant="outline-secondary" size="sm" onClick={() => setBankFilter({ customer: "", bank: "", date: "" })}>
                🗑️
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Ref</th>
                  <th>Bank</th>
                </tr>
              </thead>
              <tbody>
                {filteredBank.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.customer}</td>
                    <td>{row.amount}</td>
                    <td>{row.date}</td>
                    <td>{row.ref}</td>
                    <td>{row.bank}</td>
                  </tr>
                ))}
                <tr className="table-light font-weight-bold">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td colSpan="3" className="text-end"><strong>{totalBank}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Stock */}
      <Card className="mb-4">
        <Card.Header bg="info" text="white">
          <strong>{allAssetDetails.stock.title}</strong>
        </Card.Header>
        <Card.Body>
          {/* Stock Filters */}
          <Row className="mb-3 g-2">
            <Col xs={12} md={6}>
              <Form.Control
                type="text"
                placeholder="Search Product"
                value={stockFilter.product}
                onChange={(e) => setStockFilter({ ...stockFilter, product: e.target.value })}
              />
            </Col>
            <Col xs={12} md={5}>
              <Form.Control
                as="select"
                value={stockFilter.category}
                onChange={(e) => setStockFilter({ ...stockFilter, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Accessories">Accessories</option>
              </Form.Control>
            </Col>
            <Col xs={12} md={1}>
              <Button variant="outline-secondary" size="sm" onClick={() => setStockFilter({ product: "", category: "" })}>
                🗑️
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Value</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.product}</td>
                    <td>{row.qty}</td>
                    <td>{row.value}</td>
                    <td>{row.category}</td>
                  </tr>
                ))}
                <tr className="table-light font-weight-bold">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td colSpan="2" className="text-end"><strong>{totalStock}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Receivables */}
      <Card className="mb-4">
        <Card.Header bg="warning" text="dark">
          <strong>{allAssetDetails.receivable.title}</strong>
        </Card.Header>
        <Card.Body>
          {/* Receivable Filters */}
          <Row className="mb-3 g-2">
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Customer"
                value={receivableFilter.customer}
                onChange={(e) => setReceivableFilter({ ...receivableFilter, customer: e.target.value })}
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Control
                as="select"
                value={receivableFilter.status}
                onChange={(e) => setReceivableFilter({ ...receivableFilter, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="Overdue">Overdue</option>
                <option value="Pending">Pending</option>
              </Form.Control>
            </Col>
            <Col xs={12} md={3}>
              <Form.Control
                type="date"
                value={receivableFilter.due}
                onChange={(e) => setReceivableFilter({ ...receivableFilter, due: e.target.value })}
              />
            </Col>
            <Col xs={12} md={1}>
              <Button variant="outline-secondary" size="sm" onClick={() => setReceivableFilter({ customer: "", status: "", due: "" })}>
                🗑️
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceivable.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.customer}</td>
                    <td>{row.amount}</td>
                    <td>{row.due}</td>
                    <td>
                      <Badge bg={row.status === "Overdue" ? "danger" : "warning"}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                <tr className="table-light font-weight-bold">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td colSpan="2" className="text-end"><strong>{totalReceivable}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* 🏁 Grand Total */}
      <Card  text="white" className="text-center p-3 mb-4">
        <h5>
          Grand Total of All Assets: <strong>{grandTotal}</strong>
        </h5>
      </Card>
    </Container>
  );
};

export default AssetDetails;