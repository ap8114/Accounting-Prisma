import React from "react";
import { Container, Row, Col, Card ,Button} from "react-bootstrap";
import { Link } from "react-router-dom";
const BalanceSheet = () => (
  <div style={{ background: "#f0f2f5", minHeight: "100vh", paddingBottom: 40 }}>
    <Container fluid className="py-4">
      <div className="text-center mb-2" style={{ fontSize: 36, color: "#002d4d", fontWeight: 500 }}>
        Balance Sheet
      </div>
      <div className="text-center mb-4" style={{ color: "#6c757d", fontSize: 18 }}>
        As on 8 July 2025
      </div>

      <Row className="g-4 justify-content-center">
{/* Assets */}
<Col xs={12} md={6}>
  <Card style={{ borderRadius: 12, backgroundColor: "#fff", border: "1px solid #dee2e6" }}>
    <Card.Body>
    <Row className="align-items-center mb-3">
  {/* Left: ASSETS Heading */}
  <Col xs={6} style={{ fontWeight: 500, fontSize: 24, color: "#000" }}>
    ASSETS
  </Col>

{/* Right: View Details Button */}
<Col xs={6} className="text-end">
  <Link to="/company/balancesheet/asstedetails" style={{ textDecoration: "none" }}>
    <Button
      variant="primary"
      size="sm"  
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
     View All Asset Details
    </Button>
  </Link>
</Col>
</Row>
      <div style={{ color: "#002d4d", fontWeight: 400, fontSize: 16, marginBottom: 8 }}>
        Current Assets
      </div>
      {[
        ["Cash", "$75,000"],
        ["Bank", "$245,000"],
        ["Stock", "$320,000"],
        ["Accounts Receivable", "$185,000"],
        ["Total Current Assets", "$825,000", true],
      ].map(([label, value, isTotal], idx) => (
        <Row className="mb-2" key={idx}>
          <Col xs={7} style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500, color: isTotal ? "#000" : "#6c757d" }}>
            {label}
          </Col>
          <Col xs={5} className="text-end" style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500 }}>
            {value}
          </Col>
        </Row>
      ))}

      <div style={{ color: "#002d4d", fontWeight: 500, fontSize: 16, marginTop: 24, marginBottom: 8 }}>
        Fixed Assets
      </div>
      {[
        ["Land & Building", "$1,250,000"],
        ["Plant & Machinery", "$875,000"],
        ["Furniture & Fixtures", "$150,000"],
        ["Total Fixed Assets", "$2,275,000", true],
      ].map(([label, value, isTotal], idx) => (
        <Row className="mb-2" key={idx}>
          <Col xs={7} style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500, color: isTotal ? "#000" : "#6c757d" }}>
            {label}
          </Col>
          <Col xs={5} className="text-end" style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500 }}>
            {value}
          </Col>
        </Row>
      ))}

      <hr className="my-3" />
      <Row>
        <Col xs={7} style={{ fontWeight: 600, fontSize: 18 }}>Total Assets</Col>
        <Col xs={5} className="text-end" style={{ fontWeight: 600, fontSize: 18 }}>$3,100,000</Col>
      </Row>
    </Card.Body>
  </Card>


</Col>

        {/* Liabilities & Capital */}
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: 12, backgroundColor: "#fff", border: "1px solid #dee2e6" }}>
            <Card.Body>
            <Row className="align-items-center mb-3">
        {/* Left: LIABILITIES & CAPITAL Heading */}
        <Col xs={6} style={{ fontWeight: 500, fontSize: 24, color: "#000" }}>
          LIABILITIES & CAPITAL
        </Col>

        {/* Right: View Details Button */}
        <Col xs={6} className="text-end">
          <Link to="/company/balancesheet/liabilitydetails" style={{ textDecoration: "none" }}>
            <Button
              variant="primary"
              size="sm"
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
              View All Liability Details
            </Button>
          </Link>
        </Col>
      </Row>

              <div style={{ color: "#002d4d", fontWeight: 500, fontSize: 16, marginBottom: 8 }}>
                Current Liabilities
              </div>
              {[
                ["Accounts Payable", "$235,000"],
                ["Short-term Loans", "$125,000"],
                ["Outstanding Expenses", "$45,000"],
                ["Total Current Liabilities", "$405,000", true],
              ].map(([label, value, isTotal], idx) => (
                <Row className="mb-2" key={idx}>
                  <Col xs={7} style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500, color: isTotal ? "#000" : "#6c757d" }}>{label}</Col>
                  <Col xs={5} className="text-end" style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500 }}>{value}</Col>
                </Row>
              ))}

              <div style={{ color: "#002d4d", fontWeight: 600, fontSize: 16, marginTop: 24, marginBottom: 8 }}>
                Long-term Liabilities
              </div>
              {[
                ["Term Loan", "$750,000"],
                ["Mortgage Loan", "$425,000"],
                ["Total Long-term Liabilities", "$1,175,000", true],
              ].map(([label, value, isTotal], idx) => (
                <Row className="mb-2" key={idx}>
                  <Col xs={7} style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500, color: isTotal ? "#000" : "#6c757d" }}>{label}</Col>
                  <Col xs={5} className="text-end" style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500 }}>{value}</Col>
                </Row>
              ))}

              <div style={{ color: "#002d4d", fontWeight: 500, fontSize: 16, marginTop: 24, marginBottom: 8 }}>
                Owner’s Capital
              </div>
              {[
                ["Capital", "$1,000,000"],
                ["Retained Earnings", "$520,000"],
                ["Total Owner’s Capital", "$1,520,000", true],
              ].map(([label, value, isTotal], idx) => (
                <Row className="mb-2" key={idx}>
                  <Col xs={7} style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500, color: isTotal ? "#000" : "#6c757d" }}>{label}</Col>
                  <Col xs={5} className="text-end" style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500 }}>{value}</Col>
                </Row>
              ))}

              <hr className="my-3" />
              <Row>
                <Col xs={7} style={{ fontWeight: 500, fontSize: 18 }}>Total Liabilities & Capital</Col>
                <Col xs={5} className="text-end" style={{ fontWeight: 600, fontSize: 18 }}>$3,100,000</Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    <small className="text-dark">
    Balance Sheet shows your business’s financial position on a specific date by listing all assets, liabilities, and owner’s capital, ensuring that Assets = Liabilities + Capital.    </small>
  </div>
);

export default BalanceSheet;
