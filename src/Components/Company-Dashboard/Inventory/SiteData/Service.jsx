import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import GetCompanyId from "../../../../Api/GetCompanyId";
import axios from "axios"; // Import axios
import BaseUrl from "../../../../Api/BaseUrl";
import axiosInstance from "../../../../Api/axiosInstance";

const companyId = GetCompanyId();

// Initial services state (empty, will be populated from API)
const initialServices = [];
// Initial unit options state (empty, will be populated from API)
const initialUnitOptions = [];

function Service() {
  const [services, setServices] = useState(initialServices);
  // Add state for dynamic unit options
  const [unitOptions, setUnitOptions] = useState(initialUnitOptions); 
  
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ 
    id: null, 
    name: "", 
    sku: "", 
    serviceDescription: "", 
    unit: "piece", // Default value, will be overridden by API
    price: "", 
    tax: "", 
    remarks: "", 
    isInvoiceable: true 
  });
  const [editMode, setEditMode] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch services AND unit options when component mounts
  useEffect(() => {
    fetchServices();
    fetchUnitOptions(); // <-- Add this call
  }, []);

  // Function to fetch services from API using axios
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}services/getServicesByCompanyId/${companyId}`);
      
      if (response.data.status && response.data.data) {
        const transformedServices = response.data.data.map(service => ({
          id: service.id,
          name: service.service_name,
          sku: service.sku,
          serviceDescription: service.description,
          unit: service.uom,
          price: service.price,
          tax: service.tax_percent,
          remarks: service.remarks,
          isInvoiceable: service.allow_in_invoice === "1"
        }));
        setServices(transformedServices);
      }
    } catch (error) {
      console.error("Error fetching services:", error.response ? error.response.data : error.message);
      alert("Failed to fetch services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Function to fetch unit options from API
  const fetchUnitOptions = async () => {
    try {
      const response = await axiosInstance.get(`${BaseUrl}uom`);
      
      if (response.data.status && response.data.data) {
        // Extract only the unit_name from the response data
        const unitNames = response.data.data.map(uom => uom.unit_name);
        setUnitOptions(unitNames);
        
        // Set a default unit for the form if it's not already set
        if (unitNames.length > 0 && !form.unit) {
           setForm(prevForm => ({ ...prevForm, unit: unitNames[0] }));
        }
      }
    } catch (error) {
      console.error("Error fetching unit options:", error.response ? error.response.data : error.message);
      // Fallback to hardcoded options if API fails
      setUnitOptions(["piece", "kg", "meter", "liter", "box", "day", "yard", "sq.ft", "cubic meter", "Project"]);
    }
  };

  const handleShow = () => {
    // Set the first fetched unit as the default when adding a new service
    const defaultUnit = unitOptions.length > 0 ? unitOptions[0] : "piece";
    setForm({ 
      id: null, 
      name: "", 
      sku: "", 
      serviceDescription: "", 
      unit: defaultUnit, // Use the dynamic default
      price: "", 
      tax: "", 
      remarks: "", 
      isInvoiceable: true
    });
    setEditMode(false);
    setShow(true);
  };

  const handleClose = () => setShow(false);
  const handleViewClose = () => setShowView(false);
  const handleDeleteConfirmClose = () => setShowDeleteConfirm(false);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Service Name Required");
    
    try {
      setLoading(true);
      
      const payload = {
        company_id: companyId,
        service_name: form.name,
        sku: form.sku,
        description: form.serviceDescription,
        uom: form.unit,
        price: parseFloat(form.price) || 0,
        tax_percent: parseFloat(form.tax) || 0,
        allow_in_invoice: form.isInvoiceable ? 1 : 0,
        remarks: form.remarks
      };

      if (editMode) {
        await axiosInstance.patch(`${BaseUrl}services/${form.id}`, payload);
        await fetchServices();
        handleClose();
      } else {
        await axiosInstance.post(`${BaseUrl}services`, payload);
        await fetchServices();
        handleClose();
      }
    } catch (error) {
      console.error("Error saving service:", error.response ? error.response.data : error.message);
      alert(`Failed to ${editMode ? 'update' : 'add'} service. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setForm(service);
    setEditMode(true);
    setShow(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`${BaseUrl}services/${deleteId}`);
      await fetchServices();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting service:", error.response ? error.response.data : error.message);
      alert("Failed to delete service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (data) => {
    setViewData(data);
    setShowView(true);
  };

  const customButtonStyle = {
    backgroundColor: '#53b2a5',
    borderColor: '#53b2a5',
    color: 'white'
  };

  const viewButtonStyle = {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
    color: 'white'
  };

  const editButtonStyle = {
    backgroundColor: '#ffc107',
    borderColor: '#ffc107',
    color: 'black'
  };

  const deleteButtonStyle = {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
    color: 'white'
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Service Management</h2>
        <Button style={customButtonStyle} onClick={handleShow} disabled={loading}>
          {loading ? 'Loading...' : 'Add Service'}
        </Button>
      </div>
      
      <div className="table-responsive">
        <Table striped bordered hover className="shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Service Name</th>
              <th>Service Description</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td className="align-middle">{s.name}</td>
                <td className="align-middle">{s.serviceDescription}</td>
                <td className="text-center align-middle">
                  <Button 
                    size="sm" 
                    style={viewButtonStyle} 
                    onClick={() => handleView(s)} 
                    title="View"
                    className="me-1"
                  >
                    <FaEye />
                  </Button>
                  <Button 
                    size="sm" 
                    style={editButtonStyle} 
                    onClick={() => handleEdit(s)} 
                    title="Edit"
                    className="me-1"
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    size="sm" 
                    style={deleteButtonStyle} 
                    onClick={() => handleDeleteClick(s.id)} 
                    title="Delete"
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-3">
                  {loading ? 'Loading services...' : 'No Services Added'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{editMode ? "Edit Service" : "Add Service"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Service Name</Form.Label>
              <Form.Control 
                name="name" 
                value={form.name} 
                onChange={handleInput} 
                required 
                className="shadow-sm"
                placeholder="Enter service name"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>SKU</Form.Label>
              <Form.Control 
                name="sku" 
                value={form.sku} 
                onChange={handleInput} 
                className="shadow-sm"
                placeholder="Enter SKU (optional)"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Service Description</Form.Label>
              <Form.Control 
                as="textarea" 
                name="serviceDescription" 
                value={form.serviceDescription} 
                onChange={handleInput} 
                rows={3}
                className="shadow-sm"
                placeholder="Describe the service"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Unit of Measure</Form.Label>
              <Form.Select 
                name="unit" 
                value={form.unit} 
                onChange={handleInput}
                className="shadow-sm"
              >
                {/* Map over the dynamically fetched unitOptions */}
                {unitOptions.map((unitName, index) => (
                  <option key={index} value={unitName}>
                    {unitName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control 
                type="number"
                step="0.01"
                name="price" 
                value={form.price} 
                onChange={handleInput} 
                placeholder="Enter service price"
                className="shadow-sm"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Default Tax%</Form.Label>
              <Form.Control 
                name="tax" 
                value={form.tax} 
                onChange={handleInput} 
                className="shadow-sm"
                placeholder="e.g. 18"
              />
            </Form.Group>

            {/* New: Invoiceable Checkbox */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isInvoiceable"
                checked={form.isInvoiceable || false}
                onChange={handleInput}
                label=" Allow this service to be added in invoices"
              />
              <Form.Text className="text-muted">
                If unchecked, this service won't appear when creating invoices.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control 
                name="remarks" 
                value={form.remarks} 
                onChange={handleInput} 
                className="shadow-sm"
                as="textarea"
                rows={2}
                placeholder="Internal notes (not visible to customers)"
              />
              <Form.Text className="text-muted">
                Remarks are for internal use only; they do not display anywhere.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button style={customButtonStyle} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : (editMode ? "Update" : "Save") + " Service"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showView} onHide={handleViewClose} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Service Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewData && (
            <div className="p-3">
              {/* Service Name & SKU */}
              <div className="mb-4">
                <h5 className="text-primary">{viewData.name}</h5>
                <p className="text-muted mb-0">SKU: <strong>{viewData.sku || 'N/A'}</strong></p>
              </div>

              {/* Service Description */}
              <div className="mb-4">
                <h6>Service Description</h6>
                <p>{viewData.serviceDescription || 'N/A'}</p>
              </div>

              {/* Details Grid: Unit, Tax, Price */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6>Unit of Measure</h6>
                  <p className="text-dark">{viewData.unit}</p>
                </div>

                <div className="col-md-6">
                  <h6>Default Tax</h6>
                  <p className="text-dark">{viewData.tax || 'N/A'}</p>
                </div>

                <div className="col-md-6">
                  <h6>Price</h6>
                  <p className="text-success">
                    <strong>₹{parseFloat(viewData.price || 0).toFixed(2)}</strong>
                  </p>
                </div>

                {/* Invoiceable Status */}
                <div className="col-md-6">
                  <h6>Available in Invoices</h6>
                  <p>
                    {viewData.isInvoiceable ? (
                      <span className="badge bg-success">Yes</span>
                    ) : (
                      <span className="badge bg-secondary">No</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <h6>Remarks</h6>
                <p>{viewData.remarks || 'N/A'}</p>
                <p className="text-muted small fst-italic">
                  Remarks are for internal use only; they do not display anywhere.
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleViewClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={handleDeleteConfirmClose} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this service? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteConfirmClose}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Service;