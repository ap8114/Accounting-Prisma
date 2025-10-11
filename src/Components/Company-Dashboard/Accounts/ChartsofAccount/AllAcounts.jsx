import React, { useState, useEffect } from "react";
import {
  Table,
  Container,
  Card,
  Button,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import { FaUserPlus, FaUserFriends } from "react-icons/fa";
import { FaEye, FaEdit, FaTrash, FaFileInvoice } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import AddCustomerModal from "./AddCustomerModal";
import AddVendorModal from "./AddVendorModal";
import AddNewAccountModal from "./AddNewAccountModal";
import AccountActionModal from "./AccountActionModal";  

import axios from "axios";
import BaseUrl from "../../../../Api/BaseUrl";
import axiosInstance from "../../../../Api/axiosInstance";
import GetCompanyId from "../../../../Api/GetCompanyId";

const companyId = GetCompanyId();

// Mock API object for demonstration
const api = {
  get: async (url) => {
    if (url === "/accounts/parents") {
      return Promise.resolve({
        data: [
          { _id: "1", name: "Assets" },
          { _id: "2", name: "Liabilities" },
          { _id: "3", name: "Equity" },
          { _id: "4", name: "Income" },
          { _id: "5", name: "Expenses" },
        ],
      });
    }
    return Promise.resolve({ data: [] });
  },
  post: async (url, data) => {
    console.log("Mock API POST to", url, "with data:", data);
    return Promise.resolve({ data: { _id: Date.now().toString(), ...data } });
  },
};

const AllAccounts = () => {
  // Get unique account types from accountData
  const navigate = useNavigate();
  
  // Define parent-to-children mapping based on your images
  const [parentToChildren, setParentToChildren] = useState({
    "Assets": ["Cash-in-hand", "Bank A/Cs", "Sundry Debtors", "Current Assets", "Fixed Assets", "Investments", "Bank OD A/C", "Deposits (Assets)"],
    "Liabilities": ["Sundry Creditors", "Current Liabilities", "Loans (Liability)", "Loans & Advances", "Provisions"],
    "Income": ["Purchases A/C", "Purchases Return", "Sales A/C", "Sales Return", "Misc. Income"],
    "Expenses": ["Capital A/C", "Direct Expenses", "Indirect Expenses", "Misc. Expenses"]
  });
  
  // State declarations
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [accountType, setAccountType] = useState("Sundry Creditors");
  const [isTaxEnabled, setIsTaxEnabled] = useState(true);
  const [taxNumber, setTaxNumber] = useState("TAX123456");
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [parentAccounts, setParentAccounts] = useState([]);
  const [loadingParentAccounts, setLoadingParentAccounts] = useState(false);
  const [accountData, setAccountData] = useState([]); // Changed from const to let
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const options = accountData.flatMap((group) =>
    group.rows.map((row) => ({ value: row.name, label: row.name }))
  );
  
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionModal, setActionModal] = useState({
    show: false,
    mode: null, // 'view', 'edit', 'delete'
  });

  const [vendorFormData, setVendorFormData] = useState({
    name: "",
    nameArabic: "",
    companyName: "",
    companyLocation: "",
    idCardImage: null,
    extraFile: null,
    accountType: "Sundry Creditors",
    accountName: "",
    balanceType: "Credit",
    accountBalance: "0.00",
    creationDate: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankName: "",
    country: "",
    state: "",
    pincode: "",
    address: "",
    stateCode: "",
    shippingAddress: "",
    phone: "",
    email: "",
    creditPeriod: "",
    gstin: "",
    gstType: "Registered",
    taxEnabled: true,
    taxNumber: "",
  });
  
  const [customerFormData, setCustomerFormData] = useState({
    gstin: "",
    gstEnabled: true,
    name: "",
    nameArabic: "",
    companyName: "",
    companyLocation: "",
    idCardImage: null,
    extraFile: null,
    accountType: "Sundry Debtors",
    accountName: "",
    balanceType: "Debit",
    accountBalance: "0.00",
    creationDate: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankName: "",
    country: "",
    state: "",
    pincode: "",
    address: "",
    stateCode: "",
    shippingAddress: "",
    phone: "",
    email: "",
    creditPeriod: "",
    gstin: "",
    gstType: "Registered",
    taxEnabled: true,
    taxNumber: "",
  });

  const [newAccountData, setNewAccountData] = useState({
    type: "",
    subgroup: "", 
    name: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankNameBranch: "",
    parentId: "",
    balance: "0.00",
    phone: "",
    email: "",
    isDefault: false,
  });


  

  // Fetch account data from API
  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`${BaseUrl}account/getAccountByCompany/${companyId}`);
        if (response.data.status) {
          // Transform API data to match the component's expected format
          const transformedData = transformAccountData(response.data.data);
          setAccountData(transformedData);
        } else {
          setError(response.data.message || "Failed to fetch accounts");
        }
      } catch (err) {
        console.error("Error fetching account data:", err);
        setError("No Account Found");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, []);

  // Transform API data to match component's expected format
  const transformAccountData = (apiData) => {
    // Group accounts by subgroup_name
    const groupedData = {};
    
    apiData.forEach(account => {
      const subgroupName = account.subgroup_name || "Uncategorized";
      
      if (!groupedData[subgroupName]) {
        groupedData[subgroupName] = {
          type: subgroupName,
          rows: []
        };
      }
      
      groupedData[subgroupName].rows.push({
        name: account.account_name,
        bal: "0.00", // API doesn't provide balance, setting default
        id: account.id,
        has_bank_details: account.has_bank_details,
        account_number: account.account_number,
        ifsc_code: account.ifsc_code,
        bank_name_branch: account.bank_name_branch,
        subgroup_id: account.subgroup_id,
        company_id: account.company_id
      });
    });
    
    // Convert to array
    return Object.values(groupedData);
  };

  useEffect(() => {
    const fetchParentAccounts = async () => {
      setLoadingParentAccounts(true);
      try {
        const response = await api.get("/accounts/parents");
        setParentAccounts(response.data);
      } catch (error) {
        console.error("Failed to fetch parent accounts:", error);
      } finally {
        setLoadingParentAccounts(false);
      }
    };

    fetchParentAccounts();
  }, []);

  // Handlers
  const handleSaveVendor = () => {
    console.log("Vendor Saved:", vendorFormData);
    setShowVendorModal(false);
  };
  
  const handleSaveCustomer = () => {
    console.log("Customer Saved:", customerFormData);
    setShowCustomerModal(false);
  };

  const handleSaveNewAccount = async () => {
    try {
      await api.post("/accounts", {
        parentType: newAccountData.parentType,
        name: newAccountData.name,
        phone: newAccountData.phone,
        email: newAccountData.email,
        bankAccountNumber: newAccountData.bankAccountNumber,
        bankIFSC: newAccountData.bankIFSC,
        bankNameBranch: newAccountData.bankNameBranch,
      });
      setShowNewAccountModal(false);
    } catch (error) {
      console.error("Failed to save new account:", error);
    }
  };

  const handleAddNewParent = () => {
    if (!selectedMainCategory) {
      alert("Please select a main category");
      return;
    }
  
    // Add a default subgroup under main category (e.g., same name)
    setParentToChildren((prev) => {
      const updated = { ...prev };
      if (!updated[selectedMainCategory]) {
        updated[selectedMainCategory] = [selectedMainCategory]; // Use main category name as subgroup
      }
      return updated;
    });
  
    // Optionally set the parent in new account form
    setNewAccountData((prev) => ({
      ...prev,
      parentType: selectedMainCategory,
    }));
  
    // Reset and close
    setSelectedMainCategory("");
    setShowAddParentModal(false);
  };

  const handleViewAccount = (type, name) => {
    setSelectedAccount({ type, name });
    setActionModal({ show: true, mode: 'view' });
  };
  
  const handleEditAccount = (type, name) => {
    // Find the actual row to get the balance
    const accountGroup = accountData.find((acc) => acc.type === type);
    const row = accountGroup?.rows.find((r) => r.name === name);

    setSelectedAccount({
      type,
      name,
      balance: row ? parseFloat(row.bal) : 0,
    });
    setActionModal({ show: true, mode: 'edit' });
  };
  
  const handleDeleteAccount = (type, name) => {
    setSelectedAccount({ type, name });
    setActionModal({ show: true, mode: 'delete' });
  };
  
  const handleViewLedger = (type, name) => {
    navigate("/company/ledgerpageaccount", {
      state: { accountName: name, accountType: type },
    });
  };

  const handleSaveEditedAccount = (updatedAccount) => {
    // Update the actual accountData (mock update)
    const updatedAccountData = accountData.map((group) => {
      if (group.type === updatedAccount.type) {
        return {
          ...group,
          rows: group.rows.map((row) => {
            if (row.name === selectedAccount.name) {
              return {
                ...row,
                name: updatedAccount.name,
                bal: updatedAccount.balance.toFixed(2),
              };
            }
            return row;
          }),
        };
      }
      return group;
    });

    // In a real app, you would update state or make an API call
    console.log("Account updated:", updatedAccount);
    console.log("Updated account data:", updatedAccountData);
    
    setActionModal({ show: false, mode: null });
  };

  const handleDeleteConfirmed = () => {
    console.log("Account deleted:", selectedAccount);
    setActionModal({ show: false, mode: null });
  };

  // Filter account data based on filterName
  const [filterName, setFilterName] = useState("");
  const filteredAccountData = accountData.filter((accountGroup) => {
    const typeMatches = accountGroup.type
      .toLowerCase()
      .includes(filterName.toLowerCase());
    const nameMatches = accountGroup.rows.some((row) =>
      row.name.trim().toLowerCase().includes(filterName.toLowerCase())
    );
    return typeMatches || nameMatches;
  });

  // Add this function to calculate total balance for each account type
  const calculateTotalBalance = (accountGroup) => {
    return accountGroup.rows
      .filter((row) => row.name.trim() !== "")
      .reduce((total, row) => {
        const bal = parseFloat(row.bal) || 0;
        return total + bal;
      }, 0);
  };

  // Get unique account types from accountData
  const accountTypes = [...new Set(accountData.map((acc) => acc.type))];

  return (
    <Container fluid className="p-3">
      {/* Header Row - Responsive & Safe on All Devices */}
      <Row className="align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <Col xs={12} md="auto">
          <h4
            className="fw-bold text-start mb-2 mb-md-0"
            style={{ marginTop: "1rem" }}
          >
            All Accounts
          </h4>
        </Col>
        <Col
          xs={12}
          md="auto"
          className="d-flex flex-wrap gap-2 justify-content-end"
        >
          <Button
            style={{
              backgroundColor: "#53b2a5",
              border: "none",
              padding: "8px 16px",
            }}
            className="d-flex align-items-center gap-2 text-white fw-semibold flex-shrink-0"
            onClick={() => setShowNewAccountModal(true)}
          >
            + Add New Account
          </Button>
          <Button
            style={{
              backgroundColor: "#53b2a5",
              border: "none",
              padding: "8px 16px",
            }}
            className="d-flex align-items-center gap-2 text-white fw-semibold flex-shrink-0"
            onClick={() => setShowVendorModal(true)}
          >
            <FaUserPlus size={18} />
            Add Vendor
          </Button>
          <Button
            style={{
              backgroundColor: "#53b2a5",
              border: "none",
              padding: "8px 16px",
            }}
            className="d-flex align-items-center gap-2 text-white fw-semibold flex-shrink-0"
            onClick={() => setShowCustomerModal(true)}
          >
            <FaUserFriends />
            Add Customer
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-3 align-items-end">
        <Form.Group>
          <Form.Label>Filter by Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Search account name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={{ minWidth: "200px" }}
          />
        </Form.Group>
        <Button
          variant="secondary"
          onClick={() => {
            setFilterName("");
          }}
          className="mt-auto"
        >
          Clear
        </Button>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading accounts...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="table-responsive" style={{ minWidth: "100%" }}>
          <Table bordered hover className="align-middle text-center mb-0">
            <thead
              className="table-light"
              style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>Account Type</th>
                <th>Account Name</th>
                <th>Account Balance</th>
                <th>Total Balance</th>
                <th>Actions</th> 
              </tr>
            </thead>
            <tbody>
              {filteredAccountData.length > 0 ? (
                filteredAccountData.map((accountGroup) => {
                  const totalBalance = calculateTotalBalance(accountGroup);
                  return (
                    <React.Fragment key={accountGroup.type}>
                      {/* Group Heading */}
                      <tr className="bg-light">
                        <td colSpan="5" className="text-start fw-bold">
                          {accountGroup.type}
                        </td>
                      </tr>
                      {/* Account Rows */}
                      {accountGroup.rows
                        .filter((row) => row.name.trim() !== "")
                        .map((row, index) => (
                          <tr key={`${accountGroup.type}-${index}`}>
                            <td className="text-start">{accountGroup.type}</td>
                            <td className="text-start">{row.name}</td>
                            <td>{parseFloat(row.bal).toFixed(2)}</td>
                            <td></td>
                            {/* Actions Column */}
                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  title="View"
                                  onClick={() =>
                                    handleViewAccount(accountGroup.type, row.name)
                                  }
                                >
                                  <FaEye />
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  title="Edit"
                                  onClick={() =>
                                    handleEditAccount(accountGroup.type, row.name)
                                  }
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  title="Delete"
                                  onClick={() =>
                                    handleDeleteAccount(accountGroup.type, row.name)
                                  }
                                >
                                  <FaTrash />
                                </Button>
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  title="View Ledger"
                                  onClick={() =>
                                    handleViewLedger(accountGroup.type, row.name)
                                  }
                                >
                                  View Ledger
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {/* Total Balance Row */}
                      {totalBalance !== 0 && (
                        <tr className="bg-light font-weight-bold">
                          <td colSpan="3" className="text-end">
                            Total Balance
                          </td>
                          <td className="text-end">
                            {totalBalance >= 0
                              ? totalBalance.toFixed(2)
                              : `(${Math.abs(totalBalance).toFixed(2)})`}
                          </td>
                          <td></td> {/* Empty cell for Actions column */}
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modals */}
      <AddCustomerModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        onSave={handleSaveCustomer}
        customerFormData={customerFormData}
        setCustomerFormData={setCustomerFormData}
      />

      <AddVendorModal
        show={showVendorModal}
        onHide={() => setShowVendorModal(false)}
        onSave={handleSaveVendor}
        vendorFormData={vendorFormData}
        setVendorFormData={setVendorFormData}
      />

      <AddNewAccountModal
        show={showNewAccountModal}
        onHide={() => setShowNewAccountModal(false)}
        onSave={handleSaveNewAccount}
        newAccountData={newAccountData}
        setNewAccountData={setNewAccountData}
        showBankDetails={showBankDetails}
        setShowBankDetails={setShowBankDetails}
        showAddParentModal={showAddParentModal}
        setShowAddParentModal={setShowAddParentModal}
        selectedMainCategory={selectedMainCategory}
        setSelectedMainCategory={setSelectedMainCategory}
        parentToChildren={parentToChildren}
        accountData={accountData}
        handleAddNewParent={handleAddNewParent}
      />

      <AccountActionModal
        show={actionModal.show}
        onHide={() => setActionModal({ show: false, mode: null })}
        mode={actionModal.mode}
        accountData={accountData}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        onSave={handleSaveEditedAccount}
        onDelete={handleDeleteConfirmed}
        accountTypes={accountTypes}
      />

      {/* Page Description */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">
            Page Info
          </h5>
          <ul
            className="text-muted fs-6 mb-0"
            style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}
          >
            <li>Displays all financial accounts.</li>
            <li>Accounts are categorized by type.</li>
            <li>Helps in easy management and tracking.</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AllAccounts;