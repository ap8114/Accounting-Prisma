import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Dropdown, Spinner, Alert } from 'react-bootstrap';
import axiosInstance from '../../../Api/axiosInstance';
import GetCompanyId from '../../../Api/GetCompanyId';

const ContraVoucher = () => {
  const [autoVoucherNo, setAutoVoucherNo] = useState('');
  const [manualVoucherNo, setManualVoucherNo] = useState('');
  const [voucherDate, setVoucherDate] = useState('2025-08-23');
  const [accountFrom, setAccountFrom] = useState('');
  const [accountTo, setAccountTo] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState([]); // Store fetched accounts
  const [fetchError, setFetchError] = useState('');

  const companyId = GetCompanyId();

  const accountFromRef = useRef(null);
  const accountToRef = useRef(null);

  // Generate auto voucher number
  useEffect(() => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    setAutoVoucherNo(`CON-${timestamp}-${randomNum}`);
  }, []);

  useEffect(() => {
  if (!companyId) {
    setFetchError('Company ID not found.');
    return;
  }

  const fetchAccounts = async () => {
    try {
      const response = await axiosInstance.get(`account/getAccountByCompany/${companyId}`);
      
      // 👇 Handle different possible response structures
      let accountsArray = [];

      if (Array.isArray(response.data)) {
        // Case 1: Direct array → [{}, {}]
        accountsArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Case 2: { data: [{}, {}] }
        accountsArray = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Case 3: Try to find first array property (fallback)
        const firstArray = Object.values(response.data).find(val => Array.isArray(val));
        if (firstArray) accountsArray = firstArray;
      }

      // Extract account names
      const accountList = accountsArray
        .map(item => item.account_name || item.name || '')
        .filter(name => typeof name === 'string' && name.trim() !== '');

      setAccounts(accountList);

      // Set defaults only if not already selected
      if (!accountFrom && accountList.length > 0) setAccountFrom(accountList[0]);
      if (!accountTo && accountList.length > 1) setAccountTo(accountList[1]);

      if (accountList.length === 0) {
        setFetchError('No accounts found for this company.');
      }
    } catch (err) {
      console.error('API Error:', err);
      const msg = err.response?.data?.message || 'Failed to load accounts. Please try again.';
      setFetchError(msg);
    }
  };

  fetchAccounts();
}, [companyId]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountFromRef.current && !accountFromRef.current.contains(event.target)) {
        document.getElementById('accountFromDropdown')?.classList.remove('show');
      }
      if (accountToRef.current && !accountToRef.current.contains(event.target)) {
        document.getElementById('accountToDropdown')?.classList.remove('show');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (dropdownId) => {
    const dropdown = document.getElementById(dropdownId);
    dropdown?.classList.toggle('show');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      setLoading(false);
      return;
    }

    if (accountFrom === accountTo) {
      setError('Account From and Account To cannot be the same.');
      setLoading(false);
      return;
    }

    if (!accountFrom || !accountTo) {
      setError('Please select both accounts.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('voucher_no', manualVoucherNo || autoVoucherNo);
    formData.append('voucher_date', voucherDate);
    formData.append('account_from', accountFrom);
    formData.append('account_to', accountTo);
    formData.append('amount', amount);
    formData.append('narration', narration);
    formData.append('company_id', companyId);

    if (uploadedFile) {
      formData.append('document', uploadedFile);
    }

    try {
      await axiosInstance.post('contraVouchers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Contra Voucher created successfully!');
      // Optional: Reset form
    } catch (err) {
      console.error('API Error:', err);
      const msg = err.response?.data?.message || 'Failed to create contra voucher. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-3'>
      <Container className='card p-4'>
        <h2 className="mb-4 text-center mt-2" style={{ color: '#2c3e50' }}>Contra Voucher</h2>

        {fetchError && <Alert variant="warning">{fetchError}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Voucher No (Auto)</Form.Label>
                <Form.Control
                  type="text"
                  value={autoVoucherNo}
                  readOnly
                  className="mb-2"
                />
                <Form.Label>Voucher No (Manual)</Form.Label>
                <Form.Control
                  type="text"
                  value={manualVoucherNo}
                  onChange={(e) => setManualVoucherNo(e.target.value)}
                  placeholder="Enter manual voucher no"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Voucher Date</Form.Label>
                <Form.Control
                  type="date"
                  value={voucherDate}
                  onChange={(e) => setVoucherDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group ref={accountFromRef}>
                <Form.Label>Account From</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={accountFrom}
                    onChange={(e) => setAccountFrom(e.target.value)}
                    onClick={() => toggleDropdown('accountFromDropdown')}
                    placeholder="Select account..."
                    required
                  />
                  <div
                    id="accountFromDropdown"
                    className="dropdown-menu position-absolute w-100"
                    style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {accounts.length > 0 ? (
                      accounts.map((opt, idx) => (
                        <Dropdown.Item
                          key={idx}
                          onClick={() => {
                            setAccountFrom(opt);
                            document.getElementById('accountFromDropdown')?.classList.remove('show');
                          }}
                        >
                          {opt}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No accounts found</Dropdown.Item>
                    )}
                  </div>
                </div>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group ref={accountToRef}>
                <Form.Label>Account To</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={accountTo}
                    onChange={(e) => setAccountTo(e.target.value)}
                    onClick={() => toggleDropdown('accountToDropdown')}
                    placeholder="Select account..."
                    required
                  />
                  <div
                    id="accountToDropdown"
                    className="dropdown-menu position-absolute w-100"
                    style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {accounts.length > 0 ? (
                      accounts.map((opt, idx) => (
                        <Dropdown.Item
                          key={idx}
                          onClick={() => {
                            setAccountTo(opt);
                            document.getElementById('accountToDropdown')?.classList.remove('show');
                          }}
                        >
                          {opt}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No accounts found</Dropdown.Item>
                    )}
                  </div>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                  min="0.01"
                  step="0.01"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Upload Document</Form.Label>
                <Form.Control type="file" onChange={handleFileUpload} />
                {uploadedFile && (
                  <div className="mt-2">
                    <small>Selected file: {uploadedFile.name}</small>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  Narration <span style={{ fontSize: '12px', color: '#888' }}>(Optional)</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="Enter details about the transaction..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col className="text-center">
              <Button
                variant="primary"
                type="submit"
                disabled={loading || accounts.length === 0}
                size="sm"
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default ContraVoucher;