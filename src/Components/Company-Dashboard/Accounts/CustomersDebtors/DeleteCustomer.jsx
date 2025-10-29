import React, { useState } from 'react';
import { Button, Modal, Spinner, Alert } from 'react-bootstrap';
import axiosInstance from "../../../../Api/axiosInstance";
import { toast } from "react-toastify";

const DeleteCustomer = ({ show, onHide, onConfirm, customerId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!customerId) {
      const errorMsg = "Customer ID is missing";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      
      // Make DELETE API call
      const response = await axiosInstance.delete(`/vendorCustomer/${customerId}`);
      
      if (response.data.status) {
        // Notify parent component of successful deletion
        onConfirm();
        onHide();
        toast.success("Customer deleted successfully");
      } else {
        const errorMsg = response.data.message || "Failed to delete customer";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      const errorMessage = err.response?.data?.message || "An error occurred while deleting customer";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>Are you sure you want to delete this customer?</p>
        <p className="text-muted">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isDeleting}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDelete} 
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Deleting...</span>
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteCustomer;