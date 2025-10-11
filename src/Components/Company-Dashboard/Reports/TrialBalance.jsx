import React, { useState, useMemo } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
  Modal,
  Pagination,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FaFilePdf, FaFileExcel, FaArrowLeft, FaSearch, FaTimes } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

const TrialBalance = () => {
  // Date range filter globally for Trial Balance & Modal
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  // Account type filter on main report (All, Asset, etc.)
  const [filterType, setFilterType] = useState("All");
  // Account name filter (search string) on main report
  const [searchAccount, setSearchAccount] = useState("");
  // Modal state & selected account
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  // Modal - transaction text filter (search by type or particulars)
  const [modalSearchText, setModalSearchText] = useState("");
  // Pagination states for transactions in modal
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Static Account Types for filter dropdown
  const types = ["All", "Asset", "Liability", "Expense", "Income", "Equity"];
  // Sample Data: Accounts with transactions
  const trialEntries = [
    {
      code: "101",
      name: "Cash in Hand",
      type: "Asset",
      opening: 20000,
      debit: 30000,
      credit: 0,
      transactions: [
        {
          date: "2025-08-01",
          type: "Opening Balance",
          particulars: "",
          debit: 20000,
          credit: 0,
        },
        {
          date: "2025-08-03",
          type: "Cash Sale",
          particulars: "Sales",
          debit: 30000,
          credit: 0,
        },
        {
          date: "2025-08-07",
          type: "Payment",
          particulars: "Supplier X",
          debit: 0,
          credit: 5000,
        },
        {
          date: "2025-08-09",
          type: "Receipt",
          particulars: "Customer Y",
          debit: 15000,
          credit: 0,
        },
        {
          date: "2025-08-12",
          type: "Payment",
          particulars: "Expenses",
          debit: 0,
          credit: 2000,
        },
        {
          date: "2025-08-15",
          type: "Cash Sale",
          particulars: "Sales Z",
          debit: 10000,
          credit: 0,
        },
        {
          date: "2025-08-20",
          type: "Payment",
          particulars: "Supplier A",
          debit: 0,
          credit: 8000,
        },
      ],
    },
    {
      code: "201",
      name: "Sales",
      type: "Income",
      opening: 0,
      debit: 0,
      credit: 50000,
      transactions: [
        {
          date: "2025-08-02",
          type: "Sales Invoice",
          particulars: "Customer A",
          debit: 0,
          credit: 20000,
        },
        {
          date: "2025-08-10",
          type: "Sales Invoice",
          particulars: "Customer B",
          debit: 0,
          credit: 30000,
        },
      ],
    },
    {
      code: "301",
      name: "Purchase",
      type: "Expense",
      opening: 10000,
      debit: 40000,
      credit: 0,
      transactions: [
        {
          date: "2025-08-05",
          type: "Purchase Invoice",
          particulars: "Supplier A",
          debit: 40000,
          credit: 0,
        },
      ],
    },
    {
      code: "401",
      name: "Capital",
      type: "Equity",
      opening: 30000,
      debit: 0,
      credit: 0,
      transactions: [
        {
          date: "2025-08-01",
          type: "Capital Injection",
          particulars: "",
          debit: 0,
          credit: 30000,
        },
      ],
    },
  ];
  // Calculate closing balance
  const calculateClosing = (entry) => {
    return entry.opening + entry.debit - entry.credit;
  };
  // Filter accounts based on selected type and search string
  const filteredRows = trialEntries.filter((entry) => {
    const matchesType = filterType === "All" || entry.type === filterType;
    const matchesSearch =
      entry.name.toLowerCase().includes(searchAccount.toLowerCase()) ||
      entry.code.toLowerCase().includes(searchAccount.toLowerCase());
    return matchesType && matchesSearch;
  });
  // When an account name is clicked, open modal and reset pagination & modal filters
  const openDetails = (account) => {
    setSelectedAccount(account);
    setShowModal(true);
    setCurrentPage(1);
    setModalSearchText("");
  };
  // Filter transactions by modal search text and date range
  const filteredTransactions = useMemo(() => {
    if (!selectedAccount) return [];
    return selectedAccount.transactions.filter((t) => {
      const txDate = new Date(t.date);
      const matchesDateRange =
        !startDate || !endDate || (txDate >= startDate && txDate <= endDate);
      const searchText = modalSearchText.toLowerCase();
      const matchesText =
        !searchText ||
        t.type.toLowerCase().includes(searchText) ||
        t.particulars.toLowerCase().includes(searchText);
      return matchesDateRange && matchesText;
    });
  }, [selectedAccount, startDate, endDate, modalSearchText]);
  // Pagination calculations for modal transactions
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  // Pagination change handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // Render pagination items with ellipses for large page counts
  const renderPaginationItems = () => {
    let items = [];
    // For very large page counts, add smart ellipsis handling
    if (totalPages <= 7) {
      // Show all pages
      for (let number = 1; number <= totalPages; number++) {
        items.push(
          <Pagination.Item
            key={number}
            active={number === currentPage}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </Pagination.Item>
        );
      }
    } else {
      // Show first, last, current, neighbors, ellipsis
      const pageNumbers = [];
      pageNumbers.push(1);
      if (currentPage > 4) {
        pageNumbers.push("start-ellipsis");
      }
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (currentPage < totalPages - 3) {
        pageNumbers.push("end-ellipsis");
      }
      pageNumbers.push(totalPages);
      pageNumbers.forEach((number, index) => {
        if (number === "start-ellipsis" || number === "end-ellipsis") {
          items.push(
            <Pagination.Ellipsis key={number + index} disabled />
          );
        } else {
          items.push(
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </Pagination.Item>
          );
        }
      });
    }
    return items;
  };
  // Close modal and reset filters
  const closeModal = () => {
    setShowModal(false);
    setSelectedAccount(null);
    setModalSearchText("");
    setCurrentPage(1);
  };
  return (
    <div className="p-4 mt-4">
      <h4 className="fw-bold">Trial Balance Report</h4>
      <p className="text-muted mb-4">
        Auto-generated accounting summary by account head.
      </p>
      {/* Filter UI */}
      <Card className="p-4 mb-4 border-0 rounded-4 shadow-sm">
        <Form>
          <Row className="gy-3 gx-4 align-items-end">
      
            
            <Col md={3}>
              <Form.Group controlId="accountType">
                <Form.Label className="fw-semibold mb-2">Account Type</Form.Label>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-pill"
                >
                  {types.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="searchAccount">
                <Form.Label className="fw-semibold mb-2">Search Account</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    placeholder="Search by Account Name or Code"
                    value={searchAccount}
                    onChange={(e) => setSearchAccount(e.target.value)}
                    className="rounded-pill pe-5"
                  />
                  {searchAccount ? (
                    <Button
                      variant="link"
                      className="position-absolute end-0 top-50 translate-middle-y text-muted"
                      onClick={() => setSearchAccount("")}
                    >
                      <FaTimes />
                    </Button>
                  ) : (
                    <FaSearch className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" />
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col
              md={2}
              className="d-flex justify-content-md-end justify-content-start align-items-center"
            >
              <Button
                style={{
                  backgroundColor: "#27b2b6",
                  borderColor: "#27b2b6",
                  color: "white",
                  padding: "10px 2px",
                  fontWeight: "400",
                  borderRadius: "50px",
                }}
                className="w-100 w-md-auto"
                onClick={() => {
                  /* You can trigger any report generation here */
                }}
              >
                Generate Report
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
      {/* Trial Balance Table */}
      <Card className="shadow-sm rounded-4 p-4 border-0">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h5 className="fw-bold mb-2 mb-md-0">Account Summary</h5>
          <div className="d-flex align-items-center gap-2 flex-wrap">
  <Button variant="outline-danger" size="sm" className="d-flex align-items-center">
    <FaFilePdf style={{ fontSize: '1rem', marginRight: '0.5rem' }} />
    PDF
  </Button>
  <Button variant="outline-success" size="sm" className="d-flex align-items-center">
    <FaFileExcel style={{ fontSize: '1rem', marginRight: '0.5rem' }} />
    Excel
  </Button>
</div>

        </div>
        <Table responsive className="text-nowrap mb-0 align-middle">
          <thead className="bg-light text-dark fw-semibold">
            <tr>
              <th>Account Code</th>
              <th>Account Name</th>
              <th>Type</th>
              <th>Opening Balance</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Closing Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.code}</td>
                  <td>
                    <Button 
                      variant="link" 
                      onClick={() => openDetails(row)}
                      className="p-0 text-start "
                    >
                      {row.name}
                    </Button>
                  </td>
                  <td>
                    <span className={`badge bg-${
                      row.type === "Asset" ? "primary" : 
                      row.type === "Liability" ? "info" : 
                      row.type === "Expense" ? "danger" : 
                      row.type === "Income" ? "success" : "warning"
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td>₹{row.opening.toLocaleString()}</td>
                  <td>₹{row.debit.toLocaleString()}</td>
                  <td>₹{row.credit.toLocaleString()}</td>
                  <td>₹{calculateClosing(row).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  No accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
      {/* Modal for Ledger Details */}
      <Modal
        show={showModal}
        onHide={closeModal}
        size="xl"
        centered
        scrollable
        dialogClassName="custom-modal-width"
      >
        <Modal.Header className="py-3">
          <Button 
            variant="light" 
            className="d-flex align-items-center p-0 me-3"
            onClick={closeModal}
          >
            <FaArrowLeft className="me-2" /> Back
          </Button>
          <Modal.Title className="flex-grow-1 text-center">
            Ledger Details: {selectedAccount ? selectedAccount.name : ""}
          </Modal.Title>
          <Button 
            variant="light" 
            className="p-0"
            onClick={closeModal}
          >
            <FaTimes size={20} />
          </Button>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-3">
              <Row className="gx-3 align-items-end">
                <Col md={6}>
                  <Form.Group controlId="modalDateRange">
                    <Form.Label className="fw-semibold mb-2">Filter by Date Range</Form.Label>
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => setDateRange(update)}
                      isClearable
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select date range"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="modalSearchText">
                    <Form.Label className="fw-semibold mb-2">Search by Type / Particulars</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Type or Particulars..."
                        value={modalSearchText}
                        onChange={(e) => {
                          setModalSearchText(e.target.value);
                          setCurrentPage(1); // Reset page when filter changes
                        }}
                        className="pe-5"
                      />
                      {modalSearchText ? (
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y text-muted"
                          onClick={() => setModalSearchText("")}
                        >
                          <FaTimes />
                        </Button>
                      ) : (
                        <FaSearch className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" />
                      )}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h5 className="mb-0 fw-bold">Transactions</h5>
                <span className="badge bg-primary">
                  {filteredTransactions.length} records found
                </span>
              </div>
              <Table responsive className="text-nowrap align-middle mb-0">
                <thead className="bg-light fw-semibold">
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Particulars</th>
                    <th>Debit (₹)</th>
                    <th>Credit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.length > 0 ? (
                    currentTransactions.map((tx, i) => (
                      <tr key={i}>
                        <td>{new Date(tx.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge bg-${
                            tx.type === "Opening Balance" ? "secondary" :
                            tx.type.includes("Sale") || tx.type.includes("Receipt") ? "success" :
                            tx.type.includes("Payment") || tx.type.includes("Purchase") ? "danger" : "info"
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td>{tx.particulars || "-"}</td>
                        <td>{tx.debit ? `₹${tx.debit.toLocaleString()}` : "-"}</td>
                        <td>{tx.credit ? `₹${tx.credit.toLocaleString()}` : "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No transactions found for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div className="text-muted">
                    Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredTransactions.length)} of {filteredTransactions.length} entries
                  </div>
                  <Pagination className="mb-0">
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    {renderPaginationItems()}
                    <Pagination.Next
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer className="py-3">
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Page Info */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-4">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">
            Page Info
          </h5>
          <ul
            className="text-muted fs-6 mb-0"
            style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}
          >
            <li>
              A trial balance lists ledger account balances for verification.
            </li>
            <li>Filter accounts by type and search by name/code above.</li>
            <li>Click on an account name to see detailed ledger transactions.</li>
            <li>
              In ledger modal, filter transactions by date range and by text
              (Type or Particulars).
            </li>
            <li>Pagination is used for better handling of lots of data.</li>
          </ul>
        </Card.Body>
      </Card>
      
      {/* CSS to remove all animations and shake effects */}
      <style jsx global>{`
        * {
          transition: none !important;
          animation: none !important;
          transform: none !important;
        }
        
        /* Remove hover effects from table rows */
        tbody tr:hover {
          background-color: transparent !important;
        }
        
        /* Remove hover effects from buttons */
        .btn:hover {
          transform: none !important;
          box-shadow: none !important;
          background-color: inherit !important;
          border-color: inherit !important;
          color: inherit !important;
        }
        
        /* Remove hover effects from pagination */
        .page-link:hover {
          background-color: transparent !important;
          border-color: transparent !important;
          color: inherit !important;
        }
        
        /* Remove hover effects from form controls */
        .form-control:hover, .form-select:hover {
          border-color: inherit !important;
          box-shadow: none !important;
        }
        
        /* Remove hover effects from cards */
        .card:hover {
          box-shadow: inherit !important;
          transform: none !important;
        }
        
        /* Remove hover effects from badges */
        .badge:hover {
          transform: none !important;
        }
        
        /* Remove modal animations */
        .modal {
          animation: none !important;
        }
        
        .modal-backdrop {
          animation: none !important;
        }
        
        .modal.show .modal-dialog {
          animation: none !important;
          transform: none !important;
        }
        
        /* Remove date picker animations */
        .react-datepicker {
          animation: none !important;
        }
        
        .react-datepicker__triangle {
          animation: none !important;
        }
        
        /* Remove all transitions from all elements */
        * {
          transition-property: none !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          transition-timing-function: ease !important;
        }
      `}</style>
    </div>
  );
};

export default TrialBalance;