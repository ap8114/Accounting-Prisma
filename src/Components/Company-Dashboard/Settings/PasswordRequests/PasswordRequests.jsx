// CompanyPasswordRequests.js
import React, { useState } from "react";
import { Table, Button, Badge, Modal, Form } from "react-bootstrap";

const PasswordRequests = () => {
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState([
    { id: 101, date: "2025-09-30", status: "Pending", reason: "Security concerns" },
    { id: 100, date: "2025-09-28", status: "Approved", reason: "Old admin left", emailSent: true },
    { id: 99, date: "2025-09-27", status: "Rejected", reason: "Invalid request" },
  ]);

  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return; // avoid empty
    const newRequest = {
      id: requests.length + 1,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      reason: reason,
      emailSent: false,
    };
    setRequests([newRequest, ...requests]);
    setReason(""); // reset form
    setShowModal(false); // close after request added
  };

  const handleClose = () => {
    setReason(""); // reset reason when modal close
    setShowModal(false);
  };

  const renderStatus = (status) => {
    if (status === "Pending") return <Badge bg="warning">Pending</Badge>;
    if (status === "Approved") return <Badge bg="success">Changed</Badge>;
    if (status === "Rejected") return <Badge bg="danger">Rejected</Badge>;
  };

  const renderEmailStatus = (emailSent) => {
    if (emailSent) return <Badge bg="info">Email Sent</Badge>;
    return null;
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Password Change Requests</h4>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Request Password Change
        </Button>
      </div>

      <Table bordered hover className="mt-3 shadow-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Request Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Email Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.date}</td>
              <td>{req.reason}</td>
              <td>{renderStatus(req.status)}</td>
              <td>{renderEmailStatus(req.emailSent)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Request Password Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for password change..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PasswordRequests;
