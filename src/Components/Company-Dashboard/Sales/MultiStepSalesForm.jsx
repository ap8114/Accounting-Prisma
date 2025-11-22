// // MultiStepSalesForm.jsx
// // ... (other imports remain the same)
// import React, { useState, useRef, useEffect } from "react";
// import {
//   Tabs,
//   Tab,
//   Form,
//   Button,
//   Table,
//   Row,
//   Col,
//   Modal,
//   InputGroup,
//   FormControl,
//   Dropdown,
// } from "react-bootstrap";
// import html2pdf from "html2pdf.js";
// import * as XLSX from "xlsx";
// // import "./MultiStepSalesForm.css"; // Ensure this CSS file is included in your project
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faUpload,
//   faTrash,
//   faEye,
//   faEdit,
//   faPlus,
//   faSearch,
//   faUserPlus,
//   faChevronDown,
// } from "@fortawesome/free-solid-svg-icons";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from '../../../Api/axiosInstance';
// import GetCompanyId from '../../../Api/GetCompanyId';

// const MultiStepSalesForm = ({
//   onSubmit,
//   initialData = {},
//   initialStep = "quotation",
//   companyDetails = {}, // Pass company details from parent
//   availableItems = [], // Pass items from parent
//   warehouses = [], // Pass warehouses from parent
//   loadingItems = false, // Pass loading state from parent
//   loadingWarehouses = false, // Pass loading state from parent
// }) => {
//   const navigate = useNavigate();
//   const [key, setKey] = useState(initialStep);
//   const tabsWithItems = [
//     "quotation",
//     "salesOrder",
//     "deliveryChallan",
//     "invoice",
//   ];
//   const formRef = useRef();
//   const pdfRef = useRef();

//   // --- Form Data State ---
//   const [formData, setFormData] = useState(() => {
//     const initialFormData = {
//       quotation: {
//         referenceId: "",
//         manualRefNo: "", // Optional manual ref
//         companyName: companyDetails.name || "",
//         companyAddress: companyDetails.address || "",
//         companyEmail: companyDetails.email || "",
//         companyPhone: companyDetails.phone || "",
//         companyLogo: companyDetails.branding?.company_logo_url || "",
//         companyDarkLogo: companyDetails.branding?.company_dark_logo_url || "",
//         companyIcon: companyDetails.branding?.company_icon_url || "",
//         companyFavicon: companyDetails.branding?.favicon_url || "",
//         quotationNo: "", // Auto-generated Quotation No
//         manualQuotationRef: "", // Optional manual ref
//         quotationDate: new Date().toISOString().split("T")[0],
//         validDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
//         billToName: "",
//         billToAddress: "",
//         billToEmail: "",
//         billToPhone: "",
//         customerId: null, // Add customer ID if available
//         customerReference: "", // Add customer reference if needed
//         items: [
//           {
//             item_name: "", // Changed from 'name' for clarity
//             description: "",
//             qty: "",
//             rate: "",
//             tax: 0,
//             discount: 0,
//             amount: 0, // Calculated amount
//             sellingPrice: 0,
//             uom: "PCS",
//             warehouse: "",
//             hsn: "",
//             sku: "",
//             barcode: "",
//             warehouses: [], // List of warehouses for the item
//           },
//         ],
//         terms: companyDetails.terms_and_conditions || "",
//         notes: companyDetails.notes || "",
//         bankName: companyDetails.bank_details?.bank_name || "",
//         accountNo: companyDetails.bank_details?.account_number || "",
//         accountHolder: companyDetails.bank_details?.account_holder || "",
//         ifsc: companyDetails.bank_details?.ifsc_code || "",
//         signature: "",
//         photo: "",
//         files: [],
//         footerNote: "Thank you!",
//       },
//       salesOrder: {
//         referenceId: "",
//         salesOrderNo: "", // Auto-generated SO No
//         manualOrderRef: "", // Manual SO Ref
//         manualQuotationRef: "", // Manual QUO Ref
//         manualRefNo: "",
//         orderDate: new Date().toISOString().split("T")[0],
//         customerName: "",
//         customerAddress: "",
//         customerEmail: "",
//         customerPhone: "",
//         customerNo: "",
//         companyName: companyDetails.name || "",
//         companyAddress: companyDetails.address || "",
//         companyEmail: companyDetails.email || "",
//         companyPhone: companyDetails.phone || "",
//         companyLogo: companyDetails.branding?.company_logo_url || "",
//         companyDarkLogo: companyDetails.branding?.company_dark_logo_url || "",
//         companyIcon: companyDetails.branding?.company_icon_url || "",
//         companyFavicon: companyDetails.branding?.favicon_url || "",
//         billToAttn: "",
//         billToCompanyName: "",
//         billToAddress: "",
//         billToEmail: "",
//         billToPhone: "",
//         shipToAttn: "",
//         shipToCompanyName: "",
//         shipToAddress: "",
//         shipToEmail: "",
//         shipToPhone: "",
//         items: [
//           { item_name: "", qty: "", rate: "", tax: 0, discount: 0, warehouse: "" },
//         ],
//         sub_total: 0, // Added sub_total
//         total: 0,     // Added total
//         terms: companyDetails.terms_and_conditions || "",
//         signature: "",
//         photo: "",
//         files: [],
//         footerNote: "Thank you!",
//         // 👉 Quotation No (Auto + Manual)
//         quotationNo: "", // Auto-generated QUO No
//         manualQuotationRef: "", // Manual QUO Ref
//       },
//       deliveryChallan: {
//         referenceId: "",
//         challanNo: "", // Auto-generated DC No
//         manualChallanNo: "", // Manual DC Ref
//         manualRefNo: "", // Fallback manual ref
//         challanDate: new Date().toISOString().split("T")[0],
//         vehicleNo: "",
//         driverName: "",
//         driverPhone: "",
//         salesOrderNo: "", // Auto-generated SO No
//         manualSalesOrderRef: "", // Manual SO Ref
//         companyName: companyDetails.name || "",
//         companyAddress: companyDetails.address || "",
//         companyEmail: companyDetails.email || "",
//         companyPhone: companyDetails.phone || "",
//         companyLogo: companyDetails.branding?.company_logo_url || "",
//         companyDarkLogo: companyDetails.branding?.company_dark_logo_url || "",
//         companyIcon: companyDetails.branding?.company_icon_url || "",
//         companyFavicon: companyDetails.branding?.favicon_url || "",
//         billToName: "",
//         billToAddress: "",
//         billToEmail: "",
//         billToPhone: "",
//         shipToName: "",
//         shipToAddress: "",
//         shipToEmail: "",
//         shipToPhone: "",
//         items: [
//           {
//             item_name: "",
//             qty: "",
//             deliveredQty: "",
//             rate: "",
//             tax: 0,
//             discount: 0,
//             warehouse: "",
//           },
//         ],
//         terms: companyDetails.terms_and_conditions || "",
//         signature: "",
//         photo: "",
//         files: [],
//         footerNote: "Thank you!",
//       },
//       invoice: {
//         referenceId: "",
//         invoiceNo: "", // Auto-generated INV No
//         manualInvoiceNo: "", // Manual INV Ref
//         manualRefNo: "", // Fallback manual ref
//         invoiceDate: new Date().toISOString().split("T")[0],
//         dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 days from now
//         challanNo: "", // Auto-generated DC No
//         manualChallanRef: "", // Manual DC Ref
//         manualChallanNo: "",
//         companyName: companyDetails.name || "",
//         companyAddress: companyDetails.address || "",
//         companyEmail: companyDetails.email || "",
//         companyPhone: companyDetails.phone || "",
//         companyLogo: companyDetails.branding?.company_logo_url || "",
//         companyDarkLogo: companyDetails.branding?.company_dark_logo_url || "",
//         companyIcon: companyDetails.branding?.company_icon_url || "",
//         companyFavicon: companyDetails.branding?.favicon_url || "",
//         customerName: "",
//         customerAddress: "",
//         customerEmail: "",
//         customerPhone: "",
//         shipToName: "",
//         shipToAddress: "",
//         shipToEmail: "",
//         shipToPhone: "",
//         items: [
//           {
//             description: "",
//             rate: "",
//             qty: "",
//             tax: "",
//             discount: "",
//             amount: "",
//             warehouse: "",
//           },
//         ],
//         paymentStatus: "Pending",
//         paymentMethod: "",
//         note: "",
//         terms: companyDetails.terms_and_conditions || "",
//         signature: "",
//         photo: "",
//         files: [],
//         footerNote: "Thank you!",
//       },
//       payment: {
//         referenceId: "",
//         paymentNo: "", // Auto-generated PAY No
//         manualPaymentNo: "", // Manual PAY Ref
//         manualRefNo: "", // Fallback manual ref
//         paymentDate: new Date().toISOString().split("T")[0],
//         amount: "",
//         totalAmount: 0, // Calculated from invoice
//         paymentMethod: "",
//         paymentStatus: "Pending",
//         note: "",
//         invoiceNo: "", // Auto-generated INV No
//         manualInvoiceRef: "", // Manual INV Ref
//         customerName: "",
//         customerAddress: "",
//         customerEmail: "",
//         customerPhone: "",
//         companyName: companyDetails.name || "",
//         companyAddress: companyDetails.address || "",
//         companyEmail: companyDetails.email || "",
//         companyPhone: companyDetails.phone || "",
//         companyLogo: companyDetails.branding?.company_logo_url || "",
//         companyDarkLogo: companyDetails.branding?.company_dark_logo_url || "",
//         companyIcon: companyDetails.branding?.company_icon_url || "",
//         companyFavicon: companyDetails.branding?.favicon_url || "",
//         signature: "",
//         photo: "",
//         files: [],
//         footerNote: "Thank you!",
//       },
//     };
//     // Merge initialData if provided (guard against null/undefined)
//     Object.keys(initialData || {}).forEach((tabKey) => {
//       if (initialFormData[tabKey]) {
//         initialFormData[tabKey] = { ...initialFormData[tabKey], ...initialData[tabKey] };
//       }
//     });
//     return initialFormData;
//   });

//   // Fetch company details by logged-in company id and populate all steps
//   useEffect(() => {
//     const company_id = GetCompanyId();
//     if (!company_id) return;
//     const fetchCompany = async () => {
//       try {
//         const response = await axiosInstance.get(`auth/Company/${company_id}`);
//         const company = response?.data?.data;
//         if (!company) return;
//         setFormData((prev) => {
//           const mapCompanyToTab = (tab) => ({
//             ...prev[tab],
//             companyName: company.name || prev[tab].companyName,
//             companyAddress: company.address || prev[tab].companyAddress,
//             companyEmail: company.email || prev[tab].companyEmail,
//             companyPhone: company.phone || prev[tab].companyPhone,
//             companyLogo: company.branding?.company_logo_url || prev[tab].companyLogo,
//             companyDarkLogo: company.branding?.company_dark_logo_url || prev[tab].companyDarkLogo,
//             companyIcon: company.branding?.company_icon_url || prev[tab].companyIcon,
//             companyFavicon: company.branding?.favicon_url || prev[tab].companyFavicon,
//             terms: company.terms_and_conditions || prev[tab].terms,
//             notes: company.notes || prev[tab].notes,
//             bankName: company.bank_details?.bank_name || prev[tab].bankName,
//             accountNo: company.bank_details?.account_number || prev[tab].accountNo,
//             accountHolder: company.bank_details?.account_holder || prev[tab].accountHolder,
//             ifsc: company.bank_details?.ifsc_code || prev[tab].ifsc,
//           });
//           return {
//             ...prev,
//             quotation: mapCompanyToTab('quotation'),
//             salesOrder: mapCompanyToTab('salesOrder'),
//             deliveryChallan: mapCompanyToTab('deliveryChallan'),
//             invoice: mapCompanyToTab('invoice'),
//             payment: mapCompanyToTab('payment'),
//           };
//         });
//       } catch (err) {
//         console.error('Failed to fetch company details:', err);
//       }
//     };
//     fetchCompany();
//   }, []);

//   // Search state for each row
//   const [rowSearchTerms, setRowSearchTerms] = useState({});
//   const [showRowSearch, setShowRowSearch] = useState({});

//   // Search state for each row's warehouse
//   const [warehouseSearchTerms, setWarehouseSearchTerms] = useState({});
//   const [showWarehouseSearch, setShowWarehouseSearch] = useState({});

//   // Modals and state for adding items/services
//   const [showAdd, setShowAdd] = useState(false);
//   const [showEdit, setShowEdit] = useState(false);
//   const [showServiceModal, setShowServiceModal] = useState(false);
//   const [showUOMModal, setShowUOMModal] = useState(false);
//   const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
//   const [newCategory, setNewCategory] = useState("");
//   const [newItem, setNewItem] = useState({
//     name: "",
//     category: "",
//     hsn: "",
//     tax: 0,
//     sellingPrice: 0,
//     uom: "PCS",
//   });
//   const [serviceForm, setServiceForm] = useState({
//     name: "",
//     serviceDescription: "",
//     price: "",
//     tax: "",
//   });

//   // Customer search state (for Quotation Tab)
//   const [customerList, setCustomerList] = useState([]); // Should come from parent or API call
//   const [filteredCustomerList, setFilteredCustomerList] = useState([]);
//   const [customerSearchTerm, setCustomerSearchTerm] = useState('');
//   const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [productList, setProductList] = useState(availableItems || []);
//   const searchRef = useRef(null);
//   const dropdownRef = useRef(null);

//   // When a customer is selected in the quotation tab, propagate basic customer info to all steps
//   useEffect(() => {
//     if (!selectedCustomer) return;
//     setFormData((prev) => ({
//       ...prev,
//       quotation: {
//         ...prev.quotation,
//         billToName: selectedCustomer.name_english || selectedCustomer.name || '',
//         billToAddress: selectedCustomer.address || '',
//         billToEmail: selectedCustomer.email || '',
//         billToPhone: selectedCustomer.phone || selectedCustomer.mobile || '',
//         customerId: selectedCustomer.id || prev.quotation.customerId,
//       },
//       salesOrder: {
//         ...prev.salesOrder,
//         customerName: selectedCustomer.name_english || selectedCustomer.name || '',
//         customerAddress: selectedCustomer.address || '',
//         customerEmail: selectedCustomer.email || '',
//         customerPhone: selectedCustomer.phone || selectedCustomer.mobile || '',
//         billToAttn: selectedCustomer.name_english || selectedCustomer.name || '',
//         billToCompanyName: selectedCustomer.company_name || selectedCustomer.name_english || '',
//         billToAddress: selectedCustomer.address || '',
//         billToEmail: selectedCustomer.email || '',
//         billToPhone: selectedCustomer.phone || selectedCustomer.mobile || '',
//       },
//       deliveryChallan: {
//         ...prev.deliveryChallan,
//         billToName: selectedCustomer.name_english || selectedCustomer.name || '',
//         billToAddress: selectedCustomer.address || '',
//         billToEmail: selectedCustomer.email || '',
//         billToPhone: selectedCustomer.phone || selectedCustomer.mobile || '',
//       },
//       invoice: {
//         ...prev.invoice,
//         customerName: selectedCustomer.name_english || selectedCustomer.name || '',
//         customerAddress: selectedCustomer.address || '',
//         customerEmail: selectedCustomer.email || '',
//         customerPhone: selectedCustomer.phone || selectedCustomer.mobile || '',
//       },
//       payment: {
//         ...prev.payment,
//         customerName: selectedCustomer.name_english || selectedCustomer.name || '',
//         customerAddress: selectedCustomer.address || '',
//         customerEmail: selectedCustomer.email || '',
//         customerPhone: selectedCustomer.phone || selectedCustomer.mobile || '',
//       },
//     }));
//   }, [selectedCustomer]);

//   // Categories (could also come from parent)
//   const [categories, setCategories] = useState([
//     "Electronics",
//     "Furniture",
//     "Apparel",
//     "Food",
//     "Books",
//     "Automotive",
//     "Medical",
//     "Software",
//     "Stationery",
//     "Other",
//   ]);

//   // Fetch initial data (example placeholder - parent should handle this)
//   useEffect(() => {
//     // Example: setCustomerList([]); // Fetch from parent prop or API
//     setFilteredCustomerList(customerList);
//   }, [customerList]);

//   // --- Reference ID and Auto-Number Generation ---
//   const generateReferenceId = (tabKey) => {
//     const prefixes = {
//       quotation: "QUO",
//       salesOrder: "SO",
//       deliveryChallan: "DC",
//       invoice: "INV",
//       payment: "PAY",
//     };
//     const prefix = prefixes[tabKey] || "REF";
//     const year = new Date().getFullYear();
//     const rand = Math.floor(1000 + Math.random() * 9000);
//     return `${prefix}-${year}-${rand}`;
//   };

//   // --- Auto-fill Logic ---
//   useEffect(() => {
//     // Quotation Auto-fill
//     if (!formData.quotation.referenceId) {
//       handleChange("quotation", "referenceId", generateReferenceId("quotation"));
//     }
//     if (!formData.quotation.quotationNo) {
//       if (formData.quotation.manualQuotationRef) {
//         handleChange("quotation", "quotationNo", formData.quotation.manualQuotationRef);
//       } else {
//         handleChange("quotation", "quotationNo", generateReferenceId("quotation"));
//       }
//     }
//     if (formData.quotation.manualQuotationRef && formData.quotation.manualQuotationRef !== formData.quotation.quotationNo) {
//       handleChange("quotation", "quotationNo", formData.quotation.manualQuotationRef);
//     }

//     // Sales Order Auto-fill
//     if (!formData.salesOrder.referenceId) {
//       handleChange("salesOrder", "referenceId", generateReferenceId("salesOrder"));
//     }
//     if (!formData.salesOrder.salesOrderNo) {
//       if (formData.salesOrder.manualOrderRef) {
//         handleChange("salesOrder", "salesOrderNo", formData.salesOrder.manualOrderRef);
//       } else {
//         handleChange("salesOrder", "salesOrderNo", generateReferenceId("salesOrder"));
//       }
//     }
//     if (formData.salesOrder.manualOrderRef && formData.salesOrder.manualOrderRef !== formData.salesOrder.salesOrderNo) {
//       handleChange("salesOrder", "salesOrderNo", formData.salesOrder.manualOrderRef);
//     }
//     if (!formData.salesOrder.quotationNo && formData.quotation.quotationNo) {
//       handleChange("salesOrder", "quotationNo", formData.quotation.quotationNo);
//     }
//     if (formData.salesOrder.manualQuotationRef && formData.salesOrder.manualQuotationRef !== formData.salesOrder.quotationNo) {
//       handleChange("salesOrder", "quotationNo", formData.salesOrder.manualQuotationRef);
//     }

//     // Delivery Challan Auto-fill
//     if (!formData.deliveryChallan.referenceId) {
//       handleChange("deliveryChallan", "referenceId", generateReferenceId("deliveryChallan"));
//     }
//     if (!formData.deliveryChallan.challanNo) {
//       if (formData.deliveryChallan.manualChallanNo) {
//         handleChange("deliveryChallan", "challanNo", formData.deliveryChallan.manualChallanNo);
//       } else {
//         handleChange("deliveryChallan", "challanNo", generateReferenceId("deliveryChallan"));
//       }
//     }
//     if (formData.deliveryChallan.manualChallanNo && formData.deliveryChallan.manualChallanNo !== formData.deliveryChallan.challanNo) {
//       handleChange("deliveryChallan", "challanNo", formData.deliveryChallan.manualChallanNo);
//     }
//     if (!formData.deliveryChallan.salesOrderNo && formData.salesOrder.salesOrderNo) {
//       handleChange("deliveryChallan", "salesOrderNo", formData.salesOrder.salesOrderNo);
//     }

//     // Invoice Auto-fill
//     if (!formData.invoice.referenceId) {
//       handleChange("invoice", "referenceId", generateReferenceId("invoice"));
//     }
//     if (!formData.invoice.invoiceNo) {
//       if (formData.invoice.manualInvoiceNo) {
//         handleChange("invoice", "invoiceNo", formData.invoice.manualInvoiceNo);
//       } else {
//         handleChange("invoice", "invoiceNo", generateReferenceId("invoice"));
//       }
//     }
//     if (formData.invoice.manualInvoiceNo && formData.invoice.manualInvoiceNo !== formData.invoice.invoiceNo) {
//       handleChange("invoice", "invoiceNo", formData.invoice.manualInvoiceNo);
//     }
//     if (!formData.invoice.challanNo && formData.deliveryChallan.challanNo) {
//       handleChange("invoice", "challanNo", formData.deliveryChallan.challanNo);
//     }

//     // Payment Auto-fill
//     if (!formData.payment.referenceId) {
//       handleChange("payment", "referenceId", generateReferenceId("payment"));
//     }
//     if (!formData.payment.paymentNo) {
//       if (formData.payment.manualPaymentNo) {
//         handleChange("payment", "paymentNo", formData.payment.manualPaymentNo);
//       } else {
//         handleChange("payment", "paymentNo", generateReferenceId("payment"));
//       }
//     }
//     if (formData.payment.manualPaymentNo && formData.payment.manualPaymentNo !== formData.payment.paymentNo) {
//       handleChange("payment", "paymentNo", formData.payment.manualPaymentNo);
//     }
//     if (!formData.payment.invoiceNo && formData.invoice.invoiceNo) {
//       handleChange("payment", "invoiceNo", formData.invoice.invoiceNo);
//     }
//   }, [
//     formData.quotation.referenceId, formData.quotation.quotationNo, formData.quotation.manualQuotationRef,
//     formData.salesOrder.referenceId, formData.salesOrder.salesOrderNo, formData.salesOrder.manualOrderRef, formData.salesOrder.quotationNo, formData.salesOrder.manualQuotationRef,
//     formData.deliveryChallan.referenceId, formData.deliveryChallan.challanNo, formData.deliveryChallan.manualChallanNo, formData.deliveryChallan.salesOrderNo,
//     formData.invoice.referenceId, formData.invoice.invoiceNo, formData.invoice.manualInvoiceNo, formData.invoice.challanNo,
//     formData.payment.referenceId, formData.payment.paymentNo, formData.payment.manualPaymentNo, formData.payment.invoiceNo,
//   ]);

//   // --- Handlers ---
//   const handleChange = (tab, field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [tab]: { ...prev[tab], [field]: value },
//     }));
//   };

//   const handleItemChange = (tab, index, field, value) => {
//     const updatedItems = [...formData[tab].items];
//     updatedItems[index][field] = value;
//     // Recalculate amount if rate or qty changes
//     if (field === "rate" || field === "qty") {
//       const rate = parseFloat(updatedItems[index].rate) || 0;
//       const qty = parseFloat(updatedItems[index].qty) || 0;
//       updatedItems[index].amount = rate * qty;
//     }
//     setFormData((prev) => ({
//       ...prev,
//       [tab]: { ...prev[tab], items: updatedItems },
//     }));
//   };

//   const handleProductChange = (field, value) => {
//     setNewItem((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleServiceInput = (e) => {
//     const { name, value } = e.target;
//     setServiceForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const addItem = (tab) => {
//     setFormData((prev) => ({
//       ...prev,
//       [tab]: {
//         ...prev[tab],
//         items: [
//           ...prev[tab].items,
//           { item_name: "", qty: "", rate: "", tax: 0, discount: 0, warehouse: "" },
//         ],
//       },
//     }));
//   };

//   const removeItem = (tab, index) => {
//     const updatedItems = [...formData[tab].items];
//     updatedItems.splice(index, 1);
//     setFormData((prev) => ({
//       ...prev,
//       [tab]: { ...prev[tab], items: updatedItems },
//     }));
//   };

//   // --- Row Search Handlers ---
//   const handleRowSearchChange = (tab, index, value) => {
//     setRowSearchTerms((prev) => ({
//       ...prev,
//       [`${tab}-${index}`]: value,
//     }));
//   };

//   const handleSelectSearchedItem = (tab, index, item) => {
//     const updatedItems = [...formData[tab].items];
//     // Support different API shapes: products use `item_name` and `sale_price` etc.
//     const name = item.name || item.item_name || '';
//     const rate = item.price || item.sale_price || item.sellingPrice || item.rate || '';
//     const tax = item.tax || item.tax_percent || 0;
//     const discount = item.discount || item.discount_percent || 0; // Added discount
//     const hsn = item.hsn || '';
//     const uom = item.uom || item.unit_detail?.uom_name || updatedItems[index].uom || 'PCS';
//     const description = item.description || item.prod_description || updatedItems[index].description || '';
//     const sku = item.sku || item.SKU || '';
//     const barcode = item.barcode || '';
//     const warehousesForItem = item.warehouses || item.warehouses_list || [];

//     updatedItems[index] = {
//       ...updatedItems[index],
//       item_name: name,
//       rate: rate,
//       tax: tax,
//       discount: discount, // Added discount
//       hsn: hsn,
//       uom: uom,
//       description: description,
//       sku: sku,
//       barcode: barcode,
//       warehouses: warehousesForItem,
//     };

//     if (warehousesForItem && warehousesForItem.length > 0) {
//       updatedItems[index].warehouse = warehousesForItem[0].warehouse_name || warehousesForItem[0].warehouse || '';
//     } else {
//       updatedItems[index].warehouse = "";
//     }

//     setFormData((prev) => ({
//       ...prev,
//       [tab]: { ...prev[tab], items: updatedItems },
//     }));
//     setShowRowSearch((prev) => ({
//       ...prev,
//       [`${tab}-${index}`]: false,
//     }));
//     setRowSearchTerms((prev) => ({
//       ...prev,
//       [`${tab}-${index}`]: "",
//     }));
//   };

//   const toggleRowSearch = (tab, index) => {
//     const rowKey = `${tab}-${index}`;
//     setShowRowSearch((prev) => ({
//       ...prev,
//       [rowKey]: !prev[rowKey],
//     }));
//   };

//   // --- Warehouse Search Handlers ---
//   const handleWarehouseSearchChange = (tab, index, value) => {
//     setWarehouseSearchTerms((prev) => ({
//       ...prev,
//       [`${tab}-${index}`]: value,
//     }));
//   };

//   const handleSelectSearchedWarehouse = (tab, index, warehouse) => {
//     handleItemChange(tab, index, "warehouse", warehouse.warehouse_name);
//     setShowWarehouseSearch((prev) => ({
//       ...prev,
//       [`${tab}-${index}`]: false,
//     }));
//     setWarehouseSearchTerms((prev) => ({
//       ...prev,
//       [`${tab}-${index}`]: "",
//     }));
//   };

//   const toggleWarehouseSearch = (tab, index) => {
//     const rowKey = `${tab}-${index}`;
//     setShowWarehouseSearch((prev) => ({
//       ...prev,
//       [rowKey]: !prev[rowKey],
//     }));
//   };

//   // --- Calculation Functions ---
//   const calculateTotalAmount = (items) => {
//     if (!Array.isArray(items)) return 0;
//     return items.reduce((total, item) => {
//       const rate = parseFloat(item.rate) || 0;
//       const qty = parseInt(item.qty) || 0;
//       return total + rate * qty;
//     }, 0);
//   };

//   const calculateTotalWithTaxAndDiscount = (items) => {
//     if (!Array.isArray(items)) return 0;
//     return items.reduce((total, item) => {
//       const rate = parseFloat(item.rate) || 0;
//       const qty = parseInt(item.qty) || 0;
//       const tax = parseFloat(item.tax) || 0;
//       const discount = parseFloat(item.discount) || 0; // Added discount
//       const subtotal = rate * qty;
//       const taxAmount = (subtotal * tax) / 100;
//       return total + subtotal + taxAmount - discount; // Subtract discount
//     }, 0);
//   };

//   // --- Top Buttons ---
//   const handlePrint = (lang) => {
//     const printContent = pdfRef.current;
//     if (!printContent) {
//       alert("No content to print!");
//       return;
//     }
//     // Mock Arabic translation
//     const getArabicText = (text) => {
//       const translations = {
//         "QUOTATION": "عرض أسعار",
//         "SALES ORDER": "طلب بيع",
//         "DELIVERY CHALLAN": "إيصال توصيل",
//         "INVOICE": "فاتورة",
//         "PAYMENT RECEIPT": "إيصال دفع",
//         "Company Name": "اسم الشركة",
//         "Quotation No.": "رقم عرض السعر",
//         "SO No.": "رقم أمر المبيعات",
//         "Challan No.": "رقم الإيصال",
//         "Invoice No.": "رقم الفاتورة",
//         "Payment No.": "رقم الدفع",
//         Date: "التاريخ",
//         "Item Name": "اسم الصنف",
//         Qty: "الكمية",
//         Rate: "السعر",
//         Amount: "المبلغ",
//         Total: "الإجمالي",
//         Attachments: "المرفقات",
//         Signature: "التوقيع",
//         Photo: "الصورة",
//         Files: "الملفات",
//         "Terms & Conditions": "الشروط والأحكام",
//         "Thank you for your business!": "شكرًا لتعاملكم معنا!",
//         "Driver Details": "تفاصيل السائق",
//         "Vehicle No.": "رقم المركبة",
//         "Delivery Date": "تاريخ التسليم",
//         "Due Date": "تاريخ الاستحقاق",
//         "Payment Method": "طريقة الدفع",
//         "Bill To": "موجه إلى",
//         "Ship To": "يشحن إلى",
//         "Sub Total:": "المجموع الفرعي:",
//         "Tax:": "الضريبة:",
//         "Discount:": "الخصم:",
//         "Total:": "الإجمالي:",
//         "Notes": "ملاحظات",
//         "Bank Details": "بيانات البنك",
//       };
//       return translations[text] || text;
//     };

//     const clone = printContent.cloneNode(true);
//     const elements = clone.querySelectorAll("*");

//     if (lang === "arabic" || lang === "both") {
//       clone.style.direction = "rtl";
//       clone.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
//       elements.forEach((el) => {
//         el.style.textAlign = "right";
//       });
//     }

//     if (lang === "both") {
//       elements.forEach((el) => {
//         const text = el.innerText.trim();
//         if (text && !el.querySelector("img") && !el.querySelector("input")) {
//           const arabic = getArabicText(text);
//           if (arabic !== text) {
//             const arSpan = document.createElement("div");
//             arSpan.innerText = arabic;
//             arSpan.style.color = "#0066cc";
//             arSpan.style.marginTop = "4px";
//             arSpan.style.fontSize = "0.9em";
//             el.appendChild(arSpan);
//           }
//         }
//       });
//     } else if (lang === "arabic") {
//       elements.forEach((el) => {
//         const text = el.innerText.trim();
//         const arabic = getArabicText(text);
//         if (arabic !== text) {
//           el.innerText = arabic;
//         }
//       });
//     }

//     const printWindow = window.open("", "", "height=800,width=1000");
//     printWindow.document.write("<html><head><title>Print</title>");
//     printWindow.document.write("<style>");
//     printWindow.document.write(`
//       body { font-family: Arial, sans-serif; margin: 20px; }
//       table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//       th, td { border: 1px solid #000; padding: 8px; text-align: left; }
//       .text-end { text-align: right; }
//       .fw-bold { font-weight: bold; }
//       hr { border: 2px solid #28a745; margin: 10px 0; }
//       h2, h4, h5 { color: #28a745; }
//       .attachment-img { max-width: 150px; max-height: 100px; object-fit: contain; margin: 5px 0; }
//     `);
//     printWindow.document.write("</style></head><body>");
//     printWindow.document.write(clone.outerHTML);
//     printWindow.document.write("</body></html>");
//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.onload = () => {
//       printWindow.print();
//     };
//   };

//   const handleSend = () => {
//     window.location.href = `mailto:?subject=Sales Document&body=Please find the sales document details attached.`;
//   };

//   const handleDownloadPDF = () => {
//     const element = pdfRef.current;
//     html2pdf()
//       .from(element)
//       .set({
//         margin: 10,
//         filename: `${key}-${formData[key].quotationNo || formData[key].salesOrderNo || formData[key].challanNo || formData[key].invoiceNo || formData[key].paymentNo || "document"
//           }.pdf`,
//         jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
//         html2canvas: { scale: 3 },
//         pagebreak: { mode: ["avoid-all", "css", "legacy"] },
//       })
//       .save();
//   };

//   const handleDownloadExcel = () => {
//     const worksheet = XLSX.utils.json_to_sheet(formData[key].items);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, key);
//     XLSX.writeFile(
//       workbook,
//       `${key}-${formData[key][`${key}No`] || "draft"}.xlsx`
//     );
//   };

//   // --- Navigation Buttons ---
//   const handleSkip = () => {
//     setKey((prev) => {
//       if (prev === "quotation") return "salesOrder";
//       if (prev === "salesOrder") return "deliveryChallan";
//       if (prev === "deliveryChallan") return "invoice";
//       if (prev === "invoice") return "payment";
//       return "quotation";
//     });
//   };

//   const handleSaveDraft = () => {
//     onSubmit(formData, key); // If parent needs to save draft
//   };

//   const handleSaveNext = () => {
//     handleSaveDraft();
//     setKey((prev) => {
//       if (prev === "quotation") {
//         const quotationSubTotal = calculateTotalAmount(formData.quotation.items);
//         const quotationTotal = calculateTotalWithTaxAndDiscount(formData.quotation.items);

//         setFormData((prevData) => ({
//           ...prevData,
//           salesOrder: {
//             ...prevData.salesOrder,
//             quotationNo: prevData.quotation.quotationNo,
//             orderDate: prevData.quotation.quotationDate,
//             customerName: prevData.quotation.billToName,
//             customerAddress: prevData.quotation.billToAddress,
//             customerEmail: prevData.quotation.billToEmail,
//             customerPhone: prevData.quotation.billToPhone,
//             companyName: prevData.quotation.companyName,
//             companyAddress: prevData.quotation.companyAddress,
//             companyEmail: prevData.quotation.companyEmail,
//             companyPhone: prevData.quotation.companyPhone,
//             companyLogo: prevData.quotation.companyLogo,
//             companyDarkLogo: prevData.quotation.companyDarkLogo,
//             companyIcon: prevData.quotation.companyIcon,
//             companyFavicon: prevData.quotation.companyFavicon,
//             billToAttn: prevData.quotation.billToName, // Map to new fields
//             billToCompanyName: prevData.quotation.billToName,
//             billToAddress: prevData.quotation.billToAddress,
//             billToEmail: prevData.quotation.billToEmail,
//             billToPhone: prevData.quotation.billToPhone,
//             shipToAttn: prevData.quotation.billToName, // Map to new fields
//             shipToCompanyName: prevData.quotation.billToName,
//             shipToAddress: prevData.quotation.billToAddress,
//             shipToEmail: prevData.quotation.billToEmail,
//             shipToPhone: prevData.quotation.billToPhone,
//             items: prevData.quotation.items.map((item) => ({
//               item_name: item.item_name,
//               qty: item.qty,
//               rate: item.rate,
//               tax: item.tax, // Propagate tax
//               discount: item.discount, // Propagate discount
//               warehouse: item.warehouse || "",
//               warehouses: item.warehouses || [],
//             })),
//             sub_total: quotationSubTotal, // Propagate Sub Total
//             total: quotationTotal,         // Propagate Total
//             terms: prevData.quotation.terms,
//           },
//         }));
//         return "salesOrder";
//       }
//       if (prev === "salesOrder") {
//         setFormData((prevData) => ({
//           ...prevData,
//           deliveryChallan: {
//             ...prevData.deliveryChallan,
//             salesOrderNo: prevData.salesOrder.salesOrderNo,
//             challanDate: new Date().toISOString().split("T")[0],
//             companyName: prevData.salesOrder.companyName,
//             companyAddress: prevData.salesOrder.companyAddress,
//             companyEmail: prevData.salesOrder.companyEmail,
//             companyPhone: prevData.salesOrder.companyPhone,
//             companyLogo: prevData.salesOrder.companyLogo,
//             companyDarkLogo: prevData.salesOrder.companyDarkLogo,
//             companyIcon: prevData.salesOrder.companyIcon,
//             companyFavicon: prevData.salesOrder.companyFavicon,
//             billToName: prevData.salesOrder.billToCompanyName, // Map from SO
//             billToAddress: prevData.salesOrder.billToAddress,
//             billToEmail: prevData.salesOrder.billToEmail,
//             billToPhone: prevData.salesOrder.billToPhone,
//             shipToName: prevData.salesOrder.shipToCompanyName, // Map from SO
//             shipToAddress: prevData.salesOrder.shipToAddress,
//             shipToEmail: prevData.salesOrder.shipToEmail,
//             shipToPhone: prevData.salesOrder.shipToPhone,
//             items: prevData.salesOrder.items.map((item) => ({
//               item_name: item.item_name,
//               qty: item.qty,
//               deliveredQty: item.qty, // Default to ordered qty
//               rate: item.rate,
//               tax: item.tax, // Propagate tax
//               discount: item.discount, // Propagate discount
//               warehouse: item.warehouse || "",
//               warehouses: item.warehouses || [],
//             })),
//             terms: prevData.salesOrder.terms,
//           },
//         }));
//         return "deliveryChallan";
//       }
//       if (prev === "deliveryChallan") {
//         setFormData((prevData) => ({
//           ...prevData,
//           invoice: {
//             ...prevData.invoice,
//             challanNo: prevData.deliveryChallan.challanNo,
//             invoiceDate: new Date().toISOString().split("T")[0],
//             dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
//             customerName: prevData.deliveryChallan.billToName, // Map from DC
//             customerAddress: prevData.deliveryChallan.billToAddress,
//             customerEmail: prevData.deliveryChallan.billToEmail,
//             customerPhone: prevData.deliveryChallan.billToPhone,
//             shipToName: prevData.deliveryChallan.shipToName, // Map from DC
//             shipToAddress: prevData.deliveryChallan.shipToAddress,
//             shipToEmail: prevData.deliveryChallan.shipToEmail,
//             shipToPhone: prevData.deliveryChallan.shipToPhone,
//             companyName: prevData.deliveryChallan.companyName,
//             companyAddress: prevData.deliveryChallan.companyAddress,
//             companyEmail: prevData.deliveryChallan.companyEmail,
//             companyPhone: prevData.deliveryChallan.companyPhone,
//             companyLogo: prevData.deliveryChallan.companyLogo,
//             companyDarkLogo: prevData.deliveryChallan.companyDarkLogo,
//             companyIcon: prevData.deliveryChallan.companyIcon,
//             companyFavicon: prevData.deliveryChallan.companyFavicon,
//             items: prevData.deliveryChallan.items.map((item) => ({
//               description: item.item_name,
//               qty: item.deliveredQty,
//               rate: item.rate,
//               tax: item.tax,
//               discount: item.discount,
//               amount: item.rate * item.deliveredQty,
//               warehouse: item.warehouse || "",
//               warehouses: item.warehouses || [],
//             })),
//             terms: prevData.deliveryChallan.terms,
//           },
//         }));
//         return "invoice";
//       }
//       if (prev === "invoice") {
//         const totalInvoiceAmount = calculateTotalWithTaxAndDiscount(prevData.invoice.items);
//         setFormData((prevData) => ({
//           ...prevData,
//           payment: {
//             ...prevData.payment,
//             invoiceNo: prevData.invoice.invoiceNo,
//             paymentDate: new Date().toISOString().split("T")[0],
//             totalAmount: totalInvoiceAmount,
//             amount: "", // User needs to fill this
//             customerName: prevData.invoice.customerName, // Map from INV
//             customerAddress: prevData.invoice.customerAddress,
//             customerEmail: prevData.invoice.customerEmail,
//             customerPhone: prevData.invoice.customerPhone,
//             companyName: prevData.invoice.companyName,
//             companyAddress: prevData.invoice.companyAddress,
//             companyEmail: prevData.invoice.companyEmail,
//             companyPhone: prevData.invoice.companyPhone,
//             companyLogo: prevData.invoice.companyLogo,
//             companyDarkLogo: prevData.invoice.companyDarkLogo,
//             companyIcon: prevData.invoice.companyIcon,
//             companyFavicon: prevData.invoice.companyFavicon,
//           },
//         }));
//         return "payment";
//       }
//       return "quotation";
//     });
//   };

//   const handleNext = () => {
//     setKey((prev) => {
//       if (prev === "quotation") return "salesOrder";
//       if (prev === "salesOrder") return "deliveryChallan";
//       if (prev === "deliveryChallan") return "invoice";
//       if (prev === "invoice") return "payment";
//       return "quotation";
//     });
//   };

//   const handleFinalSubmit = async () => {
//     try {
//       const companyId = GetCompanyId();
//       if (!companyId) {
//         alert("Company ID not found. Please log in again.");
//         return;
//       }

//       // --- COMPANY INFO ---
//       const companyInfo = {
//         company_id: companyId,
//         company_name: formData.quotation.companyName,
//         company_address: formData.quotation.companyAddress,
//         company_email: formData.quotation.companyEmail,
//         company_phone: formData.quotation.companyPhone,
//         logo_url: formData.quotation.companyLogo || null,
//         bank_name: formData.quotation.bankName || "",
//         account_no: formData.quotation.accountNo || "",
//         account_holder: formData.quotation.accountHolder || "",
//         ifsc_code: formData.quotation.ifsc || "",
//         terms: formData.quotation.terms || "",
//         id: formData.quotation.id || null, // Include ID if it exists
//       };

//       // --- SHIPPING DETAILS ---
//       const shippingDetails = {
//         bill_to_name: formData.quotation.billToName || "",
//         bill_to_address: formData.quotation.billToAddress || "",
//         bill_to_email: formData.quotation.billToEmail || "",
//         bill_to_phone: formData.quotation.billToPhone || "",
//         bill_to_attention_name: formData.salesOrder.billToAttn || null, // From SO if available

//         ship_to_name: formData.salesOrder.shipToCompanyName || "", // From SO if available
//         ship_to_address: formData.salesOrder.shipToAddress || "", // From SO if available
//         ship_to_email: formData.salesOrder.shipToEmail || "", // From SO if available
//         ship_to_phone: formData.salesOrder.shipToPhone || "", // From SO if available
//         ship_to_attention_name: formData.salesOrder.shipToAttn || null, // From SO if available
//       };

//       // --- ITEMS (Using Invoice items as final source) ---
//       const items = formData.invoice.items.map((item) => {
//         const qty = parseInt(item.qty) || 0;
//         const rate = parseFloat(item.rate) || 0;
//         const tax = parseFloat(item.tax) || 0;
//         const discount = parseFloat(item.discount) || 0; // Include discount
//         const subtotal = rate * qty;
//         const taxAmount = (subtotal * tax) / 100;
//         const amount = subtotal + taxAmount - discount; // Calculate final amount

//         return {
//           item_name: item.item_name || item.description || "",
//           qty: qty,
//           rate: rate,
//           tax_percent: tax,
//           discount: discount, // Include discount in payload
//           amount: parseFloat(amount.toFixed(2)), // Round to 2 decimal places
//           warehouse_id: null, // Update if you track warehouse_id from item.warehouses
//           // Potentially add other item-specific fields if needed by backend
//         };
//       });

//       // --- CALCULATE TOTALS ---
//       const sub_total = parseFloat(calculateTotalAmount(formData.invoice.items).toFixed(2));
//       const total = parseFloat(calculateTotalWithTaxAndDiscount(formData.invoice.items).toFixed(2));

//       // --- STEPS DATA ---
//       const steps = {
//         quotation: {
//           quotation_no: formData.quotation.quotationNo,
//           manual_quo_no: formData.quotation.manualQuotationRef || "", // Corrected field name
//           quotation_date: formData.quotation.quotationDate,
//           valid_till: formData.quotation.validDate,
//           qoutation_to_customer_name: formData.quotation.billToName,
//           qoutation_to_customer_address: formData.quotation.billToAddress,
//           qoutation_to_customer_email: formData.quotation.billToEmail,
//           qoutation_to_customer_phone: formData.quotation.billToPhone,
//           notes: formData.quotation.notes || "",
//           customer_ref: formData.quotation.customerReference || "",
//           id: formData.quotation.id || null, // Include ID if it exists
//         },
//         sales_order: {
//           SO_no: formData.salesOrder.salesOrderNo,
//           manual_ref_no: formData.salesOrder.manualOrderRef || null,
//           id: formData.salesOrder.id || null, // Include ID if it exists
//         },
//         delivery_challan: {
//           challan_no: formData.deliveryChallan.challanNo,
//           manual_challan_no: formData.deliveryChallan.manualChallanNo || null,
//           driver_name: formData.deliveryChallan.driverName || null,
//           driver_phone: formData.deliveryChallan.driverPhone || null,
//           id: formData.deliveryChallan.id || null, // Include ID if it exists
//         },
//         invoice: {
//           invoice_no: formData.invoice.invoiceNo,
//           manual_invoice_no: formData.invoice.manualInvoiceNo || null,
//           invoice_date: formData.invoice.invoiceDate,
//           due_date: formData.invoice.dueDate,
//           id: formData.invoice.id || null, // Include ID if it exists
//         },
//         payment: {
//           payment_no: formData.payment.paymentNo,
//           manual_payment_no: formData.payment.manualPaymentNo || null,
//           payment_date: formData.payment.paymentDate,
//           amount_received: parseFloat(formData.payment.amount) || 0,
//           payment_note: formData.payment.note || null,
//           id: formData.payment.id || null, // Include ID if it exists
//         },
//       };

//       // --- ADDITIONAL INFO (Handle large files carefully) ---
//       const additionalInfo = {
//         signature_url: formData.payment.signatureUrl || formData.invoice.signatureUrl || null, // Use URL if available
//         photo_url: formData.payment.photoUrl || formData.invoice.photoUrl || null,           // Use URL if available
//         attachment_url: formData.payment.fileUrls?.length > 0 // Use URL array if available
//           ? formData.payment.fileUrls[0] // Take first URL
//           : formData.invoice.fileUrls?.length > 0
//             ? formData.invoice.fileUrls[0]
//             : null,
//       };

//       // --- FINAL PAYLOAD ---
//       const payload = {
//         company_info: companyInfo,
//         shipping_details: shippingDetails,
//         items: items,
//         sub_total: sub_total,
//         total: total,
//         steps: steps,
//         additional_info: additionalInfo,
//       };

//       console.log("Submitting Sales Order Payload:", payload); // Log the final payload for debugging

//       // --- POST TO API ---
//       const response = await axiosInstance.post("sales-order/create-sales-order", payload);

//       if (response.status === 200 || response.status === 201) {
//         alert("✅ Sales order submitted successfully!");
//         // Optionally, reset the form or navigate away
//         // onSubmit(formData, "payment"); // Call parent callback if needed
//       } else {
//         throw new Error(`Submission failed with status: ${response.status}`);
//       }
//     } catch (error) {
//       console.error("Submission Error:", error);
//       // Provide more specific error feedback if possible
//       if (error.response) {
//         console.error("Server Response:", error.response.data);
//         console.error("Status Code:", error.response.status);
//         alert(`❌ Submission failed: ${error.response.data.message || 'Server Error'}. Check console.`);
//       } else if (error.request) {
//         console.error("Network Request Error:", error.request);
//         alert("❌ Network error. Please check your connection.");
//       } else {
//         console.error("General Error:", error.message);
//         alert(`❌ An error occurred: ${error.message}`);
//       }
//     }
//   };
//   // File handlers
//   const handleSignatureChange = async (tab, e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Implement file upload logic here
//       // const url = await uploadFile(file); // Replace with your upload function
//       // handleChange(tab, "signatureUrl", url); // Store the URL
//       // handleChange(tab, "signature", ""); // Clear base64 if stored
//       console.log("Signature file selected:", file.name);
//       // Placeholder: Read as DataURL for immediate preview, but don't store in final payload
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         // Set a temporary preview URL if needed for UI
//         // handleChange(tab, "signaturePreview", reader.result);
//         // For submission, this should be replaced by the actual URL after upload
//         console.warn("Base64 signature stored temporarily. Implement file upload to get URL.");
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handlePhotoChange = async (tab, e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Implement file upload logic here
//       // const url = await uploadFile(file); // Replace with your upload function
//       // handleChange(tab, "photoUrl", url); // Store the URL
//       // handleChange(tab, "photo", ""); // Clear base64 if stored
//       console.log("Photo file selected:", file.name);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         // Set a temporary preview URL if needed for UI
//         // handleChange(tab, "photoPreview", reader.result);
//         // For submission, this should be replaced by the actual URL after upload
//         console.warn("Base64 photo stored temporarily. Implement file upload to get URL.");
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleFileChange = async (tab, e) => {
//     const files = Array.from(e.target.files);
//     for (const file of files) {
//       // Implement file upload logic here for each file
//       // const url = await uploadFile(file); // Replace with your upload function
//       // const fileInfo = { name: file.name, url: url }; // Store name and URL
//       // handleChange(tab, "fileUrls", [...formData[tab].fileUrls, url]); // Add URL to array
//       console.log("Attachment file selected:", file.name);
//       // Placeholder: Read as DataURL for immediate preview, but don't store in final payload
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         // For submission, this should be replaced by the actual URL after upload
//         console.warn("Base64 attachment stored temporarily. Implement file upload to get URL.");
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeFile = (tab, index) => {
//     const updatedFiles = [...formData[tab].files];
//     updatedFiles.splice(index, 1);
//     handleChange(tab, "files", updatedFiles);
//   };

//   const handleAddItem = () => {
//     if (!newItem.name || !newItem.category) {
//       alert("Product name and category are required!");
//       return;
//     }
//     const itemToAdd = {
//       item_name: newItem.name,
//       qty: 1,
//       rate: newItem.sellingPrice,
//       tax: newItem.tax,
//       discount: 0,
//       hsn: newItem.hsn,
//       uom: newItem.uom,
//       warehouse: "",
//     };
//     const tab = key;
//     setFormData((prev) => ({
//       ...prev,
//       [tab]: {
//         ...prev[tab],
//         items: [...prev[tab].items, itemToAdd],
//       },
//     }));
//     setNewItem({
//       name: "",
//       category: "",
//       hsn: "",
//       tax: 0,
//       sellingPrice: 0,
//       uom: "PCS",
//     });
//     setShowAdd(false);
//   };

//   const handleUpdateItem = () => {
//     console.log("Update item:", newItem);
//     setShowEdit(false);
//   };

//   const handleAddCategory = (e) => {
//     e.preventDefault();
//     if (newCategory && !categories.includes(newCategory)) {
//       setCategories((prev) => [...prev, newCategory]);
//       setNewItem((prev) => ({ ...prev, category: newCategory }));
//       setNewCategory("");
//     }
//     setShowAddCategoryModal(false);
//   };

//   const handleAddService = () => {
//     if (!serviceForm.name || !serviceForm.price) {
//       alert("Service name and price are required!");
//       return;
//     }
//     const serviceItem = {
//       item_name: serviceForm.name,
//       qty: 1,
//       rate: serviceForm.price,
//       tax: serviceForm.tax || 0,
//       discount: 0,
//       description: serviceForm.serviceDescription,
//       warehouse: "",
//     };
//     setFormData((prev) => ({
//       ...prev,
//       [key]: {
//         ...prev[key],
//         items: [...prev[key].items, serviceItem],
//       },
//     }));
//     setServiceForm({
//       name: "",
//       serviceDescription: "",
//       price: "",
//       tax: "",
//     });
//     setShowServiceModal(false);
//   };

//   // --- Quotation Tab Specific Handlers ---
//   // Filter customers based on search term
//   useEffect(() => {
//     const term = (customerSearchTerm || '').trim();
//     if (!term) {
//       setFilteredCustomerList(customerList);
//       return;
//     }
//     const lower = term.toLowerCase();
//     const digits = term.replace(/\D/g, '');
//     const filtered = customerList.filter(customer => {
//       const nameMatch = (customer?.name_english || '').toString().toLowerCase().includes(lower);
//       const companyMatch = (customer?.company_name || '').toString().toLowerCase().includes(lower);
//       const emailMatch = (customer?.email || '').toString().toLowerCase().includes(lower);
//       const phoneFields = [customer?.phone, customer?.mobile, customer?.contact, customer?.phone_no, customer?.mobile_no];
//       const phoneMatch = digits ? phoneFields.some(p => p && p.toString().replace(/\D/g, '').includes(digits)) : false;
//       return !!(nameMatch || companyMatch || emailMatch || phoneMatch);
//     });
//     setFilteredCustomerList(filtered);
//   }, [customerSearchTerm, customerList]);

//   // Handle clicks outside the customer dropdown to close it
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
//         searchRef.current && !searchRef.current.contains(event.target)) {
//         setShowCustomerDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Fetch customers for the logged-in company so search works by name/phone
//   useEffect(() => {
//     const company_id = GetCompanyId();
//     if (!company_id) return;
//     const fetchCustomers = async () => {
//       try {
//         const res = await axiosInstance.get(`vendorCustomer/company/${company_id}?type=customer`);
//         const data = res?.data?.data || [];
//         setCustomerList(data);
//         setFilteredCustomerList(data);
//       } catch (err) {
//         console.error('Failed to fetch customers:', err);
//       }
//     };
//     fetchCustomers();
//   }, []);

//   // Fetch products for the company and keep local productList used by item search
//   useEffect(() => {
//     const company_id = GetCompanyId();
//     if (!company_id) return;
//     const fetchProducts = async () => {
//       try {
//         const res = await axiosInstance.get(`products/company/${company_id}`);
//         const data = res?.data?.data || [];
//         setProductList(data);
//       } catch (err) {
//         console.error('Failed to fetch products:', err);
//         // fallback to availableItems prop if provided
//         setProductList(availableItems || []);
//       }
//     };
//     fetchProducts();
//   }, []);

//   // Keep productList in sync when parent passes availableItems prop
//   useEffect(() => {
//     if (availableItems && availableItems.length > 0) setProductList(availableItems);
//   }, [availableItems]);

//   const handleCustomerSelect = (customer) => {
//     setSelectedCustomer(customer);
//     handleChange("quotation", "billToName", customer.name_english || '');
//     handleChange("quotation", "billToAddress", customer.address || '');
//     handleChange("quotation", "billToEmail", customer.email || '');
//     handleChange("quotation", "billToPhone", customer.phone || '');
//     handleChange("quotation", "customerId", customer.id);
//     setCustomerSearchTerm(customer.name_english);
//     setShowCustomerDropdown(false);
//   };

//   // --- Render Functions ---
//   const renderItemsTable = (tab) => {
//     const items = formData[tab]?.items || [];
//     const handleItemChange = (index, field, value) => {
//       const updatedItems = [...items];
//       updatedItems[index][field] = value;
//       // Recalculate amount if rate or qty changes
//       if (field === "rate" || field === "qty") {
//         const rate = parseFloat(updatedItems[index].rate) || 0;
//         const qty = parseFloat(updatedItems[index].qty) || 0;
//         updatedItems[index].amount = rate * qty;
//       }
//       setFormData((prev) => ({
//         ...prev,
//         [tab]: { ...prev[tab], items: updatedItems },
//       }));
//     };

//     const addItem = () => {
//       setFormData((prev) => ({
//         ...prev,
//         [tab]: {
//           ...prev[tab],
//           items: [
//             ...items,
//             { item_name: "", qty: "", rate: "", tax: 0, discount: 0, warehouse: "" },
//           ],
//         },
//       }));
//     };

//     const removeItem = (idx) => {
//       const updatedItems = items.filter((_, index) => index !== idx);
//       setFormData((prev) => ({
//         ...prev,
//         [tab]: { ...prev[tab], items: updatedItems },
//       }));
//     };

//     // Filter items based on search term for each row
//     const getFilteredItems = (index) => {
//       const searchTerm = (rowSearchTerms[`${tab}-${index}`] || "").trim();
//       if (!searchTerm) return productList;
//       const lower = searchTerm.toLowerCase();
//       return productList.filter((item) => {
//         const name = (item.name || item.item_name || '').toString().toLowerCase();
//         const category = (item.category || item.item_category?.item_category_name || '').toString().toLowerCase();
//         const sku = (item.sku || item.SKU || '').toString().toLowerCase();
//         const barcode = (item.barcode || '').toString().toLowerCase();
//         const desc = (item.description || '').toString().toLowerCase();
//         return (
//           name.includes(lower) ||
//           category.includes(lower) ||
//           sku.includes(lower) ||
//           barcode.includes(lower) ||
//           desc.includes(lower)
//         );
//       });
//     };

//     // Get warehouses to display in the dropdown for a specific row
//     const getWarehousesForDropdown = (item) => {
//       if (item.item_name && item.warehouses && item.warehouses.length > 0) {
//         return item.warehouses;
//       }
//       return warehouses.map((wh) => ({ ...wh, stock_qty: null }));
//     };

//     // Filter warehouses based on search term for each row
//     const getFilteredWarehouses = (index) => {
//       const item = items[index];
//       const searchTerm = warehouseSearchTerms[`${tab}-${index}`] || "";
//       const warehousesToFilter = getWarehousesForDropdown(item);
//       if (!searchTerm) return warehousesToFilter;
//       return warehousesToFilter.filter(
//         (wh) =>
//           wh.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           (wh.location && wh.location.toLowerCase().includes(searchTerm.toLowerCase()))
//       );
//     };

//     return (
//       <div>
//         <div className="d-flex justify-content-between mb-2">
//           <div>
//             <Button
//               size="sm"
//               onClick={addItem}
//               style={{
//                 backgroundColor: "#53b2a5",
//                 border: "none",
//                 padding: "6px 12px",
//                 fontWeight: "500",
//                 marginRight: "5px",
//               }}
//             >
//               <FontAwesomeIcon icon={faPlus} /> Add Row
//             </Button>
//             <Button
//               size="sm"
//               onClick={() => setShowAdd(true)}
//               style={{
//                 backgroundColor: "#53b2a5",
//                 border: "none",
//                 padding: "6px 12px",
//                 fontWeight: "500",
//                 marginRight: "5px",
//               }}
//             >
//               + Add Product
//             </Button>
//             <Button
//               size="sm"
//               onClick={() => setShowServiceModal(true)}
//               style={{
//                 backgroundColor: "#53b2a5",
//                 border: "none",
//                 padding: "6px 12px",
//                 fontWeight: "500",
//               }}
//             >
//               + Add Service
//             </Button>
//           </div>
//         </div>

//         {/* Add Product Modal */}
//         <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
//           <Modal.Header closeButton className="bg-light">
//             <Modal.Title>Add Product</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Product Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="name"
//                   value={newItem.name}
//                   onChange={(e) => handleProductChange(e.target.name, e.target.value)}
//                   placeholder="Enter product name"
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Category</Form.Label>
//                 <div className="d-flex">
//                   <Form.Select
//                     name="category"
//                     value={newItem.category}
//                     onChange={(e) => handleProductChange(e.target.name, e.target.value)}
//                     className="flex-grow-1 me-2"
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((cat, idx) => (
//                       <option key={idx} value={cat}>{cat}</option>
//                     ))}
//                   </Form.Select>
//                   <Button
//                     variant="outline-secondary"
//                     size="sm"
//                     onClick={() => setShowAddCategoryModal(true)}
//                   >
//                     <FontAwesomeIcon icon={faPlus} />
//                   </Button>
//                 </div>
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>HSN Code</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="hsn"
//                   value={newItem.hsn}
//                   onChange={(e) => handleProductChange(e.target.name, e.target.value)}
//                   placeholder="Enter HSN code"
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Selling Price</Form.Label>
//                 <Form.Control
//                   type="number"
//                   step="0.01"
//                   name="sellingPrice"
//                   value={newItem.sellingPrice}
//                   onChange={(e) => handleProductChange(e.target.name, e.target.value)}
//                   placeholder="Enter selling price"
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Tax %</Form.Label>
//                 <Form.Control
//                   type="number"
//                   step="0.01"
//                   name="tax"
//                   value={newItem.tax}
//                   onChange={(e) => handleProductChange(e.target.name, e.target.value)}
//                   placeholder="e.g. 18"
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>UOM</Form.Label>
//                 <div className="d-flex">
//                   <Form.Control
//                     type="text"
//                     name="uom"
//                     value={newItem.uom}
//                     onChange={(e) => handleProductChange(e.target.name, e.target.value)}
//                     placeholder="e.g. PCS"
//                     className="flex-grow-1 me-2"
//                   />
//                   <Button
//                     variant="outline-secondary"
//                     size="sm"
//                     onClick={() => setShowUOMModal(true)}
//                   >
//                     Add
//                   </Button>
//                 </div>
//               </Form.Group>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={() => setShowAdd(false)}>
//               Cancel
//             </Button>
//             <Button
//               style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }}
//               onClick={handleAddItem}
//             >
//               Add Product
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         {/* Service Modal */}
//         <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)} centered>
//           <Modal.Header closeButton className="bg-light">
//             <Modal.Title>Add Service</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Service Name</Form.Label>
//                 <Form.Control
//                   name="name"
//                   value={serviceForm.name}
//                   onChange={handleServiceInput}
//                   required
//                   className="shadow-sm"
//                   placeholder="Enter service name"
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Service Description</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   name="serviceDescription"
//                   value={serviceForm.serviceDescription}
//                   onChange={handleServiceInput}
//                   rows={3}
//                   className="shadow-sm"
//                   placeholder="Describe the service"
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Price</Form.Label>
//                 <Form.Control
//                   type="number"
//                   step="0.01"
//                   name="price"
//                   value={serviceForm.price}
//                   onChange={handleServiceInput}
//                   placeholder="Enter service price"
//                   className="shadow-sm"
//                   required
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Tax %</Form.Label>
//                 <Form.Control
//                   type="number"
//                   step="0.01"
//                   name="tax"
//                   value={serviceForm.tax}
//                   onChange={handleServiceInput}
//                   className="shadow-sm"
//                   placeholder="e.g. 18"
//                 />
//               </Form.Group>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={() => setShowServiceModal(false)}>
//               Cancel
//             </Button>
//             <Button
//               style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }}
//               onClick={handleAddService}
//             >
//               Add Service
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         {/* Add Category Modal */}
//         <Modal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)}>
//           <Modal.Header closeButton>
//             <Modal.Title>Add Category</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form onSubmit={handleAddCategory}>
//               <Form.Group>
//                 <Form.Label>New Category Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={newCategory}
//                   onChange={(e) => setNewCategory(e.target.value)}
//                   placeholder="Enter new category"
//                 />
//               </Form.Group>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={() => setShowAddCategoryModal(false)}>
//               Cancel
//             </Button>
//             <Button variant="primary" onClick={handleAddCategory}>
//               Add Category
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         <Table bordered hover size="sm" className="dark-bordered-table">
//           <thead className="bg-light">
//             <tr>
//               <th>Item Name</th>
//               <th>Warehouse (Stock)</th>
//               <th>Qty</th>
//               {tab === "deliveryChallan" && <th>Delivered Qty</th>}
//               <th>Rate</th>
//               <th>Tax %</th>
//               <th>Discount</th> {/* Added Discount Column */}
//               <th>Amount</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((item, idx) => {
//               const qty = tab === "deliveryChallan" ? parseInt(item.deliveredQty) || 0 : parseInt(item.qty) || 0;
//               const amount = (parseFloat(item.rate) || 0) * qty;
//               const itemRowKey = `${tab}-${idx}`;
//               const filteredItems = getFilteredItems(idx);
//               const isItemSearchVisible = showRowSearch[itemRowKey];
//               const warehouseRowKey = `${tab}-${idx}`;
//               const filteredWarehouses = getFilteredWarehouses(idx);
//               const isWarehouseSearchVisible = showWarehouseSearch[warehouseRowKey];

//               return (
//                 <tr key={idx}>
//                   {/* Item Name Cell with Search */}
//                   <td style={{ position: "relative" }}>
//                     <div style={{ display: "flex", alignItems: "center" }}>
//                       <Form.Control
//                         type="text"
//                         size="sm"
//                         value={item.item_name}
//                         onChange={(e) => {
//                           handleItemChange(idx, "item_name", e.target.value);
//                           handleRowSearchChange(tab, idx, e.target.value);
//                         }}
//                         onFocus={() => toggleRowSearch(tab, idx)}
//                         placeholder="Click to search products"
//                         style={{ marginRight: "5px" }}
//                       />
//                       <Button
//                         variant="outline-secondary"
//                         size="sm"
//                         onClick={() => toggleRowSearch(tab, idx)}
//                         title="Search Items"
//                       >
//                         <FontAwesomeIcon icon={faSearch} />
//                       </Button>
//                     </div>
//                     {isItemSearchVisible && (
//                       <div
//                         style={{
//                           position: "absolute",
//                           top: "100%",
//                           left: 0,
//                           right: 0,
//                           zIndex: 10,
//                           backgroundColor: "white",
//                           border: "1px solid #ccc",
//                           borderRadius: "4px",
//                           boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
//                         }}
//                       >
//                         <InputGroup size="sm">
//                           <InputGroup.Text>
//                             <FontAwesomeIcon icon={faSearch} />
//                           </InputGroup.Text>
//                           <FormControl
//                             placeholder="Search items..."
//                             value={rowSearchTerms[itemRowKey] || ""}
//                             onChange={(e) =>
//                               handleRowSearchChange(tab, idx, e.target.value)
//                             }
//                             autoFocus
//                           />
//                         </InputGroup>
//                         {loadingItems ? (
//                           <div style={{ padding: "8px", textAlign: "center", color: "#666" }}>
//                             Loading products...
//                           </div>
//                         ) : filteredItems.length > 0 ? (
//                           <div style={{ maxHeight: "200px", overflowY: "auto" }}>
//                             {filteredItems.map((filteredItem) => (
//                               <div
//                                 key={filteredItem.id}
//                                 style={{
//                                   padding: "8px",
//                                   cursor: "pointer",
//                                   borderBottom: "1px solid #eee",
//                                 }}
//                                 onClick={() =>
//                                   handleSelectSearchedItem(tab, idx, filteredItem)
//                                 }
//                                 onMouseEnter={(e) =>
//                                   (e.currentTarget.style.backgroundColor = "#f0f0f0")
//                                 }
//                                 onMouseLeave={(e) =>
//                                   (e.currentTarget.style.backgroundColor = "white")
//                                 }
//                               >
//                                 <div><strong>{filteredItem.name || filteredItem.item_name}</strong></div>
//                                 <div style={{ fontSize: "0.8rem", color: "#666" }}>
//                                   {(filteredItem.category || filteredItem.item_category?.item_category_name || '')} - ${((filteredItem.price || filteredItem.sale_price || filteredItem.sellingPrice) ? parseFloat(filteredItem.price || filteredItem.sale_price || filteredItem.sellingPrice).toFixed(2) : '0.00')}
//                                   {(filteredItem.sku || filteredItem.SKU) && <span> | SKU: {filteredItem.sku || filteredItem.SKU}</span>}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div style={{ padding: "8px", textAlign: "center", color: "#666" }}>
//                             No items found
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </td>

//                   {/* Warehouse Cell with Search */}
//                   <td style={{ position: "relative" }}>
//                     <div style={{ display: "flex", alignItems: "center" }}>
//                       <Form.Control
//                         type="text"
//                         size="sm"
//                         value={item.warehouse || ""}
//                         onChange={(e) =>
//                           handleWarehouseSearchChange(tab, idx, e.target.value)
//                         }
//                         onFocus={() => toggleWarehouseSearch(tab, idx)}
//                         placeholder="Click to search warehouses"
//                         style={{ marginRight: "5px" }}
//                         readOnly
//                       />
//                       <Button
//                         variant="outline-secondary"
//                         size="sm"
//                         onClick={() => toggleWarehouseSearch(tab, idx)}
//                         title="Search Warehouses"
//                       >
//                         <FontAwesomeIcon icon={faSearch} />
//                       </Button>
//                     </div>
//                     {isWarehouseSearchVisible && (
//                       <div
//                         style={{
//                           position: "absolute",
//                           top: "100%",
//                           left: 0,
//                           right: 0,
//                           zIndex: 9,
//                           backgroundColor: "white",
//                           border: "1px solid #ccc",
//                           borderRadius: "4px",
//                           boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
//                         }}
//                       >
//                         <InputGroup size="sm">
//                           <InputGroup.Text>
//                             <FontAwesomeIcon icon={faSearch} />
//                           </InputGroup.Text>
//                           <FormControl
//                             placeholder="Search warehouses..."
//                             value={warehouseSearchTerms[warehouseRowKey] || ""}
//                             onChange={(e) =>
//                               handleWarehouseSearchChange(tab, idx, e.target.value)
//                             }
//                             autoFocus
//                           />
//                         </InputGroup>
//                         {loadingWarehouses ? (
//                           <div style={{ padding: "8px", textAlign: "center", color: "#666" }}>
//                             Loading warehouses...
//                           </div>
//                         ) : filteredWarehouses.length > 0 ? (
//                           <div style={{ maxHeight: "200px", overflowY: "auto" }}>
//                             {filteredWarehouses.map((wh) => (
//                               <div
//                                 key={wh.warehouse_id || wh.warehouse_name}
//                                 style={{
//                                   padding: "8px",
//                                   cursor: "pointer",
//                                   borderBottom: "1px solid #eee",
//                                 }}
//                                 onClick={() =>
//                                   handleSelectSearchedWarehouse(tab, idx, wh)
//                                 }
//                                 onMouseEnter={(e) =>
//                                   (e.currentTarget.style.backgroundColor = "#f0f0f0")
//                                 }
//                                 onMouseLeave={(e) =>
//                                   (e.currentTarget.style.backgroundColor = "white")
//                                 }
//                               >
//                                 <div><strong>{wh.warehouse_name}</strong></div>
//                                 <div style={{ fontSize: "0.8rem", color: "#666" }}>
//                                   {wh.stock_qty !== null ? `Stock: ${wh.stock_qty}` : wh.location || "General Warehouse"}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div style={{ padding: "8px", textAlign: "center", color: "#666" }}>
//                             No warehouses found
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </td>

//                   <td>
//                     <Form.Control
//                       type="number"
//                       size="sm"
//                       value={item.qty}
//                       onChange={(e) =>
//                         handleItemChange(idx, "qty", e.target.value)
//                       }
//                       placeholder="Qty"
//                     />
//                   </td>

//                   {tab === "deliveryChallan" && (
//                     <td>
//                       <Form.Control
//                         type="number"
//                         size="sm"
//                         value={item.deliveredQty}
//                         onChange={(e) =>
//                           handleItemChange(idx, "deliveredQty", e.target.value)
//                         }
//                         placeholder="Delivered Qty"
//                       />
//                     </td>
//                   )}

//                   <td>
//                     <Form.Control
//                       type="number"
//                       step="0.01"
//                       size="sm"
//                       value={item.rate}
//                       onChange={(e) =>
//                         handleItemChange(idx, "rate", e.target.value)
//                       }
//                       placeholder="Rate"
//                     />
//                   </td>

//                   <td>
//                     <Form.Control
//                       type="number"
//                       step="0.01"
//                       size="sm"
//                       value={item.tax}
//                       onChange={(e) =>
//                         handleItemChange(idx, "tax", e.target.value)
//                       }
//                       placeholder="Tax %"
//                     />
//                   </td>

//                   <td> {/* Discount Input */}
//                     <Form.Control
//                       type="number"
//                       step="0.01"
//                       size="sm"
//                       value={item.discount}
//                       onChange={(e) =>
//                         handleItemChange(idx, "discount", e.target.value)
//                       }
//                       placeholder="Discount"
//                     />
//                   </td>

//                   <td>
//                     <Form.Control
//                       type="number"
//                       step="0.01"
//                       size="sm"
//                       value={amount.toFixed(2)}
//                       readOnly
//                       style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}
//                     />
//                   </td>

//                   <td>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={() => removeItem(idx)}
//                     >
//                       Delete
//                     </Button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </Table>
//       </div>
//     );
//   };

//   const renderAttachmentFields = (tab) => {
//     return (
//       <div className="mt-4 mb-4">
//         <h5>Attachments</h5>
//         <Row>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Signature</Form.Label>
//               <Form.Control
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleSignatureChange(tab, e)}
//               />
//               {formData[tab].signature && (
//                 <div className="mt-2">
//                   <img
//                     src={formData[tab].signature}
//                     alt="Signature"
//                     style={{
//                       width: "100px",
//                       height: "50px",
//                       objectFit: "contain",
//                     }}
//                   />
//                 </div>
//               )}
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Photo</Form.Label>
//               <Form.Control
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handlePhotoChange(tab, e)}
//               />
//               {formData[tab].photo && (
//                 <div className="mt-2">
//                   <img
//                     src={formData[tab].photo}
//                     alt="Photo"
//                     style={{
//                       width: "100px",
//                       height: "100px",
//                       objectFit: "cover",
//                     }}
//                   />
//                 </div>
//               )}
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Attach Files</Form.Label>
//               <Form.Control
//                 type="file"
//                 multiple
//                 onChange={(e) => handleFileChange(tab, e)}
//               />
//               {formData[tab].files && formData[tab].files.length > 0 && (
//                 <div className="mt-2">
//                   <ul className="list-unstyled">
//                     {formData[tab].files.map((file, index) => (
//                       <li
//                         key={index}
//                         className="d-flex justify-content-between align-items-center"
//                         style={{
//                           maxWidth: "100%",
//                           padding: "6px 8px",
//                           border: "1px solid #ddd",
//                           borderRadius: "6px",
//                           marginBottom: "6px",
//                           background: "#f8f9fa"
//                         }}
//                       >
//                         <span
//                           style={{
//                             maxWidth: "80%",
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                             whiteSpace: "nowrap",   // keeps file name in one line, no overflow
//                           }}
//                         >
//                           {file.name}
//                         </span>

//                         <Button
//                           variant="danger"
//                           size="sm"
//                           onClick={() => removeFile(tab, index)}
//                         >
//                           <FontAwesomeIcon icon={faTrash} />
//                         </Button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </Form.Group>
//           </Col>
//         </Row>
//       </div>
//     );
//   };

//   const formatCompanyAddress = () => {
//     // Prefer populated formData for quotation (fetched company sets this), fallback to companyDetails prop
//     if (formData?.quotation?.companyAddress) return formData.quotation.companyAddress;
//     const parts = [
//       companyDetails.address,
//       companyDetails.city,
//       companyDetails.state,
//       companyDetails.postal_code,
//       companyDetails.country,
//     ].filter(Boolean);
//     return parts.join(', ');
//   };

//   // --- Tab Components Inline ---
//   const renderQuotationTab = () => {
//     return (
//       <Form>
//         {/* Header: Logo + Company Info + Title */}
//         <Row className="mb-4 mt-3">
//           <Col md={3} className="d-flex align-items-center justify-content-center">
//             <div
//               className="border rounded d-flex flex-column align-items-center justify-content-center"
//               style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
//               onClick={() => document.getElementById('logo-upload')?.click()}
//             >
//               {formData.quotation.companyLogo ? (
//                 <img
//                   src={formData.quotation.companyLogo}
//                   alt="Company Logo"
//                   style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
//                   onError={(e) => {
//                     e.target.style.display = 'none';
//                   }}
//                 />
//               ) : (
//                 <>
//                   <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
//                   <small>Upload Logo</small>
//                 </>
//               )}
//               <input id="logo-upload" type="file" accept="image/*" hidden onChange={(e) => {
//                 if (e.target.files[0]) {
//                   handleChange("quotation", "companyLogo", e.target.files[0]);
//                 }
//               }} />
//             </div>
//           </Col>
//           <Col md={6}>
//             <div className="d-flex flex-column gap-1">
//               <Form.Control
//                 type="text"
//                 value={formData?.quotation?.companyName || companyDetails.name || ''}
//                 readOnly
//                 placeholder="Company Name"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", fontWeight: "bold" }}
//               />
//               <Form.Control
//                 type="text"
//                 value={formatCompanyAddress()}
//                 onChange={(e) => handleChange("quotation", "companyAddress", e.target.value)}
//                 placeholder="Company Address, City, State, Pincode......."
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="email"
//                 value={formData?.quotation?.companyEmail || companyDetails.email || ''}
//                 readOnly
//                 placeholder="Company Email"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="text"
//                 value={formData.quotation.companyPhone}
//                 onChange={(e) => handleChange("quotation", "companyPhone", e.target.value)}
//                 placeholder="Phone No........"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </div>
//           </Col>
//           <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
//             <h2 className="text-success mb-0">QUOTATION</h2>
//             <hr
//               style={{
//                 width: "80%",
//                 borderColor: "#28a745",
//                 marginTop: "5px",
//                 marginBottom: "10px",
//               }}
//             />
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />

//         {/* Quotation & Customer Info */}
//         <Row className="mb-4 d-flex justify-content-between">
//           <Col md={8}>
//             <h5>Quotation To</h5>
//             <Form.Group className="mb-2 position-relative">
//               <div className="position-relative" ref={searchRef}>
//                 <Form.Control
//                   type="text"
//                   placeholder="Search Customer..."
//                   value={customerSearchTerm}
//                   onChange={(e) => {
//                     setCustomerSearchTerm(e.target.value);
//                     setShowCustomerDropdown(true);
//                   }}
//                   onFocus={() => {
//                     setShowCustomerDropdown(true);
//                     if (!customerSearchTerm) {
//                       setFilteredCustomerList(customerList);
//                     }
//                   }}
//                 />
//                 <FontAwesomeIcon
//                   icon={faChevronDown}
//                   className="position-absolute end-0 top-50 translate-middle-y me-2 text-muted"
//                   style={{ cursor: 'pointer' }}
//                   onClick={() => {
//                     setShowCustomerDropdown(!showCustomerDropdown);
//                     if (!showCustomerDropdown && !customerSearchTerm) {
//                       setFilteredCustomerList(customerList);
//                     }
//                   }}
//                 />
//               </div>
//               {showCustomerDropdown && filteredCustomerList.length > 0 && (
//                 <div
//                   ref={dropdownRef}
//                   className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm z-index-10"
//                   style={{ maxHeight: '200px', overflowY: 'auto' }}
//                 >
//                   {filteredCustomerList.map(customer => (
//                     <div
//                       key={customer.id}
//                       className="p-2 hover:bg-light cursor-pointer"
//                       onClick={() => handleCustomerSelect(customer)}
//                     >
//                       <div className="fw-bold">{customer.name_english}</div>
//                       {customer.company_name && (
//                         <div className="text-muted small">{customer.company_name}</div>
//                       )}
//                       <div className="text-muted small">{customer.email}</div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {showCustomerDropdown && filteredCustomerList.length === 0 && (
//                 <div
//                   ref={dropdownRef}
//                   className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm z-index-10 p-2 text-muted"
//                 >
//                   No customers found
//                 </div>
//               )}
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Control
//                 type="text"
//                 value={formData.quotation.billToAddress}
//                 onChange={(e) => handleChange("quotation", "billToAddress", e.target.value)}
//                 placeholder="Customer Address"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Control
//                 type="email"
//                 value={formData.quotation.billToEmail}
//                 onChange={(e) => handleChange("quotation", "billToEmail", e.target.value)}
//                 placeholder="Email"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Control
//                 type="text"
//                 value={formData.quotation.billToPhone}
//                 onChange={(e) => handleChange("quotation", "billToPhone", e.target.value)}
//                 placeholder="Phone"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <div className="mt-2">
//               <Button
//                 variant="outline-primary"
//                 size="sm"
//                 onClick={() => navigate('/add-customer')} // Example navigation
//                 title="Add Customer"
//               >
//                 Add Customer
//               </Button>
//             </div>
//           </Col>
//           <Col md={4} className="d-flex flex-column align-items-start">
//             <div className="d-flex flex-column gap-2" style={{ maxWidth: "400px", width: "100%" }}>
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label className="mb-0" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap", flexShrink: 0, marginRight: "8px" }}>
//                     Quotation No.
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.quotation.quotationNo}
//                     readOnly
//                     className="form-control-no-border text-end"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0",
//                       fontWeight: "500",
//                       backgroundColor: "#f8f9fa",
//                       color: "#495057",
//                       cursor: "not-allowed",
//                       textAlign: "right",
//                       flexGrow: 1
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label className="mb-0 flex-shrink-0 me-2" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap" }}>
//                     Manual QUO No (Optional)
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.quotation.manualQuotationRef || ""}
//                     onChange={(e) => handleChange("quotation", "manualQuotationRef", e.target.value)}
//                     placeholder="e.g. QUO-CUST-001"
//                     className="form-control-no-border text-end flex-grow-1"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0.375rem 0.75rem",
//                       textAlign: "right"
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               <Row className="align-items-center g-2 mb-2">
//                 <Col md="auto" className="p-0">
//                   <Form.Label className="mb-0 flex-shrink-0 me-2" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap" }}>
//                     Quotation Date
//                   </Form.Label>
//                 </Col>
//                 <Col className="p-0">
//                   <Form.Control
//                     type="date"
//                     value={formData.quotation.quotationDate}
//                     onChange={(e) => handleChange("quotation", "quotationDate", e.target.value)}
//                     style={{ border: "1px solid #495057", fontSize: "1rem" }}
//                   />
//                 </Col>
//               </Row>
//               <Row className="align-items-center g-2 mb-2">
//                 <Col md="auto" className="p-0">
//                   <Form.Label className="mb-0 flex-shrink-0 me-2" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap" }}>
//                     Valid Till
//                   </Form.Label>
//                 </Col>
//                 <Col className="p-0">
//                   <Form.Control
//                     type="date"
//                     value={formData.quotation.validDate}
//                     onChange={(e) => handleChange("quotation", "validDate", e.target.value)}
//                     style={{ border: "1px solid #495057", fontSize: "1rem" }}
//                   />
//                 </Col>
//               </Row>
//             </div>
//           </Col>
//         </Row>

//         {/* Items Table */}
//         <Row className="mb-4">
//           <Col>{renderItemsTable("quotation")}</Col>
//         </Row>

//         <hr style={{ width: "100%", height: "4px", backgroundColor: "#28a745", border: "none", marginTop: "5px", marginBottom: "10px" }} />

//         {/* Totals */}
//         <Row className="mb-4 mt-2">
//           <Col md={4}>
//             <Table bordered size="sm" className="dark-bordered-table">
//               <tbody>
//                 <tr>
//                   <td className="fw-bold">Sub Total:</td>
//                   <td>
//                     ${calculateTotalAmount(formData.quotation.items).toFixed(2)}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="fw-bold">Tax:</td>
//                   <td>
//                     ${formData.quotation.items.reduce((sum, item) => {
//                       const subtotal = (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0);
//                       return sum + (subtotal * (parseFloat(item.tax) || 0)) / 100;
//                     }, 0).toFixed(2)}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="fw-bold">Discount:</td>
//                   <td>
//                     ${formData.quotation.items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0).toFixed(2)}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="fw-bold">Total:</td>
//                   <td className="fw-bold">
//                     ${calculateTotalWithTaxAndDiscount(formData.quotation.items).toFixed(2)}
//                   </td>
//                 </tr>
//               </tbody>
//             </Table>
//           </Col>
//         </Row>

//         <hr style={{ width: "100%", height: "4px", backgroundColor: "#28a745", border: "none", marginTop: "5px", marginBottom: "10px" }} />

//         {/* Bank & Notes */}
//         <Row className="mb-4">
//           <h5>Bank Details</h5>
//           <Col md={6} className="p-2 rounded" style={{ border: "1px solid #343a40" }}>
//             {['bankName', 'accountNo', 'accountHolder', 'ifsc'].map(field => (
//               <Form.Group key={field} className="mb-2">
//                 <Form.Control
//                   type="text"
//                   placeholder={{
//                     bankName: 'Bank Name',
//                     accountNo: 'Account No.',
//                     accountHolder: 'Account Holder',
//                     ifsc: 'IFSC Code',
//                   }[field]}
//                   value={formData.quotation[field] || ""}
//                   onChange={(e) => handleChange("quotation", field, e.target.value)}
//                   className="form-control-no-border"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//                 />
//               </Form.Group>
//             ))}
//           </Col>
//           <Col md={6}>
//             <h5>Notes</h5>
//             <Form.Control
//               as="textarea"
//               rows={5}
//               placeholder="Enter any additional notes"
//               value={formData.quotation.notes || ""}
//               onChange={(e) => handleChange("quotation", "notes", e.target.value)}
//               style={{ border: "1px solid #343a40" }}
//             />
//           </Col>
//         </Row>

//         <hr style={{ width: "100%", height: "4px", backgroundColor: "#28a745", border: "none", marginTop: "5px", marginBottom: "10px" }} />

//         {/* Terms & Footer */}
//         <Row className="mb-4">
//           <Col>
//             <Form.Group>
//               <Form.Label>Terms & Conditions</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 value={formData.quotation.terms}
//                 onChange={(e) => handleChange("quotation", "terms", e.target.value)}
//                 placeholder="e.g. Payment within 15 days"
//                 style={{ border: "1px solid #343a40" }}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Attachment Fields */}
//         {renderAttachmentFields("quotation")}

//         <Row className="text-center mb-4">
//           <Col>
//             <p><strong>Thank you for your business!</strong></p>
//             <p className="text-muted">www.yourcompany.com</p>
//           </Col>
//         </Row>

//         {/* Navigation */}
//         <div className="d-flex justify-content-between mt-4 border-top pt-3">
//           <Button variant="secondary" onClick={handleSkip}>Skip</Button>
//           <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
//           <Button variant="primary" onClick={handleFinalSubmit}>Submit</Button> {/* Ensure this calls the updated function */}
//         </div>
//       </Form>
//     );
//   };

//   const renderSalesOrderTab = () => {
//     return (
//       <Form>
//         {/* Header: Logo + Company Info + Title */}
//         <Row className="mb-4 d-flex justify-content-between">
//           <Col md={3} className="d-flex align-items-center justify-content-center">
//             <div
//               className="border rounded d-flex flex-column align-items-center justify-content-center"
//               style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
//               onClick={() => document.getElementById('logo-upload-so')?.click()}
//             >
//               {formData.salesOrder.companyLogo ? (
//                 <img
//                   src={formData.salesOrder.companyLogo}
//                   alt="Company Logo"
//                   style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
//                   onError={(e) => { e.target.style.display = 'none'; }}
//                 />
//               ) : (
//                 <>
//                   <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
//                   <small>Upload Logo</small>
//                 </>
//               )}
//               <input id="logo-upload-so" type="file" accept="image/*" hidden onChange={(e) => {
//                 if (e.target.files[0]) handleChange("salesOrder", "companyLogo", e.target.files[0]);
//               }} />
//             </div>
//           </Col>
//           <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
//             <h2 className="text-success mb-0">SALES ORDER FORM</h2>
//             <hr
//               style={{
//                 width: "80%",
//                 borderColor: "#28a745",
//                 marginTop: "5px",
//                 marginBottom: "10px",
//               }}
//             />
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />
//         <Row className="mb-4 mt-3">
//           <Col md={6}>
//             <div className="d-flex flex-column align-items-end justify-content-center gap-1">
//               <Form.Control
//                 type="text"
//                 value={formData.salesOrder.companyName}
//                 onChange={(e) => handleChange("salesOrder", "companyName", e.target.value)}
//                 placeholder="Your Company Name"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="text"
//                 value={formData.salesOrder.companyAddress}
//                 onChange={(e) => handleChange("salesOrder", "companyAddress", e.target.value)}
//                 placeholder="Company Address, City, State, Pincode"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="email"
//                 value={formData.salesOrder.companyEmail}
//                 onChange={(e) => handleChange("salesOrder", "companyEmail", e.target.value)}
//                 placeholder="Company Email"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="text"
//                 value={formData.salesOrder.companyPhone}
//                 onChange={(e) => handleChange("salesOrder", "companyPhone", e.target.value)}
//                 placeholder="Phone No."
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </div>
//           </Col>
//           <Col md={6} className="d-flex flex-column align-items-end">
//             <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
//               {/* Sales Order No (Auto or Manual) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap",
//                       flexShrink: 0,
//                       marginRight: "8px"
//                     }}
//                   >
//                     SO No.
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.salesOrder.salesOrderNo}
//                     readOnly
//                     className="form-control-no-border text-end"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0",
//                       fontWeight: "500",
//                       backgroundColor: "#f8f9fa",
//                       color: "#495057",
//                       cursor: "not-allowed",
//                       textAlign: "right",
//                       flexGrow: 1
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Quotation No (Auto from Quotation) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap",
//                       flexShrink: 0,
//                       marginRight: "8px"
//                     }}
//                   >
//                     Quotation No
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.salesOrder.quotationNo}
//                     readOnly
//                     className="form-control-no-border text-end"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0",
//                       fontWeight: "500",
//                       backgroundColor: "#f8f9fa",
//                       color: "#495057",
//                       cursor: "not-allowed",
//                       textAlign: "right",
//                       flexGrow: 1
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Manual Quotation Ref (Optional) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0 flex-shrink-0 me-2"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap"
//                     }}
//                   >
//                     Manual Quotation No (Optional)
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.salesOrder.manualQuotationRef || ""}
//                     onChange={(e) => handleChange("salesOrder", "manualQuotationRef", e.target.value)}
//                     placeholder="e.g. CUST-QTN-001"
//                     className="form-control-no-border text-end flex-grow-1"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0.375rem 0.75rem",
//                       textAlign: "right"
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Customer No */}
//               <Form.Group>
//                 <Form.Control
//                   type="text"
//                   value={formData.salesOrder.customerNo}
//                   onChange={(e) => handleChange('salesOrder', 'customerNo', e.target.value)}
//                   placeholder="Customer No."
//                   className="form-control-no-border text-end"
//                   style={{
//                     fontSize: "1rem",
//                     lineHeight: "1.5",
//                     minHeight: "auto",
//                     padding: "0",
//                     textAlign: "right"
//                   }}
//                 />
//               </Form.Group>
//             </div>
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />

//         {/* Bill To and Ship To Sections */}
//         <Row className="mb-4 d-flex justify-content-between">
//           <Col md={6} className="d-flex flex-column align-items-start">
//             <h5>BILL TO</h5>
//             <Form.Group className="mb-2 w-100">
//               <Form.Label>ATN: Name / Dept</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.salesOrder.billToAttn}
//                 onChange={(e) => handleChange("salesOrder", "billToAttn", e.target.value)}
//                 placeholder="Attention Name / Department"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <Form.Control
//                   type="text"
//                   value={formData.salesOrder.billToCompanyName}
//                   onChange={(e) => handleChange("salesOrder", "billToCompanyName", e.target.value)}
//                   placeholder="Company Name"
//                   className="form-control-no-border"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
//                 />
//               </div>
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 type="text"
//                 value={formData.salesOrder.billToAddress}
//                 onChange={(e) => handleChange("salesOrder", "billToAddress", e.target.value)}
//                 placeholder="Company Address"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 type="text"
//                 value={formData.salesOrder.billToPhone}
//                 onChange={(e) => handleChange("salesOrder", "billToPhone", e.target.value)}
//                 placeholder="Phone"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 type="email"
//                 value={formData.salesOrder.billToEmail}
//                 onChange={(e) => handleChange("salesOrder", "billToEmail", e.target.value)}
//                 placeholder="Email"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6} className="d-flex flex-column align-items-end">
//             <h5>SHIP TO</h5>
//             <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
//               <Form.Group className="mb-2">
//                 <Form.Label>ATN: Name / Dept</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={formData.salesOrder.shipToAttn}
//                   onChange={(e) => handleChange("salesOrder", "shipToAttn", e.target.value)}
//                   placeholder="Attention Name / Department"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="text"
//                   value={formData.salesOrder.shipToCompanyName}
//                   onChange={(e) => handleChange("salesOrder", "shipToCompanyName", e.target.value)}
//                   placeholder="Company Name"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="text"
//                   value={formData.salesOrder.shipToAddress}
//                   onChange={(e) => handleChange("salesOrder", "shipToAddress", e.target.value)}
//                   placeholder="Company Address"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="text"
//                   value={formData.salesOrder.shipToPhone}
//                   onChange={(e) => handleChange("salesOrder", "shipToPhone", e.target.value)}
//                   placeholder="Phone"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="email"
//                   value={formData.salesOrder.shipToEmail}
//                   onChange={(e) => handleChange("salesOrder", "shipToEmail", e.target.value)}
//                   placeholder="Email"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//             </div>
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />

//         {/* Items Table */}
//         <div className="mt-4">{renderItemsTable('salesOrder')}</div>

//         {/* Totals - Moved to left side */}
//         <Row className="mb-4 mt-2">
//           <Col md={4}>
//             <Table bordered size="sm" className="dark-bordered-table">
//               <tbody>
//                 <tr>
//                   <td className="fw-bold">Sub Total:</td>
//                   <td>${calculateTotalAmount(formData.salesOrder.items).toFixed(2)}</td>
//                 </tr>
//                 <tr>
//                   <td className="fw-bold">Total:</td>
//                   <td className="fw-bold">
//                     ${calculateTotalWithTaxAndDiscount(formData.salesOrder.items).toFixed(2)} {/* Updated to use Total function */}
//                   </td>
//                 </tr>
//               </tbody>
//             </Table>
//           </Col>
//         </Row>

//         {/* Terms & Conditions */}
//         <Form.Group className="mt-4">
//           <Form.Label>Terms & Conditions</Form.Label>
//           <Form.Control
//             as="textarea"
//             rows={2}
//             value={formData.salesOrder.terms}
//             onChange={(e) => handleChange('salesOrder', 'terms', e.target.value)}
//             style={{ border: "1px solid #343a40" }}
//           />
//         </Form.Group>

//         {/* Attachment Fields */}
//         {renderAttachmentFields("salesOrder")}

//         {/* Navigation Buttons */}
//         <div className="d-flex justify-content-between mt-4">
//           <Button variant="secondary" onClick={handleSkip}>Skip</Button>
//           <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
//           <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
//           <Button variant="success" onClick={handleNext}>Next</Button>
//         </div>
//       </Form>
//     );
//   };

//   const renderDeliveryChallanTab = () => {
//     return (
//       <Form>
//         {/* Header: Logo + Company Info + Title */}
//         <Row className="mb-4 d-flex justify-content-between">
//           <Col md={3} className="d-flex align-items-center justify-content-center">
//             <div
//               className="border rounded d-flex flex-column align-items-center justify-content-center"
//               style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
//               onClick={() => document.getElementById('logo-upload-dc')?.click()}
//             >
//               {formData.deliveryChallan.companyLogo ? (
//                 <img
//                   src={formData.deliveryChallan.companyLogo}
//                   alt="Company Logo"
//                   style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
//                   onError={(e) => { e.target.style.display = 'none'; }}
//                 />
//               ) : (
//                 <>
//                   <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
//                   <small>Upload Logo</small>
//                 </>
//               )}
//               <input id="logo-upload-dc" type="file" accept="image/*" hidden onChange={(e) => {
//                 if (e.target.files[0]) handleChange("deliveryChallan", "companyLogo", e.target.files[0]);
//               }} />
//             </div>
//           </Col>
//           <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
//             <h2 className="text-success mb-0">DELIVERY CHALLAN</h2>
//             <hr
//               style={{
//                 width: "80%",
//                 borderColor: "#28a745",
//                 marginTop: "5px",
//                 marginBottom: "10px",
//               }}
//             />
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />
//         <Row className="mb-4 mt-3">
//           <Col md={6}>
//             <div className="d-flex flex-column align-items-end justify-content-center gap-1">
//               <Form.Control
//                 type="text"
//                 value={formData.deliveryChallan.companyName}
//                 onChange={(e) => handleChange("deliveryChallan", "companyName", e.target.value)}
//                 placeholder="Your Company Name"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="text"
//                 value={formData.deliveryChallan.companyAddress}
//                 onChange={(e) => handleChange("deliveryChallan", "companyAddress", e.target.value)}
//                 placeholder="Company Address, City, State, Pincode"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="email"
//                 value={formData.deliveryChallan.companyEmail}
//                 onChange={(e) => handleChange("deliveryChallan", "companyEmail", e.target.value)}
//                 placeholder="Company Email"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="text"
//                 value={formData.deliveryChallan.companyPhone}
//                 onChange={(e) => handleChange("deliveryChallan", "companyPhone", e.target.value)}
//                 placeholder="Phone No."
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </div>
//           </Col>
//           <Col md={6} className="d-flex flex-column align-items-end">
//             <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
//               {/* Challan No (Auto or Manual) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap",
//                       flexShrink: 0,
//                       marginRight: "8px"
//                     }}
//                   >
//                     Challan No.
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.deliveryChallan.challanNo}
//                     readOnly
//                     className="form-control-no-border text-end"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0",
//                       fontWeight: "500",
//                       backgroundColor: "#f8f9fa",
//                       color: "#495057",
//                       cursor: "not-allowed",
//                       textAlign: "right",
//                       flexGrow: 1
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Manual Challan No (Optional) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0 flex-shrink-0 me-2"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap"
//                     }}
//                   >
//                     Manual DC No (Optional)
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.deliveryChallan.manualChallanNo || ""}
//                     onChange={(e) => handleChange("deliveryChallan", "manualChallanNo", e.target.value)}
//                     placeholder="e.g. DC-CUST-001"
//                     className="form-control-no-border text-end flex-grow-1"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0.375rem 0.75rem",
//                       textAlign: "right"
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Sales Order No (Auto) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap",
//                       flexShrink: 0,
//                       marginRight: "8px"
//                     }}
//                   >
//                     SO No.
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.deliveryChallan.salesOrderNo}
//                     readOnly
//                     className="form-control-no-border text-end"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0",
//                       fontWeight: "500",
//                       backgroundColor: "#f8f9fa",
//                       color: "#495057",
//                       cursor: "not-allowed",
//                       textAlign: "right",
//                       flexGrow: 1
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Manual Sales Order No (Optional) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0 flex-shrink-0 me-2"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap"
//                     }}
//                   >
//                     Manual SO No (Optional)
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.deliveryChallan.manualSalesOrderRef || ""}
//                     onChange={(e) => handleChange("deliveryChallan", "manualSalesOrderRef", e.target.value)}
//                     placeholder="e.g. SO-CUST-001"
//                     className="form-control-no-border text-end flex-grow-1"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0.375rem 0.75rem",
//                       textAlign: "right"
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Vehicle No */}
//               <Form.Group>
//                 <Form.Control
//                   type="text"
//                   value={formData.deliveryChallan.vehicleNo}
//                   onChange={(e) => handleChange('deliveryChallan', 'vehicleNo', e.target.value)}
//                   placeholder="Vehicle No."
//                   className="form-control-no-border text-end"
//                   style={{
//                     fontSize: "1rem",
//                     lineHeight: "1.5",
//                     minHeight: "auto",
//                     padding: "0",
//                     textAlign: "right"
//                   }}
//                 />
//               </Form.Group>
//             </div>
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />

//         {/* Bill To and Ship To Sections */}
//         <Row className="mb-4 d-flex justify-content-between">
//           <Col md={6} className="d-flex flex-column align-items-start">
//             <h5>BILL TO</h5>
//             <Form.Group className="mb-2 w-100">
//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <Form.Control
//                   type="text"
//                   value={formData.deliveryChallan.billToName}
//                   onChange={(e) => handleChange("deliveryChallan", "billToName", e.target.value)}
//                   placeholder="Attention Name / Department"
//                   className="form-control-no-border"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
//                 />
//               </div>
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 type="text"
//                 value={formData.deliveryChallan.billToAddress}
//                 onChange={(e) => handleChange("deliveryChallan", "billToAddress", e.target.value)}
//                 placeholder="Company Address"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 type="text"
//                 value={formData.deliveryChallan.billToPhone}
//                 onChange={(e) => handleChange("deliveryChallan", "billToPhone", e.target.value)}
//                 placeholder="Phone"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 type="email"
//                 value={formData.deliveryChallan.billToEmail}
//                 onChange={(e) => handleChange("deliveryChallan", "billToEmail", e.target.value)}
//                 placeholder="Email"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6} className="d-flex flex-column align-items-end">
//             <h5>SHIP TO</h5>
//             <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
//               <Form.Group className="mb-2">
//                 <Form.Label>ATN: Name / Dept</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={formData.deliveryChallan.shipToName}
//                   onChange={(e) => handleChange("deliveryChallan", "shipToName", e.target.value)}
//                   placeholder="Attention Name / Department"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="text"
//                   value={formData.deliveryChallan.shipToAddress}
//                   onChange={(e) => handleChange("deliveryChallan", "shipToAddress", e.target.value)}
//                   placeholder="Company Address"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="text"
//                   value={formData.deliveryChallan.shipToPhone}
//                   onChange={(e) => handleChange("deliveryChallan", "shipToPhone", e.target.value)}
//                   placeholder="Phone"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="email"
//                   value={formData.deliveryChallan.shipToEmail}
//                   onChange={(e) => handleChange("deliveryChallan", "shipToEmail", e.target.value)}
//                   placeholder="Email"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//             </div>
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />

//         {/* Driver Details */}
//         <Row className="mb-4">
//           <Col md={6}>
//             <h5>Driver Details</h5>
//             <Form.Group className="mb-2">
//               <Form.Label>Driver Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.deliveryChallan.driverName}
//                 onChange={(e) => handleChange("deliveryChallan", "driverName", e.target.value)}
//                 placeholder="Driver Name"
//                 style={{ border: "1px solid #343a40" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Driver Phone</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.deliveryChallan.driverPhone}
//                 onChange={(e) => handleChange("deliveryChallan", "driverPhone", e.target.value)}
//                 placeholder="Driver Phone"
//                 style={{ border: "1px solid #343a40" }}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Items Table */}
//         <div className="mt-4">{renderItemsTable('deliveryChallan')}</div>

//         {/* Totals - Moved to left side */}
//         <Row className="mb-4 mt-2">
//           <Col md={4}>
//             <Table bordered size="sm" className="dark-bordered-table">
//               <tbody>
//                 <tr>
//                   <td className="fw-bold">Sub Total:</td>
//                   <td>${calculateTotalAmount(formData.deliveryChallan.items).toFixed(2)}</td>
//                 </tr>
//                 <tr>
//                   <td className="fw-bold">Total:</td>
//                   <td className="fw-bold">
//                     ${calculateTotalWithTaxAndDiscount(formData.deliveryChallan.items).toFixed(2)} {/* Updated to use Total function */}
//                   </td>
//                 </tr>
//               </tbody>
//             </Table>
//           </Col>
//         </Row>

//         {/* Terms & Conditions */}
//         <Form.Group className="mt-4">
//           <Form.Label>Terms & Conditions</Form.Label>
//           <Form.Control
//             as="textarea"
//             rows={2}
//             value={formData.deliveryChallan.terms}
//             onChange={(e) => handleChange('deliveryChallan', 'terms', e.target.value)}
//             style={{ border: "1px solid #343a40" }}
//           />
//         </Form.Group>

//         {/* Attachment Fields */}
//         {renderAttachmentFields("deliveryChallan")}

//         {/* Thank You Section */}
//         <Row className="text-center mt-5 mb-4 pt-3 border-top">
//           <Col>
//             <p><strong>Thank you for your business!</strong></p>
//             <p className="text-muted">www.yourcompany.com</p>
//           </Col>
//         </Row>

//         {/* Navigation Buttons */}
//         <div className="d-flex justify-content-between mt-4">
//           <Button variant="secondary" onClick={handleSkip}>Skip</Button>
//           <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
//           <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
//           <Button variant="success" onClick={handleNext}>Next</Button>
//         </div>
//       </Form>
//     );
//   };

//   const renderInvoiceTab = () => {
//     return (
//       <Form>
//         {/* Header: Logo + Company Info + Title */}
//         <Row className="mb-4 d-flex justify-content-between align-items-center">
//           <Col md={3} className="d-flex align-items-center justify-content-center">
//             <div
//               className="border rounded d-flex flex-column align-items-center justify-content-center"
//               style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
//               onClick={() => document.getElementById('logo-upload-invoice')?.click()}
//             >
//               {formData.invoice.companyLogo ? (
//                 <img
//                   src={formData.invoice.companyLogo}
//                   alt="Company Logo"
//                   style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
//                   onError={(e) => { e.target.style.display = 'none'; }}
//                 />
//               ) : (
//                 <>
//                   <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
//                   <small>Upload Logo</small>
//                 </>
//               )}
//               <input id="logo-upload-invoice" type="file" accept="image/*" hidden onChange={(e) => {
//                 if (e.target.files[0]) handleChange("invoice", "companyLogo", e.target.files[0]);
//               }} />
//             </div>
//           </Col>
//           <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
//             <h2 className="text-success mb-0">INVOICE</h2>
//             <hr
//               style={{
//                 width: "80%",
//                 borderColor: "#28a745",
//                 marginTop: "5px",
//                 marginBottom: "10px",
//               }}
//             />
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />
//         <Row className="mb-4 mt-3">
//           <Col md={6}>
//             <div className="d-flex flex-column gap-1">
//               <Form.Control
//                 type="text"
//                 value={formData.invoice.companyName}
//                 onChange={(e) => handleChange("invoice", "companyName", e.target.value)}
//                 placeholder="Your Company Name"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="text"
//                 value={formData.invoice.companyAddress}
//                 onChange={(e) => handleChange("invoice", "companyAddress", e.target.value)}
//                 placeholder="Company Address, City, State, Pincode"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="email"
//                 value={formData.invoice.companyEmail}
//                 onChange={(e) => handleChange("invoice", "companyEmail", e.target.value)}
//                 placeholder="Company Email"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="text"
//                 value={formData.invoice.companyPhone}
//                 onChange={(e) => handleChange("invoice", "companyPhone", e.target.value)}
//                 placeholder="Phone No."
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </div>
//           </Col>
//           <Col md={6} className="d-flex flex-column align-items-end">
//             <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
//               {/* Invoice No (Auto or Manual) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap",
//                       flexShrink: 0,
//                       marginRight: "8px"
//                     }}
//                   >
//                     Invoice No.
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.invoice.invoiceNo}
//                     readOnly
//                     className="form-control-no-border text-end"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0",
//                       fontWeight: "500",
//                       backgroundColor: "#f8f9fa",
//                       color: "#495057",
//                       cursor: "not-allowed",
//                       textAlign: "right",
//                       flexGrow: 1
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Manual Invoice No (Optional) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0 flex-shrink-0 me-2"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap"
//                     }}
//                   >
//                     Manual Invoice No (Optional)
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.invoice.manualInvoiceNo || ""}
//                     onChange={(e) => handleChange("invoice", "manualInvoiceNo", e.target.value)}
//                     placeholder="e.g. INV-CUST-001"
//                     className="form-control-no-border text-end flex-grow-1"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0.375rem 0.75rem",
//                       textAlign: "right"
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Challan No (Auto from DC) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap",
//                       flexShrink: 0,
//                       marginRight: "8px"
//                     }}
//                   >
//                     Challan No.
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.invoice.challanNo}
//                     readOnly
//                     className="form-control-no-border text-end"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0",
//                       fontWeight: "500",
//                       backgroundColor: "#f8f9fa",
//                       color: "#495057",
//                       cursor: "not-allowed",
//                       textAlign: "right",
//                       flexGrow: 1
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Manual Challan No (Optional) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0 flex-shrink-0 me-2"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap"
//                     }}
//                   >
//                     Manual Challan No (Optional)
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.invoice.manualChallanNo || ""}
//                     onChange={(e) => handleChange("invoice", "manualChallanNo", e.target.value)}
//                     placeholder="e.g. DC-CUST-001"
//                     className="form-control-no-border text-end flex-grow-1"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0.375rem 0.75rem",
//                       textAlign: "right"
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Due Date */}
//               <Form.Group>
//                 <Form.Label className="mb-0" style={{ fontSize: "0.9rem", color: "#6c757d" }}>
//                   Due Date
//                 </Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={formData.invoice.dueDate}
//                   onChange={(e) => handleChange("invoice", "dueDate", e.target.value)}
//                   className="form-control-no-border text-end"
//                   style={{
//                     fontSize: "1rem",
//                     lineHeight: "1.5",
//                     minHeight: "auto",
//                     padding: "0",
//                     textAlign: "right"
//                   }}
//                 />
//               </Form.Group>
//             </div>
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />

//         {/* Bill To & Customer Info */}
//         <Row className="mb-4 d-flex justify-content-between">
//           <Col md={6} className="d-flex flex-column align-items-start">
//             <h5>BILL TO</h5>
//             <Form.Group className="mb-2 w-100">
//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <Form.Control
//                   type="text"
//                   value={formData.invoice.customerName}
//                   onChange={(e) => handleChange("invoice", "customerName", e.target.value)}
//                   placeholder="Customer Name"
//                   className="form-control-no-border"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
//                 />
//                 <Button
//                   variant="outline-primary"
//                   size="sm"
//                   onClick={() => navigate('/add-customer')} // Example navigation
//                   title="Add Customer"
//                 >
//                   Add Customer
//                 </Button>
//               </div>
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 value={formData.invoice.customerAddress}
//                 onChange={(e) => handleChange("invoice", "customerAddress", e.target.value)}
//                 placeholder="Customer Address"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 type="email"
//                 value={formData.invoice.customerEmail}
//                 onChange={(e) => handleChange("invoice", "customerEmail", e.target.value)}
//                 placeholder="Email"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 type="text"
//                 value={formData.invoice.customerPhone}
//                 onChange={(e) => handleChange("invoice", "customerPhone", e.target.value)}
//                 placeholder="Phone"
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6} className="d-flex flex-column align-items-end">
//             <h5>SHIP TO</h5>
//             <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="text"
//                   value={formData.invoice.shipToName || ""}
//                   onChange={(e) => handleChange("invoice", "shipToName", e.target.value)}
//                   placeholder="Name"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="text"
//                   value={formData.invoice.shipToAddress || ""}
//                   onChange={(e) => handleChange("invoice", "shipToAddress", e.target.value)}
//                   placeholder="Address"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="email"
//                   value={formData.invoice.shipToEmail || ""}
//                   onChange={(e) => handleChange("invoice", "shipToEmail", e.target.value)}
//                   placeholder="Email"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Control
//                   type="text"
//                   value={formData.invoice.shipToPhone || ""}
//                   onChange={(e) => handleChange("invoice", "shipToPhone", e.target.value)}
//                   placeholder="Phone"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//             </div>
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />

//         {/* Items Table */}
//         <div className="mt-4">{renderItemsTable('invoice')}</div>

//         {/* Totals - Moved to left side */}
//         <Row className="mb-4 mt-2">
//           <Col md={4}>
//             <Table bordered size="sm" className="dark-bordered-table">
//               <tbody>
//                 <tr>
//                   <td className="fw-bold">Sub Total:</td>
//                   <td>${calculateTotalAmount(formData.invoice.items).toFixed(2)}</td>
//                 </tr>
//                 <tr>
//                   <td className="fw-bold">Total Due:</td>
//                   <td className="fw-bold">${calculateTotalWithTaxAndDiscount(formData.invoice.items).toFixed(2)}</td> {/* Updated to use Total function */}
//                 </tr>
//               </tbody>
//             </Table>
//           </Col>
//         </Row>

//         {/* Terms & Conditions */}
//         <Form.Group className="mt-4">
//           <Form.Label>Terms & Conditions</Form.Label>
//           <Form.Control
//             as="textarea"
//             rows={3}
//             value={formData.invoice.terms}
//             onChange={(e) => handleChange("invoice", "terms", e.target.value)}
//             placeholder="e.g. Payment within 15 days. Late fees may apply."
//             style={{ border: "1px solid #343a40" }}
//           />
//         </Form.Group>

//         {/* Attachment Fields */}
//         {renderAttachmentFields("invoice")}

//         {/* Footer Note */}
//         <Row className="text-center mt-5 mb-4 pt-3">
//           <Col>
//             <Form.Control
//               type="text"
//               value={formData.invoice.footerNote}
//               onChange={(e) => handleChange("invoice", "footerNote", e.target.value)}
//               className="text-center mb-2 fw-bold"
//               placeholder=" Thank you for your business!"
//             />
//           </Col>
//         </Row>

//         {/* Navigation */}
//         <div className="d-flex justify-content-between mt-4 border-top pt-3">
//           <Button variant="secondary" onClick={handleSkip}>Skip</Button>
//           <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
//           <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
//           <Button variant="success" onClick={handleNext}>Next</Button>
//         </div>
//       </Form>
//     );
//   };

//   const renderPaymentTab = () => {
//     return (
//       <Form>
//         {/* Header: Logo + Title */}
//         <Row className="mb-4 d-flex justify-content-between align-items-center">
//           <Col md={3} className="d-flex align-items-center justify-content-center">
//             <div
//               className="border rounded d-flex flex-column align-items-center justify-content-center"
//               style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
//               onClick={() => document.getElementById('logo-upload-payment')?.click()}
//             >
//               {formData.payment.companyLogo ? (
//                 <img
//                   src={formData.payment.companyLogo}
//                   alt="Company Logo"
//                   style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
//                   onError={(e) => { e.target.style.display = 'none'; }}
//                 />
//               ) : (
//                 <>
//                   <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
//                   <small>Upload Logo</small>
//                 </>
//               )}
//               <input id="logo-upload-payment" type="file" accept="image/*" hidden onChange={(e) => {
//                 if (e.target.files[0]) handleChange("payment", "companyLogo", e.target.files[0]);
//               }} />
//             </div>
//           </Col>
//           <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
//             <h2 className="text-success mb-0">PAYMENT RECEIPT</h2>
//             <hr
//               style={{
//                 width: "80%",
//                 borderColor: "#28a745",
//                 marginTop: "5px",
//                 marginBottom: "10px",
//               }}
//             />
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />
//         <Row className="mb-4 mt-3">
//           <Col md={6}>
//             <div className="d-flex flex-column gap-1">
//               <Form.Control
//                 type="text"
//                 value={formData.payment.companyName}
//                 onChange={(e) => handleChange("payment", "companyName", e.target.value)}
//                 placeholder=" Enter Your Company Name. . . . ."
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="text"
//                 value={formData.payment.companyAddress}
//                 onChange={(e) => handleChange("payment", "companyAddress", e.target.value)}
//                 placeholder="Company Address, City, State, Pincode  . . . "
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="email"
//                 value={formData.payment.companyEmail}
//                 onChange={(e) => handleChange("payment", "companyEmail", e.target.value)}
//                 placeholder="Company Email. . . ."
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//               <Form.Control
//                 type="text"
//                 value={formData.payment.companyPhone}
//                 onChange={(e) => handleChange("payment", "companyPhone", e.target.value)}
//                 placeholder="Phone No....."
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </div>
//           </Col>
//           <Col md={6} className="d-flex flex-column align-items-end">
//             <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
//               {/* Payment No (Auto) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap",
//                       flexShrink: 0,
//                       marginRight: "8px"
//                     }}
//                   >
//                     Payment No.
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.payment.paymentNo}
//                     readOnly
//                     className="form-control-no-border text-end"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0",
//                       fontWeight: "500",
//                       backgroundColor: "#f8f9fa",
//                       color: "#495057",
//                       cursor: "not-allowed",
//                       textAlign: "right",
//                       flexGrow: 1
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Manual Payment No (Optional) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0 flex-shrink-0 me-2"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap"
//                     }}
//                   >
//                     Manual Payment No (Optional)
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.payment.manualPaymentNo || ""}
//                     onChange={(e) => handleChange("payment", "manualPaymentNo", e.target.value)}
//                     placeholder="e.g. PAY-CUST-001"
//                     className="form-control-no-border text-end flex-grow-1"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0.375rem 0.75rem",
//                       textAlign: "right"
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Invoice No (Auto) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap",
//                       flexShrink: 0,
//                       marginRight: "8px"
//                     }}
//                   >
//                     Invoice No.
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.payment.invoiceNo}
//                     readOnly
//                     className="form-control-no-border text-end"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0",
//                       fontWeight: "500",
//                       backgroundColor: "#f8f9fa",
//                       color: "#495057",
//                       cursor: "not-allowed",
//                       textAlign: "right",
//                       flexGrow: 1
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Manual Invoice No (Optional) */}
//               <Form.Group className="mb-0">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Form.Label
//                     className="mb-0 flex-shrink-0 me-2"
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#6c757d",
//                       whiteSpace: "nowrap"
//                     }}
//                   >
//                     Manual Invoice No (Optional)
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.payment.manualInvoiceRef || ""}
//                     onChange={(e) => handleChange("payment", "manualInvoiceRef", e.target.value)}
//                     placeholder="e.g. INV-CUST-001"
//                     className="form-control-no-border text-end flex-grow-1"
//                     style={{
//                       fontSize: "1rem",
//                       lineHeight: "1.5",
//                       minHeight: "auto",
//                       padding: "0.375rem 0.75rem",
//                       textAlign: "right"
//                     }}
//                   />
//                 </div>
//               </Form.Group>
//               {/* Payment Method */}
//               <Form.Group>
//                 <Form.Control
//                   type="text"
//                   value={formData.payment.paymentMethod}
//                   onChange={(e) => handleChange("payment", "paymentMethod", e.target.value)}
//                   placeholder="Payment Method"
//                   className="form-control-no-border text-end"
//                   style={{
//                     fontSize: "1rem",
//                     lineHeight: "1.5",
//                     minHeight: "auto",
//                     padding: "0",
//                     textAlign: "right"
//                   }}
//                 />
//               </Form.Group>
//             </div>
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />

//         <Row className="mb-4 d-flex justify-content-between">
//           <Col md={6} className="d-flex flex-column align-items-start">
//             <h5>RECEIVED FROM</h5>
//             <Form.Control
//               type="text"
//               value={formData.payment.customerName || ""}
//               onChange={(e) => handleChange("payment", "customerName", e.target.value)}
//               placeholder="Enter Customer Name. . . . . ."
//               className="form-control-no-border"
//               style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//             />
//             <Form.Group className="mb-1 w-100">
//               <Form.Control
//                 rows={2}
//                 value={formData.payment.customerAddress || ""}
//                 onChange={(e) => handleChange("payment", "customerAddress", e.target.value)}
//                 placeholder="Customer Address. . . .  ."
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 type="email"
//                 value={formData.payment.customerEmail || ""}
//                 onChange={(e) => handleChange("payment", "customerEmail", e.target.value)}
//                 placeholder="Email. . . . . "
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-2 w-100">
//               <Form.Control
//                 type="text"
//                 value={formData.payment.customerPhone || ""}
//                 onChange={(e) => handleChange("payment", "customerPhone", e.target.value)}
//                 placeholder="Phone. . . . . . ."
//                 className="form-control-no-border"
//                 style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6} className="d-flex flex-column align-items-end">
//             <h5>PAYMENT DETAILS</h5>
//             <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
//               <Form.Group className="mb-2">
//                 <Form.Label>Amount Received</Form.Label>
//                 <Form.Control
//                   type="number"
//                   step="0.01"
//                   value={formData.payment.amount}
//                   onChange={(e) => handleChange("payment", "amount", e.target.value)}
//                   placeholder="Amount"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Label>Total Amount</Form.Label>
//                 <Form.Control
//                   type="number"
//                   step="0.01"
//                   value={(
//                     parseFloat(formData.payment.totalAmount) ||
//                     calculateTotalWithTaxAndDiscount(formData.invoice.items) // Use total function for invoice
//                   ).toFixed(2)}
//                   readOnly
//                   className="form-control-no-border text-end"
//                   style={{ textAlign: "right" }}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Label>Payment Status</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={formData.payment.paymentStatus}
//                   onChange={(e) => handleChange("payment", "paymentStatus", e.target.value)}
//                   placeholder="Payment Status"
//                   className="form-control-no-border text-end"
//                   style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
//                 />
//               </Form.Group>
//             </div>
//           </Col>
//         </Row>
//         <hr
//           style={{
//             width: "100%",
//             height: "4px",
//             backgroundColor: "#28a745",
//             border: "none",
//             marginTop: "5px",
//             marginBottom: "10px",
//           }}
//         />

//         <Row className="mb-4 mt-2">
//           <Col md={4}>
//             <Table bordered size="sm" className="dark-bordered-table">
//               <tbody>
//                 <tr>
//                   <td className="fw-bold">Total Invoice:</td>
//                   <td>
//                     ${(
//                       parseFloat(formData.payment.totalAmount) ||
//                       calculateTotalWithTaxAndDiscount(formData.invoice.items) // Use total function for invoice
//                     ).toFixed(2)}
//                   </td>
//                 </tr>
//                 <tr className="fw-bold">
//                   <td>Amount Received:</td>
//                   <td>${(parseFloat(formData.payment.amount) || 0).toFixed(2)}</td>
//                 </tr>
//                 <tr style={{ backgroundColor: "#f8f9fa" }}>
//                   <td className="fw-bold">Balance:</td>
//                   <td className="fw-bold text-danger">
//                     ${(
//                       (parseFloat(formData.payment.totalAmount) ||
//                         calculateTotalWithTaxAndDiscount(formData.invoice.items)) - // Use total function for invoice
//                       (parseFloat(formData.payment.amount) || 0)
//                     ).toFixed(2)}
//                   </td>
//                 </tr>
//               </tbody>
//             </Table>
//           </Col>
//         </Row>

//         <Form.Group className="mt-4">
//           <Form.Label>Note</Form.Label>
//           <Form.Control
//             as="textarea"
//             rows={2}
//             value={formData.payment.note}
//             onChange={(e) => handleChange("payment", "note", e.target.value)}
//             placeholder="e.g. Payment received via UPI / Cash"
//             style={{ border: "1px solid #343a40" }}
//           />
//         </Form.Group>

//         {/* Attachment Fields */}
//         {renderAttachmentFields("payment")}

//         <Row className="text-center mt-5 mb-4 pt-3 border-top">
//           <Col>
//             <Form.Control
//               type="text"
//               value={formData.payment.footerNote}
//               onChange={(e) => handleChange("payment", "footerNote", e.target.value)}
//               className="text-center mb-2 fw-bold"
//               placeholder="Thank you for your payment!"
//             />
//           </Col>
//         </Row>

//         <div className="d-flex justify-content-between mt-4 border-top pt-3">
//           <Button variant="secondary" onClick={handleSkip}>Skip</Button>
//           <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
//           <Button variant="primary" onClick={handleFinalSubmit}>Submit</Button>
//         </div>
//       </Form>
//     );
//   };

//   const renderPDFView = () => {
//     const currentTab = formData[key];
//     const hasItems = tabsWithItems.includes(key) && Array.isArray(currentTab.items);
//     const titleMap = {
//       quotation: "QUOTATION",
//       salesOrder: "SALES ORDER",
//       deliveryChallan: "DELIVERY CHALLAN",
//       invoice: "INVOICE",
//       payment: "PAYMENT RECEIPT",
//     };

//     return (
//       <div
//         style={{
//           fontFamily: "Arial, sans-serif",
//           padding: "20px",
//           backgroundColor: "white",
//         }}
//       >
//         {/* Header: Logo + Title */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-start",
//             marginBottom: "20px",
//           }}
//         >
//           <div
//             style={{
//               border: "2px dashed #28a745",
//               padding: "10px",
//               width: "120px",
//               height: "120px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               textAlign: "center",
//             }}
//           >
//             {currentTab.companyLogo ? (
//               <img
//                 src={currentTab.companyLogo}
//                 alt="Logo"
//                 style={{ maxWidth: "100%", maxHeight: "100px" }}
//               />
//             ) : (
//               "Logo"
//             )}
//           </div>
//           <div style={{ textAlign: "center", color: "#28a745" }}>
//             <h2>{titleMap[key]}</h2>
//           </div>
//         </div>
//         <hr style={{ border: "2px solid #28a745", margin: "15px 0" }} />

//         {/* Company Info */}
//         <div style={{ marginBottom: "15px" }}>
//           <h4>{currentTab.companyName}</h4>
//           <p>{currentTab.companyAddress}</p>
//           <p>
//             Email: {currentTab.companyEmail} | Phone: {currentTab.companyPhone}
//           </p>
//         </div>

//         {/* Customer Info */}
//         {(currentTab.billToName || currentTab.customerName) && (
//           <div style={{ marginBottom: "15px" }}>
//             <h5>{key === 'invoice' ? 'BILL TO' : 'CUSTOMER'}</h5>
//             <p>{currentTab.billToName || currentTab.customerName}</p>
//             <p>{currentTab.billToAddress || currentTab.customerAddress}</p>
//             <p>
//               Email: {currentTab.billToEmail || currentTab.customerEmail} | Phone: {currentTab.billToPhone || currentTab.customerPhone}
//             </p>
//           </div>
//         )}

//         {/* Ship To */}
//         {(currentTab.shipToName || currentTab.shipToAddress) && (
//           <div style={{ marginBottom: "15px" }}>
//             <h5>SHIP TO</h5>
//             <p>{currentTab.shipToName}</p>
//             <p>{currentTab.shipToAddress}</p>
//             <p>
//               Email: {currentTab.shipToEmail} | Phone: {currentTab.shipToPhone}
//             </p>
//           </div>
//         )}

//         {/* Driver & Vehicle (Delivery Challan) */}
//         {key === "deliveryChallan" && (
//           <div style={{ marginBottom: "15px" }}>
//             <h5>DRIVER DETAILS</h5>
//             <p>
//               {currentTab.driverName} | {currentTab.driverPhone}
//             </p>
//             <p>
//               <strong>Vehicle No.:</strong> {currentTab.vehicleNo}
//             </p>
//           </div>
//         )}

//         {/* Document Numbers */}
//         <div style={{ marginBottom: "15px" }}>
//           <strong>Ref ID:</strong> {currentTab.referenceId} |
//           {key === "quotation" && (
//             <>
//               <strong>Quotation No.:</strong> {currentTab.quotationNo} |{" "}
//             </>
//           )}
//           {key === "salesOrder" && (
//             <>
//               <strong>SO No.:</strong> {currentTab.salesOrderNo} |{" "}
//             </>
//           )}
//           {key === "deliveryChallan" && (
//             <>
//               <strong>Challan No.:</strong> {currentTab.challanNo} |{" "}
//             </>
//           )}
//           {key === "invoice" && (
//             <>
//               <strong>Invoice No.:</strong> {currentTab.invoiceNo} |{" "}
//             </>
//           )}
//           {key === "payment" && (
//             <>
//               <strong>Payment No.:</strong> {currentTab.paymentNo} |{" "}
//             </>
//           )}
//           <strong>Date:</strong>{" "}
//           {currentTab[`${key}Date`] ||
//             currentTab.date ||
//             new Date().toISOString().split("T")[0]}
//           {key === "quotation" && currentTab.validDate && (
//             <>
//               {" "}
//               | <strong>Valid Till:</strong> {currentTab.validDate}
//             </>
//           )}
//           {key === "invoice" && currentTab.dueDate && (
//             <>
//               {" "}
//               | <strong>Due Date:</strong> {currentTab.dueDate}
//             </>
//           )}
//         </div>

//         {/* Items Table */}
//         {hasItems && (
//           <table
//             style={{
//               width: "100%",
//               borderCollapse: "collapse",
//               marginBottom: "20px",
//             }}
//           >
//             <thead style={{ backgroundColor: "#f8f9fa" }}>
//               <tr>
//                 <th
//                   style={{
//                     border: "1px solid #000",
//                     padding: "8px",
//                     textAlign: "left",
//                   }}
//                 >
//                   Item Name
//                 </th>
//                 <th
//                   style={{
//                     border: "1px solid #000",
//                     padding: "8px",
//                     textAlign: "left",
//                   }}
//                 >
//                   Qty
//                 </th>
//                 {key === "deliveryChallan" && (
//                   <th
//                     style={{
//                       border: "1px solid #000",
//                       padding: "8px",
//                       textAlign: "left",
//                     }}
//                   >
//                     Delivered Qty
//                   </th>
//                 )}
//                 <th
//                   style={{
//                     border: "1px solid #000",
//                     padding: "8px",
//                     textAlign: "left",
//                   }}
//                 >
//                   Rate
//                 </th>
//                 <th
//                   style={{
//                     border: "1px solid #000",
//                     padding: "8px",
//                     textAlign: "left",
//                   }}
//                 >
//                   Tax %
//                 </th>
//                 <th
//                   style={{
//                     border: "1px solid #000",
//                     padding: "8px",
//                     textAlign: "left",
//                   }}
//                 >
//                   Discount {/* Added Discount Header */}
//                 </th>
//                 <th
//                   style={{
//                     border: "1px solid #000",
//                     padding: "8px",
//                     textAlign: "left",
//                   }}
//                 >
//                   Amount
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentTab.items.map((item, idx) => {
//                 const qty = key === "deliveryChallan" ? parseInt(item.deliveredQty) || 0 : parseInt(item.qty) || 0;
//                 const rate = parseFloat(item.rate) || 0;
//                 const tax = parseFloat(item.tax) || 0;
//                 const discount = parseFloat(item.discount) || 0; // Added discount
//                 const subtotal = rate * qty;
//                 const taxAmount = (subtotal * tax) / 100;
//                 const amount = subtotal + taxAmount - discount; // Subtract discount
//                 return (
//                   <tr key={idx}>
//                     <td style={{ border: "1px solid #000", padding: "8px" }}>
//                       {item.item_name || item.description}
//                     </td>
//                     <td style={{ border: "1px solid #000", padding: "8px" }}>
//                       {item.qty}
//                     </td>
//                     {key === "deliveryChallan" && (
//                       <td style={{ border: "1px solid #000", padding: "8px" }}>
//                         {item.deliveredQty}
//                       </td>
//                     )}
//                     <td style={{ border: "1px solid #000", padding: "8px" }}>
//                       ${rate.toFixed(2)}
//                     </td>
//                     <td style={{ border: "1px solid #000", padding: "8px" }}>
//                       {tax}%
//                     </td>
//                     <td style={{ border: "1px solid #000", padding: "8px" }}> {/* Discount Cell */}
//                       ${discount.toFixed(2)}
//                     </td>
//                     <td style={{ border: "1px solid #000", padding: "8px" }}>
//                       ${amount.toFixed(2)}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td
//                   colSpan={key === "deliveryChallan" ? 6 : 5}
//                   style={{
//                     textAlign: "right",
//                     fontWeight: "bold",
//                     border: "1px solid #000",
//                     padding: "8px",
//                   }}
//                 >
//                   Total:
//                 </td>
//                 <td
//                   style={{
//                     fontWeight: "bold",
//                     border: "1px solid #000",
//                     padding: "8px",
//                   }}
//                 >
//                   $
//                   {calculateTotalWithTaxAndDiscount(currentTab.items).toFixed(2)} {/* Updated to use Total function */}
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         )}

//         {/* Payment Details (Payment Tab) */}
//         {key === "payment" && (
//           <div style={{ marginBottom: "15px" }}>
//             <h5>PAYMENT DETAILS</h5>
//             <p>
//               <strong>Amount Paid:</strong> $
//               {parseFloat(currentTab.amount || 0).toFixed(2)}
//             </p>
//             <p>
//               <strong>Payment Method:</strong> {currentTab.paymentMethod}
//             </p>
//             <p>
//               <strong>Status:</strong> {currentTab.paymentStatus}
//             </p>
//           </div>
//         )}

//         {/* Terms & Conditions */}
//         {currentTab.terms && (
//           <div style={{ marginBottom: "15px" }}>
//             <h5>TERMS & CONDITIONS</h5>
//             <p>{currentTab.terms}</p>
//           </div>
//         )}

//         {/* Attachments */}
//         <div style={{ marginBottom: "15px" }}>
//           {currentTab.signature && (
//             <div style={{ marginBottom: "10px" }}>
//               <strong>SIGNATURE</strong>
//               <br />
//               <img
//                 src={currentTab.signature}
//                 alt="Signature"
//                 style={{
//                   maxWidth: "150px",
//                   maxHeight: "80px",
//                   marginTop: "5px",
//                 }}
//               />
//             </div>
//           )}
//           {currentTab.photo && (
//             <div style={{ marginBottom: "10px" }}>
//               <strong>PHOTO</strong>
//               <br />
//               <img
//                 src={currentTab.photo}
//                 alt="Photo"
//                 style={{
//                   maxWidth: "150px",
//                   maxHeight: "150px",
//                   objectFit: "cover",
//                   marginTop: "5px",
//                 }}
//               />
//             </div>
//           )}
//           {currentTab.files && currentTab.files.length > 0 && (
//             <div>
//               <strong>FILES</strong>
//               <ul style={{ listStyle: "none", padding: 0, marginTop: "5px" }}>
//                 {currentTab.files.map((file, i) => (
//                   <li key={i}>
//                     {file.name} ({(file.size / 1024).toFixed(1)} KB)
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Footer Note */}
//         <p
//           style={{
//             textAlign: "center",
//             fontWeight: "bold",
//             marginTop: "30px",
//             fontSize: "1.1em",
//           }}
//         >
//           {currentTab.footerNote || "Thank you for your business!"}
//         </p>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="container-fluid mt-4 px-2" ref={formRef}>
//         <h4 className="text-center mb-4">Sales Process</h4>

//         {/* Top Action Buttons */}
//         <div className="d-flex flex-wrap justify-content-center gap-2 gap-sm-3 mb-4">
//           {/* Print English */}
//           <Button
//             variant="warning"
//             onClick={() => handlePrint("english")}
//             className="flex-fill flex-sm-grow-0"
//             style={{
//               minWidth: "130px",
//               fontSize: "0.95rem",
//               padding: "6px 10px",
//             }}
//           >
//             Print (English)
//           </Button>
//           {/* Print Arabic */}
//           <Button
//             variant="warning"
//             onClick={() => handlePrint("arabic")}
//             className="flex-fill flex-sm-grow-0"
//             style={{
//               minWidth: "130px",
//               fontSize: "0.95rem",
//               padding: "6px 10px",
//               backgroundColor: "#d39e00",
//               borderColor: "#c49200",
//             }}
//           >
//             طباعة (العربية)
//           </Button>
//           {/* Print Both */}
//           <Button
//             variant="warning"
//             onClick={() => handlePrint("both")}
//             className="flex-fill flex-sm-grow-0"
//             style={{
//               minWidth: "150px",
//               fontSize: "0.95rem",
//               padding: "6px 10px",
//               backgroundColor: "#c87f0a",
//               borderColor: "#b87409",
//             }}
//           >
//             Print Both (EN + AR)
//           </Button>
//           {/* Send Button */}
//           <Button
//             variant="info"
//             onClick={handleSend}
//             className="flex-fill flex-sm-grow-0"
//             style={{
//               color: "white",
//               minWidth: "110px",
//               fontSize: "0.95rem",
//               padding: "6px 10px",
//             }}
//           >
//             Send
//           </Button>
//           {/* Download PDF */}
//           <Button
//             variant="success"
//             onClick={handleDownloadPDF}
//             className="flex-fill flex-sm-grow-0"
//             style={{
//               minWidth: "130px",
//               fontSize: "0.95rem",
//               padding: "6px 10px",
//             }}
//           >
//             Download PDF
//           </Button>
//           {/* Download Excel */}
//           <Button
//             variant="primary"
//             onClick={handleDownloadExcel}
//             className="flex-fill flex-sm-grow-0"
//             style={{
//               minWidth: "130px",
//               fontSize: "0.95rem",
//               padding: "6px 10px",
//             }}
//           >
//             Download Excel
//           </Button>
//         </div>

//         <Tabs activeKey={key} onSelect={setKey} className="mb-4" fill>
//           <Tab eventKey="quotation" title="Quotation">
//             {renderQuotationTab()}
//           </Tab>
//           <Tab eventKey="salesOrder" title="Sales Order">
//             {renderSalesOrderTab()}
//           </Tab>
//           <Tab eventKey="deliveryChallan" title="Delivery Challan">
//             {renderDeliveryChallanTab()}
//           </Tab>
//           <Tab eventKey="invoice" title="Invoice">
//             {renderInvoiceTab()}
//           </Tab>
//           <Tab eventKey="payment" title="Payment">
//             {renderPaymentTab()}
//           </Tab>
//         </Tabs>

//         {/* Hidden PDF View - Only for PDF generation and printing */}
//         <div
//           style={{
//             visibility: "hidden",
//             position: "absolute",
//             left: "-9999px",
//             top: "-9999px",
//             width: "210mm",
//             padding: "15mm",
//             boxSizing: "border-box",
//           }}
//         >
//           <div id="pdf-view" ref={pdfRef}>
//             {renderPDFView()}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default MultiStepSalesForm;





// MultiStepSalesForm.jsx
// ... (other imports remain the same)
import React, { useState, useRef, useEffect } from "react";
import {
  Tabs,
  Tab,
  Form,
  Button,
  Table,
  Row,
  Col,
  Modal,
  InputGroup,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
// import "./MultiStepSalesForm.css"; // Ensure this CSS file is included in your project
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faTrash,
  faEye,
  faEdit,
  faPlus,
  faSearch,
  faUserPlus,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../../Api/axiosInstance';
import GetCompanyId from '../../../Api/GetCompanyId';

const MultiStepSalesForm = ({
  onSubmit,
  initialData = {},
  initialStep = "quotation",
  companyDetails = {}, // Pass company details from parent
  availableItems = [], // Pass items from parent
  warehouses = [], // Pass warehouses from parent
  loadingItems = false, // Pass loading state from parent
  loadingWarehouses = false, // Pass loading state from parent
}) => {
  const navigate = useNavigate();
  const [key, setKey] = useState(initialStep);
  const tabsWithItems = [
    "quotation",
    "salesOrder",
    "deliveryChallan",
    "invoice",
  ];
  const formRef = useRef();
  const pdfRef = useRef();

  // Sales workflow state
  const [salesWorkflow, setSalesWorkflow] = useState([]);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);

  // --- Form Data State ---
  const [formData, setFormData] = useState(() => {
    const initialFormData = {
      // Company Info
      companyInfo: {
        company_id: companyDetails.companyId, // Will be set by GetCompanyId
        company_name: companyDetails.name || "",
        company_address: companyDetails.address || "",
        company_email: companyDetails.email || "",
        company_phone: companyDetails.phone || "",
        logo_url: companyDetails.branding?.company_logo_url || "",
        bank_name: companyDetails.bank_details?.bank_name || "",
        account_no: companyDetails.bank_details?.account_number || "",
        account_holder: companyDetails.bank_details?.account_holder || "",
        ifsc_code: companyDetails.bank_details?.ifsc_code || "",
        terms: companyDetails.terms_and_conditions || "",
        notes: companyDetails.notes || "",
        id: null, // For updates
      },
      // Shipping Details
      shippingDetails: {
        bill_to_name: "",
        bill_to_address: "",
        bill_to_email: "",
        bill_to_phone: "",
        bill_to_attention_name: "", // From SO
        ship_to_name: "",
        ship_to_address: "",
        ship_to_email: "",
        ship_to_phone: "",
        ship_to_attention_name: "", // From SO
      },
      // Items
      items: [
        {
          item_name: "",
          qty: "",
          rate: "",
          tax_percent: 0, // Changed from 'tax'
          discount: 0,
          amount: 0, // Calculated
          warehouse_id: null, // Assuming ID is needed
          hsn: "",
          uom: "PCS",
          sku: "",
          barcode: "",
          warehouses: [], // List of warehouses for the item
        },
      ],
      // Totals
      sub_total: 0,
      total: 0,
      // Steps Data - Updated structure
      steps: {
        quotation: {
          step: "quotation",
          status: "pending", // Use string status
          data: {
            quotation_no: "", // Auto-generated Quotation No
            manual_quo_no: "", // Optional manual ref
            quotation_date: new Date().toISOString().split("T")[0],
            valid_till: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
            qoutation_to_customer_name: "",
            qoutation_to_customer_address: "",
            qoutation_to_customer_email: "",
            qoutation_to_customer_phone: "",
            notes: companyDetails.notes || "",
            customer_ref: "", // Add customer reference if needed
            id: null, // For updates
          },
        },
        sales_order: {
          step: "sales_order",
          status: "pending", // Use string status
          data: {
            SO_no: "", // Auto-generated SO No
            manual_ref_no: "", // Manual SO Ref
            manual_quo_no: "", // Manual QUO Ref linked to SO
            id: null, // For updates
          },
        },
        delivery_challan: {
          step: "delivery_challan",
          status: "pending", // Use string status
          data: {
            challan_no: "", // Auto-generated DC No
            manual_challan_no: "", // Manual DC Ref
            driver_name: "",
            driver_phone: "",
            id: null, // For updates
          },
        },
        invoice: {
          step: "invoice",
          status: "pending", // Use string status
          data: {
            invoice_no: "", // Auto-generated INV No
            manual_invoice_no: "", // Manual INV Ref
            invoice_date: new Date().toISOString().split("T")[0],
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 days from now
            id: null, // For updates
          },
        },
        payment: {
          step: "payment",
          status: "pending", // Use string status
          data: {
            payment_no: "", // Auto-generated PAY No
            manual_payment_no: "", // Manual PAY Ref
            payment_date: new Date().toISOString().split("T")[0],
            amount_received: "",
            note: "",
            id: null, // For updates
          },
        },
      },
      // Additional Info
      additionalInfo: {
        signature_url: "",
        photo_url: "",
        attachment_url: "",
      },
      // Footer Note (if needed across all steps, otherwise manage per step)
      footerNote: "Thank you!",
    };

    // Merge initialData if provided (guard against null/undefined)
    // This part needs careful handling based on how initialData is structured now
    // Example: if initialData comes from an API GET response in the new format
    if (initialData && initialData.steps) {
      // Example mapping if initialData matches the new API schema
      // You might need to adjust this logic based on your exact initial data structure
      Object.keys(initialData.steps || {}).forEach(stepKey => {
        const stepData = initialData.steps[stepKey]?.data;
        if (stepData) {
          setFormData(prev => ({
            ...prev,
            steps: {
              ...prev.steps,
              [stepKey]: {
                ...prev.steps[stepKey],
                data: { ...prev.steps[stepKey].data, ...stepData }
              }
            }
          }));
        }
      });
      // Map other top-level fields if present in initialData
      if (initialData.company_info) {
        setFormData(prev => ({
          ...prev,
          companyInfo: { ...prev.companyInfo, ...initialData.company_info }
        }));
      }
      if (initialData.shipping_details) {
        setFormData(prev => ({
          ...prev,
          shippingDetails: { ...prev.shippingDetails, ...initialData.shipping_details }
        }));
      }
      if (initialData.items) {
        setFormData(prev => ({
          ...prev,
          items: initialData.items
        }));
      }
      if (initialData.sub_total !== undefined) {
        setFormData(prev => ({
          ...prev,
          sub_total: initialData.sub_total
        }));
      }
      if (initialData.total !== undefined) {
        setFormData(prev => ({
          ...prev,
          total: initialData.total
        }));
      }
      if (initialData.additional_info) {
        setFormData(prev => ({
          ...prev,
          additionalInfo: { ...prev.additionalInfo, ...initialData.additional_info }
        }));
      }
    }
    // If initialData doesn't match the new schema, the default structure above will be used

    return initialFormData;
  });

  // Fetch company details by logged-in company id and populate companyInfo
  useEffect(() => {
    const company_id = GetCompanyId();
    if (!company_id) return;
    const fetchCompany = async () => {
      try {
        const response = await axiosInstance.get(`auth/Company/${company_id}`);
        const company = response?.data?.data;
        if (!company) return;

        setFormData(prev => ({
          ...prev,
          companyInfo: {
            ...prev.companyInfo,
            company_id: company_id, // Set the fetched ID
            company_name: company.name || prev.companyInfo.company_name,
            company_address: company.address || prev.companyInfo.company_address,
            company_email: company.email || prev.companyInfo.company_email,
            company_phone: company.phone || prev.companyInfo.company_phone,
            logo_url: company.branding?.company_logo_url || prev.companyInfo.logo_url,
            bank_name: company.bank_details?.bank_name || prev.companyInfo.bank_name,
            account_no: company.bank_details?.account_number || prev.companyInfo.account_no,
            account_holder: company.bank_details?.account_holder || prev.companyInfo.account_holder,
            ifsc_code: company.bank_details?.ifsc_code || prev.companyInfo.ifsc_code,
            terms: company.terms_and_conditions || prev.companyInfo.terms,
            notes: company.notes || prev.companyInfo.notes,
          }
        }));
      } catch (err) {
        console.error('Failed to fetch company details:', err);
      }
    };
    fetchCompany();
  }, []);

  // Fetch sales workflow data
  useEffect(() => {
    const fetchSalesWorkflow = async () => {
      try {
        setLoadingWorkflow(true);
        const company_id = GetCompanyId();
        if (!company_id) return;
        
        const response = await axiosInstance.get(`sales-order/create-sales-order/${company_id}`);
        if (response?.data?.data) {
          setSalesWorkflow(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch sales workflow:', err);
      } finally {
        setLoadingWorkflow(false);
      }
    };

    fetchSalesWorkflow();
  }, []);

  // Search state for each row
  const [rowSearchTerms, setRowSearchTerms] = useState({});
  const [showRowSearch, setShowRowSearch] = useState({});

  // Search state for each row's warehouse
  const [warehouseSearchTerms, setWarehouseSearchTerms] = useState({});
  const [showWarehouseSearch, setShowWarehouseSearch] = useState({});

  // Modals and state for adding items/services
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    hsn: "",
    tax_percent: 0, // Changed from 'tax'
    sellingPrice: 0,
    uom: "PCS",
  });
  const [serviceForm, setServiceForm] = useState({
    name: "",
    serviceDescription: "",
    price: "",
    tax: "",
  });

  // Customer search state (for Quotation Tab)
  const [customerList, setCustomerList] = useState([]); // Should come from parent or API call
  const [filteredCustomerList, setFilteredCustomerList] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [productList, setProductList] = useState(availableItems || []);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // When a customer is selected in the quotation tab, propagate basic customer info to all steps
  useEffect(() => {
    if (!selectedCustomer) return;

    // Update shipping details
    setFormData(prev => ({
      ...prev,
      shippingDetails: {
        ...prev.shippingDetails,
        bill_to_name: selectedCustomer.name_english || selectedCustomer.name || '',
        bill_to_address: selectedCustomer.address || '',
        bill_to_email: selectedCustomer.email || '',
        bill_to_phone: selectedCustomer.phone || selectedCustomer.mobile || '',
      },
      steps: {
        ...prev.steps,
        quotation: {
          ...prev.steps.quotation,
          data: {
            ...prev.steps.quotation.data,
            qoutation_to_customer_name: selectedCustomer.name_english || selectedCustomer.name || '',
            qoutation_to_customer_address: selectedCustomer.address || '',
            qoutation_to_customer_email: selectedCustomer.email || '',
            qoutation_to_customer_phone: selectedCustomer.phone || selectedCustomer.mobile || '',
          }
        }
      }
    }));
  }, [selectedCustomer]);

  // Categories (could also come from parent)
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

  // Fetch initial data (example placeholder - parent should handle this)
  useEffect(() => {
    // Example: setCustomerList([]); // Fetch from parent prop or API
    setFilteredCustomerList(customerList);
  }, [customerList]);

  // --- Reference ID and Auto-Number Generation ---
  const generateReferenceId = (stepKey) => {
    const prefixes = {
      quotation: "QUO",
      sales_order: "SO",
      delivery_challan: "DC",
      invoice: "INV",
      payment: "PAY",
    };
    const prefix = prefixes[stepKey] || "REF";
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${rand}`;
  };

  // --- Auto-fill Logic ---
  useEffect(() => {
    const { steps } = formData;
    // Quotation Auto-fill
    if (!steps.quotation.data.quotation_no) {
      const newRefId = generateReferenceId("quotation");
      handleChangeStepData("quotation", "quotation_no", newRefId);
    }

    // Sales Order Auto-fill
    if (!steps.sales_order.data.SO_no) {
      const newRefId = generateReferenceId("sales_order");
      handleChangeStepData("sales_order", "SO_no", newRefId);
    }
    // Link SO to Quotation No
    if (!steps.sales_order.data.manual_quo_no && steps.quotation.data.quotation_no) {
      handleChangeStepData("sales_order", "manual_quo_no", steps.quotation.data.quotation_no);
    }

    // Delivery Challan Auto-fill
    if (!steps.delivery_challan.data.challan_no) {
      const newRefId = generateReferenceId("delivery_challan");
      handleChangeStepData("delivery_challan", "challan_no", newRefId);
    }

    // Invoice Auto-fill
    if (!steps.invoice.data.invoice_no) {
      const newRefId = generateReferenceId("invoice");
      handleChangeStepData("invoice", "invoice_no", newRefId);
    }

    // Payment Auto-fill
    if (!steps.payment.data.payment_no) {
      const newRefId = generateReferenceId("payment");
      handleChangeStepData("payment", "payment_no", newRefId);
    }

  }, [formData.steps.quotation.data.quotation_no, formData.steps.sales_order.data.SO_no, formData.steps.sales_order.data.manual_quo_no, formData.steps.delivery_challan.data.challan_no, formData.steps.invoice.data.invoice_no, formData.steps.payment.data.payment_no]);

  // --- Handlers ---
  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleChangeStepData = (step, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [step]: {
          ...prev.steps[step],
          data: { ...prev.steps[step].data, [field]: value }
        }
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    // Recalculate amount if rate or qty changes
    if (field === "rate" || field === "qty") {
      const rate = parseFloat(updatedItems[index].rate) || 0;
      const qty = parseFloat(updatedItems[index].qty) || 0;
      updatedItems[index].amount = rate * qty;
    }
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleProductChange = (field, value) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceInput = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_name: "",
          qty: "",
          rate: "",
          tax_percent: 0,
          discount: 0,
          amount: 0,
          warehouse_id: null,
          hsn: "",
          uom: "PCS",
          sku: "",
          barcode: "",
          warehouses: [],
        },
      ],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  // --- Row Search Handlers ---
  const handleRowSearchChange = (index, value) => {
    setRowSearchTerms(prev => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleSelectSearchedItem = (index, item) => {
    const updatedItems = [...formData.items];
    // Support different API shapes: products use `item_name` and `sale_price` etc.
    const name = item.name || item.item_name || '';
    const rate = item.price || item.sale_price || item.sellingPrice || item.rate || '';
    const tax_percent = item.tax || item.tax_percent || 0;
    const discount = item.discount || item.discount_percent || 0;
    const hsn = item.hsn || '';
    const uom = item.uom || item.unit_detail?.uom_name || updatedItems[index].uom || 'PCS';
    const description = item.description || item.prod_description || updatedItems[index].description || '';
    const sku = item.sku || item.SKU || '';
    const barcode = item.barcode || '';
    const warehousesForItem = item.warehouses || item.warehouses_list || [];

    updatedItems[index] = {
      ...updatedItems[index],
      item_name: name,
      rate: rate,
      tax_percent: tax_percent,
      discount: discount,
      hsn: hsn,
      uom: uom,
      description: description,
      sku: sku,
      barcode: barcode,
      warehouses: warehousesForItem,
    };
    if (warehousesForItem && warehousesForItem.length > 0) {
      // Assuming warehouse_id is needed for backend
      updatedItems[index].warehouse_id = warehousesForItem[0].warehouse_id || null; // Or store name if backend expects name
    } else {
      updatedItems[index].warehouse_id = null;
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
    setShowRowSearch(prev => ({ ...prev, [index]: false }));
    setRowSearchTerms(prev => ({ ...prev, [index]: "" }));
  };

  const toggleRowSearch = (index) => {
    setShowRowSearch(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // --- Warehouse Search Handlers ---
  const handleWarehouseSearchChange = (index, value) => {
    setWarehouseSearchTerms(prev => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleSelectSearchedWarehouse = (index, warehouse) => {
    const updatedItems = [...formData.items];
    updatedItems[index].warehouse_id = warehouse.warehouse_id; // Assuming ID is used
    // Optionally update the name display if needed in UI
    updatedItems[index].warehouse_name = warehouse.warehouse_name;
    setFormData(prev => ({ ...prev, items: updatedItems }));
    setShowWarehouseSearch(prev => ({ ...prev, [index]: false }));
    setWarehouseSearchTerms(prev => ({ ...prev, [index]: "" }));
  };

  const toggleWarehouseSearch = (index) => {
    setShowWarehouseSearch(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // --- Calculation Functions ---
  const calculateTotalAmount = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty) || 0;
      return total + rate * qty;
    }, 0);
  };

  const calculateTotalWithTaxAndDiscount = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty) || 0;
      const tax_percent = parseFloat(item.tax_percent) || 0; // Changed from 'tax'
      const discount = parseFloat(item.discount) || 0;
      const subtotal = rate * qty;
      const taxAmount = (subtotal * tax_percent) / 100;
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
    // Mock Arabic translation
    const getArabicText = (text) => {
      const translations = {
        "QUOTATION": "عرض أسعار",
        "SALES ORDER": "طلب بيع",
        "DELIVERY CHALLAN": "إيصال توصيل",
        "INVOICE": "فاتورة",
        "PAYMENT RECEIPT": "إيصال دفع",
        "Company Name": "اسم الشركة",
        "Quotation No.": "رقم عرض السعر",
        "SO No.": "رقم أمر المبيعات",
        "Challan No.": "رقم الإيصال",
        "Invoice No.": "رقم الفاتورة",
        "Payment No.": "رقم الدفع",
        Date: "التاريخ",
        "Item Name": "اسم الصنف",
        Qty: "الكمية",
        Rate: "السعر",
        Amount: "المبلغ",
        Total: "الإجمالي",
        Attachments: "المرفقات",
        Signature: "التوقيع",
        Photo: "الصورة",
        Files: "الملفات",
        "Terms & Conditions": "الشروط والأحكام",
        "Thank you for your business!": "شكرًا لتعاملكم معنا!",
        "Driver Details": "تفاصيل السائق",
        "Vehicle No.": "رقم المركبة",
        "Delivery Date": "تاريخ التسليم",
        "Due Date": "تاريخ الاستحقاق",
        "Payment Method": "طريقة الدفع",
        "Bill To": "موجه إلى",
        "Ship To": "يشحن إلى",
        "Sub Total:": "المجموع الفرعي:",
        "Tax:": "الضريبة:",
        "Discount:": "الخصم:",
        "Total:": "الإجمالي:",
        "Notes": "ملاحظات",
        "Bank Details": "بيانات البنك",
      };
      return translations[text] || text;
    };
    const clone = printContent.cloneNode(true);
    const elements = clone.querySelectorAll("*");
    if (lang === "arabic" || lang === "both") {
      clone.style.direction = "rtl";
      clone.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
      elements.forEach((el) => {
        el.style.textAlign = "right";
      });
    }
    if (lang === "both") {
      elements.forEach((el) => {
        const text = el.innerText.trim();
        if (text && !el.querySelector("img") && !el.querySelector("input")) {
          const arabic = getArabicText(text);
          if (arabic !== text) {
            const arSpan = document.createElement("div");
            arSpan.innerText = arabic;
            arSpan.style.color = "#0066cc";
            arSpan.style.marginTop = "4px";
            arSpan.style.fontSize = "0.9em";
            el.appendChild(arSpan);
          }
        }
      });
    } else if (lang === "arabic") {
      elements.forEach((el) => {
        const text = el.innerText.trim();
        const arabic = getArabicText(text);
        if (arabic !== text) {
          el.innerText = arabic;
        }
      });
    }
    const printWindow = window.open("", "", "height=800,width=1000");
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; margin: 20px; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      .text-end { text-align: right; }
      .fw-bold { font-weight: bold; }
      hr { border: 2px solid #28a745; margin: 10px 0; }
      h2, h4, h5 { color: #28a745; }
      .attachment-img { max-width: 150px; max-height: 100px; object-fit: contain; margin: 5px 0; }
    `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(clone.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleSend = () => {
    window.location.href = `mailto:?subject=Sales Document&body=Please find the sales document details attached.`;
  };

  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `${key}-${formData.steps[key]?.data[`${key === 'sales_order' ? 'SO' : key}_no`] || "document"
          }.pdf`,
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        html2canvas: { scale: 3 },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .save();
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(formData.items);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, key);
    XLSX.writeFile(
      workbook,
      `${key}-${formData.steps[key]?.data[`${key === 'sales_order' ? 'SO' : key}_no`] || "draft"}.xlsx`
    );
  };

  // --- Navigation Buttons ---
  const handleSkip = () => {
    setKey((prev) => {
      if (prev === "quotation") return "salesOrder";
      if (prev === "salesOrder") return "deliveryChallan";
      if (prev === "deliveryChallan") return "invoice";
      if (prev === "invoice") return "payment";
      return "quotation";
    });
  };

  const handleSaveDraft = async () => {
    try {
      const company_id = GetCompanyId();
      if (!company_id) return;
      
      // Prepare the payload based on the current tab
      let payload = {};
      let endpoint = '';
      
      switch (key) {
        case 'quotation':
          endpoint = `sales-order/create-sales-order`;
          payload = {
            company_info: {
              company_id: company_id,
              company_name: formData.quotation.companyName,
              company_address: formData.quotation.companyAddress,
              company_email: formData.quotation.companyEmail,
              company_phone: formData.quotation.companyPhone,
              logo_url: formData.quotation.companyLogo,
              bank_name: formData.quotation.bankName,
              account_no: formData.quotation.accountNo,
              account_holder: formData.quotation.accountHolder,
              ifsc_code: formData.quotation.ifsc,
              terms: formData.quotation.terms
            },
            customer_info: {
              customer_id: formData.quotation.customerId,
              customer_name: formData.quotation.billToName,
              customer_address: formData.quotation.billToAddress,
              customer_email: formData.quotation.billToEmail,
              customer_phone: formData.quotation.billToPhone
            },
            items: formData.quotation.items.map(item => ({
              item_name: item.item_name,
              description: item.description,
              qty: item.qty,
              rate: item.rate,
              tax_percent: item.tax,
              discount: item.discount,
              amount: item.amount,
              uom: item.uom,
              hsn: item.hsn,
              sku: item.sku,
              barcode: item.barcode,
              warehouse_id: item.warehouse
            })),
            quotation_details: {
              quotation_no: formData.quotation.quotationNo,
              manual_quotation_ref: formData.quotation.manualQuotationRef,
              quotation_date: formData.quotation.quotationDate,
              valid_till: formData.quotation.validDate,
              notes: formData.quotation.notes,
              customer_ref: formData.quotation.customerReference
            },
            additional_info: {
              signature_url: formData.quotation.signature,
              photo_url: formData.quotation.photo,
              files: formData.quotation.files
            }
          };
          break;
          
        case 'salesOrder':
          endpoint = `sales-order/create-sales-order`;
          payload = {
            company_info: {
              company_id: company_id,
              company_name: formData.salesOrder.companyName,
              company_address: formData.salesOrder.companyAddress,
              company_email: formData.salesOrder.companyEmail,
              company_phone: formData.salesOrder.companyPhone,
              logo_url: formData.salesOrder.companyLogo,
              terms: formData.salesOrder.terms
            },
            shipping_details: {
              bill_to_name: formData.salesOrder.billToCompanyName,
              bill_to_address: formData.salesOrder.billToAddress,
              bill_to_email: formData.salesOrder.billToEmail,
              bill_to_phone: formData.salesOrder.billToPhone,
              bill_to_attention_name: formData.salesOrder.billToAttn,
              ship_to_name: formData.salesOrder.shipToCompanyName,
              ship_to_address: formData.salesOrder.shipToAddress,
              ship_to_email: formData.salesOrder.shipToEmail,
              ship_to_phone: formData.salesOrder.shipToPhone,
              ship_to_attention_name: formData.salesOrder.shipToAttn
            },
            items: formData.salesOrder.items.map(item => ({
              item_name: item.item_name,
              qty: item.qty,
              rate: item.rate,
              tax_percent: item.tax,
              discount: item.discount,
              amount: item.amount,
              warehouse_id: item.warehouse
            })),
            steps: {
              quotation: {
                quotation_no: formData.salesOrder.quotationNo,
                manual_quotation_ref: formData.salesOrder.manualQuotationRef
              },
              sales_order: {
                SO_no: formData.salesOrder.salesOrderNo,
                manual_ref_no: formData.salesOrder.manualOrderRef
              }
            },
            additional_info: {
              signature_url: formData.salesOrder.signature,
              photo_url: formData.salesOrder.photo,
              files: formData.salesOrder.files
            }
          };
          break;
          
        case 'deliveryChallan':
          endpoint = `delivery-challan/create-delivery-challan`;
          payload = {
            company_info: {
              company_id: company_id,
              company_name: formData.deliveryChallan.companyName,
              company_address: formData.deliveryChallan.companyAddress,
              company_email: formData.deliveryChallan.companyEmail,
              company_phone: formData.deliveryChallan.companyPhone,
              logo_url: formData.deliveryChallan.companyLogo,
              terms: formData.deliveryChallan.terms
            },
            shipping_details: {
              bill_to_name: formData.deliveryChallan.billToName,
              bill_to_address: formData.deliveryChallan.billToAddress,
              bill_to_email: formData.deliveryChallan.billToEmail,
              bill_to_phone: formData.deliveryChallan.billToPhone,
              ship_to_name: formData.deliveryChallan.shipToName,
              ship_to_address: formData.deliveryChallan.shipToAddress,
              ship_to_email: formData.deliveryChallan.shipToEmail,
              ship_to_phone: formData.deliveryChallan.shipToPhone
            },
            items: formData.deliveryChallan.items.map(item => ({
              item_name: item.item_name,
              qty: item.qty,
              delivered_qty: item.deliveredQty,
              rate: item.rate,
              tax_percent: item.tax,
              discount: item.discount,
              amount: item.amount,
              warehouse_id: item.warehouse
            })),
            delivery_details: {
              challan_no: formData.deliveryChallan.challanNo,
              manual_challan_no: formData.deliveryChallan.manualChallanNo,
              challan_date: formData.deliveryChallan.challanDate,
              vehicle_no: formData.deliveryChallan.vehicleNo,
              driver_name: formData.deliveryChallan.driverName,
              driver_phone: formData.deliveryChallan.driverPhone
            },
            steps: {
              sales_order: {
                SO_no: formData.deliveryChallan.salesOrderNo,
                manual_ref_no: formData.deliveryChallan.manualSalesOrderRef
              },
              delivery_challan: {
                challan_no: formData.deliveryChallan.challanNo,
                manual_challan_no: formData.deliveryChallan.manualChallanNo
              }
            },
            additional_info: {
              signature_url: formData.deliveryChallan.signature,
              photo_url: formData.deliveryChallan.photo,
              files: formData.deliveryChallan.files
            }
          };
          break;
          
        case 'invoice':
          endpoint = `invoice/create-invoice`;
          payload = {
            company_info: {
              company_id: company_id,
              company_name: formData.invoice.companyName,
              company_address: formData.invoice.companyAddress,
              company_email: formData.invoice.companyEmail,
              company_phone: formData.invoice.companyPhone,
              logo_url: formData.invoice.companyLogo,
              terms: formData.invoice.terms
            },
            shipping_details: {
              bill_to_name: formData.invoice.customerName,
              bill_to_address: formData.invoice.customerAddress,
              bill_to_email: formData.invoice.customerEmail,
              bill_to_phone: formData.invoice.customerPhone,
              ship_to_name: formData.invoice.shipToName,
              ship_to_address: formData.invoice.shipToAddress,
              ship_to_email: formData.invoice.shipToEmail,
              ship_to_phone: formData.invoice.shipToPhone
            },
            items: formData.invoice.items.map(item => ({
              item_name: item.description,
              qty: item.qty,
              rate: item.rate,
              tax_percent: item.tax,
              discount: item.discount,
              amount: item.amount,
              warehouse_id: item.warehouse
            })),
            invoice_details: {
              invoice_no: formData.invoice.invoiceNo,
              manual_invoice_no: formData.invoice.manualInvoiceNo,
              invoice_date: formData.invoice.invoiceDate,
              due_date: formData.invoice.dueDate,
              payment_status: formData.invoice.paymentStatus,
              payment_method: formData.invoice.paymentMethod,
              note: formData.invoice.note
            },
            steps: {
              delivery_challan: {
                challan_no: formData.invoice.challanNo,
                manual_challan_no: formData.invoice.manualChallanNo
              },
              invoice: {
                invoice_no: formData.invoice.invoiceNo,
                manual_invoice_no: formData.invoice.manualInvoiceNo
              }
            },
            additional_info: {
              signature_url: formData.invoice.signature,
              photo_url: formData.invoice.photo,
              files: formData.invoice.files
            }
          };
          break;
          
        case 'payment':
          endpoint = `payment/create-payment`;
          payload = {
            company_info: {
              company_id: company_id,
              company_name: formData.payment.companyName,
              company_address: formData.payment.companyAddress,
              company_email: formData.payment.companyEmail,
              company_phone: formData.payment.companyPhone,
              logo_url: formData.payment.companyLogo
            },
            customer_info: {
              customer_name: formData.payment.customerName,
              customer_address: formData.payment.customerAddress,
              customer_email: formData.payment.customerEmail,
              customer_phone: formData.payment.customerPhone
            },
            payment_details: {
              payment_no: formData.payment.paymentNo,
              manual_payment_no: formData.payment.manualPaymentNo,
              payment_date: formData.payment.paymentDate,
              amount_received: formData.payment.amount,
              payment_method: formData.payment.paymentMethod,
              payment_status: formData.payment.paymentStatus,
              payment_note: formData.payment.note
            },
            steps: {
              invoice: {
                invoice_no: formData.payment.invoiceNo,
                manual_invoice_no: formData.payment.manualInvoiceRef
              },
              payment: {
                payment_no: formData.payment.paymentNo,
                manual_payment_no: formData.payment.manualPaymentNo
              }
            },
            additional_info: {
              signature_url: formData.payment.signature,
              photo_url: formData.payment.photo,
              files: formData.payment.files
            }
          };
          break;
          
        default:
          return;
      }
      
      // Send the request to the API
      const response = await axiosInstance.post(endpoint, payload);
      if (response?.data?.success) {
        alert('Draft saved successfully!');
        // Refresh the sales workflow
        fetchSalesWorkflow();
      } else {
        alert('Failed to save draft. Please try again.');
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('Error saving draft. Please try again.');
    }
  };

  const fetchSalesWorkflow = async () => {
    try {
      setLoadingWorkflow(true);
      const company_id = GetCompanyId();
      if (!company_id) return;
      
      const response = await axiosInstance.get(`sales-order/company/${company_id}`);
      if (response?.data?.data) {
        setSalesWorkflow(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sales workflow:', err);
    } finally {
      setLoadingWorkflow(false);
    }
  };

  const handleSaveNext = async () => {
    // First save the current step
    await handleSaveDraft();
    
    // Then move to the next step
    setKey((prev) => {
      if (prev === "quotation") {
        const quotationSubTotal = calculateTotalAmount(formData.items);
        const quotationTotal = calculateTotalWithTaxAndDiscount(formData.items);
        setFormData(prevData => ({
          ...prevData,
          // Propagate shipping details to next steps if needed
          shippingDetails: {
            ...prevData.shippingDetails,
            // Example: set bill_to fields from quotation step data
            bill_to_name: prevData.steps.quotation.data.qoutation_to_customer_name,
            bill_to_address: prevData.steps.quotation.data.qoutation_to_customer_address,
            bill_to_email: prevData.steps.quotation.data.qoutation_to_customer_email,
            bill_to_phone: prevData.steps.quotation.data.qoutation_to_customer_phone,
          },
          steps: {
            ...prevData.steps,
            sales_order: {
              ...prevData.steps.sales_order,
              data: {
                ...prevData.steps.sales_order.data,
                manual_quo_no: prevData.steps.quotation.data.quotation_no, // Link SO to Quotation
                // Map other relevant fields if needed
              }
            },
            delivery_challan: {
              ...prevData.steps.delivery_challan,
              data: {
                ...prevData.steps.delivery_challan.data,
                // Map fields from SO if applicable
              }
            },
            invoice: {
              ...prevData.steps.invoice,
              data: {
                ...prevData.steps.invoice.data,
                // Map fields from DC if applicable
              }
            },
            payment: {
              ...prevData.steps.payment,
              data: {
                ...prevData.steps.payment.data,
                // Map fields from INV if applicable
              }
            }
          },
          items: prevData.items.map(item => ({ ...item })), // Propagate items
          sub_total: quotationSubTotal,
          total: quotationTotal,
        }));
        return "salesOrder";
      }
      // Add similar logic for other transitions if needed
      if (prev === "salesOrder") return "deliveryChallan";
      if (prev === "deliveryChallan") return "invoice";
      if (prev === "invoice") {
        const totalInvoiceAmount = calculateTotalWithTaxAndDiscount(formData.invoice.items);
        setFormData((prevData) => ({
          ...prevData,
          steps: {
            ...prevData.steps,
            payment: {
              ...prevData.steps.payment,
              data: {
                ...prevData.steps.payment.data,
                amount_received: "", // User needs to fill this
                // Map other relevant fields if needed
              }
            }
          },
          total: totalInvoiceAmount,
        }));
        return "payment";
      }
      return "quotation";
    });
  };

  const handleNext = () => {
    setKey((prev) => {
      if (prev === "quotation") return "salesOrder";
      if (prev === "salesOrder") return "deliveryChallan";
      if (prev === "deliveryChallan") return "invoice";
      if (prev === "invoice") return "payment";
      return "quotation";
    });
  };

  const handleFinalSubmit = async () => {
    try {
      // Save the payment data
      await handleSaveDraft();
      
      // Call the parent's onSubmit function with the complete form data
      onSubmit(formData, 'payment');
      
      // Show success message
      alert('Sales process completed successfully!');
      
      // Redirect to sales workflow page
      navigate('/sales-workflow');
    } catch (err) {
      console.error('Error submitting final form:', err);
      alert('Error submitting final form. Please try again.');
    }
  };

  // Navigate to a specific step in the workflow
  const navigateToStep = (step) => {
    setKey(step);
  };

      // Prepare items: exclude internal/frontend-only fields
      const itemsToSend = formData.items.map(item => {
        const rate = parseFloat(item.rate) || 0;
        const qty = parseFloat(item.qty) || 0;
        const tax_percent = parseFloat(item.tax_percent) || 0;
        const discount = parseFloat(item.discount) || 0;
        const subtotal = rate * qty;
        const amount = subtotal + (subtotal * tax_percent) / 100 - discount;

        return {
          item_name: item.item_name || "",
          qty: qty.toString(),
          rate: rate.toString(),
          tax_percent: tax_percent.toString(),
          discount: discount.toString(),
          amount: amount.toFixed(2),
          warehouse_id: item.warehouse_id || null,
          // Optional: include hsn, uom, etc. if backend requires
          hsn: item.hsn || "",
          uom: item.uom || "PCS",
          sku: item.sku || "",
          barcode: item.barcode || "",
        };
      });

      // Build steps as ARRAY (backend expects array)
      const stepsToSend = [
        {
          step: "quotation",
          status: formData.steps.quotation.status || "pending",
          data: {
            quotation_no: formData.steps.quotation.data.quotation_no || "",
            manual_quo_no: formData.steps.quotation.data.manual_quo_no || "",
            quotation_date: formData.steps.quotation.data.quotation_date || null,
            valid_till: formData.steps.quotation.data.valid_till || null,
            qoutation_to_customer_name: formData.steps.quotation.data.qoutation_to_customer_name || "",
            qoutation_to_customer_address: formData.steps.quotation.data.qoutation_to_customer_address || "",
            qoutation_to_customer_email: formData.steps.quotation.data.qoutation_to_customer_email || "",
            qoutation_to_customer_phone: formData.steps.quotation.data.qoutation_to_customer_phone || "",
            notes: formData.steps.quotation.data.notes || "",
            customer_ref: formData.steps.quotation.data.customer_ref || "",
          }
        },
        {
          step: "sales_order",
          status: formData.steps.sales_order.status || "pending",
          data: {
            SO_no: formData.steps.sales_order.data.SO_no || "",
            manual_ref_no: formData.steps.sales_order.data.manual_ref_no || "",
            manual_quo_no: formData.steps.sales_order.data.manual_quo_no || "",
          }
        },
        {
          step: "delivery_challan",
          status: formData.steps.delivery_challan.status || "pending",
          data: {
            challan_no: formData.steps.delivery_challan.data.challan_no || "",
            manual_challan_no: formData.steps.delivery_challan.data.manual_challan_no || "",
            driver_name: formData.steps.delivery_challan.data.driver_name || "",
            driver_phone: formData.steps.delivery_challan.data.driver_phone || "",
          }
        },
        {
          step: "invoice",
          status: formData.steps.invoice.status || "pending",
          data: {
            invoice_no: formData.steps.invoice.data.invoice_no || "",
            manual_invoice_no: formData.steps.invoice.data.manual_invoice_no || "",
            invoice_date: formData.steps.invoice.data.invoice_date || null,
            due_date: formData.steps.invoice.data.due_date || null,
          }
        },
        {
          step: "payment",
          status: formData.steps.payment.status || "pending",
          data: {
            payment_no: formData.steps.payment.data.payment_no || "",
            manual_payment_no: formData.steps.payment.data.manual_payment_no || "",
            payment_date: formData.steps.payment.data.payment_date || null,
            amount_received: (parseFloat(formData.steps.payment.data.amount_received) || 0).toString(),
            note: formData.steps.payment.data.note || "",
          }
        }
      ];

      // Calculate totals
      const sub_total = calculateTotalAmount(formData.items);
      const total = calculateTotalWithTaxAndDiscount(formData.items);

      // Final payload
      const payload = {
        company_info: {
          company_id: companyId, // ✅ CORRECT company_id from auth
          company_name: formData.companyInfo.company_name || "",
          company_address: formData.companyInfo.company_address || "",
          company_email: formData.companyInfo.company_email || "",
          company_phone: formData.companyInfo.company_phone || "",
          logo_url: formData.companyInfo.logo_url || "",
          bank_name: formData.companyInfo.bank_name || "",
          account_no: formData.companyInfo.account_no || "",
          account_holder: formData.companyInfo.account_holder || "",
          ifsc_code: formData.companyInfo.ifsc_code || "",
          terms: formData.companyInfo.terms || "",
          notes: formData.companyInfo.notes || "",
        },
        shipping_details: {
          bill_to_name: formData.shippingDetails.bill_to_name || "",
          bill_to_address: formData.shippingDetails.bill_to_address || "",
          bill_to_email: formData.shippingDetails.bill_to_email || "",
          bill_to_phone: formData.shippingDetails.bill_to_phone || "",
          bill_to_attention_name: formData.shippingDetails.bill_to_attention_name || "",
          ship_to_name: formData.shippingDetails.ship_to_name || "",
          ship_to_address: formData.shippingDetails.ship_to_address || "",
          ship_to_email: formData.shippingDetails.ship_to_email || "",
          ship_to_phone: formData.shippingDetails.ship_to_phone || "",
          ship_to_attention_name: formData.shippingDetails.ship_to_attention_name || "",
        },
        items: itemsToSend,
        sub_total: sub_total.toFixed(2),
        total: total.toFixed(2),
        steps: stepsToSend, // ✅ Array, not object
        additional_info: {
          signature_url: formData.additionalInfo.signature_url || "",
          photo_url: formData.additionalInfo.photo_url || "",
          attachment_url: formData.additionalInfo.attachment_url || "",
        }
      };

      console.log("✅ Final Payload to Backend:", payload);

      const response = await axiosInstance.post("sales-order/create-sales-order", payload);
      if (response.status === 200 || response.status === 201) {
        alert("✅ Sales order submitted successfully!");
      } else {
        throw new Error(`Submission failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Submission Error:", error);
      if (error.response) {
        console.error("Server Response:", error.response.data);
        alert(`❌ Error: ${error.response.data.message || "Failed to submit"}`);
      } else if (error.request) {
        alert("❌ Network error. Please check your internet connection.");
      } else {
        alert(`❌ Unexpected error: ${error.message}`);
      }
    }
  };

  // File handlers - Updated to use additionalInfo section
  const handleSignatureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Implement file upload logic here
      // const url = await uploadFile(file); // Replace with your upload function
      // handleChange("additionalInfo", "signature_url", url);
      console.log("Signature file selected:", file.name);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Implement file upload logic here
      // const url = await uploadFile(file); // Replace with your upload function
      // handleChange("additionalInfo", "photo_url", url);
      console.log("Photo file selected:", file.name);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      // Implement file upload logic here for each file
      // const url = await uploadFile(file); // Replace with your upload function
      // const fileInfo = { name: file.name, url: url };
      // handleChange("additionalInfo", "attachment_url", url); // Assuming single attachment URL for now
      console.log("Attachment file selected:", file.name);
    }
  };

  const removeFile = (index) => {
    // Implement logic to remove file from state if needed
    // This is more complex if handling multiple files
    console.log("Remove file at index:", index);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      alert("Product name and category are required!");
      return;
    }
    const itemToAdd = {
      item_name: newItem.name,
      qty: 1,
      rate: newItem.sellingPrice,
      tax_percent: newItem.tax_percent, // Changed from 'tax'
      discount: 0,
      hsn: newItem.hsn,
      uom: newItem.uom,
      warehouse_id: null, // Assuming ID
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, itemToAdd],
    }));
    setNewItem({
      name: "",
      category: "",
      hsn: "",
      tax_percent: 0, // Changed from 'tax'
      sellingPrice: 0,
      uom: "PCS",
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
      setNewCategory("");
    }
    setShowAddCategoryModal(false);
  };

  const handleAddService = () => {
    if (!serviceForm.name || !serviceForm.price) {
      alert("Service name and price are required!");
      return;
    }
    const serviceItem = {
      item_name: serviceForm.name,
      qty: 1,
      rate: serviceForm.price,
      tax_percent: serviceForm.tax || 0, // Changed from 'tax'
      discount: 0,
      description: serviceForm.serviceDescription,
      warehouse_id: null, // Assuming ID
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, serviceItem],
    }));
    setServiceForm({
      name: "",
      serviceDescription: "",
      price: "",
      tax: "",
    });
    setShowServiceModal(false);
  };

  // --- Quotation Tab Specific Handlers ---
  // Filter customers based on search term
  useEffect(() => {
    const term = (customerSearchTerm || '').trim();
    if (!term) {
      setFilteredCustomerList(customerList);
      return;
    }
    const lower = term.toLowerCase();
    const digits = term.replace(/\D/g, '');
    const filtered = customerList.filter(customer => {
      const nameMatch = (customer?.name_english || '').toString().toLowerCase().includes(lower);
      const companyMatch = (customer?.company_name || '').toString().toLowerCase().includes(lower);
      const emailMatch = (customer?.email || '').toString().toLowerCase().includes(lower);
      const phoneFields = [customer?.phone, customer?.mobile, customer?.contact, customer?.phone_no, customer?.mobile_no];
      const phoneMatch = digits ? phoneFields.some(p => p && p.toString().replace(/\D/g, '').includes(digits)) : false;
      return !!(nameMatch || companyMatch || emailMatch || phoneMatch);
    });
    setFilteredCustomerList(filtered);
  }, [customerSearchTerm, customerList]);

  // Handle clicks outside the customer dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        searchRef.current && !searchRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch customers for the logged-in company so search works by name/phone
  useEffect(() => {
    const company_id = GetCompanyId();
    if (!company_id) return;
    const fetchCustomers = async () => {
      try {
        const res = await axiosInstance.get(`vendorCustomer/company/${company_id}?type=customer`);
        const data = res?.data?.data || [];
        setCustomerList(data);
        setFilteredCustomerList(data);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch products for the company and keep local productList used by item search
  useEffect(() => {
    const company_id = GetCompanyId();
    if (!company_id) return;
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get(`products/company/${company_id}`);
        const data = res?.data?.data || [];
        setProductList(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        // fallback to availableItems prop if provided
        setProductList(availableItems || []);
      }
    };
    fetchProducts();
  }, []);

  // Keep productList in sync when parent passes availableItems prop
  useEffect(() => {
    if (availableItems && availableItems.length > 0) setProductList(availableItems);
  }, [availableItems]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      shippingDetails: {
        ...prev.shippingDetails,
        bill_to_name: customer.name_english || '',
        bill_to_address: customer.address || '',
        bill_to_email: customer.email || '',
        bill_to_phone: customer.phone || '',
      },
      steps: {
        ...prev.steps,
        quotation: {
          ...prev.steps.quotation,
          data: {
            ...prev.steps.quotation.data,
            qoutation_to_customer_name: customer.name_english || '',
            qoutation_to_customer_address: customer.address || '',
            qoutation_to_customer_email: customer.email || '',
            qoutation_to_customer_phone: customer.phone || '',
            // id: customer.id // If customer ID is needed in quotation data
          }
        }
      }
    }));
    setCustomerSearchTerm(customer.name_english);
    setShowCustomerDropdown(false);
  };

  // --- Render Functions ---
  const renderItemsTable = (tab) => {
    const items = formData.items || [];
    const handleItemChange = (index, field, value) => {
      const updatedItems = [...items];
      updatedItems[index][field] = value;
      // Recalculate amount if rate or qty changes
      if (field === "rate" || field === "qty") {
        const rate = parseFloat(updatedItems[index].rate) || 0;
        const qty = parseFloat(updatedItems[index].qty) || 0;
        updatedItems[index].amount = rate * qty;
      }
      setFormData(prev => ({ ...prev, items: updatedItems }));
    };

    const addItem = () => {
      setFormData(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            item_name: "",
            qty: "",
            rate: "",
            tax_percent: 0, // Changed from 'tax'
            discount: 0,
            amount: 0,
            warehouse_id: null,
            hsn: "",
            uom: "PCS",
            sku: "",
            barcode: "",
            warehouses: [],
          },
        ],
      }));
    };

    const removeItem = (idx) => {
      const updatedItems = items.filter((_, index) => index !== idx);
      setFormData(prev => ({ ...prev, items: updatedItems }));
    };

    // Filter items based on search term for each row
    const getFilteredItems = (index) => {
      const searchTerm = (rowSearchTerms[index] || "").trim();
      if (!searchTerm) return productList;
      const lower = searchTerm.toLowerCase();
      return productList.filter((item) => {
        const name = (item.name || item.item_name || '').toString().toLowerCase();
        const category = (item.category || item.item_category?.item_category_name || '').toString().toLowerCase();
        const sku = (item.sku || item.SKU || '').toString().toLowerCase();
        const barcode = (item.barcode || '').toString().toLowerCase();
        const desc = (item.description || '').toString().toLowerCase();
        return (
          name.includes(lower) ||
          category.includes(lower) ||
          sku.includes(lower) ||
          barcode.includes(lower) ||
          desc.includes(lower)
        );
      });
    };

    // Get warehouses to display in the dropdown for a specific row
    const getWarehousesForDropdown = (item) => {
      if (item.item_name && item.warehouses && item.warehouses.length > 0) {
        return item.warehouses;
      }
      return warehouses.map((wh) => ({ ...wh, stock_qty: null }));
    };

    // Filter warehouses based on search term for each row
    const getFilteredWarehouses = (index) => {
      const item = items[index];
      const searchTerm = warehouseSearchTerms[index] || "";
      const warehousesToFilter = getWarehousesForDropdown(item);
      if (!searchTerm) return warehousesToFilter;
      return warehousesToFilter.filter(
        (wh) =>
          wh.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (wh.location && wh.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    };

    return (
      <div>
        <div className="d-flex justify-content-between mb-2">
          <div>
            <Button
              size="sm"
              onClick={addItem}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "6px 12px",
                fontWeight: "500",
                marginRight: "5px",
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Row
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "6px 12px",
                fontWeight: "500",
                marginRight: "5px",
              }}
            >
              + Add Product
            </Button>
            <Button
              size="sm"
              onClick={() => setShowServiceModal(true)}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "6px 12px",
                fontWeight: "500",
              }}
            >
              + Add Service
            </Button>
          </div>
        </div>
        {/* Add Product Modal */}
        <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>Add Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={(e) => handleProductChange(e.target.name, e.target.value)}
                  placeholder="Enter product name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <div className="d-flex">
                  <Form.Select
                    name="category"
                    value={newItem.category}
                    onChange={(e) => handleProductChange(e.target.name, e.target.value)}
                    className="flex-grow-1 me-2"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowAddCategoryModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>HSN Code</Form.Label>
                <Form.Control
                  type="text"
                  name="hsn"
                  value={newItem.hsn}
                  onChange={(e) => handleProductChange(e.target.name, e.target.value)}
                  placeholder="Enter HSN code"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Selling Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="sellingPrice"
                  value={newItem.sellingPrice}
                  onChange={(e) => handleProductChange(e.target.name, e.target.value)}
                  placeholder="Enter selling price"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tax %</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="tax_percent" // Changed from 'tax'
                  value={newItem.tax_percent} // Changed from 'tax'
                  onChange={(e) => handleProductChange(e.target.name, e.target.value)}
                  placeholder="e.g. 18"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>UOM</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    name="uom"
                    value={newItem.uom}
                    onChange={(e) => handleProductChange(e.target.name, e.target.value)}
                    placeholder="e.g. PCS"
                    className="flex-grow-1 me-2"
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowUOMModal(true)}
                  >
                    Add
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }}
              onClick={handleAddItem}
            >
              Add Product
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Service Modal */}
        <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>Add Service</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Service Name</Form.Label>
                <Form.Control
                  name="name"
                  value={serviceForm.name}
                  onChange={handleServiceInput}
                  required
                  className="shadow-sm"
                  placeholder="Enter service name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Service Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="serviceDescription"
                  value={serviceForm.serviceDescription}
                  onChange={handleServiceInput}
                  rows={3}
                  className="shadow-sm"
                  placeholder="Describe the service"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="price"
                  value={serviceForm.price}
                  onChange={handleServiceInput}
                  placeholder="Enter service price"
                  className="shadow-sm"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tax %</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="tax"
                  value={serviceForm.tax}
                  onChange={handleServiceInput}
                  className="shadow-sm"
                  placeholder="e.g. 18"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowServiceModal(false)}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }}
              onClick={handleAddService}
            >
              Add Service
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Add Category Modal */}
        <Modal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddCategory}>
              <Form.Group>
                <Form.Label>New Category Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddCategoryModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCategory}>
              Add Category
            </Button>
          </Modal.Footer>
        </Modal>

        <Table bordered hover size="sm" className="dark-bordered-table">
          <thead className="bg-light">
            <tr>
              <th>Item Name</th>
              <th>Warehouse (Stock)</th>
              <th>Qty</th>
              {tab === "deliveryChallan" && <th>Delivered Qty</th>}
              <th>Rate</th>
              <th>Tax %</th>
              <th>Discount</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = tab === "deliveryChallan" ? parseInt(item.deliveredQty) || 0 : parseInt(item.qty) || 0;
              const amount = (parseFloat(item.rate) || 0) * qty;
              const itemRowKey = idx;
              const filteredItems = getFilteredItems(idx);
              const isItemSearchVisible = showRowSearch[itemRowKey];
              const warehouseRowKey = idx;
              const filteredWarehouses = getFilteredWarehouses(idx);
              const isWarehouseSearchVisible = showWarehouseSearch[warehouseRowKey];
              return (
                <tr key={idx}>
                  {/* Item Name Cell with Search */}
                  <td style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.item_name}
                        onChange={(e) => {
                          handleItemChange(idx, "item_name", e.target.value);
                          handleRowSearchChange(idx, e.target.value);
                        }}
                        onFocus={() => toggleRowSearch(idx)}
                        placeholder="Click to search products"
                        style={{ marginRight: "5px" }}
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => toggleRowSearch(idx)}
                        title="Search Items"
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                    {isItemSearchVisible && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                      >
                        <InputGroup size="sm">
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                          </InputGroup.Text>
                          <FormControl
                            placeholder="Search items..."
                            value={rowSearchTerms[itemRowKey] || ""}
                            onChange={(e) =>
                              handleRowSearchChange(idx, e.target.value)
                            }
                            autoFocus
                          />
                        </InputGroup>
                        {loadingItems ? (
                          <div style={{ padding: "8px", textAlign: "center", color: "#666" }}>
                            Loading products...
                          </div>
                        ) : filteredItems.length > 0 ? (
                          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                            {filteredItems.map((filteredItem) => (
                              <div
                                key={filteredItem.id}
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #eee",
                                }}
                                onClick={() =>
                                  handleSelectSearchedItem(idx, filteredItem)
                                }
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor = "#f0f0f0")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor = "white")
                                }
                              >
                                <div><strong>{filteredItem.name || filteredItem.item_name}</strong></div>
                                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                                  {(filteredItem.category || filteredItem.item_category?.item_category_name || '')} - ${((filteredItem.price || filteredItem.sale_price || filteredItem.sellingPrice) ? parseFloat(filteredItem.price || filteredItem.sale_price || filteredItem.sellingPrice).toFixed(2) : '0.00')}
                                  {(filteredItem.sku || filteredItem.SKU) && <span> | SKU: {filteredItem.sku || filteredItem.SKU}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: "8px", textAlign: "center", color: "#666" }}>
                            No items found
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  {/* Warehouse Cell with Search */}
                  <td style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.warehouse_name || ""} // Display name if available
                        onChange={(e) =>
                          handleWarehouseSearchChange(idx, e.target.value)
                        }
                        onFocus={() => toggleWarehouseSearch(idx)}
                        placeholder="Click to search warehouses"
                        style={{ marginRight: "5px" }}
                        readOnly
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => toggleWarehouseSearch(idx)}
                        title="Search Warehouses"
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                    {isWarehouseSearchVisible && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 9,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                      >
                        <InputGroup size="sm">
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                          </InputGroup.Text>
                          <FormControl
                            placeholder="Search warehouses..."
                            value={warehouseSearchTerms[warehouseRowKey] || ""}
                            onChange={(e) =>
                              handleWarehouseSearchChange(idx, e.target.value)
                            }
                            autoFocus
                          />
                        </InputGroup>
                        {loadingWarehouses ? (
                          <div style={{ padding: "8px", textAlign: "center", color: "#666" }}>
                            Loading warehouses...
                          </div>
                        ) : filteredWarehouses.length > 0 ? (
                          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                            {filteredWarehouses.map((wh) => (
                              <div
                                key={wh.warehouse_id || wh.warehouse_name}
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #eee",
                                }}
                                onClick={() =>
                                  handleSelectSearchedWarehouse(idx, wh)
                                }
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor = "#f0f0f0")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor = "white")
                                }
                              >
                                <div><strong>{wh.warehouse_name}</strong></div>
                                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                                  {wh.stock_qty !== null ? `Stock: ${wh.stock_qty}` : wh.location || "General Warehouse"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: "8px", textAlign: "center", color: "#666" }}>
                            No warehouses found
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
                      onChange={(e) =>
                        handleItemChange(idx, "qty", e.target.value)
                      }
                      placeholder="Qty"
                    />
                  </td>
                  {tab === "deliveryChallan" && (
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.deliveredQty}
                        onChange={(e) =>
                          handleItemChange(idx, "deliveredQty", e.target.value)
                        }
                        placeholder="Delivered Qty"
                      />
                    </td>
                  )}
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(idx, "rate", e.target.value)
                      }
                      placeholder="Rate"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.tax_percent} // Changed from 'tax'
                      onChange={(e) =>
                        handleItemChange(idx, "tax_percent", e.target.value) // Changed from 'tax'
                      }
                      placeholder="Tax %"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(idx, "discount", e.target.value)
                      }
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
                      style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}
                    />
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeItem(idx)}
                    >
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
                onChange={handleSignatureChange}
              />
              {formData.additionalInfo.signature_url && (
                <div className="mt-2">
                  <img
                    src={formData.additionalInfo.signature_url}
                    alt="Signature"
                    style={{
                      width: "100px",
                      height: "50px",
                      objectFit: "contain",
                    }}
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
                onChange={handlePhotoChange}
              />
              {formData.additionalInfo.photo_url && (
                <div className="mt-2">
                  <img
                    src={formData.additionalInfo.photo_url}
                    alt="Photo"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
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
                onChange={handleFileChange}
              />
              {formData.additionalInfo.attachment_url && ( // Simplified for single URL
                <div className="mt-2">
                  <ul className="list-unstyled">
                    <li
                      key="attached_file"
                      className="d-flex justify-content-between align-items-center"
                      style={{
                        maxWidth: "100%",
                        padding: "6px 8px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        marginBottom: "6px",
                        background: "#f8f9fa"
                      }}
                    >
                      <span
                        style={{
                          maxWidth: "80%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formData.additionalInfo.attachment_url.split('/').pop()} {/* Show filename */}
                      </span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeFile("attached_file")}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
      </div>
    );
  };

  const formatCompanyAddress = () => {
    const parts = [
      formData.companyInfo.company_address,
      companyDetails.city,
      companyDetails.state,
      companyDetails.postal_code,
      companyDetails.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Render Sales Workflow Table
  const renderSalesWorkflowTable = () => {
    if (loadingWorkflow) {
      return (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading sales workflow data...</p>
        </div>
      );
    }

    if (salesWorkflow.length === 0) {
      return (
        <div className="text-center p-4">
          <p>No sales workflow data available.</p>
        </div>
      );
    }

    return (
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Document Type</th>
            <th>Document Number</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salesWorkflow.map((workflow, index) => (
            <tr key={index}>
              <td>{workflow.document_type}</td>
              <td>{workflow.document_number}</td>
              <td>{workflow.date}</td>
              <td>{workflow.customer_name}</td>
              <td>
                <span className={`badge ${workflow.status === 'Done' ? 'bg-success' : 'bg-warning'}`}>
                  {workflow.status}
                </span>
              </td>
              <td>
                {workflow.status === 'Pending' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigateToStep(workflow.step_key)}
                  >
                    Continue
                  </Button>
                )}
                {workflow.status === 'Done' && (
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => navigateToStep(workflow.step_key)}
                  >
                    View
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  // --- Tab Components Inline ---
  const renderQuotationTab = () => {
    const stepData = formData.steps.quotation.data;
    return (
      <Form>
        {/* Header: Logo + Company Info + Title */}
        <Row className="mb-4 mt-3">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              {formData.companyInfo.logo_url ? (
                <img
                  src={formData.companyInfo.logo_url}
                  alt="Company Logo"
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input id="logo-upload" type="file" accept="image/*" hidden onChange={(e) => {
                if (e.target.files[0]) {
                  handleChange("companyInfo", "logo_url", e.target.files[0]);
                }
              }} />
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex flex-column gap-1">
              <Form.Control
                type="text"
                value={formData.companyInfo.company_name}
                readOnly
                placeholder="Company Name"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", fontWeight: "bold" }}
              />
              <Form.Control
                type="text"
                value={formatCompanyAddress()}
                onChange={(e) => handleChange("companyInfo", "company_address", e.target.value)}
                placeholder="Company Address, City, State, Pincode......."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="email"
                value={formData.companyInfo.company_email}
                readOnly
                placeholder="Company Email"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.companyInfo.company_phone}
                onChange={(e) => handleChange("companyInfo", "company_phone", e.target.value)}
                placeholder="Phone No........"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </div>
          </Col>
          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">QUOTATION</h2>
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
        {/* Quotation & Customer Info */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={8}>
            <h5>Quotation To</h5>
            <Form.Group className="mb-2 position-relative">
              <div className="position-relative" ref={searchRef}>
                <Form.Control
                  type="text"
                  placeholder="Search Customer..."
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => {
                    setShowCustomerDropdown(true);
                    if (!customerSearchTerm) {
                      setFilteredCustomerList(customerList);
                    }
                  }}
                />
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="position-absolute end-0 top-50 translate-middle-y me-2 text-muted"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowCustomerDropdown(!showCustomerDropdown);
                    if (!showCustomerDropdown && !customerSearchTerm) {
                      setFilteredCustomerList(customerList);
                    }
                  }}
                />
              </div>
              {showCustomerDropdown && filteredCustomerList.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm z-index-10"
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                  {filteredCustomerList.map(customer => (
                    <div
                      key={customer.id}
                      className="p-2 hover:bg-light cursor-pointer"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="fw-bold">{customer.name_english}</div>
                      {customer.company_name && (
                        <div className="text-muted small">{customer.company_name}</div>
                      )}
                      <div className="text-muted small">{customer.email}</div>
                    </div>
                  ))}
                </div>
              )}
              {showCustomerDropdown && filteredCustomerList.length === 0 && (
                <div
                  ref={dropdownRef}
                  className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm z-index-10 p-2 text-muted"
                >
                  No customers found
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                value={formData.shippingDetails.bill_to_address}
                onChange={(e) => handleChange("shippingDetails", "bill_to_address", e.target.value)}
                placeholder="Customer Address"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="email"
                value={formData.shippingDetails.bill_to_email}
                onChange={(e) => handleChange("shippingDetails", "bill_to_email", e.target.value)}
                placeholder="Email"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                value={formData.shippingDetails.bill_to_phone}
                onChange={(e) => handleChange("shippingDetails", "bill_to_phone", e.target.value)}
                placeholder="Phone"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <div className="mt-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate('/add-customer')} // Example navigation
                title="Add Customer"
              >
                Add Customer
              </Button>
            </div>
          </Col>
          <Col md={4} className="d-flex flex-column align-items-start">
            <div className="d-flex flex-column gap-2" style={{ maxWidth: "400px", width: "100%" }}>
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap", flexShrink: 0, marginRight: "8px" }}>
                    Quotation No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={stepData.quotation_no}
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
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0 flex-shrink-0 me-2" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap" }}>
                    Manual QUO No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={stepData.manual_quo_no || ""}
                    onChange={(e) => handleChangeStepData("quotation", "manual_quo_no", e.target.value)}
                    placeholder="e.g. QUO-CUST-001"
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
              <Row className="align-items-center g-2 mb-2">
                <Col md="auto" className="p-0">
                  <Form.Label className="mb-0 flex-shrink-0 me-2" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap" }}>
                    Quotation Date
                  </Form.Label>
                </Col>
                <Col className="p-0">
                  <Form.Control
                    type="date"
                    value={stepData.quotation_date}
                    onChange={(e) => handleChangeStepData("quotation", "quotation_date", e.target.value)}
                    style={{ border: "1px solid #495057", fontSize: "1rem" }}
                  />
                </Col>
              </Row>
              <Row className="align-items-center g-2 mb-2">
                <Col md="auto" className="p-0">
                  <Form.Label className="mb-0 flex-shrink-0 me-2" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap" }}>
                    Valid Till
                  </Form.Label>
                </Col>
                <Col className="p-0">
                  <Form.Control
                    type="date"
                    value={stepData.valid_till}
                    onChange={(e) => handleChangeStepData("quotation", "valid_till", e.target.value)}
                    style={{ border: "1px solid #495057", fontSize: "1rem" }}
                  />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
        {/* Items Table */}
        <Row className="mb-4">
          <Col>{renderItemsTable("quotation")}</Col>
        </Row>
        <hr style={{ width: "100%", height: "4px", backgroundColor: "#28a745", border: "none", marginTop: "5px", marginBottom: "10px" }} />
        {/* Totals */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td className="fw-bold">Sub Total:</td>
                  <td>
                    ${calculateTotalAmount(formData.items).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Tax:</td>
                  <td>
                    ${formData.items.reduce((sum, item) => {
                      const subtotal = (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0);
                      return sum + (subtotal * (parseFloat(item.tax_percent) || 0)) / 100; // Changed from 'tax'
                    }, 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Discount:</td>
                  <td>
                    ${formData.items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Total:</td>
                  <td className="fw-bold">
                    ${calculateTotalWithTaxAndDiscount(formData.items).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <hr style={{ width: "100%", height: "4px", backgroundColor: "#28a745", border: "none", marginTop: "5px", marginBottom: "10px" }} />
        {/* Bank & Notes */}
        <Row className="mb-4">
          <h5>Bank Details</h5>
          <Col md={6} className="p-2 rounded" style={{ border: "1px solid #343a40" }}>
            {['bank_name', 'account_no', 'account_holder', 'ifsc_code'].map(field => (
              <Form.Group key={field} className="mb-2">
                <Form.Control
                  type="text"
                  placeholder={{
                    bank_name: 'Bank Name',
                    account_no: 'Account No.',
                    account_holder: 'Account Holder',
                    ifsc_code: 'IFSC Code',
                  }[field]}
                  value={formData.companyInfo[field] || ""}
                  onChange={(e) => handleChange("companyInfo", field, e.target.value)}
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
              value={formData.companyInfo.notes || ""} // Notes now in companyInfo
              onChange={(e) => handleChange("companyInfo", "notes", e.target.value)}
              style={{ border: "1px solid #343a40" }}
            />
          </Col>
        </Row>
        <hr style={{ width: "100%", height: "4px", backgroundColor: "#28a745", border: "none", marginTop: "5px", marginBottom: "10px" }} />
        {/* Terms & Footer */}
        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.companyInfo.terms}
                onChange={(e) => handleChange("companyInfo", "terms", e.target.value)}
                placeholder="e.g. Payment within 15 days"
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Attachment Fields */}
        {renderAttachmentFields("quotation")}
        <Row className="text-center mb-4">
          <Col>
            <p><strong>Thank you for your business!</strong></p>
            <p className="text-muted">www.yourcompany.com</p>
          </Col>
        </Row>
        {/* Navigation */}
        <div className="d-flex justify-content-between mt-4 border-top pt-3">
          <Button variant="secondary" onClick={handleSkip}>Skip</Button>
          <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
          <Button variant="primary" onClick={handleFinalSubmit}>Submit</Button>
        </div>
      </Form>
    );
  };

  const renderSalesOrderTab = () => {
    const stepData = formData.steps.sales_order.data;
    return (
      <Form>
        {/* Header: Logo + Company Info + Title */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
              onClick={() => document.getElementById('logo-upload-so')?.click()}
            >
              {formData.companyInfo.logo_url ? (
                <img
                  src={formData.companyInfo.logo_url}
                  alt="Company Logo"
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input id="logo-upload-so" type="file" accept="image/*" hidden onChange={(e) => {
                if (e.target.files[0]) handleChange("companyInfo", "logo_url", e.target.files[0]);
              }} />
            </div>
          </Col>
          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">SALES ORDER FORM</h2>
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
                value={formData.companyInfo.company_name}
                onChange={(e) => handleChange("companyInfo", "company_name", e.target.value)}
                placeholder="Your Company Name"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.companyInfo.company_address}
                onChange={(e) => handleChange("companyInfo", "company_address", e.target.value)}
                placeholder="Company Address, City, State, Pincode"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="email"
                value={formData.companyInfo.company_email}
                onChange={(e) => handleChange("companyInfo", "company_email", e.target.value)}
                placeholder="Company Email"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.companyInfo.company_phone}
                onChange={(e) => handleChange("companyInfo", "company_phone", e.target.value)}
                placeholder="Phone No."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
              {/* Sales Order No (Auto or Manual) */}
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
                    SO No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={stepData.SO_no}
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
              {/* Quotation No (Auto from Quotation) */}
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
                    value={stepData.manual_quo_no} // Link field
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
              {/* Manual Quotation Ref (Optional) */}
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
                    Manual Quotation No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={stepData.manual_quo_no || ""} // Link field
                    onChange={(e) => handleChangeStepData("sales_order", "manual_quo_no", e.target.value)}
                    placeholder="e.g. CUST-QTN-001"
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
              {/* Customer No - Not in new schema, kept for UI consistency if needed */}
              {/* <Form.Group>
                <Form.Control
                  type="text"
                  value={formData.steps.sales_order.data.customer_no || ""} // Assuming this might be added later
                  onChange={(e) => handleChangeStepData("sales_order", "customer_no", e.target.value)}
                  placeholder="Customer No."
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right"
                  }}
                />
              </Form.Group> */}
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
        {/* Bill To and Ship To Sections - Updated to use shippingDetails */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={6} className="d-flex flex-column align-items-start">
            <h5>BILL TO</h5>
            <Form.Group className="mb-2 w-100">
              <Form.Label>ATN: Name / Dept</Form.Label>
              <Form.Control
                type="text"
                value={formData.shippingDetails.bill_to_attention_name}
                onChange={(e) => handleChange("shippingDetails", "bill_to_attention_name", e.target.value)}
                placeholder="Attention Name / Department"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Form.Control
                  type="text"
                  value={formData.shippingDetails.bill_to_name}
                  onChange={(e) => handleChange("shippingDetails", "bill_to_name", e.target.value)}
                  placeholder="Company Name"
                  className="form-control-no-border"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.shippingDetails.bill_to_address}
                onChange={(e) => handleChange("shippingDetails", "bill_to_address", e.target.value)}
                placeholder="Company Address"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.shippingDetails.bill_to_phone}
                onChange={(e) => handleChange("shippingDetails", "bill_to_phone", e.target.value)}
                placeholder="Phone"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="email"
                value={formData.shippingDetails.bill_to_email}
                onChange={(e) => handleChange("shippingDetails", "bill_to_email", e.target.value)}
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
                  value={formData.shippingDetails.ship_to_attention_name}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_attention_name", e.target.value)}
                  placeholder="Attention Name / Department"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.shippingDetails.ship_to_name}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_name", e.target.value)}
                  placeholder="Company Name"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.shippingDetails.ship_to_address}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_address", e.target.value)}
                  placeholder="Company Address"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.shippingDetails.ship_to_phone}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_phone", e.target.value)}
                  placeholder="Phone"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  value={formData.shippingDetails.ship_to_email}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_email", e.target.value)}
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
        <div className="mt-4">{renderItemsTable('salesOrder')}</div>
        {/* Totals - Moved to left side */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td className="fw-bold">Sub Total:</td>
                  <td>${calculateTotalAmount(formData.items).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Total:</td>
                  <td className="fw-bold">
                    ${calculateTotalWithTaxAndDiscount(formData.items).toFixed(2)}
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
            value={formData.companyInfo.terms}
            onChange={(e) => handleChange('companyInfo', 'terms', e.target.value)}
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        {/* Attachment Fields */}
        {renderAttachmentFields("salesOrder")}
        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={handleSkip}>Skip</Button>
          <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
          <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
          <Button variant="success" onClick={handleNext}>Next</Button>
        </div>
      </Form>
    );
  };

  const renderDeliveryChallanTab = () => {
    const stepData = formData.steps.delivery_challan.data;
    return (
      <Form>
        {/* Header: Logo + Company Info + Title */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
              onClick={() => document.getElementById('logo-upload-dc')?.click()}
            >
              {formData.companyInfo.logo_url ? (
                <img
                  src={formData.companyInfo.logo_url}
                  alt="Company Logo"
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input id="logo-upload-dc" type="file" accept="image/*" hidden onChange={(e) => {
                if (e.target.files[0]) handleChange("companyInfo", "logo_url", e.target.files[0]);
              }} />
            </div>
          </Col>
          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">DELIVERY CHALLAN</h2>
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
                value={formData.companyInfo.company_name}
                onChange={(e) => handleChange("companyInfo", "company_name", e.target.value)}
                placeholder="Your Company Name"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.companyInfo.company_address}
                onChange={(e) => handleChange("companyInfo", "company_address", e.target.value)}
                placeholder="Company Address, City, State, Pincode"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="email"
                value={formData.companyInfo.company_email}
                onChange={(e) => handleChange("companyInfo", "company_email", e.target.value)}
                placeholder="Company Email"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.companyInfo.company_phone}
                onChange={(e) => handleChange("companyInfo", "company_phone", e.target.value)}
                placeholder="Phone No."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
              {/* Challan No (Auto or Manual) */}
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
                    Challan No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={stepData.challan_no}
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
              {/* Manual Challan No (Optional) */}
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
                    Manual DC No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={stepData.manual_challan_no || ""}
                    onChange={(e) => handleChangeStepData("delivery_challan", "manual_challan_no", e.target.value)}
                    placeholder="e.g. DC-CUST-001"
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
              {/* Sales Order No (Auto) - Not in step data, assuming link via logic */}
              {/* <Form.Group className="mb-0">
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
                    SO No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.steps.sales_order.data.SO_no}
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
              </Form.Group> */}
              {/* Manual Sales Order No (Optional) - Not in schema */}
              {/* <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Manual SO No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.steps.delivery_challan.data.manual_so_ref || ""} // Assuming new field
                    onChange={(e) => handleChangeStepData("delivery_challan", "manual_so_ref", e.target.value)} // Assuming new field
                    placeholder="e.g. SO-CUST-001"
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
              </Form.Group> */}
              {/* Vehicle No - Not in schema, kept for UI if needed */}
              {/* <Form.Group>
                <Form.Control
                  type="text"
                  value={formData.steps.delivery_challan.data.vehicle_no || ""} // Assuming new field
                  onChange={(e) => handleChangeStepData("delivery_challan", "vehicle_no", e.target.value)} // Assuming new field
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
              </Form.Group> */}
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
        {/* Bill To and Ship To Sections - Updated to use shippingDetails */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={6} className="d-flex flex-column align-items-start">
            <h5>BILL TO</h5>
            <Form.Group className="mb-2 w-100">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Form.Control
                  type="text"
                  value={formData.shippingDetails.bill_to_name}
                  onChange={(e) => handleChange("shippingDetails", "bill_to_name", e.target.value)}
                  placeholder="Attention Name / Department"
                  className="form-control-no-border"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.shippingDetails.bill_to_address}
                onChange={(e) => handleChange("shippingDetails", "bill_to_address", e.target.value)}
                placeholder="Company Address"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.shippingDetails.bill_to_phone}
                onChange={(e) => handleChange("shippingDetails", "bill_to_phone", e.target.value)}
                placeholder="Phone"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="email"
                value={formData.shippingDetails.bill_to_email}
                onChange={(e) => handleChange("shippingDetails", "bill_to_email", e.target.value)}
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
                  value={formData.shippingDetails.ship_to_name}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_name", e.target.value)}
                  placeholder="Attention Name / Department"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.shippingDetails.ship_to_address}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_address", e.target.value)}
                  placeholder="Company Address"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.shippingDetails.ship_to_phone}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_phone", e.target.value)}
                  placeholder="Phone"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  value={formData.shippingDetails.ship_to_email}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_email", e.target.value)}
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
                value={stepData.driver_name}
                onChange={(e) => handleChangeStepData("delivery_challan", "driver_name", e.target.value)}
                placeholder="Driver Name"
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Driver Phone</Form.Label>
              <Form.Control
                type="text"
                value={stepData.driver_phone}
                onChange={(e) => handleChangeStepData("delivery_challan", "driver_phone", e.target.value)}
                placeholder="Driver Phone"
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Items Table */}
        <div className="mt-4">{renderItemsTable('deliveryChallan')}</div>
        {/* Totals - Moved to left side */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td className="fw-bold">Sub Total:</td>
                  <td>${calculateTotalAmount(formData.items).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Total:</td>
                  <td className="fw-bold">
                    ${calculateTotalWithTaxAndDiscount(formData.items).toFixed(2)}
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
            value={formData.companyInfo.terms}
            onChange={(e) => handleChange('companyInfo', 'terms', e.target.value)}
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        {/* Attachment Fields */}
        {renderAttachmentFields("deliveryChallan")}
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
    );
  };

  const renderInvoiceTab = () => {
    const stepData = formData.steps.invoice.data;
    return (
      <Form>
        {/* Header: Logo + Company Info + Title */}
        <Row className="mb-4 d-flex justify-content-between align-items-center">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
              onClick={() => document.getElementById('logo-upload-invoice')?.click()}
            >
              {formData.companyInfo.logo_url ? (
                <img
                  src={formData.companyInfo.logo_url}
                  alt="Company Logo"
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input id="logo-upload-invoice" type="file" accept="image/*" hidden onChange={(e) => {
                if (e.target.files[0]) handleChange("companyInfo", "logo_url", e.target.files[0]);
              }} />
            </div>
          </Col>
          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">INVOICE</h2>
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
                value={formData.companyInfo.company_name}
                onChange={(e) => handleChange("companyInfo", "company_name", e.target.value)}
                placeholder="Your Company Name"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.companyInfo.company_address}
                onChange={(e) => handleChange("companyInfo", "company_address", e.target.value)}
                placeholder="Company Address, City, State, Pincode"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="email"
                value={formData.companyInfo.company_email}
                onChange={(e) => handleChange("companyInfo", "company_email", e.target.value)}
                placeholder="Company Email"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.companyInfo.company_phone}
                onChange={(e) => handleChange("companyInfo", "company_phone", e.target.value)}
                placeholder="Phone No."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
              {/* Invoice No (Auto or Manual) */}
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
                    Invoice No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={stepData.invoice_no}
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
              {/* Manual Invoice No (Optional) */}
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
                    Manual Invoice No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={stepData.manual_invoice_no || ""}
                    onChange={(e) => handleChangeStepData("invoice", "manual_invoice_no", e.target.value)}
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
              {/* Challan No (Auto from DC) - Not in schema */}
              {/* <Form.Group className="mb-0">
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
                    Challan No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.steps.delivery_challan.data.challan_no}
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
              </Form.Group> */}
              {/* Manual Challan No (Optional) - Not in schema */}
              {/* <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Manual Challan No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.steps.invoice.data.manual_dc_ref || ""} // Assuming new field
                    onChange={(e) => handleChangeStepData("invoice", "manual_dc_ref", e.target.value)} // Assuming new field
                    placeholder="e.g. DC-CUST-001"
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
              </Form.Group> */}
              {/* Due Date */}
              <Form.Group>
                <Form.Label className="mb-0" style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                  Due Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={stepData.due_date}
                  onChange={(e) => handleChangeStepData("invoice", "due_date", e.target.value)}
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
        {/* Bill To & Customer Info - Updated to use shippingDetails */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={6} className="d-flex flex-column align-items-start">
            <h5>BILL TO</h5>
            <Form.Group className="mb-2 w-100">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Form.Control
                  type="text"
                  value={formData.shippingDetails.bill_to_name}
                  onChange={(e) => handleChange("shippingDetails", "bill_to_name", e.target.value)}
                  placeholder="Customer Name"
                  className="form-control-no-border"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate('/add-customer')} // Example navigation
                  title="Add Customer"
                >
                  Add Customer
                </Button>
              </div>
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.shippingDetails.bill_to_address}
                onChange={(e) => handleChange("shippingDetails", "bill_to_address", e.target.value)}
                placeholder="Customer Address"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="email"
                value={formData.shippingDetails.bill_to_email}
                onChange={(e) => handleChange("shippingDetails", "bill_to_email", e.target.value)}
                placeholder="Email"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.shippingDetails.bill_to_phone}
                onChange={(e) => handleChange("shippingDetails", "bill_to_phone", e.target.value)}
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
                  value={formData.shippingDetails.ship_to_name || ""}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_name", e.target.value)}
                  placeholder="Name"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.shippingDetails.ship_to_address || ""}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_address", e.target.value)}
                  placeholder="Address"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  value={formData.shippingDetails.ship_to_email || ""}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_email", e.target.value)}
                  placeholder="Email"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.shippingDetails.ship_to_phone || ""}
                  onChange={(e) => handleChange("shippingDetails", "ship_to_phone", e.target.value)}
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
        <div className="mt-4">{renderItemsTable('invoice')}</div>
        {/* Totals - Moved to left side */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td className="fw-bold">Sub Total:</td>
                  <td>${calculateTotalAmount(formData.items).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Total Due:</td>
                  <td className="fw-bold">${calculateTotalWithTaxAndDiscount(formData.items).toFixed(2)}</td>
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
            value={formData.companyInfo.terms}
            onChange={(e) => handleChange("companyInfo", "terms", e.target.value)}
            placeholder="e.g. Payment within 15 days. Late fees may apply."
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        {/* Attachment Fields */}
        {renderAttachmentFields("invoice")}
        {/* Footer Note */}
        <Row className="text-center mt-5 mb-4 pt-3">
          <Col>
            <Form.Control
              type="text"
              value={formData.footerNote}
              onChange={(e) => handleChange("footerNote", e.target.value)} // Assuming footerNote is top-level
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
    );
  };

  const renderPaymentTab = () => {
    const stepData = formData.steps.payment.data;
    return (
      <Form>
        {/* Header: Logo + Title */}
        <Row className="mb-4 d-flex justify-content-between align-items-center">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
              onClick={() => document.getElementById('logo-upload-payment')?.click()}
            >
              {formData.companyInfo.logo_url ? (
                <img
                  src={formData.companyInfo.logo_url}
                  alt="Company Logo"
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input id="logo-upload-payment" type="file" accept="image/*" hidden onChange={(e) => {
                if (e.target.files[0]) handleChange("companyInfo", "logo_url", e.target.files[0]);
              }} />
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
                value={formData.companyInfo.company_name}
                onChange={(e) => handleChange("companyInfo", "company_name", e.target.value)}
                placeholder=" Enter Your Company Name. . . . ."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.companyInfo.company_address}
                onChange={(e) => handleChange("companyInfo", "company_address", e.target.value)}
                placeholder="Company Address, City, State, Pincode  . . . "
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="email"
                value={formData.companyInfo.company_email}
                onChange={(e) => handleChange("companyInfo", "company_email", e.target.value)}
                placeholder="Company Email. . . ."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.companyInfo.company_phone}
                onChange={(e) => handleChange("companyInfo", "company_phone", e.target.value)}
                placeholder="Phone No....."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
              {/* Payment No (Auto) */}
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
                    Payment No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={stepData.payment_no}
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
              {/* Manual Payment No (Optional) */}
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
                    Manual Payment No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={stepData.manual_payment_no || ""}
                    onChange={(e) => handleChangeStepData("payment", "manual_payment_no", e.target.value)}
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
              {/* Invoice No (Auto) - Not in step data, assuming link via logic */}
              {/* <Form.Group className="mb-0">
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
                    Invoice No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.steps.invoice.data.invoice_no}
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
              </Form.Group> */}
              {/* Manual Invoice No (Optional) - Not in schema */}
              {/* <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Manual Invoice No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.steps.payment.data.manual_invoice_ref || ""} // Assuming new field
                    onChange={(e) => handleChangeStepData("payment", "manual_invoice_ref", e.target.value)} // Assuming new field
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
              </Form.Group> */}
              {/* Payment Method - Not in schema, kept for UI if needed */}
              {/* <Form.Group>
                <Form.Control
                  type="text"
                  value={formData.steps.payment.data.payment_method || ""} // Assuming new field
                  onChange={(e) => handleChangeStepData("payment", "payment_method", e.target.value)} // Assuming new field
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
              </Form.Group> */}
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
            <h5>RECEIVED FROM</h5>
            <Form.Control
              type="text"
              value={formData.shippingDetails.bill_to_name || ""} // Using bill_to_name as received from
              onChange={(e) => handleChange("shippingDetails", "bill_to_name", e.target.value)}
              placeholder="Enter Customer Name. . . . . ."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
            <Form.Group className="mb-1 w-100">
              <Form.Control
                rows={2}
                value={formData.shippingDetails.bill_to_address || ""}
                onChange={(e) => handleChange("shippingDetails", "bill_to_address", e.target.value)}
                placeholder="Customer Address. . . .  ."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="email"
                value={formData.shippingDetails.bill_to_email || ""}
                onChange={(e) => handleChange("shippingDetails", "bill_to_email", e.target.value)}
                placeholder="Email. . . . . "
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.shippingDetails.bill_to_phone || ""}
                onChange={(e) => handleChange("shippingDetails", "bill_to_phone", e.target.value)}
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
                <Form.Label>Amount Received</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={stepData.amount_received}
                  onChange={(e) => handleChangeStepData("payment", "amount_received", e.target.value)}
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
                  value={formData.total.toFixed(2)} // Use calculated total
                  readOnly
                  className="form-control-no-border text-end"
                  style={{ textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Payment Status</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.steps.payment.status} // Use string status
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    steps: {
                      ...prev.steps,
                      payment: {
                        ...prev.steps.payment,
                        status: e.target.value // Update status string
                      }
                    }
                  }))}
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
                  <td className="fw-bold">Total Invoice:</td>
                  <td>${formData.total.toFixed(2)}</td>
                </tr>
                <tr className="fw-bold">
                  <td>Amount Received:</td>
                  <td>${(parseFloat(stepData.amount_received) || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <td className="fw-bold">Balance:</td>
                  <td className="fw-bold text-danger">
                    ${(formData.total - (parseFloat(stepData.amount_received) || 0)).toFixed(2)}
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
            value={stepData.note}
            onChange={(e) => handleChangeStepData("payment", "note", e.target.value)}
            placeholder="e.g. Payment received via UPI / Cash"
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        {/* Attachment Fields */}
        {renderAttachmentFields("payment")}
        <Row className="text-center mt-5 mb-4 pt-3 border-top">
          <Col>
            <Form.Control
              type="text"
              value={formData.footerNote}
              onChange={(e) => handleChange("footerNote", e.target.value)} // Assuming footerNote is top-level
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
    );
  };

  const renderPDFView = () => {
    const currentStep = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // Convert 'salesOrder' to 'sales_order'
    const stepData = formData.steps[currentStep]?.data || {};
    const currentTab = formData; // Use top-level formData for company, shipping, items, etc.
    const hasItems = tabsWithItems.includes(key) && Array.isArray(currentTab.items);
    const titleMap = {
      quotation: "QUOTATION",
      salesOrder: "SALES ORDER",
      deliveryChallan: "DELIVERY CHALLAN",
      invoice: "INVOICE",
      payment: "PAYMENT RECEIPT",
    };

    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "white",
        }}
      >
        {/* Header: Logo + Title */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              border: "2px dashed #28a745",
              padding: "10px",
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {currentTab.companyInfo.logo_url ? (
              <img
                src={currentTab.companyInfo.logo_url}
                alt="Logo"
                style={{ maxWidth: "100%", maxHeight: "100px" }}
              />
            ) : (
              "Logo"
            )}
          </div>
          <div style={{ textAlign: "center", color: "#28a745" }}>
            <h2>{titleMap[key]}</h2>
          </div>
        </div>
        <hr style={{ border: "2px solid #28a745", margin: "15px 0" }} />
        {/* Company Info */}
        <div style={{ marginBottom: "15px" }}>
          <h4>{currentTab.companyInfo.company_name}</h4>
          <p>{currentTab.companyInfo.company_address}</p>
          <p>
            Email: {currentTab.companyInfo.company_email} | Phone: {currentTab.companyInfo.company_phone}
          </p>
        </div>
        {/* Customer Info - Updated to use shippingDetails */}
        {(currentTab.shippingDetails.bill_to_name || currentTab.shippingDetails.ship_to_name) && (
          <div style={{ marginBottom: "15px" }}>
            <h5>{key === 'invoice' ? 'BILL TO' : 'CUSTOMER'}</h5>
            <p>{currentTab.shippingDetails.bill_to_name}</p>
            <p>{currentTab.shippingDetails.bill_to_address}</p>
            <p>
              Email: {currentTab.shippingDetails.bill_to_email} | Phone: {currentTab.shippingDetails.bill_to_phone}
            </p>
          </div>
        )}
        {/* Ship To */}
        {(currentTab.shippingDetails.ship_to_name || currentTab.shippingDetails.ship_to_address) && (
          <div style={{ marginBottom: "15px" }}>
            <h5>SHIP TO</h5>
            <p>{currentTab.shippingDetails.ship_to_name}</p>
            <p>{currentTab.shippingDetails.ship_to_address}</p>
            <p>
              Email: {currentTab.shippingDetails.ship_to_email} | Phone: {currentTab.shippingDetails.ship_to_phone}
            </p>
          </div>
        )}
        {/* Driver & Vehicle (Delivery Challan) */}
        {key === "deliveryChallan" && (
          <div style={{ marginBottom: "15px" }}>
            <h5>DRIVER DETAILS</h5>
            <p>
              {stepData.driver_name} | {stepData.driver_phone}
            </p>
            <p>
              <strong>Vehicle No.:</strong> {stepData.vehicle_no || "N/A"} {/* Assuming vehicle_no field */}
            </p>
          </div>
        )}
        {/* Document Numbers */}
        <div style={{ marginBottom: "15px" }}>
          <strong>Ref ID:</strong> {stepData.id || "N/A"} | {/* Assuming ID exists in step data */}
          {key === "quotation" && (
            <>
              <strong>Quotation No.:</strong> {stepData.quotation_no} |{" "}
            </>
          )}
          {key === "salesOrder" && (
            <>
              <strong>SO No.:</strong> {stepData.SO_no} |{" "}
            </>
          )}
          {key === "deliveryChallan" && (
            <>
              <strong>Challan No.:</strong> {stepData.challan_no} |{" "}
            </>
          )}
          {key === "invoice" && (
            <>
              <strong>Invoice No.:</strong> {stepData.invoice_no} |{" "}
            </>
          )}
          {key === "payment" && (
            <>
              <strong>Payment No.:</strong> {stepData.payment_no} |{" "}
            </>
          )}
          <strong>Date:</strong>{" "}
          {stepData[`${key === 'salesOrder' ? 'SO' : key}_date`] ||
            new Date().toISOString().split("T")[0]}
          {key === "quotation" && stepData.valid_till && (
            <>
              {" "}
              | <strong>Valid Till:</strong> {stepData.valid_till}
            </>
          )}
          {key === "invoice" && stepData.due_date && (
            <>
              {" "}
              | <strong>Due Date:</strong> {stepData.due_date}
            </>
          )}
        </div>
        {/* Items Table */}
        {hasItems && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
            }}
          >
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Item Name
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Qty
                </th>
                {key === "deliveryChallan" && (
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Delivered Qty
                  </th>
                )}
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Rate
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Tax %
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Discount
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTab.items.map((item, idx) => {
                const qty = key === "deliveryChallan" ? parseInt(item.deliveredQty) || 0 : parseInt(item.qty) || 0;
                const rate = parseFloat(item.rate) || 0;
                const tax_percent = parseFloat(item.tax_percent) || 0; // Changed from 'tax'
                const discount = parseFloat(item.discount) || 0;
                const subtotal = rate * qty;
                const taxAmount = (subtotal * tax_percent) / 100;
                const amount = subtotal + taxAmount - discount;
                return (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {item.item_name || item.description}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {item.qty}
                    </td>
                    {key === "deliveryChallan" && (
                      <td style={{ border: "1px solid #000", padding: "8px" }}>
                        {item.deliveredQty}
                      </td>
                    )}
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      ${rate.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {tax_percent}% {/* Changed from 'tax' */}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      ${discount.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      ${amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={key === "deliveryChallan" ? 6 : 5}
                  style={{
                    textAlign: "right",
                    fontWeight: "bold",
                    border: "1px solid #000",
                    padding: "8px",
                  }}
                >
                  Total:
                </td>
                <td
                  style={{
                    fontWeight: "bold",
                    border: "1px solid #000",
                    padding: "8px",
                  }}
                >
                  $                   {calculateTotalWithTaxAndDiscount(currentTab.items).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
        {/* Payment Details (Payment Tab) */}
        {key === "payment" && (
          <div style={{ marginBottom: "15px" }}>
            <h5>PAYMENT DETAILS</h5>
            <p>
              <strong>Amount Paid:</strong> $               {parseFloat(currentTab.amount || 0).toFixed(2)}
            </p>
            <p>
              <strong>Payment Method:</strong> {stepData.payment_method || "N/A"} {/* Assuming payment_method field */}
            </p>
            <p>
              <strong>Status:</strong> {currentTab.steps.payment.status} {/* Use string status */}
            </p>
          </div>
        )}
        {/* Terms & Conditions */}
        {currentTab.companyInfo.terms && (
          <div style={{ marginBottom: "15px" }}>
            <h5>TERMS & CONDITIONS</h5>
            <p>{currentTab.companyInfo.terms}</p>
          </div>
        )}
        {/* Attachments */}
        <div style={{ marginBottom: "15px" }}>
          {currentTab.additionalInfo.signature_url && (
            <div style={{ marginBottom: "10px" }}>
              <strong>SIGNATURE</strong>
              <br />
              <img
                src={currentTab.additionalInfo.signature_url}
                alt="Signature"
                style={{
                  maxWidth: "150px",
                  maxHeight: "80px",
                  marginTop: "5px",
                }}
              />
            </div>
          )}
          {currentTab.additionalInfo.photo_url && (
            <div style={{ marginBottom: "10px" }}>
              <strong>PHOTO</strong>
              <br />
              <img
                src={currentTab.additionalInfo.photo_url}
                alt="Photo"
                style={{
                  maxWidth: "150px",
                  maxHeight: "150px",
                  objectFit: "cover",
                  marginTop: "5px",
                }}
              />
            </div>
          )}
          {currentTab.additionalInfo.attachment_url && ( // Simplified for single URL
            <div>
              <strong>FILES</strong>
              <ul style={{ listStyle: "none", padding: 0, marginTop: "5px" }}>
                <li>{currentTab.additionalInfo.attachment_url.split('/').pop()}</li> {/* Show filename */}
              </ul>
            </div>
          )}
        </div>
        {/* Footer Note */}
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginTop: "30px",
            fontSize: "1.1em",
          }}
        >
          {currentTab.footerNote || "Thank you for your business!"}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="container-fluid mt-4 px-2" ref={formRef}>
        <h4 className="text-center mb-4">Sales Process</h4>
        
        {/* Sales Workflow Table */}
        <div className="mb-4">
          <h5 className="mb-3">Sales Workflow</h5>
          {renderSalesWorkflowTable()}
        </div>
        
        {/* Top Action Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-2 gap-sm-3 mb-4">
          {/* Print English */}
          <Button
            variant="warning"
            onClick={() => handlePrint("english")}
            className="flex-fill flex-sm-grow-0"
            style={{
              minWidth: "130px",
              fontSize: "0.95rem",
              padding: "6px 10px",
            }}
          >
            Print (English)
          </Button>
          {/* Print Arabic */}
          <Button
            variant="warning"
            onClick={() => handlePrint("arabic")}
            className="flex-fill flex-sm-grow-0"
            style={{
              minWidth: "130px",
              fontSize: "0.95rem",
              padding: "6px 10px",
              backgroundColor: "#d39e00",
              borderColor: "#c49200",
            }}
          >
            طباعة (العربية)
          </Button>
          {/* Print Both */}
          <Button
            variant="warning"
            onClick={() => handlePrint("both")}
            className="flex-fill flex-sm-grow-0"
            style={{
              minWidth: "150px",
              fontSize: "0.95rem",
              padding: "6px 10px",
              backgroundColor: "#c87f0a",
              borderColor: "#b87409",
            }}
          >
            Print Both (EN + AR)
          </Button>
          {/* Send Button */}
          <Button
            variant="info"
            onClick={handleSend}
            className="flex-fill flex-sm-grow-0"
            style={{
              color: "white",
              minWidth: "110px",
              fontSize: "0.95rem",
              padding: "6px 10px",
            }}
          >
            Send
          </Button>
          {/* Download PDF */}
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
          {/* Download Excel */}
          <Button
            variant="primary"
            onClick={handleDownloadExcel}
            className="flex-fill flex-sm-grow-0"
            style={{
              minWidth: "130px",
              fontSize: "0.95rem",
              padding: "6px 10px",
            }}
          >
            Download Excel
          </Button>
        </div>
        <Tabs activeKey={key} onSelect={setKey} className="mb-4" fill>
          <Tab eventKey="quotation" title="Quotation">
            {renderQuotationTab()}
          </Tab>
          <Tab eventKey="salesOrder" title="Sales Order">
            {renderSalesOrderTab()}
          </Tab>
          <Tab eventKey="deliveryChallan" title="Delivery Challan">
            {renderDeliveryChallanTab()}
          </Tab>
          <Tab eventKey="invoice" title="Invoice">
            {renderInvoiceTab()}
          </Tab>
          <Tab eventKey="payment" title="Payment">
            {renderPaymentTab()}
          </Tab>
        </Tabs>
        {/* Hidden PDF View - Only for PDF generation and printing */}
        <div
          style={{
            visibility: "hidden",
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "210mm",
            padding: "15mm",
            boxSizing: "border-box",
          }}
        >
          <div id="pdf-view" ref={pdfRef}>
            {renderPDFView()}
          </div>
        </div>
      </div>
    </>
  );
};

export default MultiStepSalesForm;