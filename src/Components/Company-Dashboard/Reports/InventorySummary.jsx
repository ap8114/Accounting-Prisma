import React, { useState } from "react";
import {
  Table,
  Form,
  Badge,
  Container,
  Row,
  Col,
  InputGroup,
  Button,
  Modal,
  Card,
  ListGroup,
} from "react-bootstrap";
import * as XLSX from "xlsx";

const InventorySummary = () => {
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  // New state for date filters
  const [purchaseDateFilter, setPurchaseDateFilter] = useState({ start: "", end: "" });
  const [salesDateFilter, setSalesDateFilter] = useState({ start: "", end: "" });

  // Enhanced inventory data with multiple warehouses
  const inventoryData = [
    {
      id: 1,
      name: "Product A",
      sku: "PROD-A",
      description: "Premium quality electronic component",
      category: "Electronics",
      brand: "TechBrand",
      unit: "Pieces",
      hsnCode: "85423100",
      valuationMethod: "Average Cost",
      minStockLevel: 20,
      maxStockLevel: 200,
      supplier: "Tech Suppliers Ltd",
      warehouses: [
        {
          name: "Indore",
          opening: 100,
          inward: 50,
          outward: 80,
          closing: 70,
          price: 50,
          lastPurchaseDate: "2023-10-15",
          lastSaleDate: "2023-10-20",
          purchaseHistory: [
            { date: "2023-10-15", quantity: 30, rate: 48, amount: 1440 },
            { date: "2023-09-20", quantity: 20, rate: 50, amount: 1000 },
          ],
          salesHistory: [
            { date: "2023-10-20", quantity: 25, rate: 65, amount: 1625 },
            { date: "2023-10-18", quantity: 30, rate: 65, amount: 1950 },
            { date: "2023-10-15", quantity: 25, rate: 65, amount: 1625 },
          ],
        },
        {
          name: "Delhi",
          opening: 80,
          inward: 40,
          outward: 60,
          closing: 60,
          price: 52,
          lastPurchaseDate: "2023-10-10",
          lastSaleDate: "2023-10-18",
          purchaseHistory: [
            { date: "2023-10-10", quantity: 40, rate: 50, amount: 2000 },
          ],
          salesHistory: [
            { date: "2023-10-18", quantity: 30, rate: 68, amount: 2040 },
            { date: "2023-10-15", quantity: 30, rate: 68, amount: 2040 },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Product B",
      sku: "PROD-B",
      description: "Office furniture item",
      category: "Furniture",
      brand: "ComfortZone",
      unit: "Pieces",
      hsnCode: "94016100",
      valuationMethod: "FIFO",
      minStockLevel: 15,
      maxStockLevel: 150,
      supplier: "Furniture World",
      warehouses: [
        {
          name: "Delhi",
          opening: 20,
          inward: 100,
          outward: 60,
          closing: 60,
          price: 30,
          lastPurchaseDate: "2023-10-10",
          lastSaleDate: "2023-10-22",
          purchaseHistory: [
            { date: "2023-10-10", quantity: 50, rate: 28, amount: 1400 },
            { date: "2023-09-25", quantity: 50, rate: 30, amount: 1500 },
          ],
          salesHistory: [
            { date: "2023-10-22", quantity: 20, rate: 45, amount: 900 },
            { date: "2023-10-18", quantity: 20, rate: 45, amount: 900 },
            { date: "2023-10-15", quantity: 20, rate: 45, amount: 900 },
          ],
        },
        {
          name: "Mumbai",
          opening: 15,
          inward: 30,
          outward: 25,
          closing: 20,
          price: 32,
          lastPurchaseDate: "2023-10-05",
          lastSaleDate: "2023-10-20",
          purchaseHistory: [
            { date: "2023-10-05", quantity: 30, rate: 30, amount: 900 },
          ],
          salesHistory: [
            { date: "2023-10-20", quantity: 15, rate: 48, amount: 720 },
            { date: "2023-10-15", quantity: 10, rate: 48, amount: 480 },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Product C",
      sku: "PROD-C",
      description: "High-end stationery item",
      category: "Stationery",
      brand: "WriteRight",
      unit: "Pieces",
      hsnCode: "96089900",
      valuationMethod: "Average Cost",
      minStockLevel: 5,
      maxStockLevel: 50,
      supplier: "Stationery Hub",
      warehouses: [
        {
          name: "Mumbai",
          opening: 10,
          inward: 5,
          outward: 12,
          closing: 3,
          price: 100,
          lastPurchaseDate: "2023-10-05",
          lastSaleDate: "2023-10-21",
          purchaseHistory: [
            { date: "2023-10-05", quantity: 5, rate: 95, amount: 475 },
          ],
          salesHistory: [
            { date: "2023-10-21", quantity: 5, rate: 130, amount: 650 },
            { date: "2023-10-18", quantity: 4, rate: 130, amount: 520 },
            { date: "2023-10-15", quantity: 3, rate: 130, amount: 390 },
          ],
        },
      ],
    },
  ];

  // ✅ Correctly flatten data without overwriting product fields
  const flattenedData = inventoryData.flatMap((product) =>
    product.warehouses.map((warehouse) => ({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category,
      brand: product.brand,
      unit: product.unit,
      hsnCode: product.hsnCode,
      valuationMethod: product.valuationMethod,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      supplier: product.supplier,
      warehouse: warehouse.name,
      opening: warehouse.opening,
      inward: warehouse.inward,
      outward: warehouse.outward,
      closing: warehouse.closing,
      price: warehouse.price,
      lastPurchaseDate: warehouse.lastPurchaseDate,
      lastSaleDate: warehouse.lastSaleDate,
      purchaseHistory: warehouse.purchaseHistory,
      salesHistory: warehouse.salesHistory,
    }))
  );

  // Filter using product name
  const filteredData = flattenedData.filter(
    (item) =>
      item.productName.toLowerCase().includes(search.toLowerCase()) &&
      (priceFilter === "" || item.price >= parseFloat(priceFilter))
  );

  const handleImport = () => {
    console.log("Import clicked");
  };

  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      Product: item.productName,
      SKU: item.sku,
      Warehouse: item.warehouse,
      Opening: item.opening,
      Inward: item.inward,
      Outward: item.outward,
      Closing: item.closing,
      Price: item.price,
      TotalValue: item.closing * item.price,
      Status: item.closing <= 5 ? "Low Stock" : "In Stock",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Summary");
    XLSX.writeFile(workbook, "Inventory_Summary.xlsx");
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = [
      {
        Product: "",
        SKU: "",
        Warehouse: "",
        Opening: "",
        Inward: "",
        Outward: "",
        Closing: "",
        Price: "",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateHeaders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Inventory_Template.xlsx");
  };

  const handleViewDetails = (flattenedItem, warehouseName) => {
    const fullProduct = inventoryData.find(p => p.id === flattenedItem.productId);
    setSelectedProduct(fullProduct);
    setSelectedWarehouse(warehouseName);
    setPurchaseDateFilter({ start: "", end: "" });
    setSalesDateFilter({ start: "", end: "" });
    setShowModal(true);
  };

  const getWarehouseStats = (warehouseName) => {
    const warehouseProducts = flattenedData.filter(item => item.warehouse === warehouseName);
    const totalProducts = warehouseProducts.length;
    const totalOpening = warehouseProducts.reduce((sum, item) => sum + item.opening, 0);
    const totalInward = warehouseProducts.reduce((sum, item) => sum + item.inward, 0);
    const totalOutward = warehouseProducts.reduce((sum, item) => sum + item.outward, 0);
    const totalClosing = warehouseProducts.reduce((sum, item) => sum + item.closing, 0);
    const totalValue = warehouseProducts.reduce((sum, item) => sum + (item.closing * item.price), 0);
    const totalSalesValue = warehouseProducts.reduce((sum, item) => sum + (item.outward * item.price), 0);

    return {
      totalProducts,
      totalOpening,
      totalInward,
      totalOutward,
      totalClosing,
      totalValue,
      totalSalesValue,
    };
  };

  // Function to filter history by date range
  const filterHistoryByDate = (history, dateFilter) => {
    if (!dateFilter.start && !dateFilter.end) return history;

    return history.filter(item => {
      const itemDate = new Date(item.date);
      const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
      const endDate = dateFilter.end ? new Date(dateFilter.end) : null;

      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      } else if (startDate) {
        return itemDate >= startDate;
      } else if (endDate) {
        return itemDate <= endDate;
      }
      return true;
    });
  };

  return (
    <Container className="mt-4">
      <Row className="align-items-center mb-3 g-2">
        <Col md={4}>
          <h4>📦 Inventory Summary</h4>
        </Col>
        <Col md={8} className="text-md-end d-flex justify-content-md-end flex-wrap">
          <Button
            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
            className="rounded-pill me-2 mb-2 text-white"
            onClick={handleImport}
          >
            Import
          </Button>
          <Button
            style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14" }}
            className="rounded-pill me-2 mb-2 text-white"
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            style={{ backgroundColor: "#ffc107", borderColor: "#ffc107" }}
            className="rounded-pill mb-2 text-dark"
            onClick={handleDownloadTemplate}
          >
            Download Template
          </Button>
        </Col>
      </Row>

      <Row className="mb-3 g-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-pill"
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="number"
              placeholder="Filter by min price..."
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="rounded-pill"
            />
          </InputGroup>
        </Col>
      </Row>

      <Table striped bordered responsive hover>
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>SKU</th>
            <th>Warehouse</th>
            <th>Opening</th>
            <th>Inward</th>
            <th>Outward</th>
            <th>Closing</th>
            <th>Price (₹)</th>
            <th>Total Value (₹)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => {
              const totalValue = item.closing * item.price;
              const status =
                item.closing <= 5 ? (
                  <Badge bg="danger">Low Stock</Badge>
                ) : (
                  <Badge bg="success">In Stock</Badge>
                );
              return (
                <tr key={`${item.productId}-${item.warehouse}`}>
                  <td>{index + 1}</td>
                  <td>{item.productName}</td>
                  <td>{item.sku}</td>
                  <td>{item.warehouse}</td>
                  <td>{item.opening}</td>
                  <td>{item.inward}</td>
                  <td>{item.outward}</td>
                  <td>{item.closing}</td>
                  <td>₹{item.price}</td>
                  <td>₹{totalValue}</td>
                  <td>{status}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewDetails(item, item.warehouse)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="12" className="text-center">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
        <small className="text-muted ms-2">
          Showing {filteredData.length} of {filteredData.length} results
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

      {/* Comprehensive Product Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>📋 Comprehensive Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && selectedWarehouse && (
            <>
              {/* Product Master Information */}
              <Card className="mb-4">
                <Card.Header as="h5">Product Master Information</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Product Name:</strong> {selectedProduct.name}</p>
                      <p><strong>SKU:</strong> {selectedProduct.sku}</p>
                      <p><strong>Description:</strong> {selectedProduct.description}</p>
                      <p><strong>Category:</strong> {selectedProduct.category}</p>
                      <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                      <p><strong>Unit:</strong> {selectedProduct.unit}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>HSN Code:</strong> {selectedProduct.hsnCode}</p>
                      <p><strong>Valuation Method:</strong> {selectedProduct.valuationMethod}</p>
                      <p><strong>Min Stock Level:</strong> {selectedProduct.minStockLevel}</p>
                      <p><strong>Max Stock Level:</strong> {selectedProduct.maxStockLevel}</p>
                      <p><strong>Supplier:</strong> {selectedProduct.supplier}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Warehouse Selection */}
              <Card className="mb-4">
                <Card.Header as="h5">Warehouse Locations</Card.Header>
                <Card.Body>
                  <ListGroup horizontal>
                    {selectedProduct.warehouses.map((warehouse, index) => (
                      <ListGroup.Item
                        key={index}
                        active={warehouse.name === selectedWarehouse}
                        action
                        onClick={() => setSelectedWarehouse(warehouse.name)}
                      >
                        {warehouse.name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>

              {/* Selected Warehouse Details */}
              {(() => {
                const warehouseData = selectedProduct.warehouses.find(
                  (w) => w.name === selectedWarehouse
                );
                if (!warehouseData) return null;

                const filteredPurchaseHistory = filterHistoryByDate(
                  warehouseData.purchaseHistory,
                  purchaseDateFilter
                );
                const filteredSalesHistory = filterHistoryByDate(
                  warehouseData.salesHistory,
                  salesDateFilter
                );

                return (
                  <>
                    {/* Stock Summary */}
                    <Card className="mb-4">
                      <Card.Header as="h5">Stock Summary - {selectedWarehouse}</Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <p><strong>Opening Stock:</strong> {warehouseData.opening} units</p>
                            <p><strong>Purchases (Inward):</strong> {warehouseData.inward} units</p>
                            <p><strong>Purchase Value:</strong> ₹{warehouseData.inward * warehouseData.price}</p>
                            <p><strong>Sales (Outward):</strong> {warehouseData.outward} units</p>
                            <p><strong>Sales Value:</strong> ₹{warehouseData.outward * warehouseData.price}</p>
                          </Col>
                          <Col md={6}>
                            <p><strong>Closing Stock:</strong> {warehouseData.closing} units</p>
                            <p><strong>Stock Value:</strong> ₹{warehouseData.closing * warehouseData.price}</p>
                            <p><strong>Last Purchase Date:</strong> {warehouseData.lastPurchaseDate}</p>
                            <p><strong>Last Sale Date:</strong> {warehouseData.lastSaleDate}</p>
                            <p><strong>Status:</strong> {warehouseData.closing <= 5 ? (
                              <Badge bg="danger">Low Stock</Badge>
                            ) : (
                              <Badge bg="success">In Stock</Badge>
                            )}</p>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    {/* Purchase History */}
                    <Card className="mb-4">
                      <Card.Header as="h5">Purchase History - {selectedWarehouse}</Card.Header>
                      <Card.Body>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Start Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={purchaseDateFilter.start}
                                onChange={(e) =>
                                  setPurchaseDateFilter({ ...purchaseDateFilter, start: e.target.value })
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>End Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={purchaseDateFilter.end}
                                onChange={(e) =>
                                  setPurchaseDateFilter({ ...purchaseDateFilter, end: e.target.value })
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Quantity</th>
                              <th>Rate (₹)</th>
                              <th>Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPurchaseHistory.length > 0 ? (
                              filteredPurchaseHistory.map((purchase, index) => (
                                <tr key={index}>
                                  <td>{purchase.date}</td>
                                  <td>{purchase.quantity}</td>
                                  <td>{purchase.rate}</td>
                                  <td>{purchase.amount}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center">
                                  No purchase records found for the selected date range.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>

                    {/* Sales History */}
                    <Card className="mb-4">
                      <Card.Header as="h5">Sales History - {selectedWarehouse}</Card.Header>
                      <Card.Body>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Start Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={salesDateFilter.start}
                                onChange={(e) =>
                                  setSalesDateFilter({ ...salesDateFilter, start: e.target.value })
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>End Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={salesDateFilter.end}
                                onChange={(e) =>
                                  setSalesDateFilter({ ...salesDateFilter, end: e.target.value })
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Quantity</th>
                              <th>Rate (₹)</th>
                              <th>Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSalesHistory.length > 0 ? (
                              filteredSalesHistory.map((sale, index) => (
                                <tr key={index}>
                                  <td>{sale.date}</td>
                                  <td>{sale.quantity}</td>
                                  <td>{sale.rate}</td>
                                  <td>{sale.amount}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center">
                                  No sales records found for the selected date range.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </>
                );
              })()}

              {/* Warehouse Overview */}
              <Card className="mb-4">
                <Card.Header as="h5">Warehouse Overview - {selectedWarehouse}</Card.Header>
                <Card.Body>
                  {(() => {
                    const stats = getWarehouseStats(selectedWarehouse);
                    return (
                      <Row>
                        <Col md={6}>
                          <p><strong>Total Products:</strong> {stats.totalProducts}</p>
                          <p><strong>Total Opening Stock:</strong> {stats.totalOpening} units</p>
                          <p><strong>Total Purchases:</strong> {stats.totalInward} units</p>
                          <p><strong>Total Purchase Value:</strong> ₹{stats.totalInward * (selectedProduct.warehouses.find(w => w.name === selectedWarehouse)?.price || 0)}</p>
                        </Col>
                        <Col md={6}>
                          <p><strong>Total Sales:</strong> {stats.totalOutward} units</p>
                          <p><strong>Total Sales Value:</strong> ₹{stats.totalSalesValue}</p>
                          <p><strong>Total Closing Stock:</strong> {stats.totalClosing} units</p>
                          <p><strong>Total Stock Value:</strong> ₹{stats.totalValue}</p>
                        </Col>
                      </Row>
                    );
                  })()}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InventorySummary;