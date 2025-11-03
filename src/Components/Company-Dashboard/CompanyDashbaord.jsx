import React from "react";
import "./CompanyDashboard.css";
import {
  Card,
  Row,
  Col,
  Table,
  Dropdown,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaUser,
  FaUserCheck,
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { BsBagDashFill } from "react-icons/bs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CompanyDashboard = () => {
  const summaryCards = [
    {
      label: "Total Purchase Due",
      amount: "$307,144",
      icon: <BsBagDashFill size={30} className="text-warning" />,
      color: "#fff3cd",
    },
    {
      label: "Total Sales Due",
      amount: "$4,385",
      icon: <FaFileInvoiceDollar size={30} className="text-success" />,
      color: "#d4edda",
    },
    {
      label: "Total Sale Amount",
      amount: "$385,656.50",
      icon: <FaFileInvoice size={30} className="text-info" />,
      color: "#cce5ff",
    },
    {
      label: "Total Expense",
      amount: "$40,000",
      icon: <FaFileInvoiceDollar size={30} className="text-danger" />,
      color: "#f8d7da",
    },
  ];

  const stats = [
    {
      label: "Customers",
      count: 100,
      bg: "#FFE8CC",
      icon: <FaUser size={28} className="text-warning" />,
    },
    {
      label: "Vendors",
      count: 110,
      bg: "#D0EBFF",
      icon: <FaUserCheck size={28} className="text-info" />,
    },
    {
      label: "Purchase Invoice",
      count: 150,
      bg: "#E3D7FF",
      icon: <FaFileInvoice size={28} className="text-primary" />,
    },
    {
      label: "Sales Invoice",
      count: 170,
      bg: "#D8F5E8",
      icon: <FaFileInvoiceDollar size={28} className="text-success" />,
    },
  ];

  const data = [
    { name: "Jan", Sales: 120, Purchase: 100 },
    { name: "Feb", Sales: 200, Purchase: 150 },
    { name: "Mar", Sales: 300, Purchase: 180 },
    { name: "Apr", Sales: 290, Purchase: 100 },
    { name: "May", Sales: 140, Purchase: 40 },
    { name: "Jun", Sales: 60, Purchase: 30 },
    { name: "Jul", Sales: 200, Purchase: 90 },
    { name: "Aug", Sales: 250, Purchase: 110 },
    { name: "Sep", Sales: 100, Purchase: 70 },
  ];
  const topSellingProducts = [
    {
      name: "Charger Cable - Lighting",
      price: 187,
      sales: 247,
      discount: 25,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4_5IpI5pRHZpEUSH7TilVd4mGqtE-bWL12A&s",
    },
    {
      name: "Yves Saint Eau De Parfum",
      price: 145,
      sales: 289,
      discount: 25,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUYE4fdTzt_ZVPUrauJvDD9RGHBvmv7wjrBA&s",
    },
    {
      name: "Apple Airpods 2",
      price: 458,
      sales: 300,
      discount: 25,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIyk_Q6LFLf0OJ6h758-INCkEXt4zMp7Ga_Q&s",
    },
    {
      name: "Vacuum Cleaner",
      price: 139,
      sales: 225,
      discount: -21,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbeTXS6QZgjDZwvKOwW2ifVMcscXVJ94XSDw&s",
    },
    {
      name: "Samsung Galaxy S21 Fe 5g",
      price: 998,
      sales: 365,
      discount: 25,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG39Tg6JZvhzuv03tIgYNCsNtOZk2mufog7w&s",
    },
  ];

  const lowStockProducts = [
    {
      name: "Dell XPS 13",
      id: "665814",
      stock: 8,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpfwIw5X5zhtRPmZTVy_kDGUcwKQUgVT0Syw&s",
    },
    {
      name: "Vacuum Cleaner Robot",
      id: "940004",
      stock: 14,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzGHjDzedLCagUPIUT0kCv86XGd2wcnNCKfg&s",
    },
    {
      name: "KitchenAid Stand Mixer",
      id: "325569",
      stock: 21,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqHxRfpWf5a3y51forDe5wH2nbArrPzkoRDA&s",
    },
    {
      name: "Levi's Trucker Jacket",
      id: "124588",
      stock: 12,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6_Sm3AQ2fTPrsx8ATzAaWDymygTfVEijidw&s",
    },
    {
      name: "Lay's Classic",
      id: "365586",
      stock: 10,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQO1kMJqAKNbyCMw-yz_7f9EG39m3XheIo3Jg&s",
    },
  ];

  const recentSales = [
    {
      name: "Apple Watch Series 9",
      category: "Electronics",
      price: 640,
      date: "Today",
      status: "Processing",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHNFYVnXfff7xMrGV0cjkuP-pLqzm8ou6csA&s",
    },
    {
      name: "Gold Bracelet",
      category: "Fashion",
      price: 126,
      date: "Today",
      status: "Cancelled",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr4hTaNG9xUTL9Qus6pMlbw2r47YMmW0CD5w&s",
    },
    {
      name: "Parachute Down Duvet",
      category: "Health",
      price: 69,
      date: "15 Jan 2025",
      status: "On hold",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvolhf9Sr5OiHasgsxVRFEcIagQd-S8YH-rg&s",
    },
    {
      name: "YETI Rambler Tumbler",
      category: "Sports",
      price: 65,
      date: "12 Jan 2025",
      status: "Processing",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCj7fzmEn0PpUj7YxVU_iLgNXu73aeMA5fGw&s",
    },
    {
      name: "Osmo Genius Starter Kit",
      category: "Lifestyles",
      price: 87.56,
      date: "11 Jan 2025",
      status: "Completed",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGH6AbJ-JoL0gTbHniUCKqlAkMhOa27XJ3LA&s",
    },
  ];

  const salesData = [
    { month: "Jan", revenue: 8000, expense: -5000 },
    { month: "Feb", revenue: 25000, expense: -12000 },
    { month: "Mar", revenue: 24000, expense: -8000 },
    { month: "Apr", revenue: 20000, expense: -10000 },
    { month: "May", revenue: 21000, expense: -11000 },
    { month: "Jun", revenue: 18000, expense: -9000 },
    { month: "Jul", revenue: 25000, expense: -13000 },
    { month: "Aug", revenue: 16000, expense: -10000 },
    { month: "Sep", revenue: 20000, expense: -8000 },
    { month: "Oct", revenue: 12000, expense: -7000 },
    { month: "Nov", revenue: 8000, expense: -6000 },
    { month: "Dec", revenue: 20000, expense: -12000 },
  ];  
  
  const topCustomers = [
    {
      name: "Carlos Curran",
      country: "USA",
      orders: 24,
      totalSpent: "$8,9645",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyYf3ArTo30OMbVD8TISYQu8KyhyrrVtc96Q&s",
    },
    {
      name: "Stan Gaunter",
      country: "UAE",
      orders: 22,
      totalSpent: "$16,985",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHBSSUdzVeTX9Nn4LPDEx5cjWcaz7skhfz6Q&s",
    },
    {
      name: "Richard Wilson",
      country: "Germany",
      orders: 14,
      totalSpent: "$5,366",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRR6_B6-YuFCMs0YxnLue5y96ifvbi5F7W-Q&s",
    },
    {
      name: "Mary Bronson",
      country: "Belgium",
      orders: 8,
      totalSpent: "$4,569",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQykW-qbmRVfDz_1e4_UT0QVa--mjwXJhxKkQ&s",
    },
    {
      name: "Annie Tremblay",
      country: "Greenland",
      orders: 14,
      totalSpent: "$3,5698",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJUGhUCD4DpqXxKN0sJaesjmONwaNH57hG1Q&s",
    },
  ];

  const getBadgeClass = (status) => {
    switch (status) {
      case "Processing":
        return "bg-purple";
      case "Cancelled":
        return "bg-red";
      case "On hold":
        return "bg-blue";
      case "Completed":
        return "bg-green";
      default:
        return "bg-gray";
    }
  };
  return (
    <div className="container-fluid mt-3 mt-sm-3">
      {/* Company Name at Top */}
      <div className="mb-4">
        <h3 className="semi-bold text-left" style={{ color: "#53b2a5" }}>
          ZirakBook Company
        </h3>
      </div>

      {/* Summary Cards */}
      <Row className="g-4">
        {summaryCards.map((card, i) => (
          <Col md={3} key={i}>
            <Card
              className="shadow-sm border-0 rounded-3"
              style={{ backgroundColor: card.color }}
            >
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="fw-semibold mb-1 text-dark">{card.amount}</h5>
                  <div className="text-muted small">{card.label}</div>
                </div>
                <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm">
                  {card.icon}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Stats Cards */}
      <Row className="my-4 g-4">
        {stats.map((stat, i) => (
          <Col md={3} key={i}>
            <Card
              className="shadow-sm border-0 p-3 rounded-3 text-black"
              style={{ backgroundColor: stat.bg }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="fw-bold mb-0">{stat.count}</h4>
                  <div className="small">{stat.label}</div>
                </div>
                <div className="fs-3">{stat.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Chart Section - Now Full Width */}
      <Row className="g-4 align-items-stretch">
        <Col md={12}>
          <Card className="h-100 border-0 shadow-sm rounded-4 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <h6 className="fw-semibold mb-0" style={{ color: "#1a237e" }}>
                📊 Sales & Purchase Report
              </h6>
              <Dropdown>
                <Dropdown.Toggle
                  variant="light"
                  className="border rounded-3 shadow-sm"
                  size="sm"
                >
                  2025
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>2024</Dropdown.Item>
                  <Dropdown.Item>2025</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <RechartTooltip />
                <Legend />
                <Bar dataKey="Sales" fill="#1a237e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Purchase" fill="#53b2a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mt-3">
        {/* Top Selling Products */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="bg-pink-100 text-pink-600 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 13H7v-2h2v2zm0-4H7V7h2v2zm0-4H7V3h2v2z" />
                  </svg>
                </span>
                <Card.Title className="mb-0 fw-semibold">
                  Top Selling Products
                </Card.Title>
              </div>
              <Dropdown size="sm" className="me-2">
                <Dropdown.Toggle
                  variant="light"
                  className="border rounded-3 shadow-sm"
                >
                  Today
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Today</Dropdown.Item>
                  <Dropdown.Item>This Week</Dropdown.Item>
                  <Dropdown.Item>This Month</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body className="p-0">
              {topSellingProducts.map((product, i) => (
                <div key={i} className="p-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="rounded-2"
                      width="50"
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{product.name}</h6>
                      <small className="text-muted">
                        ${product.price} • {product.sales}+ Sales
                      </small>
                    </div>
                    <span
                      className={`badge ${
                        product.discount > 0 ? "bg-success" : "bg-danger"
                      } text-dark`}
                    >
                      {product.discount > 0
                        ? `↑ ${product.discount}%`
                        : `↓ ${product.discount}%`}
                    </span>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Low Stock Products */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="bg-orange-100 text-orange-600 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8.943 1.557a1 1 0 0 0-1.342 0L4.5 4.5 3.75 3.75a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l2.5-2.5a1 1 0 0 0 0-1.414z" />
                    <path d="M8 5a.5.5 0 0 1 .5-.5H10v2H8.5A.5.5 0 0 1 8 5zM8 7a.5.5 0 0 1 .5-.5H10v2H8.5A.5.5 0 0 1 8 7zm-2 2a.5.5 0 0 1 .5-.5h2v2h-2.5A.5.5 0 0 1 6 9z" />
                  </svg>
                </span>
                <Card.Title className="mb-0 fw-semibold">
                  Low Stock Products
                </Card.Title>
              </div>
              <Button
                variant="link"
                className="p-0 m-0 text-decoration-none text-primary"
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {lowStockProducts.map((product, i) => (
                <div key={i} className="p-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="rounded-2"
                      width="50"
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{product.name}</h6>
                      <small className="text-muted">ID: #{product.id}</small>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">Instock</div>
                      <div className="fw-bold text-danger">{product.stock}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Sales */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="bg-pink-100 text-pink-600 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 13H7v-2h2v2zm0-4H7V7h2v2zm0-4H7V3h2v2z" />
                  </svg>
                </span>
                <Card.Title className="mb-0 fw-semibold">
                  Recent Sales
                </Card.Title>
              </div>
              <Dropdown size="sm" className="me-2">
                <Dropdown.Toggle
                  variant="light"
                  className="border rounded-3 shadow-sm"
                >
                  Weekly
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Today</Dropdown.Item>
                  <Dropdown.Item>Weekly</Dropdown.Item>
                  <Dropdown.Item>Monthly</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body className="p-0">
              {recentSales.map((sale, i) => (
                <div key={i} className="p-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={sale.image}
                      alt={sale.name}
                      className="rounded-2"
                      width="50"
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{sale.name}</h6>
                      <small className="text-muted">
                        {sale.category} • ${sale.price}
                      </small>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">{sale.date}</div>
                      <span
                        className={`badge ${getBadgeClass(
                          sale.status
                        )} text-white`}
                      >
                        {sale.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Statics Card */}
      <Row className="g-4 mt-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="bg-red-100 text-red-600 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 13H7v-2h2v2zm0-4H7V7h2v2zm0-4H7V3h2v2z" />
                  </svg>
                </span>
                <Card.Title className="mb-0 fw-semibold">
                  Sales Statics
                </Card.Title>
              </div>
              <Dropdown size="sm" className="me-2">
                <Dropdown.Toggle
                  variant="light"
                  className="border rounded-3 shadow-sm"
                >
                  2025
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>2024</Dropdown.Item>
                  <Dropdown.Item>2025</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Revenue & Expense Stats */}
              <div className="d-flex gap-2 p-3 bg-light rounded-2 mb-3">
                <div className="flex-grow-1 text-center">
                  <div className="fw-bold">$12,189</div>
                  <small className="text-muted">Revenue</small>
                  <span className="badge bg-success ms-1">↑ 25%</span>
                </div>
                <div className="flex-grow-1 text-center">
                  <div className="fw-bold">$48,988,078</div>
                  <small className="text-muted">Expense</small>
                  <span className="badge bg-danger ms-1">↓ 25%</span>
                </div>
              </div>

              {/* Bar Chart for Revenue vs Expense */}
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salesData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartTooltip />
                  <Bar dataKey="revenue" fill="#D0EBFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#E3D7FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Customers */}
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="bg-pink-100 text-pink-600 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 13H7v-2h2v2zm0-4H7V7h2v2zm0-4H7V3h2v2z" />
                  </svg>
                </span>
                <Card.Title className="mb-0 fw-semibold">
                  Top Customers
                </Card.Title>
              </div>
              <Button
                variant="link"
                className="p-0 m-0 text-decoration-none text-primary"
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {topCustomers.map((customer, i) => (
                <div key={i} className="p-3 border-bottom">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={customer.image}
                        alt={customer.name}
                        className="rounded-circle"
                        width="40"
                      />
                      <div>
                        <h6 className="mb-0">{customer.name}</h6>
                        <small className="text-muted">
                          <span className="bi bi-globe"></span>{" "}
                          {customer.country} • {customer.orders} Orders
                        </small>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">${customer.totalSpent}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CompanyDashboard;
