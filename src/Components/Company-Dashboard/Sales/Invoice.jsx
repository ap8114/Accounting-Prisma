import React, { useState, useMemo, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import MultiStepSalesForm from './MultiStepSalesForm';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

// Helper function to get step status
const getStepStatus = (steps, stepName) => {
  if (!steps || !steps[stepName]) return 'pending';
  return steps[stepName].status || 'pending';
};

// Helper function to get step data
const getStepData = (steps, stepName) => {
  if (!steps || !steps[stepName]) return {};
  return steps[stepName] || {};
};

const statusBadge = (status) => {
  const variant = status === 'completed' ? 'success' : status === 'pending' ? 'secondary' : 'warning';
  return <Badge bg={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};

const Invoice = () => {
  const companyId = GetCompanyId();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const [stepModal, setStepModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [invoiceNoFilter, setInvoiceNoFilter] = useState('');
  const [stepNameFilter, setStepNameFilter] = useState('');
  const [quotationStatusFilter, setQuotationStatusFilter] = useState('');
  const [salesOrderStatusFilter, setSalesOrderStatusFilter] = useState('');
  const [deliveryChallanStatusFilter, setDeliveryChallanStatusFilter] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // 🔥 Map dropdown value to tab key
  const getTabKeyFromStepName = (stepName) => {
    const mapping = {
      "Quotation": "quotation",
      "Sales Order": "sales_order",
      "Delivery Challan": "delivery_challan",
      "Invoice": "invoice",
      "Payment": "payment"
    };
    return mapping[stepName] || "quotation";
  };

  // 🔥 Open modal when stepNameFilter changes
  useEffect(() => {
    if (stepNameFilter) {
      const tabKey = getTabKeyFromStepName(stepNameFilter);
      // Open modal with no order (new workflow) but at selected step
      setSelectedOrder({ draftStep: tabKey });
      setStepModal(true);
    }
  }, [stepNameFilter]);

  // 🔥 Fetch data from API when component mounts or companyId changes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!companyId) {
        console.error("Company ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Reset error state before fetching
        console.log(`Fetching orders for company ID: ${companyId}`);
        const response = await axiosInstance.get(`sales-order/company/${companyId}`);

        // The API returns { success, message, data }, so we use response.data.data
        const apiData = response.data?.data;
        if (Array.isArray(apiData)) {
          setOrders(apiData);
        } else {
          console.warn("API returned non-array data, defaulting to empty array:", response.data);
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching sales orders:", err);
        setError("Failed to load sales orders. Please try again later.");
        setOrders([]); // Ensure orders is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [companyId]);

  const handleCreateNewInvoice = (order = null) => {
    setSelectedOrder(order);
    setStepModal(true);
  };

  const handleCloseModal = () => {
    setStepModal(false);
    setSelectedOrder(null);
    // 🔥 Reset step filter when closing modal
    setStepNameFilter('');
  };

  const handleFormSubmit = async (formData, lastStep = 'quotation') => {
    const isEdit = selectedOrder?.id;

    try {
      if (isEdit) {
        // Update existing order
        console.log(`Updating order with ID: ${selectedOrder.id}`, formData);
        // Note: The PUT endpoint might need adjustment based on how the backend expects the payload
        await axiosInstance.put(`sales-order/create-sales-order/${selectedOrder.id}`, {
          ...formData,
          company_id: companyId
        });
      } else {
        // Create new order
        console.log("Creating new order", formData);
        await axiosInstance.post('sales-order/create-sales-order', {
          ...formData,
          company_id: companyId
        });
      }

      // Refetch data after successful operation to get the updated list
      console.log("Refetching orders after save...");
      const response = await axiosInstance.get(`sales-order/company/${companyId}`);
      const apiData = response.data?.data;
      if (Array.isArray(apiData)) {
        setOrders(apiData);
      } else {
        console.warn("API returned non-array data on refetch, defaulting to empty array:", response.data);
        setOrders([]);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Error saving sales order:", err);
      setError("Failed to save sales order. Please check the console for details.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axiosInstance.delete(`sales-order/${orderId}`);
      
      // Update the orders list after successful deletion
      setOrders(orders.filter(order => order.id !== orderId));
      setDeleteConfirm({ show: false, id: null });
    } catch (err) {
      console.error("Error deleting sales order:", err);
      setError("Failed to delete sales order. Please try again later.");
      setDeleteConfirm({ show: false, id: null });
    }
  };

  // 🔥 Fixed useMemo hook: Extract data based on new API structure
  const filteredOrders = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : [];

    return ordersArray.filter(order => {
      // Extract step data from the nested structure
      const quotationData = getStepData(order.steps, 'quotation');
      const salesOrderData = getStepData(order.steps, 'sales_order');
      const invoiceData = getStepData(order.steps, 'invoice');

      // Use the quotation date as the primary date for filtering
      let orderDate = new Date();
      if (quotationData.quotation_date) {
        orderDate = new Date(quotationData.quotation_date);
      } else if (salesOrderData.SO_date) {
        orderDate = new Date(salesOrderData.SO_date);
      }

      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const dateMatch = (!from || orderDate >= from) && (!to || orderDate <= to);

      const invoiceNoMatch =
        !invoiceNoFilter ||
        (invoiceData.invoice_no &&
          invoiceData.invoice_no.toLowerCase().startsWith(invoiceNoFilter.toLowerCase()));

      const matchesQuotation = !quotationStatusFilter || getStepStatus(order.steps, 'quotation') === quotationStatusFilter.toLowerCase();
      const matchesSalesOrder = !salesOrderStatusFilter || getStepStatus(order.steps, 'sales_order') === salesOrderStatusFilter.toLowerCase();
      const matchesDeliveryChallan = !deliveryChallanStatusFilter || getStepStatus(order.steps, 'delivery_challan') === deliveryChallanStatusFilter.toLowerCase();
      const matchesInvoice = !invoiceStatusFilter || getStepStatus(order.steps, 'invoice') === invoiceStatusFilter.toLowerCase();
      const matchesPayment = !paymentStatusFilter || getStepStatus(order.steps, 'payment') === paymentStatusFilter.toLowerCase();

      let matchesStepName = true;
      if (stepNameFilter) {
        const stepToCheck = getTabKeyFromStepName(stepNameFilter);
        matchesStepName = getStepStatus(order.steps, stepToCheck) === 'completed';
      }

      return (
        dateMatch &&
        invoiceNoMatch &&
        matchesQuotation &&
        matchesSalesOrder &&
        matchesDeliveryChallan &&
        matchesInvoice &&
        matchesPayment &&
        matchesStepName
      );
    });
  }, [
    orders, 
    fromDate,
    toDate,
    invoiceNoFilter,
    stepNameFilter,
    quotationStatusFilter,
    salesOrderStatusFilter,
    deliveryChallanStatusFilter,
    invoiceStatusFilter,
    paymentStatusFilter,
  ]);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <FaArrowLeft size={20} color="blue" />
          <h5 className="mb-0">Sales Workflow</h5>
        </div>
        <Button
          variant="primary"
          onClick={() => handleCreateNewInvoice()}
          style={{ backgroundColor: "#53b2a5", border: "none", padding: "8px 16px" }}>
          + Create sales order
        </Button>
      </div>

      {/* 🔥 Sales Steps Dropdown + Show Filters Button */}
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div style={{ minWidth: "180px" }}>
          <label className="form-label text-secondary fw-bold">Sales Steps</label>
          <Form.Select
            value={stepNameFilter}
            onChange={(e) => setStepNameFilter(e.target.value)}>
            <option value="">Select Steps</option>
            <option value="Quotation">Quotation</option>
            <option value="Sales Order">Sales Order</option>
            <option value="Delivery Challan">Delivery Challan</option>
            <option value="Invoice">Invoice</option>
            <option value="Payment">Payment</option>
          </Form.Select>
        </div>

        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* 🔥 Advanced Filters (Collapsible) */}
      {showFilters && (
        <div className="mb-3 p-3 bg-light rounded border d-flex flex-wrap gap-3 align-items-end">
          <div>
            <label className="form-label text-secondary">From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label text-secondary">To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label text-secondary">Invoice No.</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. INV-123"
              value={invoiceNoFilter}
              onChange={(e) => setInvoiceNoFilter(e.target.value)}
              style={{ minWidth: "150px" }}
            />
          </div>

          {/* Quotation Status */}
          <div>
            <label className="form-label text-secondary">Quotation</label>
            <Form.Select
              value={quotationStatusFilter}
              onChange={(e) => setQuotationStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </div>

          <div>
            <label className="form-label text-secondary">Sales Order</label>
            <Form.Select
              value={salesOrderStatusFilter}
              onChange={(e) => setSalesOrderStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </div>

          <div>
            <label className="form-label text-secondary">Delivery Challan</label>
            <Form.Select
              value={deliveryChallanStatusFilter}
              onChange={(e) => setDeliveryChallanStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </div>

          <div>
            <label className="form-label text-secondary">Invoice</label>
            <Form.Select
              value={invoiceStatusFilter}
              onChange={(e) => setInvoiceStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </div>

          <div>
            <label className="form-label text-secondary">Payment</label>
            <Form.Select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFromDate('');
                setToDate('');
                setInvoiceNoFilter('');
                setQuotationStatusFilter('');
                setSalesOrderStatusFilter('');
                setDeliveryChallanStatusFilter('');
                setInvoiceStatusFilter('');
                setPaymentStatusFilter('');
              }}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        /* Table */
        <Table bordered hover responsive className="text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Completed Stages</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredOrders?.map((order, idx) => {
                // Extract data for display
                const quotationData = getStepData(order.steps, 'quotation');
                const salesOrderData = getStepData(order.steps, 'sales_order');
                const invoiceData = getStepData(order.steps, 'invoice');
                const paymentData = getStepData(order.steps, 'payment');

                // Determine customer name
                const customerName = quotationData.qoutation_to_customer_name ||
                  order.company_info?.company_name || 'Unknown';

                // Determine date
                let displayDate = 'N/A';
                if (quotationData.quotation_date) {
                  displayDate = new Date(quotationData.quotation_date).toLocaleDateString();
                } else if (invoiceData.invoice_date) {
                  displayDate = new Date(invoiceData.invoice_date).toLocaleDateString();
                }

                // Calculate total amount from items if not available directly
                let displayAmount = 'N/A';
                if (order.total && order.total !== "0") {
                  displayAmount = `$${order.total}`;
                } else if (order.items && order.items.length > 0) {
                  const total = order.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
                  displayAmount = `$${total.toFixed(2)}`;
                }

                return (
                  <tr key={order.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{invoiceData.invoice_no || '-'}</td>
                    <td>{customerName}</td>
                    <td>{displayDate}</td>
                    <td>{displayAmount}</td>
                    <td>
                      {getStepStatus(order.steps, 'quotation') === "completed" && (
                        <Badge bg="success" className="me-1">Quotation</Badge>
                      )}
                      {getStepStatus(order.steps, 'sales_order') === "completed" && (
                        <Badge bg="success" className="me-1">Sales Order</Badge>
                      )}
                      {getStepStatus(order.steps, 'delivery_challan') === "completed" && (
                        <Badge bg="success" className="me-1">Delivery Challan</Badge>
                      )}
                      {getStepStatus(order.steps, 'invoice') === "completed" && (
                        <Badge bg="success" className="me-1">Invoice</Badge>
                      )}
                    </td>
                    <td>{statusBadge(getStepStatus(order.steps, 'payment'))}</td>
                    <td>
                      <Button
                        size="sm"
                        className="me-1 mb-1"
                        variant="outline-primary"
                        onClick={() => handleCreateNewInvoice(order)}
                      >
                        Continue
                      </Button>
                      <Button
                        size="sm"
                        className="mb-1"
                        variant="outline-danger"
                        onClick={() => setDeleteConfirm({ show: true, id: order.id })}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </Table>
      )}

      {/* Modal for creating/editing sales order */}
      <Modal show={stepModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedOrder && selectedOrder.id
              ? 'Continue Sales Workflow'
              : stepNameFilter
                ? `Create New - ${stepNameFilter}`
                : 'Create Sales Order'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MultiStepSalesForm
            initialData={selectedOrder}
            initialStep={selectedOrder?.draftStep || getTabKeyFromStepName(stepNameFilter) || 'quotation'}
            onSubmit={handleFormSubmit}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteConfirm.show} onHide={() => setDeleteConfirm({ show: false, id: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this sales order? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm({ show: false, id: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDeleteOrder(deleteConfirm.id)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Invoice;