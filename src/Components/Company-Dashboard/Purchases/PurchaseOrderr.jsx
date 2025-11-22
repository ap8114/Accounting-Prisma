import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import MultiStepPurchaseForms from "./MultiStepPurchaseForms";
import { FaArrowRight } from "react-icons/fa";
import BaseUrl from "../../../Api/BaseUrl";
import GetCompanyId from "../../../Api/GetCompanyId";
// Utility to map API status to UI status ("Done", "Pending", etc.)
const mapApiStatusToUiStatus = (apiStatus) => {
  if (!apiStatus || apiStatus === "Pending") return "Pending";
  if (["Approved", "Confirmed", "Completed", "completed"].includes(apiStatus))
    return "Done";
  return "Pending"; // fallback
};

// Utility to format amount (e.g., "₹9,510")
const formatAmount = (value) => {
  if (!value || isNaN(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(Number(value));
};

const PurchaseOrderr = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stepModal, setStepModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const companyId = GetCompanyId();
  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchOrderNo, setSearchOrderNo] = useState("");
  const [purchaseQuotationStatusFilter, setPurchaseQuotationStatusFilter] = useState("");
  const [purchaseOrderStatusFilter, setPurchaseOrderStatusFilter] = useState("");
  const [goodsReceiptStatusFilter, setGoodsReceiptStatusFilter] = useState("");
  const [billStatusFilter, setBillStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  // Fetch orders from API
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${BaseUrl}purchase-orders/company/${companyId}`
        );
        if (!response.ok) throw new Error("Failed to fetch purchase orders");
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const formattedOrders = result.data.map((po) => {
            // Find step data
            const quotationStep = po.steps.find((s) => s.step === "quotation");
            const poStep = po.steps.find((s) => s.step === "purchase_order");
            const grStep = po.steps.find((s) => s.step === "goods_receipt");
            const billStep = po.steps.find((s) => s.step === "bill");
            const paymentStep = po.steps.find((s) => s.step === "payment");

            return {
              id: po.company_info.id,
              orderNo: poStep?.data?.PO_no || poStep?.data?.Manual_PO_ref || "-",
              vendor: quotationStep?.data?.quotation_from_vendor_name || "-",
              date: poStep?.data?.PO_date || po.company_info.created_at.split("T")[0],
              amount: formatAmount(po.total),
              quotation: quotationStep?.data || null,
              salesOrder: poStep?.data || null,
              goodsReceipt: grStep?.data || null,
              invoice: billStep?.data || null,
              payment: paymentStep?.data || null,

              purchaseQuotationStatus: mapApiStatusToUiStatus(quotationStep?.status),
              purchaseOrderStatus: mapApiStatusToUiStatus(poStep?.status),
              goodsReceiptStatus: mapApiStatusToUiStatus(grStep?.status),
              billStatus: mapApiStatusToUiStatus(billStep?.status),
              paymentStatus: mapApiStatusToUiStatus(paymentStep?.status),
              draftStep: "purchase_order", // Default to PO if continuing
            };
          });
          setOrders(formattedOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load purchase orders.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchPurchaseOrders();
    } else {
      setLoading(false);
    }
  }, [companyId]);

  const handleCreateNewPurchase = (order = null) => {
    setSelectedOrder(order);
    setStepModal(true);
  };

  const handleCloseModal = () => {
    setStepModal(false);
    setSelectedOrder(null);
  };

  const handleFormSubmit = (formData, lastStep = "quotation") => {
    // TODO: Implement POST/PUT API calls if editing/creating
    alert("Form submit logic not connected to backend yet.");
    handleCloseModal();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesOrderNo =
        !searchOrderNo ||
        order.orderNo?.toString().includes(searchOrderNo.trim()) ||
        (order.invoice?.Bill_no || "").includes(searchOrderNo.trim());

      const orderDate = new Date(order.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const afterFrom = !from || orderDate >= from;
      const beforeTo = !to || orderDate <= to;

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

  if (loading) return <div className="p-4">Loading purchase orders...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;

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
            <th>Purchase Quotation</th>
            <th>Purchase Order</th>
            <th>Goods Receipt</th>
            <th>Bill</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="13">No purchase orders found.</td>
            </tr>
          ) : (
            filteredOrders.map((order, idx) => (
              <tr key={order.id}>
                <td>{idx + 1}</td>
                <td>{order.orderNo}</td>
                <td>{order.vendor}</td>
                <td>-</td>
                <td>-</td>
                <td>{order.date}</td>
                <td>{order.amount}</td>
                <td>{statusBadge(order.purchaseQuotationStatus)}</td>
                <td>{statusBadge(order.purchaseOrderStatus)}</td>
                <td>{statusBadge(order.goodsReceiptStatus)}</td>
                <td>{statusBadge(order.billStatus)}</td>
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
            ))
          )}
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