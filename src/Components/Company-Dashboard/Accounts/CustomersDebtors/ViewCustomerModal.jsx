import React from 'react';
import { Badge, Card, Col, Modal, Row, Button } from 'react-bootstrap';

const ViewCustomerModal = ({ show, onHide, customer }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title>Customer Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Basic Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Name:</strong> {customer.name}
                </p>
                <p>
                  <strong>Name (Arabic):</strong>{" "}
                  {customer?.nameArabic || "N/A"}
                </p>
                <p>
                  <strong>Company Name:</strong>{" "}
                  {customer?.companyName || "N/A"}
                </p>
                <p>
                  <strong>Contact:</strong> {customer.contact || customer.phone}
                </p>
                <p>
                  <strong>Email:</strong> {customer.email}
                </p>
                <p>
                  <strong>Account Type:</strong>{" "}
                  {customer.accountType || "Sundry Debtors"}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Account Name:</strong>{" "}
                  {customer.accountName || "Accounts Receivable"}
                </p>
                <p>
                  <strong>Balance:</strong> $
                  {parseFloat(customer.balance || customer.accountBalance || 0).toFixed(2)}
                </p>
                <p>
                  <strong>Tax Number:</strong> {customer.taxNumber || customer.gstin || "-"}
                </p>
                <p>
                  <strong>Tax Enabled:</strong>{" "}
                  <Badge
                    bg={customer.taxEnabled || customer.gstEnabled ? "success" : "secondary"}
                    className="ms-2"
                  >
                    {customer.taxEnabled || customer.gstEnabled ? "ON" : "OFF"}
                  </Badge>
                </p>
                <p>
                  <strong>Credit Period:</strong> {customer.creditPeriod || "-"} days
                </p>
                <p>
                  <strong>Creation Date:</strong> {customer.creationDate || "-"}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Bank Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p className="mb-2">
                  <strong>Bank Account Number:</strong>{" "}
                  {customer.bankAccountNumber || "-"}
                </p>
                <p className="mb-2">
                  <strong>Bank IFSC:</strong>{" "}
                  {customer.bankIFSC || "-"}
                </p>
              </Col>
              <Col md={6}>
                <p className="mb-2">
                  <strong>Bank Name & Branch:</strong>{" "}
                  {customer.bankName || customer.bankNameBranch || "-"}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Address Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6 className="text-info">Current Address</h6>
                <p className="mb-2">
                  <strong>Address:</strong>{" "}
                  {customer.address || (customer.billing && customer.billing.address) || "-"}
                </p>
                <p className="mb-2">
                  <strong>City:</strong>{" "}
                  {customer.city || (customer.billing && customer.billing.city) || "-"}
                </p>
                <p className="mb-2">
                  <strong>State:</strong>{" "}
                  {customer.state || (customer.billing && customer.billing.state) || "-"}
                </p>
                <p className="mb-2">
                  <strong>Country:</strong>{" "}
                  {customer.country || (customer.billing && customer.billing.country) || "-"}
                </p>
                <p className="mb-2">
                  <strong>Pincode:</strong>{" "}
                  {customer.pincode || (customer.billing && customer.billing.zip) || "-"}
                </p>
                <p className="mb-2">
                  <strong>State Code:</strong>{" "}
                  {customer.stateCode || (customer.billing && customer.billing.stateCode) || "-"}
                </p>
              </Col>
              <Col md={6}>
                <h6 className="text-info">Shipping Address</h6>
                <p className="mb-2">
                  <strong>Address:</strong>{" "}
                  {customer.shippingAddress || (customer.shipping && customer.shipping.address) || "-"}
                </p>
                <p className="mb-2">
                  <strong>City:</strong>{" "}
                  {customer.shippingCity || (customer.shipping && customer.shipping.city) || "-"}
                </p>
                <p className="mb-2">
                  <strong>State:</strong>{" "}
                  {customer.shippingState || (customer.shipping && customer.shipping.state) || "-"}
                </p>
                <p className="mb-2">
                  <strong>Country:</strong>{" "}
                  {customer.shippingCountry || (customer.shipping && customer.shipping.country) || "-"}
                </p>
                <p className="mb-2">
                  <strong>Pincode:</strong>{" "}
                  {customer.shippingPincode || (customer.shipping && customer.shipping.zip) || "-"}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {customer.companyLocation && (
          <Card className="mb-3">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Location Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={12}>
                  <p className="mb-2">
                    <strong>Google Location:</strong>{" "}
                    <a 
                      href={customer.companyLocation} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {customer.companyLocation}
                    </a>
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {(customer.idCardImage || customer.extraFile) && (
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Documents</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {customer.idCardImage && (
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>ID Card Image:</strong>{" "}
                      <a 
                        href={customer.idCardImage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        View Document
                      </a>
                    </p>
                  </Col>
                )}
                {customer.extraFile && (
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Additional File:</strong>{" "}
                      <a 
                        href={customer.extraFile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        View File
                      </a>
                    </p>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewCustomerModal;