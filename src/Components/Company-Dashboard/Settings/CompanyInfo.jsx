import React, { useState } from 'react';
import { Form, Button, Container, Image, Nav, Tab, Card, Row, Col } from 'react-bootstrap';
import { FaBuilding, FaImage, FaMapMarkerAlt, FaGlobe, FaFileInvoice } from 'react-icons/fa';
import { CurrencySetting } from './CurrencySetting';

const CompanyInfo = () => {
  const [printLanguage, setPrintLanguage] = useState('en');

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
    invoiceImage: null, // New field for invoice image
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
    purchaseIcon: null,
    invoiceImage: null // New field for invoice image preview
  });

  // Translations
  const translations = {
    en: {
      settings: "Settings",
      manageSettings: "Manage your settings on portal.",
      companySettings: "Company Settings",
      invoiceSettings: "Invoice Settings",
      companyInformation: "Company Information",
      companyName: "Company Name *",
      companyEmail: "Company Email Address *",
      phoneNumber: "Phone Number *",
      companyImages: "Company Images",
      companyIcon: "Company Icon",
      favicon: "Favicon",
      companyLogo: "Company Logo",
      companyDarkLogo: "Company Dark Logo",
      chooseFile: "Choose File",
      uploadInstruction: "Upload {field} of your company",
      addressInformation: "Address Information",
      address: "Address *",
      country: "Country *",
      city: "City *",
      state: "State *",
      portalCode: "Portal Code *",
      currency: "Currency *",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      select: "Select",
      pageDescription: "This page allows you to manage company settings including general info, upload logos/icons, and configure address details like country, city, and postal code.",
      // Invoice Settings
      invoiceTemplate: "Invoice Template",
      invoiceImage: "Invoice Image",
      purchases: "Purchases",
      receipts: "Receipts",
      salesInvoice: "Sales Invoice",
      cashInvoice: "Cash Invoice",
      deliveryNote: "Delivery Note",
      headerText: "Header Text",
      footerText: "Footer Text",
      termsConditions: "Terms & Conditions",
      note: "Note",
      bankDetails: "Bank Details",
      customizeFields: "Customize Fields",
      description: "Description",
      itemName: "Item Name (ATM)",
      price: "Price",
      quantity: "Quantity",
      total: "Total",
      saveSettings: "Save Settings"
    },
    ar: {
      settings: "الإعدادات",
      manageSettings: "إدارة إعداداتك على البوابة.",
      companySettings: "إعدادات الشركة",
      invoiceSettings: "إعدادات الفاتورة",
      companyInformation: "معلومات الشركة",
      companyName: "اسم الشركة *",
      companyEmail: "البريد الإلكتروني للشركة *",
      phoneNumber: "رقم الهاتف *",
      companyImages: "صور الشركة",
      companyIcon: "أيقونة الشركة",
      favicon: "favicon",
      companyLogo: "شعار الشركة",
      companyDarkLogo: "شعار الشركة الداكن",
      chooseFile: "اختر ملف",
      uploadInstruction: "تحميل {field} لشركتك",
      addressInformation: "معلومات العنوان",
      address: "العنوان *",
      country: "البلد *",
      city: "المدينة *",
      state: "الولاية *",
      portalCode: "الرمز البريدي *",
      currency: "العملة *",
      cancel: "إلغاء",
      saveChanges: "حفظ التغييرات",
      select: "اختر",
      pageDescription: "تسمح لك هذه الصفحة بإدارة إعدادات الشركة بما في ذلك المعلومات العامة وتحميل الشعارات/الأيقونات وتكوين تفاصيل العنوان مثل البلد والمدينة والرمز البريدي.",
      // Invoice Settings
      invoiceTemplate: "نموذج الفاتورة",
      invoiceImage: "صورة الفاتورة",
      purchases: "المشتريات",
      receipts: "الإيصالات",
      salesInvoice: "فاتورة مبيعات",
      cashInvoice: "فاتورة نقدية",
      deliveryNote: "مذكرة تسليم",
      headerText: "نص العنوان",
      footerText: "نص التذييل",
      termsConditions: "الشروط والأحكام",
      note: "ملاحظة",
      bankDetails: "تفاصيل البنك",
      customizeFields: "تخصيص الحقول",
      description: "الوصف",
      itemName: "اسم الصنف (ATM)",
      price: "السعر",
      quantity: "الكمية",
      total: "الإجمالي",
      saveSettings: "حفظ الإعدادات"
    }
  };

  const t = (key) => {
    if (printLanguage === 'both') {
      return (
        <>
          <div>{translations.en[key]}</div>
          <div>{translations.ar[key]}</div>
        </>
      );
    }
    return translations[printLanguage][key];
  };

  const currencyOptions = [
    { value: '', label: printLanguage === 'both' ? <><div>{translations.en.select}</div><div>{translations.ar.select}</div></> : translations[printLanguage].select },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'JPY', label: 'JPY - Japanese Yen' }
  ];

  const countryOptions = [
    { value: '', label: printLanguage === 'both' ? <><div>{translations.en.select}</div><div>{translations.ar.select}</div></> : translations[printLanguage].select },
    { value: 'USA', label: 'USA' },
    { value: 'India', label: 'India' },
    { value: 'UAE', label: 'UAE' },
    { value: 'France', label: 'France' },
    { value: 'Australia', label: 'Australia' }
  ];

  const stateOptions = [
    { value: '', label: printLanguage === 'both' ? <><div>{translations.en.select}</div><div>{translations.ar.select}</div></> : translations[printLanguage].select },
    { value: 'Alaska', label: 'Alaska' },
    { value: 'California', label: 'California' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Dubai', label: 'Dubai' }
  ];

  const cityOptions = [
    { value: '', label: printLanguage === 'both' ? <><div>{translations.en.select}</div><div>{translations.ar.select}</div></> : translations[printLanguage].select },
    { value: 'New York', label: 'New York' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Dubai', label: 'Dubai' },
    { value: 'Paris', label: 'Paris' }
  ];

  // Subunit mapping per currency
  const currencySubunits = {
    INR: { major: 'Rupees', minor: 'Paise' },
    AED: { major: 'Dirhams', minor: 'Fils' },
    USD: { major: 'Dollars', minor: 'Cents' },
    EUR: { major: 'Euros', minor: 'Cents' },
    default: { major: 'Units', minor: 'Subunits' }
  };

  const getSubunitLabels = (currency) => {
    return currencySubunits[currency] || currencySubunits.default;
  };

  // Template header mapping
  const headerLabels = {
    sales_invoice: printLanguage === 'ar' ? 'رقم الفاتورة' : 'Invoice No.',
    cash_invoice: printLanguage === 'ar' ? 'رقم الفاتورة النقدية' : 'Cash Invoice No.',
    delivery_note: printLanguage === 'ar' ? 'رقم مذكرة التسليم' : 'Delivery Note No.'
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

  const handleTemplateChange = (template) => {
    setFormData(prev => ({
      ...prev,
      invoiceTemplate: template,
      headerLabel: headerLabels[template]
    }));
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

  const langButtonStyle = (isActive) => ({
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: '1px solid #002d4d',
    backgroundColor: isActive ? '#002d4d' : 'white',
    color: isActive ? 'white' : '#002d4d',
    marginRight: '8px',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400'
  });

  return (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        padding: '20px 0',
        direction: printLanguage === 'ar' ? 'rtl' : 'ltr',
        fontFamily: printLanguage === 'ar' ? '"Segoe UI", Tahoma, sans-serif' : 'system-ui'
      }}
    >


      {/* currency setting component call */}
      <CurrencySetting />



      <Container className="p-4" style={{ maxWidth: '100%' }}>
        {/* Language Toggle Buttons */}
        <div className="d-flex justify-content-end mb-3 flex-wrap gap-2">
          <Button style={langButtonStyle(printLanguage === 'en')} onClick={() => setPrintLanguage('en')} size="sm">English</Button>
          <Button style={langButtonStyle(printLanguage === 'ar')} onClick={() => setPrintLanguage('ar')} size="sm">العربية</Button>
          <Button style={langButtonStyle(printLanguage === 'both')} onClick={() => setPrintLanguage('both')} size="sm">
            <div>English</div>
            <div>العربية</div>
          </Button>
        </div>

        {/* Page Title */}
        <h1 className="mb-3" style={{ fontSize: '24px', fontWeight: '600' }}>
          {t('settings')}
        </h1>
        <p className="mb-4 text-muted">{t('manageSettings')}</p>

        {/* Tabs: Company & Invoice Settings */}
        <Tab.Container defaultActiveKey="company">
      <Nav variant="tabs" className="mb-4">
  <Nav.Item>
    <Nav.Link
      eventKey="company"
      className="d-flex align-items-center gap-2 p-2"
      style={{ fontWeight: '500' }}
    >
      <FaBuilding className="fs-5" />
      <span>{t('companySettings')}</span>
    </Nav.Link>
  </Nav.Item>

  <Nav.Item>
    <Nav.Link
      eventKey="invoice"
      className="d-flex align-items-center gap-2 p-2"
      style={{ fontWeight: '500' }}
    >
      <FaFileInvoice className="fs-5" />
      <span>{t('invoiceSettings')}</span>
    </Nav.Link>
  </Nav.Item>
</Nav>


          <Tab.Content>
            {/* === COMPANY SETTINGS === */}
            <Tab.Pane eventKey="company">
              <div className="bg-white p-4 rounded shadow-sm">
                <h2 className="mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>
                  {t('companyInformation')}
                </h2>

                <Form.Group className="mb-4">
                  <Form.Control
                    type="text"
                    placeholder={t('companyName')}
                    className="mb-3"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                  <Form.Control
                    type="email"
                    placeholder={t('companyEmail')}
                    className="mb-3"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                  />
                  <Form.Control
                    type="tel"
                    placeholder={t('phoneNumber')}
                    className="mb-3"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </Form.Group>

                <hr className="my-4" />

                <div className="d-flex align-items-center mb-3">
                  <FaImage className="me-2" style={{ color: '#002d4d' }} />
                  <h5 style={{ marginBottom: 0 }}>{t('companyImages')}</h5>
                </div>

                {["companyIcon", "favicon", "companyLogo", "companyDarkLogo"].map((field) => (
                  <Form.Group className="mb-4" key={field}>
                    <Form.Label className="fw-bold d-block mb-2">{t(field)}</Form.Label>
                    <div className="d-flex align-items-center">
                      <Button as="label" htmlFor={`${field}-upload`} style={uploadButtonStyle}>
                        {t('chooseFile')}
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
                      {t('uploadInstruction').replace('{field}', t(field).toLowerCase())}
                    </Form.Text>
                  </Form.Group>
                ))}

                <hr className="my-4" />

                <div className="d-flex align-items-center mb-3">
                  <FaMapMarkerAlt className="me-2" style={{ color: '#002d4d' }} />
                  <h5 style={{ marginBottom: 0 }}>{t('addressInformation')}</h5>
                </div>

                <Form.Group className="mb-4">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={t('address')}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <Form.Label className="fw-bold">{t('country')}</Form.Label>
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
                    <Form.Label className="fw-bold">{t('city')}</Form.Label>
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
                    <Form.Label className="fw-bold">{t('state')}</Form.Label>
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
                    <Form.Label className="fw-bold">{t('portalCode')}</Form.Label>
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
                    <Form.Label className="fw-bold">
                      {printLanguage === 'both' ? (
                        <>
                          <div>Currency *</div>
                          <div>العملة *</div>
                        </>
                      ) : printLanguage === 'ar' ? 'العملة *' : 'Currency *'}
                    </Form.Label>
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
                  <Button variant="outline-secondary" className="me-3 px-4 py-2">
                    {t('cancel')}
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
                  >
                    {t('saveChanges')}
                  </Button>
                </div>
              </div>
            </Tab.Pane>

            {/* === INVOICE SETTINGS === */}
            <Tab.Pane eventKey="invoice">
              <div className="p-4 card">
                <h2 className="mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>
                  {t('invoiceSettings')}
                </h2>

            

           

                {/* Footer Fields */}
                <Form.Group className="mb-4 mt-4">
                  <Form.Label className="fw-bold">{t('footerText')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="footerTerms"
                    value={formData.footerTerms}
                    onChange={handleChange}
                    placeholder={t('termsConditions')}
                    className="mb-2"
                  />
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="footerNote"
                    value={formData.footerNote}
                    onChange={handleChange}
                    placeholder={t('note')}
                    className="mb-2"
                  />
                  <Form.Label className="fw-bold">{t('bankDetails')}</Form.Label>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <Form.Control
                        type="text"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleChange}
                        placeholder="Bank Name"
                      />
                    </div>
                    <div className="col-md-6">
                      <Form.Control
                        type="text"
                        name="account_no"
                        value={formData.account_no}
                        onChange={handleChange}
                        placeholder="Account No."
                      />
                    </div>
                    <div className="col-md-6">
                      <Form.Control
                        type="text"
                        name="account_holder"
                        value={formData.account_holder}
                        onChange={handleChange}
                        placeholder="Account Holder"
                      />
                    </div>
                    <div className="col-md-6">
                      <Form.Control
                        type="text"
                        name="ifsc_code"
                        value={formData.ifsc_code}
                        onChange={handleChange}
                        placeholder="IFSC Code"
                      />
                    </div>
                  </div>
                </Form.Group>

               

                {/* Currency Subunit Info */}
                {formData.currency && (
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      {printLanguage === 'both' ? (
                        <>
                          <div>Currency Format</div>
                          <div>تنسيق العملة</div>
                        </>
                      ) : printLanguage === 'ar' ? 'تنسيق العملة' : 'Currency Format'}
                    </Form.Label>
                    <div className="alert alert-info mb-0">
                      {printLanguage === 'ar'
                        ? `العملة: ${getSubunitLabels(formData.currency).major}، الوحدة الفرعية: ${getSubunitLabels(formData.currency).minor}`
                        : `Major Unit: ${getSubunitLabels(formData.currency).major}, Minor Unit: ${getSubunitLabels(formData.currency).minor}`}
                    </div>
                  </Form.Group>
                )}

                <div className="d-flex justify-content-end mt-4">
                  <Button variant="outline-secondary" className="me-3 px-4 py-2">
                    {t('cancel')}
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
                  >
                    {t('saveSettings')}
                  </Button>
                </div>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>

      <p className="text-muted text-center mt-3">
        {typeof t('pageDescription') === 'object'
          ? 'Manage your company and invoice settings in both languages.'
          : t('pageDescription')}
      </p>
    </div>
  );
};

export default CompanyInfo;