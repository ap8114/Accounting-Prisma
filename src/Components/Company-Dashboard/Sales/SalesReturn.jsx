import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Table, Button, Badge, Form, Row, Col, InputGroup, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaEye, FaDownload, FaTrash, FaUpload, FaFile, FaCalendarAlt, FaSearch, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { Card } from "react-bootstrap";
import axiosInstance from '../../../Api/axiosInstance';
import GetCompanyId from '../../../Api/GetCompanyId';

const SalesReturn = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false); // Tracks if dropdowns are loaded

  const companyId = GetCompanyId();

  // Dropdown data
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Search states for dropdowns
  const [customerSearch, setCustomerSearch] = useState('');
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Show dropdown states
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [returnTypeFilter, setReturnTypeFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [voucherNo, setVoucherNo] = useState('');

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
    customerId: null,
    customerName: '',
    date: '',
    items: 0,
    status: 'pending',
    amount: 0,
    returnType: 'Sales Return',
    reason: '',
    warehouseId: null,
    warehouseName: '',
    referenceId: '',
    voucherNo: '',
    narration: '',
    itemsList: []
  });

  // ========= FETCH DROPDOWN DATA =========
  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get(`/vendorCustomer/company/${companyId}`, { params: { type: 'customer' } });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axiosInstance.get(`/warehouses/company/${companyId}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setWarehouses(data);
    } catch (err) {
      console.error('Failed to load warehouses', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get(`/products/company/${companyId}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  // ========= FETCH SALES RETURNS =========
  const fetchReturns = async () => {
    try {
      const response = await axiosInstance.get(`/sales-return/get-returns`, { 
        params: { company_id: companyId }
      });
      const data = response.data;
      const mapped = (data.data || []).map(r => ({
        id: r.id,
        returnNo: r.return_no,
        invoiceNo: r.invoice_no,
        customer_id: r.customer_id,        // ✅ CORRECTED: was r.vendor_id
        warehouse_id: r.warehouse_id,
        date: r.return_date ? r.return_date.split('T')[0] : '',
        items: r.sales_return_items?.reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0) || 0,
        status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
        amount: parseFloat(r.grand_total) || 0,
        returnType: r.return_type || 'Sales Return',
        reason: r.reason_for_return || '',
        referenceId: r.reference_id || '',
        voucherNo: r.manual_voucher_no || '',
        narration: r.notes || '',
        itemsList: (r.sales_return_items || []).map(i => ({
          productId: i.product_id,
          productName: i.item_name,
          qty: parseInt(i.quantity) || 0,
          price: parseFloat(i.rate) || 0,
          total: parseFloat(i.amount) || 0,
          narration: ''
        }))
      }));
      setReturns(mapped);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to load sales returns');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCustomers(),
          fetchWarehouses(),
          fetchProducts()
        ]);
        await fetchReturns();
      } catch (err) {
        setError('Failed to initialize page data');
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    };
    loadData();
  }, []);

  // ✅ Derive unique customers from actual customer list for filter dropdown
  const uniqueCustomers = useMemo(() => {
    return customers.map(c => c.name_english || c.name || `Customer ${c.id}`).filter(Boolean);
  }, [customers]);

  const uniqueReturnTypes = [...new Set(returns.map(r => r.returnType))];

  const filteredReturns = useMemo(() => {
    return returns.filter(item => {
      const custName = getCustomerName(item.customer_id);
      const whName = getWarehouseName(item.warehouse_id);

      const matchesSearch = [
        item.returnNo,
        item.invoiceNo,
        custName,
        item.reason,
        whName,
        item.narration
      ].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesType = returnTypeFilter === 'All' || item.returnType === returnTypeFilter;
      const matchesWarehouse = warehouseFilter === 'All' || whName === warehouseFilter;
      const matchesCustomer = !customerFilter || custName === customerFilter;

      let matchesDate = true;
      if (dateFrom || dateTo) {
        const returnDate = new Date(item.date);
        if (dateFrom) matchesDate = returnDate >= new Date(dateFrom);
        if (dateTo && matchesDate) matchesDate = returnDate <= new Date(dateTo);
      }

      let matchesAmount = true;
      if (amountMin) matchesAmount = item.amount >= parseFloat(amountMin);
      if (amountMax && matchesAmount) matchesAmount = item.amount <= parseFloat(amountMax);

      return matchesSearch && matchesStatus && matchesType && matchesWarehouse && matchesCustomer && matchesDate && matchesAmount;
    });
  }, [returns, searchTerm, statusFilter, returnTypeFilter, warehouseFilter, customerFilter, dateFrom, dateTo, amountMin, amountMax, customers, warehouses]);

  // ========= Helper Functions =========
  const getCustomerName = (customerId) => {
    const cust = customers.find(c => c.id === customerId);
    return cust ? (cust.name_english || cust.name || `Customer ${customerId}`) : 'Unknown Customer';
  };

  const getWarehouseName = (warehouseId) => {
    const wh = warehouses.find(w => w.id === warehouseId);
    return wh ? (wh.warehouse_name || wh.name || `Warehouse ${warehouseId}`) : 'Unknown Warehouse';
  };

  // ========= Other handlers (delete, export, etc.) remain unchanged =========
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sales return?")) return;
    try {
      await axiosInstance.delete(`/delete-sale/${id}`);
      setReturns(prev => prev.filter(r => r.id !== id));
      alert("Sales return deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete sales return.");
    }
  };

  const handleExportAll = () => {
    let csvContent = "text/csv;charset=utf-8,\uFEFF";
    csvContent += "Reference ID,Return No,Invoice No,Customer,Date,Items,Amount,Status,Return Type,Reason,Warehouse,Narration\n";
    returns.forEach(r => {
      csvContent += `"${r.referenceId}","${r.returnNo}","${r.invoiceNo}","${getCustomerName(r.customer_id)}","${r.date}",${r.items},${r.amount},"${r.status}","${r.returnType}","${r.reason}","${getWarehouseName(r.warehouse_id)}","${r.narration}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "All-Sales-Returns.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const handleAddClick = () => {
    setNewReturn({
      returnNo: '',
      invoiceNo: '',
      customerId: null,
      customerName: '',
      date: '',
      items: 0,
      status: 'pending',
      amount: 0,
      returnType: 'Sales Return',
      reason: '',
      warehouseId: null,
      warehouseName: '',
      referenceId: '',
      voucherNo: '',
      narration: '',
      itemsList: []
    });
    setCustomerSearch('');
    setWarehouseSearch('');
    setProductSearch('');
    setShowCustomerDropdown(false);
    setShowWarehouseDropdown(false);
    setShowProductDropdown(false);
    setShowAddModal(true);
  };

  const handleAddItem = () => {
    setNewReturn(prev => ({
      ...prev,
      itemsList: [...prev.itemsList, { productId: null, productName: '', qty: 1, price: 0, total: 0, narration: '' }]
    }));
  };

  const handleItemChange = (index, field, value) => {
    setNewReturn(prev => {
      const updated = [...prev.itemsList];
      const item = updated[index];
      if (field === 'qty') {
        const qty = parseInt(value) || 0;
        item.qty = qty;
        item.total = qty * item.price;
      } else if (field === 'price') {
        const price = parseFloat(value) || 0;
        item.price = price;
        item.total = item.qty * price;
      } else if (field === 'productName') {
        item.productId = value.id;
        item.productName = value.name;
      } else if (field === 'narration') {
        item.narration = value;
      }
      updated[index] = item;
      const totalItems = updated.reduce((sum, i) => sum + i.qty, 0);
      const totalAmount = updated.reduce((sum, i) => sum + i.total, 0);
      return { ...prev, itemsList: updated, items: totalItems, amount: totalAmount };
    });
  };

  const handleRemoveItem = (index) => {
    setNewReturn(prev => {
      const updated = prev.itemsList.filter((_, i) => i !== index);
      const totalItems = updated.reduce((sum, i) => sum + i.qty, 0);
      const totalAmount = updated.reduce((sum, i) => sum + i.total, 0);
      return { ...prev, itemsList: updated, items: totalItems, amount: totalAmount };
    });
  };

  const handleAddReturn = async () => {
    const { returnNo, invoiceNo, customerId, date, returnType, warehouseId, narration, itemsList } = newReturn;
    if (!returnNo || !invoiceNo || !customerId || !date || itemsList.length === 0 || !warehouseId) {
      alert("Please fill all required fields and add at least one item.");
      return;
    }
    const payload = {
      company_id: companyId,
      reference_id: newReturn.referenceId || null,
      manual_voucher_no: voucherNo || null,
      customer_id: customerId,
      return_no: returnNo,
      invoice_no: invoiceNo,
      return_date: date,
      return_type: returnType,
      warehouse_id: warehouseId,
      reason_for_return: newReturn.reason || '',
      notes: narration,
      status: newReturn.status,
      sales_return_items: itemsList.map(item => ({
        product_id: item.productId,
        item_name: item.productName,
        quantity: item.qty.toString(),
        rate: item.price.toString(),
        tax_percent: "18",
        discount: "0",
        amount: item.total.toString(),
        notes: item.narration
      }))
    };
    try {
      const response = await axiosInstance.post('/create-sales-return', payload);
      if (response.data.success) {
        alert("Sales return created successfully!");
        setShowAddModal(false);
        setVoucherNo('');
        fetchReturns();
      } else {
        alert(response.data.message || "Failed to create sales return.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Network error. Please try again.");
    }
  };

  const handleEditSave = async () => {
    if (!editReturn) return;
    const payload = {
      company_id: companyId,
      reference_id: editReturn.referenceId,
      manual_voucher_no: editReturn.voucherNo || null,
      customer_id: editReturn.customerId,
      return_no: editReturn.returnNo,
      invoice_no: editReturn.invoiceNo,
      return_date: editReturn.date,
      return_type: editReturn.returnType,
      warehouse_id: editReturn.warehouseId,
      reason_for_return: editReturn.reason || '',
      notes: editReturn.narration,
      status: editReturn.status.toLowerCase(),
      sales_return_items: editReturn.itemsList.map(item => ({
        product_id: item.productId,
        item_name: item.productName,
        quantity: item.qty.toString(),
        rate: item.price.toString(),
        tax_percent: "18",
        discount: "0",
        amount: item.total.toString(),
        notes: item.narration
      }))
    };
    try {
      const response = await axiosInstance.put(`/update-sale/${editReturn.id}`, payload);
      if (response.data.success) {
        alert("Sales return updated successfully!");
        setShowEditModal(false);
        fetchReturns();
      } else {
        alert(response.data.message || "Failed to update sales return.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Network error. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const lower = status?.toLowerCase();
    if (lower === 'processed') return <Badge bg="success">Processed</Badge>;
    if (lower === 'pending') return <Badge bg="warning" text="dark">Pending</Badge>;
    if (lower === 'approved') return <Badge bg="info">Approved</Badge>;
    if (lower === 'rejected') return <Badge bg="danger">Rejected</Badge>;
    return <Badge className='bg-secondary'>{status}</Badge>;
  };

  const getReturnTypeBadge = (returnType) => {
    if (returnType === 'Sales Return') return <Badge bg="primary">Sales Return</Badge>;
    if (returnType === 'Credit Note') return <Badge bg="secondary">Credit Note</Badge>;
    return <Badge className=''>{returnType}</Badge>;
  };

  // ========= Loading / Error UI =========
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading sales returns...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        {error}
      </Alert>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading customer and warehouse data...</span>
      </div>
    );
  }

  // ========= SearchInput Component (unchanged) =========
  const SearchInput = ({
    items,
    value,
    onChange,
    placeholder,
    searchValue,
    onSearchChange,
    displayField = "name_english",
    idField = "id",
    showDropdown,
    setShowDropdown
  }) => {
    return (
      <div className="position-relative">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
          />
          <InputGroup.Text><FaSearch /></InputGroup.Text>
        </InputGroup>
        {showDropdown && (
          <div className="border rounded mt-1 position-absolute w-100 bg-white shadow"
            style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}>
            {items.length > 0 ? (
              items.map(item => (
                <div
                  key={item[idField]}
                  className="p-2 hover:bg-light"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onChange(item[idField], item[displayField]);
                    onSearchChange('');
                    setShowDropdown(false);
                  }}
                >
                  {item[displayField]}
                </div>
              ))
            ) : (
              <div className="p-2 text-muted">No items found</div>
            )}
          </div>
        )}
        {value && !showDropdown && (
          <div className="mt-1 p-2 bg-light rounded">
            Selected: {value}
          </div>
        )}
      </div>
    );
  };

  // ========= Render UI =========
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
              {warehouses.map((w, idx) => (
                <option key={w.id || idx} value={w.warehouse_name || w.name}>
                  {w.warehouse_name || w.name}
                </option>
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
                  <td>{item.invoiceNo}</td>
                  <td>{getCustomerName(item.customer_id)}</td>
                  <td>{getWarehouseName(item.warehouse_id)}</td>
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
                      <Button variant="outline-info" size="sm" onClick={() => {
                        setSelectedReturn(item);
                        setShowViewModal(true);
                      }}>
                        <FaEye size={14} />
                      </Button>
                      <Button variant="outline-warning" size="sm" onClick={() => {
                        setEditReturn({ ...item });
                        setShowEditModal(true);
                      }}>
                        <FaEdit size={14} />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>
                        <FaTrash size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" className="text-center py-4">
                  No sales returns found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modals (View, Edit, Add) – unchanged from your original logic */}
      {/* ... (Keep your existing modal code as-is since it already uses helpers correctly) ... */}
      
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
                  <tr><td className="fw-bold">Return No</td><td>{selectedReturn.returnNo}</td></tr>
                  <tr><td className="fw-bold">Invoice No</td><td>{selectedReturn.invoiceNo}</td></tr>
                  <tr>
                    <td className="fw-bold">Customer</td>
                    <td>{getCustomerName(selectedReturn.customer_id)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Warehouse</td>
                    <td>{getWarehouseName(selectedReturn.warehouse_id)}</td>
                  </tr>
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
              <Form.Group className="mb-3">
                <Form.Label>Manual Voucher No</Form.Label>
                <Form.Control
                  type="text"
                  value={editReturn.voucherNo}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, voucherNo: e.target.value }))}
                />
              </Form.Group>
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
                <SearchInput
                  items={customers}
                  value={editReturn.customerName}
                  onChange={(id, name) => {
                    setEditReturn(prev => ({
                      ...prev,
                      customerId: id,
                      customerName: name
                    }));
                  }}
                  placeholder="Search customer..."
                  searchValue={customerSearch}
                  onSearchChange={setCustomerSearch}
                  showDropdown={showCustomerDropdown}
                  setShowDropdown={setShowCustomerDropdown}
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
                <SearchInput
                  items={warehouses}
                  value={editReturn.warehouseName}
                  onChange={(id, warehouse_name) => {
                    setEditReturn(prev => ({
                      ...prev,
                      warehouseId: id,
                      warehouseName: warehouse_name
                    }));
                  }}
                  placeholder="Search warehouse..."
                  searchValue={warehouseSearch}
                  onSearchChange={setWarehouseSearch}
                  displayField="warehouse_name"
                  showDropdown={showWarehouseDropdown}
                  setShowDropdown={setShowWarehouseDropdown}
                />
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
                <Form.Label>Reason</Form.Label>
                <Form.Control
                  type="text"
                  value={editReturn.reason}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, reason: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Narration</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editReturn.narration}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, narration: e.target.value }))}
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
              <div className="mt-3">
                <h6>Returned Items ({editReturn.itemsList.length})</h6>
                {editReturn.itemsList.map((item, index) => (
                  <Row key={index} className="mb-2">
                    <Col md={4}>
                      <SearchInput
                        items={products}
                        value={item.productName}
                        onChange={(id, name) => {
                          const updated = [...editReturn.itemsList];
                          updated[index].productId = id;
                          updated[index].productName = name;
                          setEditReturn({ ...editReturn, itemsList: updated });
                        }}
                        placeholder="Search product..."
                        searchValue={productSearch}
                        onSearchChange={setProductSearch}
                        displayField="item_name"
                        showDropdown={showProductDropdown}
                        setShowDropdown={setShowProductDropdown}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...editReturn.itemsList];
                          updated[index].qty = parseInt(e.target.value) || 0;
                          updated[index].total = updated[index].qty * updated[index].price;
                          setEditReturn({ ...editReturn, itemsList: updated });
                        }}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        value={item.price}
                        onChange={(e) => {
                          const updated = [...editReturn.itemsList];
                          updated[index].price = parseFloat(e.target.value) || 0;
                          updated[index].total = updated[index].qty * updated[index].price;
                          setEditReturn({ ...editReturn, itemsList: updated });
                        }}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        placeholder="Narration"
                        value={item.narration}
                        onChange={(e) => {
                          const updated = [...editReturn.itemsList];
                          updated[index].narration = e.target.value;
                          setEditReturn({ ...editReturn, itemsList: updated });
                        }}
                      />
                    </Col>
                  </Row>
                ))}
              </div>
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
            <Form.Group className="mb-3">
              <Form.Label>Reference ID (Auto)</Form.Label>
              <Form.Control type="text" value={newReturn.referenceId} readOnly placeholder="Assigned after save" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Manual Voucher No</Form.Label>
              <Form.Control
                type="text"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                placeholder="Optional"
              />
            </Form.Group>
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Customer *</Form.Label>
                  <SearchInput
                    items={customers}
                    value={newReturn.customerName}
                    onChange={(id, name) => {
                      setNewReturn(prev => ({
                        ...prev,
                        customerId: id,
                        customerName: name
                      }));
                    }}
                    placeholder="Search customer..."
                    searchValue={customerSearch}
                    onSearchChange={setCustomerSearch}
                    showDropdown={showCustomerDropdown}
                    setShowDropdown={setShowCustomerDropdown}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Return No *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newReturn.returnNo}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, returnNo: e.target.value }))}
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
                    onChange={(e) => setNewReturn(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newReturn.date}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Return Type</Form.Label>
                  <Form.Select
                    value={newReturn.returnType}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, returnType: e.target.value }))}
                  >
                    <option value="Sales Return">Sales Return</option>
                    <option value="Credit Note">Credit Note</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Warehouse *</Form.Label>
                  <SearchInput
                    items={warehouses}
                    value={newReturn.warehouseName}
                    onChange={(id, warehouse_name) => {
                      setNewReturn(prev => ({
                        ...prev,
                        warehouseId: id,
                        warehouseName: warehouse_name
                      }));
                    }}
                    placeholder="Search warehouse..."
                    searchValue={warehouseSearch}
                    onSearchChange={setWarehouseSearch}
                    displayField="warehouse_name"
                    showDropdown={showWarehouseDropdown}
                    setShowDropdown={setShowWarehouseDropdown}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="mb-4">
              <h6 className="fw-bold">Returned Items</h6>
              {newReturn.itemsList.map((item, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col md={4}>
                    <SearchInput
                      items={products}
                      value={item.productName}
                      onChange={(id, name) => {
                        handleItemChange(index, 'productName', { id, name });
                      }}
                      placeholder="Search product..."
                      searchValue={productSearch}
                      onSearchChange={setProductSearch}
                      displayField="item_name"
                      showDropdown={showProductDropdown}
                      setShowDropdown={setShowProductDropdown}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="number"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      placeholder="Narration"
                      value={item.narration}
                      onChange={(e) => handleItemChange(index, 'narration', e.target.value)}
                    />
                  </Col>
                  <Col md={1}>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveItem(index)}>
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button
                variant="outline-primary"
                size="sm"
                className="mt-2"
                onClick={handleAddItem}
              >
                + Add Item
              </Button>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Reason for Return</Form.Label>
              <Form.Control
                type="text"
                value={newReturn.reason}
                onChange={(e) => setNewReturn(prev => ({ ...prev, reason: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Narration</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newReturn.narration}
                onChange={(e) => setNewReturn(prev => ({ ...prev, narration: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddReturn} style={{ backgroundColor: '#3daaaa' }}>
            Add Return
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Page Info Card */}
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
            <li>Now with direct search input fields for customers, warehouses, and products that show all available options on click.</li>
            <li>Warehouse field is now empty by default, allowing you to select the appropriate warehouse.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SalesReturn;