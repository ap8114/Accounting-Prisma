// SuperAdminPasswordRequests.js
import React, { useState } from "react";
import { Table, Button, Badge, Modal, Form, Alert } from "react-bootstrap";

const SuperAdminPasswordRequests = () => {
  const [requests, setRequests] = useState([
    {
      id: 101,
      company: "Tech Company",
      email: "newcompany@gmail.com",
      date: "2025-09-30",
      status: "Pending",
      reason: "Forgot after staff exit",
    },
    {
      id: 100,
      company: "Test Corp",
      email: "test@gmail.com",
      date: "2025-09-28",
      status: "Approved",
      reason: "Old admin left",
      emailSent: true,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showEmailSentAlert, setShowEmailSentAlert] = useState(false);

  const handleAction = (status) => {
    const updatedRequests = prev.map((req) =>
      req.id === selectedRequest.id
        ? { ...req, status: status, emailSent: status === "Approved" }
        : req
    );
    
    setRequests(updatedRequests);
    
    if (status === "Approved") {
      // Simulate sending email
      setTimeout(() => {
        setShowEmailSentAlert(true);
        setTimeout(() => setShowEmailSentAlert(false), 3000);
      }, 500);
    }
    
    setShowModal(false);
    setNewPassword("");
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
    <div className="p-2">
      <h4 className="mb-3">Manage Password Requests</h4>
      
      {showEmailSentAlert && (
        <Alert variant="success" onClose={() => setShowEmailSentAlert(false)} dismissible>
          New password has been sent to {selectedRequest?.email}
        </Alert>
      )}

      <Table bordered hover className="shadow-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Company</th>
            <th>Email</th>
            <th>Request Date</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Email Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests?.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.company}</td>
              <td>{req.email}</td>
              <td>{req.date}</td>
              <td>{renderStatus(req.status)}</td>
              <td>{req.reason}</td>
              <td>{renderEmailStatus(req.emailSent)}</td>
              <td>
                {req.status === "Pending" && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedRequest(req);
                      setShowModal(true);
                    }}
                  >
                    Review
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Approve/Reject Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Review Password Change Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <b>Company:</b> {selectedRequest?.company}
          </p>
          <p>
            <b>Email:</b> {selectedRequest?.email}
          </p>
          <p>
            <b>Reason:</b> {selectedRequest?.reason}
          </p>
          <Form>
            <Form.Group>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => handleAction("Rejected")}
          >
            Reject
          </Button>
          <Button
            variant="success"
            onClick={() => handleAction("Approved")}
            disabled={!newPassword}
          >
            Approve & Send Email
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SuperAdminPasswordRequests;