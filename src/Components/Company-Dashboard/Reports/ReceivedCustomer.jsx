import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Table, Row, Col, Dropdown } from 'react-bootstrap';
import './ReceivedCustomer.css';
import axiosInstance from '../../../Api/axiosInstance';
import GetCompanyId from '../../../Api/GetCompanyId';

// Static payment data (as per your example)
const paymentData = [
  {
    account: 'Muhammad Yaqoob',
    description: 'Sales\nVoucher No: IV/843/78\nVoucher Date: 24/05/2025\nVoucher Due Date: 27/06/2025',
    totalAmount: 454.000,
    outstandingAmount: 454.000,
    amountToPay: 454.000,
  },
  {
    account: 'Muhammad Yaqoob',
    description: 'Sales\nVoucher No: IV/843/78\nVoucher Date: 24/05/2025\nVoucher Due Date: 31/05/2025',
    totalAmount: 8205.120,
    outstandingAmount: 8205.120,
    amountToPay: 8205.120,
  },
  {
    account: 'Muhammad Yaqoob',
    description: 'Sales\nVoucher No: IV/843/74\nVoucher Date: 20/07/2025\nVoucher Due Date: 27/07/2025',
    totalAmount: 1965.960,
    outstandingAmount: 1965.960,
    amountToPay: 1965.960,
  },
  {
    account: 'Muhammad Yaqoob',
    description: 'Sales\nVoucher No: IV/843/74\nVoucher Date: 21/07/2025\nVoucher Due Date: 30/07/2025',
    totalAmount: 318.800,
    outstandingAmount: 318.800,
    amountToPay: 318.800,
  },
];

const discountOptions = [
  "Basic Salary",
  "Cartage",
  "Commission given",
  "Currency Exchange Expenses",
  "Customs Clearance",
  "Discount On Sale",
  "Employee state Insurance Corporation",
  "Freight charge",
  "House Rent Allowance - HRA",
  "Indices CS expenses",
  "Medical Allowance - MA",
  "Rubber Expenses",
  "Special Allowance - SA"
];

const ReceivedCustomer = () => {
  const [showReceiptTable, setShowReceiptTable] = useState(false);
  const [showDiscountFields, setShowDiscountFields] = useState(false);
  const [taxDeducted, setTaxDeducted] = useState(false);
  const [showNarration, setShowNarration] = useState(true);
  const [discountGiven, setDiscountGiven] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [subTotal, setSubTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(500);
  const [receivedFrom, setReceivedFrom] = useState('');
  const [receivedFromSearch, setReceivedFromSearch] = useState('');
  const [narration, setNarration] = useState('');
  const [autoReceiptNo, setAutoReceiptNo] = useState('');
  const [manualReceiptNo, setManualReceiptNo] = useState('');
  const [referenceDocument, setReferenceDocument] = useState('');
  const [taxPercent, setTaxPercent] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const companyId = GetCompanyId();

  const receivedFromRef = useRef(null);
  const receivedIntoRef = useRef(null);

  // State for Received Into (Accounts)
  const [receivedInto, setReceivedInto] = useState("");
  const [receivedIntoSearch, setReceivedIntoSearch] = useState("");
  const [receivedIntoOptions, setReceivedIntoOptions] = useState([]);
  const [filteredReceivedInto, setFilteredReceivedInto] = useState([]);

  // State for Received From (Customers)
  const [receivedFromOptions, setReceivedFromOptions] = useState([]);
  const [filteredReceivedFrom, setFilteredReceivedFrom] = useState([]);

  // 🔥 Fetch Accounts (Received Into) — FIXED
  useEffect(() => {
    if (companyId) {
      axiosInstance.get(`account/getAccountByCompany/${companyId}`)
        .then((res) => {
          // ✅ Fix: Use res.data.data (not res.data)
          const accounts = res.data.data || [];
          const options = accounts.map((item) => item.account_name || item.name || '').filter(name => name.trim() !== '');
          setReceivedIntoOptions(options);
          setFilteredReceivedInto(options);
        })
        .catch((err) => {
          console.error("Account API Error:", err);
          setReceivedIntoOptions([]);
          setFilteredReceivedInto([]);
        });
    }
  }, [companyId]);

  // 🔥 Fetch Customers (Received From) — FIXED
  useEffect(() => {
    if (companyId) {
      axiosInstance.get(`customers/getCustomersByCompany/${companyId}`)
        .then((res) => {
          // ✅ Fix: Use res.data.data and item.name_english
          const customers = res.data.data || [];
          const options = customers
            .map((item) => item.name_english || '')
            .filter(name => name.trim() !== '');
          setReceivedFromOptions(options);
          setFilteredReceivedFrom(options);
        })
        .catch((err) => {
          console.error("Customer API Error:", err);
          setReceivedFromOptions([]);
          setFilteredReceivedFrom([]);
        });
    }
  }, [companyId]);

  // Filter Received Into
  useEffect(() => {
    if (receivedIntoSearch) {
      setFilteredReceivedInto(
        receivedIntoOptions.filter((opt) =>
          opt.toLowerCase().includes(receivedIntoSearch.toLowerCase())
        )
      );
    } else {
      setFilteredReceivedInto(receivedIntoOptions);
    }
  }, [receivedIntoSearch, receivedIntoOptions]);

  // Filter Received From
  useEffect(() => {
    if (receivedFromSearch) {
      setFilteredReceivedFrom(
        receivedFromOptions.filter((opt) =>
          opt.toLowerCase().includes(receivedFromSearch.toLowerCase())
        )
      );
    } else {
      setFilteredReceivedFrom(receivedFromOptions);
    }
  }, [receivedFromSearch, receivedFromOptions]);

  // Auto-generate receipt number
  useEffect(() => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    setAutoReceiptNo(`AUTO-RCV-${timestamp}-${randomNum}`);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (receivedFromRef.current && !receivedFromRef.current.contains(event.target)) {
        document.getElementById('receivedFromDropdown')?.classList.remove('show');
      }
      if (receivedIntoRef.current && !receivedIntoRef.current.contains(event.target)) {
        document.getElementById('receivedIntoDropdown')?.classList.remove('show');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (dropdownId) => {
    const dropdown = document.getElementById(dropdownId);
    dropdown?.classList.toggle('show');
  };

  const handleCalculateDiscount = () => {
    const percent = parseFloat(discountPercent) || 0;
    const value = ((subTotal * percent) / 100).toFixed(3);
    setDiscountValue(value);
    setTotalAmount((subTotal - parseFloat(value)).toFixed(3));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <div className="received-customer p-3">
      <h4 className="fw-semibold mb-4">Received From Customer</h4>

      <Container className="shadow-sm rounded-3 bg-white border p-4">
        {/* Header Row */}
        <Row className="g-3 mb-4">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-semibold text-secondary">Receipt No (Auto)</Form.Label>
              <Form.Control type="text" value={autoReceiptNo} readOnly className="bg-light" />
              <Form.Label className="fw-semibold text-secondary mt-2">Receipt No (Manual)</Form.Label>
              <Form.Control
                type="text"
                value={manualReceiptNo}
                onChange={(e) => setManualReceiptNo(e.target.value)}
                placeholder="Enter manual receipt no"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-semibold text-secondary">Voucher Date</Form.Label>
              <Form.Control type="date" defaultValue="2025-08-23" />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group ref={receivedIntoRef}>
              <Form.Label className="fw-semibold text-secondary">Received Into</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  value={receivedInto}
                  onChange={(e) => {
                    setReceivedInto(e.target.value);
                    setReceivedIntoSearch(e.target.value);
                  }}
                  onClick={() => toggleDropdown("receivedIntoDropdown")}
                  placeholder="Select or type..."
                />
                <div
                  id="receivedIntoDropdown"
                  className="dropdown-menu position-absolute w-100 rounded-2 border shadow"
                  style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
                >
                  {filteredReceivedInto.length > 0 ? (
                    filteredReceivedInto.map((opt, idx) => (
                      <Dropdown.Item
                        key={idx}
                        onClick={() => {
                          setReceivedInto(opt);
                          setReceivedIntoSearch("");
                          document.getElementById("receivedIntoDropdown")?.classList.remove("show");
                        }}
                        className="py-2 px-3"
                      >
                        {opt}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled>No accounts found</Dropdown.Item>
                  )}
                </div>
              </div>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group ref={receivedFromRef}>
              <Form.Label className="fw-semibold text-secondary">Received From</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  value={receivedFrom}
                  onChange={(e) => {
                    setReceivedFrom(e.target.value);
                    setReceivedFromSearch(e.target.value);
                  }}
                  onClick={() => toggleDropdown('receivedFromDropdown')}
                  placeholder="Select or type..."
                />
                <div
                  id="receivedFromDropdown"
                  className="dropdown-menu position-absolute w-100 rounded-2 border shadow"
                  style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                >
                  {filteredReceivedFrom.length > 0 ? (
                    filteredReceivedFrom.map((opt, idx) => (
                      <Dropdown.Item
                        key={idx}
                        onClick={() => {
                          setReceivedFrom(opt);
                          setReceivedFromSearch('');
                          document.getElementById('receivedFromDropdown')?.classList.remove('show');
                        }}
                        className="py-2 px-3"
                      >
                        {opt}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled>No customers found</Dropdown.Item>
                  )}
                </div>
              </div>
            </Form.Group>
          </Col>
        </Row>

        {/* Upload Section */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold text-secondary">Upload Document</Form.Label>
              <Form.Control type="file" onChange={handleFileUpload} />
              {uploadedFile && (
                <small className="text-success mt-1 d-block">
                  📄 {uploadedFile.name}
                </small>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Toggle Options */}
        <div className="d-flex flex-wrap gap-3 mb-4">
          <Form.Check
            type="checkbox"
            label="Receipt against invoice"
            checked={showReceiptTable}
            onChange={() => setShowReceiptTable(!showReceiptTable)}
            className="fw-medium"
          />
          <Form.Check
            type="checkbox"
            label="Discount"
            checked={showDiscountFields}
            onChange={() => setShowDiscountFields(!showDiscountFields)}
            className="fw-medium"
          />
          <Form.Check
            type="checkbox"
            label="Tax Deducted"
            checked={taxDeducted}
            onChange={() => setTaxDeducted(!taxDeducted)}
            className="fw-medium"
          />
        </div>

        {/* Tax Input */}
        {taxDeducted && (
          <Row className="mb-4">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary">Tax Percentage (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="e.g. 5.0"
                  className="border-primary"
                />
              </Form.Group>
            </Col>
          </Row>
        )}

        {/* Payment Table */}
        {showReceiptTable && (
          <div className="mb-4">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Invoice Payments</h6>
            <Table bordered hover responsive className="bg-white rounded-2 overflow-hidden">
              <thead className="bg-light text-dark">
                <tr>
                  <th>Account</th>
                  <th>Description</th>
                  <th>Total</th>
                  <th>Outstanding</th>
                  <th>Pay</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="align-middle">{row.account}</td>
                    <td>
                      {row.description.split('\n').map((line, i) => (
                        <small key={i} className="d-block text-muted">{line}</small>
                      ))}
                    </td>
                    <td className="text-end fw-bold">{row.totalAmount.toFixed(3)}</td>
                    <td className="text-end">{row.outstandingAmount.toFixed(3)}</td>
                    <td>
                      <Form.Control
                        type="number"
                        defaultValue={row.amountToPay}
                        min="0"
                        step="0.001"
                        size="sm"
                        className="text-end"
                      />
                    </td>
                    <td className="text-center">
                      <Form.Check type="checkbox" className="m-1" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Advance & Final Payment Controls */}
            <div className="d-flex justify-content-center align-items-center flex-wrap gap-4 mt-4">
              <div className="text-center">
                <span className="d-block text-secondary fw-medium mb-1">Advance Payment</span>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  style={{ width: '150px', display: 'inline-block' }}
                />
              </div>
              <div className="text-center">
                <span className="d-block text-secondary fw-medium mb-1">Final Amount</span>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  style={{ width: '150px', display: 'inline-block' }}
                />
                <Button variant="success" className="ms-2 px-4 fw-bold">
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Discount Section */}
        {showDiscountFields && (
          <div className="p-3 bg-light rounded-3 mb-4 border">
            <h6 className="fw-bold mb-3 text-primary">Apply Discount</h6>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="text-secondary">Discount Type</Form.Label>
                  <Form.Select
                    value={discountGiven}
                    onChange={(e) => setDiscountGiven(e.target.value)}
                  >
                    <option value="">Select Discount</option>
                    {discountOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="text-secondary">Discount %</Form.Label>
                  <Form.Control
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    step="0.001"
                    placeholder="0.000"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button
                  variant="warning"
                  onClick={handleCalculateDiscount}
                  className="w-100"
                >
                  Calculate
                </Button>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="text-secondary">Sub Total</Form.Label>
                  <Form.Control
                    type="number"
                    value={subTotal}
                    onChange={(e) => setSubTotal(e.target.value)}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="text-secondary">Discount Value</Form.Label>
                  <Form.Control
                    type="number"
                    value={discountValue}
                    readOnly
                    className="bg-white fw-bold"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        )}

        {/* Narration & Total */}
        <Row className="align-items-start g-3">
          <Col md={9}>
            <Form.Group>
              <Form.Label className="fw-semibold text-secondary">
                Narration{' '}
                <small className="text-muted">(Ctrl + Enter for new line)</small>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="shadow-sm"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <div className="bg-light p-3 rounded-3 border">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Sub Total</Form.Label>
                <Form.Control
                  type="number"
                  value={subTotal}
                  onChange={(e) => setSubTotal(e.target.value)}
                  className="fw-bold text-end"
                  style={{ fontSize: '1.1rem' }}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary">Total Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={totalAmount}
                  readOnly
                  className="fw-bold text-end text-success"
                  style={{ fontSize: '1.2rem' }}
                />
              </Form.Group>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReceivedCustomer;