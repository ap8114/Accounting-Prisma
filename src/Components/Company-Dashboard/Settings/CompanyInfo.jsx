import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Image, Nav, Tab, Alert } from 'react-bootstrap';
import { FaBuilding, FaImage, FaMapMarkerAlt, FaFileInvoice } from 'react-icons/fa';
import axiosInstance from '../../../Api/axiosInstance';
import GetCompanyId from '../../../Api/GetCompanyId';

const CompanyInfo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const companyId = GetCompanyId();
  const [formData, setFormData] = useState({
    // === Company Info ===
    companyName: '',
    companyEmail: '',
    phoneNumber: '',
    fax: '',
    website: false,
    companyImages: false,
    companyIcon: null,
    favicon: null,
    companyLogo: null,
    companyDarkLogo: null,
    addressInfo: false,
    address: '',
    country: '',
    city: '',
    state: '',
    portalCode: '',
    currency: '',
    uploadImages: [false, false, false],

    // === Invoice Settings ===
    invoiceTemplateId: 'template1',
    purchaseTemplateId: 'purchase1',
    receiptTemplateId: 'receipt1',
    headerLabel: 'Invoice No.',
    footerTerms: '',
    footerNote: '',
    footerBankDetails: '',
    // Dedicated bank fields (used instead of free-text footerBankDetails)
    bank_name: '',
    account_no: '',
    account_holder: '',
    ifsc_code: '',
    purchaseLogo: null,
    purchaseDarkLogo: null,
    purchaseIcon: null,
    showDescription: true,
    showItemName: true,
    showPrice: true,
    showQuantity: true,
    showTotal: true
  });

  const [previewImages, setPreviewImages] = useState({
    companyIcon: null,
    favicon: null,
    companyLogo: null,
    companyDarkLogo: null,
    purchaseLogo: null,
    purchaseDarkLogo: null,
    purchaseIcon: null
  });

  const currencyOptions = [
    { value: '', label: 'Select' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'JPY', label: 'JPY - Japanese Yen' }
  ];

  const countryOptions = [
    { value: '', label: 'Select' },
    { value: 'USA', label: 'USA' },
    { value: 'India', label: 'India' },
    { value: 'UAE', label: 'UAE' },
    { value: 'France', label: 'France' },
    { value: 'Australia', label: 'Australia' }
  ];

  const stateOptions = [
    { value: '', label: 'Select' },
    { value: 'Alaska', label: 'Alaska' },
    { value: 'California', label: 'California' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Dubai', label: 'Dubai' }
  ];

  const cityOptions = [
    { value: '', label: 'Select' },
    { value: 'New York', label: 'New York' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Dubai', label: 'Dubai' },
    { value: 'Paris', label: 'Paris' }
  ];

  // Function to get company data from API
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/auth/Company/${companyId}`);
      const companyData = response.data.data;

      // Update form data with fetched company data
      setFormData(prev => ({
        ...prev,
        companyName: companyData.name || '',
        companyEmail: companyData.email || '',
        phoneNumber: companyData.phone || '',
        address: companyData.address || '',
        country: companyData.country || '',
        city: companyData.city || '',
        state: companyData.state || '',
        portalCode: companyData.postal_code || '',
        currency: companyData.currency || ''
      }));

      // Set image URLs as preview if they exist in branding
      if (companyData.branding) {
        setPreviewImages(prev => ({
          ...prev,
          companyIcon: companyData.branding.company_icon_url || prev.companyIcon,
          favicon: companyData.branding.favicon_url || prev.favicon,
          companyLogo: companyData.branding.company_logo_url || prev.companyLogo,
          companyDarkLogo: companyData.branding.company_dark_logo_url || prev.companyDarkLogo
        }));
      }
    } catch (err) {
      setError('Failed to load company data');
      console.error('Error fetching company ', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to save company data
  const saveCompanyData = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare form data for API
      const payload = {
        name: formData.companyName,
        email: formData.companyEmail,
        phone: formData.phoneNumber,
        address: formData.address,
        country: formData.country,
        city: formData.city,
        state: formData.state,
        postal_code: formData.portalCode,
        currency: formData.currency
      };

      // Create FormData object for file uploads
      const formDataToSend = new FormData();
      Object.keys(payload).forEach(key => {
        formDataToSend.append(key, payload[key]);
      });

      // Add file fields to FormData
      if (formData.companyIcon) {
        formDataToSend.append('companyIcon', formData.companyIcon);
      }
      if (formData.favicon) {
        formDataToSend.append('favicon', formData.favicon);
      }
      if (formData.companyLogo) {
        formDataToSend.append('companyLogo', formData.companyLogo);
      }
      if (formData.companyDarkLogo) {
        formDataToSend.append('companyDarkLogo', formData.companyDarkLogo);
      }

      // Make API call
      const response = await axiosInstance.put(`/auth/Company/${companyId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('✅ Company updated successfully');
        // Update preview images with new URLs if returned in response
        if (response.data.data && response.data.data.branding) {
          setPreviewImages(prev => ({
            ...prev,
            companyIcon: response.data.data.branding.company_icon_url || prev.companyIcon,
            favicon: response.data.data.branding.favicon_url || prev.favicon,
            companyLogo: response.data.data.branding.company_logo_url || prev.companyLogo,
            companyDarkLogo: response.data.data.branding.company_dark_logo_url || prev.companyDarkLogo
          }));
        }
      } else {
        setError(response.data.message || 'Failed to update company');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating company');
      console.error('Error updating company:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImages(prev => ({
          ...prev,
          [name]: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const uploadButtonStyle = {
    backgroundColor: '#002d4d',
    borderColor: '#002d4d',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px'
  };

  const previewImageStyle = {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
    padding: '4px'
  };

  // Fetch company data on component mount
  useEffect(() => {
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  return (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        padding: '20px 0'
      }}
    >
      <div className="p-4" style={{ maxWidth: '100%' }}>
        {/* Page Title */}
        <h1 className="mb-3" style={{ fontSize: '24px', fontWeight: '600' }}>
          Settings
        </h1>
        <p className="mb-4 text-muted">Manage your settings on portal.</p>

        {/* Error/Success Messages */}
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Loading indicator */}
        {loading && <Alert variant="info">Loading...</Alert>}


        <div>
          {/* === COMPANY SETTINGS === */}
          <div eventKey="company">
            <div className="bg-white p-4 rounded shadow-sm">
              <h2 className="mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>
                Company Information
              </h2>

              <Form.Group className="mb-4">
                <Form.Control
                  type="text"
                  placeholder="Company Name *"
                  className="mb-3"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                />
                <Form.Control
                  type="email"
                  placeholder="Company Email Address *"
                  className="mb-3"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                />
                <Form.Control
                  type="tel"
                  placeholder="Phone Number *"
                  className="mb-3"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </Form.Group>

              <hr className="my-4" />

              <div className="d-flex align-items-center mb-3">
                <FaImage className="me-2" style={{ color: '#002d4d' }} />
                <h5 style={{ marginBottom: 0 }}>Company Images</h5>
              </div>

              {["companyIcon", "favicon", "companyLogo", "companyDarkLogo"].map((field) => (
                <Form.Group className="mb-4" key={field}>
                  <Form.Label className="fw-bold d-block mb-2">{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}</Form.Label>
                  <div className="d-flex align-items-center">
                    <Button as="label" htmlFor={`${field}-upload`} style={uploadButtonStyle}>
                      Choose File
                      <Form.Control
                        type="file"
                        id={`${field}-upload`}
                        className="d-none"
                        name={field}
                        onChange={handleChange}
                        accept="image/*"
                      />
                    </Button>
                    {previewImages[field] && (
                      <Image src={previewImages[field]} alt={`${field} Preview`} style={previewImageStyle} />
                    )}
                  </div>
                  <Form.Text className="text-muted">
                    Upload {field.toLowerCase()} of your company
                  </Form.Text>
                </Form.Group>
              ))}

              <hr className="my-4" />

              <div className="d-flex align-items-center mb-3">
                <FaMapMarkerAlt className="me-2" style={{ color: '#002d4d' }} />
                <h5 style={{ marginBottom: 0 }}>Address Information</h5>
              </div>

              <Form.Group className="mb-4">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Address *"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <Form.Label className="fw-bold">Country *</Form.Label>
                  <Form.Select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    {countryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="col-md-6">
                  <Form.Label className="fw-bold">City *</Form.Label>
                  <Form.Select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  >
                    {cityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <Form.Label className="fw-bold">State *</Form.Label>
                  <Form.Select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    {stateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="col-md-6">
                  <Form.Label className="fw-bold">Portal Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="portalCode"
                    value={formData.portalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <Form.Label className="fw-bold">Currency *</Form.Label>
                  <Form.Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    {currencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="outline-secondary"
                  className="me-3 px-4 py-2"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className="px-4 py-2"
                  style={{
                    borderRadius: '4px',
                    backgroundColor: '#002d4d',
                    borderColor: '#002d4d',
                    border: 'none',
                    color: '#fff'
                  }}
                  onClick={saveCompanyData}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-muted text-center mt-3">
        Manage your company and invoice settings.
      </p>
    </div >
  );
};

export default CompanyInfo;