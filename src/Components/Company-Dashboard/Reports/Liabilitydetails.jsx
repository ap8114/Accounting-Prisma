// components/LiabilityDetails.js
import React, { useState } from "react";
import {
  Container,
  Card,
  Button,
  Table,
  Badge,
  Form,
  Row,
  Col,
} from "react-bootstrap";

const allLiabilityDetails = {
  current: {
    title: "Current Liabilities",
    data: [
      { supplier: "Alpha Supplies", amount: "$235,000", due: "2025-07-10", status: "Pending" },
      { supplier: "QuickFin Loans", amount: "$125,000", due: "2025-08-01", status: "Active" },
      { expense: "Electricity Bill", amount: "$45,000", due: "2025-07-05", status: "Overdue" },
    ],
  },
  longTerm: {
    title: "Long-term Liabilities",
    data: [
      { loan: "Business Term Loan", amount: "$750,000", rate: "8.5%", maturity: "2030" },
      { loan: "Mortgage Loan", amount: "$425,000", rate: "7.2%", maturity: "2035" },
    ],
  },
  capital: {
    title: "Owner’s Capital",
    data: [
      { owner: "Rajesh Kumar", capital: "$1,000,000", type: "Initial Investment" },
      { owner: "Retained Earnings", capital: "$520,000", type: "Accumulated Profits" },
    ],
  },
};

// 💡 Reuse the same total calculation function
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

const LiabilityDetails = () => {
  // 🔍 Filters
  const [currentFilter, setCurrentFilter] = useState({ supplier: "", status: "", due: "" });
  const [longTermFilter, setLongTermFilter] = useState({ loan: "", maturity: "" });
  const [capitalFilter, setCapitalFilter] = useState({ owner: "", type: "" });

  // 🔎 Filtered Data
  const filteredCurrent = allLiabilityDetails.current.data.filter((item) => {
    const supplier = item.supplier || item.expense || "";
    return (
      supplier.toLowerCase().includes(currentFilter.supplier.toLowerCase()) &&
      (!currentFilter.status || item.status === currentFilter.status) &&
      (!currentFilter.due || item.due === currentFilter.due)
    );
  });

  const filteredLongTerm = allLiabilityDetails.longTerm.data.filter((item) => {
    return (
      item.loan.toLowerCase().includes(longTermFilter.loan.toLowerCase()) &&
      (!longTermFilter.maturity || item.maturity === longTermFilter.maturity)
    );
  });

  const filteredCapital = allLiabilityDetails.capital.data.filter((item) => {
    return (
      item.owner.toLowerCase().includes(capitalFilter.owner.toLowerCase()) &&
      item.type.toLowerCase().includes(capitalFilter.type.toLowerCase())
    );
  });

  // 🧮 Totals
  const totalCurrent = calculateTotal(filteredCurrent, "amount");
  const totalLongTerm = calculateTotal(filteredLongTerm, "amount");
  const totalCapital = calculateTotal(filteredCapital, "capital");

  const grandTotal = (
    parseFloat(totalCurrent.replace(/[$,]/g, "")) +
    parseFloat(totalLongTerm.replace(/[$,]/g, "")) +
    parseFloat(totalCapital.replace(/[$,]/g, ""))
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
            📉 All Liability & Capital Details
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

      {/* Current Liabilities */}
      <Card className="mb-4">
        <Card.Header bg="danger" text="white">
          <strong>{allLiabilityDetails.current.title}</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Supplier/Expense"
                value={currentFilter.supplier}
                onChange={(e) =>
                  setCurrentFilter({ ...currentFilter, supplier: e.target.value })
                }
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Control
                as="select"
                value={currentFilter.status}
                onChange={(e) =>
                  setCurrentFilter({ ...currentFilter, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Paid">Paid</option>
              </Form.Control>
            </Col>
            <Col xs={12} md={3}>
              <Form.Control
                type="date"
                value={currentFilter.due}
                onChange={(e) =>
                  setCurrentFilter({ ...currentFilter, due: e.target.value })
                }
              />
            </Col>
            <Col xs={12} md={1}>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() =>
                  setCurrentFilter({ supplier: "", status: "", due: "" })
                }
              >
                🗑️
              </Button>
            </Col>
          </Row>
          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Supplier / Expense</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCurrent.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.supplier || row.expense}</td>
                    <td>{row.amount}</td>
                    <td>{row.due || "-"}</td>
                    <td>
                      <Badge bg={row.status === "Overdue" ? "danger" : row.status === "Pending" ? "warning" : "success"}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                <tr className="table-light font-weight-bold">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td colSpan="2" className="text-end"><strong>{totalCurrent}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Long-term Liabilities */}
      <Card className="mb-4">
        <Card.Header bg="secondary" text="white">
          <strong>{allLiabilityDetails.longTerm.title}</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs={12} md={6}>
              <Form.Control
                type="text"
                placeholder="Loan Type"
                value={longTermFilter.loan}
                onChange={(e) =>
                  setLongTermFilter({ ...longTermFilter, loan: e.target.value })
                }
              />
            </Col>
            <Col xs={12} md={5}>
              <Form.Control
                as="select"
                value={longTermFilter.maturity}
                onChange={(e) =>
                  setLongTermFilter({ ...longTermFilter, maturity: e.target.value })
                }
              >
                <option value="">All Years</option>
                <option value="2030">2030</option>
                <option value="2035">2035</option>
              </Form.Control>
            </Col>
            <Col xs={12} md={1}>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setLongTermFilter({ loan: "", maturity: "" })}
              >
                🗑️
              </Button>
            </Col>
          </Row>
          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Loan</th>
                  <th>Amount</th>
                  <th>Interest Rate</th>
                  <th>Maturity</th>
                </tr>
              </thead>
              <tbody>
                {filteredLongTerm.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.loan}</td>
                    <td>{row.amount}</td>
                    <td>{row.rate}</td>
                    <td>{row.maturity}</td>
                  </tr>
                ))}
                <tr className="table-light font-weight-bold">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td colSpan="2" className="text-end"><strong>{totalLongTerm}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Owner's Capital */}
      <Card className="mb-4">
        <Card.Header bg="success" text="white">
          <strong>{allLiabilityDetails.capital.title}</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs={12} md={6}>
              <Form.Control
                type="text"
                placeholder="Owner / Type"
                value={capitalFilter.owner}
                onChange={(e) =>
                  setCapitalFilter({ ...capitalFilter, owner: e.target.value })
                }
              />
            </Col>
            <Col xs={12} md={5}>
              <Form.Control
                as="select"
                value={capitalFilter.type}
                onChange={(e) =>
                  setCapitalFilter({ ...capitalFilter, type: e.target.value })
                }
              >
                <option value="">All Types</option>
                <option value="Initial Investment">Initial Investment</option>
                <option value="Accumulated Profits">Accumulated Profits</option>
              </Form.Control>
            </Col>
            <Col xs={12} md={1}>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setCapitalFilter({ owner: "", type: "" })}
              >
                🗑️
              </Button>
            </Col>
          </Row>
          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Owner / Source</th>
                  <th>Capital</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredCapital.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.owner}</td>
                    <td>{row.capital}</td>
                    <td>{row.type}</td>
                  </tr>
                ))}
                <tr className="table-light font-weight-bold">
                  <td colSpan="1"><strong>Total</strong></td>
                  <td colSpan="2" className="text-end"><strong>{totalCapital}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* 🏁 Grand Total */}
      <Card text="white" className="text-center p-3 mb-4">
        <h5>
          Grand Total of Liabilities & Capital: <strong>{grandTotal}</strong>
        </h5>
      </Card>
    </Container>
  );
};

export default LiabilityDetails;