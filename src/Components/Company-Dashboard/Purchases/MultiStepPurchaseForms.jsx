import React, { useState, useRef, useEffect } from 'react';
import { Tabs, Tab, Form, Button, Table, Row, Col, Modal, InputGroup, FormControl, Dropdown } from 'react-bootstrap';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import "../Sales/MultiStepSalesForm.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faEye, faEdit, faPlus, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import AddProductModal from '../Inventory/AddProductModal';
import GetCompanyId from '../../../Api/GetCompanyId';

const MultiStepPurchaseForm = ({ onSubmit, initialData, initialStep }) => {
  const companyId = GetCompanyId();
  const [key, setKey] = useState(initialStep || 'purchaseQuotation');
  const tabsWithItems = ['purchaseQuotation', 'purchaseOrder', 'goodsReceipt', 'bill'];
  const navigate = useNavigate();
  const formRef = useRef();
  const pdfRef = useRef();
  const generateDocNo = (prefix) => {
  const year = new Date().getFullYear().toString().slice(-2); // e.g. 24
  const key = `docNo_${prefix}`;
  const currentNo = localStorage.getItem(key) || "000";
  const nextNo = (parseInt(currentNo) + 1).toString().padStart(3, "0");
  const docNo = `${prefix}-${year}-${nextNo}`;
  localStorage.setItem(key, nextNo);
  return docNo;
};
  // --- Form Data State ---
  const [formData, setFormData] = useState(() => ({
    purchaseQuotation: {
      companyName: "",
    referenceId: '',         // Auto-generated
    manualRefNo: '',         // Optional manual input
    quotationNo: '',         // Auto-generated
    manualQuotationNo: '',   // Optional manual input
      manualRefNo: '',
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      quotationNo: "",
      quotationDate: "",
      validDate: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      items: [
        { name: '', qty: '', rate: '', tax: 0, discount: 0 } 
      ],
      bankName: "",
      accountNo: "",
      accountHolder: "",
      ifsc: "",
      notes: "",
      terms: "",
      signature: '',
      photo: '',
      files: []
    },
    purchaseOrder: {
     referenceId: '',
    manualRefNo: '',
    orderNo: '',
    manualOrderNo: '',
   orderNo: '',                   // Auto: PO-123456
  manualOrderNo: '',   
      quotationNo: '',
      manualQuotationNo: '',  
      orderNo: '',
      orderDate: '',
      deliveryDate: '',
      vendorName: '',
      vendorAddress: '',
      vendorEmail: '',
      vendorPhone: '',
      items: [
        { name: '', qty: '', rate: '', tax: 0, discount: 0 } 
      ],
      terms: '',
      signature: '',
      photo: '',
      files: []
    },
    goodsReceipt: {
      referenceId: '',
      manualRefNo: '',
      purchaseOrderNo: '',
     receiptNo: '',
    manualReceiptNo: '',
    purchaseOrderNo: '',     // Auto-filled from previous step
    manualPurchaseOrderNo: '',
      receiptDate: '',
      vehicleNo: '',
      driverName: '',
      driverPhone: '',
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      companyPhone: '',
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      shipToName: '',
      shipToAddress: '',
      shipToEmail: '',
      shipToPhone: '',
      items: [
        { name: '', qty: '', receivedQty: '', rate: '', tax: 0, discount: 0 }
      ],
      terms: '',
      signature: '',
      photo: '',
      files: []
    },
    bill: {
      orderNo: '',
      manualRefNo: '',
    billNo: '',
    manualBillNo: '',
    receiptNo: '',           // Optional: if needed
    manualReceiptNo: '',

        goodsReceiptNo: "", // auto-filled from Goods Receipt step
    manualGoodsReceiptNo: "", // optional manual entry
      billDate: '',




      dueDate: '',
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      companyPhone: '',
      vendorName: '',
      vendorAddress: '',
      vendorEmail: '',
      vendorPhone: '',
      items: [{ description: '', rate: '', qty: '', tax: '', discount: '', amount: '' }],
      paymentStatus: '',
      paymentMethod: '',
      note: '',
      terms: '',
      signature: '',
      photo: '',
      files: []
    },
    payment: {

    receiptNo: '',          
    manualReceiptNo: '',
      referenceId: '',
      manualRefNo: '',
      paymentDate: '',
        paymentNo: "",           // Auto-generated
  manualPaymentNo: "",     // Optional manual override
  billNo: "",              // Auto-copied from Bill
  manualBillNo: "", 
      amount: '',
      paymentMethod: '',
      paymentStatus: '',
      note: '',
      vendorName: '',
      vendorAddress: '',
      vendorEmail: '',
      vendorPhone: '',
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      payment:'',
      companyPhone: '',
      totalAmount: '',
      footerNote: '',
      signature: '',
      photo: '',
      files: []
    },
  }));
  
  // Available items for search
  const [availableItems, setAvailableItems] = useState([
    { id: 1, name: "Laptop", category: "Electronics", price: 50000, tax: 18, hsn: "8471", uom: "PCS" },
    { id: 2, name: "Office Chair", category: "Furniture", price: 5000, tax: 12, hsn: "9401", uom: "PCS" },
    { id: 3, name: "T-Shirt", category: "Apparel", price: 500, tax: 5, hsn: "6109", uom: "PCS" },
    { id: 4, name: "Coffee Table", category: "Furniture", price: 8000, tax: 12, hsn: "9403", uom: "PCS" },
    { id: 5, name: "Smartphone", category: "Electronics", price: 20000, tax: 18, hsn: "8517", uom: "PCS" },
    { id: 6, name: "Notebook", category: "Stationery", price: 100, tax: 5, hsn: "4820", uom: "PCS" },
    { id: 7, name: "Water Bottle", category: "Other", price: 200, tax: 5, hsn: "3924", uom: "PCS" },
    { id: 8, name: "Desk Lamp", category: "Furniture", price: 1500, tax: 12, hsn: "9405", uom: "PCS" },
  ]);
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
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
  // Search state for each row
  const [rowSearchTerms, setRowSearchTerms] = useState({});
  const [showRowSearch, setShowRowSearch] = useState({});
  
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      alert("Product name and category are required!");
      return;
    }
    const itemToAdd = {
      name: newItem.name,
      qty: 1,
      rate: newItem.sellingPrice,
      tax: newItem.tax,
      discount: 0,
      hsn: newItem.hsn,
      uom: newItem.uom
    };
    
    const tab = key;
    setFormData(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: [...prev[tab].items, itemToAdd]
      }
    }));
    
    setNewItem({
      name: '',
      category: '',
      hsn: '',
      tax: 0,
      sellingPrice: 0,
      uom: 'PCS'
    });
    setShowAdd(false);
  };
  
  const handleUpdateItem = () => {
    console.log("Update item:", newItem);
    setShowEdit(false);
  };
  
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
      setNewItem(prev => ({ ...prev, category: newCategory }));
      setNewCategory('');
    }
    setShowAddCategoryModal(false);
  };
  
  const [savedRecords, setSavedRecords] = useState([]);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    hsn: '',
    tax: 0,
    sellingPrice: 0,
    uom: 'PCS'
  });
  useEffect(() => {
    const tab = key;
    const updates = {};
  
    // Sync common fields across tabs
    const commonFields = [
      'companyName',
      'companyAddress',
      'companyEmail',
      'companyPhone',
      'vendorName',
      'vendorAddress',
      'vendorEmail',
      'vendorPhone'
    ];
  
    commonFields.forEach(field => {
      if (formData[tab][field]) {
        // Update in all other tabs
        tabsWithItems.forEach(t => {
          if (t !== tab && formData[t][field] !== formData[tab][field]) {
            updates[t] = { ...formData[t], [field]: formData[tab][field] };
          }
        });
      }
    });
  
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, [formData.purchaseQuotation.companyName, formData.purchaseQuotation.vendorName, /* add others */ key]);
  const generateReferenceId = (tabKey) => {
    const prefixes = {
      purchaseQuotation: "QRF",
      purchaseOrder: "ORD",
      goodsReceipt: "GRN",
      bill: "BILL",
      payment: "PAY"
    };
  
    const prefix = prefixes[tabKey] || "REF";
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${rand}`;
  };
  useEffect(() => {
    const generateRefId = (prefix) => {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `${prefix}-${year}-${rand}`;
    };
  
    const generateDocNo = (prefix) => {
      return `${prefix}-${Date.now().toString().slice(-6)}`;
    };
  
    // ============= PURCHASE QUOTATION =============
    if (!formData.purchaseQuotation.referenceId) {
      handleChange("purchaseQuotation", "referenceId", generateRefId("QRF"));
    }
  
    // Handle Quotation No: Use manual if provided, else generate
    if (!formData.purchaseQuotation.quotationNo) {
      if (formData.purchaseQuotation.manualQuotationNo) {
        handleChange("purchaseQuotation", "quotationNo", formData.purchaseQuotation.manualQuotationNo);
      } else {
        handleChange("purchaseQuotation", "quotationNo", generateDocNo("QTN"));
      }
    }
  
    // If manualQuotationNo is updated after auto-generation, sync it
    if (
      formData.purchaseQuotation.manualQuotationNo &&
      formData.purchaseQuotation.manualQuotationNo !== formData.purchaseQuotation.quotationNo
    ) {
      handleChange("purchaseQuotation", "quotationNo", formData.purchaseQuotation.manualQuotationNo);
    }
  
    // ============= PURCHASE ORDER =============
    if (!formData.purchaseOrder.referenceId) {
      handleChange("purchaseOrder", "referenceId", generateRefId("ORD"));
    }
  
    if (!formData.purchaseOrder.orderNo) {
      if (formData.purchaseOrder.manualOrderNo) {
        handleChange("purchaseOrder", "orderNo", formData.purchaseOrder.manualOrderNo);
      } else {
        handleChange("purchaseOrder", "orderNo", generateDocNo("PO"));
      }
    }
  
    if (
      formData.purchaseOrder.manualOrderNo &&
      formData.purchaseOrder.manualOrderNo !== formData.purchaseOrder.orderNo
    ) {
      handleChange("purchaseOrder", "orderNo", formData.purchaseOrder.manualOrderNo);
    }
  
    // Auto-fill quotationNo from Quotation
    if (formData.purchaseQuotation.quotationNo && !formData.purchaseOrder.quotationNo) {
      handleChange("purchaseOrder", "quotationNo", formData.purchaseQuotation.quotationNo);
    }
  
    // ============= GOODS RECEIPT =============
    if (!formData.goodsReceipt.referenceId) {
      handleChange("goodsReceipt", "referenceId", generateRefId("GRN"));
    }
  
    if (!formData.goodsReceipt.receiptNo) {
      if (formData.goodsReceipt.manualReceiptNo) {
        handleChange("goodsReceipt", "receiptNo", formData.goodsReceipt.manualReceiptNo);
      } else {
        handleChange("goodsReceipt", "receiptNo", generateDocNo("GR"));
      }
    }
  
    if (
      formData.goodsReceipt.manualReceiptNo &&
      formData.goodsReceipt.manualReceiptNo !== formData.goodsReceipt.receiptNo
    ) {
      handleChange("goodsReceipt", "receiptNo", formData.goodsReceipt.manualReceiptNo);
    }
  
    const poNoToUse = formData.purchaseOrder.manualOrderNo || formData.purchaseOrder.orderNo;
    if (poNoToUse && !formData.goodsReceipt.purchaseOrderNo) {
      handleChange("goodsReceipt", "purchaseOrderNo", poNoToUse);
    }
  
    // ============= BILL =============
    if (!formData.bill.referenceId) {
      handleChange("bill", "referenceId", generateRefId("BILL"));
    }
  
    if (!formData.bill.billNo) {
      if (formData.bill.manualBillNo) {
        handleChange("bill", "billNo", formData.bill.manualBillNo);
      } else {
        handleChange("bill", "billNo", generateDocNo("INV"));
      }
    }
  
    if (
      formData.bill.manualBillNo &&
      formData.bill.manualBillNo !== formData.bill.billNo
    ) {
      handleChange("bill", "billNo", formData.bill.manualBillNo);
    }
  
    const grNoToUse = formData.goodsReceipt.manualReceiptNo || formData.goodsReceipt.receiptNo;
    if (grNoToUse && !formData.bill.goodsReceiptNo) {
      handleChange("bill", "goodsReceiptNo", grNoToUse);
    }
  
    // ============= PAYMENT =============
    if (!formData.payment.referenceId) {
      handleChange("payment", "referenceId", generateRefId("PAY"));
    }
  
    if (!formData.payment.paymentNo) {
      if (formData.payment.manualPaymentNo) {
        handleChange("payment", "paymentNo", formData.payment.manualPaymentNo);
      } else {
        handleChange("payment", "paymentNo", generateDocNo("PAY"));
      }
    }
  
    if (
      formData.payment.manualPaymentNo &&
      formData.payment.manualPaymentNo !== formData.payment.paymentNo
    ) {
      handleChange("payment", "paymentNo", formData.payment.manualPaymentNo);
    }
  
    if (formData.bill.billNo && !formData.payment.billNo) {
      const finalBillNo = formData.bill.manualBillNo || formData.bill.billNo;
      handleChange("payment", "billNo", finalBillNo);
    }
  
  }, [
    // Dependencies — now include manualQuotationNo
    formData.purchaseQuotation.referenceId,
    formData.purchaseQuotation.quotationNo,
    formData.purchaseQuotation.manualQuotationNo,
  
    formData.purchaseOrder.referenceId,
    formData.purchaseOrder.orderNo,
    formData.purchaseOrder.manualOrderNo,
    formData.purchaseOrder.quotationNo,
  
    formData.goodsReceipt.referenceId,
    formData.goodsReceipt.receiptNo,
    formData.goodsReceipt.manualReceiptNo,
    formData.goodsReceipt.purchaseOrderNo,
  
    formData.bill.referenceId,
    formData.bill.billNo,
    formData.bill.manualBillNo,
    formData.bill.goodsReceiptNo,
  
    formData.payment.referenceId,
    formData.payment.paymentNo,
    formData.payment.manualPaymentNo,
    formData.payment.billNo,
  ]);
  
  // --- Handlers ---
  const handleChange = (tab, field, value) => {
    setFormData(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  };
  
  const handleItemChange = (tab, index, field, value) => {
    const updatedItems = [...formData[tab].items];
    updatedItems[index][field] = value;
    setFormData(prev => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
  };
  
  const handleProductChange = (field, value) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };
  
  const addItem = (tab) => {
    setFormData(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: [
          ...prev[tab].items,
          { name: '', qty: '', rate: '', tax: 0, discount: 0 }
        ],
      },
    }));
  };
  
  const removeItem = (tab, index) => {
    const updatedItems = [...formData[tab].items];
    updatedItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
  };
  
  const handleRowSearchChange = (tab, index, value) => {
    setRowSearchTerms(prev => ({
      ...prev,
      [`${tab}-${index}`]: value
    }));
  };
  
  const handleSelectSearchedItem = (tab, index, item) => {
    const updatedItems = [...formData[tab].items];
    updatedItems[index] = {
      ...updatedItems[index],
      name: item.name,
      rate: item.price,
      tax: item.tax,
      hsn: item.hsn,
      uom: item.uom
    };
    
    setFormData(prev => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems }
    }));
    
    // Hide search for this row
    setShowRowSearch(prev => ({
      ...prev,
      [`${tab}-${index}`]: false
    }));
    
    // Clear search term
    setRowSearchTerms(prev => ({
      ...prev,
      [`${tab}-${index}`]: ''
    }));
  };
  
  const toggleRowSearch = (tab, index) => {
    const rowKey = `${tab}-${index}`;
    setShowRowSearch(prev => ({
      ...prev,
      [rowKey]: !prev[rowKey]
    }));
  };
  
  const calculateTotalAmount = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty) || 0;
      return total + (rate * qty);
    }, 0);
  };
  
  const calculateTotalWithTaxAndDiscount = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty) || 0;
      const tax = parseFloat(item.tax) || 0;
      const discount = parseFloat(item.discount) || 0;
      const subtotal = rate * qty;
      const taxAmount = (subtotal * tax) / 100;
      return total + subtotal + taxAmount - discount;
    }, 0);
  };
  
  // --- Top Buttons ---
  const handlePrint = (lang) => {
    const printContent = pdfRef.current;
    if (!printContent) {
      alert("No content to print!");
      return;
    }
  
    // Create a new window for printing
    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<style>body { margin: 20px; font-family: Arial, sans-serif; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.outerHTML); // Full rendered HTML
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  
    // Wait for images to load
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Optionally close after print
      // printWindow.close();
    };
  };
  const handleSend = () => {
    window.location.href = `mailto:?subject=Purchase Quotation&body=Please find the purchase quotation details attached.`;
  };
  
  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `${key}-${formData[key].quotationNo || formData[key].billNo || 'document'}.pdf`,
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
        html2canvas: { scale: 3 },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .save();
  };
  
  useEffect(() => {
    const saved = localStorage.getItem('purchaseFormRecords');
    if (saved) setSavedRecords(JSON.parse(saved));
  }, []);
  
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(formData.purchaseQuotation.items);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Quotation');
    XLSX.writeFile(workbook, `purchase-quotation-${formData.purchaseQuotation.quotationNo || 'draft'}.xlsx`);
  };
  
  // --- Navigation Buttons ---
  const handleSkip = () => {
    setKey(prev => {
      if (prev === 'purchaseQuotation') return 'purchaseOrder';
      if (prev === 'purchaseOrder') return 'goodsReceipt';
      if (prev === 'goodsReceipt') return 'bill';
      if (prev === 'bill') return 'payment';
      return 'purchaseQuotation';
    });
  };
  
  const handleSaveDraft = () => onSubmit(formData, key);
  
  const handleSaveNext = () => {
    handleSaveDraft();
  
    setKey(prev => {
      if (prev === 'purchaseQuotation') {
        setFormData(prevData => ({
          ...prevData,
          purchaseOrder: {
            ...prevData.purchaseOrder,
            quotationNo: prevData.purchaseQuotation.quotationNo,
            orderDate: prevData.purchaseQuotation.quotationDate,
            vendorName: prevData.purchaseQuotation.vendorName,
            vendorAddress: prevData.purchaseQuotation.vendorAddress,
            vendorEmail: prevData.purchaseQuotation.vendorEmail,
            vendorPhone: prevData.purchaseQuotation.vendorPhone,
            companyName: prevData.purchaseQuotation.companyName,
            companyAddress: prevData.purchaseQuotation.companyAddress,
            companyEmail: prevData.purchaseQuotation.companyEmail,
            companyPhone: prevData.purchaseQuotation.companyPhone,
            items: prevData.purchaseQuotation.items.map(item => ({
              name: item.name,
              qty: item.qty,
              rate: item.rate,
            })),
          },
        }));
        return 'purchaseOrder';
      }
  
      if (prev === 'purchaseOrder') {
        setFormData(prevData => ({
          ...prevData,
          goodsReceipt: {
            ...prevData.goodsReceipt,
            purchaseOrderNo: prevData.purchaseOrder.orderNo,
            receiptDate: new Date().toISOString().split('T')[0],
            companyName: prevData.purchaseOrder.companyName,
            companyAddress: prevData.purchaseOrder.companyAddress,
            companyEmail: prevData.purchaseOrder.companyEmail,
            companyPhone: prevData.purchaseOrder.companyPhone,
            vendorName: prevData.purchaseOrder.vendorName,
            vendorAddress: prevData.purchaseOrder.vendorAddress,
            vendorEmail: prevData.purchaseOrder.vendorEmail,
            vendorPhone: prevData.purchaseOrder.vendorPhone,
            shipToName: prevData.purchaseOrder.shipToCompanyName,
            shipToAddress: prevData.purchaseOrder.shipToAddress,
            shipToEmail: prevData.purchaseOrder.shipToEmail,
            shipToPhone: prevData.purchaseOrder.shipToPhone,
            items: prevData.purchaseOrder.items.map(item => ({
              name: item.name,
              qty: item.qty,
              receivedQty: item.qty,
              rate: item.rate,
            })),
          },
        }));
        return 'goodsReceipt';
      }
  
      if (prev === 'goodsReceipt') {
        setFormData(prevData => ({
          ...prevData,
          bill: {
            ...prevData.bill,
            orderNo: prevData.purchaseOrder.orderNo,
            billNo: `BILL-${Date.now().toString().slice(-6)}`,
            billDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            vendorName: prevData.goodsReceipt.vendorName,
            vendorAddress: prevData.goodsReceipt.vendorAddress,
            vendorEmail: prevData.goodsReceipt.vendorEmail,
            vendorPhone: prevData.goodsReceipt.vendorPhone,
            companyName: prevData.goodsReceipt.companyName,
            companyAddress: prevData.goodsReceipt.companyAddress,
            companyEmail: prevData.goodsReceipt.companyEmail,
            companyPhone: prevData.goodsReceipt.companyPhone,
            items: prevData.goodsReceipt.items.map(item => ({
              description: item.name,
              qty: item.receivedQty,
              rate: item.rate,
              tax: 0,
              discount: 0,
              amount: item.rate * item.receivedQty,
            })),
          },
        }));
        return 'bill';
      }
  
      if (prev === 'bill') {
        setFormData(prevData => ({
          ...prevData,
          payment: {
            ...prevData.payment,
            billNo: prevData.bill.billNo,
            paymentDate: new Date().toISOString().split('T')[0],
            totalAmount: calculateTotalAmount(prevData.bill.items).toFixed(2),
            amount: '',
            vendorName: prevData.bill.vendorName,
            vendorAddress: prevData.bill.vendorAddress,
            vendorEmail: prevData.bill.vendorEmail,
            vendorPhone: prevData.bill.vendorPhone,
            companyName: prevData.bill.companyName,
            companyAddress: prevData.bill.companyAddress,
            companyEmail: prevData.bill.companyEmail,
            companyPhone: prevData.bill.companyPhone,
          },
        }));
        return 'payment';
      }
  
      return 'purchaseQuotation';
    });
  };
  
  const handleNext = () => {
    setKey(prev => {
      if (prev === 'purchaseQuotation') return 'purchaseOrder';
      if (prev === 'purchaseOrder') return 'goodsReceipt';
      if (prev === 'goodsReceipt') return 'bill';
      if (prev === 'bill') return 'payment';
      return 'purchaseQuotation';
    });
  };
  
  const handleFinalSubmit = () => {
    const newRecord = {
      id: currentRecordId || Date.now(),
      data: formData,
      createdAt: new Date().toLocaleString(),
    };
  
    if (currentRecordId) {
      setSavedRecords(prev => {
        const updated = prev.map(r => r.id === currentRecordId ? newRecord : r);
        localStorage.setItem('purchaseFormRecords', JSON.stringify(updated));
        return updated;
      });
    } else {
      const updatedRecords = [...savedRecords, newRecord];
      setSavedRecords(updatedRecords);
      localStorage.setItem('purchaseFormRecords', JSON.stringify(updatedRecords));
    }
  
    setCurrentRecordId(null);
    alert("Purchase form submitted!");
  };
  
  const handleEditRecord = (id) => {
    const record = savedRecords.find(r => r.id === id);
    if (record) {
      setFormData(record.data);
      setCurrentRecordId(id);
  
      if (record.data.payment?.billNo) {
        setKey('payment');
      } else if (record.data.bill?.billNo) {
        setKey('bill');
      } else if (record.data.goodsReceipt?.receiptNo) {
        setKey('goodsReceipt');
      } else if (record.data.purchaseOrder?.orderNo) {
        setKey('purchaseOrder');
      } else {
        setKey('purchaseQuotation');
      }
    }
  };
  
  const handleDeleteRecord = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setSavedRecords(prev => prev.filter(r => r.id !== id));
      if (currentRecordId === id) {
        setCurrentRecordId(null);
      }
    }
  };
  
  // File handlers
  const handleSignatureChange = (tab, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(tab, 'signature', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePhotoChange = (tab, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(tab, 'photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFileChange = (tab, e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: reader.result
        });
        
        if (newFiles.length === files.length) {
          handleChange(tab, 'files', [...formData[tab].files, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removeFile = (tab, index) => {
    const updatedFiles = [...formData[tab].files];
    updatedFiles.splice(index, 1);
    handleChange(tab, 'files', updatedFiles);
  };
  
  const renderItemsTable = (tab) => {
    const items = formData[tab]?.items || [];
  
    const handleItemChange = (index, field, value) => {
      const updatedItems = [...items];
      updatedItems[index][field] = value;
      setFormData(prev => ({
        ...prev,
        [tab]: { ...prev[tab], items: updatedItems }
      }));
    };
  
    const addItem = () => {
      setFormData(prev => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [...items, { name: '', qty: '', rate: '', tax: 0, discount: 0 }]
        }
      }));
    };
  
    const removeItem = (idx) => {
      const updatedItems = items.filter((_, index) => index !== idx);
      setFormData(prev => ({
        ...prev,
        [tab]: { ...prev[tab], items: updatedItems }
      }));
    };
  
    // Filter items based on search term for each row
    const getFilteredItems = (index) => {
      const searchTerm = rowSearchTerms[`${tab}-${index}`] || '';
      if (!searchTerm) return [];
      
      return availableItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };
  
    return (
      <div>
        <div className="d-flex justify-content-between mb-2">
          <div>
            <Button
              size="sm"
              onClick={addItem}
              style={{ backgroundColor: "#53b2a5", border: "none", padding: "6px 12px", fontWeight: "500", marginRight: "5px" }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Row
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              style={{ backgroundColor: "#53b2a5", border: "none", padding: "6px 12px", fontWeight: "500" }}
            >
              + Add Product
            </Button>
          </div>
        </div>
        
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
          companyId={companyId}
        />
        
        <Table bordered hover size="sm" className="dark-bordered-table">
          <thead className="bg-light">
            <tr>
              <th>Item Name</th>
              <th>Qty</th>
              {tab === 'goodsReceipt' && <th>Received Qty</th>}
              <th>Rate</th>
              <th>Tax %</th>
              <th>Discount</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = tab === 'goodsReceipt' ? (parseInt(item.receivedQty) || 0) : (parseInt(item.qty) || 0);
              const amount = (parseFloat(item.rate) || 0) * qty;
              const rowKey = `${tab}-${idx}`;
              const filteredItems = getFilteredItems(idx);
              const isSearchVisible = showRowSearch[rowKey];
              
              return (
                <tr key={idx}>
                  <td style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        placeholder="Item Name"
                        style={{ marginRight: '5px' }}
                      />
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => toggleRowSearch(tab, idx)}
                        title="Search Items"
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                    {isSearchVisible && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                        <InputGroup size="sm">
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                          </InputGroup.Text>
                          <FormControl
                            placeholder="Search items..."
                            value={rowSearchTerms[rowKey] || ''}
                            onChange={(e) => handleRowSearchChange(tab, idx, e.target.value)}
                            autoFocus
                          />
                        </InputGroup>
                        {filteredItems.length > 0 ? (
                          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {filteredItems.map(filteredItem => (
                              <div 
                                key={filteredItem.id}
                                style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                onClick={() => handleSelectSearchedItem(tab, idx, filteredItem)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                <div><strong>{filteredItem.name}</strong></div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {filteredItem.category} - ${filteredItem.price.toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '8px', textAlign: 'center', color: '#666' }}>
                            No items found
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      size="sm"
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                      placeholder="Qty"
                    />
                  </td>
                  {tab === 'goodsReceipt' && (
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.receivedQty}
                        onChange={(e) => handleItemChange(idx, 'receivedQty', e.target.value)}
                        placeholder="Received Qty"
                      />
                    </td>
                  )}
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      placeholder="Rate"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.tax}
                      onChange={(e) => handleItemChange(idx, 'tax', e.target.value)}
                      placeholder="Tax %"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.discount}
                      onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                      placeholder="Discount"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={amount.toFixed(2)}
                      readOnly
                      style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}
                    />
                  </td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => removeItem(idx)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };
  const renderPDFView = () => {
    const currentTab = formData[key];
    const hasItems = tabsWithItems.includes(key) && Array.isArray(currentTab.items);
  
    return (
      <div 
        ref={pdfRef} 
        style={{ 
          fontFamily: 'Arial, sans-serif', 
          padding: '20px', 
          backgroundColor: 'white',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}
      >
        {/* Header with Logo and Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ border: '2px dashed #28a745', padding: '10px', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentTab.logo ? <img src={currentTab.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100px' }} /> : 'Logo'}
          </div>
          <div style={{ textAlign: 'center', color: '#28a745' }}>
            <h2>
              {key === 'purchaseQuotation' && 'PURCHASE QUOTATION'}
              {key === 'purchaseOrder' && 'PURCHASE ORDER'}
              {key === 'goodsReceipt' && 'GOODS RECEIPT NOTE'}
              {key === 'bill' && 'PURCHASE BILL'}
              {key === 'payment' && 'PAYMENT RECEIPT'}
            </h2>
          </div>
        </div>
        <hr style={{ border: '2px solid #28a745', margin: '15px 0' }} />
  
        {/* Company Info */}
        <div style={{ marginBottom: '15px' }}>
          <h4>{currentTab.companyName}</h4>
          <p>{currentTab.companyAddress}</p>
          <p>Email: {currentTab.companyEmail} | Phone: {currentTab.companyPhone}</p>
        </div>
  
        {/* Vendor Info */}
        {currentTab.vendorName && (
          <div style={{ marginBottom: '15px' }}>
            <h5>Vendor</h5>
            <p>{currentTab.vendorName}</p>
            <p>{currentTab.vendorAddress}</p>
            <p>Email: {currentTab.vendorEmail} | Phone: {currentTab.vendorPhone}</p>
          </div>
        )}
  
        {/* Ship To */}
        {currentTab.shipToName && (
          <div style={{ marginBottom: '15px' }}>
            <h5>Ship To</h5>
            <p>{currentTab.shipToName}</p>
            <p>{currentTab.shipToAddress}</p>
            <p>Email: {currentTab.shipToEmail} | Phone: {currentTab.shipToPhone}</p>
          </div>
        )}
  
        {/* Driver & Vehicle */}
        {key === 'goodsReceipt' && (
          <div style={{ marginBottom: '15px' }}>
            <h5>Driver Details</h5>
            <p>{currentTab.driverName} | {currentTab.driverPhone}</p>
            <p>Vehicle No.: {currentTab.vehicleNo}</p>
          </div>
        )}
  
        {/* Document Numbers */}
        <div style={{ marginBottom: '15px' }}>
          <strong>Ref NO:</strong> {currentTab.referenceId} |
          {key === 'purchaseQuotation' && <><strong>Quotation No.:</strong> {currentTab.quotationNo} | </>}
          {key === 'purchaseOrder' && <><strong>Order No.:</strong> {currentTab.orderNo} | </>}
          {key === 'goodsReceipt' && <><strong>Receipt No.:</strong> {currentTab.receiptNo} | </>}
          {key === 'bill' && <><strong>Bill No.:</strong> {currentTab.billNo} | </>}
          {key === 'payment' && <><strong>Payment No.:</strong> {currentTab.paymentNo} | </>}
          <strong>Date:</strong> {currentTab[`${key}Date`] || currentTab.date}
        </div>
  
        {/* Items Table */}
        {hasItems && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Item Name</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Qty</th>
                {key === 'goodsReceipt' && <th style={{ border: '1px solid #000', padding: '8px' }}>Received Qty</th>}
                <th style={{ border: '1px solid #000', padding: '8px' }}>Rate</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Tax %</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Discount</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentTab.items.map((item, idx) => {
                const qty = key === 'goodsReceipt' ? (parseInt(item.receivedQty) || 0) : (parseInt(item.qty) || 0);
                const amount = (parseFloat(item.rate) || 0) * qty;
                return (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{item.name}</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{item.qty}</td>
                    {key === 'goodsReceipt' && <td style={{ border: '1px solid #000', padding: '8px' }}>{item.receivedQty}</td>}
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{parseFloat(item.rate).toFixed(2)}</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{item.tax}%</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{parseFloat(item.discount).toFixed(2)}</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={key === 'goodsReceipt' ? 6 : 5} style={{ textAlign: 'right', fontWeight: 'bold', border: '1px solid #000', padding: '8px' }}>
                  Total:
                </td>
                <td style={{ fontWeight: 'bold', border: '1px solid #000', padding: '8px' }}>
                  ${calculateTotalWithTaxAndDiscount(currentTab.items).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
  
        {/* Payment Details */}
        {key === 'payment' && (
          <div style={{ marginBottom: '15px' }}>
            <h5>Payment Details</h5>
            <p>Amount Paid: ${parseFloat(currentTab.amount).toFixed(2)}</p>
            <p>Payment Method: {currentTab.paymentMethod}</p>
            <p>Status: {currentTab.paymentStatus}</p>
          </div>
        )}
  
        {/* Terms & Conditions */}
        {currentTab.terms && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Terms & Conditions:</strong>
            <p>{currentTab.terms}</p>
          </div>
        )}
  
        {/* Attachments */}
        <div style={{ marginBottom: '15px' }}>
          {currentTab.signature && (
            <div>
              <strong>Signature:</strong>
              <br />
              <img src={currentTab.signature} alt="Signature" style={{ maxWidth: '150px', maxHeight: '100px', margin: '5px 0' }} />
            </div>
          )}
          {currentTab.photo && (
            <div>
              <strong>Photo:</strong>
              <br />
              <img src={currentTab.photo} alt="Photo" style={{ maxWidth: '150px', maxHeight: '100px', margin: '5px 0' }} />
            </div>
          )}
          {currentTab.files && currentTab.files.length > 0 && (
            <div>
              <strong>Files:</strong>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {currentTab.files.map((file, i) => (
                  <li key={i}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
  
        {/* Footer Note */}
        <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '30px' }}>
          {currentTab.footerNote || "Thank you for your business!"}
        </p>
      </div>
    );
  };
  
  // Render attachment fields for all tabs
  const renderAttachmentFields = (tab) => {
    return (
      <div className="mt-4 mb-4">
        <h5>Attachments</h5>
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Signature</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleSignatureChange(tab, e)} 
              />
              {formData[tab].signature && (
                <div className="mt-2">
                  <img 
                    src={formData[tab].signature} 
                    alt="Signature" 
                    style={{ width: '100px', height: '50px', objectFit: 'contain' }} 
                  />
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Photo</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={(e) => handlePhotoChange(tab, e)} 
              />
              {formData[tab].photo && (
                <div className="mt-2">
                  <img 
                    src={formData[tab].photo} 
                    alt="Photo" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                  />
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Attach Files</Form.Label>
              <Form.Control 
                type="file" 
                multiple 
                onChange={(e) => handleFileChange(tab, e)} 
              />
              {formData[tab].files && formData[tab].files.length > 0 && (
                <div className="mt-2">
                  <ul className="list-unstyled">
                    {formData[tab].files.map((file, index) => (
                      <li key={index} className="d-flex justify-content-between align-items-center">
                        <span>{file.name}</span>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => removeFile(tab, index)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
      </div>
    );
  };
  
  return (
    <>  
    <div className="container-fluid mt-4 px-2" ref={formRef}>
      <h4 className="text-center mb-4">Purchase Process</h4>
      
      {/* Top Action Buttons */}
{/* Top Action Buttons */}
<div className="d-flex flex-wrap justify-content-center gap-2 gap-sm-3 mb-4">
  
  {/* Print in English Button */}
  <Button
    variant="warning"
    onClick={() => handlePrint('english')}
    className="flex-fill flex-sm-grow-0"
    style={{
      minWidth: "130px",
      fontSize: "0.95rem",
      padding: "6px 10px",
    }}
  >
    Print (English)
  </Button>

  {/* Print in Arabic Button */}
  <Button
    variant="warning"
    onClick={() => handlePrint('arabic')}
    className="flex-fill flex-sm-grow-0"
    style={{
      minWidth: "130px",
      fontSize: "0.95rem",
      padding: "6px 10px",
      backgroundColor: '#d39e00',
      borderColor: '#c49200'
    }}
  >
    طباعة (العربية)
  </Button>

  {/* Print Both Button */}
  <Button
    variant="warning"
    onClick={() => handlePrint('both')}
    className="flex-fill flex-sm-grow-0"
    style={{
      minWidth: "150px",
      fontSize: "0.95rem",
      padding: "6px 10px",
      backgroundColor: '#c87f0a',
      borderColor: '#b87409'
    }}
  >
    Print Both (EN + AR)
  </Button>

  {/* Other Buttons... */}
  <Button
    variant="info"
    onClick={handleSend}
    className="flex-fill flex-sm-grow-0"
    style={{
      color: 'white',
      minWidth: "110px",
      fontSize: "0.95rem",
      padding: "6px 10px",
    }}
  >
    Send
  </Button>

  <Button
    variant="success"
    onClick={handleDownloadPDF}
    className="flex-fill flex-sm-grow-0"
    style={{
      minWidth: "130px",
      fontSize: "0.95rem",
      padding: "6px 10px",
    }}
  >
    Download PDF
  </Button>

  <Button
    variant="primary"
    onClick={() => navigate('/company/viewinvoicee')}
    className="flex-fill flex-sm-grow-0"
    style={{
      minWidth: "130px",
      fontSize: "0.95rem",
      padding: "6px 10px",
    }}
  >
    View Bills
  </Button>
</div>
      <Tabs activeKey={key} onSelect={setKey} className="mb-4" fill>
        {/* ============= PURCHASE QUOTATION TAB ============= */}
        <Tab eventKey="purchaseQuotation" title="Purchase Quotation">
          <Form>
            {/* Header: Logo + Company Info + Title */}
            <Row className="mb-4 mt-3">
              <Col md={3} className="d-flex align-items-center justify-content-center">
                <div
                  className="border rounded d-flex flex-column align-items-center justify-content-center"
                  style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer" }}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                  <input id="logo-upload" type="file" accept="image/*" hidden />
                </div>
              </Col>
        
              <Col md={6}>
                <div className="d-flex flex-column gap-1">
                  <Form.Control
                    type="text"
                    value={formData.purchaseQuotation.companyName}
                    onChange={(e) => handleChange("purchaseQuotation", "companyName", e.target.value)}
                    placeholder="Enter Your Company Name......."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.purchaseQuotation.companyAddress}
                    onChange={(e) => handleChange("purchaseQuotation", "companyAddress", e.target.value)}
                    placeholder="Company Address, City, State, Pincode......."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="email"
                    value={formData.purchaseQuotation.companyEmail}
                    onChange={(e) => handleChange("purchaseQuotation", "companyEmail", e.target.value)}
                    placeholder="Company Email......."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.purchaseQuotation.companyPhone}
                    onChange={(e) => handleChange("purchaseQuotation", "companyPhone", e.target.value)}
                    placeholder="Phone No........"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </div>
              </Col>
              <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
                <h2 className="text-success mb-0">PURCHASE QUOTATION</h2>
                <hr
                  style={{
                    width: "80%",
                    borderColor: "#28a745",
                    marginTop: "5px",
                    marginBottom: "10px",
                  }}
                />
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px", 
                backgroundColor: "#28a745", 
                border: "none", 
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            {/* Quotation & Vendor Info */}
            <Row className="mb-4 d-flex justify-content-between">
              <Col md={8}>
                <h5>Quotation From</h5>
                <Form.Group className="mb-2">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Form.Control
                      type="text"
                      value={formData.purchaseQuotation.vendorName}
                      onChange={(e) => handleChange("purchaseQuotation", "vendorName", e.target.value)}
                      placeholder=" Enter Vendor Name....."
                      className="form-control-no-border"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
                    />
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => navigate('/Company/vendorscreditors')}
                      title="Add Vendor"
                    >
                       Add Vendor
                    </Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    value={formData.purchaseQuotation.vendorAddress}
                    onChange={(e) => handleChange("purchaseQuotation", "vendorAddress", e.target.value)}
                    placeholder="Vendor Address"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="email"
                    value={formData.purchaseQuotation.vendorEmail}
                    onChange={(e) => handleChange("purchaseQuotation", "vendorEmail", e.target.value)}
                    placeholder="Email"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    value={formData.purchaseQuotation.vendorPhone}
                    onChange={(e) => handleChange("purchaseQuotation", "vendorPhone", e.target.value)}
                    placeholder="Phone"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Reference No</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.purchaseQuotation.referenceId || generateReferenceId('quotation')}
                    readOnly
                    style={{ 
                      border: "1px solid #495057", 
                      backgroundColor: "#f8f9fa", 
                      fontWeight: "500" 
                    }}
                    placeholder="PUR-QRF-2025-XXXX"
                  />
                </Form.Group>
                   {/* Purchase Quotation - Manual Reference No. */}
<Form.Group className="mb-2">

  
      <Form.Label 
        className="mb-0" 
        style={{ 
          fontSize: "0.9rem", 
          color: "#6c757d", 
          whiteSpace: "nowrap" 
        }}
      >
        Manual Ref. No. (Optional)
      </Form.Label>
 

      <Form.Control
        type="text"
        value={formData.purchaseQuotation.manualRefNo}
        onChange={(e) => handleChange("purchaseQuotation", "manualRefNo", e.target.value)}
        placeholder="e.g. PUR-PO-001"
        style={{
          border: "1px solid #495057",
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0.375rem 0.75rem"
        }}
      />


</Form.Group>
                
                <Form.Group className="mb-2">
                  <Form.Label>Quotation No.</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.purchaseQuotation.quotationNo}
                    onChange={(e) => handleChange("purchaseQuotation", "quotationNo", e.target.value)}
                    placeholder="e.g. PQ-001"
                    style={{ border: "1px solid #495057" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Quotation Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.purchaseQuotation.quotationDate}
                    onChange={(e) => handleChange("purchaseQuotation", "quotationDate", e.target.value)}
                    style={{ border: "1px solid #495057" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Valid Till</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.purchaseQuotation.validDate}
                    onChange={(e) => handleChange("purchaseQuotation", "validDate", e.target.value)}
                    style={{ border: "1px solid #495057" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Items Table */}
            <Row className="mb-4">
              <Col>
                {renderItemsTable("purchaseQuotation")}
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px", 
                backgroundColor: "#28a745",
                border: "none", 
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            {/* Totals - Moved to left side */}
            {tabsWithItems.includes(key) && (
              <Row className="mb-4 mt-2">
                <Col md={4}>
                  <Table bordered size="sm" className="dark-bordered-table">
                    <tbody>
                      <tr>
                        <td className="fw-bold">Sub Total:</td>
                        <td>
                          ${formData[key].items.reduce((sum, item) => 
                            sum + (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0), 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Tax:</td>
                        <td>
                          ${formData[key].items.reduce((sum, item) => {
                            const subtotal = (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0);
                            return sum + (subtotal * (parseFloat(item.tax) || 0)) / 100;
                          }, 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Discount:</td>
                        <td>
                          ${formData[key].items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Total:</td>
                        <td className="fw-bold">
                          ${calculateTotalWithTaxAndDiscount(formData[key].items).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            )}
            
            <hr
              style={{
                width: "100%",
                height: "4px", 
                backgroundColor: "#28a745", 
                border: "none", 
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            {/* Bank & Notes */}
            <Row className="mb-4">
              <h5>Bank Details</h5>
              <Col
                md={6}
                className="p-2 rounded"
                style={{ border: "1px solid #343a40" }}
              >
                {['bankName', 'accountNo', 'accountHolder', 'ifsc'].map(field => (
                  <Form.Group key={field} className="mb-2">
                    <Form.Control
                      type="text"
                      placeholder={{
                        bankName: 'Bank Name',
                        accountNo: 'Account No.',
                        accountHolder: 'Account Holder',
                        ifsc: 'IFSC Code',
                      }[field]}
                      value={formData.purchaseQuotation[field] || ""}
                      onChange={(e) => handleChange("purchaseQuotation", field, e.target.value)}
                      className="form-control-no-border"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                    />
                  </Form.Group>
                ))}
              </Col>
              <Col md={6}>
                <h5>Notes</h5>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Enter any additional notes"
                  value={formData.purchaseQuotation.notes || ""}
                  onChange={(e) => handleChange("purchaseQuotation", "notes", e.target.value)}
                  style={{ border: "1px solid #343a40" }}
                />
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px", 
                backgroundColor: "#28a745", 
                border: "none", 
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            {/* Terms & Footer */}
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label>Terms & Conditions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.purchaseQuotation.terms}
                    onChange={(e) => handleChange("purchaseQuotation", "terms", e.target.value)}
                    placeholder="e.g. Payment within 15 days"
                    style={{ border: "1px solid #343a40" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Attachment Fields */}
            {renderAttachmentFields("purchaseQuotation")}
            
            <Row className="text-center mb-4">
              <Col>
                <p><strong>Thank you for your business!</strong></p>
                <p className="text-muted">www.yourcompany.com</p>
              </Col>
            </Row>
            
            {/* Navigation */}
            <div className="d-flex justify-content-between mt-5">
              <Button variant="secondary" onClick={handleSkip}>Skip</Button>
              <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
              <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
              <Button variant="success" onClick={handleNext}>Next</Button>
            </div>
          </Form>
        </Tab>
        
        {/* ============= PURCHASE ORDER TAB ============= */}
        <Tab eventKey="purchaseOrder" title="Purchase Order">
          <Form>
            {/* Header: Logo + Company Info + Title */}
            <Row className="mb-4 d-flex justify-content-between">
              <Col md={3} className="d-flex align-items-center justify-content-center">
                <div
                  className="border rounded d-flex flex-column align-items-center justify-content-center"
                  style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer" }}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                  <input id="logo-upload" type="file" accept="image/*" hidden />
                </div>
              </Col>
  
              <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
                <h2 className="text-success mb-0">PURCHASE ORDER</h2>
                <hr
                  style={{
                    width: "80%",
                    borderColor: "#28a745",
                    marginTop: "5px",
                    marginBottom: "10px",
                  }}
                />
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            <Row className="mb-4 mt-3">
              <Col md={6}>
                <div className="d-flex flex-column align-items-end justify-content-center gap-1">
                  <Form.Control
                    type="text"
                    value={formData.purchaseOrder.companyName}
                    onChange={(e) => handleChange("purchaseOrder", "companyName", e.target.value)}
                    placeholder="Your Company Name"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.purchaseOrder.companyAddress}
                    onChange={(e) => handleChange("purchaseOrder", "companyAddress", e.target.value)}
                    placeholder="Company Address, City, State, Pincode"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="email"
                    value={formData.purchaseOrder.companyEmail}
                    onChange={(e) => handleChange("purchaseOrder", "companyEmail", e.target.value)}
                    placeholder="Company Email"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.purchaseOrder.companyPhone}
                    onChange={(e) => handleChange("purchaseOrder", "companyPhone", e.target.value)}
                    placeholder="Phone No."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </div>
              </Col>
              <Col md={6} className="d-flex flex-column align-items-end">
  <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
    
    {/* Order Date */}
    <Form.Group>
      <Form.Control
        type="date"
        value={formData.purchaseOrder.orderDate}
        onChange={(e) => handleChange('purchaseOrder', 'orderDate', e.target.value)}
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          textAlign: "right"
        }}
      />
    </Form.Group>

    {/* Reference No (Auto) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginRight: "8px"
          }}
        >
          Ref No.
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.purchaseOrder.referenceId}
          readOnly
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            fontWeight: "500",
            backgroundColor: "#f8f9fa",
            color: "#495057",
            cursor: "not-allowed",
            textAlign: "right",
            flexGrow: 1
          }}
        />
      </div>
    </Form.Group>

    {/* Manual Ref No (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual Ref. No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.purchaseOrder.manualRefNo}
          onChange={(e) => handleChange("purchaseOrder", "manualRefNo", e.target.value)}
          placeholder="e.g. PO-INT-2025"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>

    {/* Purchase Order No (Auto) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginRight: "8px"
          }}
        >
          PO No.
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.purchaseOrder.orderNo}
          readOnly
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            fontWeight: "500",
            backgroundColor: "#f8f9fa",
            color: "#495057",
            cursor: "not-allowed",
            textAlign: "right",
            flexGrow: 1
          }}
        />
      </div>
    </Form.Group>

    {/* Manual PO No (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual PO No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.purchaseOrder.manualOrderNo}
          onChange={(e) => handleChange("purchaseOrder", "manualOrderNo", e.target.value)}
          placeholder="e.g. PO-CUST-001"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>

    {/* Quotation No (Auto from previous step) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginRight: "8px"
          }}
        >
          Quotation No
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.purchaseOrder.quotationNo}
          readOnly
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            fontWeight: "500",
            backgroundColor: "#f8f9fa",
            color: "#495057",
            cursor: "not-allowed",
            textAlign: "right",
            flexGrow: 1
          }}
        />
      </div>
    </Form.Group>
    <Form.Group className="mb-2">
  <div className="d-flex justify-content-between align-items-center">
    <Form.Label
      className="mb-0 flex-shrink-0 me-2"
      style={{
        fontSize: "0.9rem",
        color: "#6c757d",
        whiteSpace: "nowrap"
      }}
    >
      Manual Quotation No (Optional)
    </Form.Label>
    <Form.Control
      type="text"
      value={formData.purchaseQuotation.manualQuotationNo}
      onChange={(e) => handleChange("purchaseQuotation", "manualQuotationNo", e.target.value)}
      placeholder="e.g. QTN-CUST-001"
      className="form-control-no-border text-end flex-grow-1"
      style={{
        fontSize: "1rem",
        lineHeight: "1.5",
        minHeight: "auto",
        padding: "0.375rem 0.75rem",
        textAlign: "right"
      }}
    />
  </div>
</Form.Group>
    {/* Vendor No */}
    <Form.Group>
      <Form.Control
        type="text"
        value={formData.purchaseOrder.vendorNo}
        onChange={(e) => handleChange('purchaseOrder', 'vendorNo', e.target.value)}
        placeholder="Vendor No."
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          textAlign: "right"
        }}
      />
    </Form.Group>
  </div>
</Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            {/* Vendor and Ship To Sections */}
            <Row className="mb-4 d-flex justify-content-between">
              <Col md={6} className="d-flex flex-column align-items-start">
                <h5>VENDOR</h5>
                <Form.Group className="mb-2 w-100">
                  <Form.Label>ATN: Name / Dept</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.purchaseOrder.vendorAttn}
                    onChange={(e) => handleChange("purchaseOrder", "vendorAttn", e.target.value)}
                    placeholder="Attention Name / Department"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Form.Control
                      type="text"
                      value={formData.purchaseOrder.vendorName}
                      onChange={(e) => handleChange("purchaseOrder", "vendorName", e.target.value)}
                      placeholder="Vendor Name"
                      className="form-control-no-border"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
                    />
                  
                  </div>
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    type="text"
                    value={formData.purchaseOrder.vendorAddress}
                    onChange={(e) => handleChange("purchaseOrder", "vendorAddress", e.target.value)}
                    placeholder="Vendor Address"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    type="text"
                    value={formData.purchaseOrder.vendorPhone}
                    onChange={(e) => handleChange("purchaseOrder", "vendorPhone", e.target.value)}
                    placeholder="Phone"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    type="email"
                    value={formData.purchaseOrder.vendorEmail}
                    onChange={(e) => handleChange("purchaseOrder", "vendorEmail", e.target.value)}
                    placeholder="Email"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex flex-column align-items-end">
                <h5>SHIP TO</h5>
                <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
                  <Form.Group className="mb-2">
                    <Form.Label>ATN: Name / Dept</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.purchaseOrder.shipToAttn}
                      onChange={(e) => handleChange("purchaseOrder", "shipToAttn", e.target.value)}
                      placeholder="Attention Name / Department"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      value={formData.purchaseOrder.shipToCompanyName}
                      onChange={(e) => handleChange("purchaseOrder", "shipToCompanyName", e.target.value)}
                      placeholder="Company Name"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      value={formData.purchaseOrder.shipToAddress}
                      onChange={(e) => handleChange("purchaseOrder", "shipToAddress", e.target.value)}
                      placeholder="Company Address"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      value={formData.purchaseOrder.shipToPhone}
                      onChange={(e) => handleChange("purchaseOrder", "shipToPhone", e.target.value)}
                      placeholder="Phone"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="email"
                      value={formData.purchaseOrder.shipToEmail}
                      onChange={(e) => handleChange("purchaseOrder", "shipToEmail", e.target.value)}
                      placeholder="Email"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                </div>
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            {/* Items Table */}
            <div className="mt-4">{renderItemsTable('purchaseOrder')}</div>
            
            {/* Totals - Moved to left side */}
            <Row className="mb-4 mt-2">
              <Col md={4}>
                <Table bordered size="sm" className="dark-bordered-table">
                  <tbody>
                    <tr>
                      <td className="fw-bold">Sub Total:</td>
                      <td>${calculateTotalAmount(formData.purchaseOrder.items).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Total:</td>
                      <td className="fw-bold">
                        ${calculateTotalAmount(formData.purchaseOrder.items).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            
            {/* Terms & Conditions */}
            <Form.Group className="mt-4">
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.purchaseOrder.terms}
                onChange={(e) => handleChange('purchaseOrder', 'terms', e.target.value)}
                style={{ border: "1px solid #343a40" }} 
              />
            </Form.Group>
            
            {/* Attachment Fields */}
            {renderAttachmentFields("purchaseOrder")}
            
            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={handleSkip}>Skip</Button>
              <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
              <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
              <Button variant="success" onClick={handleNext}>Next</Button>
            </div>
          </Form>
        </Tab>
        
        {/* ============= GOODS RECEIPT TAB ============= */}
        <Tab eventKey="goodsReceipt" title="Goods Receipt">
          <Form>
            {/* Header: Logo + Company Info + Title */}
            <Row className="mb-4 d-flex justify-content-between">
              <Col md={3} className="d-flex align-items-center justify-content-center">
                <div
                  className="border rounded d-flex flex-column align-items-center justify-content-center"
                  style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer" }}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                  <input id="logo-upload" type="file" accept="image/*" hidden />
                </div>
              </Col>
  
              <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
                <h2 className="text-success mb-0">GOODS RECEIPT NOTE</h2>
                <hr
                  style={{
                    width: "80%",
                    borderColor: "#28a745",
                    marginTop: "5px",
                    marginBottom: "10px",
                  }}
                />
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            <Row className="mb-4 mt-3">
              <Col md={6}>
                <div className="d-flex flex-column align-items-end justify-content-center gap-1">
                  <Form.Control
                    type="text"
                    value={formData.goodsReceipt.companyName}
                    onChange={(e) => handleChange("goodsReceipt", "companyName", e.target.value)}
                    placeholder="Your Company Name"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.goodsReceipt.companyAddress}
                    onChange={(e) => handleChange("goodsReceipt", "companyAddress", e.target.value)}
                    placeholder="Company Address, City, State, Pincode"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="email"
                    value={formData.goodsReceipt.companyEmail}
                    onChange={(e) => handleChange("goodsReceipt", "companyEmail", e.target.value)}
                    placeholder="Company Email"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.goodsReceipt.companyPhone}
                    onChange={(e) => handleChange("goodsReceipt", "companyPhone", e.target.value)}
                    placeholder="Phone No."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </div>
              </Col>
              <Col md={6} className="d-flex flex-column align-items-end">
  <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
    
    {/* Date */}
    <Form.Group>
      <Form.Control
        type="date"
        value={formData.goodsReceipt.receiptDate}
        onChange={(e) => handleChange("goodsReceipt", "receiptDate", e.target.value)}
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          textAlign: "right"
        }}
      />
    </Form.Group>

    {/* Ref No. (Auto) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginRight: "8px"
          }}
        >
          Ref No.
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.goodsReceipt.referenceId}
          readOnly
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            fontWeight: "500",
            backgroundColor: "#f8f9fa",
            color: "#495057",
            cursor: "not-allowed",
            textAlign: "right",
            flexGrow: 1
          }}
        />
      </div>
    </Form.Group>

    {/* Manual Ref No. (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual Ref. No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.goodsReceipt.manualRefNo}
          onChange={(e) => handleChange("goodsReceipt", "manualRefNo", e.target.value)}
          placeholder="e.g. GRN-CUST-001"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>

    {/* Receipt No. (Auto) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginRight: "8px"
          }}
        >
          Receipt No.
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.goodsReceipt.receiptNo}
          readOnly
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            fontWeight: "500",
            backgroundColor: "#f8f9fa",
            color: "#495057",
            cursor: "not-allowed",
            textAlign: "right",
            flexGrow: 1
          }}
        />
      </div>
    </Form.Group>

    {/* Manual Receipt No. (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual GR No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.goodsReceipt.manualReceiptNo}
          onChange={(e) => handleChange("goodsReceipt", "manualReceiptNo", e.target.value)}
          placeholder="e.g. GR-CUST-001"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>

    {/* Purchase Order No (Auto from PO) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginRight: "8px"
          }}
        >
          Purchase Order No
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.goodsReceipt.purchaseOrderNo}
          readOnly
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            fontWeight: "500",
            backgroundColor: "#f8f9fa",
            color: "#495057",
            cursor: "not-allowed",
            textAlign: "right",
            flexGrow: 1
          }}
        />
      </div>
    </Form.Group>

    {/* Manual PO No (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual PO No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.goodsReceipt.manualPurchaseOrderNo}
          onChange={(e) => handleChange("goodsReceipt", "manualPurchaseOrderNo", e.target.value)}
          placeholder="e.g. PO-CUSTOM-001"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>

    {/* Vehicle No */}
    <Form.Group>
      <Form.Control
        type="text"
        value={formData.goodsReceipt.vehicleNo}
        onChange={(e) => handleChange("goodsReceipt", "vehicleNo", e.target.value)}
        placeholder="Vehicle No."
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          textAlign: "right"
        }}
      />
    </Form.Group>
  </div>
</Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            {/* Vendor and Ship To Sections */}
            <Row className="mb-4 d-flex justify-content-between">
              <Col md={6} className="d-flex flex-column align-items-start">
                <h5>VENDOR</h5>
                <Form.Group className="mb-2 w-100">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Form.Control
                      type="text"
                      value={formData.goodsReceipt.vendorName}
                      onChange={(e) => handleChange("goodsReceipt", "vendorName", e.target.value)}
                      placeholder="Vendor Name"
                      className="form-control-no-border"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
                    />
                  
                  </div>
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    type="text"
                    value={formData.goodsReceipt.vendorAddress}
                    onChange={(e) => handleChange("goodsReceipt", "vendorAddress", e.target.value)}
                    placeholder="Vendor Address"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    type="text"
                    value={formData.goodsReceipt.vendorPhone}
                    onChange={(e) => handleChange("goodsReceipt", "vendorPhone", e.target.value)}
                    placeholder="Phone"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    type="email"
                    value={formData.goodsReceipt.vendorEmail}
                    onChange={(e) => handleChange("goodsReceipt", "vendorEmail", e.target.value)}
                    placeholder="Email"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex flex-column align-items-end">
                <h5>SHIP TO</h5>
                <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
                  <Form.Group className="mb-2">
                    <Form.Label>ATN: Name / Dept</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.goodsReceipt.shipToName}
                      onChange={(e) => handleChange("goodsReceipt", "shipToName", e.target.value)}
                      placeholder="Attention Name / Department"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      value={formData.goodsReceipt.shipToAddress}
                      onChange={(e) => handleChange("goodsReceipt", "shipToAddress", e.target.value)}
                      placeholder="Company Address"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      value={formData.goodsReceipt.shipToPhone}
                      onChange={(e) => handleChange("goodsReceipt", "shipToPhone", e.target.value)}
                      placeholder="Phone"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="email"
                      value={formData.goodsReceipt.shipToEmail}
                      onChange={(e) => handleChange("goodsReceipt", "shipToEmail", e.target.value)}
                      placeholder="Email"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                </div>
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            {/* Driver Details */}
            <Row className="mb-4">
              <Col md={6}>
                <h5>Driver Details</h5>
                <Form.Group className="mb-2">
                  <Form.Label>Driver Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.goodsReceipt.driverName}
                    onChange={(e) => handleChange("goodsReceipt", "driverName", e.target.value)}
                    placeholder="Driver Name"
                    style={{ border: "1px solid #343a40" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Driver Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.goodsReceipt.driverPhone}
                    onChange={(e) => handleChange("goodsReceipt", "driverPhone", e.target.value)}
                    placeholder="Driver Phone"
                    style={{ border: "1px solid #343a40" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Items Table */}
            <div className="mt-4">{renderItemsTable('goodsReceipt')}</div>
            
            {/* Totals - Moved to left side */}
            <Row className="mb-4 mt-2">
              <Col md={4}>
                <Table bordered size="sm" className="dark-bordered-table">
                  <tbody>
                    <tr>
                      <td className="fw-bold">Sub Total:</td>
                      <td>${calculateTotalAmount(formData.goodsReceipt.items).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Total:</td>
                      <td className="fw-bold">
                        ${calculateTotalAmount(formData.goodsReceipt.items).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            
            {/* Terms & Conditions */}
            <Form.Group className="mt-4">
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.goodsReceipt.terms}
                onChange={(e) => handleChange('goodsReceipt', 'terms', e.target.value)}
                style={{ border: "1px solid #343a40" }} 
              />
            </Form.Group>
            
            {/* Attachment Fields */}
            {renderAttachmentFields("goodsReceipt")}
            
            {/* Thank You Section */}
            <Row className="text-center mt-5 mb-4 pt-3 border-top">
              <Col>
                <p><strong>Thank you for your business!</strong></p>
                <p className="text-muted">www.yourcompany.com</p>
              </Col>
            </Row>
            
            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={handleSkip}>Skip</Button>
              <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
              <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
              <Button variant="success" onClick={handleNext}>Next</Button>
            </div>
          </Form>
        </Tab>
        
        {/* ============= BILL TAB ============= */}
        <Tab eventKey="bill" title="Bill">
          <Form>
            {/* Header: Logo + Company Info + Title */}
            <Row className="mb-4 d-flex justify-content-between align-items-center">
              <Col md={3} className="d-flex align-items-center justify-content-center">
                <div
                  className="border rounded d-flex flex-column align-items-center justify-content-center"
                  style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer" }}
                  onClick={() => document.getElementById('logo-upload-invoice')?.click()}
                >
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                  <input id="logo-upload-invoice" type="file" accept="image/*" hidden />
                </div>
              </Col>
              <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
                <h2 className="text-success mb-0">PURCHASE BILL</h2>
                <hr
                  style={{
                    width: "80%",
                    borderColor: "#28a745",
                    marginTop: "5px",
                    marginBottom: "10px",
                  }}
                />
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            <Row className="mb-4 mt-3">
              <Col md={6}>
                <div className="d-flex flex-column gap-1">
                  <Form.Control
                    type="text"
                    value={formData.bill.companyName}
                    onChange={(e) => handleChange("bill", "companyName", e.target.value)}
                    placeholder="Your Company Name"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.bill.companyAddress}
                    onChange={(e) => handleChange("bill", "companyAddress", e.target.value)}
                    placeholder="Company Address, City, State, Pincode"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="email"
                    value={formData.bill.companyEmail}
                    onChange={(e) => handleChange("bill", "companyEmail", e.target.value)}
                    placeholder="Company Email"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.bill.companyPhone}
                    onChange={(e) => handleChange("bill", "companyPhone", e.target.value)}
                    placeholder="Phone No."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </div>
              </Col>
         <Col md={6} className="d-flex flex-column align-items-end">
  <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
    {/* Bill Date */}
    <Form.Group>
      <Form.Control
        type="date"
        value={formData.bill.billDate}
        onChange={(e) => handleChange("bill", "billDate", e.target.value)}
        placeholder="Bill Date"
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          textAlign: "right"
        }}
      />
    </Form.Group>

    {/* Ref No. (Auto) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap",
            textAlign: "left",
            flexShrink: 0,
            marginRight: "8px"
          }}
        >
          Ref No.
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.bill.referenceId}
          readOnly
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            fontWeight: "500",
            backgroundColor: "#f8f9fa",
            color: "#495057",
            cursor: "not-allowed",
            textAlign: "right",
            flexGrow: 1
          }}
        />
      </div>
    </Form.Group>

    {/* Manual Ref. No. (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual Ref. No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.bill.manualRefNo}
          onChange={(e) => handleChange("bill", "manualRefNo", e.target.value)}
          placeholder="e.g. BILL-CUST-REF"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>

    {/* Bill No. (Auto) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap",
            textAlign: "left",
            flexShrink: 0,
            marginRight: "8px"
          }}
        >
          Bill No.
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.bill.billNo || ""}
          readOnly
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            fontWeight: "500",
            backgroundColor: "#f8f9fa",
            color: "#495057",
            cursor: "not-allowed",
            textAlign: "right",
            flexGrow: 1
          }}
        />
      </div>
    </Form.Group>

    {/* Manual Bill No. (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual Bill No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.bill.manualBillNo || ""}
          onChange={(e) => handleChange("bill", "manualBillNo", e.target.value)}
          placeholder="e.g. INV-CUST-001"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>

    {/* Goods Receipt No (Auto) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap",
            textAlign: "left",
            flexShrink: 0,
            marginRight: "8px"
          }}
        >
          Goods Receipt No
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.bill.goodsReceiptNo || ""}
          readOnly
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            fontWeight: "500",
            backgroundColor: "#f8f9fa",
            color: "#495057",
            cursor: "not-allowed",
            textAlign: "right",
            flexGrow: 1
          }}
        />
      </div>
    </Form.Group>

    {/* Manual Goods Receipt No (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual GR No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.bill.manualGoodsReceiptNo || ""}
          onChange={(e) => handleChange("bill", "manualGoodsReceiptNo", e.target.value)}
          placeholder="e.g. GR-CUST-REF"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>

    {/* Due Date */}
    <Form.Group>
      <Form.Label
        className="mb-0"
        style={{
          fontSize: "0.9rem",
          color: "#6c757d",
          whiteSpace: "nowrap",
          display: "block",
          textAlign: "right"
        }}
      >
        Due Date
      </Form.Label>
      <Form.Control
        type="date"
        value={formData.bill.dueDate}
        onChange={(e) => handleChange("bill", "dueDate", e.target.value)}
        placeholder="Due Date"
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          textAlign: "right"
        }}
      />
    </Form.Group>
  </div>
</Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            {/* Vendor Info */}
            <Row className="mb-4 d-flex justify-content-between">
              <Col md={6} className="d-flex flex-column align-items-start">
                <h5>VENDOR</h5>
                <Form.Group className="mb-2 w-100">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Form.Control
                      type="text"
                      value={formData.bill.vendorName}
                      onChange={(e) => handleChange("bill", "vendorName", e.target.value)}
                      placeholder="Vendor Name"
                      className="form-control-no-border"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
                    />
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => navigate('/Company/vendorscreditors')}
                      title="Add Vendor"
                    >
                      Add Vendor
                    </Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.bill.vendorAddress}
                    onChange={(e) => handleChange("bill", "vendorAddress", e.target.value)}
                    placeholder="Vendor Address"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    type="email"
                    value={formData.bill.vendorEmail}
                    onChange={(e) => handleChange("bill", "vendorEmail", e.target.value)}
                    placeholder="Email"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    type="text"
                    value={formData.bill.vendorPhone}
                    onChange={(e) => handleChange("bill", "vendorPhone", e.target.value)}
                    placeholder="Phone"
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex flex-column align-items-end">
                <h5>SHIP TO</h5>
                <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      value={formData.bill.shipToName || ""}
                      onChange={(e) => handleChange("bill", "shipToName", e.target.value)}
                      placeholder="Name"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      value={formData.bill.shipToAddress || ""}
                      onChange={(e) => handleChange("bill", "shipToAddress", e.target.value)}
                      placeholder="Address"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="email"
                      value={formData.bill.shipToEmail || ""}
                      onChange={(e) => handleChange("bill", "shipToEmail", e.target.value)}
                      placeholder="Email"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      value={formData.bill.shipToPhone || ""}
                      onChange={(e) => handleChange("bill", "shipToPhone", e.target.value)}
                      placeholder="Phone"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                </div>
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            {/* Items Table */}
            <div className="mt-4">{renderItemsTable('bill')}</div>
            
            {/* Totals - Moved to left side */}
            <Row className="mb-4 mt-2">
              <Col md={4}>
                <Table bordered size="sm" className="dark-bordered-table">
                  <tbody>
                    <tr>
                      <td className="fw-bold">Sub Total:</td>
                      <td>${calculateTotalAmount(formData.bill.items).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Total Due:</td>
                      <td className="fw-bold">${calculateTotalAmount(formData.bill.items).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            
            {/* Terms & Conditions */}
            <Form.Group className="mt-4">
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.bill.terms}
                onChange={(e) => handleChange("bill", "terms", e.target.value)}
                placeholder="e.g. Payment within 15 days. Late fees may apply."
                style={{ border: "1px solid #343a40" }} 
              />
            </Form.Group>
            
            {/* Attachment Fields */}
            {renderAttachmentFields("bill")}
            
            {/* Footer Note */}
            <Row className="text-center mt-5 mb-4 pt-3">
              <Col>
                <Form.Control
                  type="text"
                  value={formData.bill.footerNote}
                  onChange={(e) => handleChange("bill", "footerNote", e.target.value)}
                  className="text-center mb-2 fw-bold"
                  placeholder=" Thank you for your business!"
                />
              </Col>
            </Row>
            
            {/* Navigation */}
            <div className="d-flex justify-content-between mt-4 border-top pt-3">
              <Button variant="secondary" onClick={handleSkip}>Skip</Button>
              <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
              <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
              <Button variant="success" onClick={handleNext}>Next</Button>
            </div>
          </Form>
        </Tab>
        
        <Tab eventKey="payment" title="Payment">
          <Form>
            {/* Header: Logo + Title */}
            <Row className="mb-4 d-flex justify-content-between align-items-center">
              <Col md={3} className="d-flex align-items-center justify-content-center">
                <div
                  className="border rounded d-flex flex-column align-items-center justify-content-center"
                  style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer" }}
                  onClick={() => document.getElementById('logo-upload-payment')?.click()}
                >
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                  <input id="logo-upload-payment" type="file" accept="image/*" hidden />
                </div>
              </Col>
              <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
                <h2 className="text-success mb-0">PAYMENT RECEIPT</h2>
                <hr
                  style={{
                    width: "80%",
                    borderColor: "#28a745",
                    marginTop: "5px",
                    marginBottom: "10px",
                  }}
                />
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            <Row className="mb-4 mt-3">
              <Col md={6}>
                <div className="d-flex flex-column gap-1">
                  <Form.Control
                    type="text"
                    value={formData.payment.companyName}
                    onChange={(e) => handleChange("payment", "companyName", e.target.value)}
                    placeholder=" Enter Your Company Name. . . . ."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.payment.companyAddress}
                    onChange={(e) => handleChange("payment", "companyAddress", e.target.value)}
                    placeholder="Company Address, City, State, Pincode  . . . "
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="email"
                    value={formData.payment.companyEmail}
                    onChange={(e) => handleChange("payment", "companyEmail", e.target.value)}
                    placeholder="Company Email. . . ."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.payment.companyPhone}
                    onChange={(e) => handleChange("payment", "companyPhone", e.target.value)}
                    placeholder="Phone No....."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </div>
              </Col>
        <Col md={6} className="d-flex flex-column align-items-end">
  <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
    {/* Payment Date */}
    <Form.Group>
      <Form.Control
        type="date"
        value={formData.payment.paymentDate}
        onChange={(e) => handleChange("payment", "paymentDate", e.target.value)}
        placeholder="Payment Date"
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          textAlign: "right"
        }}
      />
    </Form.Group>

    {/* Ref No. (Auto) */}
    <Form.Group className="mb-0">
          <div className="d-flex justify-content-between align-items-center">
      <Form.Label
        className="mb-0"
        style={{
          fontSize: "0.9rem",
          color: "#6c757d",
          whiteSpace: "nowrap",
          display: "block",
          textAlign: "right"
        }}
      >
        Ref No.
      </Form.Label>
      <Form.Control
        type="text"
        value={formData.payment.referenceId}
        readOnly
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          fontWeight: "500",
          backgroundColor: "#f8f9fa",
          color: "#495057",
          cursor: "not-allowed",
          textAlign: "right"
        }}


      />
         </div>  
      
    </Form.Group>

    {/* Manual Ref. No. (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual Ref. No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.payment.manualRefNo}
          onChange={(e) => handleChange("payment", "manualRefNo", e.target.value)}
          placeholder="e.g. PAY-CUST-REF"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>
 
    {/* Bill No. (Auto) */}
    <Form.Group className="mb-0">
         <div className="d-flex justify-content-between align-items-center">
      <Form.Label
        className="mb-0"
        style={{
          fontSize: "0.9rem",
          color: "#6c757d",
          whiteSpace: "nowrap",
          display: "block",
          textAlign: "right"
        }}
      >
        Bill No.
      </Form.Label>
      <Form.Control
        type="text"
        value={formData.payment.billNo || ""}
        readOnly
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          fontWeight: "500",
          backgroundColor: "#f8f9fa",
          color: "#495057",
          cursor: "not-allowed",
          textAlign: "right"
        }}
      />
        </div>
    </Form.Group>
     

    {/* Manual Bill No. (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual Bill No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.payment.manualBillNo || ""}
          onChange={(e) => handleChange("payment", "manualBillNo", e.target.value)}
          placeholder="e.g. INV-CUST-REF"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>

    {/* Payment No. (Auto) */}
    <Form.Group className="mb-0">
         <div className="d-flex justify-content-between align-items-center">
      <Form.Label
        className="mb-0"
        style={{
          fontSize: "0.9rem",
          color: "#6c757d",
          whiteSpace: "nowrap",
          display: "block",
          textAlign: "right"
        }}
      >
        Payment No.
      </Form.Label>
      <Form.Control
        type="text"
        value={formData.payment.paymentNo || ""}
        readOnly
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          fontWeight: "500",
          backgroundColor: "#f8f9fa",
          color: "#495057",
          cursor: "not-allowed",
          textAlign: "right"
        }}
      />
</div>

    </Form.Group>

    {/* Manual Payment No. (Optional) */}
    <Form.Group className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label
          className="mb-0 flex-shrink-0 me-2"
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            whiteSpace: "nowrap"
          }}
        >
          Manual Payment No. (Optional)
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.payment.manualPaymentNo || ""}
          onChange={(e) => handleChange("payment", "manualPaymentNo", e.target.value)}
          placeholder="e.g. PAY-CUST-001"
          className="form-control-no-border text-end flex-grow-1"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0.375rem 0.75rem",
            textAlign: "right"
          }}
        />
      </div>
    </Form.Group>

    {/* Payment Method */}
    <Form.Group>
      <Form.Control
        type="text"
        value={formData.payment.paymentMethod}
        onChange={(e) => handleChange("payment", "paymentMethod", e.target.value)}
        placeholder="Payment Method"
        className="form-control-no-border text-end"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
          textAlign: "right"
        }}
      />
    </Form.Group>
  </div>
</Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            <Row className="mb-4 d-flex justify-content-between">
              <Col md={6} className="d-flex flex-column align-items-start">
                <h5>PAID TO</h5>
                <Form.Group className="mb-2 w-100">
  <Form.Control
    type="text"
    value={formData.payment.vendorName || ""}
    onChange={(e) => handleChange("payment", "vendorName", e.target.value)}
    placeholder="Enter Vendor Name. . . . . ."
    className="form-control-no-border"
    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
  />
</Form.Group>
                <Form.Group className="mb-1 w-100">
                  <Form.Control
                    rows={2}
                    value={formData.payment.vendorAddress || ""}
                    onChange={(e) => handleChange("payment", "vendorAddress", e.target.value)}
                    placeholder="Vendor Address. . . .  ."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    type="email"
                    value={formData.payment.vendorEmail || ""}
                    onChange={(e) => handleChange("payment", "vendorEmail", e.target.value)}
                    placeholder="Email. . . . . "
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
                <Form.Group className="mb-2 w-100">
                  <Form.Control
                    type="text"
                    value={formData.payment.vendorPhone || ""}
                    onChange={(e) => handleChange("payment", "vendorPhone", e.target.value)}
                    placeholder="Phone. . . . . . ."
                    className="form-control-no-border"
                    style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex flex-column align-items-end">
                <h5>PAYMENT DETAILS</h5>
                <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
                  <Form.Group className="mb-2">
                    <Form.Label>Amount Paid</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.payment.amount}
                      onChange={(e) => handleChange("payment", "amount", e.target.value)}
                      placeholder="Amount"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Total Amount</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={(
                        parseFloat(formData.payment.totalAmount) ||
                        calculateTotalAmount(formData.bill.items)
                      ).toFixed(2)}
                      readOnly
                      className="form-control-no-border text-end"
                      style={{ textAlign: "right" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Payment Status</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.payment.paymentStatus}
                      onChange={(e) => handleChange("payment", "paymentStatus", e.target.value)}
                      placeholder="Payment Status"
                      className="form-control-no-border text-end"
                      style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                    />
                  </Form.Group>
                </div>
              </Col>
            </Row>
            
            <hr
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#28a745",
                border: "none",
                marginTop: "5px",
                marginBottom: "10px",
              }}
            />
            
            <Row className="mb-4 mt-2">
              <Col md={4}>
                <Table bordered size="sm" className="dark-bordered-table">
                  <tbody>
                    <tr>
                      <td className="fw-bold">Total Bill:</td>
                      <td>
                        ${(
                          parseFloat(formData.payment.totalAmount) ||
                          calculateTotalAmount(formData.bill.items)
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="fw-bold">
                      <td>Amount Paid:</td>
                      <td>${(parseFloat(formData.payment.amount) || 0).toFixed(2)}</td>
                    </tr>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <td className="fw-bold">Balance:</td>
                      <td className="fw-bold text-danger">
                        ${(
                          (parseFloat(formData.payment.totalAmount) ||
                            calculateTotalAmount(formData.bill.items)) -
                          (parseFloat(formData.payment.amount) || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            
            <Form.Group className="mt-4">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.payment.note}
                onChange={(e) => handleChange("payment", "note", e.target.value)}
                placeholder="e.g. Payment made via UPI / Cash"
                style={{ border: "1px solid #343a40" }} 
              />
            </Form.Group>
            
            {/* Attachment Fields */}
            {renderAttachmentFields("payment")}
            
            <Row className="text-center mt-5 mb-4 pt-3 border-top">
              <Col>
                <Form.Control
                  type="text"
                  value={formData.payment.footerNote}
                  onChange={(e) => handleChange("payment", "footerNote", e.target.value)}
                  className="text-center mb-2 fw-bold"
                  placeholder="Thank you for your payment!"
                />
              </Col>
            </Row>
            
            <div className="d-flex justify-content-between mt-4 border-top pt-3">
              <Button variant="secondary" onClick={handleSkip}>Skip</Button>
              <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
              <Button variant="primary" onClick={handleFinalSubmit}>Submit</Button>
            </div>
          </Form>
        </Tab>
        
      </Tabs>
      
      {/* Hidden PDF View - Only for PDF generation and printing */}
      <div style={{
        visibility: 'hidden',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '210mm',
        padding: '15mm',
        boxSizing: 'border-box',
      }}>
        <div id="pdf-view" ref={pdfRef}>
          {renderPDFView()}
        </div>
      </div>
    </div>
    </>
  );
};

export default MultiStepPurchaseForm;