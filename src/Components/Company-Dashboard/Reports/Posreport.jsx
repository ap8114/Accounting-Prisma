import React, { useEffect, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Modal, Button, Table, Form, Row, Col } from "react-bootstrap";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";
import { CurrencyContext } from "../../../hooks/CurrencyContext";

const PosReport = () => {
  const companyId = GetCompanyId();
  const [posData, setPosData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalAmount: 0,
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(false);

  const { convertPrice, symbol, currency } = useContext(CurrencyContext);

  // ✅ Fetch POS data
  const fetchPosData = async () => {
    try {
      const res = await axiosInstance.get(`posinvoice/company/${companyId}`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      // ✅ Auto-generate invoice numbers
      const updatedData = data.map((item, index) => ({
        ...item,
        invoiceNumber: `INV${String(index + 1).padStart(3, "0")}`,
      }));

      setPosData(updatedData);
      setFilteredData(updatedData);
      calculateSummary(updatedData);
    } catch (error) {
      console.error("Error fetching POS data:", error);
      setPosData([]);
      setFilteredData([]);
    }
  };

  // Calculate summary
  const calculateSummary = (data) => {
    const totalInvoices = data.length;
    const totalAmount = data.reduce(
      (acc, item) => acc + parseFloat(item.total || 0),
      0
    );
    setSummary({ totalInvoices, totalAmount });
  };

  // Apply filters
  const applyFilters = () => {
    let result = [...posData];
    
    // Payment status filter
    if (paymentStatusFilter) {
      result = result.filter(item => item.payment_status === paymentStatusFilter);
    }
    
    // Date range filter
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      result = result.filter(item => new Date(item.created_at) >= from);
    }
    
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      result = result.filter(item => new Date(item.created_at) <= to);
    }
    
    // Customer name search
    if (customerSearch) {
      const searchLower = customerSearch.toLowerCase();
      result = result.filter(item => 
        item?.customer?.name_english?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredData(result);
    calculateSummary(result);
    setActiveFilters(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setPaymentStatusFilter("");
    setFromDate("");
    setToDate("");
    setCustomerSearch("");
    setFilteredData([...posData]);
    calculateSummary(posData);
    setActiveFilters(false);
  };

  // ✅ Delete invoice
  const handleDelete = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await axiosInstance.delete(`posinvoice/${invoiceId}`);
      alert("Invoice deleted successfully!");
      fetchPosData();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice!");
    }
  };

  useEffect(() => {
    fetchPosData();
  }, []);

  // Apply filters when any filter changes
  useEffect(() => {
    if (posData.length > 0) {
      applyFilters();
    }
  }, [paymentStatusFilter, fromDate, toDate, customerSearch, posData]);

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-success';
      case 'cash':
        return 'bg-primary';
      case 'partial':
        return 'bg-warning';
      case 'due':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold">POS Report</h4>
        <p className="text-muted">Daily invoice transactions summary</p>
      </div>

      {/* Summary Boxes */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Invoices", value: summary.totalInvoices, border: "info" },
          {
            label: "Total Amount",
            value: `${symbol} ${convertPrice(summary.totalAmount.toFixed(2))}`,
            border: "success",
          },
        ].map((item, idx) => (
          <div className="col-12 col-md-4" key={idx}>
            <div
              className={`shadow-sm rounded p-3 bg-white border border-${item.border} d-flex align-items-center justify-content-between`}
            >
              <div>
                <small className="text-muted">{item.label}</small>
                <h5 className="fw-bold">{item.value}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Filters</h5>
            {activeFilters && (
              <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
          
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Payment Status</Form.Label>
                <Form.Select 
                  value={paymentStatusFilter} 
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="cash">Cash</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="due">Due</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Customer Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Search customer..." 
                  value={customerSearch} 
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <div className="bg-white rounded p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="fw-bold mb-0">Transaction Details</h5>
         
        </div>

        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Invoice No</th>
                <th>Customer Name</th>
                <th>Customer Email</th>
                <th>Payment Type</th>
                <th>Subtotal</th>
                <th>Total</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item?.invoiceNumber}</td>
                    <td>{item?.customer?.name_english || "—"}</td>
                    <td>{item?.customer?.email || "—"}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(item.payment_status)}`}>
                        {item?.payment_status || "—"}
                      </span>
                    </td>
                    <td>
                      {symbol} {convertPrice(item?.subtotal || "0.00")}
                    </td>
                    <td>
                      {symbol} {convertPrice(item?.total || "0.00")}
                    </td>
                    <td>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setSelectedInvoice(item);
                          setShowModal(true);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-3">
                    {activeFilters ? "No invoices match your filters" : "No invoice data available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3 px-2">
          <span className="small text-muted">
            Showing {filteredData.length} of {posData.length} invoices
          </span>
        </div>

        {/* Info Card */}
        <Card className="mb-4 p-3 shadow rounded-4 mt-2">
          <Card.Body>
            <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">
              Page Info
            </h5>
            <ul
              className="text-muted fs-6 mb-0"
              style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}
            >
              <li>Displays all POS invoices linked to this company.</li>
              <li>Shows customer information and total billing values.</li>
              <li>Supports currency conversion dynamically ({currency}).</li>
              <li>Allows filtering by payment status, date range, and customer name.</li>
              <li>Supports viewing detailed product information.</li>
              <li>Supports deletion of invoices safely.</li>
            </ul>
          </Card.Body>
        </Card>
      </div>

      {/* ✅ View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Invoice Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice ? (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <p><strong>Invoice No:</strong> {selectedInvoice.invoiceNumber}</p>
                  <p><strong>Customer:</strong> {selectedInvoice.customer?.name_english || "—"}</p>
                  <p><strong>Email:</strong> {selectedInvoice.customer?.email || "—"}</p>
                  <p><strong>Phone:</strong> {selectedInvoice.customer?.phone || "—"}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Payment Type:</strong> 
                    <span className={`badge ms-2 ${getStatusBadge(selectedInvoice.payment_status)}`}>
                      {selectedInvoice.payment_status || "—"}
                    </span>
                  </p>
                  <p><strong>Subtotal:</strong> {symbol} {convertPrice(selectedInvoice.subtotal || "0.00")}</p>
                  <p><strong>Tax:</strong> {selectedInvoice.tax?.tax_class} ({selectedInvoice.tax?.tax_value}%)</p>
                  <p><strong>Total:</strong> {symbol} {convertPrice(selectedInvoice.total || "0.00")}</p>
                </div>
              </div>

              <h6 className="mt-4">Products:</h6>
              <Table bordered hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.products?.length > 0 ? (
                    selectedInvoice.products.map((p, i) => (
                      <tr key={i}>
                        <td>{p.item_name || "—"}</td>
                        <td>{p.quantity || "0"}</td>
                        <td>{symbol} {convertPrice(p.price || "0.00")}</td>
                        <td>{symbol} {convertPrice((parseFloat(p.price || 0) * parseInt(p.quantity || 0)).toFixed(2))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No product data
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </>
          ) : (
            <p>No invoice selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PosReport;