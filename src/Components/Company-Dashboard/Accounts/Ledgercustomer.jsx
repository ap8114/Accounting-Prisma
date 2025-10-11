import React, { useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaFilter, FaCalendarAlt, FaSearch, FaUndo, FaFileExport, FaFilePdf, FaUser,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTruck,
  FaGlobeAsia,
  FaFlag,
  FaHashtag,
  FaFileInvoice,
  FaWallet,
} from "react-icons/fa";
import { Button, Card, Row, Col, Form, InputGroup, Table, Badge } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const Ledgercustomer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedCustomer = location.state?.customer;

  // Dummy default customer (fallback)
  const defaultCustomer = {
    name: "Demo Customer",
    nameArabic: "",
    companyName: "ABC Traders",
    companyLocation: "https://maps.google.com/?q=Indore",
    accountName: "Accounts Receivable",
    accountBalance: 5000,
    creationDate: "2025-04-01",
    bankAccountNumber: "1234567890",
    bankIFSC: "HDFC0000001",
    bankName: "HDFC Bank, Indore Branch",
    country: "India",
    state: "Madhya Pradesh",
    pincode: "452001",
    address: "Indore, MP",
    stateCode: "MP-23",
    shippingAddress: "Same as above",
    phone: "9999999999",
    email: "demo@email.com",
    creditPeriod: "30",
    gst: "22AAAAA0000A1Z5",
    openingBalance: 5000,
  };

  // Use passed customer or fallback
  const customer = passedCustomer || defaultCustomer;

  const [ledgerType, setLedgerType] = useState("customer");
  const [fromDate, setFromDate] = useState("2025-04-01");
  const [toDate, setToDate] = useState("2025-04-30");
  const [balanceType, setBalanceType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("all");
  const [showNarration, setShowNarration] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showConfirmLetter, setShowConfirmLetter] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [showCountTable, setShowCountTable] = useState(false);

  // Voucher States
  const [manualVoucherNo, setManualVoucherNo] = useState("");
  const [autoVoucherNo] = useState("VCH-" + Date.now());

  // Dummy Data with Narration
  const ledgerData = [
    // Opening Balance
    {
      id: 1,
      date: "2025-04-01",
      particulars: "Opening Balance",
      narration: "Initial opening balance carried forward",
      voucherNo: "--",
      voucherType: "Opening",
      debit: customer.openingBalance > 0 ? customer.openingBalance : 0,
      credit: customer.openingBalance < 0 ? Math.abs(customer.openingBalance) : 0,
      items: [],
    },

    // Sales Invoice
    {
      id: 2,
      date: "2025-04-03",
      particulars: ledgerType === "customer" ? "Sales Invoice INV101" : "Purchase Invoice INV501",
      narration:
        ledgerType === "customer"
          ? "Goods sold on credit to Ravi Traders"
          : "Raw material purchased from Sharma Suppliers",
      voucherNo: "INV101",
      voucherType: "Invoice",
      debit: ledgerType === "customer" ? 10000 : 0,
      credit: ledgerType === "vendor" ? 12000 : 0,
      items: [
        {
          item: "SNB CH 58 LOT WHITE",
          quantity: "100.00 yds",
          rate: "0.400",
          discount: "0.000",
          tax: "0.000",
          taxAmt: "0.000",
          value: "40.00",
          description: "4 PCS",
        },
      ],
    },

    // Payment / Receipt
    {
      id: 3,
      date: "2025-04-07",
      particulars: "Payment / Receipt",
      narration:
        ledgerType === "customer"
          ? "Payment received against invoice INV101"
          : "Payment made for purchase",
      voucherNo: ledgerType === "customer" ? "RC001" : "PY001",
      voucherType: "Payment",
      debit: ledgerType === "vendor" ? 10000 : 0,
      credit: ledgerType === "customer" ? 5000 : 0,
      items: [],
    },

    // Return
    {
      id: 4,
      date: "2025-04-12",
      particulars: "Return",
      narration: "Returned damaged goods",
      voucherNo: ledgerType === "customer" ? "CN001" : "DN001",
      voucherType: "Return",
      debit: ledgerType === "vendor" ? 2000 : 0,
      credit: ledgerType === "customer" ? 1000 : 0,
      items: [
        {
          item: "SNB CH 58 LOT WHITE",
          quantity: "50.00 yds",
          rate: "0.400",
          discount: "0.000",
          tax: "0.000",
          taxAmt: "0.000",
          value: "20.00",
          description: "2 PCS",
        },
      ],
    },

    // Second Sales Invoice
    {
      id: 5,
      date: "2025-04-15",
      particulars: "Sales Invoice INV102",
      narration: "Second sale of cotton fabric",
      voucherNo: "INV102",
      voucherType: "Invoice",
      debit: 7500,
      credit: 0,
      items: [
        {
          item: "COTTON BLUE 600GSM",
          quantity: "250.00 mtrs",
          rate: "0.300",
          discount: "0.000",
          tax: "0.000",
          taxAmt: "0.000",
          value: "75.00",
          description: "10 ROLLS",
        },
      ],
    },

    // Partial Payment
    {
      id: 6,
      date: "2025-04-18",
      particulars: "Payment Received",
      narration: "Partial payment received",
      voucherNo: "RC002",
      voucherType: "Payment",
      debit: 0,
      credit: 3000,
      items: [],
    },
  ];

  // Filter and process data
  const filteredData = useMemo(() => {
    let filtered = [...ledgerData];

    let runningBalance = customer.openingBalance || 0;
    return filtered.map((e) => {
      runningBalance += (e.debit || 0) - (e.credit || 0);
      const balType = runningBalance >= 0 ? "Dr" : "Cr";
      return {
        ...e,
        balance: `${Math.abs(runningBalance).toLocaleString("en-IN", { style: "currency", currency: "INR" })} ${balType}`,
        balanceValue: runningBalance,
        balanceType: balType,
      };
    });
  }, [ledgerData, fromDate, toDate, balanceType, searchQuery, voucherTypeFilter, customer.openingBalance]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, e) => {
        acc.totalDebit += e.debit || 0;
        acc.totalCredit += e.credit || 0;
        return acc;
      },
      { totalDebit: 0, totalCredit: 0 }
    );
  }, [filteredData]);

  const currentBalance = useMemo(() => {
    return filteredData.length > 0 ? filteredData[filteredData.length - 1].balanceValue : 0;
  }, [filteredData]);

  const resetFilters = () => {
    setFromDate("2025-04-01");
    setToDate("2025-04-30");
    setBalanceType("all");
    setVoucherTypeFilter("all");
    setSearchQuery("");
  };

  const exportToExcel = () => alert("Export to Excel");
  const exportToPDF = () => alert("Export to PDF");

  const hasItems = filteredData.some((e) => e.items.length > 0);

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="container">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="d-flex align-items-center px-3 py-2"
            >
              <span className="me-1">←</span> Back to Customers
            </Button>
          </div>

          <h2 className="mb-0 text-center flex-grow-1">
            {ledgerType === "customer" ? `Customer Ledger - ${customer.name}` : "Vendor Ledger - Sharma Suppliers"}
          </h2>

          <div className="d-flex gap-2">
            <Button
              variant="light"
              size="sm"
              className="d-flex align-items-center px-3 py-2 shadow-sm border"
              onClick={exportToExcel}
            >
              <FaFileExport className="me-2" />
              <span className="small fw-medium">Excel</span>
            </Button>

            <Button
              variant="light"
              size="sm"
              className="d-flex align-items-center px-3 py-2 shadow-sm border"
              onClick={exportToPDF}
            >
              <FaFilePdf className="me-2" />
              <span className="small fw-medium">PDF</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="border-left-primary shadow h-100 py-2">
              <Card.Body>
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Debit</div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {totals.totalDebit.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="btn-circle btn-sm btn-primary">Dr</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-left-success shadow h-100 py-2">
              <Card.Body>
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Total Credit</div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {totals.totalCredit.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="btn-circle btn-sm btn-success">Cr</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className={`border-left-${currentBalance >= 0 ? "info" : "danger"} shadow h-100 py-2`}>
              <Card.Body>
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Current Balance</div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {Math.abs(currentBalance).toLocaleString("en-IN", { style: "currency", currency: "INR" })}{" "}
                      {currentBalance >= 0 ? (ledgerType === "customer" ? "Dr" : "Cr") : (ledgerType === "customer" ? "Cr" : "Dr")}
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className={`btn-circle btn-sm btn-${currentBalance >= 0 ? "info" : "danger"}`}>
                      {currentBalance >= 0 ? (ledgerType === "customer" ? "Dr" : "Cr") : (ledgerType === "customer" ? "Cr" : "Dr")}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap justify-content-start gap-2 mb-4 p-3">
          {/* Show Details */}
          <Button
            size="sm"
            className="py-1 px-3"
            style={{
              backgroundColor: showCustomerDetails ? "#53b2a5" : "#dafaf6ff",
              color: showCustomerDetails ? "white" : "black",
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "20px",
              border: "2px solid #53b2a5",
            }}
            onClick={() => setShowCustomerDetails(!showCustomerDetails)}
          >
            {showCustomerDetails ? "Hide Details" : "Show Details"}
          </Button>

          {/* Items Details */}
          <Button
            size="sm"
            disabled={!hasItems}
            className="py-1 px-3"
            style={{
              backgroundColor:
                !hasItems
                  ? "#cccccc"
                  : expandedRows && Object.keys(expandedRows).length > 0
                    ? "#53b2a5"
                    : "#dafaf6ff",
              color:
                !hasItems
                  ? "#666666"
                  : expandedRows && Object.keys(expandedRows).length > 0
                    ? "white"
                    : "black",
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "20px",
              border: `2px solid ${!hasItems ? "#cccccc" : "#53b2a5"}`,
              cursor: !hasItems ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              const anyExpanded = Object.values(expandedRows).some(Boolean);
              if (anyExpanded) {
                setExpandedRows({});
              } else {
                const newExpanded = {};
                filteredData.forEach((e) => {
                  if (e.items.length > 0) newExpanded[e.id] = true;
                });
                setExpandedRows(newExpanded);
              }
            }}
          >
            {expandedRows && Object.keys(expandedRows).length > 0
              ? "Hide Items"
              : "Items Details"}
          </Button>

          {/* Count of Transaction */}
          <Button
            size="sm"
            className="py-1 px-3"
            style={{
              backgroundColor: showCountTable ? "#53b2a5" : "#dafaf6ff",
              color: showCountTable ? "white" : "black",
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "20px",
              border: "2px solid #53b2a5",
            }}
            onClick={() => setShowCountTable((prev) => !prev)}
          >
            {showCountTable ? "Hide Count" : "Count of Transaction"}
          </Button>

          {/* Narration */}
          <Button
            size="sm"
            className="py-1 px-3"
            style={{
              backgroundColor: showNarration ? "#53b2a5" : "#dafaf6ff",
              color: showNarration ? "white" : "black",
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "20px",
              border: "2px solid #53b2a5",
            }}
            onClick={() => setShowNarration(!showNarration)}
          >
            {showNarration ? "Hide" : "Narration"}
          </Button>

          {/* Confirm Balance */}
          <Button
            size="sm"
            className="py-1 px-3"
            style={{
              backgroundColor: showConfirmLetter ? "#53b2a5" : "#dafaf6ff",
              color: showConfirmLetter ? "white" : "black",
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "20px",
              border: "2px solid #53b2a5",
            }}
            onClick={() => setShowConfirmLetter(!showConfirmLetter)}
          >
            {showConfirmLetter ? "Hide Letter" : "Confirm Balance"}
          </Button>

          {/* Send Button (Always filled) */}
          <Button
            size="sm"
            className="py-1 px-3"
            style={{
              backgroundColor: "#53b2a5",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "20px",
              border: "2px solid #53b2a5",
            }}
          >
            Send
          </Button>
        </div>



        {/* Voucher Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Voucher Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Manual Voucher No.</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter voucher no..."
                    value={manualVoucherNo}
                    onChange={(e) => setManualVoucherNo(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Auto Voucher No.</Form.Label>
                  <Form.Control type="text" value={autoVoucherNo} readOnly style={{ backgroundColor: "#f9f9f9" }} />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Customer Details Card */}
        {showCustomerDetails && (
          <Card className="mb-4 shadow-sm border-0 rounded-3">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-bold text-dark">Customer Details</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                {/* Personal Details */}
                <Col md={4}>
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-semibold mb-3 text-secondary text-nowrap">Personal Info</h6>

                    <p className="mb-2 d-flex align-items-center">
                      <FaUser className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>Name:</strong> {customer.name}</span>
                    </p>

                    <p className="mb-2 d-flex align-items-center">
                      <FaBuilding className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>Company:</strong> {customer.companyName || "N/A"}</span>
                    </p>

                    <p className="mb-2 d-flex align-items-center">
                      <FaPhone className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>Phone:</strong> {customer.phone}</span>
                    </p>

                    <p className="mb-0 d-flex align-items-center">
                      <FaEnvelope className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>Email:</strong> {customer.email}</span>
                    </p>
                  </div>
                </Col>

                {/* Address Details */}
                <Col md={4}>
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-semibold mb-3 text-secondary">Address Info</h6>

                    <p className="mb-2 d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>Address:</strong> {customer.address}</span>
                    </p>

                    <p className="mb-2 d-flex align-items-center">
                      <FaTruck className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>Shipping:</strong> {customer.shippingAddress || "Same as above"}</span>
                    </p>

                    <p className="mb-2 d-flex align-items-center">
                      <FaGlobeAsia className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>Country:</strong> {customer.country || "India"}</span>
                    </p>

                    <p className="mb-0 d-flex align-items-center">
                      <FaFlag className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>State:</strong> {customer.state || "N/A"}</span>
                    </p>
                  </div>
                </Col>

                {/* Financial Details */}
                <Col md={4}>
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-semibold mb-3 text-secondary">Financial Info</h6>

                    <p className="mb-2 d-flex align-items-center">
                      <FaHashtag className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>Pincode:</strong> {customer.pincode || "N/A"}</span>
                    </p>

                    <p className="mb-2 d-flex align-items-center">
                      <FaFileInvoice className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>GSTIN:</strong> {customer.gst || "N/A"}</span>
                    </p>

                    <p className="mb-2 d-flex align-items-center">
                      <FaCalendarAlt className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>Credit Period:</strong> {customer.creditPeriod || "N/A"} days</span>
                    </p>

                    <p className="mb-0 d-flex align-items-center">
                      <FaWallet className="me-2" style={{ color: "#53b2a5" }} />
                      <span><strong>Balance:</strong> ₹{customer.accountBalance?.toLocaleString("en-IN") || "0.00"}</span>
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Confirmation Letter Card */}
        {showConfirmLetter && (
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Balance Confirmation Letter</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="mb-3 fw-bold text-primary">Our Company</h5>
                  <p><strong>Company Name:</strong> ABC Textiles Pvt Ltd</p>
                  <p><strong>Address:</strong> 123, Textile Market, Indore, MP 452001</p>
                  <p><strong>Contact:</strong> +91 98765 43210</p>
                  <p><strong>GSTIN:</strong> 23AABCCDD123E1Z</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>

                <div className="text-end">
                  <h5 className="mb-3 fw-bold text-success">Customer Details</h5>
                  <p><strong>Name:</strong> {customer.name}</p>
                  <p><strong>Company:</strong> {customer.companyName || "N/A"}</p>
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>Phone:</strong> {customer.phone}</p>
                  <p><strong>GSTIN:</strong> {customer.gst || "N/A"}</p>
                  <p><strong>Credit Period:</strong> {customer.creditPeriod || "N/A"} days</p>
                </div>
              </div>

              <hr />

              <h6 className="mb-3">Dear {customer.name},</h6>
              <p>
                This is to confirm that as per our records, your account stands at the following balance:
              </p>

              <Table bordered size="sm" className="mb-4">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Opening Balance</td>
                    <td>{customer.openingBalance.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Total Sales (Dr)</td>
                    <td>{totals.totalDebit.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Total Payments (Cr)</td>
                    <td>{totals.totalCredit.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="table-info fw-bold">
                    <td>Current Balance</td>
                    <td>
                      {Math.abs(currentBalance).toLocaleString('en-IN')} {currentBalance >= 0 ? "Dr" : "Cr"}
                    </td>
                  </tr>
                </tbody>
              </Table>

              <p className="fw-bold">
                We hereby confirm the above balance as correct.
              </p>

              <div className="d-flex justify-content-between mt-5">
                <div>
                  <p><strong>For the Company</strong></p>
                  <div style={{ height: "40px", borderBottom: "1px solid #000" }}></div>
                  <p className="mt-2">
                    <strong>Name:</strong> Rajesh Sharma<br />
                    <strong>Designation:</strong> Accountant<br />
                    <strong>Place:</strong> Indore<br />
                    <strong>Date:</strong> {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p><strong>For Customer</strong></p>
                  <div style={{ height: "40px", borderBottom: "1px solid #000" }}></div>
                  <p className="mt-2">
                    <strong>Name:</strong> {customer.name}<br />
                    <strong>Signature:</strong><br />
                    <strong>Date:</strong> _______________
                  </p>
                </div>
              </div>

              <div className="text-center mt-4">
                <Button
                  variant="none"
                  size="sm"
                  style={{
                    backgroundColor: "#53b2a5",
                    color: "white",
                    border: "none",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Balance Confirmation</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 40px; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .company-info { text-align: right; margin-bottom: 20px; }
                            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            .table th { background-color: #f2f2f2; }
                            .signature { margin-top: 50px; text-align: center; }
                            .signature-line { border-bottom: 1px solid black; width: 200px; margin: 10px auto; }
                            .footer { text-align: center; margin-top: 50px; font-size: 0.9em; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h2>Balance Confirmation Letter</h2>
                            <p>Date: ${new Date().toLocaleDateString()}</p>
                          </div>

                          <div class="company-info">
                            <p><strong>Company Name:</strong> ABC Textiles Pvt Ltd</p>
                            <p><strong>Address:</strong> 123, Textile Market, Indore, MP 452001</p>
                            <p><strong>Contact:</strong> +91 98765 43210</p>
                          </div>

                          <h3>Dear ${customer.name},</h3>
                          <p>This is to confirm that as per our records, your account stands at the following balance:</p>

                          <table class="table">
                            <tr><th>Description</th><th>Amount (₹)</th></tr>
                            <tr><td>Opening Balance</td><td>${customer.openingBalance.toLocaleString('en-IN')}</td></tr>
                            <tr><td>Total Sales (Dr)</td><td>${totals.totalDebit.toLocaleString('en-IN')}</td></tr>
                            <tr><td>Total Payments (Cr)</td><td>${totals.totalCredit.toLocaleString('en-IN')}</td></tr>
                            <tr><td><strong>Current Balance</strong></td><td><strong>${Math.abs(currentBalance).toLocaleString('en-IN')} ${currentBalance >= 0 ? "Dr" : "Cr"}</strong></td></tr>
                          </table>

                          <p>We hereby confirm the above balance as correct.</p>

                          <div class="signature">
                            <p><strong>For the Company</strong></p>
                            <div class="signature-line"></div>
                            <p><strong>Name:</strong> Rajesh Sharma</p>
                            <p><strong>Designation:</strong> Accountant</p>
                            <p><strong>Place:</strong> Indore</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                          </div>

                          <div class="signature">
                            <p><strong>For Customer</strong></p>
                            <div class="signature-line"></div>
                            <p><strong>Name:</strong> ${customer.name}</p>
                            <p><strong>Signature:</strong></p>
                            <p><strong>Date:</strong> ___________________</p>
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                  }}
                >
                  Print Confirmation
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="ms-2"
                  onClick={() => setShowConfirmLetter(false)}
                >
                  Close
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Filters</h5>
            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="me-2"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </Card.Header>
          {showFilters && (
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} sm={6} md={4}>
                  <Form.Group>
                    <Form.Label>From Date</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaCalendarAlt />
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Group>
                    <Form.Label>To Date</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaCalendarAlt />
                      </InputGroup.Text>
                      <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Group>
                    <Form.Label>Balance Type</Form.Label>
                    <Form.Select value={balanceType} onChange={(e) => setBalanceType(e.target.value)}>
                      <option value="all">All Transactions</option>
                      <option value="debit">Debit Only</option>
                      <option value="credit">Credit Only</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={6}>
                  <Form.Group>
                    <Form.Label>Voucher Type</Form.Label>
                    <Form.Select
                      value={voucherTypeFilter}
                      onChange={(e) => setVoucherTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Payment">Payment</option>
                      <option value="Return">Return</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={6}>
                  <Form.Group>
                    <Form.Label>Search</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by particulars, voucher no, or item..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          )}
        </Card>

        {/* Ledger Table */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Ledger Transactions</h5>
            <Badge bg="light" text="dark">
              {filteredData.length} transactions found
            </Badge>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table striped hover className="align-middle">
                <thead className="table-light text-black">
                  <tr>
                    <th>Date</th>
                    <th>Particulars</th>
                    <th>VCH NO</th>
                    <th>VCH TYPE</th>
                    <th className="text-end">Debit (Dr)</th>
                    <th className="text-end">Credit (Cr)</th>
                    <th className="text-end">Running Balance</th>
                    {showNarration && <th>Narration</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((entry) => (
                    <React.Fragment key={entry.id}>
                      {/* Main Ledger Row */}
                      <tr>
                        <td>{entry.date}</td>
                        <td>
                          <div
                            className="d-flex align-items-center cursor-pointer"
                            onClick={() => {
                              if (entry.items && entry.items.length > 0) {
                                setExpandedRows((prev) => ({
                                  ...prev,
                                  [entry.id]: !prev[entry.id],
                                }));
                              }
                            }}
                            style={{ minWidth: "120px" }}
                          >
                            <span className="me-2">
                              {entry.items && entry.items.length > 0 ? (expandedRows[entry.id] ? "▼" : "▶") : " "}
                            </span>
                            <span>{entry.particulars}</span>
                          </div>
                        </td>

                        <td>{entry.voucherNo}</td>
                        <td>
                          <Badge
                            bg={
                              entry.voucherType === "Invoice"
                                ? "primary"
                                : entry.voucherType === "Payment"
                                  ? "success"
                                  : entry.voucherType === "Return"
                                    ? "warning"
                                    : "secondary"
                            }
                          >
                            {entry.voucherType === "Invoice"
                              ? "Sales"
                              : entry.voucherType === "Payment"
                                ? "Receipt"
                                : entry.voucherType === "Return"
                                  ? "Sales Return"
                                  : entry.voucherType}
                          </Badge>
                        </td>
                        <td className="text-end">
                          {entry.debit
                            ? entry.debit.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })
                            : ""}
                        </td>
                        <td className="text-end">
                          {entry.credit
                            ? entry.credit.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })
                            : ""}
                        </td>
                        <td className={`text-end ${entry.balanceType === "Dr" ? "text-primary" : "text-success"}`}>
                          {entry.balance}
                        </td>

                        {/* Narration Column (Conditional) */}
                        {showNarration && (
                          <td className="text-muted small" style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                            {entry.narration || "—"}
                          </td>
                        )}
                      </tr>

                      {/* Expandable Items Table (Only if items exist and row is expanded) */}
                      {entry.items && entry.items.length > 0 && expandedRows[entry.id] && (
                        <tr>
                          <td colSpan={showNarration ? 8 : 7} className="p-0" style={{ backgroundColor: "#f9f9f9" }}>
                            <div className="p-2 ps-4 bg-light border-top">
                              <Table size="sm" bordered className="mb-0 bg-white shadow-sm" style={{ fontSize: "0.85rem" }}>
                                <thead className="table-light">
                                  <tr>
                                    <th>Item / Material</th>
                                    <th>Qty</th>
                                    <th>Rate (₹)</th>
                                    <th>Disc (%)</th>
                                    <th>Tax (%)</th>
                                    <th>Tax Amt (₹)</th>
                                    <th>Value (₹)</th>
                                    <th>Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {entry.items.map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="fw-bold">{item.item}</td>
                                      <td>{item.quantity}</td>
                                      <td>{parseFloat(item.rate).toFixed(3)}</td>
                                      <td>{item.discount}</td>
                                      <td>{item.tax}</td>
                                      <td>₹{parseFloat(item.taxAmt).toFixed(2)}</td>
                                      <td>₹{parseFloat(item.value).toFixed(2)}</td>
                                      <td className="text-muted">{item.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <td colSpan={showNarration ? "5" : "4"} className="text-end fw-bold">
                      Total
                    </td>
                    <td className="text-end fw-bold">
                      {totals.totalDebit.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                    </td>
                    <td className="text-end fw-bold">
                      {totals.totalCredit.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                    </td>
                    <td className="text-end fw-bold">
                      {Math.abs(currentBalance).toLocaleString("en-IN", { style: "currency", currency: "INR" })}{" "}
                      {currentBalance >= 0 ? (ledgerType === "customer" ? "Dr" : "Cr") : (ledgerType === "customer" ? "Cr" : "Dr")}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Transaction Count Table */}
        {showCountTable && (
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Transaction Type Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover bordered size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Transaction Type</th>
                      <th className="text-center">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Count each voucher type
                      const counts = {};
                      filteredData.forEach((item) => {
                        const type = item.voucherType;
                        counts[type] = (counts[type] || 0) + 1;
                      });

                      // All possible types
                      const allTypes = [
                        "Opening Balance",
                        "Sales",
                        "Receipt",
                        "Sales Return",
                        "Purchase",
                        "Payment",
                        "Manufacturing",
                        "Stock Journal",
                        "Stock Adjustment",
                        "Banking",
                        "Journal",
                      ];

                      // Mapping our internal codes to labels
                      const labelMap = {
                        Opening: "Opening Balance",
                        Invoice: "Sales",
                        Payment: "Receipt",
                        Return: "Sales Return",
                      };

                      return allTypes.map((label) => {
                        // Calculate count for this label
                        const countForLabel =
                          (label === "Opening Balance" ? counts["Opening"] || 0 : 0) +
                          (label === "Sales" ? counts["Invoice"] || 0 : 0) +
                          (label === "Receipt" ? counts["Payment"] || 0 : 0) +
                          (label === "Sales Return" ? counts["Return"] || 0 : 0);
                        return (
                          <tr key={label}>
                            <td className="fw-bold">{label}</td>
                            <td className="text-center">{countForLabel || 0}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                  <tfoot>
                    <tr className="bg-light fw-bold">
                      <td>Total Transactions</td>
                      <td className="text-center">{filteredData.length}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Ledgercustomer;