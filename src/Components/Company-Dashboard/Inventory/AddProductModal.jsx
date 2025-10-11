import React, { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import axios from "axios";
import BaseUrl from "../../../Api/BaseUrl";
import GetCompanyId from "../../../Api/GetCompanyId";
import Spinner from 'react-bootstrap/Spinner';

const AddProductModal = ({
  showAdd,
  showEdit,
  categories,
  newCategory,
  showAddCategoryModal,
  setShowAdd,
  setShowEdit,
  setShowAddCategoryModal,
  setNewCategory,
  handleAddItem,
  handleUpdateItem,
  handleAddCategory,
  formMode,
  resetForm,
  selectedItem,
  companyId, // Add companyId prop
}) => {
  const isEditing = showEdit;
  const isAdding = showAdd;

  const [localNewItem, setLocalNewItem] = useState({
    id: '',
    itemName: '',
    hsn: '',
    barcode: '',
    image: null,
    warehouse: '',
    itemCategory: '',
    description: '',
    quantity: '',
    sku: '',
    minQty: '',
    date: new Date().toISOString().split('T')[0],
    taxAccount: '',
    cost: '',
    salePriceExclusive: '',
    salePriceInclusive: '',
    discount: '',
    remarks: ''
  });

  const [newUOM, setNewUOM] = useState("");
  const [showAddUOMModal, setShowAddUOMModal] = useState(false);
  const [uoms, setUoms] = useState(["Piece", "Box", "KG", "Meter", "Litre"]);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const fileInputRef = useRef(null);
  const isInitialMount = useRef(true);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setLocalNewItem(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  // Reset local form
  const resetLocalForm = () => {
    setLocalNewItem({
      id: '',
      itemName: '',
      hsn: '',
      barcode: '',
      image: null,
      warehouse: warehouses.length > 0 ? warehouses[0].warehouse_name : '',
      itemCategory: '',
      description: '',
      quantity: '',
      sku: '',
      minQty: '',
      date: new Date().toISOString().split('T')[0],
      taxAccount: '',
      cost: '',
      salePriceExclusive: '',
      salePriceInclusive: '',
      discount: '',
      remarks: ''
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Populate form when editing (after initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isEditing && selectedItem) {
      setLocalNewItem({
        id: selectedItem.id || '',
        itemName: selectedItem.itemName || '',
        hsn: selectedItem.hsn || '',
        barcode: selectedItem.barcode || '',
        image: null,
        warehouse: selectedItem.warehouse || (warehouses.length > 0 ? warehouses[0].warehouse_name : ''),
        itemCategory: selectedItem.itemCategory || '',
        description: selectedItem.description || '',
        quantity: selectedItem.quantity || '',
        sku: selectedItem.sku || '',
        minQty: selectedItem.minQty || '',
        date: selectedItem.date || new Date().toISOString().split('T')[0],
        taxAccount: selectedItem.taxAccount || '',
        cost: selectedItem.cost || '',
        salePriceExclusive: selectedItem.salePriceExclusive || '',
        salePriceInclusive: selectedItem.salePriceInclusive || '',
        discount: selectedItem.discount || '',
        remarks: selectedItem.remarks || ''
      });
    } else if (isAdding) {
      resetLocalForm();
    }
  }, [isEditing, isAdding, selectedItem, warehouses]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axios.get(`${BaseUrl}item-categories`);
        if (response.data?.status && Array.isArray(response.data.data)) {
          const categoryNames = response.data.data.map(cat => cat.item_category_name);
          setFetchedCategories(categoryNames);
        } else {
          setFetchedCategories(categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setFetchedCategories(categories || []);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [categories]);

  // Fetch warehouses
  useEffect(() => {
    if (!companyId) return;

    const fetchWarehouses = async () => {
      setIsLoadingWarehouses(true);
      try {
        const response = await axios.get(`${BaseUrl}warehouses`);
        if (response.data?.status && Array.isArray(response.data.data)) {
          const numericCompanyId = parseInt(companyId, 10);
          const filteredWarehouses = response.data.data.filter(wh => {
            const whCompanyId = parseInt(wh.company_id, 10);
            return !isNaN(whCompanyId) && whCompanyId === numericCompanyId;
          });
          setWarehouses(filteredWarehouses);

          // Set default warehouse if needed
          if (filteredWarehouses.length > 0 && !localNewItem.warehouse) {
            setLocalNewItem(prev => ({
              ...prev,
              warehouse: filteredWarehouses[0].warehouse_name
            }));
          }
        } else {
          setWarehouses([]);
        }
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        setWarehouses([]);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    fetchWarehouses();
  }, [companyId]);

  // Add new category
  const handleAddCategoryApi = async () => {
    if (!newCategory.trim()) return;
    setIsAddingCategory(true);
    try {
      await axios.post(`${BaseUrl}itemcategory`, {
        company_id: companyId,
        item_category_name: newCategory.trim(),
      });

      const res = await axios.get(`${BaseUrl}item-categories`);
      if (res.data?.status && Array.isArray(res.data.data)) {
        const names = res.data.data.map(c => c.item_category_name);
        setFetchedCategories(names);
        setLocalNewItem(prev => ({ ...prev, itemCategory: newCategory.trim() }));
      }

      setNewCategory("");
      setShowAddCategoryModal(false);
      if (handleAddCategory) handleAddCategory();
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Add product
  const handleAddProductApi = async () => {
    setIsAddingProduct(true);
    try {
      // Get category ID
      let categoryId = 1;
      try {
        const res = await axios.get(`${BaseUrl}item-categories`);
        if (res.data?.status && Array.isArray(res.data.data)) {
          const cat = res.data.data.find(c => c.item_category_name === localNewItem.itemCategory);
          if (cat) categoryId = cat.id;
        }
      } catch (error) {
        console.error("Error fetching category ID:", error);
      }

      const selectedWarehouse = warehouses.find(w => w.warehouse_name === localNewItem.warehouse);
      const warehouseId = selectedWarehouse ? selectedWarehouse.id : 1;

      if (!selectedWarehouse && warehouses.length > 0) {
        alert("Please select a valid warehouse.");
        return;
      }

      const formData = new FormData();
      formData.append('company_id', companyId);
      formData.append('warehouse_id', warehouseId);
      formData.append('item_category_id', categoryId);
      formData.append('item_name', localNewItem.itemName || '');
      formData.append('hsn', localNewItem.hsn || '');
      formData.append('barcode', localNewItem.barcode || '');
      formData.append('sku', localNewItem.sku || '');
      formData.append('description', localNewItem.description || '');
      formData.append('initial_qty', localNewItem.quantity || 0);
      formData.append('min_order_qty', localNewItem.minQty || 0);
      formData.append('as_of_date', localNewItem.date || new Date().toISOString().split('T')[0]);
      formData.append('initial_cost', localNewItem.cost || 0);
      formData.append('sale_price', localNewItem.salePriceExclusive || 0);
      formData.append('purchase_price', localNewItem.salePriceInclusive || 0);
      formData.append('discount', localNewItem.discount || 0);
      formData.append('tax_account', localNewItem.taxAccount || '');
      formData.append('remarks', localNewItem.remarks || '');
      if (localNewItem.image) {
        formData.append('image', localNewItem.image);
      }

      const response = await axios.post(`${BaseUrl}products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.status) {
        resetLocalForm();
        if (resetForm) resetForm();
        setShowAdd(false);
        if (handleAddItem) handleAddItem(); // This will re-fetch products in parent
      } else {
        console.error("Failed to add product:", response.data?.message);
        alert("Failed to add product. Please try again.");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("An error occurred while adding the product.");
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Update product
  const handleUpdateProductApi = async () => {
    if (!localNewItem.id) {
      console.error("No product ID for update");
      return;
    }

    setIsUpdatingProduct(true);
    try {
      let categoryId = 1;
      try {
        const res = await axios.get(`${BaseUrl}item-categories`);
        if (res.data?.status && Array.isArray(res.data.data)) {
          const cat = res.data.data.find(c => c.item_category_name === localNewItem.itemCategory);
          if (cat) categoryId = cat.id;
        }
      } catch (error) {
        console.error("Error fetching category ID:", error);
      }

      const selectedWarehouse = warehouses.find(w => w.warehouse_name === localNewItem.warehouse);
      const warehouseId = selectedWarehouse ? selectedWarehouse.id : 1;

      const formData = new FormData();
      formData.append('company_id', companyId);
      formData.append('warehouse_id', warehouseId);
      formData.append('item_category_id', categoryId);
      formData.append('item_name', localNewItem.itemName || '');
      formData.append('hsn', localNewItem.hsn || '');
      formData.append('barcode', localNewItem.barcode || '');
      formData.append('sku', localNewItem.sku || '');
      formData.append('description', localNewItem.description || '');
      formData.append('initial_qty', localNewItem.quantity || 0);
      formData.append('min_order_qty', localNewItem.minQty || 0);
      formData.append('as_of_date', localNewItem.date || new Date().toISOString().split('T')[0]);
      formData.append('initial_cost', localNewItem.cost || 0);
      formData.append('sale_price', localNewItem.salePriceExclusive || 0);
      formData.append('purchase_price', localNewItem.salePriceInclusive || 0);
      formData.append('discount', localNewItem.discount || 0);
      formData.append('tax_account', localNewItem.taxAccount || '');
      formData.append('remarks', localNewItem.remarks || '');
      if (localNewItem.image) {
        formData.append('image', localNewItem.image);
      }

      const response = await axios.patch(`${BaseUrl}products/${localNewItem.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.status) {
        resetLocalForm();
        if (resetForm) resetForm();
        setShowEdit(false);
        if (handleUpdateItem) {
          handleUpdateItem(); // This will re-fetch products in parent
        }
      } else {
        console.error("Failed to update product:", response.data?.message);
        alert("Failed to update product. Please try again.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("An error occurred while updating the product.");
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleAddUOM = () => {
    if (newUOM.trim() && !uoms.includes(newUOM.trim())) {
      setUoms(prev => [...prev, newUOM.trim()]);
    }
    setNewUOM("");
    setShowAddUOMModal(false);
  };

  // Set default warehouse for addStock mode
  useEffect(() => {
    if (formMode === "addStock" && warehouses.length > 0 && !localNewItem.warehouse) {
      setLocalNewItem(prev => ({
        ...prev,
        warehouse: warehouses[0].warehouse_name
      }));
    }
  }, [formMode, warehouses]);

  // Close modal
  const handleClose = () => {
    if (isAdding) {
      resetLocalForm();
    }
    setShowAdd(false);
    setShowEdit(false);
  };

  return (
    <>
      {/* Main Modal */}
      <Modal
        show={isAdding || isEditing}
        onHide={handleClose}
        centered
        size="xl"
        key={isAdding ? 'add-modal' : 'edit-modal'}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>{isAdding ? "Add Product" : "Edit Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control
                    name="itemName"
                    value={localNewItem.itemName}
                    onChange={handleChange}
                    placeholder="Enter item name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>HSN</Form.Label>
                  <Form.Control
                    name="hsn"
                    value={localNewItem.hsn}
                    onChange={handleChange}
                    placeholder="Enter HSN code"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Barcode</Form.Label>
                  <Form.Control
                    name="barcode"
                    value={localNewItem.barcode}
                    onChange={handleChange}
                    placeholder="Enter barcode"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Item Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    ref={fileInputRef}
                    onChange={handleChange}
                    accept="image/*"
                  />
                  {isEditing && selectedItem?.image && (
                    <Form.Text className="text-muted d-block mt-1">
                      Current image: Already uploaded
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Warehouse</Form.Label>
                  {formMode === "addStock" ? (
                    <Form.Control
                      type="text"
                      value={localNewItem.warehouse}
                      readOnly
                      className="bg-light"
                    />
                  ) : (
                    <>
                      {isLoadingWarehouses ? (
                        <Form.Control
                          type="text"
                          value="Loading warehouses..."
                          readOnly
                          className="bg-light"
                        />
                      ) : (
                        <Form.Select
                          name="warehouse"
                          value={localNewItem.warehouse}
                          onChange={handleChange}
                          className={warehouses.length === 0 ? "text-muted" : ""}
                        >
                          <option value="">
                            {warehouses.length === 0 ? "No warehouses available" : "Select Warehouse"}
                          </option>
                          {warehouses.map((wh) => (
                            <option key={wh.id} value={wh.warehouse_name}>
                              {wh.warehouse_name} - {wh.location}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                      {warehouses.length === 0 && !isLoadingWarehouses && (
                        <Form.Text className="text-muted">
                          No warehouses found for company ID: {companyId}
                        </Form.Text>
                      )}
                    </>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label className="mb-0">Item Category</Form.Label>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowAddCategoryModal(true)}
                      style={{
                        backgroundColor: "#27b2b6",
                        border: "none",
                        color: "#fff",
                        padding: "6px 16px",
                      }}
                    >
                      + Add New
                    </Button>
                  </div>
                  <Form.Select
                    name="itemCategory"
                    value={localNewItem.itemCategory}
                    onChange={handleChange}
                    className="mt-2"
                  >
                    <option value="">Select Category</option>
                    {isLoadingCategories ? (
                      <option value="" disabled>Loading categories...</option>
                    ) : (
                      fetchedCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Item Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={localNewItem.description}
                    onChange={handleChange}
                    placeholder="Enter item description"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Initial Quantity On Hand</Form.Label>
                  <Form.Control
                    name="quantity"
                    type="number"
                    value={localNewItem.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>SKU</Form.Label>
                  <Form.Control
                    name="sku"
                    value={localNewItem.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Minimum Order Quantity</Form.Label>
                  <Form.Control
                    name="minQty"
                    type="number"
                    value={localNewItem.minQty}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>As Of Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={localNewItem.date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Default Tax Account</Form.Label>
                  <Form.Control
                    name="taxAccount"
                    value={localNewItem.taxAccount}
                    onChange={handleChange}
                    placeholder="Enter tax account"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Initial Cost/Unit</Form.Label>
                  <Form.Control
                    name="cost"
                    type="number"
                    value={localNewItem.cost}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Default Sale Price (Exclusive)</Form.Label>
                  <Form.Control
                    name="salePriceExclusive"
                    type="number"
                    value={localNewItem.salePriceExclusive}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Default Purchase Price (Inclusive)</Form.Label>
                  <Form.Control
                    name="salePriceInclusive"
                    type="number"
                    value={localNewItem.salePriceInclusive}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Default Discount %</Form.Label>
                  <Form.Control
                    name="discount"
                    type="number"
                    value={localNewItem.discount}
                    onChange={handleChange}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    name="remarks"
                    value={localNewItem.remarks}
                    onChange={handleChange}
                    placeholder="Enter remarks"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#27b2b6", borderColor: "#27b2b6" }}
            onClick={isAdding ? handleAddProductApi : handleUpdateProductApi}
            disabled={
              isAddingProduct ||
              isUpdatingProduct ||
              (warehouses.length === 0 && !isLoadingWarehouses)
            }
          >
            {isAdding ? (
              isAddingProduct ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Adding...
                </>
              ) : "Add"
            ) : isUpdatingProduct ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        show={showAddCategoryModal}
        onHide={() => setShowAddCategoryModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter new category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddCategoryModal(false)}>
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#27b2b6", border: "none", color: "#fff" }}
            onClick={handleAddCategoryApi}
            // disabled={isAddingCategory || !newCategory.trim()}
          >
            {isAddingCategory ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add UOM Modal */}
      <Modal
        show={showAddUOMModal}
        onHide={() => setShowAddUOMModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New UOM</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>UOM Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter new UOM"
              value={newUOM}
              onChange={(e) => setNewUOM(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddUOMModal(false)}>
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#27b2b6", border: "none", color: "#fff" }}
            onClick={handleAddUOM}
            // disabled={!newUOM.trim()}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddProductModal;