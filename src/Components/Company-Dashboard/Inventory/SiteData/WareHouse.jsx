import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Form, Row, Col, Card, Alert } from "react-bootstrap";
import { FaArrowRight, FaBoxes, FaEdit, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { BiTransfer } from "react-icons/bi";
import GetCompanyId from "../../../../Api/GetCompanyId";
import AddProductModal from "../AddProductModal";
import axiosInstance from "../../../../Api/axiosInstance";

const WareHouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [warehouseName, setWarehouseName] = useState("");
  const [location, setLocation] = useState("");
  const [editId, setEditId] = useState(null);
  const [filterLocation, setFilterLocation] = useState("");
  const navigate = useNavigate();
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const companyId = GetCompanyId();
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // --- Reusable fetch function ---
  const fetchWarehouses = async () => {
    if (!companyId) {
      setLoading(false);
      setError("Company ID not found.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("warehouses");

      let warehouseData = [];
      if (Array.isArray(response.data)) {
        warehouseData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        warehouseData = response.data.data;
      } else {
        throw new Error("Invalid API response format");
      }

      const filteredAndMapped = warehouseData
        .filter((w) => w.company_id == companyId)
        .map((w) => ({
          _id: w.id?.toString() || w._id?.toString(),
          name: w.warehouse_name || w.name,
          location: w.location,
          totalStocks: 0,
        }));

      setWarehouses(filteredAndMapped);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setError("Failed to load warehouses. Please try again.");
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [companyId]);

  // Helper function to reset form and close modal
  const resetFormAndCloseModal = () => {
    setWarehouseName("");
    setLocation("");
    setEditId(null);
    setShowModal(false);
    setModalError(null);
  };

  const handleModalClose = () => {
    resetFormAndCloseModal();
  };

  const handleModalShow = (data = null) => {
    if (data) {
      setEditId(data._id);
      setWarehouseName(data.name);
      setLocation(data.location);
    } else {
      setEditId(null);
      setWarehouseName("");
      setLocation("");
    }
    setShowModal(true);
  };

  // Updated handleFormSubmit with proper API integration
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    try {
      const payload = {
        company_id: companyId,
        warehouse_name: warehouseName,
        location: location,
      };

      console.log("Submitting payload:", payload);

      let response;
      if (editId) {
        // Update existing warehouse
        response = await axiosInstance.patch(`/warehouses/${editId}`, payload);
      } else {
        // Create new warehouse
        response = await axiosInstance.post("/warehouses", payload);
      }

      console.log("API Response:", response.data);

      // Check if response is successful
      if (response.data) {
        // Refresh the warehouse list
        await fetchWarehouses();
        
        // Reset form and close modal
        resetFormAndCloseModal();
      } else {
        throw new Error(response.data?.message || "Failed to save warehouse");
      }
    } catch (err) {
      console.error("API Error:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          (editId ? "Failed to update warehouse." : "Failed to create warehouse.");
      setModalError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this warehouse?");
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/warehouses/${id}`);
      // Re-fetch after delete
      await fetchWarehouses();
    } catch (err) {
      console.error("Delete Error:", err);
      setError("Failed to delete warehouse. Please try again.");
    }
  };

  // --- Pagination & Import/Export (unchanged) ---
  const totalPages = Math.ceil(warehouses.length / itemsPerPage);
  const currentItems = warehouses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const formatted = data.map((item, index) => ({
        _id: Date.now().toString() + index,
        name: item["Warehouse Name"] || "",
        location: item["Location"] || "",
      }));
      setWarehouses(formatted);
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const exportData = warehouses.map(({ name, location }) => ({
      "Warehouse Name": name,
      Location: location,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Warehouses");
    XLSX.writeFile(wb, "warehouse-data.xlsx");
  };

  const handleDownloadTemplate = () => {
    const template = [{ "Warehouse Name": "", Location: "" }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "warehouse-template.xlsx");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // --- Add/Edit Item States (unchanged for brevity) ---
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: "",
    hsn: "",
    barcode: "",
    unit: "Numbers",
    description: "",
    quantity: 0,
    date: "2020-04-01",
    cost: 0,
    value: 0,
    minQty: 50,
    taxAccount: "",
    cess: 0,
    purchasePriceExclusive: 0,
    purchasePriceInclusive: 0,
    salePriceExclusive: 0,
    salePriceInclusive: 0,
    discount: 0,
    category: "default",
    subcategory: "default",
    remarks: "",
    image: null,
    status: "In Stock",
    itemType: "Good",
    itemCategory: "",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setNewItem({ ...newItem, image: files[0] });
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([
    "Electronics", "Furniture", "Apparel", "Food", "Books",
    "Automotive", "Medical", "Software", "Stationery", "Other"
  ]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      setNewItem((prev) => ({ ...prev, itemCategory: trimmed }));
    }
    setNewCategory("");
    setShowAddCategoryModal(false);
  };

  const [items, setItems] = useState([
    {
      itemName: "Sample Item",
      hsn: "1234",
      barcode: "ABC123",
      unit: "Numbers",
      description: "Sample inventory item description.",
      quantity: 10,
      date: "2020-04-01",
      cost: 100,
      value: 1000,
      minQty: 5,
      taxAccount: "5% GST",
      cess: 0,
      purchasePriceExclusive: 90,
      purchasePriceInclusive: 95,
      salePriceExclusive: 110,
      salePriceInclusive: 115,
      discount: 5,
      category: "default",
      itemCategory: "Furniture",
      itemType: "Good",
      subcategory: "default",
      remarks: "Internal only",
      image: null,
      status: "In Stock",
      warehouse: "Main Warehouse",
    },
    {
      itemName: "Out of Stock Item",
      hsn: "5678",
      barcode: "XYZ567",
      unit: "Kg",
      description: "This item is currently out of stock.",
      quantity: 0,
      date: "2024-12-01",
      cost: 200,
      value: 0,
      minQty: 10,
      taxAccount: "12% GST",
      cess: 0,
      purchasePriceExclusive: 180,
      purchasePriceInclusive: 200,
      salePriceExclusive: 220,
      salePriceInclusive: 250,
      discount: 0,
      category: "Electronics",
      subcategory: "Accessories",
      remarks: "Awaiting new shipment",
      image: null,
      status: "Out of Stock",
      warehouse: "Backup Warehouse",
      itemCategory: "Electronics",
      itemType: "Service",
    },
  ]);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleAddItem = () => {
    setItems([...items, newItem]);
    setShowAdd(false);
  };

  const handleUpdateItem = () => {
    const updated = items.map((i) => (i === selectedItem ? { ...newItem } : i));
    setItems(updated);
    setShowEdit(false);
  };

  const handleAddStockModal = (warehouse) => {
    setSelectedWarehouse(warehouse.name);
    setShowAdd(true);
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
        <h4 className="fw-semibold d-flex align-items-center gap-2">
          <span>Manage Warehouses</span>
        </h4>

        <Form.Control
          type="text"
          placeholder="Filter by location"
          value={filterLocation}
          onChange={(e) => {
            setFilterLocation(e.target.value);
            setCurrentPage(1);
          }}
          style={{ maxWidth: "300px" }}
        />

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn rounded-pill text-white"
            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
            onClick={() => document.getElementById("excelImport").click()}
          >
            <i className="fas fa-file-import me-2" /> Import
          </button>

          <input
            type="file"
            id="excelImport"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleImport}
          />

          <Button
            className="rounded-pill text-white"
            style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14" }}
            onClick={handleExport}
          >
            <i className="fas fa-file-export me-2" /> Export
          </Button>

          <Button
            className="rounded-pill text-white"
            style={{ backgroundColor: "#ffc107", borderColor: "#ffc107" }}
            onClick={handleDownloadTemplate}
          >
            <i className="fas fa-download me-2" /> Download
          </Button>

          <Button
            className="set_btn text-white fw-semibold"
            style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
            onClick={() => handleModalShow()}
            disabled={loading}
          >
            <i className="fa fa-plus me-2"></i> Create Warehouse
          </Button>
        </div>
      </div>

      <div className="shadow p-4 rounded-4">
        {loading ? (
          <div className="text-center py-4">Loading warehouses...</div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : warehouses.length === 0 ? (
          <Alert variant="info">No warehouses found for this company.</Alert>
        ) : (
          <>
            <div className="table-responsive mt-3">
              <Table bordered striped hover>
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Warehouse Name</th>
                    <th>Total Stocks</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((w, index) => (
                      <tr key={w._id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td
                          className="text-primary"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/company/warehouse/${w._id}`)}
                        >
                          <u>{w.name}</u>
                        </td>
                        <td>{w.totalStocks}</td>
                        <td>{w.location}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <Button
                              variant="link"
                              className="text-warning p-0"
                              onClick={() => handleModalShow(w)}
                              title="Edit"
                              disabled={loading}
                            >
                              <FaEdit size={18} />
                            </Button>
                            <Button
                              variant="link"
                              className="text-danger p-0"
                              onClick={() => handleDelete(w._id)}
                              title="Delete"
                              disabled={loading}
                            >
                              <FaTrash size={18} />
                            </Button>
                          </div>

                          <AddProductModal
                            showAdd={showAdd}
                            showEdit={showEdit}
                            newItem={newItem}
                            categories={categories}
                            newCategory={newCategory}
                            showUOMModal={showUOMModal}
                            showAddCategoryModal={showAddCategoryModal}
                            setShowAdd={setShowAdd}
                            setShowEdit={setShowEdit}
                            setShowUOMModal={setShowUOMModal}
                            setShowAddCategoryModal={setShowAddCategoryModal}
                            setNewCategory={setNewCategory}
                            handleChange={handleChange}
                            handleAddItem={handleAddItem}
                            handleUpdateItem={handleUpdateItem}
                            handleAddCategory={handleAddCategory}
                            formMode="addStock"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No warehouses match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2 px-2">
              <span className="small text-muted">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, warehouses.length)} of{" "}
                {warehouses.length} entries
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0 flex-wrap">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-start"
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li
                      key={index + 1}
                      className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        style={
                          currentPage === index + 1
                            ? { backgroundColor: "#3daaaa", borderColor: "#3daaaa" }
                            : {}
                        }
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-end"
                      onClick={() =>
                        currentPage < totalPages && setCurrentPage(currentPage + 1)
                      }
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Warehouse Modal */}
      <Modal show={showModal} onHide={resetFormAndCloseModal} size="md">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Warehouse" : "Create Warehouse"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && (
            <Alert variant="danger" onClose={() => setModalError(null)} dismissible>
              {modalError}
            </Alert>
          )}
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Warehouse Name</Form.Label>
              <Form.Control
                type="text"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                required
                placeholder="Enter warehouse name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Enter location"
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={resetFormAndCloseModal}>
                Close
              </Button>
              <Button
                type="submit"
                className="ms-2"
                style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {editId ? "Updating..." : "Creating..."}
                  </>
                ) : editId ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Page Description */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul
            className="text-muted fs-6 mb-0"
            style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}
          >
            <li>
              This page allows users to manage multiple warehouses by viewing,
              adding, editing, deleting, importing, and exporting warehouse
              details along with stock and location information.
            </li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default WareHouse;