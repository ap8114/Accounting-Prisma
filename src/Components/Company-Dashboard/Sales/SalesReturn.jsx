



import React, { useState, useRef, useMemo } from 'react';
import { Table, Button, Badge, Form, Row, Col, InputGroup, Modal } from 'react-bootstrap';
import { FaEye, FaDownload, FaTrash, FaUpload, FaFile, FaCalendarAlt, FaSearch, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { Card } from "react-bootstrap";

// Initial Data with referenceId and narration
const initialReturns = [
  {
    id: 1,
    returnNo: 'SR-1001',
    invoiceNo: 'INV-2045',
    customer: 'Client A',
    date: '20-07-2025',
    items: 2,
    status: 'Processed',
    amount: 15000,
    returnType: 'Sales Return',
    reason: 'Defective Product',
    warehouse: 'Main Warehouse',
    referenceId: 'REF-1001',
    voucherNo: 'VR-1001',
    narration: 'Customer reported laptop screen damage',
    itemsList: [
      { productId: 1, productName: 'Laptop Dell XPS 13', qty: 1, price: 80000, total: 80000, narration: 'Screen damaged' },
      { productId: 2, productName: 'Wireless Mouse', qty: 1, price: 1200, total: 1200, narration: 'Not working' }
    ]
  },
  {
    id: 2,
    returnNo: 'SR-1002',
    invoiceNo: 'INV-2046',
    customer: 'Client B',
    date: '21-07-2025',
    items: 1,
    status: 'Pending',
    amount: 8000,
    returnType: 'Credit Note',
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
    returnNo: 'SR-1003',
    invoiceNo: 'INV-2047',
    customer: 'Client C',
    date: '22-07-2025',
    items: 3,
    status: 'Approved',
    amount: 22000,
    returnType: 'Sales Return',
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
    returnNo: 'SR-1004',
    invoiceNo: 'INV-2048',
    customer: 'Client A',
    date: '23-07-2025',
    items: 1,
    status: 'Rejected',
    amount: 5000,
    returnType: 'Credit Note',
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
    returnNo: 'SR-1005',
    invoiceNo: 'INV-2049',
    customer: 'Client D',
    date: '24-07-2025',
    items: 2,
    status: 'Processed',
    amount: 12000,
    returnType: 'Sales Return',
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
  if (returnType === 'Sales Return') return <Badge bg="primary">Sales Return</Badge>;
  if (returnType === 'Credit Note') return <Badge bg="secondary">Credit Note</Badge>;
  return <Badge bg="light" text="dark">{returnType}</Badge>;
};

const productOptions = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 80000 },
  { id: 2, name: 'Wireless Mouse', price: 1200 },
  { id: 3, name: 'USB Cable', price: 300 },
  { id: 4, name: 'Keyboard Logitech', price: 2500 },
  { id: 5, name: 'Monitor 24"', price: 15000 }
];

const SalesReturn = () => {
  const [returns, setReturns] = useState(initialReturns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [returnTypeFilter, setReturnTypeFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [voucherNo, setVoucherNo] = useState(''); // For manual input
  const [autoVoucherNo, setAutoVoucherNo] = useState('VR-1001'); // Auto-generated voucher number
  
  const navigate = useNavigate();
  const fileInputRef = useRef();
  
  // Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReturn, setEditReturn] = useState(null); 
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReturn, setNewReturn] = useState({
    returnNo: '',
    invoiceNo: '',
    customer: '',
    date: '',
    items: 0,
    status: 'Pending',
    amount: 0,
    returnType: 'Sales Return',
    reason: '',
    warehouse: warehouseOptions[0],
    referenceId: '',
    voucherNo: '',
    narration: '',
    itemsList: []
  });
  
  // Derived Data
  const uniqueCustomers = [...new Set(returns.map(r => r.customer))];
  const uniqueReturnTypes = [...new Set(returns.map(r => r.returnType))];
  
  // Filtered Returns
  const filteredReturns = useMemo(() => {
    return returns.filter(item => {
      const matchesSearch = [
        item.returnNo,
        item.invoiceNo,
        item.customer,
        item.reason,
        item.warehouse,
        item.narration
      ].some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesType = returnTypeFilter === 'All' || item.returnType === returnTypeFilter;
      const matchesWarehouse = warehouseFilter === 'All' || item.warehouse === warehouseFilter;
      const matchesCustomer = !customerFilter || item.customer === customerFilter;
      
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const returnDate = new Date(item.date.split('-').reverse().join('-'));
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          matchesDate = returnDate >= fromDate;
        }
        if (dateTo && matchesDate) {
          const toDate = new Date(dateTo);
          matchesDate = returnDate <= toDate;
        }
      }
      
      let matchesAmount = true;
      if (amountMin) matchesAmount = item.amount >= parseFloat(amountMin);
      if (amountMax && matchesAmount) matchesAmount = item.amount <= parseFloat(amountMax);
      
      return matchesSearch && matchesStatus && matchesType && matchesWarehouse && matchesCustomer && matchesDate && matchesAmount;
    });
  }, [returns, searchTerm, statusFilter, returnTypeFilter, warehouseFilter, customerFilter, dateFrom, dateTo, amountMin, amountMax]);
  
  // Delete Handler
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this sales return?")) {
      setReturns(prev => prev.filter(r => r.id !== id));
    }
  };
  
  // Export All as CSV
  const handleExportAll = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Reference ID,Return No,Invoice No,Customer,Date,Items,Amount,Status,Return Type,Reason,Warehouse,Narration\n";
    returns.forEach(r => {
      csvContent += `"${r.referenceId}","${r.returnNo}","${r.invoiceNo}","${r.customer}","${r.date}",${r.items},${r.amount},"${r.status}","${r.returnType}","${r.reason}","${r.warehouse}","${r.narration}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "All-Sales-Returns.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Download Single
  const handleDownload = (item) => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Reference ID,Return No,Invoice No,Customer,Date,Items,Amount,Status,Return Type,Reason,Warehouse,Narration\n";
    csvContent += `"${item.referenceId}","${item.returnNo}","${item.invoiceNo}","${item.customer}","${item.date}",${item.items},${item.amount},"${item.status}","${item.returnType}","${item.reason}","${item.warehouse}","${item.narration}"\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${item.returnNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Clear Filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setReturnTypeFilter('All');
    setWarehouseFilter('All');
    setCustomerFilter('');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
  };
  
  // Add New Return
  const handleAddClick = () => {
    const nextId = returns.length + 1;
    const autoRefId = `REF-${1000 + nextId}`;
    setNewReturn({
      returnNo: '',
      invoiceNo: '',
      customer: '',
      date: '',
      items: 0,
      status: 'Pending',
      amount: 0,
      returnType: 'Sales Return',
      reason: '',
      warehouse: warehouseOptions[0],
      referenceId: autoRefId,
      voucherNo: '',
      narration: '',
      itemsList: []
    });
    setShowAddModal(true);
  };
  
  // Add product to items list when selected from dropdown
  const handleProductSelect = (e) => {
    const productId = parseInt(e.target.value);
    if (!productId) return;
    
    const product = productOptions.find(p => p.id === productId);
    if (!product) return;
    
    const newItem = {
      productId: product.id,
      productName: product.name,
      qty: 1,
      price: product.price,
      total: product.price * 1,
      narration: ''
    };
    
    setNewReturn(prev => {
      const updatedItemsList = [...prev.itemsList, newItem];
      const totalItems = updatedItemsList.reduce((sum, item) => sum + item.qty, 0);
      const totalAmount = updatedItemsList.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...prev,
        itemsList: updatedItemsList,
        items: totalItems,
        amount: totalAmount
      };
    });
    
    // Reset dropdown selection
    e.target.value = '';
  };
  
  // Update item in the list
  const handleItemChange = (index, field, value) => {
    setNewReturn(prev => {
      const updatedItemsList = [...prev.itemsList];
      const item = updatedItemsList[index];
      
      if (field === 'qty') {
        const newQty = parseInt(value) || 0;
        item.qty = newQty;
        item.total = newQty * item.price;
      } else if (field === 'price') {
        const newPrice = parseFloat(value) || 0;
        item.price = newPrice;
        item.total = item.qty * newPrice;
      } else if (field === 'narration') {
        item.narration = value;
      }
      
      updatedItemsList[index] = item;
      
      const totalItems = updatedItemsList.reduce((sum, item) => sum + item.qty, 0);
      const totalAmount = updatedItemsList.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...prev,
        itemsList: updatedItemsList,
        items: totalItems,
        amount: totalAmount
      };
    });
  };
  
  // Remove item from the list
  const handleRemoveItem = (index) => {
    setNewReturn(prev => {
      const updatedItemsList = prev.itemsList.filter((_, i) => i !== index);
      const totalItems = updatedItemsList.reduce((sum, item) => sum + item.qty, 0);
      const totalAmount = updatedItemsList.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...prev,
        itemsList: updatedItemsList,
        items: totalItems,
        amount: totalAmount
      };
    });
  };
  
  const handleAddReturn = () => {
    if (!newReturn.returnNo || !newReturn.invoiceNo || !newReturn.customer || !newReturn.date || newReturn.itemsList.length === 0) {
      alert("Please fill required fields and add at least one item.");
      return;
    }
  
    const newItem = {
      ...newReturn,
      id: Math.max(...returns.map(r => r.id), 0) + 1,
      voucherNo: voucherNo
    };
  
    setReturns(prev => [...prev, newItem]);
    setShowAddModal(false);
    // Reset states
    setNewReturn({
      returnNo: '', 
      invoiceNo: '', 
      customer: '', 
      date: '', 
      items: 0, 
      status: 'Pending',
      amount: 0, 
      returnType: 'Sales Return', 
      reason: '', 
      warehouse: warehouseOptions[0],
      referenceId: '', 
      voucherNo: '', 
      narration: '', 
      itemsList: []
    });
    setVoucherNo('');
  };
  
  // Edit Handlers
  const handleEditSave = () => {
    setReturns(prev => prev.map(r => r.id === editReturn.id ? editReturn : r));
    setShowEditModal(false);
  };
  
  return (
    <div className="p-4 my-4 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FaArrowRight size={20} color="red" />
          <h5 className="mb-0">Sales Return</h5>
          <p className="text-muted small mb-0">Customer Sends Back</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button
            className="rounded-pill px-4 d-flex align-items-center"
            variant="success"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload className="me-2 text-white" /> Import
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) alert(`Imported: ${file.name}`);
            }}
          />
          <Button
            className="rounded-pill px-4 d-flex align-items-center"
            style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14" }}
            onClick={handleExportAll}
          >
            <FaFile className="me-2" /> Export
          </Button>
          <Button
            className="rounded-pill px-4 d-flex align-items-center"
            style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
            onClick={handleAddClick}
          >
            New Return
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-light p-3 rounded mb-4">
        <Row className="g-3">
          <Col md={3}>
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={2}>
            <Form.Select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
              <option value="">All Customers</option>
              {uniqueCustomers.map((customer, idx) => (
                <option key={idx} value={customer}>{customer}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Processed">Processed</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select value={returnTypeFilter} onChange={(e) => setReturnTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              {uniqueReturnTypes.map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
              <option value="All">All Warehouses</option>
              {warehouseOptions.map((warehouse, idx) => (
                <option key={idx} value={warehouse}>{warehouse}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
              <Form.Control type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </InputGroup>
          </Col>
          <Col md={1}>
            <Button variant="outline-secondary" onClick={clearFilters} size="sm">Clear</Button>
          </Col>
        </Row>
      </div>
      
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-primary">
            <div className="card-body">
              <h6 className="card-title text-muted">Total Returns</h6>
              <h4 className="text-primary">{returns.length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-success">
            <div className="card-body">
              <h6 className="card-title text-muted">Processed</h6>
              <h4 className="text-success">{returns.filter(r => r.status === 'Processed').length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-warning">
            <div className="card-body">
              <h6 className="card-title text-muted">Pending</h6>
              <h4 className="text-warning">{returns.filter(r => r.status === 'Pending').length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-danger">
            <div className="card-body">
              <h6 className="card-title text-muted">Total Value</h6>
              <h4 className="text-danger">₹ {returns.reduce((sum, r) => sum + r.amount, 0).toLocaleString('en-IN')}</h4>
            </div>
          </div>
        </div>
      </div>
      
      {/* Voucher No Section */}
      <div className="bg-white p-3 rounded shadow-sm mb-4">
        <Row className="align-items-end g-3">
          {/* Manual / Auto Voucher No */}
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-bold"> Manual Voucher No</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Enter voucher no"
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          {/* Auto-generated Display */}
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-bold"> Auto Voucher No</Form.Label>
              <Form.Control
                type="text"
                value={autoVoucherNo}
                readOnly
                className="bg-light"
              />
            </Form.Group>
          </Col>
        </Row>
      </div>
      
      {/* Table */}
      <div className="table-responsive">
        <Table bordered hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th className="text-center">#</th>
              <th>Return No</th>
              <th>Reference ID</th>
              <th>Voucher No (Manual)</th>
              <th>Voucher No (Auto)</th>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Warehouse</th>
              <th>Date</th>
              <th className="text-center">Items</th>
              <th>Amount (₹)</th>
              <th>Return Type</th>
              <th>Reason</th>
              <th>Narration</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((item, idx) => (
                <tr key={item.id}>
                  <td className="text-center">{idx + 1}</td>
                  <td><strong>{item.returnNo}</strong></td>
                  <td>{item.referenceId}</td>
                  <td>{item.voucherNo || "-"}</td>
                  <td>{autoVoucherNo}</td>
                  <td>{item.invoiceNo}</td>
                  <td>{item.customer}</td>
                  <td>{item.warehouse}</td>
                  <td>{item.date}</td>
                  <td className="text-center">{item.items}</td>
                  <td className="fw-bold text-danger">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </td>
                  <td>{getReturnTypeBadge(item.returnType)}</td>
                  <td className="small">{item.reason}</td>
                  <td className="small">{item.narration || "-"}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => {
                          setSelectedReturn(item);
                          setShowViewModal(true);
                        }}
                      >
                        <FaEye size={14} />
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => {
                          setEditReturn({ ...item });
                          setShowEditModal(true);
                        }}
                      >
                        <FaEdit size={14} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <FaTrash size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="16" className="text-center py-4">
                  No sales returns found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      
      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sales Return Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReturn && (
            <div>
              <table className="table table-bordered">
                <tbody>
                  <tr><td className="fw-bold">Reference ID</td><td>{selectedReturn.referenceId}</td></tr>
                  <tr><td className="fw-bold">Voucher No (Manual)</td><td>{selectedReturn.voucherNo || '-'}</td></tr>
                  <tr><td className="fw-bold">Voucher No (Auto)</td><td>{autoVoucherNo}</td></tr>
                  <tr><td className="fw-bold">Return No</td><td>{selectedReturn.returnNo}</td></tr>
                  <tr><td className="fw-bold">Invoice No</td><td>{selectedReturn.invoiceNo}</td></tr>
                  <tr><td className="fw-bold">Customer</td><td>{selectedReturn.customer}</td></tr>
                  <tr><td className="fw-bold">Warehouse</td><td>{selectedReturn.warehouse}</td></tr>
                  <tr><td className="fw-bold">Date</td><td>{selectedReturn.date}</td></tr>
                  <tr><td className="fw-bold">Items</td><td>{selectedReturn.items}</td></tr>
                  <tr><td className="fw-bold">Amount</td><td>₹{selectedReturn.amount.toLocaleString('en-IN')}</td></tr>
                  <tr><td className="fw-bold">Return Type</td><td>{selectedReturn.returnType}</td></tr>
                  <tr><td className="fw-bold">Reason</td><td>{selectedReturn.reason}</td></tr>
                  <tr><td className="fw-bold">Narration</td><td>{selectedReturn.narration || '-'}</td></tr>
                  <tr><td className="fw-bold">Status</td><td>{getStatusBadge(selectedReturn.status)}</td></tr>
                </tbody>
              </table>
              
              {selectedReturn.itemsList && selectedReturn.itemsList.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold">Returned Items</h6>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Narration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReturn.itemsList.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.productName}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.price.toLocaleString()}</td>
                          <td>₹{item.total.toLocaleString()}</td>
                          <td>{item.narration || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Sales Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editReturn && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Reference ID</Form.Label>
                <Form.Control type="text" value={editReturn.referenceId} readOnly />
              </Form.Group>
              
              {/* Voucher No Section */}
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Manual Voucher No</Form.Label>
                    <Form.Control
                      type="text"
                      value={editReturn.voucherNo}
                      onChange={(e) => setEditReturn(prev => ({ ...prev, voucherNo: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Auto Voucher No</Form.Label>
                    <Form.Control type="text" value={autoVoucherNo} readOnly className="bg-light" />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Return No *</Form.Label>
                <Form.Control
                  type="text"
                  value={editReturn.returnNo}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, returnNo: e.target.value }))}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Invoice No *</Form.Label>
                <Form.Control
                  type="text"
                  value={editReturn.invoiceNo}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, invoiceNo: e.target.value }))}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Customer *</Form.Label>
                <Form.Control
                  type="text"
                  value={editReturn.customer}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, customer: e.target.value }))}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={editReturn.date}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, date: e.target.value }))}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Warehouse *</Form.Label>
                <Form.Select
                  value={editReturn.warehouse}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, warehouse: e.target.value }))}
                >
                  {warehouseOptions.map((wh, idx) => (
                    <option key={idx} value={wh}>{wh}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Return Type</Form.Label>
                <Form.Select
                  value={editReturn.returnType}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, returnType: e.target.value }))}
                >
                  <option value="Sales Return">Sales Return</option>
                  <option value="Credit Note">Credit Note</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Narration</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editReturn.narration}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, narration: e.target.value }))}
                  placeholder="Enter detailed narration..."
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editReturn.status}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Processed">Processed</option>
                  <option value="Rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleEditSave} style={{ backgroundColor: '#3daaaa' }}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Sales Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Reference ID */}
            <Form.Group className="mb-3">
              <Form.Label>Reference ID</Form.Label>
              <Form.Control
                type="text"
                value={newReturn.referenceId}
                readOnly
                placeholder="Auto-generated"
              />
            </Form.Group>
            
            {/* Voucher No Section */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Manual Voucher No</Form.Label>
                  <Form.Control
                    type="text"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    placeholder="Enter voucher no"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Auto Voucher No</Form.Label>
                  <Form.Control
                    type="text"
                    value={autoVoucherNo}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Customer, Return No, Invoice No */}
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Customer *</Form.Label>
                  <Form.Select
                    value={newReturn.customer}
                    onChange={(e) =>
                      setNewReturn((prev) => ({ ...prev, customer: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select Customer</option>
                    {uniqueCustomers.map((cust, idx) => (
                      <option key={idx} value={cust}>
                        {cust}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Return No *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newReturn.returnNo}
                    onChange={(e) =>
                      setNewReturn((prev) => ({ ...prev, returnNo: e.target.value }))
                    }
                    placeholder="e.g. SR-1006"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Invoice No *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newReturn.invoiceNo}
                    onChange={(e) =>
                      setNewReturn((prev) => ({ ...prev, invoiceNo: e.target.value }))
                    }
                    placeholder="e.g. INV-2050"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Date, Return Type, Warehouse */}
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newReturn.date}
                    onChange={(e) =>
                      setNewReturn((prev) => ({ ...prev, date: e.target.value }))
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Return Type</Form.Label>
                  <Form.Select
                    value={newReturn.returnType}
                    onChange={(e) =>
                      setNewReturn((prev) => ({ ...prev, returnType: e.target.value }))
                    }
                  >
                    <option value="Sales Return">Sales Return</option>
                    <option value="Credit Note">Credit Note</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Warehouse *</Form.Label>
                  <Form.Select
                    value={newReturn.warehouse}
                    onChange={(e) =>
                      setNewReturn((prev) => ({ ...prev, warehouse: e.target.value }))
                    }
                    required
                  >
                    {warehouseOptions.map((wh, idx) => (
                      <option key={idx} value={wh}>
                        {wh}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            {/* Items Section */}
            <div className="mb-4">
              <h6 className="fw-bold border-bottom pb-2">Add Returned Items</h6>
              
              {/* Product Dropdown - Auto adds on selection */}
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Select Product</Form.Label>
                    <Form.Select 
                      onChange={handleProductSelect}
                    >
                      <option value="">-- Select a product to add --</option>
                      {productOptions.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ₹{product.price.toLocaleString()}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Selected Items Table */}
              {newReturn.itemsList.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold">Selected Items</h6>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Narration</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newReturn.itemsList.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName}</td>
                          <td>
                            <Form.Control
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                              size="sm"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              size="sm"
                            />
                          </td>
                          <td>₹{item.total.toLocaleString()}</td>
                          <td>
                            <Form.Control
                              type="text"
                              value={item.narration}
                              onChange={(e) => handleItemChange(index, 'narration', e.target.value)}
                              placeholder="Item narration"
                              size="sm"
                            />
                          </td>
                          <td className="text-center">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="fw-bold">
                        <td colSpan={3} className="text-end">Total Amount</td>
                        <td>₹{newReturn.amount.toLocaleString()}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
            
            {/* Narration */}
            <Form.Group className="mb-3">
              <Form.Label>Narration</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newReturn.narration}
                onChange={(e) =>
                  setNewReturn((prev) => ({ ...prev, narration: e.target.value }))
                }
                placeholder="Enter detailed narration about the return..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddReturn}
            style={{ backgroundColor: '#3daaaa' }}
          >
            Add Return
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Info Card */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>Displays all customer return transactions where goods are sent back after sale.</li>
            <li>Shows details like return number, invoice number, customer, warehouse, date, items, and amount.</li>
            <li>Helps in managing return types like Sales Return or Credit Note.</li>
            <li>Tracks status of each return: Processed or Pending.</li>
            <li>Summarizes total returns, pending count, and total value at the top.</li>
            <li>Provides filters for customer, status, type, warehouse, and date to quickly find records.</li>
            <li>Includes Import, Export, and New Return options for data handling.</li>
            <li><strong>Reference ID</strong> is now auto-generated for every new return (e.g., REF-1001).</li>
            <li><strong>Narration</strong> field allows adding detailed descriptions about each return.</li>
            <li>Select products from dropdown to automatically add them to your return. Customize quantity, price, and add narration for each item.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SalesReturn;



