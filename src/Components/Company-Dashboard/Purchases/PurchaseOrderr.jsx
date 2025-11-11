import React, { useState, useMemo } from "react";
import { Table, Button, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import MultiStepPurchaseForms from "./MultiStepPurchaseForms";
import { FaArrowRight } from "react-icons/fa";

const initialOrders = [];

const statusBadge = (status) => {
  let variant;
  switch (status) {
    case "Done":
      variant = "success";
      break;
    case "Pending":
      variant = "secondary";
      break;
    case "Cancelled":
      variant = "danger";
      break;
    default:
      variant = "warning";
  }
  return <Badge bg={variant}>{status}</Badge>;
};

const PurchaseOrderr = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [stepModal, setStepModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter states (updated)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchOrderNo, setSearchOrderNo] = useState("");

  // Alag-alag status filters
  // Alag-alag status filters
  const [purchaseQuotationStatusFilter, setPurchaseQuotationStatusFilter] =
    useState("");
  const [purchaseOrderStatusFilter, setPurchaseOrderStatusFilter] =
    useState("");
  const [goodsReceiptStatusFilter, setGoodsReceiptStatusFilter] = useState("");
  const [billStatusFilter, setBillStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  const handleCreateNewPurchase = (order = null) => {
    setSelectedOrder(order);
    setStepModal(true);
  };

  const handleCloseModal = () => {
    setStepModal(false);
    setSelectedOrder(null);
  };

  const handleFormSubmit = (formData, lastStep = "quotation") => {
    const isEdit = selectedOrder?.id;
    const newOrderNo = orders.length
      ? Math.max(...orders.map((o) => o.orderNo)) + 1
      : 2045;
    const today = new Date().toISOString().split("T")[0];

    // Statuses based on form data
    const purchaseQuotationStatus = formData.quotation?.quotationNo
      ? "Done"
      : "Pending";
    const purchaseOrderStatus = formData.salesOrder?.orderNo
      ? "Done"
      : "Pending";
    const goodsReceiptStatus = formData.goodsReceipt?.receiptNo
      ? "Done"
      : "Pending"; // Goods Receipt
    const billStatus = formData.invoice?.invoiceNo ? "Done" : "Pending"; // Bill = Invoice
    const paymentStatus = formData.payment?.amount ? "Done" : "Pending";

    const newOrder = {
      id: isEdit ? selectedOrder.id : Date.now(),
      orderNo: isEdit ? selectedOrder.orderNo : newOrderNo,
      vendor: formData.quotation.customer || "",
      date: today,
      amount: `$ ${formData.payment?.amount || 0}`,
      quotation: formData.quotation,
      salesOrder: formData.salesOrder,
      goodsReceipt: formData.goodsReceipt, // ✅ New field
      invoice: formData.invoice,
      payment: formData.payment,

      // Updated Status Keys
      purchaseQuotationStatus,
      purchaseOrderStatus,
      goodsReceiptStatus,
      billStatus,
      paymentStatus,
      draftStep: lastStep,
    };

    setOrders((prev) =>
      isEdit
        ? prev.map((o) => (o.id === selectedOrder.id ? newOrder : o))
        : [newOrder, ...prev]
    );

    handleCloseModal();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Order No filter
      const matchesOrderNo =
        !searchOrderNo ||
        order.orderNo?.toString().includes(searchOrderNo.trim()) ||
        order.invoice?.invoiceNo?.includes(searchOrderNo.trim());

      // Date filter
      const orderDate = new Date(order.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const afterFrom = !from || orderDate >= from;
      const beforeTo = !to || orderDate <= to;

      // Individual status filters
      const matchesPurchaseQuotationStatus =
        !purchaseQuotationStatusFilter ||
        order.purchaseQuotationStatus === purchaseQuotationStatusFilter;

      const matchesPurchaseOrderStatus =
        !purchaseOrderStatusFilter ||
        order.purchaseOrderStatus === purchaseOrderStatusFilter;

      const matchesGoodsReceiptStatus =
        !goodsReceiptStatusFilter ||
        order.goodsReceiptStatus === goodsReceiptStatusFilter;

      const matchesBillStatus =
        !billStatusFilter || order.billStatus === billStatusFilter;

      const matchesPaymentStatus =
        !paymentStatusFilter || order.paymentStatus === paymentStatusFilter;

      return (
        matchesOrderNo &&
        afterFrom &&
        beforeTo &&
        matchesPurchaseQuotationStatus &&
        matchesPurchaseOrderStatus &&
        matchesGoodsReceiptStatus &&
        matchesBillStatus &&
        matchesPaymentStatus
      );
    });
  }, [
    orders,
    searchOrderNo,
    fromDate,
    toDate,
    purchaseQuotationStatusFilter,
    purchaseOrderStatusFilter,
    goodsReceiptStatusFilter,
    billStatusFilter,
    paymentStatusFilter,
  ]);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FaArrowRight size={20} color="red" />
          <h5 className="mb-0">Purchase Workflow</h5>
        </div>

        <Button
          variant="primary"
          className="mb-3"
          onClick={() => handleCreateNewPurchase()}
          style={{
            backgroundColor: "#53b2a5",
            border: "none",
            padding: "8px 16px",
          }}
        >
          + Create New Purchase
        </Button>
      </div>
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Purchase No</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by No"
              value={searchOrderNo}
              onChange={(e) => setSearchOrderNo(e.target.value)}
            />
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

        {/* Purchase Quotation */}
        <Col md={3}>
          <Form.Group>
            <Form.Label>Purchase Quotation</Form.Label>
            <Form.Select
              value={purchaseQuotationStatusFilter}
              onChange={(e) => setPurchaseQuotationStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Purchase Order */}
        <Col md={3}>
          <Form.Group>
            <Form.Label>Purchase Order</Form.Label>
            <Form.Select
              value={purchaseOrderStatusFilter}
              onChange={(e) => setPurchaseOrderStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Goods Receipt */}
        <Col md={3}>
          <Form.Group>
            <Form.Label>Goods Receipt</Form.Label>
            <Form.Select
              value={goodsReceiptStatusFilter}
              onChange={(e) => setGoodsReceiptStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Bill */}
        <Col md={3}>
          <Form.Group>
            <Form.Label>Bill</Form.Label>
            <Form.Select
              value={billStatusFilter}
              onChange={(e) => setBillStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Payment */}
        <Col md={3}>
          <Form.Group>
            <Form.Label>Payment</Form.Label>
            <Form.Select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Clear Button */}
        <Col md={3} className="d-flex align-items-end">
          <Button
            variant="secondary"
            onClick={() => {
              setSearchOrderNo("");
              setFromDate("");
              setToDate("");
              setPurchaseQuotationStatusFilter("");
              setPurchaseOrderStatusFilter("");
              setGoodsReceiptStatusFilter("");
              setBillStatusFilter("");
              setPaymentStatusFilter("");
            }}
          >
            Clear
          </Button>
        </Col>
      </Row>

      <Table bordered hover responsive className="text-center align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Purchase No</th>
            <th>Vendor</th>
            <th>Voucher Type</th>
            <th>Voucher No</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Purchase Quotation</th> {/* Updated */}
            <th>Purchase Order</th> {/* Updated */}
            <th>Goods Receipt</th> {/* Updated */}
            <th>Bill</th> {/* Updated */}
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, idx) => (
            <tr key={order.id}>
              <td>{idx + 1}</td>
              <td>{order.invoice?.invoiceNo || order.orderNo || "-"}</td>
              <td>{order.vendor}</td>
              <td>{order.payment?.voucherType || "-"}</td>
              <td>{order.payment?.voucherNo || "-"}</td>
              <td>{order.date}</td>
              <td>{order.amount}</td>
              <td>{statusBadge(order.purchaseQuotationStatus)}</td>{" "}
              {/* Updated */}
              <td>{statusBadge(order.purchaseOrderStatus)}</td> {/* Updated */}
              <td>{statusBadge(order.goodsReceiptStatus)}</td> {/* Updated */}
              <td>{statusBadge(order.billStatus)}</td> {/* Updated */}
              <td>{statusBadge(order.paymentStatus)}</td>
              <td>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => handleCreateNewPurchase(order)}
                >
                  Continue
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={stepModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedOrder ? "Continue Purchase" : "Create Purchase"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MultiStepPurchaseForms
            initialData={selectedOrder}
            initialStep={selectedOrder?.draftStep}
            onSubmit={handleFormSubmit}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PurchaseOrderr;
