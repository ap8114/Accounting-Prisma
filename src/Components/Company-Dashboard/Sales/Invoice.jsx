import React, { useState, useMemo, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { FaArrowLeft } from "react-icons/fa";
import MultiStepSalesForm from './MultiStepSalesForm';
import GetCompanyId from '../../../Api/GetCompanyId';

const statusBadge = (status) => {
  const variant = status === 'Done' ? 'success' : status === 'Pending' ? 'secondary' : 'warning';
  return <Badge bg={variant}>{status}</Badge>;
};

const Invoice = () => {
  const companyId = GetCompanyId();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      "Sales Order": "salesOrder",
      "Delivery Challan": "deliveryChallan",
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

  const handleFormSubmit = (formData, lastStep = 'quotation') => {
    const isEdit = selectedOrder?.id;

    const newOrder = {
      id: isEdit ? selectedOrder.id : Date.now(),
      orderNo: isEdit ? selectedOrder.orderNo : (orders.length ? Math.max(...orders.map(o => o.orderNo)) + 1 : 2045),
      vendor: formData.quotation?.customer || selectedOrder?.vendor || 'Unknown',
      date: new Date().toISOString().split('T')[0],
      amount: `$ ${formData.payment?.amount ? parseFloat(formData.payment.amount).toFixed(2) : '0.00'}`,
      quotation: formData.quotation,
      salesOrder: formData.salesOrder,
      deliveryChallan: formData.deliveryChallan,
      invoice: formData.invoice,
      payment: formData.payment,
      quotationStatus: formData.quotation?.quotationNo ? 'Done' : 'Pending',
      salesOrderStatus: formData.salesOrder?.orderNo ? 'Done' : 'Pending',
      deliveryChallanStatus: formData.deliveryChallan?.challanNo ? 'Done' : 'Pending',
      invoiceStatus: formData.invoice?.invoiceNo ? 'Done' : 'Pending',
      paymentStatus: formData.payment?.amount ? 'Done' : 'Pending',
      draftStep: lastStep,
    };

    setOrders(prev =>
      isEdit
        ? prev.map(o => (o.id === selectedOrder.id ? { ...o, ...newOrder } : o))
        : [newOrder, ...prev]
    );

    handleCloseModal();
  };  

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const dateMatch = (!from || orderDate >= from) && (!to || orderDate <= to);

      const invoiceNoMatch =
        !invoiceNoFilter ||
        (order.invoice?.invoiceNo &&
          order.invoice.invoiceNo.toLowerCase().startsWith(invoiceNoFilter.toLowerCase()));

      const matchesQuotation = !quotationStatusFilter || order.quotationStatus === quotationStatusFilter;
      const matchesSalesOrder = !salesOrderStatusFilter || order.salesOrderStatus === salesOrderStatusFilter;
      const matchesDeliveryChallan = !deliveryChallanStatusFilter || order.deliveryChallanStatus === deliveryChallanStatusFilter;
      const matchesInvoice = !invoiceStatusFilter || order.invoiceStatus === invoiceStatusFilter;
      const matchesPayment = !paymentStatusFilter || order.paymentStatus === paymentStatusFilter;

      let matchesStepName = true;
      if (stepNameFilter) {
        switch (stepNameFilter) {
          case 'Quotation':
            matchesStepName = order.quotationStatus === 'Done';
            break;
          case 'Sales Order':
            matchesStepName = order.salesOrderStatus === 'Done';
            break;
          case 'Delivery Challan':
            matchesStepName = order.deliveryChallanStatus === 'Done';
            break;
          case 'Invoice':
            matchesStepName = order.invoiceStatus === 'Done';
            break;
          case 'Payment':
            matchesStepName = order.paymentStatus === 'Done';
            break;
          default:
            matchesStepName = true;
        }
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
        <Button  variant="primary"  onClick={() => handleCreateNewInvoice()}
          style={{ backgroundColor: "#53b2a5", border: "none", padding: "8px 16px" }} >   + Create sales order  </Button>
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

        <Button variant="outline-secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}>
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
              onChange={(e) => setFromDate(e.target.value)}/>
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
            <Form.Select value={quotationStatusFilter}
              onChange={(e) => setQuotationStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </div>

          <div>
            <label className="form-label text-secondary">Sales Order</label>
            <Form.Select  value={salesOrderStatusFilter}
              onChange={(e) => setSalesOrderStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </div>

          <div>
            <label className="form-label text-secondary">Delivery Challan</label>
            <Form.Select
              value={deliveryChallanStatusFilter}
              onChange={(e) => setDeliveryChallanStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
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
              <option value="Done">Done</option>
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
              <option value="Done">Done</option>
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

      {/* Table */}
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
            filteredOrders?.map((order, idx) => (
              <tr key={order.id}>
                <td>{idx + 1}</td>
                <td>{order.invoice?.invoiceNo || '-'}</td>
                <td>{order.vendor}</td>
                <td>{order.date}</td>
                <td>{order.amount}</td>
                <td>
                  {order.quotationStatus === "Done" && (
                    <Badge bg="success" className="me-1">Quotation</Badge>
                  )}
                  {order.salesOrderStatus === "Done" && (
                    <Badge bg="success" className="me-1">Sales Order</Badge>
                  )}
                  {order.deliveryChallanStatus === "Done" && (
                    <Badge bg="success" className="me-1">Delivery Challan</Badge>
                  )}
                  {order.invoiceStatus === "Done" && (
                    <Badge bg="success" className="me-1">Invoice</Badge>
                  )}
                </td>
                <td>{statusBadge(order.paymentStatus)}</td>
                <td>
                  <Button
                    size="sm"
                    className="me-1 mb-1"
                    variant="outline-primary"
                    onClick={() => handleCreateNewInvoice(order)}
                  >
                    Continue
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal */}
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
    </div>
  );
};

export default Invoice; 