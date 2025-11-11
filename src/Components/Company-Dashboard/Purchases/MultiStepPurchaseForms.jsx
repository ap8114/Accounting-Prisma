import React, { useState, useRef, useEffect } from "react";
import { Tabs, Tab, Button, Modal } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
import "../Sales/MultiStepSalesForm.css";
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
import GetCompanyId from "../../../Api/GetCompanyId";
import AddVendorModal from "../Accounts/ChartsofAccount/AddVendorModal";

// Import the new tab components
import PurchaseQuotationTab from "./Tabs/PurchaseQuotationTab";
import PurchaseOrderTab from "./Tabs/PurchaseOrderTab";
import GoodsReceiptTab from "./Tabs/GoodsReceiptTab";
import BillTab from "./Tabs/BillTab";
import PaymentTab from "./Tabs/PaymentTab";
import { Form, Row, Col } from "react-bootstrap";


const MultiStepPurchaseForm = ({ onSubmit, initialData, initialStep }) => {
  const companyId = GetCompanyId();
  const [key, setKey] = useState(initialStep || "purchaseQuotation");
  const navigate = useNavigate();
  const formRef = useRef();
  const pdfRef = useRef();

  // --- State for Vendor Modal ---
  const [showVendorModal, setShowVendorModal] = useState(false);

  // --- Form Data State ---
  const [formData, setFormData] = useState(() => ({
    purchaseQuotation: {
      companyName: "",
      referenceId: "",
      manualRefNo: "",
      quotationNo: "",
      manualQuotationNo: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      quotationDate: "",
      validDate: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      items: [{ name: "", qty: "", rate: "", tax: 0, discount: 0 }],
      bankName: "",
      accountNo: "",
      accountHolder: "",
      ifsc: "",
      notes: "",
      terms: "",
      signature: "",
      photo: "",
      files: [],
    },
    purchaseOrder: {
      referenceId: "",
      manualRefNo: "",
      orderNo: "",
      manualOrderNo: "",
      quotationNo: "",
      manualQuotationNo: "",
      orderDate: "",
      deliveryDate: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      items: [{ name: "", qty: "", rate: "", tax: 0, discount: 0 }],
      terms: "",
      signature: "",
      photo: "",
      files: [],
    },
    goodsReceipt: {
      referenceId: "",
      manualRefNo: "",
      purchaseOrderNo: "",
      receiptNo: "",
      manualReceiptNo: "",
      receiptDate: "",
      vehicleNo: "",
      driverName: "",
      driverPhone: "",
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      shipToName: "",
      shipToAddress: "",
      shipToEmail: "",
      shipToPhone: "",
      items: [
        { name: "", qty: "", receivedQty: "", rate: "", tax: 0, discount: 0 },
      ],
      terms: "",
      signature: "",
      photo: "",
      files: [],
    },
    bill: {
      orderNo: "",
      manualRefNo: "",
      billNo: "",
      manualBillNo: "",
      receiptNo: "",
      manualReceiptNo: "",
      goodsReceiptNo: "",
      manualGoodsReceiptNo: "",
      billDate: "",
      dueDate: "",
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      items: [
        {
          description: "",
          rate: "",
          qty: "",
          tax: "",
          discount: "",
          amount: "",
        },
      ],
      paymentStatus: "",
      paymentMethod: "",
      note: "",
      terms: "",
      signature: "",
      photo: "",
      files: [],
    },
    payment: {
      receiptNo: "",
      manualReceiptNo: "",
      referenceId: "",
      manualRefNo: "",
      paymentDate: "",
      paymentNo: "",
      manualPaymentNo: "",
      billNo: "",
      manualBillNo: "",
      amount: "",
      paymentMethod: "",
      paymentStatus: "",
      note: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      totalAmount: "",
      footerNote: "",
      signature: "",
      photo: "",
      files: [],
    },
  }));

  // Available items for search
  const [availableItems, setAvailableItems] = useState([
    {
      id: 1,
      name: "Laptop",
      category: "Electronics",
      price: 50000,
      tax: 18,
      hsn: "8471",
      uom: "PCS",
    },
    {
      id: 2,
      name: "Office Chair",
      category: "Furniture",
      price: 5000,
      tax: 12,
      hsn: "9401",
      uom: "PCS",
    },
    {
      id: 3,
      name: "T-Shirt",
      category: "Apparel",
      price: 500,
      tax: 5,
      hsn: "6109",
      uom: "PCS",
    },
    {
      id: 4,
      name: "Coffee Table",
      category: "Furniture",
      price: 8000,
      tax: 12,
      hsn: "9403",
      uom: "PCS",
    },
    {
      id: 5,
      name: "Smartphone",
      category: "Electronics",
      price: 20000,
      tax: 18,
      hsn: "8517",
      uom: "PCS",
    },
    {
      id: 6,
      name: "Notebook",
      category: "Stationery",
      price: 100,
      tax: 5,
      hsn: "4820",
      uom: "PCS",
    },
    {
      id: 7,
      name: "Water Bottle",
      category: "Other",
      price: 200,
      tax: 5,
      hsn: "3924",
      uom: "PCS",
    },
    {
      id: 8,
      name: "Desk Lamp",
      category: "Furniture",
      price: 1500,
      tax: 12,
      hsn: "9405",
      uom: "PCS",
    },
  ]);

  // States for modals and UI
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

  const [savedRecords, setSavedRecords] = useState([]);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    hsn: "",
    tax: 0,
    sellingPrice: 0,
    uom: "PCS",
  });

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
          { name: "", qty: "", rate: "", tax: 0, discount: 0 },
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
    };

    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));

    setShowRowSearch((prev) => ({
      ...prev,
      [`${tab}-${index}`]: false,
    }));
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
    };

    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        items: [...prev[key].items, itemToAdd],
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

  // --- Top Buttons (Print, PDF, etc.) ---
  const handlePrint = (lang) => {
    const printContent = pdfRef.current;
    if (!printContent) {
      alert("No content to print!");
      return;
    }
    const printWindow = window.open("", "", "height=800,width=1000");
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write(
      "<style>body { margin: 20px; font-family: Arial, sans-serif; }</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(printContent.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
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
        filename: `${key}-${
          formData[key].quotationNo || formData[key].billNo || "document"
        }.pdf`,
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        html2canvas: { scale: 3 },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .save();
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      formData.purchaseQuotation.items
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Quotation");
    XLSX.writeFile(
      workbook,
      `purchase-quotation-${
        formData.purchaseQuotation.quotationNo || "draft"
      }.xlsx`
    );
  };

  // --- Navigation Buttons ---
  const handleSkip = () => {
    setKey((prev) => {
      if (prev === "purchaseQuotation") return "purchaseOrder";
      if (prev === "purchaseOrder") return "goodsReceipt";
      if (prev === "goodsReceipt") return "bill";
      if (prev === "bill") return "payment";
      return "purchaseQuotation";
    });
  };

  const handleSaveDraft = () => onSubmit(formData, key);

  const handleSaveNext = () => {
    handleSaveDraft();
    setKey((prev) => {
      if (prev === "purchaseQuotation") {
        setFormData((prevData) => ({
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
            items: prevData.purchaseQuotation.items.map((item) => ({
              name: item.name,
              qty: item.qty,
              rate: item.rate,
            })),
          },
        }));
        return "purchaseOrder";
      }
      if (prev === "purchaseOrder") {
        setFormData((prevData) => ({
          ...prevData,
          goodsReceipt: {
            ...prevData.goodsReceipt,
            purchaseOrderNo: prevData.purchaseOrder.orderNo,
            receiptDate: new Date().toISOString().split("T")[0],
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
            items: prevData.purchaseOrder.items.map((item) => ({
              name: item.name,
              qty: item.qty,
              receivedQty: item.qty,
              rate: item.rate,
            })),
          },
        }));
        return "goodsReceipt";
      }
      if (prev === "goodsReceipt") {
        setFormData((prevData) => ({
          ...prevData,
          bill: {
            ...prevData.bill,
            orderNo: prevData.purchaseOrder.orderNo,
            billNo: `BILL-${Date.now().toString().slice(-6)}`,
            billDate: new Date().toISOString().split("T")[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            vendorName: prevData.goodsReceipt.vendorName,
            vendorAddress: prevData.goodsReceipt.vendorAddress,
            vendorEmail: prevData.goodsReceipt.vendorEmail,
            vendorPhone: prevData.goodsReceipt.vendorPhone,
            companyName: prevData.goodsReceipt.companyName,
            companyAddress: prevData.goodsReceipt.companyAddress,
            companyEmail: prevData.goodsReceipt.companyEmail,
            companyPhone: prevData.goodsReceipt.companyPhone,
            items: prevData.goodsReceipt.items.map((item) => ({
              description: item.name,
              qty: item.receivedQty,
              rate: item.rate,
              tax: 0,
              discount: 0,
              amount: item.rate * item.receivedQty,
            })),
          },
        }));
        return "bill";
      }
      if (prev === "bill") {
        setFormData((prevData) => ({
          ...prevData,
          payment: {
            ...prevData.payment,
            billNo: prevData.bill.billNo,
            paymentDate: new Date().toISOString().split("T")[0],
            totalAmount: calculateTotalAmount(prevData.bill.items).toFixed(2),
            amount: "",
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
        return "payment";
      }
      return "purchaseQuotation";
    });
  };

  const handleNext = () => {
    setKey((prev) => {
      if (prev === "purchaseQuotation") return "purchaseOrder";
      if (prev === "purchaseOrder") return "goodsReceipt";
      if (prev === "goodsReceipt") return "bill";
      if (prev === "bill") return "payment";
      return "purchaseQuotation";
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
    alert("Purchase form submitted!");
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

  // --- PDF View ---
  const renderPDFView = () => {
    const currentTab = formData[key];
    const hasItems =
      ["purchaseQuotation", "purchaseOrder", "goodsReceipt", "bill"].includes(
        key
      ) && Array.isArray(currentTab.items);

    return (
      <div
        ref={pdfRef}
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "white",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
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
            }}
          >
            {currentTab.logo ? (
              <img
                src={currentTab.logo}
                alt="Logo"
                style={{ maxWidth: "100%", maxHeight: "100px" }}
              />
            ) : (
              "Logo"
            )}
          </div>
          <div style={{ textAlign: "center", color: "#28a745" }}>
            <h2>
              {key === "purchaseQuotation" && "PURCHASE QUOTATION"}
              {key === "purchaseOrder" && "PURCHASE ORDER"}
              {key === "goodsReceipt" && "GOODS RECEIPT NOTE"}
              {key === "bill" && "PURCHASE BILL"}
              {key === "payment" && "PAYMENT RECEIPT"}
            </h2>
          </div>
        </div>
        <hr style={{ border: "2px solid #28a745", margin: "15px 0" }} />
        <div style={{ marginBottom: "15px" }}>
          <h4>{currentTab.companyName}</h4>
          <p>{currentTab.companyAddress}</p>
          <p>
            Email: {currentTab.companyEmail} | Phone: {currentTab.companyPhone}
          </p>
        </div>
        {currentTab.vendorName && (
          <div style={{ marginBottom: "15px" }}>
            <h5>Vendor</h5>
            <p>{currentTab.vendorName}</p>
            <p>{currentTab.vendorAddress}</p>
            <p>
              Email: {currentTab.vendorEmail} | Phone: {currentTab.vendorPhone}
            </p>
          </div>
        )}
        {currentTab.shipToName && (
          <div style={{ marginBottom: "15px" }}>
            <h5>Ship To</h5>
            <p>{currentTab.shipToName}</p>
            <p>{currentTab.shipToAddress}</p>
            <p>
              Email: {currentTab.shipToEmail} | Phone: {currentTab.shipToPhone}
            </p>
          </div>
        )}
        {key === "goodsReceipt" && (
          <div style={{ marginBottom: "15px" }}>
            <h5>Driver Details</h5>
            <p>
              {currentTab.driverName} | {currentTab.driverPhone}
            </p>
            <p>Vehicle No.: {currentTab.vehicleNo}</p>
          </div>
        )}
        <div style={{ marginBottom: "15px" }}>
          <strong>Ref NO:</strong> {currentTab.referenceId} |
          {key === "purchaseQuotation" && (
            <>
              <strong>Quotation No.:</strong> {currentTab.quotationNo} |{" "}
            </>
          )}
          {key === "purchaseOrder" && (
            <>
              <strong>Order No.:</strong> {currentTab.orderNo} |{" "}
            </>
          )}
          {key === "goodsReceipt" && (
            <>
              <strong>Receipt No.:</strong> {currentTab.receiptNo} |{" "}
            </>
          )}
          {key === "bill" && (
            <>
              <strong>Bill No.:</strong> {currentTab.billNo} |{" "}
            </>
          )}
          {key === "payment" && (
            <>
              <strong>Payment No.:</strong> {currentTab.paymentNo} |{" "}
            </>
          )}
          <strong>Date:</strong> {currentTab[`${key}Date`] || currentTab.date}
        </div>
        {hasItems && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ border: "1px solid #000", padding: "8px" }}>
                  Item Name
                </th>
                <th style={{ border: "1px solid #000", padding: "8px" }}>
                  Qty
                </th>
                {key === "goodsReceipt" && (
                  <th style={{ border: "1px solid #000", padding: "8px" }}>
                    Received Qty
                  </th>
                )}
                <th style={{ border: "1px solid #000", padding: "8px" }}>
                  Rate
                </th>
                <th style={{ border: "1px solid #000", padding: "8px" }}>
                  Tax %
                </th>
                <th style={{ border: "1px solid #000", padding: "8px" }}>
                  Discount
                </th>
                <th style={{ border: "1px solid #000", padding: "8px" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTab.items.map((item, idx) => {
                const qty =
                  key === "goodsReceipt"
                    ? parseInt(item.receivedQty) || 0
                    : parseInt(item.qty) || 0;
                const amount = (parseFloat(item.rate) || 0) * qty;
                return (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {item.name}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {item.qty}
                    </td>
                    {key === "goodsReceipt" && (
                      <td style={{ border: "1px solid #000", padding: "8px" }}>
                        {item.receivedQty}
                      </td>
                    )}
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {parseFloat(item.rate).toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {item.tax}%
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {parseFloat(item.discount).toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={key === "goodsReceipt" ? 6 : 5}
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
        {key === "payment" && (
          <div style={{ marginBottom: "15px" }}>
            <h5>Payment Details</h5>
            <p>Amount Paid: ${parseFloat(currentTab.amount).toFixed(2)}</p>
            <p>Payment Method: {currentTab.paymentMethod}</p>
            <p>Status: {currentTab.paymentStatus}</p>
          </div>
        )}
        {currentTab.terms && (
          <div style={{ marginBottom: "15px" }}>
            <strong>Terms & Conditions:</strong>
            <p>{currentTab.terms}</p>
          </div>
        )}
        <div style={{ marginBottom: "15px" }}>
          {currentTab.signature && (
            <div>
              <strong>Signature:</strong>
              <br />
              <img
                src={currentTab.signature}
                alt="Signature"
                style={{
                  maxWidth: "150px",
                  maxHeight: "100px",
                  margin: "5px 0",
                }}
              />
            </div>
          )}
          {currentTab.photo && (
            <div>
              <strong>Photo:</strong>
              <br />
              <img
                src={currentTab.photo}
                alt="Photo"
                style={{
                  maxWidth: "150px",
                  maxHeight: "100px",
                  margin: "5px 0",
                }}
              />
            </div>
          )}
          {currentTab.files && currentTab.files.length > 0 && (
            <div>
              <strong>Files:</strong>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {currentTab.files.map((file, i) => (
                  <li key={i}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p
          style={{ textAlign: "center", fontWeight: "bold", marginTop: "30px" }}
        >
          {currentTab.footerNote || "Thank you for your business!"}
        </p>
      </div>
    );
  };

  // --- Render Attachment Fields (can be a utility function or a small component) ---
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

  // Props to be passed to each tab component
  const tabProps = {
    formData,
    handleChange,
    handleItemChange,
    addItem,
    removeItem,
    handleRowSearchChange,
    handleSelectSearchedItem,
    toggleRowSearch,
    calculateTotalWithTaxAndDiscount,
    availableItems,
    rowSearchTerms,
    showRowSearch,
    renderAttachmentFields,
    handleAddItem,
    newItem,
    setNewItem,
    showAdd,
    setShowAdd,
    showEdit,
    setShowEdit,
    showUOMModal,
    setShowUOMModal,
    showAddCategoryModal,
    setShowAddCategoryModal,
    newCategory,
    setNewCategory,
    categories,
    handleProductChange,
    handleUpdateItem,
    handleAddCategory,
    companyId,
    generateReferenceId: (tabKey) => {
      const prefixes = {
        purchaseQuotation: "QRF",
        purchaseOrder: "ORD",
        goodsReceipt: "GRN",
        bill: "BILL",
        payment: "PAY",
      };
      const prefix = prefixes[tabKey] || "REF";
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `${prefix}-${year}-${rand}`;
    },
    handleSkip,
    handleSaveDraft,
    handleSaveNext,
    handleNext,
    navigate,
    showVendorModal,
    setShowVendorModal,
  };

  return (
    <>
      <div className="container-fluid mt-4 px-2" ref={formRef}>
        <h4 className="text-center mb-4">Purchase Process</h4>

        {/* Top Action Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-2 gap-sm-3 mb-4">
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
          <Tab eventKey="purchaseQuotation" title="Purchase Quotation">
            <PurchaseQuotationTab {...tabProps} />
          </Tab>
          <Tab eventKey="purchaseOrder" title="Purchase Order">
            <PurchaseOrderTab {...tabProps} />
          </Tab>
          <Tab eventKey="goodsReceipt" title="Goods Receipt">
            <GoodsReceiptTab {...tabProps} />
          </Tab>
          <Tab eventKey="bill" title="Bill">
            <BillTab {...tabProps} />
          </Tab>
          <Tab eventKey="payment" title="Payment">
            <PaymentTab {...tabProps} />
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

export default MultiStepPurchaseForm;