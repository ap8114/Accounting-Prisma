import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Table, Badge, Dropdown } from "react-bootstrap";
import { FaArrowLeft, FaWarehouse, FaBoxes, FaFilter, FaTable, FaTh } from "react-icons/fa";
import AddProductModal from "../AddProductModal";

const warehouseProductsMap = {
    "1": [
        {
            category: "Electronics",
            products: [
                { name: "TV", stock: 20, unit: "Pieces" },
                { name: "Speakers", stock: 15, unit: "Pieces" },
                { name: "Camera", stock: 10, unit: "Pieces" },
            ],
        },
        {
            category: "Furniture",
            products: [
                { name: "Chair", stock: 50, unit: "Pieces" },
                { name: "Desk", stock: 30, unit: "Pieces" },
            ],
        },
    ],
    "2": [
        {
            category: "Food",
            products: [
                { name: "Rice", stock: 100, unit: "Kg" },
                { name: "Wheat", stock: 80, unit: "Kg" },
            ],
        },
        {
            category: "Beverages",
            products: [
                { name: "Soda", stock: 60, unit: "Liters" },
                { name: "Juice", stock: 40, unit: "Liters" },
            ],
        },
    ],
    "3": [
        {
            category: "Hardware",
            products: [
                { name: "Nuts & Bolts", stock: 70, unit: "Pieces" },
                { name: "Screws", stock: 90, unit: "Pieces" },
            ],
        },
        {
            category: "Tools",
            products: [
                { name: "Hammer", stock: 20, unit: "Pieces" },
                { name: "Wrench", stock: 15, unit: "Pieces" },
            ],
        },
    ],
    "4": [
        {
            category: "Stationery",
            products: [
                { name: "Pens", stock: 200, unit: "Pieces" },
                { name: "Notebooks", stock: 100, unit: "Pieces" },
            ],
        },
        {
            category: "Cleaning",
            products: [
                { name: "Mop", stock: 20, unit: "Pieces" },
                { name: "Detergent", stock: 30, unit: "Liters" },
            ],
        },
    ],
    "5": [
        {
            category: "Packaging",
            products: [
                { name: "Boxes", stock: 40, unit: "Pieces" },
                { name: "Tapes", stock: 30, unit: "Meters" },
            ],
        },
        {
            category: "Safety",
            products: [
                { name: "Gloves", stock: 20, unit: "Pairs" },
                { name: "Helmets", stock: 15, unit: "Pieces" },
            ],
        },
    ],
    "6": [
        {
            category: "Spare Parts",
            products: [
                { name: "Belts", stock: 5, unit: "Pieces" },
                { name: "Bearings", stock: 3, unit: "Pieces" },
            ],
        },
        {
            category: "Lubricants",
            products: [
                { name: "Oil", stock: 2, unit: "Liters" },
                { name: "Grease", stock: 1, unit: "Kg" },
            ],
        },
    ],
    "7": [
        {
            category: "Testing Equipment",
            products: [
                { name: "Multimeter", stock: 100, unit: "Pieces" },
                { name: "Thermometer", stock: 120, unit: "Pieces" },
            ],
        },
        {
            category: "Cables",
            products: [
                { name: "HDMI", stock: 180, unit: "Meters" },
                { name: "Ethernet", stock: 200, unit: "Meters" },
            ],
        },
    ],
    "8": [
        {
            category: "Medical Supplies",
            products: [
                { name: "Bandages", stock: 40, unit: "Pieces" },
                { name: "Disinfectant", stock: 30, unit: "Liters" },
            ],
        },
        {
            category: "Utilities",
            products: [
                { name: "Battery", stock: 20, unit: "Pieces" },
                { name: "Bulb", stock: 25, unit: "Pieces" },
            ],
        },
    ],
};

const WareHouseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [warehouse, setWarehouse] = useState(null);
    const [productData, setProductData] = useState([]);
    const [filter, setFilter] = useState("All");
    const [stockFilter, setStockFilter] = useState("All");
    const [showCategoryTable, setShowCategoryTable] = useState(false);
       
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
        itemCategory: ""
    });
    
    const [categories, setCategories] = useState([
        "Electronics",
        "Furniture",
        "Apparel",
        "Food",
        "Books",
        "Automotive",
        "Medical",
        "Software",
        "Stationery",
        "Other",
    ]);
    
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [showUOMModal, setShowUOMModal] = useState(false);
         
    useEffect(() => {
        const dummyData = [
            {
                _id: "1",
                name: "Central Warehouse",
                location: "Delhi",
                addressLine1: "Plot No. 12, Industrial Area",
                addressLine2: "Near Metro Station",
                city: "New Delhi",
                state: "Delhi",
                pincode: "110001",
                country: "India"
            },
            { _id: "2", name: "North Zone", location: "Noida" },
            { _id: "3", name: "South Depot", location: "Bangalore" },
            { _id: "4", name: "East Godown", location: "Kolkata" },
            { _id: "5", name: "West Hub", location: "Mumbai" },
            { _id: "6", name: "Spare Store", location: "Hyderabad" },
            { _id: "7", name: "Test Depot", location: "Pune" },
            { _id: "8", name: "Central Hub", location: "Lucknow" },
        ];
        const wh = dummyData.find((w) => w._id === id);
        setWarehouse(wh || null);
        setProductData(warehouseProductsMap[id] || []);
    }, [id]);
    
    const handleFilterChange = (category) => setFilter(category);
    
    const filteredProducts = productData.flatMap((cat) => {
        // Apply category filter
        if (filter !== "All" && cat.category !== filter) {
            return [];
        }
        
        return cat.products
            .filter(product => {
                // Apply stock filter
                if (stockFilter === "Low") return product.stock <= 10;
                if (stockFilter === "Medium") return product.stock > 10 && product.stock <= 30;
                if (stockFilter === "High") return product.stock > 30;
                return true; // "All" or any other case
            })
            .map((product) => ({
                category: cat.category,
                name: product.name,
                stock: product.stock,
                unit: product.unit || "Pieces"
            }));
    });
    
    const getCategoryBadgeColor = (category) => {
        const map = {
            Electronics: "primary",
            Furniture: "secondary",
            Food: "success",
            Beverages: "warning",
        };
        return map[category] || "info";
    };
        
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setNewItem({ ...newItem, image: files[0] });
        } else {
            setNewItem({ ...newItem, [name]: value });
        }
    };
    
    const [newCategory, setNewCategory] = useState("");
  
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
            itemType: 'Good',
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
            itemType: 'Service',
        }
    ]);
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
      
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
        <div className="container py-5">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
                <div className="d-flex align-items-center">
                    <Button
                        variant="outline-dark"
                        onClick={() => navigate(-1)}
                        className="d-flex align-items-center rounded-pill px-3 shadow-sm me-3"
                    >
                        <FaArrowLeft className="me-2" />
                        Back
                    </Button>
                    <h3 className="fw-bold mb-0 text-primary-emphasis d-flex">
                        <FaBoxes className="me-2 text-warning" />
                        <span className="text-gradient">Stock by Warehouse</span>
                    </h3>
                </div>
                <Button
                    onClick={() => handleAddStockModal(warehouse)}
                    style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}
                >
                    Add Stock
                </Button>
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
                    selectedWarehouse={selectedWarehouse}
                    formMode="addStock"      
                />
            </div>
            {warehouse ? (
                <>
                    <Card className="shadow-lg border-0 mb-4">
                        <Card.Body className="bg-light">
                            <h4 className="fw-bold text-primary mb-1 d-flex align-items-center">
                                <FaWarehouse className="me-2" />
                                {warehouse.name}
                            </h4>
                            <p className="mb-1 text-muted">
                                <strong>📍 Address:</strong>
                            </p>
                            <p className="mb-0 text-dark ps-4">
                                {warehouse.addressLine1}<br />
                                {warehouse.addressLine2 && (
                                    <>
                                        {warehouse.addressLine2}<br />
                                    </>
                                )}
                                {warehouse.city}, {warehouse.state} - {warehouse.pincode}<br />
                                {warehouse.country}
                            </p>
                        </Card.Body>
                    </Card>
                    <div className="row row-cols-1 row-cols-md-3 g-4 mb-4">
                        <div className="col">
                            <Card className="shadow-sm border-0">
                                <Card.Body>
                                    <h6 className="text-muted mb-1">Total Categories</h6>
                                    <h4 className="fw-bold text-primary">
                                        {productData.length}
                                    </h4>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col">
                            <Card className="shadow-sm border-0">
                                <Card.Body>
                                    <h6 className="text-muted mb-1">Total Products</h6>
                                    <h4 className="fw-bold text-success">
                                        {productData.reduce((sum, cat) => sum + cat.products.length, 0)}
                                    </h4>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col">
                            <Card className="shadow-sm border-0">
                                <Card.Body>
                                    <h6 className="text-muted mb-1">Total Stock Units</h6>
                                    <h4 className="fw-bold text-dark">
                                        {productData.reduce(
                                            (sum, cat) => sum + cat.products.reduce((s, p) => s + p.stock, 0),
                                            0
                                        )}
                                    </h4>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col">
                            <Card className="shadow-sm border-0">
                                <Card.Body>
                                    <h6 className="text-muted mb-1">Lowest Stock Product</h6>
                                    <h5 className="fw-bold text-danger">
                                        {(() => {
                                            const all = productData.flatMap((c) =>
                                                c.products.map((p) => ({ name: p.name, stock: p.stock }))
                                            );
                                            const lowest = all.reduce((min, p) => (p.stock < min.stock ? p : min), { name: "-", stock: Infinity });
                                            return `${lowest.name} (${lowest.stock})`;
                                        })()}
                                    </h5>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col">
                            <Card className="shadow-sm border-0">
                                <Card.Body>
                                    <h6 className="text-muted mb-1">Highest Stock Product</h6>
                                    <h5 className="fw-bold text-info">
                                        {(() => {
                                            const all = productData.flatMap((c) =>
                                                c.products.map((p) => ({ name: p.name, stock: p.stock }))
                                            );
                                            const highest = all.reduce((max, p) => (p.stock > max.stock ? p : max), { name: "-", stock: -1 });
                                            return `${highest.name} (${highest.stock})`;
                                        })()}
                                    </h5>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                    
                    {/* Category-wise Stock View Toggle Button */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold text-secondary">
                          
                                <Button 
                           
                            onClick={() => setShowCategoryTable(!showCategoryTable)}
                            className="d-flex align-items-center"
                            style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}
                        >
                            {showCategoryTable ? <FaTh className="me-2" /> : <FaTable className="me-2" />}
                            {showCategoryTable ? "Show Category-wise Stock" : "Show Category-wise Stock"}
                        </Button>
                        </h6>
                       
                    </div>
                    
                    {/* Category-wise Stock Table (conditionally rendered) */}
                    {showCategoryTable && (
                        <Card className="shadow border-0 mb-4">
                            <Card.Header className="bg-white border-bottom">
                                <strong>Category-wise Stock Summary</strong>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table striped hover responsive className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Category</th>
                                            <th>Total Items</th>
                                            <th>Total Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productData.map((category, index) => {
                                            const totalStock = category.products.reduce((sum, product) => sum + product.stock, 0);
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <Badge bg={getCategoryBadgeColor(category.category)}>
                                                            {category.category}
                                                        </Badge>
                                                    </td>
                                                    <td>{category.products.length}</td>
                                                    <td>{totalStock}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    )}
                    
                  
                    <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                        <h5 className="fw-bold text-secondary">
                            📁 Products by Categories
                        </h5>
                        <div className="d-flex flex-wrap w-100 gap-2">
                            <Dropdown className="flex-grow-1 flex-md-grow-0">
                                <Dropdown.Toggle variant="outline-primary" id="dropdown-category" className="d-flex align-items-center">
                                    <FaFilter className="me-2" />
                                    {filter === "All" ? "All Categories" : filter}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleFilterChange("All")}>
                                        All
                                    </Dropdown.Item>
                                    {productData.map((cat) => (
                                        <Dropdown.Item
                                            key={cat.category}
                                            onClick={() => handleFilterChange(cat.category)}
                                        >
                                            {cat.category}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown className="flex-grow-1 flex-md-grow-0" >
                                <Dropdown.Toggle variant="outline-primary" id="dropdown-stock" className="d-flex align-items-center">
                                    <FaFilter className="me-2" />
                                    {stockFilter === "All" ? "All Stock Levels" : stockFilter}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setStockFilter("All")}>
                                        All
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => setStockFilter("Low")}>
                                        Low (0-10)
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => setStockFilter("Medium")}>
                                        Medium (11-30)
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => setStockFilter("High")}>
                                        High (31+)
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                    <Card className="shadow border-0 mb-4">
                        <Card.Header className="bg-white border-bottom">
                            <div className="d-flex justify-content-between">
                                <strong>Inventory List</strong>
                                <div className="text-end">
                                    <strong>Total Stock: </strong>
                                    <Badge bg="dark" pill className="px-3 py-2">
                                        {filteredProducts.reduce((sum, item) => sum + item.stock, 0)}
                                    </Badge>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table striped hover responsive className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: "8%" }}>#</th>
                                        <th>Category</th>
                                        <th>Product</th>
                                        <th>Measurement</th>
                                        <th style={{ width: "12%" }}>Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((item, index) => (
                                            <tr key={index}>
                                                <td className="text-muted">{index + 1}</td>
                                                <td>
                                                    <Badge bg={getCategoryBadgeColor(item.category)}>
                                                        {item.category}
                                                    </Badge>
                                                </td>
                                                <td className="fw-semibold">{item.name}</td>
                                                <td className="text-secondary">{item.unit}</td>
                                                <td>
                                                    <Badge
                                                        bg={item.stock > 30 ? "success" : item.stock > 10 ? "warning" : "danger"}
                                                        className="px-3 py-2 rounded-pill"
                                                    >
                                                        {item.stock}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-4">
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </>
            ) : (
                <Card className="text-center p-5 border-0 shadow-sm bg-light">
                    <p className="text-muted">Warehouse not found.</p>
                </Card>
            )}
        </div>
    );
};

export default WareHouseDetail;