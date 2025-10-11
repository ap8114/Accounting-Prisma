import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  Badge,
  Row,
  Col,
  Card
} from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { BiPlus, BiSearch, BiX } from 'react-icons/bi';

// Initial Data with referenceId and narration for Purchase Returns
const initialReturns = [
  {
    id: 1,
    returnNo: 'PR-1001',
    invoiceNo: 'PINV-2045',
    Vendor: 'VendorA',
    date: '20-07-2025',
    items: 2,
    status: 'Processed',
    amount: 15000,
    returnType: 'Purchase Return',
    reason: 'Defective Product',
    warehouse: 'Main Warehouse',
    referenceId: 'REF-1001',
    voucherNo: 'VR-1001',
    narration: 'Received laptop with screen damage',
    itemsList: [
      { productId: 1, productName: 'Laptop Dell XPS 13', qty: 1, price: 80000, total: 80000, narration: 'Screen damaged' },
      { productId: 2, productName: 'Wireless Mouse', qty: 1, price: 1200, total: 1200, narration: 'Not working' }
    ]
  },
  {
    id: 2,
    returnNo: 'PR-1002',
    invoiceNo: 'PINV-2046',
    Vendor: 'VendorB',
    date: '21-07-2025',
    items: 1,
    status: 'Pending',
    amount: 8000,
    returnType: 'Debit Note',
    reason: 'Wrong Item',
    warehouse: 'North Branch',
    referenceId: 'REF-1002',
    voucherNo: 'VR-1002',
    narration: 'Ordered wireless keyboard but received wired version',
    itemsList: [
      { productId: 4, productName: 'Keyboard Logitech', qty: 1, price: 8000, total: 8000, narration: 'Received wired instead of wireless' }
    ]
  },
  {
    id: 3,
    returnNo: 'PR-1003',
    invoiceNo: 'PINV-2047',
    Vendor: 'VendorC',
    date: '22-07-2025',
    items: 3,
    status: 'Approved',
    amount: 22000,
    returnType: 'Purchase Return',
    reason: 'Quality Issue',
    warehouse: 'South Branch',
    referenceId: 'REF-1003',
    voucherNo: 'VR-1003',
    narration: 'Monitor had dead pixels on arrival',
    itemsList: [
      { productId: 5, productName: 'Monitor 24"', qty: 1, price: 15000, total: 15000, narration: 'Dead pixels in center' },
      { productId: 3, productName: 'USB Cable', qty: 2, price: 300, total: 600, narration: 'Damaged connectors' }
    ]
  },
  {
    id: 4,
    returnNo: 'PR-1004',
    invoiceNo: 'PINV-2048',
    Vendor: 'VendorA',
    date: '23-07-2025',
    items: 1,
    status: 'Rejected',
    amount: 5000,
    returnType: 'Debit Note',
    reason: 'No Issue Found',
    warehouse: 'Main Warehouse',
    referenceId: 'REF-1004',
    voucherNo: 'VR-1004',
    narration: 'Product tested and found to be in working condition',
    itemsList: [
      { productId: 2, productName: 'Wireless Mouse', qty: 1, price: 5000, total: 5000, narration: 'No issues found' }
    ]
  },
  {
    id: 5,
    returnNo: 'PR-1005',
    invoiceNo: 'PINV-2049',
    Vendor: 'VendorD',
    date: '24-07-2025',
    items: 2,
    status: 'Processed',
    amount: 12000,
    returnType: 'Purchase Return',
    reason: 'Damaged in Transit',
    warehouse: 'East Branch',
    referenceId: 'REF-1005',
    voucherNo: 'VR-1005',
    narration: 'Package arrived with visible damage to outer box',
    itemsList: [
      { productId: 1, productName: 'Laptop Dell XPS 13', qty: 1, price: 10000, total: 10000, narration: 'Dented corner' },
      { productId: 3, productName: 'USB Cable', qty: 1, price: 2000, total: 2000, narration: 'Cable cut' }
    ]
  }
];

const warehouseOptions = [
  'Main Warehouse',
  'North Branch',
  'South Branch',
  'East Branch',
  'West Branch'
];

// Status & Type Badges
const getStatusBadge = (status) => {
  switch (status) {
    case 'Processed': return <Badge bg="success">Processed</Badge>;
    case 'Pending': return <Badge bg="warning" text="dark">Pending</Badge>;
    case 'Approved': return <Badge bg="info">Approved</Badge>;
    case 'Rejected': return <Badge bg="danger">Rejected</Badge>;
    default: return <Badge bg="secondary">{status}</Badge>;
  }
};

const getReturnTypeBadge = (returnType) => {
  if (returnType === 'Purchase Return') return <Badge bg="primary">Purchase Return</Badge>;
  if (returnType === 'Debit Note') return <Badge bg="secondary">Debit Note</Badge>;
  return <Badge bg="light" text="dark">{returnType}</Badge>;
};

const productOptions = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 80000 },
  { id: 2, name: 'Wireless Mouse', price: 1200 },
  { id: 3, name: 'USB Cable', price: 300 },
  { id: 4, name: 'Keyboard Logitech', price: 2500 },
  { id: 5, name: 'Monitor 24"', price: 15000 }
];

const PurchaseReturn = () => {
  // Warehouse & Product Options
  const warehouseOptions = [
    'Main Warehouse',
    'North Branch',
    'South Branch',
    'East Branch',
    'West Branch'
  ];

  const productOptions = [
    { id: 1, name: 'Cocoa Beans', price: 100 },
    { id: 2, name: 'White Sugar', price: 80 },
    { id: 3, name: 'Packaging Boxes', price: 25 },
    { id: 4, name: 'Milk Powder', price: 200 },
    { id: 5, name: 'Plastic Pouches', price: 10 }
  ];

  // States
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [statusFilter, setStatusFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);

  // Initial form data
  const initialFormData = {
    invoice: '',
    vendor: '',
    date: '',
    amount: 0,
    reason: '',
    description: '',
    warehouse: warehouseOptions[0],
    referenceId: '',
    autoVoucherNo: '',
    manualVoucherNo: '',
    itemsList: [],
    items: 0
  };

  const [formData, setFormData] = useState(initialFormData);

  // Dummy Data
  const [returns, setReturns] = useState([
    {
      id: 'PR-2025-001',
      invoice: 'PI-2025-001',
      vendor: 'Cocoa Suppliers Ltd',
      date: '2025-06-26',
      amount: 5000,
      status: 'Pending',
      reason: 'Damaged Items',
      description: 'Received damaged cocoa beans',
      warehouse: 'Main Warehouse',
      referenceId: 'REF-PR-1001',
      autoVoucherNo: 'VOU-PR-2025-001',
      manualVoucherNo: 'MAN-PR-001',
      itemsList: [{ productId: 1, productName: 'Cocoa Beans', qty: 50, price: 100, total: 5000 }]
    },
    {
      id: 'PR-2025-002',
      invoice: 'PI-2025-002',
      vendor: 'Sugar Industries Inc',
      date: '2025-06-25',
      amount: 3200,
      status: 'Approved',
      reason: 'Wrong Items',
      description: 'Received brown sugar instead of white sugar',
      warehouse: 'North Branch',
      referenceId: 'REF-PR-1002',
      autoVoucherNo: 'VOU-PR-2025-002',
      manualVoucherNo: 'MAN-PR-002',
      itemsList: [{ productId: 2, productName: 'White Sugar', qty: 40, price: 80, total: 3200 }]
    },
    {
      id: 'PR-2025-003',
      invoice: 'PI-2025-003',
      vendor: 'Packaging Solutions',
      date: '2025-06-24',
      amount: 2500,
      status: 'Rejected',
      reason: 'Quality Issues',
      description: 'Packaging material not as per specifications',
      warehouse: 'South Branch',
      referenceId: 'REF-PR-1003',
      autoVoucherNo: 'VOU-PR-2025-003',
      manualVoucherNo: 'MAN-PR-003',
      itemsList: [{ productId: 3, productName: 'Packaging Boxes', qty: 100, price: 25, total: 2500 }]
    },
    {
      id: 'PR-2025-004',
      invoice: 'PI-2025-004',
      vendor: 'Dairy Products Co',
      date: '2025-06-23',
      amount: 4800,
      status: 'Approved',
      reason: 'Excess Stock',
      description: 'Ordered 100 units but received 120 units',
      warehouse: 'East Branch',
      referenceId: 'REF-PR-1004',
      autoVoucherNo: 'VOU-PR-2025-004',
      manualVoucherNo: 'MAN-PR-004',
      itemsList: [{ productId: 4, productName: 'Milk Powder', qty: 24, price: 200, total: 4800 }]
    }
  ]);

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open Add Modal
  const handleAddClick = () => {
    const nextId = returns.length + 1;
    const autoRefId = `REF-PR-${1000 + nextId}`;
    const autoVoucherNo = `VOU-PR-2025-${String(nextId).padStart(3, '0')}`;
    setFormData({
      ...initialFormData,
      referenceId: autoRefId,
      autoVoucherNo: autoVoucherNo
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleEditClick = (item) => {
    setFormData({
      ...item,
      items: item.itemsList.reduce((sum, i) => sum + i.qty, 0),
      amount: item.amount
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  // View Modal
  const handleViewClick = (item) => {
    setSelectedReturn(item);
    setShowViewModal(true);
  };

  // Delete Modal
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const confirmDelete = () => {
    setReturns(returns.filter(r => r.id !== deleteId));
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Add Item to List
  const handleAddItem = () => {
    if (!selectedProduct || itemQty <= 0 || itemPrice <= 0) {
      alert("Please select a valid product, quantity, and price.");
      return;
    }
    const newItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      qty: itemQty,
      price: itemPrice,
      total: itemQty * itemPrice
    };

    setFormData(prev => ({
      ...prev,
      itemsList: [...prev.itemsList, newItem],
      items: prev.items + itemQty,
      amount: prev.amount + newItem.total
    }));

    // Reset item form
    setSelectedProduct(null);
    setItemQty(1);
    setItemPrice(selectedProduct.price); // reset to default price
  };

  // Remove Item from List
  const handleRemoveItem = (index) => {
    const removed = formData.itemsList[index];
    setFormData(prev => ({
      ...prev,
      itemsList: prev.itemsList.filter((_, i) => i !== index),
      items: prev.items - removed.qty,
      amount: prev.amount - removed.total
    }));
  };

  // Submit Form
  const handleSubmit = () => {
    const required = formData.invoice && formData.vendor && formData.date && formData.amount;
    if (!required) {
      alert("Please fill all required fields.");
      return;
    }

    if (isEditMode) {
      setReturns(returns.map(r => r.id === formData.id ? { ...formData } : r));
    } else {
      const newId = `PR-2025-${String(returns.length + 1).padStart(3, '0')}`;
      setReturns([...returns, { ...formData, id: newId }]);
    }

    // Close & Reset
    setShowModal(false);
    setFormData(initialFormData);
    setIsEditMode(false);
  };

  // Filtered Returns
  const filteredReturns = returns.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoice.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesWarehouse = warehouseFilter === 'All' || item.warehouse === warehouseFilter;

    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  // Status Badge Style
  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Approved': 'success',
      'Rejected': 'danger'
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="mt-4 p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="mb-0 fw-bold text-dark">Purchase Returns</h2>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="success" size="sm" className="rounded-pill px-3">
            <i className="fas fa-file-import me-2" /> Import
          </Button>
          <Button variant="warning" size="sm" className="rounded-pill px-3">
            <i className="fas fa-file-export me-2" /> Export
          </Button>
          <Button variant="info" size="sm" className="rounded-pill px-3">
            <i className="fas fa-download me-2" /> Download
          </Button>
          <Button
            variant="primary"
            className="rounded-pill px-4"
            onClick={handleAddClick}
            style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}
          >
            <BiPlus size={18} className="me-2" /> New Return
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Row className="mb-4 g-3">
        <Col lg={4} md={6}>
          <div className="input-group">
            <span className="input-group-text bg-light">
              <BiSearch />
            </span>
            <Form.Control
              type="text"
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
        <Col lg={2} md={6}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Form.Select>
        </Col>
        <Col lg={2} md={6}>
          <Form.Select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            <option value="All">Warehouse: All</option>
            {warehouseOptions.map((wh, idx) => (
              <option key={idx} value={wh}>{wh}</option>
            ))}
          </Form.Select>
        </Col>
        <Col lg={2} md={6}>
          <Form.Select disabled>
            <option>Date: All</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Table */}
      <div className="card border-0 rounded-3 overflow-hidden ">
        <div className="table-responsive">
          <Table hover className="mb-0 text-center align-middle">
            <thead className="bg-light text-dark">
              <tr>
                <th>REF ID</th>
                <th>AUTO VOUCHER</th>
                <th>MANUAL VOUCHER</th>
                <th>RETURN #</th>
                <th>INVOICE #</th>
                <th>VENDOR</th>
                <th>WAREHOUSE</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-muted py-4">No purchase returns found.</td>
                </tr>
              ) : (
                filteredReturns.map((item) => (
                  <tr key={item.id}>
                    <td className="text-primary fw-medium">{item.referenceId}</td>
                    <td className="text-primary fw-medium">{item.autoVoucherNo}</td>
                    <td><Badge bg="info">{item.manualVoucherNo || '—'}</Badge></td>
                    <td className="text-primary fw-medium">{item.id}</td>
                    <td className="text-muted">{item.invoice}</td>
                    <td>{item.vendor}</td>
                    <td>{item.warehouse}</td>
                    <td className="text-muted">{item.date}</td>
                    <td className="fw-bold">₹{item.amount.toLocaleString()}</td>
                    <td>
                      <Badge bg={getStatusBadge(item.status)}>{item.status}</Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button size="sm" variant="outline-info" onClick={() => handleViewClick(item)}>
                          <FaEye />
                        </Button>
                        <Button size="sm" variant="outline-warning" onClick={() => handleEditClick(item)}>
                          <FaEdit />
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteClick(item.id)}>
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        <div className="d-flex justify-content-between align-items-center p-3 bg-white">
          <small className="text-muted">
            Showing {filteredReturns.length} of {returns.length} entries
          </small>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-secondary disabled">&laquo;</button>
            <button className="btn btn-primary">1</button>
            <button className="btn btn-outline-secondary">&raquo;</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setFormData(initialFormData);
        setIsEditMode(false);
      }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit Purchase Return' : 'Add New Purchase Return'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Reference ID</Form.Label>
                  <Form.Control type="text" value={formData.referenceId} readOnly className="bg-light" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Auto Voucher No</Form.Label>
                  <Form.Control type="text" value={formData.autoVoucherNo} readOnly className="bg-light" />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Manual Voucher No</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.manualVoucherNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, manualVoucherNo: e.target.value }))}
                    placeholder="Enter manual voucher no"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Vendor *</Form.Label>
                  <Form.Control
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Invoice *</Form.Label>
                  <Form.Control
                    type="text"
                    name="invoice"
                    value={formData.invoice}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Warehouse *</Form.Label>
                  <Form.Select
                    name="warehouse"
                    value={formData.warehouse}
                    onChange={handleInputChange}
                    required
                  >
                    {warehouseOptions.map((wh, idx) => (
                      <option key={idx} value={wh}>{wh}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Reason</Form.Label>
                  <Form.Select
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                  >
                    <option value="">Select reason</option>
                    <option value="Damaged Items">Damaged Items</option>
                    <option value="Wrong Items">Wrong Items</option>
                    <option value="Quality Issues">Quality Issues</option>
                    <option value="Excess Stock">Excess Stock</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Details about return..."
              />
            </Form.Group>

            {/* Items Section */}
            <div className="border-top pt-3">
              <h6 className="fw-bold">Add Returned Items</h6>
              <Row className="g-2 mb-3">
                <Col md={4}>
                  <Form.Select
                    value={selectedProduct?.id || ''}
                    onChange={(e) => {
                      const prod = productOptions.find(p => p.id == e.target.value);
                      setSelectedProduct(prod);
                      if (prod) setItemPrice(prod.price);
                    }}
                  >
                    <option value="">Select Product</option>
                    {productOptions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Qty"
                    value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    placeholder="Price"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                  />
                </Col>
                <Col md={3}>
                  <Button variant="primary" onClick={handleAddItem} className="w-100">
                    Add Item
                  </Button>
                </Col>
              </Row>

              {formData.itemsList.length > 0 && (
                <Table size="sm" bordered>
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.itemsList.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.productName}</td>
                        <td>{item.qty}</td>
                        <td>₹{item.price.toLocaleString()}</td>
                        <td>₹{item.total.toLocaleString()}</td>
                        <td className="text-center">
                          <Button size="sm" variant="danger" onClick={() => handleRemoveItem(idx)}>
                            <FaTrash size={12} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td colSpan={3} className="text-end">Total Amount</td>
                      <td>₹{formData.amount.toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}
            onClick={handleSubmit}
          >
            {isEditMode ? 'Update Return' : 'Create Return'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Purchase Return Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReturn && (
            <div>
              <Row className="mb-3">
                <Col md={6}><strong>Reference ID:</strong> {selectedReturn.referenceId}</Col>
                <Col md={6}><strong>Auto Voucher:</strong> {selectedReturn.autoVoucherNo}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}><strong>Manual Voucher:</strong> {selectedReturn.manualVoucherNo || '—'}</Col>
                <Col md={6}><strong>Return ID:</strong> {selectedReturn.id}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}><strong>Invoice:</strong> {selectedReturn.invoice}</Col>
                <Col md={6}><strong>Vendor:</strong> {selectedReturn.vendor}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}><strong>Warehouse:</strong> {selectedReturn.warehouse}</Col>
                <Col md={6}><strong>Date:</strong> {selectedReturn.date}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}><strong>Amount:</strong> ₹{selectedReturn.amount.toLocaleString()}</Col>
                <Col md={6}>
                  <strong>Status:</strong>
                  <Badge bg={getStatusBadge(selectedReturn.status)} className="ms-2">{selectedReturn.status}</Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}><strong>Reason:</strong> {selectedReturn.reason || 'N/A'}</Col>
              </Row>
              <Row>
                <Col md={12}>
                  <strong>Description:</strong>
                  <p className="bg-light p-3 rounded mt-1">
                    {selectedReturn.description || 'No description'}
                  </p>
                </Col>
              </Row>

              {selectedReturn.itemsList && selectedReturn.itemsList.length > 0 && (
                <>
                  <h6 className="mt-4 fw-bold">Returned Items</h6>
                  <Table size="sm" bordered>
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReturn.itemsList.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.productName}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.price.toLocaleString()}</td>
                          <td>₹{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="fw-bold">
                        <td colSpan={3} className="text-end">Total</td>
                        <td>₹{selectedReturn.amount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this purchase return? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Info Card */}
      <Card className="mt-4  rounded-4 border">
        <Card.Body>
          <h5 className="fw-semibold text-primary border-bottom pb-2 mb-3">Page Info</h5>
          <ul className="text-muted" style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
            <li>Manage goods returned to vendors due to damage, overstock, or wrong items.</li>
            <li>Track return ID, invoice, vendor, warehouse, amount, and status.</li>
            <li>Auto-generated <strong>Reference ID</strong> and <strong>Voucher Numbers</strong> for accounting.</li>
            <li>Supports item-level details with quantity, price, and total.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PurchaseReturn;