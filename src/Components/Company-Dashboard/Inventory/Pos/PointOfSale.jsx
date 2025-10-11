import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Alert,
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  Image,
  Table,
} from "react-bootstrap";
import CustomerList from "./CustomerList";
import AddProductModal from "../AddProductModal";

const PointOfSale = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantity, setQuantity] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [quantityError, setQuantityError] = useState("");
  const [taxes, setTaxes] = useState([
    { _id: "1", taxClass: "GST", taxValue: 10 },
    { _id: "2", taxClass: "Luxury Tax", taxValue: 18 },
  ]);
  const [selectedTax, setSelectedTax] = useState(taxes[0]);
  const [paymentStatus, setPaymentStatus] = useState("3"); // Cash
  const [amountPaid, setAmountPaid] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  const [priceMap, setPriceMap] = useState({});
  const [price, setPrice] = useState(0);
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [cashAmount, setCashAmount] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setShowAdd(false);
  };

  const handleUpdateItem = () => {
    setShowEdit(false);
  };

  const handleAddCategory = () => {
    setShowAddCategoryModal(false);
  };

  const navigate = useNavigate();

  // Warehouse management
  const [warehouseStock, setWarehouseStock] = useState({
    p1: 100,
    p2: 100,
  });

  const productList = [
    {
      _id: "p1",
      name: "Product A",
      price: 100,
      warehouse: "Main Warehouse",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop&crop=center",
    },
    {
      _id: "p2",
      name: "Product B",
      price: 200,
      warehouse: "Secondary Warehouse",
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&h=80&fit=crop&crop=center", // Fixed extra space
    },
  ];

  // Modals
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);
  const [newTaxClass, setNewTaxClass] = useState("");
  const [newTaxValue, setNewTaxValue] = useState("");

  // --- NEW: Payment Completed Modal ---
  const [showPaymentCompletedModal, setShowPaymentCompletedModal] = useState(false);
  const [activeTab, setActiveTab] = useState("onhold");
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  // --- Mock Orders ---
const mockOrders = [
  {
    id: "#45698",
    Warehouse: "Main Warehouse",
    total: 900,
    date: "24 Dec 2024 13:39:11",
    productName: "Product A",
    status: "onhold",
    notes: "Customer need to recheck the product once",
  },
  {
    id: "#666659",
    Warehouse: "Secondary Warehouse",
    total: 900,
    date: "24 Dec 2024 13:39:11",
    productName: "Product B",
    status: "unpaid",
    notes: "",
  },
  {
    id: "#777777",
    Warehouse: "Outer Warehouse",
    total: 1000,
    date: "24 Dec 2024 13:39:11",
    productName: "Product C",
    status: "paid",
    notes: "Customer need to recheck the product once",
  },
];

const filteredOrders = mockOrders.filter((order) => {
  if (activeTab === "onhold") return order.status === "onhold";
  if (activeTab === "unpaid") return order.status === "unpaid";
  if (activeTab === "paid") return order.status === "paid";
  return true;
});


  const handleCreateInvoice = () => {
    // Update warehouse stock
    updateWarehouseStock();
    // Show the success modal
    setShowPaymentCompletedModal(true);
  };

  const handlePrintReceipt = () => {
    setShowPaymentCompletedModal(false);
    navigate("/company/invoice-summary", {
      state: {
        selectedCustomer,
        selectedProducts,
        quantity,
        priceMap,
        amountPaid,
        amountDue,
        total: calculateTotal(),
        subTotal: calculateSubTotal(),
        tax: selectedTax,
      },
    });
  };




  // --- Clear All Data ---
  const handleClear = () => {
    setSelectedCustomer(null);
    setSelectedProducts([]);
    setQuantity({});
    setPaymentStatus("3");
    setAmountPaid(0);
    setAmountDue(0);
  };

  // --- Update Warehouse Stock ---
  const updateWarehouseStock = () => {
    const updatedStock = { ...warehouseStock };
    selectedProducts.forEach((product) => {
      const productId = product._id;
      const soldQuantity = quantity[productId] || 1;
      updatedStock[productId] = Math.max(0, (updatedStock[productId] || 0) - soldQuantity);
    });
    setWarehouseStock(updatedStock);
  };

  // --- Tax Handlers ---
  const handleTaxFormSubmit = (e) => {
    e.preventDefault();
    if (!newTaxClass.trim() || !newTaxValue) return;
    const newTax = {
      _id: Date.now().toString(),
      taxClass: newTaxClass,
      taxValue: parseFloat(newTaxValue),
    };
    setTaxes([...taxes, newTax]);
    setSelectedTax(newTax);
    setShowAddTaxModal(false);
    setNewTaxClass("");
    setNewTaxValue("");
  };

  const handleTaxSelect = (e) => {
    const value = e.target.value;
    const tax = taxes.find((tax) => tax._id === value);
    setSelectedTax(tax || taxes[0]);
  };

  // --- Price & Quantity ---
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);
    const newPrice = parseFloat(value);
    if (!isNaN(newPrice)) {
      setPriceMap((prev) => ({
        ...prev,
        [currentProduct._id]: newPrice,
      }));
    }
  };

  const calculateSubTotal = () => {
    const productSubTotal = selectedProducts.reduce((total, item) => {
      const productPrice = parseFloat(priceMap[item._id] ?? item.price);
      const productQuantity = quantity[item._id] || 1;
      const priceWithoutGST = productPrice / (1 + (selectedTax.taxValue || 0) / 100);
      return total + priceWithoutGST * productQuantity;
    }, 0);
    return parseFloat(productSubTotal.toFixed(2));
  };

  const calculateTotal = () => {
    const total = selectedProducts.reduce((sum, item) => {
      const productPrice = parseFloat(priceMap[item._id] ?? item.price);
      const qty = quantity[item._id] || 1;
      return sum + productPrice * qty;
    }, 0);
    return parseFloat(total.toFixed(2));
  };

  const handleQuantityChange = (productId, quantityValue) => {
    setQuantity((prev) => ({
      ...prev,
      [productId]: quantityValue,
    }));
    setQuantityError("");
  };

  // --- Product Selection ---
  const handleProductSelection = (product) => {
    const index = selectedProducts.findIndex((p) => p._id === product._id);
    const updated = [...selectedProducts];
    if (index > -1) {
      updated[index] = { ...updated[index], quantity: quantity[product._id] || 1 };
    } else {
      updated.push({ ...product, quantity: 1 });
    }
    setSelectedProducts(updated);
  };

  const showModal = (product) => {
    setCurrentProduct(product);
    setPrice(product.price);
    setQuantity((prev) => ({
      ...prev,
      [product._id]: prev[product._id] || 1,
    }));
    setIsModalVisible(true);
  };

  const handleOk = () => {
    const availableStock = warehouseStock[currentProduct._id] || 0;
    const requestedQuantity = quantity[currentProduct._id] || 1;

    if (requestedQuantity > availableStock) {
      setQuantityError(`Only ${availableStock} units available in stock.`);
      return;
    }

    setQuantityError("");
    const index = selectedProducts.findIndex((p) => p._id === currentProduct._id);
    const updated = [...selectedProducts];
    if (index > -1) {
      updated[index] = { ...updated[index], quantity: quantity[currentProduct._id] || 1 };
    } else {
      updated.push({ ...currentProduct, quantity: quantity[currentProduct._id] || 1 });
    }
    setSelectedProducts(updated);
    setIsModalVisible(false);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleRemoveProduct = (id) => {
    setSelectedProducts(selectedProducts.filter((p) => p._id !== id));
  };

  // --- Payment Status ---
  const handlePaymentStatusChange = (e) => {
    const status = e.target.value;
    setPaymentStatus(status);

    if (status === "2") {
      setAmountPaid(calculateTotal());
      setAmountDue(0);
    } else if (status === "0") {
      setAmountPaid(0);
      setAmountDue(calculateTotal());
    } else if (status === "1") {
      setAmountPaid(calculateTotal() / 2);
      setAmountDue(calculateTotal() / 2);
    } else if (status === "3") {
      setAmountPaid(0);
      setAmountDue(calculateTotal());
    }
  };

  const handleAmountPaidChange = (e) => {
    const paid = parseFloat(e.target.value) || 0;
    setAmountPaid(paid);
    setAmountDue(calculateTotal() - paid);
  };

  // --- Cash Payment ---
  const handleCashPayment = () => {
    setShowCashPaymentModal(true);
    setCashAmount(calculateTotal());
  };

  const processCashPayment = () => {
    const total = calculateTotal();
    const paid = parseFloat(cashAmount) || 0;
    setAmountPaid(paid);
    setAmountDue(total - paid);

    if (paid >= total) {
      setPaymentStatus("2");
    } else if (paid > 0) {
      setPaymentStatus("1");
    } else {
      setPaymentStatus("0");
    }

    setShowCashPaymentModal(false);
  };

  return (
    <Container fluid className="mt-4 p-3 rounded-4 bg-white">
      <Row>
        {/* Left Side */}
        <Col md={8}>
          <CustomerList onSelectCustomer={setSelectedCustomer} />
          {selectedCustomer && (
            <Alert variant="info" className="mt-2">
              Selected Customer: {selectedCustomer.first_name} {selectedCustomer.last_name}
            </Alert>
          )}

          {/* Available Products */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
              <h4 className="mb-0">Available Products</h4>
              <button
                onClick={() => setShowAdd(true)}
                className="btn"
                style={{
                  backgroundColor: "#27b2b6",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "13px",
                }}
              >
                Add Product
              </button>
            </div>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Warehouse</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {productList.map((product) => {
                  const stock = warehouseStock[product._id] || 0;
                  const isSelected = selectedProducts.some((p) => p._id === product._id);
                  return (
                    <tr key={product._id}>
                      <td>
                        <div
                          className="cursor-pointer"
                          onClick={() => showModal(product)}
                          style={{ cursor: "pointer" }}
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            rounded
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              border: isSelected ? "2px solid #27b2b6" : "none",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      </td>
                      <td>{product.name}</td>
                      <td>A${product.price.toFixed(2)}</td>
                      <td>{product.warehouse}</td>
                      <td>{stock} units</td>
                      <td>
                        <Button
                          variant={isSelected ? "success" : "primary"}
                          onClick={() => showModal(product)}
                          size="sm"
                        >
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Selected Products */}
          <div className="border-2 p-3">
            <h4>Selected Products</h4>
            <div className="product-list">
              {selectedProducts.length === 0 ? (
                <p>No products selected</p>
              ) : (
                <Row>
                  {selectedProducts.map((product) => {
                    const qty = quantity[product._id] || 1;
                    const unitPrice = parseFloat(priceMap[product._id] ?? product.price) || 0;
                    const total = unitPrice * qty;
                    const stock = warehouseStock[product._id] || 0;
                    return (
                      <Col key={product._id} md={6} className="mb-3">
                        <Card>
                          <Card.Body className="d-flex">
                            <Image
                              src={product.image}
                              alt={product.name}
                              rounded
                              style={{ width: "80px", height: "80px", objectFit: "cover" }}
                              className="me-3"
                            />
                            <div className="flex-grow-1">
                              <Card.Title>{product.name}</Card.Title>
                              <Card.Text>
                                Warehouse: {product.warehouse}
                                <br />
                                Stock: {stock} units
                                <br />
                                {qty} x A${unitPrice.toFixed(2)} = A${total.toFixed(2)}
                              </Card.Text>
                              <Button
                                variant="danger"
                                onClick={() => handleRemoveProduct(product._id)}
                                size="sm"
                              >
                                Remove
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </div>
          </div>
        </Col>

        {/* Right Side */}
        <Col md={4} className="p-4 border rounded bg-light">
          <Row className="mb-3">
            <Col>
              <Form.Label>Tax</Form.Label>
              <div className="d-flex">
                <Form.Select value={selectedTax?._id || ""} onChange={handleTaxSelect}>
                  {taxes.map((tax) => (
                    <option key={tax._id} value={tax._id}>
                      {tax.taxClass} - {tax.taxValue}%
                    </option>
                  ))}
                </Form.Select>
                <Button
                  variant="success"
                  className="ms-2"
                  onClick={() => setShowAddTaxModal(true)}
                >
                  ➕
                </Button>
              </div>
            </Col>
            <Col>
              <Form.Label>Payment Status</Form.Label>
              <Form.Select value={paymentStatus} onChange={handlePaymentStatusChange}>
                <option value="0">Due Payment</option>
                <option value="1">Partial Payment</option>
                <option value="2">Paid</option>
                <option value="3">Cash</option>
              </Form.Select>
            </Col>
          </Row>

          {paymentStatus === "1" && (
            <Row className="mb-3">
              <Col>
                <Form.Label>Amount Paid</Form.Label>
                <Form.Control
                  type="number"
                  value={amountPaid}
                  onChange={handleAmountPaidChange}
                  min={0}
                  max={calculateTotal()}
                />
              </Col>
            </Row>
          )}

          {paymentStatus === "3" && (
            <Row className="mb-3">
              <Col>
                <Button
                  className="w-100"
                  onClick={handleCashPayment}
                  style={{
                    backgroundColor: "#27b2b6",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontSize: "13px",
                  }}
                >
                  Enter Cash Amount 💵
                </Button>
              </Col>
            </Row>
          )}

          <div className="border p-3 rounded bg-white">
            <div className="d-flex justify-content-between mb-3">
              <strong>Subtotal:</strong>
              <span>A${calculateSubTotal()}</span>
            </div>
            <div className="d-flex mb-2 border-bottom pb-2">
              <strong>GST:</strong>
              <input
                type="text"
                value={`${selectedTax?.taxValue || 0}%`}
                readOnly
                className="form-control-plaintext ms-auto text-end"
              />
            </div>
            {(paymentStatus === "1" || (paymentStatus === "3" && amountPaid > 0)) && (
              <>
                <div className="d-flex justify-content-between mb-2">
                  <strong>Amount Paid:</strong>
                  <span>A${amountPaid.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                  <strong>Amount Due:</strong>
                  <span>A${amountDue.toFixed(2)}</span>
                </div>
              </>
            )}
            {paymentStatus === "3" && amountPaid > calculateTotal() && (
              <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                <strong>Change:</strong>
                <span>A${(amountPaid - calculateTotal()).toFixed(2)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
              <h5>Total:</h5>
              <h5>A${calculateTotal()}</h5>
            </div>
          </div>
        </Col>

        {/* Buttons */}
        <div className="mt-3 d-flex gap-2 flex-column flex-sm-row-reverse">
          <Button variant="primary" onClick={handleCreateInvoice} disabled={selectedProducts.length === 0}>
            Generate Invoice 🗋️
          </Button>
          <Button variant="danger" onClick={handleClear} disabled={selectedProducts.length === 0}>
            Clear Selection ❌
          </Button>
          <Button
            variant="info"
            onClick={() => setShowOrdersModal(true)}
            disabled={selectedProducts.length === 0}
          >
            View Order
          </Button>
        </div>ritm      

      </Row>

      {/* NEW: Orders Modal */}
<Modal show={showOrdersModal} onHide={() => setShowOrdersModal(false)} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Orders</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Tabs */}
    <div className="d-flex gap-2 mb-3">
      <Button
        variant={activeTab === "onhold" ? "warning" : "light"}
        onClick={() => setActiveTab("onhold")}
      >
        Onhold
      </Button>
      <Button
        variant={activeTab === "unpaid" ? "warning" : "light"}
        onClick={() => setActiveTab("unpaid")}
      >
        Unpaid
      </Button>
      <Button
        variant={activeTab === "paid" ? "warning" : "light"}
        onClick={() => setActiveTab("paid")}
      >
        Paid
      </Button>
    </div>

    {/* Search Bar */}
    <Form.Group className="mb-3">
      <Form.Control
        type="text"
        placeholder="Search Product"
        value=""
        onChange={() => {}}
      />
    </Form.Group>

    {/* Orders List */}
    {filteredOrders.map((order) => (
      <Card key={order.id} className="mb-3 p-3 border">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge bg-dark">{order.id}</span>
          <small className="text-muted">{order.date}</small>
        </div>
        <div className="row">
          <div className="col-md-6">
            <p><strong>Product Name:</strong> {order.productName}</p>
            <p><strong>Total:</strong> A${order.total}</p>
          </div>
          <div className="col-md-6">
            <p><strong>WAREHOUSE:</strong> {order.Warehouse}</p>
          </div>
        </div>
        {order.notes && (
          <Alert variant="info" className="mt-2">
            {order.notes}
          </Alert>
        )}
        <div className="d-flex gap-2 mt-3">
          <Button variant="danger">Open Order</Button>
          <Button variant="success">View Products</Button>
          <Button variant="primary">Print</Button>
        </div>
      </Card>
    ))}
  </Modal.Body>
</Modal>

      {/* Modals */}
      <Modal show={isModalVisible} onHide={handleCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Product Quantity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>{currentProduct?.name}</h5>
          <p>Warehouse: {currentProduct?.warehouse}</p>
          <p>Available Stock: {warehouseStock[currentProduct?._id] || 0} units</p>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={warehouseStock[currentProduct?._id] || 1}
              value={quantity[currentProduct?._id] || 1}
              onChange={(e) =>
                handleQuantityChange(currentProduct._id, parseInt(e.target.value))
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Price per unit (A$)</Form.Label>
            <Form.Control type="number" value={price} onChange={handlePriceChange} />
          </Form.Group>
          <p className="mt-3">
            <strong>Total Price:</strong> A$
            {isNaN(price * (quantity[currentProduct?._id] || 1))
              ? "0.00"
              : (price * (quantity[currentProduct?._id] || 1)).toFixed(2)}
          </p>
          {quantityError && <Alert variant="danger" className="mt-2">{quantityError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleOk}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddTaxModal} onHide={() => setShowAddTaxModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Tax</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleTaxFormSubmit}>
            <Form.Group>
              <Form.Label>Tax Class</Form.Label>
              <Form.Control
                type="text"
                value={newTaxClass}
                onChange={(e) => setNewTaxClass(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Tax Value (%)</Form.Label>
              <Form.Control
                type="number"
                value={newTaxValue}
                onChange={(e) => setNewTaxValue(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={() => setShowAddTaxModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="ms-2" variant="primary">
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showCashPaymentModal}
        onHide={() => setShowCashPaymentModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cash Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Cash payment form */}
          <Form.Group className="mb-3">
            <Form.Label>Total Amount Due</Form.Label>
            <Form.Control type="text" value={`A$${calculateTotal()}`} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cash Amount Received</Form.Label>
            <Form.Control
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
              min={0}
              step="0.01"
            />
          </Form.Group>
          {cashAmount > 0 && (
            <div className="border p-2 rounded bg-light">
              <div className="d-flex justify-content-between">
                <strong>Amount Paid:</strong>
                <span>A${cashAmount.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong>Amount Due:</strong>
                <span>A${(calculateTotal() - cashAmount).toFixed(2)}</span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCashPaymentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={processCashPayment}>
            Process Payment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ PAYMENT COMPLETED MODAL */}
      <Modal
        show={showPaymentCompletedModal}
        onHide={() => { }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Payment Completed</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div
            className="d-flex justify-content-center align-items-center mx-auto mb-3"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#27b2b6",
              color: "white",
              fontSize: "32px",
              fontWeight: "bold",
              lineHeight: "1",
              textAlign: "center",
            }}
          >
            ✓
          </div>
          <h4>Payment Completed</h4>
          <p className="mt-2">Do you want to Print Receipt for the Completed Order?</p>
          <div className="d-flex justify-content-center gap-2 mt-4">
            <Button variant="dark" onClick={handlePrintReceipt}>
              Print Receipt
            </Button>

          </div>
        </Modal.Body>
      </Modal>

      {/* Add Product Modal */}
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
      />
    </Container>
  );
};

export default PointOfSale;