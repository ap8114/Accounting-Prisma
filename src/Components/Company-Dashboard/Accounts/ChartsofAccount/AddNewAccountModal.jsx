import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert, Dropdown } from "react-bootstrap";
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
  
  // New state for categories
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // New state for Add Sub of Subgroup modal
  const [showAddSubOfSubgroupModal, setShowAddSubOfSubgroupModal] = useState(false);
  const [subOfSubgroupForm, setSubOfSubgroupForm] = useState({
    name: '',
    subgroup_id: ''
  });
  const [isSubOfSubgroupSubmitting, setIsSubOfSubgroupSubmitting] = useState(false);
  const [subOfSubgroupError, setSubOfSubgroupError] = useState('');
  
  // New state for accounts (sub of subgroups)
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  
  // Error states
  const [accountError, setAccountError] = useState('');
  const [parentError, setParentError] = useState('');

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
    fetchAllSubgroups(); // Fetch all subgroups initially
  }, []);

  // Fetch subgroups when selected category changes
  useEffect(() => {
    if (selectedMainCategory) {
      fetchSubgroupsByCategory(selectedMainCategory);
    } else {
      fetchAllSubgroups();
    }
  }, [selectedMainCategory]);

  // Fetch accounts when subgroup changes
  useEffect(() => {
    if (newAccountData.subgroup) {
      const selectedSubgroup = subgroups.find(sub => sub.name === newAccountData.subgroup);
      if (selectedSubgroup) {
        fetchAccountsBySubgroup(selectedSubgroup.id);
      }
    } else {
      setAccounts([]);
    }
  }, [newAccountData.subgroup, subgroups]);

  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setParentError('');
      const response = await axiosInstance.get(`${BaseUrl}categories`);
      console.log("categories", response.data.data);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setParentError('Failed to load categories. Please try again.');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Function to fetch all subgroups
  const fetchAllSubgroups = async () => {
    try {
      setLoadingSubgroups(true);
      setAccountError('');
      const response = await axiosInstance.get(`${BaseUrl}subgroups`);
      console.log("All subgroups response:", response.data);
      // Updated to handle the actual response structure
      if (response.data.success) {
        setSubgroups(response.data.data);
      } else {
        setSubgroups([]);
      }
    } catch (error) {
      console.error('Error fetching all subgroups:', error);
      setAccountError('Failed to load subgroups. Please try again.');
    } finally {
      setLoadingSubgroups(false);
    }
  };

  // Function to fetch subgroups by category
  const fetchSubgroupsByCategory = async (categoryId) => {
    try {
      setLoadingSubgroups(true);
      setAccountError('');
      const response = await axiosInstance.get(`${BaseUrl}subgroups/category/${categoryId}`);
      // Updated to handle the actual response structure
      if (response.data.success) {
        setSubgroups(response.data.data);
      } else {
        setSubgroups([]);
      }
    } catch (error) {
      console.error('Error fetching subgroups by category:', error);
      setAccountError('Failed to load subgroups. Please try again.');
    } finally {
      setLoadingSubgroups(false);
    }
  };

  // Function to fetch accounts by subgroup
  const fetchAccountsBySubgroup = async (subgroupId) => {
    try {
      setLoadingAccounts(true);
      setAccountError('');
      const response = await axiosInstance.get(`${BaseUrl}account/subgroup/${subgroupId}?company_id=${companyId}`);
      console.log("Accounts by subgroup response:", response.data);
      // Updated to handle the actual response structure
      if (response.data.success) {
        setAccounts(response.data.data);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching accounts by subgroup:', error);
      setAccountError('Failed to load accounts. Please try again.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Function to delete a subgroup
  const handleDeleteSubgroup = async (subgroupId) => {
    try {
      setAccountError('');
      const response = await axiosInstance.delete(`${BaseUrl}subgroups/${subgroupId}`);
      
      if (response.data.success) {
        // Refresh subgroups list
        if (selectedMainCategory) {
          await fetchSubgroupsByCategory(selectedMainCategory);
        } else {
          await fetchAllSubgroups();
        }
        
        // Reset form if the deleted subgroup was selected
        if (newAccountData.subgroup) {
          const selectedSubgroup = subgroups.find(sub => sub.name === newAccountData.subgroup);
          if (selectedSubgroup && selectedSubgroup.id === subgroupId) {
            setNewAccountData({
              ...newAccountData,
              subgroup: "",
              name: "",
            });
          }
        }
      } else {
        setAccountError('Failed to delete subgroup. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting subgroup:', error);
      if (error.response?.data?.message) {
        setAccountError(error.response.data.message);
      } else {
        setAccountError('Failed to delete subgroup. Please try again.');
      }
    }
  };

  // Handle saving the parent account
  const handleSaveParentAccount = async () => {
    setIsSubmitting(true);
    setParentError('');
    try {
      // Prepare payload
      const payload = {
        company_id: companyId,
        category_id: parentAccountForm.mainCategory, // Now using the ID directly
        name: parentAccountForm.subgroupName
      };

      // Make API call - Updated to use /api/subgroups endpoint
      const response = await axiosInstance.post(`${BaseUrl}subgroups`, payload);

      // Call handleAddNewParent callback with response data
      handleAddNewParent(response.data);
      
      // Reset form after successful submission
      setParentAccountForm({
        mainCategory: '',
        subgroupName: ''
      });
      
      // Refresh subgroups list
      if (selectedMainCategory) {
        await fetchSubgroupsByCategory(selectedMainCategory);
      } else {
        await fetchAllSubgroups();
      }
      
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
        has_bank_details: showBankDetails ? "yes" : "no",
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

      // Make API call - Updated to use /account endpoint
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

  // Handle saving the new sub of subgroup
  const handleSaveSubOfSubgroup = async () => {
    setIsSubOfSubgroupSubmitting(true);
    setSubOfSubgroupError('');
    try {
      // Find the selected subgroup ID
      const selectedSubgroup = subgroups.find(sub => sub.name === newAccountData.subgroup);
      
      if (!selectedSubgroup) {
        setSubOfSubgroupError('Please select a subgroup first');
        return;
      }
      
      // Prepare payload with the required structure
      const payload = {
        company_id: companyId,
        subgroup_id: selectedSubgroup.id,
        account_name: subOfSubgroupForm.name,
        has_bank_details: 0 // Default to 0 for sub of subgroups
      };

      // Make API call
      const response = await axiosInstance.post(`${BaseUrl}account`, payload);

      // Reset form after successful submission
      setSubOfSubgroupForm({
        name: '',
        subgroup_id: ''
      });
      
      // Close modal
      setShowAddSubOfSubgroupModal(false);
      
      // Update the account data with the new sub of subgroup
      if (response.data) {
        setNewAccountData({
          ...newAccountData,
          name: response.data.account_name || subOfSubgroupForm.name
        });
        
        // Refresh accounts list
        fetchAccountsBySubgroup(selectedSubgroup.id);
      }
      
    } catch (error) {
      console.error('Error saving sub of subgroup:', error);
      if (error.response?.data?.message) {
        setSubOfSubgroupError(error.response.data.message);
      } else {
        setSubOfSubgroupError('Failed to add sub of subgroup. Please try again.');
      }
    } finally {
      setIsSubOfSubgroupSubmitting(false);
    }
  };

  // Handle input changes for the sub of subgroup form
  const handleSubOfSubgroupInputChange = (e) => {
    const { name, value } = e.target;
    setSubOfSubgroupForm({
      ...subOfSubgroupForm,
      [name]: value
    });
  };

  // Helper function to get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Helper function to get category name from subgroup object
  const getCategoryNameFromSubgroup = (subgroup) => {
    return subgroup.category ? subgroup.category.name : 'Unknown';
  };

  // Handle input changes for the parent account form
  const handleParentAccountInputChange = (e) => {
    const { name, value } = e.target;
    setParentAccountForm({
      ...parentAccountForm,
      [name]: value
    });
  };

  // Handle subgroup selection
  const handleSubgroupSelect = (subgroupName) => {
    setNewAccountData({
      ...newAccountData,
      subgroup: subgroupName,
      name: "",
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
                      fetchCategories(); // Refresh categories when opening the modal
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
                <Dropdown>
                  <Dropdown.Toggle 
                    variant="light" 
                    className="w-100 text-start"
                    id="subgroup-dropdown"
                  >
                    {newAccountData.subgroup || "-- Select Subgroup --"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    {loadingSubgroups ? (
                      <Dropdown.Item disabled>Loading subgroups...</Dropdown.Item>
                    ) : (
                      subgroups.map((subgroup) => (
                        <Dropdown.Item 
                          key={subgroup.id}
                          className="d-flex justify-content-between align-items-center"
                          onClick={() => handleSubgroupSelect(subgroup.name)}
                        >
                          <span>
                            {subgroup.name} ({getCategoryNameFromSubgroup(subgroup)})
                          </span>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubgroup(subgroup.id);
                            }}
                          >
                            Delete
                          </Button>
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <Form.Label>Sub of Subgroup (Account Name)</Form.Label>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!newAccountData.subgroup) {
                        setAccountError('Please select a subgroup first');
                        return;
                      }
                      setShowAddSubOfSubgroupModal(true);
                      setSubOfSubgroupError('');
                      setSubOfSubgroupForm({
                        name: '',
                        subgroup_id: ''
                      });
                    }}
                    style={{
                      backgroundColor: "#53b2a5",
                      border: "none",
                      padding: "8px 16px",
                    }}
                    disabled={!newAccountData.subgroup}
                  >
                    + Add Sub of Subgroup
                  </Button>
                </div>
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
                  {loadingAccounts ? (
                    <option disabled>Loading accounts...</option>
                  ) : (
                    accounts.map((account) => (
                      <option key={account.id} value={account.account_name}>
                        {account.account_name}
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
                    {loadingCategories ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
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

      {/* Add Sub of Subgroup Modal */}
      <Modal
        show={showAddSubOfSubgroupModal}
        onHide={() => {
          setShowAddSubOfSubgroupModal(false);
          setSubOfSubgroupError('');
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Add Sub of Subgroup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {subOfSubgroupError && (
            <Alert variant="danger" onClose={() => setSubOfSubgroupError('')} dismissible>
              {subOfSubgroupError}
            </Alert>
          )}
          <Form>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Account Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={subOfSubgroupForm.name}
                    onChange={handleSubOfSubgroupInputChange}
                    placeholder="Enter account name"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Subgroup</Form.Label>
                  <Form.Control
                    type="text"
                    value={newAccountData.subgroup}
                    disabled
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
              setShowAddSubOfSubgroupModal(false);
              setSubOfSubgroupError('');
            }}
            disabled={isSubOfSubgroupSubmitting}
          >
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#53b2a5", border: "none" }}
            onClick={handleSaveSubOfSubgroup}
            disabled={isSubOfSubgroupSubmitting || !subOfSubgroupForm.name}
          >
            {isSubOfSubgroupSubmitting ? 'Adding...' : 'Add Account'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddNewAccountModal;