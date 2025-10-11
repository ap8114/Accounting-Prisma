import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";
import BaseUrl from "../../../../Api/BaseUrl";
import axiosInstance from "../../../../Api/axiosInstance";
import GetCompanyId from "../../../../Api/GetCompanyId";

const companyId = GetCompanyId();

const AddNewAccountModal = ({ 
  show, 
  onHide, 
  onSave, 
  newAccountData, 
  setNewAccountData,
  showBankDetails,
  setShowBankDetails,
  showAddParentModal,
  setShowAddParentModal,
  selectedMainCategory,
  setSelectedMainCategory,
  parentToChildren,
  accountData,
  handleAddNewParent
}) => {
  // State for the Add Parent Account modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccountSubmitting, setIsAccountSubmitting] = useState(false);
  const [parentAccountForm, setParentAccountForm] = useState({
    mainCategory: '',
    subgroupName: ''
  });
  const [subgroups, setSubgroups] = useState([]);
  const [loadingSubgroups, setLoadingSubgroups] = useState(true);
  
  // Error states
  const [accountError, setAccountError] = useState('');
  const [parentError, setParentError] = useState('');

  // Fetch subgroups when component mounts
  useEffect(() => {
    fetchSubgroups();
  }, []);

  // Function to fetch subgroups
  const fetchSubgroups = async () => {
    try {
      setLoadingSubgroups(true);
      setAccountError('');
      const response = await axiosInstance.get(`${BaseUrl}subgroup`);
      if (response.data.status) {
        setSubgroups(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subgroups:', error);
      setAccountError('Failed to load subgroups. Please try again.');
    } finally {
      setLoadingSubgroups(false);
    }
  };

  // Handle saving the parent account
  const handleSaveParentAccount = async () => {
    setIsSubmitting(true);
    setParentError('');
    try {
      // Prepare payload
      const payload = {
        category_id: getCategoryID(parentAccountForm.mainCategory),
        name: parentAccountForm.subgroupName
      };

      // Make API call
      const response = await axiosInstance.post(`${BaseUrl}subgroup`, payload);

      // Call handleAddNewParent callback with response data
      handleAddNewParent(response.data);
      
      // Reset form after successful submission
      setParentAccountForm({
        mainCategory: '',
        subgroupName: ''
      });
      
      // Refresh subgroups list
      await fetchSubgroups();
      
      // Close modal
      setShowAddParentModal(false);
      
    } catch (error) {
      console.error('Error saving parent account:', error);
      if (error.response?.data?.message) {
        setParentError(error.response.data.message);
      } else {
        setParentError('Failed to add parent account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving the new account
  const handleSaveAccount = async () => {
    setIsAccountSubmitting(true);
    setAccountError('');
    try {
      // Find the selected subgroup ID
      const selectedSubgroup = subgroups.find(sub => sub.name === newAccountData.subgroup);
      
      // Prepare payload
      const payload = {
        subgroup_id: selectedSubgroup ? selectedSubgroup.id : '',
        company_id: companyId,
        account_name: newAccountData.name,
        has_bank_details: showBankDetails ? 1 : 0,
      };

      // Add bank details if enabled
      if (showBankDetails) {
        payload.account_number = newAccountData.bankAccountNumber || '';
        payload.ifsc_code = newAccountData.bankIFSC || '';
        payload.bank_name_branch = newAccountData.bankNameBranch || '';
      }

      // Add contact details for Sundry Debtors/Creditors
      if (newAccountData.subgroup === "Sundry Debtors" || 
          newAccountData.subgroup === "Sundry Creditors") {
        payload.phone = newAccountData.phone || '';
        payload.email = newAccountData.email || '';
      }

      // Make API call
      const response = await axiosInstance.post(`${BaseUrl}account`, payload);

      // Call onSave callback with response data
      onSave(response.data);
      
      // Close modal
      onHide();
      
    } catch (error) {
      console.error('Error saving account:', error);
      if (error.response?.data?.message) {
        setAccountError(error.response.data.message);
      } else {
        setAccountError('Failed to save account. Please try again.');
      }
    } finally {
      setIsAccountSubmitting(false);
    }
  };

  // Helper function to get category ID from category name
  const getCategoryID = (categoryName) => {
    const categoryMap = {
      'assets': 1,
      'liabilities': 2,
      'income': 3,
      'expenses': 4,
      'equity': 5
    };
    return categoryMap[categoryName] || 1;
  };

  // Helper function to get category name from ID
  const getCategoryName = (categoryId) => {
    const categoryMap = {
      1: 'Assets',
      2: 'Liabilities',
      3: 'Income',
      4: 'Expenses',
      5: 'Equity'
    };
    return categoryMap[categoryId] || 'Unknown';
  };

  // Handle input changes for the parent account form
  const handleParentAccountInputChange = (e) => {
    const { name, value } = e.target;
    setParentAccountForm({
      ...parentAccountForm,
      [name]: value
    });
  };

  return (
    <>
      {/* Main Add New Account Modal */}
      <Modal
        show={show}
        onHide={onHide}
        centered
        backdrop="static"
        size="xl"
        dialogClassName="w-100"
      >
        <div>
          <Modal.Header
            closeButton
            className="bg-light d-flex justify-content-between align-items-center"
          >
            <Modal.Title className="m-2">Add New Account</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {accountError && (
              <Alert variant="danger" onClose={() => setAccountError('')} dismissible>
                {accountError}
              </Alert>
            )}
            <Form>
              <Form.Group className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <Form.Label>Subgroup</Form.Label>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowAddParentModal(true);
                      setParentError('');
                    }}
                    style={{
                      backgroundColor: "#53b2a5",
                      border: "none",
                      padding: "8px 16px",
                    }}
                  >
                    + Add Parent
                  </Button>
                </div>
                <Form.Select
                  value={newAccountData.subgroup}
                  onChange={(e) => {
                    const subgroup = e.target.value;
                    setNewAccountData({
                      ...newAccountData,
                      subgroup,
                      name: "",
                    });
                  }}
                >
                  <option value="">-- Select Subgroup --</option>
                  {loadingSubgroups ? (
                    <option disabled>Loading subgroups...</option>
                  ) : (
                    subgroups.map((subgroup) => (
                      <option key={subgroup.id} value={subgroup.name}>
                        {subgroup.name} ({getCategoryName(subgroup.category_id)})
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Sub of Subgroup (Account Name)</Form.Label>
                <Form.Select
                  value={newAccountData.name}
                  onChange={(e) =>
                    setNewAccountData({
                      ...newAccountData,
                      name: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Select Account Name --</option>
                  {accountData.flatMap((group) =>
                    group.rows.map((row) => (
                      <option key={row.name} value={row.name}>
                        {row.name}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>

              {(newAccountData.subgroup === "Sundry Debtors" || 
                newAccountData.subgroup === "Sundry Creditors") && (
                <>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="text"
                          value={newAccountData.phone || ""}
                          onChange={(e) =>
                            setNewAccountData({ ...newAccountData, phone: e.target.value })
                          }
                          placeholder="Enter phone number"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={newAccountData.email || ""}
                          onChange={(e) =>
                            setNewAccountData({ ...newAccountData, email: e.target.value })
                          }
                          placeholder="Enter email address"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Add Bank Details"
                  checked={showBankDetails}
                  onChange={() => setShowBankDetails(!showBankDetails)}
                />
              </Form.Group>

              {showBankDetails && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Account Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={newAccountData.bankAccountNumber}
                      onChange={(e) =>
                        setNewAccountData({
                          ...newAccountData,
                          bankAccountNumber: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>IFSC Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={newAccountData.bankIFSC}
                      onChange={(e) =>
                        setNewAccountData({
                          ...newAccountData,
                          bankIFSC: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Bank Name & Branch</Form.Label>
                    <Form.Control
                      type="text"
                      value={newAccountData.bankNameBranch}
                      onChange={(e) =>
                        setNewAccountData({
                          ...newAccountData,
                          bankNameBranch: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "8px 16px",
              }}
              onClick={handleSaveAccount}
              disabled={isAccountSubmitting || !newAccountData.subgroup || !newAccountData.name}
            >
              {isAccountSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Add Parent Account Modal */}
      <Modal
        show={showAddParentModal}
        onHide={() => {
          setShowAddParentModal(false);
          setParentError('');
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Add Parent Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {parentError && (
            <Alert variant="danger" onClose={() => setParentError('')} dismissible>
              {parentError}
            </Alert>
          )}
          <Form>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Main Category</Form.Label>
                  <Form.Control
                    as="select"
                    name="mainCategory"
                    value={parentAccountForm.mainCategory}
                    onChange={handleParentAccountInputChange}
                  >
                    <option value="">Select Main Type</option>
                    <option value="assets">Assets</option>
                    <option value="liabilities">Liabilities</option>
                    <option value="income">Income</option>
                    <option value="expenses">Expenses</option>
                    <option value="equity">Equity</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Subgroup Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="subgroupName"
                    value={parentAccountForm.subgroupName}
                    onChange={handleParentAccountInputChange}
                    placeholder="Enter subgroup name (e.g., Fixed Assets)"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowAddParentModal(false);
              setParentError('');
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#53b2a5", border: "none" }}
            onClick={handleSaveParentAccount}
            disabled={isSubmitting || !parentAccountForm.mainCategory || !parentAccountForm.subgroupName}
          >
            {isSubmitting ? 'Adding...' : 'Add Subgroup'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddNewAccountModal;