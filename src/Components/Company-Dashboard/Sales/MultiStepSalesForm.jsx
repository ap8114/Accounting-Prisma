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
import "./MultiStepSalesForm.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faTrash,
  faEye,
  faEdit,
  faPlus,
  faSearch,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import AddProductModal from "../Inventory/AddProductModal";
import QuotationTab from "./MultiStepSalesForm/QuotationTab";
import SalesOrderTab from "./MultiStepSalesForm/SalesOrderTab";
import DeliveryChallanTab from "./MultiStepSalesForm/DeliveryChallanTab";
import InvoiceTab from "./MultiStepSalesForm/InvoiceTab";
import PaymentTab from "./MultiStepSalesForm/PaymentTab";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

const MultiStepSalesForm = ({ onSubmit, initialData, initialStep }) => {
  const companyId = GetCompanyId();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    serviceDescription: "",
    price: "",
    tax: "",
  });

  // Add state for company details
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Function to fetch company details
  const fetchCompanyDetails = async () => {
    if (!companyId) return;

    setLoadingCompany(true);
    try {
      const response = await axiosInstance.get(`auth/Company`);
      const data = response.data;

      if (data.success) {
        // Find the company with matching ID
        const company = data.data.find((c) => c.id === parseInt(companyId));
        if (company) {
          setCompanyDetails(company);

          // Update form data with company details
          const companyInfo = {
            companyName: company.name || "",
            companyAddress: company.address || "",
            companyEmail: company.email || "",
            companyPhone: company.phone || "",
            companyLogo: company.branding?.company_logo_url || "",
            companyDarkLogo: company.branding?.company_dark_logo_url || "",
            companyIcon: company.branding?.company_icon_url || "",
            companyFavicon: company.branding?.favicon_url || "",
          };

          // Update all tabs with company info
          setFormData((prev) => ({
            quotation: { ...prev.quotation, ...companyInfo },
            salesOrder: { ...prev.salesOrder, ...companyInfo },
            deliveryChallan: { ...prev.deliveryChallan, ...companyInfo },
            invoice: { ...prev.invoice, ...companyInfo },
            payment: { ...prev.payment, ...companyInfo },
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    } finally {
      setLoadingCompany(false);
    }
  };

  // Fetch company details when component mounts or companyId changes
  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const handleServiceInput = (e) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddService = () => {
    if (!serviceForm.name || !serviceForm.price) {
      alert("Service name and price are required!");
      return;
    }

    const serviceItem = {
      name: serviceForm.name,
      qty: 1,
      rate: serviceForm.price,
      tax: serviceForm.tax || 0,
      discount: 0,
      description: serviceForm.serviceDescription,
      warehouse: "",
    };

    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        items: [...prev[key].items, serviceItem],
      },
    }));

    setServiceForm({
      name: "",
      serviceDescription: "",
      price: "",
      tax: "",
    });
    setShowServiceModal(false);
  };
  const [key, setKey] = useState(initialStep || "quotation");
  const tabsWithItems = [
    "quotation",
    "salesOrder",
    "deliveryChallan",
    "invoice",
  ];
  const navigate = useNavigate();
  const formRef = useRef();
  const pdfRef = useRef();

  // --- Form Data State ---
  const [formData, setFormData] = useState(() => ({
    quotation: {
      referenceId: "",
      manualRefNo: "", // Optional manual ref
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      companyLogo: "", // Added company logo
      companyDarkLogo: "", // Added company dark logo
      companyIcon: "", // Added company icon
      companyFavicon: "", // Added company favicon
      quotationNo: "", // Auto-generated Quotation No
      quotationDate: "",
      validDate: "",
      billToName: "",
      billToAddress: "",
      billToEmail: "",
      billToPhone: "",
      items: [
        {
          name: "",
          description: "",
          qty: "",
          rate: "",
          tax: 0,
          discount: 0,
          sellingPrice: 0,
          uom: "PCS",
          warehouse: "",
        },
      ],
      terms: "",
      signature: "",
      photo: "",
      files: [],
      footerNote: "Thank you!",
    },
    salesOrder: {
      referenceId: "",
      salesOrderNo: "", // Auto-generated SO No
      manualOrderRef: "", // Manual SO Ref
      manualQuotationRef: "",
      manualRefNo: "",
      orderDate: "",
      customerName: "",
      customerAddress: "",
      customerEmail: "",
      customerPhone: "",
      customerNo: "",
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      companyLogo: "", // Added company logo
      companyDarkLogo: "", // Added company dark logo
      companyIcon: "", // Added company icon
      companyFavicon: "", // Added company favicon
      billToName: "",
      billToAddress: "",
      billToEmail: "",
      billToPhone: "",
      shipToName: "",
      shipToAddress: "",
      shipToEmail: "",
      shipToPhone: "",
      items: [
        { name: "", qty: "", rate: "", tax: 0, discount: 0, warehouse: "" },
      ],
      terms: "",
      signature: "",
      photo: "",
      files: [],
      footerNote: "Thank you!",
      // 👉 Quotation No (Auto + Manual)
      quotationNo: "", // Auto-generated QUO No
      manualQuotationRef: "", // Manual QUO Ref
    },
    deliveryChallan: {
      referenceId: "",
      challanNo: "", // Auto-generated DC No
      manualRefNo: "", // Manual DC Ref
      challanDate: "",
      vehicleNo: "",
      driverName: "",
      driverPhone: "",
      salesOrderNo: "", // Auto-generated SO No
      manualSalesOrderRef: "", // Manual SO Ref
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      companyLogo: "", // Added company logo
      companyDarkLogo: "", // Added company dark logo
      companyIcon: "", // Added company icon
      companyFavicon: "", // Added company favicon
      billToName: "",
      billToAddress: "",
      billToEmail: "",
      billToPhone: "",
      shipToName: "",
      shipToAddress: "",
      shipToEmail: "",
      shipToPhone: "",
      items: [
        {
          name: "",
          qty: "",
          deliveredQty: "",
          rate: "",
          tax: 0,
          discount: 0,
          warehouse: "",
        },
      ],
      terms: "",
      signature: "",
      photo: "",
      files: [],
      footerNote: "Thank you!",
    },
    invoice: {
      referenceId: "",
      invoiceNo: "", // Auto-generated INV No
      manualRefNo: "", // Manual INV Ref
      invoiceDate: "",
      dueDate: "",
      challanNo: "", // Auto-generated DC No
      manualChallanRef: "", // Manual DC Ref
      manualChallanNo: "",
      manualInvoiceNo: "",
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      companyLogo: "", // Added company logo
      companyDarkLogo: "", // Added company dark logo
      companyIcon: "", // Added company icon
      companyFavicon: "", // Added company favicon
      customerName: "",
      customerAddress: "",
      customerEmail: "",
      customerPhone: "",
      shipToName: "",
      shipToAddress: "",
      shipToEmail: "",
      shipToPhone: "",
      items: [
        {
          description: "",
          rate: "",
          qty: "",
          tax: "",
          discount: "",
          amount: "",
          warehouse: "",
        },
      ],
      paymentStatus: "",
      paymentMethod: "",
      note: "",
      terms: "",
      signature: "",
      photo: "",
      files: [],
      footerNote: "Thank you!",
    },
    payment: {
      referenceId: "",
      paymentNo: "", // Auto-generated PAY No
      manualRefNo: "", // Manual PAY Ref
      paymentDate: "",
      amount: "",
      paymentMethod: "",
      paymentStatus: "",
      note: "",
      invoiceNo: "", // Auto-generated INV No
      manualInvoiceRef: "", // Manual INV Ref
      customerName: "",
      customerAddress: "",
      customerEmail: "",
      customerPhone: "",
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      companyLogo: "", // Added company logo
      companyDarkLogo: "", // Added company dark logo
      companyIcon: "", // Added company icon
      companyFavicon: "", // Added company favicon
      signature: "",
      photo: "",
      files: [],
      footerNote: "Thank you!",
    },
  }));

  // Available items for search
  const [availableItems, setAvailableItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Fetch products from API using Axios
  const fetchProducts = async () => {
    if (!companyId) return;

    setLoadingItems(true);
    try {
      const response = await axiosInstance.get(`products/company/${companyId}`);
      const data = response.data;

      if (data.success) {
        const formattedItems = data.data.map((product) => ({
          id: product.id,
          name: product.item_name,
          category: product.item_category?.item_category_name || "",
          price: parseFloat(product.sale_price) || 0,
          tax: parseFloat(product.tax_account) || 0,
          hsn: product.hsn || "",
          uom: product.unit_detail?.uom_id || "PCS",
          description: product.description || "",
          sku: product.sku || "",
          barcode: product.barcode || "",
          warehouses: product.warehouses || [], // This is crucial
        }));
        setAvailableItems(formattedItems);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  // Fetch warehouses from API using Axios
  const [warehouses, setWarehouses] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const fetchWarehouses = async () => {
    if (!companyId) return;

    setLoadingWarehouses(true);
    try {
      const response = await axiosInstance.get(
        `warehouses/company/${companyId}`
      );
      const data = response.data;

      if (data.success) {
        setWarehouses(data.data);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  // Fetch products and warehouses when component mounts or companyId changes
  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, [companyId]);

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
  // Search state for each row's warehouse
  const [warehouseSearchTerms, setWarehouseSearchTerms] = useState({});
  const [showWarehouseSearch, setShowWarehouseSearch] = useState({});

  const [savedRecords, setSavedRecords] = useState([]);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    hsn: "",
    tax: 0,
    sellingPrice: 0,
    uom: "PCS",
  });

  const generateReferenceId = (tabKey) => {
    const prefixes = {
      quotation: "QUO",
      salesOrder: "SO",
      deliveryChallan: "DC",
      invoice: "INV",
      payment: "PAY",
    };
    const prefix = prefixes[tabKey] || "REF";
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${rand}`;
  };

  useEffect(() => {
    // ============= QUOTATION =============
    if (!formData.quotation.referenceId) {
      handleChange(
        "quotation",
        "referenceId",
        generateReferenceId("quotation")
      );
    }

    if (!formData.quotation.quotationNo) {
      if (formData.quotation.manualQuotationRef) {
        handleChange(
          "quotation",
          "quotationNo",
          formData.quotation.manualQuotationRef
        );
      } else {
        handleChange(
          "quotation",
          "quotationNo",
          generateReferenceId("quotation")
        );
      }
    }

    // If manual is updated, sync it
    if (
      formData.quotation.manualQuotationRef &&
      formData.quotation.manualQuotationRef !== formData.quotation.quotationNo
    ) {
      handleChange(
        "quotation",
        "quotationNo",
        formData.quotation.manualQuotationRef
      );
    }

    // ============= SALES ORDER =============
    if (!formData.salesOrder.referenceId) {
      handleChange(
        "salesOrder",
        "referenceId",
        generateReferenceId("salesOrder")
      );
    }

    if (!formData.salesOrder.salesOrderNo) {
      if (formData.salesOrder.manualOrderRef) {
        handleChange(
          "salesOrder",
          "salesOrderNo",
          formData.salesOrder.manualOrderRef
        );
      } else {
        handleChange(
          "salesOrder",
          "salesOrderNo",
          generateReferenceId("salesOrder")
        );
      }
    }

    if (
      formData.salesOrder.manualOrderRef &&
      formData.salesOrder.manualOrderRef !== formData.salesOrder.salesOrderNo
    ) {
      handleChange(
        "salesOrder",
        "salesOrderNo",
        formData.salesOrder.manualOrderRef
      );
    }

    // Auto-fill quotationNo from Quotation
    if (!formData.salesOrder.quotationNo && formData.quotation.quotationNo) {
      handleChange("salesOrder", "quotationNo", formData.quotation.quotationNo);
    }

    // ============= DELIVERY CHALLAN =============
    if (!formData.deliveryChallan.referenceId) {
      handleChange(
        "deliveryChallan",
        "referenceId",
        generateReferenceId("deliveryChallan")
      );
    }

    if (!formData.deliveryChallan.challanNo) {
      if (formData.deliveryChallan.manualRefNo) {
        handleChange(
          "deliveryChallan",
          "challanNo",
          formData.deliveryChallan.manualRefNo
        );
      } else {
        handleChange(
          "deliveryChallan",
          "challanNo",
          generateReferenceId("deliveryChallan")
        );
      }
    }

    if (
      formData.deliveryChallan.manualRefNo &&
      formData.deliveryChallan.manualRefNo !==
        formData.deliveryChallan.challanNo
    ) {
      handleChange(
        "deliveryChallan",
        "challanNo",
        formData.deliveryChallan.manualRefNo
      );
    }

    // Auto-fill salesOrderNo
    if (
      !formData.deliveryChallan.salesOrderNo &&
      formData.salesOrder.salesOrderNo
    ) {
      handleChange(
        "deliveryChallan",
        "salesOrderNo",
        formData.salesOrder.salesOrderNo
      );
    }

    // ============= INVOICE =============
    if (!formData.invoice.referenceId) {
      handleChange("invoice", "referenceId", generateReferenceId("invoice"));
    }

    if (!formData.invoice.invoiceNo) {
      if (formData.invoice.manualRefNo) {
        handleChange("invoice", "invoiceNo", formData.invoice.manualRefNo);
      } else {
        handleChange("invoice", "invoiceNo", generateReferenceId("invoice"));
      }
    }

    if (
      formData.invoice.manualRefNo &&
      formData.invoice.manualRefNo !== formData.invoice.invoiceNo
    ) {
      handleChange("invoice", "invoiceNo", formData.invoice.manualRefNo);
    }

    // Auto-fill challanNo
    if (!formData.invoice.challanNo && formData.deliveryChallan.challanNo) {
      handleChange("invoice", "challanNo", formData.deliveryChallan.challanNo);
    }

    // ============= PAYMENT =============
    if (!formData.payment.referenceId) {
      handleChange("payment", "referenceId", generateReferenceId("payment"));
    }

    if (!formData.payment.paymentNo) {
      if (formData.payment.manualRefNo) {
        handleChange("payment", "paymentNo", formData.payment.manualRefNo);
      } else {
        handleChange("payment", "paymentNo", generateReferenceId("payment"));
      }
    }

    if (
      formData.payment.manualRefNo &&
      formData.payment.manualRefNo !== formData.payment.paymentNo
    ) {
      handleChange("payment", "paymentNo", formData.payment.manualRefNo);
    }

    // Auto-fill invoiceNo
    if (!formData.payment.invoiceNo && formData.invoice.invoiceNo) {
      handleChange("payment", "invoiceNo", formData.invoice.invoiceNo);
    }
    // Use manualInvoiceNo if provided
    if (
      formData.invoice.manualInvoiceNo &&
      formData.invoice.manualInvoiceNo !== formData.invoice.invoiceNo
    ) {
      handleChange("invoice", "invoiceNo", formData.invoice.manualInvoiceNo);
    }
    // In useEffect
    if (!formData.salesOrder.quotationNo && formData.quotation.quotationNo) {
      handleChange("salesOrder", "quotationNo", formData.quotation.quotationNo);
    }

    // Optional: if manualQuotationRef is filled, use that instead
    if (
      formData.salesOrder.manualQuotationRef &&
      formData.salesOrder.manualQuotationRef !== formData.salesOrder.quotationNo
    ) {
      handleChange(
        "salesOrder",
        "quotationNo",
        formData.salesOrder.manualQuotationRef
      );
    }
    // Use manualChallanNo if provided
    if (
      formData.invoice.manualChallanNo &&
      formData.invoice.manualChallanNo !== formData.invoice.challanNo
    ) {
      handleChange("invoice", "challanNo", formData.invoice.manualChallanNo);
    }
  }, [
    // Dependencies: Track all auto/manual fields
    formData.quotation.referenceId,
    formData.quotation.quotationNo,
    formData.quotation.manualQuotationRef,

    formData.salesOrder.referenceId,
    formData.salesOrder.salesOrderNo,
    formData.salesOrder.manualOrderRef,
    formData.salesOrder.quotationNo,

    formData.deliveryChallan.referenceId,
    formData.deliveryChallan.challanNo,
    formData.deliveryChallan.manualRefNo,
    formData.deliveryChallan.salesOrderNo,

    formData.invoice.referenceId,
    formData.invoice.invoiceNo,
    formData.invoice.manualRefNo,
    formData.invoice.challanNo,

    formData.payment.referenceId,
    formData.payment.paymentNo,
    formData.payment.manualRefNo,
    formData.payment.invoiceNo,
    formData.invoice.manualInvoiceNo,
    formData.invoice.manualChallanNo,
    formData.invoice.invoiceNo,
    formData.invoice.challanNo,
  ]);

  // --- Handlers ---
  const handleChange = (tab, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  };

  const handleItemChange = (tab, index, field, value) => {
    const updatedItems = [...formData[tab].items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
  };

  const handleProductChange = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = (tab) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: [
          ...prev[tab].items,
          { name: "", qty: "", rate: "", tax: 0, discount: 0, warehouse: "" },
        ],
      },
    }));
  };

  const removeItem = (tab, index) => {
    const updatedItems = [...formData[tab].items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
  };

  const handleRowSearchChange = (tab, index, value) => {
    setRowSearchTerms((prev) => ({
      ...prev,
      [`${tab}-${index}`]: value,
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
      uom: item.uom,
      description: item.description || "",
      sku: item.sku || "",
      barcode: item.barcode || "",
      warehouses: item.warehouses || [], // IMPORTANT: Save warehouse info with the item
    };

    // Auto-select the first available warehouse if any exist
    if (item.warehouses && item.warehouses.length > 0) {
      updatedItems[index].warehouse = item.warehouses[0].warehouse_name;
    } else {
      updatedItems[index].warehouse = ""; // Clear if no warehouses
    }

    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));

    // Hide search for this row
    setShowRowSearch((prev) => ({
      ...prev,
      [`${tab}-${index}`]: false,
    }));

    // Clear search term
    setRowSearchTerms((prev) => ({
      ...prev,
      [`${tab}-${index}`]: "",
    }));
  };

  const toggleRowSearch = (tab, index) => {
    const rowKey = `${tab}-${index}`;
    setShowRowSearch((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  // --- Warehouse Search Handlers ---
  const handleWarehouseSearchChange = (tab, index, value) => {
    setWarehouseSearchTerms((prev) => ({
      ...prev,
      [`${tab}-${index}`]: value,
    }));
  };

  const handleSelectSearchedWarehouse = (tab, index, warehouse) => {
    handleItemChange(tab, index, "warehouse", warehouse.warehouse_name);

    // Hide search for this row's warehouse
    setShowWarehouseSearch((prev) => ({
      ...prev,
      [`${tab}-${index}`]: false,
    }));

    // Clear search term
    setWarehouseSearchTerms((prev) => ({
      ...prev,
      [`${tab}-${index}`]: "",
    }));
  };

  const toggleWarehouseSearch = (tab, index) => {
    const rowKey = `${tab}-${index}`;
    setShowWarehouseSearch((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

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

    // Mock Arabic translation
    const getArabicText = (text) => {
      const translations = {
        "PURCHASE QUOTATION": "عرض شراء",
        "PURCHASE ORDER": "طلب شراء",
        "GOODS RECEIPT NOTE": "مذكرة استلام البضاعة",
        "PURCHASE BILL": "فاتورة شراء",
        "PAYMENT RECEIPT": "إيصال الدفع",
        "Company Name": "اسم الشركة",
        Vendor: "المورد",
        "Quotation No.": "رقم العرض",
        "Order No.": "رقم الطلب",
        "Receipt No.": "رقم الإيصال",
        "Bill No.": "رقم الفاتورة",
        "Payment No.": "رقم الدفعة",
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
      };
      return translations[text] || text;
    };

    // Clone the content for modification
    const clone = printContent.cloneNode(true);
    const elements = clone.querySelectorAll("*");

    if (lang === "arabic" || lang === "both") {
      clone.style.direction = "rtl";
      clone.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
      elements.forEach((el) => {
        el.style.textAlign = "right";
      });
    }

    // Bilingual mode: add Arabic below English
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
    window.location.href = `mailto:?subject=Sales Quotation&body=Please find the quotation details attached.`;
  };

  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `${key}-${
          formData[key].quotationNo || formData[key].invoiceNo || "document"
        }.pdf`,
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        html2canvas: { scale: 3 },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .save();
  };

  useEffect(() => {
    const saved = localStorage.getItem("purchaseFormRecords");
    if (saved) setSavedRecords(JSON.parse(saved));
  }, []);

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(formData.quotation.items);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quotation");
    XLSX.writeFile(
      workbook,
      `quotation-${formData.quotation.quotationNo || "draft"}.xlsx`
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

  const handleSaveDraft = () => onSubmit(formData, key);

  const handleSaveNext = () => {
    handleSaveDraft();

    setKey((prev) => {
      if (prev === "quotation") {
        setFormData((prevData) => ({
          ...prevData,
          salesOrder: {
            ...prevData.salesOrder,
            quotationNo: prevData.quotation.quotationNo,
            orderDate: prevData.quotation.quotationDate,
            customerName: prevData.quotation.billToName,
            customerAddress: prevData.quotation.billToAddress,
            customerEmail: prevData.quotation.billToEmail,
            customerPhone: prevData.quotation.billToPhone,
            companyName: prevData.quotation.companyName,
            companyAddress: prevData.quotation.companyAddress,
            companyEmail: prevData.quotation.companyEmail,
            companyPhone: prevData.quotation.companyPhone,
            companyLogo: prevData.quotation.companyLogo,
            companyDarkLogo: prevData.quotation.companyDarkLogo,
            companyIcon: prevData.quotation.companyIcon,
            companyFavicon: prevData.quotation.companyFavicon,
            items: prevData.quotation.items.map((item) => ({
              name: item.name,
              qty: item.qty,
              rate: item.rate,
              warehouse: item.warehouse || "",
              warehouses: item.warehouses || [], // Preserve warehouses
            })),
          },
        }));
        return "salesOrder";
      }

      if (prev === "salesOrder") {
        setFormData((prevData) => ({
          ...prevData,
          deliveryChallan: {
            ...prevData.deliveryChallan,
            salesOrderNo: prevData.salesOrder.orderNo,
            challanDate: new Date().toISOString().split("T")[0],
            companyName: prevData.salesOrder.companyName,
            companyAddress: prevData.salesOrder.companyAddress,
            companyEmail: prevData.salesOrder.companyEmail,
            companyPhone: prevData.salesOrder.companyPhone,
            companyLogo: prevData.salesOrder.companyLogo,
            companyDarkLogo: prevData.salesOrder.companyDarkLogo,
            companyIcon: prevData.salesOrder.companyIcon,
            companyFavicon: prevData.salesOrder.companyFavicon,
            billToName: prevData.salesOrder.customerName,
            billToAddress: prevData.salesOrder.customerAddress,
            billToEmail: prevData.salesOrder.customerEmail,
            billToPhone: prevData.salesOrder.customerPhone,
            shipToName: prevData.salesOrder.shipToCompanyName,
            shipToAddress: prevData.salesOrder.shipToAddress,
            shipToEmail: prevData.salesOrder.shipToEmail,
            shipToPhone: prevData.salesOrder.shipToPhone,
            items: prevData.salesOrder.items.map((item) => ({
              name: item.name,
              qty: item.qty,
              deliveredQty: item.qty,
              rate: item.rate,
              warehouse: item.warehouse || "",
              warehouses: item.warehouses || [], // Preserve warehouses
            })),
          },
        }));
        return "deliveryChallan";
      }

      if (prev === "deliveryChallan") {
        setFormData((prevData) => ({
          ...prevData,
          invoice: {
            ...prevData.invoice,
            orderNo: prevData.salesOrder.orderNo,
            invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
            invoiceDate: new Date().toISOString().split("T")[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            customerName: prevData.deliveryChallan.billToName,
            customerAddress: prevData.deliveryChallan.billToAddress,
            customerEmail: prevData.deliveryChallan.billToEmail,
            customerPhone: prevData.deliveryChallan.billToPhone,
            companyName: prevData.deliveryChallan.companyName,
            companyAddress: prevData.deliveryChallan.companyAddress,
            companyEmail: prevData.deliveryChallan.companyEmail,
            companyPhone: prevData.deliveryChallan.companyPhone,
            companyLogo: prevData.deliveryChallan.companyLogo,
            companyDarkLogo: prevData.deliveryChallan.companyDarkLogo,
            companyIcon: prevData.deliveryChallan.companyIcon,
            companyFavicon: prevData.deliveryChallan.companyFavicon,
            items: prevData.deliveryChallan.items.map((item) => ({
              description: item.name,
              qty: item.deliveredQty,
              rate: item.rate,
              tax: 0,
              discount: 0,
              amount: item.rate * item.deliveredQty,
              warehouse: item.warehouse || "",
              warehouses: item.warehouses || [], // Preserve warehouses
            })),
          },
        }));
        return "invoice";
      }

      if (prev === "invoice") {
        setFormData((prevData) => ({
          ...prevData,
          payment: {
            ...prevData.payment,
            invoiceNo: prevData.invoice.invoiceNo,
            paymentDate: new Date().toISOString().split("T")[0],
            totalAmount: calculateTotalAmount(prevData.invoice.items).toFixed(
              2
            ),
            amount: "",
            customerName: prevData.invoice.customerName,
            customerAddress: prevData.invoice.customerAddress,
            customerEmail: prevData.invoice.customerEmail,
            customerPhone: prevData.invoice.customerPhone,
            companyName: prevData.invoice.companyName,
            companyAddress: prevData.invoice.companyAddress,
            companyEmail: prevData.invoice.companyEmail,
            companyPhone: prevData.invoice.companyPhone,
            companyLogo: prevData.invoice.companyLogo,
            companyDarkLogo: prevData.invoice.companyDarkLogo,
            companyIcon: prevData.invoice.companyIcon,
            companyFavicon: prevData.invoice.companyFavicon,
          },
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

  const handleFinalSubmit = () => {
    const newRecord = {
      id: currentRecordId || Date.now(),
      data: formData,
      createdAt: new Date().toLocaleString(),
    };

    if (currentRecordId) {
      setSavedRecords((prev) => {
        const updated = prev.map((r) =>
          r.id === currentRecordId ? newRecord : r
        );
        localStorage.setItem("purchaseFormRecords", JSON.stringify(updated));
        return updated;
      });
    } else {
      const updatedRecords = [...savedRecords, newRecord];
      setSavedRecords(updatedRecords);
      localStorage.setItem(
        "purchaseFormRecords",
        JSON.stringify(updatedRecords)
      );
    }

    setCurrentRecordId(null);
    alert("Form submitted!");
  };

  const handleEditRecord = (id) => {
    const record = savedRecords.find((r) => r.id === id);
    if (record) {
      setFormData(record.data);
      setCurrentRecordId(id);

      if (record.data.payment?.invoiceNo) {
        setKey("payment");
      } else if (record.data.invoice?.invoiceNo) {
        setKey("invoice");
      } else if (record.data.deliveryChallan?.challanNo) {
        setKey("deliveryChallan");
      } else if (record.data.salesOrder?.orderNo) {
        setKey("salesOrder");
      } else {
        setKey("quotation");
      }
    }
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setSavedRecords((prev) => prev.filter((r) => r.id !== id));
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
        handleChange(tab, "signature", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (tab, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(tab, "photo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (tab, e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: reader.result,
        });

        if (newFiles.length === files.length) {
          handleChange(tab, "files", [...formData[tab].files, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (tab, index) => {
    const updatedFiles = [...formData[tab].files];
    updatedFiles.splice(index, 1);
    handleChange(tab, "files", updatedFiles);
  };

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
      uom: newItem.uom,
      warehouse: "",
    };

    const tab = key;
    setFormData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: [...prev[tab].items, itemToAdd],
      },
    }));

    setNewItem({
      name: "",
      category: "",
      hsn: "",
      tax: 0,
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
      setCategories((prev) => [...prev, newCategory]);
      setNewItem((prev) => ({ ...prev, category: newCategory }));
      setNewCategory("");
    }
    setShowAddCategoryModal(false);
  };

  const renderItemsTable = (tab) => {
    const items = formData[tab]?.items || [];

    const handleItemChange = (index, field, value) => {
      const updatedItems = [...items];
      updatedItems[index][field] = value;
      setFormData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], items: updatedItems },
      }));
    };

    const addItem = () => {
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...items,
            { name: "", qty: "", rate: "", tax: 0, discount: 0, warehouse: "" },
          ],
        },
      }));
    };

    const removeItem = (idx) => {
      const updatedItems = items.filter((_, index) => index !== idx);
      setFormData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], items: updatedItems },
      }));
    };

    // Filter items based on search term for each row
    const getFilteredItems = (index) => {
      const searchTerm = rowSearchTerms[`${tab}-${index}`] || "";
      if (!searchTerm) return availableItems;

      return availableItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.sku &&
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.barcode &&
            item.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    };

    // Get warehouses to display in the dropdown for a specific row
    const getWarehousesForDropdown = (item) => {
      // If an item is selected and has warehouse data, use that
      if (item.name && item.warehouses && item.warehouses.length > 0) {
        return item.warehouses;
      }
      // Otherwise, return all company warehouses (fallback)
      return warehouses.map((wh) => ({ ...wh, stock_qty: null })); // Add null stock for fallback
    };

    // Filter warehouses based on search term for each row
    const getFilteredWarehouses = (index) => {
      const item = items[index];
      const searchTerm = warehouseSearchTerms[`${tab}-${index}`] || "";
      const warehousesToFilter = getWarehousesForDropdown(item);

      if (!searchTerm) return warehousesToFilter;

      return warehousesToFilter.filter(
        (wh) =>
          wh.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (wh.location &&
            wh.location.toLowerCase().includes(searchTerm.toLowerCase()))
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

        {/* Service Modal */}
        <Modal
          show={showServiceModal}
          onHide={() => setShowServiceModal(false)}
          centered
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>Add Service</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Service Name</Form.Label>
                <Form.Control
                  name="name"
                  onChange={(e) => handleServiceInput(e)}
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
                  onChange={(e) => handleServiceInput(e)}
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
                  onChange={(e) => handleServiceInput(e)}
                  placeholder="Enter service price"
                  className="shadow-sm"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tax %</Form.Label>
                <Form.Control
                  type="number"
                  name="tax"
                  onChange={(e) => handleServiceInput(e)}
                  className="shadow-sm"
                  placeholder="e.g. 18"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowServiceModal(false)}
            >
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
              const qty =
                tab === "deliveryChallan"
                  ? parseInt(item.deliveredQty) || 0
                  : parseInt(item.qty) || 0;
              const amount = (parseFloat(item.rate) || 0) * qty;
              const itemRowKey = `${tab}-${idx}`;
              const filteredItems = getFilteredItems(idx);
              const isItemSearchVisible = showRowSearch[itemRowKey];

              const warehouseRowKey = `${tab}-${idx}`;
              const filteredWarehouses = getFilteredWarehouses(idx);
              const isWarehouseSearchVisible =
                showWarehouseSearch[warehouseRowKey];

              return (
                <tr key={idx}>
                  {/* Item Name Cell with Search */}
                  <td style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.name}
                        onChange={(e) => {
                          handleItemChange(idx, "name", e.target.value);
                          handleRowSearchChange(tab, idx, e.target.value);
                        }}
                        onFocus={() => toggleRowSearch(tab, idx)}
                        placeholder="Click to search products"
                        style={{ marginRight: "5px" }}
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
                              handleRowSearchChange(tab, idx, e.target.value)
                            }
                            autoFocus
                          />
                        </InputGroup>
                        {loadingItems ? (
                          <div
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            Loading products...
                          </div>
                        ) : filteredItems.length > 0 ? (
                          <div
                            style={{ maxHeight: "200px", overflowY: "auto" }}
                          >
                            {filteredItems.map((filteredItem) => (
                              <div
                                key={filteredItem.id}
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #eee",
                                }}
                                onClick={() =>
                                  handleSelectSearchedItem(
                                    tab,
                                    idx,
                                    filteredItem
                                  )
                                }
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f0f0f0")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "white")
                                }
                              >
                                <div>
                                  <strong>{filteredItem.name}</strong>
                                </div>
                                <div
                                  style={{ fontSize: "0.8rem", color: "#666" }}
                                >
                                  {filteredItem.category} - $
                                  {filteredItem.price.toFixed(2)}
                                  {filteredItem.sku && (
                                    <span> | SKU: {filteredItem.sku}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
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
                        value={item.warehouse || ""}
                        onChange={(e) =>
                          handleWarehouseSearchChange(tab, idx, e.target.value)
                        }
                        onFocus={() => toggleWarehouseSearch(tab, idx)}
                        placeholder="Click to search warehouses"
                        style={{ marginRight: "5px" }}
                        readOnly
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => toggleWarehouseSearch(tab, idx)}
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
                              handleWarehouseSearchChange(
                                tab,
                                idx,
                                e.target.value
                              )
                            }
                            autoFocus
                          />
                        </InputGroup>
                        {loadingWarehouses ? (
                          <div
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            Loading warehouses...
                          </div>
                        ) : filteredWarehouses.length > 0 ? (
                          <div
                            style={{ maxHeight: "200px", overflowY: "auto" }}
                          >
                            {filteredWarehouses.map((wh) => (
                              <div
                                key={wh.warehouse_id || wh.warehouse_name} // Use name as fallback if id is not there
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #eee",
                                }}
                                onClick={() =>
                                  handleSelectSearchedWarehouse(tab, idx, wh)
                                }
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f0f0f0")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "white")
                                }
                              >
                                <div>
                                  <strong>{wh.warehouse_name}</strong>
                                </div>
                                <div
                                  style={{ fontSize: "0.8rem", color: "#666" }}
                                >
                                  {wh.stock_qty !== null
                                    ? `Stock: ${wh.stock_qty}`
                                    : wh.location || "General Warehouse"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
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
                      value={item.tax}
                      onChange={(e) =>
                        handleItemChange(idx, "tax", e.target.value)
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

  const renderPDFView = () => {
    const currentTab = formData[key];
    const hasItems =
      tabsWithItems.includes(key) && Array.isArray(currentTab.items);

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
            {currentTab.company_logo_url ? (
              <img
                src={currentTab.company_logo_url}
                alt="Logo"
                style={{ maxWidth: "100%", maxHeight: "100px" }}
              />
            ) : (
              "Logo"
            )}
          </div>
          <div style={{ textAlign: "center", color: "#28a745" }}>
            <h2>
              {key === "quotation" && "SALES QUOTATION"}
              {key === "salesOrder" && "SALES ORDER"}
              {key === "deliveryChallan" && "DELIVERY CHALLAN"}
              {key === "invoice" && "INVOICE"}
              {key === "payment" && "PAYMENT RECEIPT"}
            </h2>
          </div>
        </div>
        <hr style={{ border: "2px solid #28a745", margin: "15px 0" }} />

        {/* Company Info */}
        <div style={{ marginBottom: "15px" }}>
          <h4>{currentTab.companyName}</h4>
          <p>{currentTab.companyAddress}</p>
          <p>
            Email: {currentTab.companyEmail} | Phone: {currentTab.companyPhone}
          </p>
        </div>

        {/* Customer Info */}
        {currentTab.billToName && (
          <div style={{ marginBottom: "15px" }}>
            <h5>BILL TO</h5>
            <p>{currentTab.billToName}</p>
            <p>{currentTab.billToAddress}</p>
            <p>
              Email: {currentTab.billToEmail} | Phone: {currentTab.billToPhone}
            </p>
          </div>
        )}

        {/* Ship To */}
        {currentTab.shipToName && (
          <div style={{ marginBottom: "15px" }}>
            <h5>SHIP TO</h5>
            <p>{currentTab.shipToName}</p>
            <p>{currentTab.shipToAddress}</p>
            <p>
              Email: {currentTab.shipToEmail} | Phone: {currentTab.shipToPhone}
            </p>
          </div>
        )}

        {/* Driver & Vehicle (Delivery Challan) */}
        {key === "deliveryChallan" && (
          <div style={{ marginBottom: "15px" }}>
            <h5>DRIVER DETAILS</h5>
            <p>
              {currentTab.driverName} | {currentTab.driverPhone}
            </p>
            <p>
              <strong>Vehicle No.:</strong> {currentTab.vehicleNo}
            </p>
          </div>
        )}

        {/* Document Numbers */}
        <div style={{ marginBottom: "15px" }}>
          <strong>Ref ID:</strong> {currentTab.referenceId} |
          {key === "quotation" && (
            <>
              <strong>Quotation No.:</strong> {currentTab.quotationNo} |{" "}
            </>
          )}
          {key === "salesOrder" && (
            <>
              <strong>Order No.:</strong> {currentTab.salesOrderNo} |{" "}
            </>
          )}
          {key === "deliveryChallan" && (
            <>
              <strong>Challan No.:</strong> {currentTab.challanNo} |{" "}
            </>
          )}
          {key === "invoice" && (
            <>
              <strong>Invoice No.:</strong> {currentTab.invoiceNo} |{" "}
            </>
          )}
          {key === "payment" && (
            <>
              <strong>Payment No.:</strong> {currentTab.paymentNo} |{" "}
            </>
          )}
          <strong>Date:</strong>{" "}
          {currentTab[`${key}Date`] ||
            currentTab.date ||
            new Date().toISOString().split("T")[0]}
          {key === "quotation" && currentTab.validDate && (
            <>
              {" "}
              | <strong>Valid Till:</strong> {currentTab.validDate}
            </>
          )}
          {key === "invoice" && currentTab.dueDate && (
            <>
              {" "}
              | <strong>Due Date:</strong> {currentTab.dueDate}
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
                const qty =
                  key === "deliveryChallan"
                    ? parseInt(item.deliveredQty) || 0
                    : parseInt(item.qty) || 0;
                const rate = parseFloat(item.rate) || 0;
                const tax = parseFloat(item.tax) || 0;
                const discount = parseFloat(item.discount) || 0;
                const subtotal = rate * qty;
                const taxAmount = (subtotal * tax) / 100;
                const amount = subtotal + taxAmount - discount;
                return (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {item.name}
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
                      {tax}%
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
                  $
                  {calculateTotalWithTaxAndDiscount(currentTab.items).toFixed(
                    2
                  )}
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
              <strong>Amount Paid:</strong> $
              {parseFloat(currentTab.amount || 0).toFixed(2)}
            </p>
            <p>
              <strong>Payment Method:</strong> {currentTab.paymentMethod}
            </p>
            <p>
              <strong>Status:</strong> {currentTab.paymentStatus}
            </p>
          </div>
        )}

        {/* Terms & Conditions */}
        {currentTab.terms && (
          <div style={{ marginBottom: "15px" }}>
            <h5>TERMS & CONDITIONS</h5>
            <p>{currentTab.terms}</p>
          </div>
        )}

        {/* Attachments */}
        <div style={{ marginBottom: "15px" }}>
          {currentTab.signature && (
            <div style={{ marginBottom: "10px" }}>
              <strong>SIGNATURE</strong>
              <br />
              <img
                src={currentTab.signature}
                alt="Signature"
                style={{
                  maxWidth: "150px",
                  maxHeight: "80px",
                  marginTop: "5px",
                }}
              />
            </div>
          )}
          {currentTab.photo && (
            <div style={{ marginBottom: "10px" }}>
              <strong>PHOTO</strong>
              <br />
              <img
                src={currentTab.photo}
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
          {currentTab.files && currentTab.files.length > 0 && (
            <div>
              <strong>FILES</strong>
              <ul style={{ listStyle: "none", padding: 0, marginTop: "5px" }}>
                {currentTab.files.map((file, i) => (
                  <li key={i}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
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
                onChange={(e) => handlePhotoChange(tab, e)}
              />
              {formData[tab].photo && (
                <div className="mt-2">
                  <img
                    src={formData[tab].photo}
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
                onChange={(e) => handleFileChange(tab, e)}
              />
              {formData[tab].files && formData[tab].files.length > 0 && (
                <div className="mt-2">
                  <ul className="list-unstyled">
                    {formData[tab].files.map((file, index) => (
                      <li
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                      >
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
        <h4 className="text-center mb-4">Sales Process</h4>

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

          {/* View Bills */}
          <Button
            variant="primary"
            onClick={() => navigate("/company/viewinvoicee")}
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
          {/* ============= QUOTATION TAB ============= */}
          <Tab eventKey="quotation" title="Quotation">
            <QuotationTab
              formData={formData}
              handleChange={handleChange}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              renderItemsTable={renderItemsTable}
              renderAttachmentFields={renderAttachmentFields}
              calculateTotalAmount={calculateTotalAmount}
              calculateTotalWithTaxAndDiscount={
                calculateTotalWithTaxAndDiscount
              }
              handleSkip={handleSkip}
              handleSaveDraft={handleSaveDraft}
              handleSaveNext={handleSaveNext}
              handleNext={handleNext}
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
              handleProductChange={handleProductChange}
              handleAddItem={handleAddItem}
              handleUpdateItem={handleUpdateItem}
              handleAddCategory={handleAddCategory}
            />
          </Tab>

          {/* ============= SALES ORDER TAB ============= */}
          <Tab eventKey="salesOrder" title="Sales Order">
            <SalesOrderTab
              formData={formData}
              handleChange={handleChange}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              renderItemsTable={renderItemsTable}
              renderAttachmentFields={renderAttachmentFields}
              calculateTotalAmount={calculateTotalAmount}
              handleSkip={handleSkip}
              handleSaveDraft={handleSaveDraft}
              handleSaveNext={handleSaveNext}
              handleNext={handleNext}
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
              handleProductChange={handleProductChange}
              handleAddItem={handleAddItem}
              handleUpdateItem={handleUpdateItem}
              handleAddCategory={handleAddCategory}
            />
          </Tab>

          {/* ============= DELIVERY CHALLAN TAB ============= */}
          <Tab eventKey="deliveryChallan" title="Delivery Challan">
            <DeliveryChallanTab
              formData={formData}
              handleChange={handleChange}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              renderItemsTable={renderItemsTable}
              renderAttachmentFields={renderAttachmentFields}
              calculateTotalAmount={calculateTotalAmount}
              handleSkip={handleSkip}
              handleSaveDraft={handleSaveDraft}
              handleSaveNext={handleSaveNext}
              handleNext={handleNext}
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
              handleProductChange={handleProductChange}
              handleAddItem={handleAddItem}
              handleUpdateItem={handleUpdateItem}
              handleAddCategory={handleAddCategory}
            />
          </Tab>

          {/* ============= INVOICE TAB ============= */}
          <Tab eventKey="invoice" title="Invoice">
            <InvoiceTab
              formData={formData}
              handleChange={handleChange}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              renderItemsTable={renderItemsTable}
              renderAttachmentFields={renderAttachmentFields}
              calculateTotalAmount={calculateTotalAmount}
              handleSkip={handleSkip}
              handleSaveDraft={handleSaveDraft}
              handleSaveNext={handleSaveNext}
              handleNext={handleNext}
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
              handleProductChange={handleProductChange}
              handleAddItem={handleAddItem}
              handleUpdateItem={handleUpdateItem}
              handleAddCategory={handleAddCategory}
            />
          </Tab>

          <Tab eventKey="payment" title="Payment">
            <PaymentTab
              formData={formData}
              handleChange={handleChange}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              renderItemsTable={renderItemsTable}
              renderAttachmentFields={renderAttachmentFields}
              calculateTotalAmount={calculateTotalAmount}
              handleSkip={handleSkip}
              handleSaveDraft={handleSaveDraft}
              handleFinalSubmit={handleFinalSubmit}
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
              handleProductChange={handleProductChange}
              handleAddItem={handleAddItem}
              handleUpdateItem={handleUpdateItem}
              handleAddCategory={handleAddCategory}
            />
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
