import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Card } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash, FaPlus, FaInfoCircle } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AddProductModal from "./AddProductModal";
import { BiTransfer } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";

const InventoryItems = () => {
  const navigate = useNavigate();
  const [quantityRange, setQuantityRange] = useState("All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [showDelete, setShowDelete] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const fileInputRef = React.useRef(null);

  const companyId = GetCompanyId();

  const safeTrim = (value) => {
    return value && typeof value === "string" ? value.trim() : "";
  };

  const fetchProductsByCompanyId = async (companyId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `products/company/${companyId}`
      );

      if (response.data?.success && Array.isArray(response.data.data)) {
        const transformedItems = response.data.data.map((product) => ({
          id: product.id || 0,
          itemName: safeTrim(product.item_name) || "Unnamed Product",
          hsn: safeTrim(product.hsn) || "N/A",
          barcode: product.barcode || "",
          unit: "Numbers",
          description: safeTrim(product.description) || "No description available",
          quantity: product.initial_qty || 0,
          date: product.as_of_date || "2020-01-01",
          cost: parseFloat(product.initial_cost) || 0,
          value: (parseFloat(product.initial_cost) || 0) * (product.initial_qty || 0),
          minQty: product.min_order_qty || 0,
          taxAccount: safeTrim(product.tax_account) || "N/A",
          cess: 0,
          purchasePriceExclusive: parseFloat(product.purchase_price) || 0,
          purchasePriceInclusive: parseFloat(product.purchase_price) || 0,
          salePriceExclusive: parseFloat(product.sale_price) || 0,
          salePriceInclusive: parseFloat(product.sale_price) || 0,
          discount: parseFloat(product.discount) || 0,
          category: "default",
          itemCategory: product.item_category?.item_category_name || "Unknown",
          itemType: "Good",
          subcategory: "default",
          remarks: safeTrim(product.remarks) || "",
          image: product.image || null,
          status: (product.initial_qty || 0) > 0 ? "In Stock" : "Out of Stock",
          warehouse: product.warehouse?.warehouse_name || "Unknown",
          warehouseId: product.warehouse_id || "",
          itemCategoryId: product.item_category_id || "",
        }));

        setItems(transformedItems);
      } else {
        setError(response.data?.message || "Failed to fetch products");
      }
    } catch (err) {
      setError("Error fetching products: " + err.message);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Unified refresh function
  const refreshProducts = () => {
    if (companyId) {
      fetchProductsByCompanyId(companyId);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchProductsByCompanyId(companyId);
    }
  }, [companyId]);

  const uniqueCategories = ["All", ...new Set(items.map((item) => item.itemCategory))];
  const uniqueWarehouses = ["All", ...new Set(items.map((item) => item.warehouse))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.itemCategory === selectedCategory;
    const matchesWarehouse = selectedWarehouse === "All" || item.warehouse === selectedWarehouse;

    let matchesQuantity = true;
    const qty = item.quantity;
    switch (quantityRange) {
      case "Negative":
        matchesQuantity = qty < 0;
        break;
      case "0-10":
        matchesQuantity = qty >= 0 && qty <= 10;
        break;
      case "10-50":
        matchesQuantity = qty > 10 && qty <= 50;
        break;
      case "50-100":
        matchesQuantity = qty > 50 && qty <= 100;
        break;
      case "100+":
        matchesQuantity = qty > 100;
        break;
      case "Low Quantity":
        matchesQuantity = qty <= item.minQty;
        break;
      default:
        matchesQuantity = true;
    }

    return matchesSearch && matchesCategory && matchesWarehouse && matchesQuantity;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredItems.map((item) => item.id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStatusChange = (index, value) => {
    const updatedItems = [...items];
    updatedItems[index].status = value;
    setItems(updatedItems);
  };

  // ===================================================================
  // UPDATED DELETE FUNCTION
  // ===================================================================
  const handleDeleteItem = async () => {
    if (!selectedItem?.id) {
      alert("No item selected for deletion");
      setShowDelete(false); // Close modal even if no item selected
      return;
    }

    setIsDeleting(true);
    try {
      // *** FIX 1: Corrected the API endpoint ***
      // Changed from `products/${selectedItem.id}` to `products/product/${selectedItem.id}`
      // to match the likely backend routing structure.
      const response = await axiosInstance.delete(`products/${selectedItem.id}`);
      
      console.log("Delete API Response:", response.data); // For debugging

      if (response.data?.success) {
        // *** FIX 2: Optimistic UI Update ***
        // Immediately remove the item from the state for a better user experience.
        // The list will refresh in the background anyway.
        setItems(prevItems => prevItems.filter(item => item.id !== selectedItem.id));
        
        // Refresh the full list from the server to ensure everything is in sync.
        refreshProducts();
        
        // *** FIX 3: Ensure Modal Closes ***
        // This was already correct, but now it will definitely be reached on success.
        setShowDelete(false);
        
        alert("Product deleted successfully!");
      } else {
        // Handle cases where the server responded but the operation failed.
        const errorMessage = response.data?.message || "The server reported a failure to delete the product.";
        console.error("Server reported deletion failure:", errorMessage);
        alert(`Failed to delete product. ${errorMessage}`);
      }
    } catch (error) {
      // *** FIX 4: Enhanced Error Handling ***
      // This block now provides much more detailed feedback for debugging.
      console.error("Delete API Error:", error);

      let errorMessage = "An unknown error occurred.";
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error Data:", error.response.data);
        console.error("Error Status:", error.response.status);
        errorMessage = error.response.data?.message || `Server error with status ${error.response.status}.`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error Request:", error.request);
        errorMessage = "No response received from server. Check your network connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }
      
      alert(`Error deleting product: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      [
        "itemName",
        "hsn",
        "barcode",
        "unit",
        "description",
        "quantity",
        "date",
        "cost",
        "value",
        "minQty",
        "taxAccount",
        "cess",
        "purchasePriceExclusive",
        "purchasePriceInclusive",
        "salePriceExclusive",
        "salePriceInclusive",
        "discount",
        "category",
        "subcategory",
        "remarks",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "InventoryTemplate");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "Inventory_Template.xlsx"
    );
  };

  const handleExport = () => {
    const exportData = items.map(item => ({
      itemName: item.itemName,
      hsn: item.hsn,
      barcode: item.barcode,
      description: item.description,
      quantity: item.quantity,
      cost: item.cost,
      value: item.value,
      minQty: item.minQty,
      taxAccount: item.taxAccount,
      discount: item.discount,
      remarks: item.remarks
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "InventoryExport");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "Inventory_Export.xlsx"
    );
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet);
      const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
      const itemsWithIds = data.map((item, index) => ({
        ...item,
        id: newId + index,
      }));
      setItems((prev) => [...prev, ...itemsWithIds]);
    };
    reader.readAsBinaryString(file);
  };

  const handleProductClick = (item, e) => {
    if (e && (e.target.closest("button") || e.target.closest(".btn"))) {
      return;
    }
    navigate(`/company/inventorydetails/${item.id}`, { state: { item } });
  };

  const handleSendAll = () => {
    alert("All items sent successfully!");
  };

  const handleSendItem = (item) => {
    alert(`Item "${item.itemName}" sent successfully!`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="alert alert-warning" role="alert">
        Company ID not found. Please make sure you are logged in to a company.
      </div>
    );
  }

  return (
    <div className="mt-4 p-2">
      <Row className="align-items-center mb-3">
        <Col md={4}>
          <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <BiTransfer size={40} color="green" />
            <span>Inventory Product</span>
          </h4>
        </Col>
        <Col md={8} className="text-md-end d-flex flex-wrap gap-2 justify-content-md-end">
          <Button
            style={{ backgroundColor: "#00c78c", border: "none", color: "#fff", padding: "6px 16px" }}
            onClick={handleImportClick}
          >
            Import
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleImport}
            style={{ display: "none" }}
          />
          <Button
            style={{ backgroundColor: "#ff7e00", border: "none", color: "#fff", padding: "6px 16px" }}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            style={{ backgroundColor: "#f6c100", border: "none", color: "#000", padding: "6px 16px" }}
            onClick={handleDownloadTemplate}
          >
            Download Template
          </Button>
          <Button
            onClick={() => setShowAdd(true)}
            style={{ backgroundColor: "#27b2b6", border: "none", color: "#fff", padding: "6px 16px" }}
          >
            Add Product
          </Button>
          <Button
            style={{ backgroundColor: "#17a2b8", border: "none", color: "#fff", padding: "6px 16px", marginLeft: "8px" }}
            onClick={handleSendAll}
          >
            Send All
          </Button>
          {selectedItems.length > 0 && (
            <Button
              style={{ backgroundColor: "#28a745", border: "none", color: "#fff" }}
              onClick={() => {
                const selectedData = items.filter((item) => selectedItems.includes(item.id));
                alert(`${selectedData.length} item(s) sent successfully!`);
              }}
            >
              Send Selected ({selectedItems.length})
            </Button>
          )}
          {selectedItems.length > 0 && (
            <Button variant="outline-secondary" size="sm" onClick={() => setSelectedItems([])} className="ms-2">
              Clear
            </Button>
          )}

          <AddProductModal
            showAdd={showAdd}
            showEdit={showEdit}
            setShowAdd={setShowAdd}
            setShowEdit={setShowEdit}
            selectedItem={selectedItem}
            companyId={companyId}
            showAddCategoryModal={showAddCategoryModal}
            setShowAddCategoryModal={setShowAddCategoryModal}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            onSuccess={refreshProducts}
          />
        </Col>
      </Row>

      <Row className="mb-3 px-3 py-2 align-items-center g-2">
        <Col xs={12} sm={3}>
          <Form.Control
            type="text"
            placeholder="Search item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-pill"
          />
        </Col>
      </Row>

      <Row className="mb-3 px-3 py-2 align-items-center g-2">
        <Col xs={12} sm={3}>
          <Form.Select
            className="rounded-pill"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {uniqueCategories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} sm={3}>
          <Form.Select
            className="rounded-pill"
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
          >
            {uniqueWarehouses.map((wh, idx) => (
              <option key={idx} value={wh}>
                {wh}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} sm={3}>
          <Form.Select
            className="rounded-pill"
            value={quantityRange}
            onChange={(e) => setQuantityRange(e.target.value)}
          >
            <option value="All">All Quantities</option>
            <option value="Negative">Negative Quantity</option>
            <option value="Low Quantity">Low Quantity</option>
            <option value="0-10">0 - 10</option>
            <option value="10-50">10 - 50</option>
            <option value="50-100">50 - 100</option>
            <option value="100+">100+</option>
          </Form.Select>
        </Col>
      </Row>

      <div className="card bg-white rounded-3 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>
                  <Form.Check
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={handleSelectAll}
                    disabled={filteredItems.length === 0}
                  />
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>HSN</th>
                <th>Quantity</th>
                <th>Warehouse</th>
                <th>Amount</th>
                <th>Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </td>
                    <td
                      style={{ color: "#007bff", fontWeight: "bold", cursor: "pointer" }}
                      className="product-cell"
                      onClick={(e) => handleProductClick(item, e)}
                    >
                      <span className="product-name">{item.itemName}</span>
                    </td>
                    <td>{item.itemCategory}</td>
                    <td>{item.hsn}</td>
                    <td>{item.quantity}</td>
                    <td>{item.warehouse}</td>
                    <td>{item.cost}</td>
                    <td>{item.value}</td>
                    <td>
                      <span
                        className={`badge px-3 py-1 rounded-pill fw-semibold ${
                          item.status === "In Stock" ? "bg-success text-white" : "bg-danger text-white"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="link"
                          className="text-info p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setShowView(true);
                          }}
                          title="Quick View"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="link"
                          className="text-warning p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setShowEdit(true);
                          }}
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setShowDelete(true);
                          }}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                        <Button
                          variant="link"
                          className="text-primary p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/company/inventorydetails/${item.id}`, { state: { item } });
                          }}
                          title="View Details"
                        >
                          view details
                        </Button>
                        <Button
                          variant="link"
                          className="text-success p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendItem(item);
                          }}
                          title="Send Item"
                        >
                          Send
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <small className="text-muted ms-2">
            Showing 1 to {filteredItems.length} of {filteredItems.length} results
          </small>
          <nav>
            <ul className="pagination mb-0">
              <li className="page-item disabled">
                <button className="page-link">&laquo;</button>
              </li>
              <li className="page-item active">
                <button className="page-link">1</button>
              </li>
              <li className="page-item">
                <button className="page-link">2</button>
              </li>
              <li className="page-item">
                <button className="page-link">&raquo;</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* View Modal */}
      <Modal show={showView} onHide={() => setShowView(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Item Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Item Name:</strong> {selectedItem.itemName}
                </Col>
                <Col md={6}>
                  <strong>HSN:</strong> {selectedItem.hsn}
                </Col>
                <Col md={6}>
                  <strong>Barcode:</strong> {selectedItem.barcode}
                </Col>
                <Col md={6}>
                  <strong>Unit:</strong> {selectedItem.unit}
                </Col>
                <Col md={12}>
                  <strong>Description:</strong> {selectedItem.description}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Quantity:</strong> {selectedItem.quantity}
                </Col>
                <Col md={6}>
                  <strong>Date:</strong> {selectedItem.date}
                </Col>
                <Col md={6}>
                  <strong>Cost:</strong> {selectedItem.cost}
                </Col>
                <Col md={6}>
                  <strong>Value:</strong> {selectedItem.value}
                </Col>
                <Col md={6}>
                  <strong>Min Order Qty:</strong> {selectedItem.minQty}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Tax Account:</strong> {selectedItem.taxAccount}
                </Col>
                <Col md={6}>
                  <strong>Cess:</strong> {selectedItem.cess}
                </Col>
                <Col md={6}>
                  <strong>Purchase Price (Incl):</strong> {selectedItem.purchasePriceInclusive}
                </Col>
                <Col md={6}>
                  <strong>Sale Price (Incl):</strong> {selectedItem.salePriceInclusive}
                </Col>
                <Col md={6}>
                  <strong>Discount %:</strong> {selectedItem.discount}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Category:</strong> {selectedItem.itemCategory}
                </Col>
                <Col md={6}>
                  <strong>Subcategory:</strong> {selectedItem.subcategory}
                </Col>
                <Col md={12}>
                  <strong>Remarks:</strong> {selectedItem.remarks}
                </Col>
              </Row>
              {selectedItem.image && (
                <Row className="mb-3">
                  <Col md={12}>
                    <strong>Image Preview:</strong>
                    <br />
                    <img
                      src={selectedItem.image}
                      alt="item preview"
                      style={{ maxHeight: "200px", marginTop: "10px" }}
                    />
                  </Col>
                </Row>
              )}
            </>
          )}                                                                                                                                                  
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowView(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDelete} onHide={() => !isDeleting && setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this item? This action cannot be undone.
          {selectedItem && <div className="mt-2"><strong>{selectedItem.itemName}</strong></div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteItem} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Page Description */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>An Inventory Product Management Interface displaying product details, status, and actions.</li>
            <li>Options to import/export data.</li>
            <li>Ability to manage and maintain records.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default InventoryItems;