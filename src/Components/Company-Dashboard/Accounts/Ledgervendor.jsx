import React, { useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";
import {
  FaCalendarAlt,
  FaSearch,
  FaFileExport,
  FaFilePdf,
  FaGlobe,
} from "react-icons/fa";
import {
  Button,
  Card,
  Row,
  Col,
  Form,
  InputGroup,
  Table,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Ledgervendor = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅✅✅ FIXED: Updated defaultVendor to match the structure from VendorsCreditors
  const defaultVendor = {
    name: "Unknown Vendor",
    nameArabic: "",
    companyName: "N/A",
    email: "N/A",
    phone: "N/A",
    address: "N/A",
    shippingAddress: "Same as above",
    country: "India",
    state: "N/A",
    pincode: "N/A",
    stateCode: "N/A",
    // ✅ Use 'gstin' instead of 'gst'
    gstin: "N/A",
    // ✅ Use 'payable' for the current account balance
    payable: 0,
    accountName: "Sundry Creditors",
    // ✅ 'openingBalance' is not provided by the API, so we'll use 'payable' or set to 0.
    //    You might need to calculate this on the backend later.
    openingBalance: 0,
    creditPeriod: "30",
    bankAccountNumber: "N/A",
    bankIFSC: "N/A",
    bankName: "N/A",
    creationDate: new Date().toISOString().split("T")[0],
    companyLocation: "",
  };

  const passedVendor = location.state?.vendor;
  // ✅✅✅ CRITICAL: Ensure we use the passed vendor or the corrected default
  const vendor = passedVendor || defaultVendor;

  // State
  const [fromDate, setFromDate] = useState("2025-04-01");
  const [toDate, setToDate] = useState("2025-04-30");
  const [balanceType, setBalanceType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("all");
  const [showNarration, setShowNarration] = useState(false);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [showCountTable, setShowCountTable] = useState(false);
  const [manualVoucherNo, setManualVoucherNo] = useState("");
  const [autoVoucherNo] = useState("VCH-" + Date.now());
  const [showConfirmLetter, setShowConfirmLetter] = useState(false);
  const [letterType, setLetterType] = useState("vendor"); // "vendor" or "customer"

  // Vendor-only Dummy Data (with dynamic opening balance)
  // ✅ We use vendor.openingBalance here, which is now correctly set from the passed data or default.
  const ledgerData = [
    // Opening Balance - Dynamic based on vendor.openingBalance
    {
      id: 1,
      date: "2025-04-01",
      particulars: "Opening Balance",
      narration: "Initial opening balance carried forward",
      voucherNo: "--",
      voucherType: "Opening",
      debit: 0,
      credit: parseFloat(vendor.openingBalance || 0),
      items: [],
    },
    // Purchase Invoice
    {
      id: 2,
      date: "2025-04-03",
      particulars: "Purchase Invoice INV501",
      narration: "Raw material purchased from Sharma Suppliers",
      voucherNo: "INV501",
      voucherType: "Invoice",
      debit: 0,
      credit: 12000,
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
    // Payment Made
    {
      id: 3,
      date: "2025-04-07",
      particulars: "Payment Made",
      narration: "Payment made for purchase",
      voucherNo: "PY001",
      voucherType: "Payment",
      debit: 10000,
      credit: 0,
      items: [],
    },
    // Purchase Return
    {
      id: 4,
      date: "2025-04-12",
      particulars: "Purchase Return",
      narration: "Returned damaged goods",
      voucherNo: "DN001",
      voucherType: "Return",
      debit: 2000,
      credit: 0,
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
    // Second Purchase Invoice
    {
      id: 5,
      date: "2025-04-15",
      particulars: "Purchase Invoice INV502",
      narration: "Second purchase of cotton fabric",
      voucherNo: "INV502",
      voucherType: "Invoice",
      debit: 0,
      credit: 8500,
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
      particulars: "Payment Made",
      narration: "Partial payment for INV502",
      voucherNo: "PY002",
      voucherType: "Payment",
      debit: 5000,
      credit: 0,
      items: [],
    },
  ];

  // Filtered & Processed Data
  const processedData = useMemo(() => {
    let filtered = [...ledgerData];
    if (fromDate) filtered = filtered.filter((e) => e.date >= fromDate);
    if (toDate) filtered = filtered.filter((e) => e.date <= toDate);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((e) =>
        e.particulars.toLowerCase().includes(q) ||
        (e.narration && e.narration.toLowerCase().includes(q)) ||
        e.voucherNo.toLowerCase().includes(q) ||
        (e.items && e.items.some((i) => i.item.toLowerCase().includes(q)))
      );
    }
    if (balanceType !== "all") {
      filtered = filtered.filter((e) =>
        balanceType === "debit" ? e.debit > 0 : e.credit > 0
      );
    }
    if (voucherTypeFilter !== "all") {
      filtered = filtered.filter((e) => e.voucherType === voucherTypeFilter);
    }
    let runningBalance = 8000;
    return filtered.map((entry) => {
      runningBalance += (entry.credit || 0) - (entry.debit || 0);
      const isCredit = runningBalance >= 0;
      const balanceTypeLabel = isCredit ? "Cr" : "Dr";
      return {
        ...entry,
        balance: `${Math.abs(runningBalance).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        })} ${balanceTypeLabel}`,
        balanceValue: runningBalance,
        balanceType: balanceTypeLabel,
      };
    });
  }, [ledgerData, fromDate, toDate, balanceType, searchQuery, voucherTypeFilter]);

  // Totals
  const totals = useMemo(() => {
    return processedData.reduce(
      (acc, e) => {
        acc.totalDebit += e.debit || 0;
        acc.totalCredit += e.credit || 0;
        return acc;
      },
      { totalDebit: 0, totalCredit: 0 }
    );
  }, [processedData]);

  const currentBalance = processedData.length > 0
    ? processedData[processedData.length - 1].balanceValue
    : 0;

  const hasItems = useMemo(() => processedData.some((e) => e.items.length > 0), [processedData]);

  // Handlers
  const resetFilters = () => {
    setFromDate("2025-04-01");
    setToDate("2025-04-30");
    setBalanceType("all");
    setVoucherTypeFilter("all");
    setSearchQuery("");
  };

  const exportToExcel = () => alert("Export to Excel functionality");
  const exportToPDF = () => alert("Export to PDF functionality");

  return (
    <div className="container mt-4">
      {/* Top Bar: Back + Custom Styled Action Chips */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        {/* Back Button */}
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="d-flex align-items-center px-3 py-1"
        >
          <span className="me-1">←</span> Back to Vendors
        </Button>

        {/* Vendor Name */}
        <h4 className="fw-bold mb-0 text-dark text-center flex-grow-1">
          Vendor Ledger - {vendor.name}
        </h4>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4 g-3 ">
        <Col md={4}>
          <Card className="border-left-primary shadow h-100 py-2">
            <Card.Body>
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Payments (Dr)
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totals.totalDebit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
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
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Purchases (Cr)
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totals.totalCredit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
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
          <Card className={`border-left-${currentBalance >= 0 ? 'info' : 'danger'} shadow h-100 py-2`}>
            <Card.Body>
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">
                    Outstanding Balance
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {Math.abs(currentBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} {currentBalance >= 0 ? "Cr" : "Dr"}
                  </div>
                </div>
                <div className="col-auto">
                  <div className={`btn-circle btn-sm btn-${currentBalance >= 0 ? 'info' : 'danger'}`}>
                    {currentBalance >= 0 ? "Cr" : "Dr"}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action buttons */}
      <div className="mb-4">
        {/* 1. View Vendor Details */}
        <Button
          size="sm"
          className="py-1 px-3"
          style={{
            backgroundColor: showVendorDetails ? "#53b2a5" : "#e9f7f5",
            color: "white",
            border: "1px solid #53b2a5",
            fontWeight: 600,
            fontSize: "0.85rem",
            borderRadius: "20px",
          }}
          onClick={() => setShowVendorDetails(!showVendorDetails)}
        >
          {showVendorDetails ? " Details" : " Vendor Details"}
        </Button>
        {/* 2. View Item Details */}
        <Button
          size="sm"
          className="py-1 px-3"
          disabled={!hasItems}
          style={{
            backgroundColor: !hasItems ? "#cccccc" : "#53b2a5",
            color: "white",
            border: "1px solid #53b2a5",
            fontWeight: 600,
            fontSize: "0.85rem",
            borderRadius: "20px",
          }}
          onClick={() => {
            const anyExpanded = processedData.some(
              (entry) => entry.items.length > 0 && expandedRows[entry.id]
            );
            const newExpandedRows = {};
            if (!anyExpanded) {
              processedData.forEach((entry) => {
                if (entry.items && entry.items.length > 0) {
                  newExpandedRows[entry.id] = true;
                }
              });
            }
            setExpandedRows(newExpandedRows);
          }}
        >
          {expandedRows && Object.keys(expandedRows).length > 0 ? "Hide Items" : "Items Details"}
        </Button>
        {/* 3. Show Transaction Count */}
        <Button
          size="sm"
          className="py-1 px-3"
          style={{
            backgroundColor: showCountTable ? "#53b2a5" : "#e9f7f5",
            color: "white",
            border: "1px solid #53b2a5",
            fontWeight: 600,
            fontSize: "0.85rem",
            borderRadius: "20px",
          }}
          onClick={() => setShowCountTable((prev) => !prev)}
        >
          {showCountTable ? "Hide Count" : "Count of Transaction"}
        </Button>
        {/* 5. Send Button - Normal & Simple */}

        {/* 4. Show/Hide Narration */}
        <Button
          size="sm"
          className="py-1 px-3"
          style={{
            backgroundColor: showNarration ? "#53b2a5" : "#e9f7f5",
            color: "white",
            border: "1px solid #53b2a5",
            fontWeight: 600,
            fontSize: "0.85rem",
            borderRadius: "20px",
          }}
          onClick={() => setShowNarration(!showNarration)}
        >
          {showNarration ? "Hide Narration" : "Narration"}
        </Button>
        <Button
          size="sm"
          className="py-1 px-3"
          style={{
            backgroundColor: showConfirmLetter ? "#53b2a5" : "#e9f7f5",
            color: "white",
            border: "1px solid #53b2a5",
            fontWeight: 600,
            fontSize: "0.85rem",
            borderRadius: "20px",
          }}
          onClick={() => {
            if (showConfirmLetter) {
              // Agar already dikh raha hai, toh hide karein
              setShowConfirmLetter(false);
            } else {
              // Agar nhi dikh raha, toh vendor letter dikhao
              setLetterType("vendor");
              setShowConfirmLetter(true);
            }
          }}
        >
          {showConfirmLetter ? "Hide Letter" : "Vendor Confirm"}
        </Button>

        <Button
          size="sm"
          onClick={() => {
            alert(`Ledger for ${vendor.name} will be sent.`);
          }}
          style={{
            backgroundColor: showVendorDetails ? "#53b2a5" : "#e9f7f5",
            color: "white",
            border: "1px solid #53b2a5",
            fontWeight: 600,
            fontSize: "0.85rem",
            borderRadius: "20px",

          }}
        >
          Send to email
        </Button>
      </div>

      {/* 🆕 Voucher No Section */}
      <Row className="mb-3 mt-2">
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
            <Form.Control
              type="text"
              value={autoVoucherNo}
              readOnly
              style={{ backgroundColor: "#f9f9f9" }}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* 👉 Confirmation Letter Preview */}
      {showConfirmLetter && (
        <Card className="mt-3  border mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-4">
              {/* Company Info (Left) */}
              <div>
                <h5 className="mb-3 fw-bold text-primary">Our Company</h5>
                <p><strong>Company Name:</strong> ABC Textiles Pvt Ltd</p>
                <p><strong>Address:</strong> 123, Textile Market, Indore, MP 452001</p>
                <p><strong>Contact:</strong> +91 98765 43210</p>
                <p><strong>GSTIN:</strong> 23AABCCDD123E1Z</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
              {/* Vendor/Customer Info (Right) */}
              <div className="text-end">
                <h5 className="mb-3 fw-bold text-success">
                  {letterType === "vendor" ? "Vendor Details" : "Customer Details"}
                </h5>
                <p><strong>Name:</strong> {letterType === "vendor" ? "Zhejiang Textile" : "Suzhou Yaowang"}</p>
                <p><strong>Company:</strong> {letterType === "vendor" ? "Zhejiang Co. LTD" : "Suzhou Co. LTD"}</p>
                <p><strong>Email:</strong> {letterType === "vendor" ? "zhejiang@email.com" : "suzhou@email.com"}</p>
                <p><strong>Phone:</strong> {letterType === "vendor" ? "+86 123456789" : "+86 987654321"}</p>
                {/* ✅ Use 'gstin' for the letter */}
                <p><strong>GSTIN:</strong> {letterType === "vendor" ? "09AAAPA1234A1Z5" : "09BBBQB5678B2Z6"}</p>
              </div>
            </div>
            <hr />
            <h6 className="mb-3">
              Dear {letterType === "vendor" ? "Zhejiang Textile" : "Suzhou Yaowang"},
            </h6>
            <p>
              This is to confirm that as per our records, your account stands at the following balance:
            </p>
            {/* Balance Table */}
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
                  {/* ✅ Use vendor.openingBalance */}
                  <td>{parseFloat(vendor.openingBalance || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                </tr>
                <tr>
                  <td>Total Purchases (Cr)</td>
                  <td>120,000.00</td>
                </tr>
                <tr>
                  <td>Total Payments (Dr)</td>
                  <td>90,000.00</td>
                </tr>
                <tr className="table-info fw-bold">
                  <td>Current Balance</td>
                  {/* ✅ Use vendor.payable for current balance */}
                  <td>{parseFloat(vendor.payable || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} Cr</td>
                </tr>
              </tbody>
            </Table>
            <p className="fw-bold">
              We hereby confirm the above balance as correct.
            </p>
            {/* Signature Section */}
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
                <p><strong>For {letterType === "vendor" ? "Vendor" : "Customer"}</strong></p>
                <div style={{ height: "40px", borderBottom: "1px solid #000" }}></div>
                <p className="mt-2">
                  <strong>Name:</strong> {letterType === "vendor" ? "Zhejiang Textile" : "Suzhou Yaowang"}<br />
                  <strong>Signature:</strong><br />
                  <strong>Date:</strong> _______________
                </p>
              </div>
            </div>
            {/* Print Button */}
            <div className="text-center mt-4">
              <Button
                variant="primary"
                size="sm"
                style={{
                  backgroundColor: "#53b2a5",
                  color: "white",
                  border: "none",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "0.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  alignItems: "center",
                  gap: "0.5rem",
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
                  <h3>Dear ${letterType === "vendor" ? "Zhejiang Textile" : "Suzhou Yaowang"},</h3>
                  <p>This is to confirm that as per our records, your account stands at the following balance:</p>
                  <table class="table">
                    <tr><th>Description</th><th>Amount (₹)</th></tr>
                    <tr><td>Opening Balance</td><td>${parseFloat(vendor.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
                    <tr><td>Total Purchases (Cr)</td><td>120,000.00</td></tr>
                    <tr><td>Total Payments (Dr)</td><td>90,000.00</td></tr>
                    <tr><td><strong>Current Balance</strong></td><td><strong>${parseFloat(vendor.payable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr</strong></td></tr>
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
                    <p><strong>For ${letterType === "vendor" ? "Vendor" : "Customer"}</strong></p>
                    <div class="signature-line"></div>
                    <p><strong>Name:</strong> ${letterType === "vendor" ? "Zhejiang Textile" : "Suzhou Yaowang"}</p>
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
                🖨️ Print Confirmation
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

      {/* 👉 Vendor Details */}
      {showVendorDetails && (
        <Card
          className="mt-3 mb-3"
          style={{
            borderRadius: "12px",
            border: "1px solid #dee2e6",
            backgroundColor: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <Card.Body className="p-3">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Vendor Details</h5>
            <Row className="g-3">
              {/* Personal Info */}
              <Col md={4}>
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "15px",
                    height: "100%",
                  }}
                >
                  <h6 className="fw-semibold mb-3 text-muted">Personal Info</h6>
                  <p className="mb-2">
                    <i className="bi bi-person text-success me-2"></i>
                    <strong>Name:</strong> {vendor.name}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-building text-success me-2"></i>
                    <strong>Company:</strong> {vendor.companyName || "N/A"}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-telephone text-success me-2"></i>
                    <strong>Phone:</strong> {vendor.phone}
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-envelope text-success me-2"></i>
                    <strong>Email:</strong> {vendor.email}
                  </p>

                  <p className="mb-0 d-flex align-items-center">
                    <FaGlobe className="me-2" style={{ color: "#53b2a5" }} />
                    <span>
                      <strong>Location:</strong>{" "}
                      <a
                        href={vendor.companyLocation}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#007bff", textDecoration: "none" }}
                      >
                        Click Location
                      </a>
                    </span>
                  </p>

                </div>
              </Col>

              {/* Address Info */}
              <Col md={4}>
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "15px",
                    height: "100%",
                  }}
                >
                  <h6 className="fw-semibold mb-3 text-muted">Address Info</h6>
                  <p className="mb-2">
                    <i className="bi bi-geo-alt text-success me-2"></i>
                    <strong>Address:</strong> {vendor.address}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-truck text-success me-2"></i>
                    <strong>Shipping:</strong> {vendor.shippingAddress || "Same as above"}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-globe text-success me-2"></i>
                    <strong>Country:</strong> {vendor.country || "India"}
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-flag text-success me-2"></i>
                    <strong>State:</strong> {vendor.state || "N/A"}
                  </p>
                </div>
              </Col>

              {/* Financial Info */}
              <Col md={4}>
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "15px",
                    height: "100%",
                  }}
                >
                  <h6 className="fw-semibold mb-3 text-muted">Financial Info</h6>
                  <p className="mb-2">
                    <i className="bi bi-hash text-success me-2"></i>
                    <strong>Pincode:</strong> {vendor.pincode || "N/A"}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-file-earmark-text text-success me-2"></i>
                    <strong>GSTIN:</strong> {vendor.gstin || "N/A"}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-calendar text-success me-2"></i>
                    <strong>Credit Period:</strong> {vendor.creditPeriod || "N/A"} days
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-cash-stack text-success me-2"></i>
                    <strong>Balance:</strong> ₹
                    {parseFloat(vendor.payable || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header className="text-white d-flex justify-content-between align-items-center">
          <Badge bg="light" text="dark">
            {processedData.length} transaction(s)
          </Badge>
          <div className="d-flex align-items-center gap-2">
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
        </Card.Header>
        <Card.Body>


          {/* Filters Toggle */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="me-2"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>
            <Badge bg="warning" text="dark">Vendor Ledger</Badge>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <Card className="mb-4 bg-light">
              <Card.Body>
                <Row className="g-3">
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group>
                      <Form.Label>From Date</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                        <Form.Control
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group>
                      <Form.Label>To Date</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                        <Form.Control
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group>
                      <Form.Label>Balance Type</Form.Label>
                      <Form.Select value={balanceType} onChange={(e) => setBalanceType(e.target.value)}>
                        <option value="all">All Transactions</option>
                        <option value="debit">Payments Only (Debit)</option>
                        <option value="credit">Purchases Only (Credit)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group>
                      <Form.Label>Voucher Type</Form.Label>
                      <Form.Select value={voucherTypeFilter} onChange={(e) => setVoucherTypeFilter(e.target.value)}>
                        <option value="all">All Types</option>
                        <option value="Invoice">Purchase</option>
                        <option value="Payment">Payment</option>
                        <option value="Return">Purchase Return</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="g-3 mt-3">
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Search</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaSearch /></InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search by voucher, description, narration, or item..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Global CSS for uniform button height */}
          <style jsx>{`
  .uniform-btn {
    min-height: 38px !important;
    padding: 0.375rem 0.75rem !important;
    line-height: 1.5 !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid;
    border-color: transparent;
    transition: all 0.2s ease;
  }
  /* Fix for outline buttons */
  .btn-outline-info.uniform-btn {
    border-color: #17a2b8 !important;
    color: #17a2b8 !important;
  }
  .btn-outline-info.uniform-btn:hover {
    background-color: #17a2b8 !important;
    color: white !important;
  }
  /* Fix for disabled button */
  .uniform-btn:disabled {
    opacity: 0.65 !important;
    cursor: not-allowed !important;
    pointer-events: auto !important;
    background-color: #007bff !important;
    color: white !important;
    border-color: #007bff !important;
  }
  /* Responsive adjustment for small screens */
  @media (max-width: 575.98px) {
    .uniform-btn {
      min-height: 36px !important;
      padding: 0.3rem 0.6rem !important;
      font-size: 0.875rem !important;
    }
  }
`}</style>

          {/* Ledger Table */}
          <div className="table-responsive">
            <Table striped hover bordered className="shadow-sm  align-middle ">
              <thead className=" table-light border">
                <tr className="py-2">
                  <th className="py-2">Date</th>
                  <th className="py-2">Particulars</th>
                  <th>VCH NO</th>
                  <th>VCH TYPE</th>
                  <th className="text-end">Debit (Dr)</th>
                  <th className="text-end">Credit (Cr)</th>
                  <th className="text-end">Balance</th>
                  {showNarration && <th>Narration</th>}
                </tr>
              </thead>
              <tbody>
                {processedData.length > 0 ? (
                  processedData.map((entry) => (
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
                          >
                            <span className="me-2">
                              {entry.items && entry.items.length > 0 ? (
                                expandedRows[entry.id] ? "▼" : "▶"
                              ) : (
                                " "
                              )}
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
                              ? "Purchase"
                              : entry.voucherType === "Return"
                                ? "Return"
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
                        <td
                          className={`text-end ${entry.balanceType === "Cr" ? "text-success" : "text-danger"
                            }`}
                        >
                          {entry.balance}
                        </td>
                        {showNarration && (
                          <td className="text-muted small" style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                            {entry.narration || "—"}
                          </td>
                        )}
                      </tr>
                      {/* Expandable Items Table */}
                      {entry.items && entry.items.length > 0 && expandedRows[entry.id] && (
                        <tr>
                          <td className="text-muted" style={{ fontSize: "0.8rem" }}>
                            •••
                          </td>
                          <td colSpan={showNarration ? 7 : 6} className="p-0">
                            <div className="bg-light border-top">
                              <Table striped hover className="mb-0" size="sm">
                                <thead className="table-light">
                                  <tr>
                                    <th>ITEM / MATERIAL</th>
                                    <th>QUANTITY</th>
                                    <th>RATE (₹)</th>
                                    <th>DISCOUNT</th>
                                    <th>TAX %</th>
                                    <th>TAX AMT (₹)</th>
                                    <th>VALUE (₹)</th>
                                    <th>DESCRIPTION</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {entry.items.map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="fw-bold">{item.item}</td>
                                      <td>{item.quantity}</td>
                                      <td>{parseFloat(item.rate).toFixed(3)}</td>
                                      <td>{item.discount}%</td>
                                      <td>{item.tax}%</td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={showNarration ? 8 : 7} className="text-center py-4 text-muted">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td colSpan={showNarration ? 4 : 3} className="text-end fw-bold">Total</td>
                  <td className="text-end fw-bold">{totals.totalDebit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                  <td className="text-end fw-bold">{totals.totalCredit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                  <td className="text-end fw-bold">
                    {Math.abs(currentBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} {currentBalance >= 0 ? "Cr" : "Dr"}
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Remove focus outline from buttons */}
      <style jsx>{`
        .no-focus-outline:focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* 👉 Transaction Count Table (Below Back Button Row) */}
      {showCountTable && (
        <Card className="mt-3 mb-3 ">
          <Card.Body>
            <h5 className="mb-3">Transaction Summary</h5>
            <div className="table-responsive">
              <Table striped hover bordered className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Transaction Type</th>
                    <th className="text-center">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Count voucher types
                    const voucherTypeCounts = {};
                    const typeMap = {
                      Invoice: "Purchase",
                      Payment: "Payment",
                      Return: "Purchase Return",
                      Opening: "Opening Balance",
                    };
                    processedData.forEach((entry) => {
                      const displayType = typeMap[entry.voucherType] || entry.voucherType;
                      voucherTypeCounts[displayType] = (voucherTypeCounts[displayType] || 0) + 1;
                    });
                    // All possible types
                    const allTypes = [
                      "Opening Balance",
                      "Purchase",
                      "Payment",
                      "Purchase Return",
                      "Receipt",
                      "Sales Return",
                      "Manufacturing",
                      "Stock Journal",
                      "Stock Adjustment",
                      "Banking",
                      "Journal"
                    ];
                    return allTypes.map((type) => {
                      const count = voucherTypeCounts[type] || 0;
                      return (
                        <tr key={type}>
                          <td className="py-2">
                            {type}
                          </td>
                          <td className="text-center fw-bold py-2 ">{count}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
                <tfoot>
                  <tr className="bg-light fw-bold">
                    <td>Total Transactions</td>
                    <td className="text-center">{processedData.length}</td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Ledgervendor;