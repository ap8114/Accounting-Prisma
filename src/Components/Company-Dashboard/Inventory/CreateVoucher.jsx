// 📄 File Name: CreateVoucher.js
import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Table, Modal, Row, Col, Spinner, InputGroup, FormControl, Dropdown } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash, FaSignature, FaCamera, FaTimes, FaSearch, FaChevronDown } from "react-icons/fa";
import SignatureCanvas from "react-signature-canvas";
import AddProductModal from "./AddProductModal";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

// ✅ Constants
const VOUCHER_TYPES = [
  "Expense", "Income", "Contra", "Journal", "Credit Note", "Debit Note",
  "Opening Balance", "Current balance", "Closing balance", "Sales", "Purchase", "Delivery challans"
];

// ✅ Initial Form Data
const initialFormData = {
  date: new Date().toISOString().split('T')[0],
  partyName: "",
  customerVendor: "",
  voucherNo: "INV0001",
  receiptNo: "",
  paymentMode: "",
  items: [{ description: "", rate: 0, quantity: 1, amount: 0, productId: null }],
  note: "",
  reference: "",
  billNo: "",
  signature: null,
  photo: null,
  partyEmail: "",
  partyAddress: "",
  partyPhone: "",
  customerEmail: "",
  customerAddress: "",
  customerPhone: "",
  logo: null,
  attachments: [],
  isGST: false,
  gstRate: 18,
  isTax: false,
  taxRate: 5,
  discount: 0,
  discountAccount: "",
  companyName: "Your Company Name",
  fromAccount: "",
  toAccount: "",
  accountType: "",
  accountName: "",
  accountNameSearch: "",
  currentBalance: 0,
  closingBalance: 0,
  openingBalance: 0,
  deliveryAddress: "",
  transferAmount: 0,
};

// 🔁 Map local form to API payload (for POST/PATCH)
const mapLocalToApiPayload = (localVoucher, companyId, vendors, customers, accounts) => {
  const formData = new FormData();
  formData.append('company_id', companyId);
  formData.append('voucher_type', localVoucher.voucherType);
  formData.append('voucher_number', localVoucher.voucherNo);
  formData.append('receipt_number', localVoucher.receiptNo || "");
  formData.append('date', localVoucher.date);
  formData.append('notes', localVoucher.note || "");

  let fromAccountId = "";
  let toAccountId = "";
  let vendorId = "";
  let customerId = "";
  let transferAmount = 0;
  let fromName = localVoucher.partyName || "";
  let fromEmail = localVoucher.partyEmail || "";
  let fromPhone = localVoucher.partyPhone || "";
  let fromAddress = localVoucher.partyAddress || "";
  let toName = localVoucher.customerVendor || "";

  if (localVoucher.voucherType === "Expense") {
    const fromAcc = accounts.find(acc => acc.account_name === localVoucher.fromAccount);
    const vendor = vendors.find(v => v.name_english === localVoucher.customerVendor);
    fromAccountId = fromAcc?.id || "";
    vendorId = vendor?.id || "";
  } else if (localVoucher.voucherType === "Income") {
    const fromAcc = accounts.find(acc => acc.account_name === localVoucher.fromAccount);
    const customer = customers.find(c => c.name_english === localVoucher.customerVendor);
    fromAccountId = fromAcc?.id || "";
    customerId = customer?.id || "";
  } else if (localVoucher.voucherType === "Contra") {
    const fromAcc = accounts.find(acc => acc.account_name === localVoucher.fromAccount);
    const toAcc = accounts.find(acc => acc.account_name === localVoucher.toAccount);
    fromAccountId = fromAcc?.id || "";
    toAccountId = toAcc?.id || "";
    transferAmount = localVoucher.transferAmount || 0;
  } else if (localVoucher.voucherType === "Purchase") {
    const fromAcc = accounts.find(acc => acc.account_name === localVoucher.fromAccount);
    const vendor = vendors.find(v => v.name_english === localVoucher.customerVendor);
    fromAccountId = fromAcc?.id || "";
    vendorId = vendor?.id || "";
  } else if (localVoucher.voucherType === "Sales") {
    const fromAcc = accounts.find(acc => acc.account_name === localVoucher.fromAccount);
    const customer = customers.find(c => c.name_english === localVoucher.customerVendor);
    fromAccountId = fromAcc?.id || "";
    customerId = customer?.id || "";
  }

  if (fromAccountId) formData.append('from_account', fromAccountId);
  if (toAccountId) formData.append('to_account', toAccountId);
  if (vendorId) formData.append('vendor_id', vendorId);
  if (customerId) formData.append('customer_id', customerId);
  if (transferAmount > 0) formData.append('transfer_amount', transferAmount);
  if (fromName) formData.append('from_name', fromName);
  if (fromEmail) formData.append('from_email', fromEmail);
  if (fromPhone) formData.append('from_phone', fromPhone);
  if (fromAddress) formData.append('from_address', fromAddress);
  if (toName) formData.append('to_name', toName);

  const isDataURL = (str) => str && typeof str === 'string' && str.startsWith('data:image');
  function dataURLtoBlob(dataurl) {
    try {
      if (!dataurl || !dataurl.startsWith('data:image')) {
        throw new Error('Not a valid data URL');
      }
      const arr = dataurl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) throw new Error('Invalid MIME type');
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      return null;
    }
  }

  if (localVoucher.logo && isDataURL(localVoucher.logo)) {
    const logoBlob = dataURLtoBlob(localVoucher.logo);
    formData.append('logo', logoBlob, 'logo.png');
  }
  if (localVoucher.signature && isDataURL(localVoucher.signature)) {
    const sigBlob = dataURLtoBlob(localVoucher.signature);
    formData.append('signature', sigBlob, 'signature.png');
  }
  if (localVoucher.photo && isDataURL(localVoucher.photo)) {
    const photoBlob = dataURLtoBlob(localVoucher.photo);
    formData.append('photos', photoBlob, 'photo.png');
  }

  localVoucher.attachments.forEach((attachment) => {
    if (attachment.data && isDataURL(attachment.data)) {
      const blob = dataURLtoBlob(attachment.data);
      if (attachment.type.startsWith("image/")) {
        formData.append('photos', blob, attachment.name);
      } else {
        formData.append('references', blob, attachment.name);
      }
    }
  });

  const itemsArray = localVoucher.items.map(item => ({
    item_name: item.description,
    description: item.description,
    hsn_code: item.hsn || "",
    tax_type: "GST",
    tax_rate: localVoucher.gstRate || 0,
    tax_amount: (item.rate * (item.quantity || 1) * (localVoucher.gstRate || 0)) / 100,
    rate: item.rate || 0,
    quantity: item.quantity || 1,
    amount: item.amount || 0,
    uom: item.uom || "PCS",
  }));

  formData.append('items', JSON.stringify(itemsArray));
  return formData;
};

// 🔁 Map API response to local format
const mapApiVoucherToLocal = (apiVoucher) => {
  const items = (apiVoucher.voucher_items || []).map(item => ({
    description: item.item_name || item.description || "",
    rate: parseFloat(item.rate) || 0,
    quantity: item.quantity ? parseFloat(item.quantity) : 1,
    amount: parseFloat(item.amount) || 0,
    hsn: item.hsn_code || "",
    tax: parseFloat(item.tax_rate) || 0,
    uom: "PCS",
    tax_amount: parseFloat(item.tax_amount) || 0,
    productId: item.product_id || null,
  }));

  const customerVendorName = 
    apiVoucher.vendor_name || 
    apiVoucher.customer_name || 
    apiVoucher.to_name || 
    "";

  const attachments = (apiVoucher.voucher_attachments || []).map(att => ({
    name: att.file_name || "attachment",
    type: att.file_type || "application/octet-stream",
    data: att.file_url?.trim() || "",
  }));

  const photo = attachments.length > 0 ? attachments[0].data : null;

  return {
    id: apiVoucher.id,
    voucherType: apiVoucher.voucher_type || "Sales",
    voucherNo: apiVoucher.voucher_number || "",
    receiptNo: apiVoucher.receipt_number || "",
    date: apiVoucher.date 
      ? new Date(apiVoucher.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    note: apiVoucher.notes || "",
    logo: apiVoucher.logo_url?.trim() || null,
    signature: apiVoucher.signature_url?.trim() || null,
    photo: photo,
    attachments: attachments,
    companyName: "Your Company Name",
    total: items.reduce((sum, i) => sum + i.amount, 0),
    status: apiVoucher.status || "Pending",
    partyName: apiVoucher.from_name || "",
    partyEmail: apiVoucher.from_email || "",
    partyPhone: apiVoucher.from_phone || "",
    partyAddress: apiVoucher.from_address || "",
    customerVendor: customerVendorName,
    fromAccount: apiVoucher.from_account_name || "",
    toAccount: apiVoucher.to_account_name || "",
    items,
    transferAmount: apiVoucher.transfer_amount ? parseFloat(apiVoucher.transfer_amount) : 0,
    from_account_id: apiVoucher.from_account,
    to_account_id: apiVoucher.to_account,
    customer_id: apiVoucher.customer_id,
    vendor_id: apiVoucher.vendor_id,
  };
};

// ✅ CreateVoucherModal
const CreateVoucherModal = ({ show, onHide, onSave, editData, companyId }) => {
  const [voucherType, setVoucherType] = useState(editData?.voucherType || "Expense");
  const [formData, setFormData] = useState(editData || initialFormData);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const pdfRef = useRef();
  const [printLanguage, setPrintLanguage] = useState("both");
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([
    "Electronics", "Furniture", "Apparel", "Food", "Books",
    "Automotive", "Medical", "Software", "Stationery", "Other",
  ]);
  const [newItem, setNewItem] = useState({
    name: '', category: '', hsn: '', tax: 0, sellingPrice: 0, uom: 'PCS'
  });

  // ✅ NEW: Product search states
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);

  const fetchDropdownData = async () => {
    if (!companyId) return;
    try {
      setLoadingVendors(true);
      const vendorRes = await axiosInstance.get(`/vendors/company/${companyId}`);
      setVendors(vendorRes.data.data || []);
      setLoadingCustomers(true);
      const customerRes = await axiosInstance.get(`/customers/company/${companyId}`);
      setCustomers(customerRes.data.data || []);
      setLoadingAccounts(true);
      const accountRes = await axiosInstance.get(`/account/company/${companyId}`);
      setAccounts(accountRes.data.data || []);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
        } finally {
      setLoadingVendors(false);
      setLoadingCustomers(false);
      setLoadingAccounts(false);
    }
  };

  // ✅ Fetch products (with optional search)
  const fetchProducts = async (searchTerm = "") => {
    if (!companyId) return;
    try {
      setLoadingProducts(true);
      const response = await axiosInstance.get(`/products/company/${companyId}`, {
        params: { search: searchTerm }
      });
      if (response.data.success && response.data.data) {
        setProducts(response.data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Debounced search handler
  useEffect(() => {
    if (productSearchTerm.trim() === "") {
      // If empty, still show all products on focus/click
      if (showProductDropdown && selectedProductIndex !== null) {
        fetchProducts("");
      }
      return;
    }

    const timer = setTimeout(() => {
      fetchProducts(productSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearchTerm, showProductDropdown, selectedProductIndex, companyId]);

  // Handle product selection
  const handleProductSelect = (product, index) => {
    const newItems = [...formData.items];
    newItems[index] = {
      description: product.item_name,
      rate: parseFloat(product.sale_price) || 0,
      quantity: 1,
      amount: parseFloat(product.sale_price) || 0,
      hsn: product.hsn || "",
      tax: 0,
      uom: "PCS",
      productId: product.id
    };
    setFormData({ ...formData, items: newItems });
    setShowProductDropdown(false);
    setProductSearchTerm("");
    setSelectedProductIndex(null);
  };

  useEffect(() => {
    fetchDropdownData();
  }, [companyId]);

  useEffect(() => {
    if (editData) {
      setVoucherType(editData.voucherType);
      setFormData(editData);
    } else {
      setVoucherType("Expense");
      setFormData(initialFormData);
    }
  }, [editData, show]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'rate' || field === 'quantity' ? (parseFloat(value) || 0) : value;
    if (field === 'rate' || field === 'quantity') {
      newItems[index].amount = newItems[index].rate * newItems[index].quantity;
    }
    setFormData({ ...formData, items: newItems });
  };

  const addNewItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", rate: 0, quantity: 1, amount: 0, productId: null }]
    });
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'sellingPrice' || name === 'tax' ? parseFloat(value) || 0 : value
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const toggleGST = () => setFormData(prev => ({ ...prev, isGST: !prev.isGST }));
  const toggleTax = () => setFormData(prev => ({ ...prev, isTax: !prev.isTax }));

  const calculateSubtotal = () => {
    let subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    if ((voucherType === "Expense" || voucherType === "Income") && formData.discount > 0) {
      subtotal -= (subtotal * formData.discount) / 100;
    }
    return subtotal;
  };

  const calculateGST = () => {
    const subtotal = calculateSubtotal();
    return formData.isGST && formData.gstRate ? (subtotal * formData.gstRate) / 100 : 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return formData.isTax && formData.taxRate ? (subtotal * formData.taxRate) / 100 : 0;
  };

  const totals = {
    subtotal: calculateSubtotal(),
    gst: calculateGST(),
    tax: calculateTax(),
    total: calculateSubtotal() + calculateGST() + calculateTax()
  };

  const handleSubmit = () => {
    if (!voucherType) return;
    if (voucherType === "Contra") {
      if (!formData.fromAccount || !formData.toAccount || !formData.transferAmount || formData.transferAmount <= 0) {
        alert("Please fill From Account, To Account, and Transfer Amount.");
        return;
      }
    }
    if (["Current balance", "Closing balance", "Opening Balance"].includes(voucherType)) {
      const balanceType = voucherType === "Current balance" ? "currentBalance"
        : voucherType === "Closing balance" ? "closingBalance" : "openingBalance";
      if (!formData.accountType || !formData.accountName || formData[balanceType] <= 0) {
        alert("Please fill Account Type, Account Name, and Balance.");
        return;
      }
    }
    const finalData = {
      voucherType,
      ...formData,
      subtotal: totals.subtotal,
      gstAmount: totals.gst,
      taxAmount: totals.tax,
      total: totals.total,
      status: "Pending"
    };
    onSave(finalData, vendors, customers, accounts)
      .then(() => {
        setFormData(initialFormData);
        setVoucherType("Expense");
        onHide();
      })
      .catch((error) => {
        console.error("Save failed in modal:", error);
      });
  };

  const handleSaveSignature = () => {
    if (sigCanvas.current) {
      const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      setFormData({ ...formData, signature: signatureData });
      setShowSignatureModal(false);
    }
  };

  const handleClearSignature = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  const handlePhotoUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, [field]: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (field) => {
    setFormData({ ...formData, [field]: null });
  };

  const handleRemoveAttachment = (index) => {
    const updated = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: updated });
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const readerPromises = files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ name: file.name, type: file.type, data: reader.result });
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readerPromises).then(newAttachments => {
      setFormData({ ...formData, attachments: [...formData.attachments, ...newAttachments] });
    });
  };

  const getHeaderTitle = () => {
    switch (voucherType) {
      case "Purchase": return "PURCHASE BILL";
      case "Expense": return "EXPENSE VOUCHER";
      case "Income": return "INCOME VOUCHER";
      case "Contra": return "CONTRA VOUCHER";
      default: return "VOUCHER";
    }
  };

  const getFromLabel = () => {
    switch (voucherType) {
      case "Expense": return "Paid From (Cash/Bank)";
      case "Income": return "Received Into (Cash/Bank)";
      case "Contra": return "From Account";
      default: return "From";
    }
  };

  const getToLabel = () => {
    switch (voucherType) {
      case "Expense": return "Paid To (Vendor)";
      case "Income": return "Received From (Customer)";
      case "Contra": return "To Account";
      default: return "To";
    }
  };

  const renderFromField = () => {
    if (["Contra", "Expense", "Income", "Sales", "Purchase"].includes(voucherType)) {
      return (
        <>
          {loadingAccounts ? <Spinner size="sm" /> : (
            <Form.Select name="fromAccount" value={formData.fromAccount} onChange={handleChange}>
              <option value="">Select Account</option>
              {accounts.map(acc => <option key={acc.id} value={acc.account_name}>{acc.account_name}</option>)}
            </Form.Select>
          )}
        </>
      );
    }
    return (
      <>
        <Form.Control name="partyName" value={formData.partyName} onChange={handleChange} placeholder="Company Name" />
        <Form.Control name="partyEmail" value={formData.partyEmail} onChange={handleChange} placeholder="Email" className="mt-2" />
        <Form.Control name="partyAddress" value={formData.partyAddress} onChange={handleChange} placeholder="Address" className="mt-2" />
        <Form.Control name="partyPhone" value={formData.partyPhone} onChange={handleChange} placeholder="Phone" className="mt-2" />
      </>
    );
  };

  const renderToField = () => {
    if (voucherType === "Contra") {
      return (
        <>
          {loadingAccounts ? <Spinner size="sm" /> : (
            <Form.Select name="toAccount" value={formData.toAccount} onChange={handleChange}>
              <option value="">Select To Account</option>
              {accounts.map(acc => <option key={acc.id} value={acc.account_name}>{acc.account_name}</option>)}
            </Form.Select>
          )}
        </>
      );
    }
    if (["Expense", "Purchase"].includes(voucherType)) {
      return (
        <>
          {loadingVendors ? <Spinner size="sm" /> : (
            <Form.Select name="customerVendor" value={formData.customerVendor} onChange={handleChange}>
              <option value="">Select Vendor</option>
              {vendors.map(v => <option key={v.id} value={v.name_english}>{v.name_english}</option>)}
            </Form.Select>
          )}
        </>
      );
    }
    if (["Income", "Sales"].includes(voucherType)) {
      return (
        <>
          {loadingCustomers ? <Spinner size="sm" /> : (
            <Form.Select name="customerVendor" value={formData.customerVendor} onChange={handleChange}>
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.name_english}>{c.name_english}</option>)}
            </Form.Select>
          )}
        </>
      );
    }
    return <Form.Control name="customerVendor" value={formData.customerVendor} onChange={handleChange} placeholder="Name" />;
  };

  const printLabels = {
    en: {
      salesInvoice: "SALES INVOICE",
      receipt: "RECEIPT",
      purchaseBill: "PURCHASE BILL",
      payment: "PAYMENT",
      expenseVoucher: "EXPENSE VOUCHER",
      incomeVoucher: "INCOME VOUCHER",
      contraVoucher: "CONTRA VOUCHER",
      journalVoucher: "JOURNAL VOUCHER",
      creditNote: "CREDIT NOTE",
      debitNote: "DEBIT NOTE",
      stockAdjustment: "STOCK/INVENTORY ADJUSTMENT",
      openingBalance: "OPENING BALANCE",
      from: "From",
      to: "To",
      voucherNo: "Voucher No",
      receiptNo: "Receipt No",
      date: "Date",
      product: "Product",
      rate: "Rate",
      qty: "Qty",
      amount: "Amount",
      subtotal: "Subtotal",
      gst: "GST",
      tax: "Tax",
      total: "Total",
      notes: "Notes",
      signature: "Signature",
      photo: "Photo",
      attachments: "Attachments",
      transferAmount: "Transfer Amount",
      receivedFrom: "Received From (Customer)",
      purchasedFrom: "Purchased From (Vendor)",
      paidTo: "Paid To (Vendor)",
      soldTo: "Sold To (Customer)",
      fromAccount: "From Account",
      toAccount: "To Account",
      companyName: "Company Name",
      paidFrom: "Paid From",
      paidTo: "Paid To",
      receivedFrom: "Received From",
      receivedInto: "Received Into"
    },
    ar: {
      salesInvoice: "فاتورة مبيعات",
      receipt: "إيصال",
      purchaseBill: "فاتورة شراء",
      payment: "دفع",
      expenseVoucher: "سند مصروفات",
      incomeVoucher: "سند إيرادات",
      contraVoucher: "سند مقاصة",
      journalVoucher: "سند يومية",
      creditNote: "إشعار دائن",
      debitNote: "إشارة مدين",
      stockAdjustment: "تسوية المخزون",
      openingBalance: "رصيد افتتاحي",
      from: "من",
      to: "إلى",
      voucherNo: "رقم السند",
      receiptNo: "رقم الإيصال",
      date: "التاريخ",
      product: "المنتج",
      rate: "السعر",
      qty: "الكمية",
      amount: "المبلغ",
      subtotal: "المجموع الفرعي",
      gst: "ضريبة القيمة المضافة",
      tax: "ضريبة",
      total: "المجموع",
      notes: "ملاحظات",
      signature: "التوقيع",
      photo: "صورة",
      attachments: "مرفقات",
      transferAmount: "مبلغ التحويل",
      receivedFrom: "مستلم من (العميل)",
      purchasedFrom: "مشترى من (المورد)",
      paidTo: "مدفوع ل (المورد)",
      soldTo: "مباع ل (العميل)",
      fromAccount: "من الحساب",
      toAccount: "إلى الحساب",
      companyName: "اسم الشركة",
      paidFrom: "دفع من",
      paidTo: "دفع إلى",
      receivedFrom: "مستلم من",
      receivedInto: "تم الاستلام في"
    }
  };

  const handlePrint = () => {
    const printContent = pdfRef.current;
    if (!printContent) {
      alert("No content to print!");
      return;
    }
    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write('<html><head><title>Print Voucher</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      .text-end { text-align: right; }
      .fw-bold { font-weight: bold; }
      hr { border: 2px solid #28a745; margin: 10px 0; }
      h2, h4, h5 { color: #28a745; }
      img { max-width: 100%; height: auto; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  };

  const getPrintLabel = (key) => {
    if (printLanguage === "both") {
      return (
        <>
          <div style={{ fontWeight: "bold" }}>{printLabels.ar[key]}</div>
          <div style={{ fontSize: "small", color: "#555" }}>{printLabels.en[key]}</div>
        </>
      );
    }
    return printLabels[printLanguage][key];
  };

  const getPrintHeaderTitle = () => {
    switch (voucherType) {
      case "Purchase": return printLanguage === "both" ? <>{printLabels.ar.purchaseBill}<br />{printLabels.en.purchaseBill}</> : printLabels[printLanguage].purchaseBill;
      case "Expense": return printLanguage === "both" ? <>{printLabels.ar.expenseVoucher}<br />{printLabels.en.expenseVoucher}</> : printLabels[printLanguage].expenseVoucher;
      case "Contra": return printLanguage === "both" ? <>{printLabels.ar.contraVoucher}<br />{printLabels.en.contraVoucher}</> : printLabels[printLanguage].contraVoucher;
      case "Income": return printLanguage === "both" ? <>{printLabels.ar.incomeVoucher}<br />{printLabels.en.incomeVoucher}</> : printLabels[printLanguage].incomeVoucher;
      default: return printLanguage === "both" ? <>سند<br />VOUCHER</> : printLanguage === "ar" ? "سند" : "VOUCHER";
    }
  };

  const getPrintFromLabel = () => {
    switch (voucherType) {
      case "Expense": return getPrintLabel("paidFrom");
      case "Income": return getPrintLabel("receivedInto");
      case "Contra": return getPrintLabel("fromAccount");
      default: return getPrintLabel("from");
    }
  };

  const getPrintToLabel = () => {
    switch (voucherType) {
      case "Expense": return getPrintLabel("paidTo");
      case "Income": return getPrintLabel("receivedFrom");
      case "Contra": return getPrintLabel("toAccount");
      default: return getPrintLabel("to");
    }
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      alert("Product name and category are required!");
      return;
    }
    const itemToAdd = {
      description: newItem.name,
      rate: parseFloat(newItem.sellingPrice) || 0,
      quantity: 1,
      amount: parseFloat(newItem.sellingPrice) || 0,
      hsn: newItem.hsn,
      tax: parseFloat(newItem.tax) || 0,
      uom: newItem.uom
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, itemToAdd] }));
    setNewItem({ name: '', category: '', hsn: '', tax: 0, sellingPrice: 0, uom: 'PCS' });
    setShowAdd(false);
  };

  const handleUpdateItem = () => setShowEdit(false);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setNewItem(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
    }
    setShowAddCategoryModal(false);
  };

  // ✅ Render product search field with immediate dropdown on click
  const renderProductSearchField = (index) => {
    return (
      <div className="position-relative">
        <InputGroup>
          <FormControl
            placeholder="Search and select a product..."
            value={productSearchTerm}
            onChange={(e) => {
              setProductSearchTerm(e.target.value);
              setSelectedProductIndex(index);
              setShowProductDropdown(true);
            }}
            onClick={() => {
              setSelectedProductIndex(index);
              setShowProductDropdown(true);
              if (products.length === 0) {
                fetchProducts(""); // Load all products on first click
              }
            }}
            onFocus={() => {
              setSelectedProductIndex(index);
              setShowProductDropdown(true);
              if (products.length === 0) {
                fetchProducts("");
              }
            }}
          />
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
        </InputGroup>

        {showProductDropdown && selectedProductIndex === index && (
          <div
            className="position-absolute w-100 mt-1 shadow-sm bg-white border rounded-1"
            style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur on scroll/click
          >
            {loadingProducts ? (
              <div className="p-3 text-center">
                <Spinner as="span" animation="border" size="sm" />
                <span className="ms-2">Loading products...</span>
              </div>
            ) : products.length > 0 ? (
              products.map(product => (
                <div
                  key={product.id}
                  className="p-3 border-bottom"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleProductSelect(product, index)}
                >
                  <div className="fw-bold">{product.item_name}</div>
                  <div className="small text-muted">
                    {product.item_category?.item_category_name} • ₹{parseFloat(product.sale_price).toFixed(2)}
                  </div>
                  {product.description && (
                    <div className="small text-truncate">{product.description}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-muted">
                No products found
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProductSection = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
        <h6 className="fw-bold">PRODUCT DETAILS</h6>
        <Button size="sm" onClick={() => setShowAdd(true)} style={{ backgroundColor: "#53b2a5", border: "none", padding: "6px 12px", fontWeight: "500" }}>
          + Add Product
        </Button>
      </div>
      <Table bordered className="mb-3">
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>RATE</th>
            <th>QTY</th>
            <th>AMOUNT</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {formData.items.map((item, index) => (
            <tr key={index}>
              <td>
                {renderProductSearchField(index)}
                <Form.Control 
                  value={item.description} 
                  onChange={e => handleItemChange(index, "description", e.target.value)} 
                  placeholder="Enter product name" 
                  className="mt-2"
                />
              </td>
              <td><Form.Control type="number" value={item.rate} onChange={e => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)} placeholder="Rate" /></td>
              <td><Form.Control type="number" value={item.quantity} onChange={e => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)} placeholder="Qty" /></td>
              <td>₹{item.amount.toFixed(2)}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => removeItem(index)} disabled={formData.items.length <= 1}><FaTimes /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button variant="outline-primary" size="sm" className="mb-4" onClick={addNewItem}>+ Add Item</Button>
    </>
  );

  const renderCustomForm = () => {
    if (voucherType === "Contra") {
      return (
        <div className="border p-4 mb-4 bg-light">
          <h6 className="fw-bold mb-3">Contra Voucher Details</h6>
          <Form.Group className="mb-3"><Form.Label>From Account</Form.Label>{renderFromField()}</Form.Group>
          <Form.Group className="mb-3"><Form.Label>To Account</Form.Label>{renderToField()}</Form.Group>
          <Form.Group className="mb-3"><Form.Label>Transfer Amount (₹)</Form.Label><Form.Control type="number" name="transferAmount" value={formData.transferAmount} onChange={handleChange} placeholder="Enter amount" min="0" step="0.01" /></Form.Group>
          {renderProductSection()}
        </div>
      );
    }
    if (["Current balance", "Closing balance", "Opening Balance"].includes(voucherType)) {
      const balanceType = voucherType === "Current balance" ? "currentBalance"
        : voucherType === "Closing balance" ? "closingBalance" : "openingBalance";
      const label = voucherType === "Current balance" ? "Current Balance"
        : voucherType === "Closing balance" ? "Closing Balance" : "Opening Balance";
      return (
        <div className="border p-4 mb-4 bg-light">
          <h6 className="fw-bold mb-3">{label} Entry</h6>
          <Form.Group className="mb-3">
            <Form.Label>Account Type *</Form.Label>
            <Form.Select value={formData.accountType} onChange={e => setFormData({ ...formData, accountType: e.target.value })}>
              <option value="">Select Type</option>
              {Object.keys(accountTypeToNames).map(type => <option key={type} value={type}>{type}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3 position-relative">
            <Form.Label>Account Name *</Form.Label>
            <Form.Control type="text" placeholder="Search or type account name..." value={formData.accountNameSearch} onChange={e => setFormData({ ...formData, accountNameSearch: e.target.value })} />
            {formData.accountNameSearch && accountTypeToNames[formData.accountType]?.filter(name => name.toLowerCase().includes(formData.accountNameSearch.toLowerCase())).length > 0 && (
              <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, maxHeight: "150px", overflowY: "auto", listStyle: "none", padding: 0, margin: 0, border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#fff", zIndex: 100 }}>
                {accountTypeToNames[formData.accountType].filter(name => name.toLowerCase().includes(formData.accountNameSearch.toLowerCase())).map(name => (
                  <li key={name} className="list-group-item list-group-item-action" style={{ fontSize: "14px", padding: "6px 12px", cursor: "pointer" }} onClick={() => setFormData({ ...formData, accountName: name, accountNameSearch: name })} onMouseDown={e => e.preventDefault()}>{name}</li>
                ))}
              </ul>
            )}
            <input type="hidden" name="accountName" value={formData.accountName || ""} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{label} (₹) *</Form.Label>
            <Form.Control type="number" step="0.01" min="0" value={formData[balanceType]} onChange={e => setFormData({ ...formData, [balanceType]: parseFloat(e.target.value) || 0 })} required />
          </Form.Group>
          {renderProductSection()}
        </div>
      );
    }
    if (voucherType === "Sales") {
      return (
        <div className="border p-4 mb-4 bg-light">
          <h6 className="fw-bold mb-3">Sales Invoice</h6>
          <Form.Group className="mb-3">
            <Form.Label>Customer *</Form.Label>
            {loadingCustomers ? <Spinner size="sm" /> : (
              <Form.Select name="partyName" value={formData.partyName} onChange={handleChange}>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.name_english}>{c.name_english}</option>)}
              </Form.Select>
            )}
          </Form.Group>
          {renderProductSection()}
        </div>
      );
    }
    return renderProductSection();
  };

  const accountTypeToNames = {
    "Direct Income": ["Sales", "Service Revenue", "Commission Income"],
    "Indirect Income": ["Interest Income", "Dividend Income", "Rent Received"],
    "Asset": ["Cash", "Bank", "Inventory", "Furniture", "Machinery"],
    "Liability": ["Loan", "Creditors", "Outstanding Expenses"],
    "Equity": ["Capital", "Retained Earnings"],
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.position-relative')) {
        setShowProductDropdown(false);
        setSelectedProductIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{editData ? "Edit Voucher" : "Create Voucher"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div ref={pdfRef} style={{ display: 'none' }} dir={printLanguage === "ar" || printLanguage === "both" ? "rtl" : "ltr"}>
              <div className="text-center mb-4">
                {formData.logo && <img src={formData.logo} alt="Logo" style={{ width: '150px', height: '100px', objectFit: 'contain' }} />}
                <h2 style={{ color: '#28a745' }}>{getPrintHeaderTitle()}</h2>
                <hr style={{ border: '2px solid #28a745', margin: '10px 0' }} />
                <h4>{formData.companyName}</h4>
              </div>
              <Row className="mb-5">
                <Col md={6}>
                  <h6 className="fw-bold">{getPrintFromLabel()}</h6>
                  {voucherType === "Contra" ? <p><strong>{formData.fromAccount}</strong></p> : (
                    <>
                      <p><strong>{formData.partyName}</strong></p>
                      {voucherType !== "Sales" && (
                        <>
                          <p>{formData.partyEmail}</p>
                          <p>{formData.partyAddress}</p>
                          <p>{formData.partyPhone}</p>
                        </>
                      )}
                    </>
                  )}
                </Col>
                <Col md={6}>
                  <h6 className="fw-bold">{getPrintToLabel()}</h6>
                  {voucherType === "Contra" ? <p><strong>{formData.toAccount}</strong></p> : (
                    <>
                      <p><strong>{formData.customerVendor}</strong></p>
                      <p>{formData.customerEmail}</p>
                      <p>{formData.customerAddress}</p>
                      <p>{formData.customerPhone}</p>
                    </>
                  )}
                </Col>
              </Row>
              <Row className="mb-4">
                <Col md={6}>
                  <p><strong>{getPrintLabel("voucherNo")}:</strong> {formData.voucherNo}</p>
                  {voucherType === "Receipt" && formData.receiptNo && <p><strong>{getPrintLabel("receiptNo")}:</strong> {formData.receiptNo}</p>}
                </Col>
                <Col md={6}>
                  <p><strong>{getPrintLabel("date")}:</strong> {formData.date}</p>
                </Col>
              </Row>
              {voucherType === "Contra" ? (
                <p><strong>{getPrintLabel("transferAmount")}:</strong> ₹{formData.transferAmount.toFixed(2)}</p>
              ) : (
                <Table bordered className="mb-4">
                  <thead>
                    <tr>
                      <th>{getPrintLabel("product")}</th>
                      <th>{getPrintLabel("rate")}</th>
                      <th>{getPrintLabel("qty")}</th>
                      <th>{getPrintLabel("amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.description}</td>
                        <td>₹{item.rate.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              {voucherType !== "Contra" && (
                <Row className="mb-4">
                  <Col md={{ span: 4, offset: 8 }}>
                    <Table borderless>
                      <tbody>
                        <tr><td className="fw-bold">{getPrintLabel("subtotal")}</td><td className="text-end">₹{totals.subtotal.toFixed(2)}</td></tr>
                        {formData.isGST && <tr><td>{getPrintLabel("gst")} ({formData.gstRate}%)</td><td className="text-end">₹{totals.gst.toFixed(2)}</td></tr>}
                        {formData.isTax && <tr><td>{getPrintLabel("tax")} ({formData.taxRate}%)</td><td className="text-end">₹{totals.tax.toFixed(2)}</td></tr>}
                        <tr><td className="fw-bold">{getPrintLabel("total")}</td><td className="text-end">₹{totals.total.toFixed(2)}</td></tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              )}
              {formData.note && <div className="mb-4"><h6>{getPrintLabel("notes")}:</h6><p>{formData.note}</p></div>}
              {formData.signature && <div className="mb-4"><h6>{getPrintLabel("signature")}:</h6><img src={formData.signature} alt="Signature" style={{ width: "200px", height: "80px" }} /></div>}
              {formData.photo && <div className="mb-4"><h6>{getPrintLabel("photo")}:</h6><img src={formData.photo} alt="Voucher Photo" style={{ width: "300px", height: "auto" }} /></div>}
              {formData.attachments.length > 0 && (
                <div className="mb-4">
                  <h6>{getPrintLabel("attachments")}:</h6>
                  {formData.attachments.map((file, idx) => <div key={idx}><a href={file.data} target="_blank" rel="noreferrer">{file.name}</a></div>)}
                </div>
              )}
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Voucher Type</Form.Label>
              <Form.Select value={voucherType} onChange={e => setVoucherType(e.target.value)}>
                <option value="">Select Type</option>
                {VOUCHER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Enter Company Name" />
                </Form.Group>
              </div>
              <div className="text-end">
                {formData.logo ? (
                  <div className="position-relative">
                    <img src={formData.logo} alt="Logo" style={{ width: '150px', height: '100px', objectFit: 'contain' }} className="border p-1" />
                    <Button variant="danger" size="sm" className="position-absolute top-0 end-0 translate-middle" onClick={() => handleRemovePhoto('logo')}><FaTimes /></Button>
                  </div>
                ) : (
                  <div onClick={() => logoInputRef.current.click()} style={{ width: "250px", height: "150px", cursor: "pointer", border: "1px dashed #ccc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span>LOGO</span>
                    <small className="text-muted">Click to upload</small>
                    <input type="file" ref={logoInputRef} onChange={e => handlePhotoUpload(e, 'logo')} accept="image/*" style={{ display: "none" }} />
                  </div>
                )}
              </div>
            </div>

            <Row className="mb-5">
              <Col md={6}>
                <h6 className="fw-bold mb-3 text-dark">{getFromLabel()}</h6>
                {renderFromField()}
              </Col>
              <Col md={6}>
                <h6 className="fw-bold mb-3 text-dark">{getToLabel()}</h6>
                {renderToField()}
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{voucherType === "Receipt" ? "Receipt Number" : "Voucher Number"}</Form.Label>
                  <Form.Control name="voucherNo" value={formData.voucherNo} onChange={handleChange} placeholder="VOUCH-001" />
                </Form.Group>
                {voucherType === "Receipt" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Voucher Number</Form.Label>
                    <Form.Control name="receiptNo" value={formData.receiptNo} onChange={handleChange} placeholder="VOUCH-001" />
                  </Form.Group>
                )}
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            {renderCustomForm()}

            {voucherType !== "Contra" && (
              <Row className="mb-4">
                <Col md={{ span: 4, offset: 8 }}>
                  <Table borderless>
                    <tbody>
                      <tr><td className="fw-bold">Subtotal</td><td className="text-end">₹{totals.subtotal.toFixed(2)}</td></tr>
                      {formData.isGST && <tr><td>GST ({formData.gstRate}%)</td><td className="text-end">₹{totals.gst.toFixed(2)}</td></tr>}
                      {formData.isTax && <tr><td>Tax ({formData.taxRate}%)</td><td className="text-end">₹{totals.tax.toFixed(2)}</td></tr>}
                      <tr><td className="fw-bold">Total</td><td className="text-end">₹{totals.total.toFixed(2)}</td></tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            )}

            <Form.Group className="mb-4">
              <Form.Control as="textarea" rows={3} placeholder="Notes" name="note" value={formData.note} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="d-flex align-items-center gap-3">
                {formData.signature ? (
                  <>
                    <div className="border p-2" style={{ width: "200px", height: "80px" }}>
                      <img src={formData.signature} alt="Signature" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={() => setFormData({ ...formData, signature: null })}><FaTimes /> Remove</Button>
                  </>
                ) : (
                  <Button style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }} size="sm" onClick={() => setShowSignatureModal(true)}><FaSignature /> Add Signature</Button>
                )}
              </div>
            </Form.Group>

            <h6 className="fw-bold mb-3 border-bottom pb-2">Photos</h6>
            <Form.Group className="mb-4">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                {formData.photo ? (
                  <>
                    <div className="border p-2" style={{ width: "200px", height: "150px" }}>
                      <img src={formData.photo} alt="Attached" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={() => handleRemovePhoto('photo')}><FaTimes /> Remove</Button>
                  </>
                ) : (
                  <Button style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }} size="sm" onClick={() => fileInputRef.current.click()}><FaCamera /> Add Photo</Button>
                )}
                <input type="file" ref={fileInputRef} onChange={e => handlePhotoUpload(e, 'photo')} accept="image/*" style={{ display: "none" }} />
              </div>
            </Form.Group>

            <h6 className="fw-bold mb-3 border-bottom pb-2">Reference Documents</h6>
            <Form.Group className="mb-4">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                {formData.attachments && formData.attachments.length > 0 ? (
                  formData.attachments.map((file, index) => (
                    <div key={index} className="border p-2 position-relative" style={{ width: "400px" }}>
                      <div className="d-flex align-items-center">
                        <span className="text-truncate" style={{ maxWidth: "400px" }} title={file.name}>{file.name}</span>
                        <Button variant="danger" size="sm" className="ms-2" onClick={() => handleRemoveAttachment(index)}><FaTimes /></Button>
                      </div>
                      {file.type.startsWith("image/") && (
                        <div className="mt-2">
                          <img src={file.data} alt="attachment" style={{ width: "100%", maxHeight: "100px", objectFit: "cover" }} />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <Button style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }} size="sm" onClick={() => attachmentInputRef.current.click()}>📎 Add File</Button>
                )}
                <input type="file" ref={attachmentInputRef} onChange={handleAttachmentUpload} accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple style={{ display: "none" }} />
              </div>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="d-flex gap-2">
                <Button variant={printLanguage === "en" ? "primary" : "outline-primary"} size="sm" onClick={() => setPrintLanguage("en")}>English</Button>
                <Button variant={printLanguage === "ar" ? "primary" : "outline-primary"} size="sm" onClick={() => setPrintLanguage("ar")}>العربية</Button>
                <Button variant={printLanguage === "both" ? "primary" : "outline-primary"} size="sm" onClick={() => setPrintLanguage("both")}>English + العربية</Button>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" className="rounded-pill" onClick={onHide}>Cancel</Button>
                <Button variant="outline-info" onClick={handlePrint}>🖨️ Print</Button>
                <Button style={{ backgroundColor: "#53b2a5", border: "none", borderRadius: "50px", fontWeight: 600 }} onClick={handleSubmit}>
                  {editData ? "Update Voucher" : "Save Voucher"}
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Body>

        <Modal show={showSignatureModal} onHide={() => setShowSignatureModal(false)} centered>
          <Modal.Header closeButton><Modal.Title>Add Signature</Modal.Title></Modal.Header>
          <Modal.Body>
            <div className="border" style={{ width: "100%", height: "200px" }}>
              <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{ width: "100%", height: "200px" }} />
            </div>
            <div className="d-flex justify-content-between mt-3">
              <Button variant="secondary" onClick={handleClearSignature}>Clear</Button>
              <Button style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }} onClick={handleSaveSignature}>Save Signature</Button>
            </div>
          </Modal.Body>
        </Modal>
      </Modal>

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
        handleChange={handleProductChange}
        handleAddItem={handleAddItem}
        handleUpdateItem={handleUpdateItem}
        handleAddCategory={handleAddCategory}
      />
    </>
  );
};

// VoucherViewModal
const VoucherViewModal = ({ show, onHide, voucher }) => {
  const pdfRef = useRef();
  if (!voucher) return <Modal show={show} onHide={onHide}><Modal.Body>No data</Modal.Body></Modal>;

  const subtotal = voucher.items.reduce((sum, item) => sum + item.amount, 0);
  const adjustedSubtotal = voucher.voucherType === "Expense" && voucher.discount > 0
    ? subtotal - (subtotal * voucher.discount) / 100
    : subtotal;
  const gstAmount = voucher.isGST ? (adjustedSubtotal * voucher.gstRate) / 100 : 0;
  const taxAmount = voucher.isTax ? (adjustedSubtotal * voucher.taxRate) / 100 : 0;
  const total = adjustedSubtotal + gstAmount + taxAmount;

  const handlePrint = () => {
    const printContent = pdfRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write('<html><head><title>Print</title><style>');
    printWindow.document.write(`body { font-family: Arial, sans-serif; margin: 20px; } table, img { max-width: 100%; }`);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton><Modal.Title>Voucher Details</Modal.Title></Modal.Header>
      <Modal.Body>
        <div ref={pdfRef} style={{ display: 'none' }}>
          <h2>{voucher.voucherType}</h2>
          <p><strong>From:</strong> {voucher.partyName || voucher.fromAccount}</p>
          <p><strong>To:</strong> {voucher.customerVendor || voucher.toAccount}</p>
          <p><strong>Voucher No:</strong> {voucher.voucherNo}</p>
          <p><strong>Date:</strong> {voucher.date}</p>
          {voucher.voucherType === "Contra" ? (
            <p><strong>Transfer Amount:</strong> ₹{voucher.transferAmount.toFixed(2)}</p>
          ) : (
            <Table bordered><tbody>{voucher.items.map((i, idx) => <tr key={idx}><td>{i.description}</td><td>₹{i.amount.toFixed(2)}</td></tr>)}</tbody></Table>
          )}
          <p><strong>Total:</strong> ₹{total.toFixed(2)}</p>
          {voucher.signature && <img src={voucher.signature} alt="sig" style={{ width: "200px" }} />}
        </div>

        <h4 className="fw-bold">{voucher.voucherType}</h4>
        <p><strong>From:</strong> {voucher.partyName || voucher.fromAccount || "N/A"}</p>
        <p><strong>To:</strong> {voucher.customerVendor || voucher.toAccount || "N/A"}</p>
        <p><strong>Voucher No:</strong> {voucher.voucherNo}</p>
        <p><strong>Date:</strong> {voucher.date}</p>
        {voucher.voucherType === "Contra" ? (
          <p><strong>Transfer Amount:</strong> ₹{voucher.transferAmount.toFixed(2)}</p>
        ) : (
          <Table bordered><tbody>{voucher.items.map((i, idx) => <tr key={idx}><td>{i.description}</td><td>₹{i.amount.toFixed(2)}</td></tr>)}</tbody></Table>
        )}
        <p><strong>Total:</strong> ₹{total.toFixed(2)}</p>
        {voucher.signature && <div><h6>Signature:</h6><img src={voucher.signature} alt="sig" style={{ maxWidth: "200px" }} /></div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-info" onClick={handlePrint}>🖨️ Print</Button>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

// 🔥 Main Component
const CreateVoucher = () => {
  const [showModal, setShowModal] = useState(false);
  const [editVoucher, setEditVoucher] = useState(null);
  const [viewVoucher, setViewVoucher] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const companyId = GetCompanyId();

  const fetchVouchers = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/voucher/company/${companyId}`);
      if (response.data.success) {
        const mapped = response.data.data.map(mapApiVoucherToLocal);
        setVouchers(mapped);
      } else {
        setVouchers([]);
      }
    } catch (error) {
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers(); 
  }, [companyId]);

  const handleSaveVoucher = async (voucher, vendors, customers, accounts) => {
    try {
      if (editVoucher !== null) {
        const voucherId = vouchers[editVoucher].id;
        const payload = mapLocalToApiPayload(voucher, companyId, vendors, customers, accounts);
        await axiosInstance.put(`/voucher/${voucherId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setVouchers(prev => {
          const updated = [...prev];
          updated[editVoucher] = { ...voucher, id: voucherId };
          return updated;
        });
        alert("Voucher updated successfully!");
      } else {
        const payload = mapLocalToApiPayload(voucher, companyId, vendors, customers, accounts);
        const res = await axiosInstance.post(`/voucher`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const newVoucher = {
          ...voucher,
          id: res.data.data?.id || Date.now(),
        };
        setVouchers(prev => [...prev, newVoucher]);
        alert("Voucher created successfully!");
      }
      setShowModal(false);
      setEditVoucher(null);
    } catch (error) {
      alert("Failed to save voucher. Please try again.");
    }
  };

  const handleDelete = async (idx) => {
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;
    try {
      const voucherId = vouchers[idx].id;
      await axiosInstance.delete(`/voucher/${voucherId}`);
      setVouchers(vouchers.filter((_, i) => i !== idx));
      alert("Voucher deleted successfully!");
    } catch (error) {
      alert("Failed to delete voucher.");
    }
  };

  const handleEdit = (idx) => {
    setEditVoucher(idx);
    setShowModal(true);
  };

  const handleView = (idx) => {
    setViewVoucher(vouchers[idx]);
    setShowViewModal(true);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Vouchers</h4>
        <Button
          style={{ backgroundColor: "#53b2a5", border: "none", borderRadius: "50px", fontWeight: 600 }}
          onClick={() => { setEditVoucher(null); setShowModal(true); }}
        >
          Create Voucher
        </Button>
      </div>
      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading vouchers...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table bordered hover responsive="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Date</th>
                <th>Customer/Vendor</th>
                <th>Voucher No</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers?.map((v, i) => (
                <tr key={v.id || i}>
                  <td>{i + 1}</td>
                  <td>{v.voucherType}</td>
                  <td>{v.date}</td>
                  <td>{v.customerVendor}</td>
                  <td>{v.voucherNo}</td>
                  <td>₹{v.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</td>
                  <td>
                    <button className="btn text-primary" onClick={() => handleView(i)} aria-label="View"><FaEye /></button>
                    <button className="btn text-success" onClick={() => handleEdit(i)} aria-label="Edit"><FaEdit /></button>
                    <button className="btn text-danger" onClick={() => handleDelete(i)} aria-label="Delete"><FaTrash /></button>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr><td colSpan="8" className="text-center">No vouchers found for your company</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      <CreateVoucherModal
        show={showModal}
        onHide={() => { setShowModal(false); setEditVoucher(null); }}
        onSave={handleSaveVoucher}
        editData={editVoucher !== null ? vouchers[editVoucher] : null}
        companyId={companyId}
      />

      <VoucherViewModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        voucher={viewVoucher}
      />
    </div>
  );
};

export default CreateVoucher;