// import React, { useState, useEffect, useRef } from "react";
// import {
//   Tabs,
//   Tab,
//   Button,
//   Form,
//   Badge,
//   Card,
// } from "react-bootstrap";
// import {
//   FaFilePdf,
//   FaFileExcel,
//   FaPlusCircle,
//   FaEye,
//   FaEdit,
//   FaTrash,
// } from "react-icons/fa";
// import axiosInstance from "../../../Api/axiosInstance";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";

// const Income = () => {
//   const COMPANY_ID = 13;

//   const [selectedVoucher, setSelectedVoucher] = useState(null);
//   const [editVoucher, setEditVoucher] = useState(null);
//   const [deleteVoucher, setDeleteVoucher] = useState(null);
//   const [activeTab, setActiveTab] = useState("direct");
//   const [filters, setFilters] = useState({
//     accountName: "",
//     receiptNo: "",
//     depositedTo: "",
//   });

//   const [tableRows, setTableRows] = useState([
//     { id: 1, account: "", amount: "0.00", narration: "" }
//   ]);
//   const [receivedFromId, setReceivedFromId] = useState(""); // store customer ID
//   const [narration, setNarration] = useState("");
//   const [showNarration, setShowNarration] = useState(true);
//   const [autoReceiptNo, setAutoReceiptNo] = useState("");
//   const [manualReceiptNo, setManualReceiptNo] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [incomeVouchers, setIncomeVouchers] = useState([]);

//   const [accounts, setAccounts] = useState([]);     // for Deposited To
//   const [customers, setCustomers] = useState([]);   // for Received From

//   const modalRef = useRef(null);

//   // Generate auto receipt number
//   const generateAutoReceiptNo = () => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = (now.getMonth() + 1).toString().padStart(2, '0');
//     const day = now.getDate().toString().padStart(2, '0');
//     const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
//     return `REC-${year}${month}${day}-${random}`;
//   };

//   // Fetch accounts for "Deposited To"
//   const fetchAccounts = async () => {
//     try {
//       const res = await axiosInstance.get(`/account/getAccountByCompany/${COMPANY_ID}`);
//       if (res.data.status) {
//         setAccounts(res.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching accounts:", err);
//     }
//   };

//   // Fetch customers for "Received From"
//   const fetchCustomers = async () => {
//     try {
//       const res = await axiosInstance.get(`/customers/getCustomersByCompany/${COMPANY_ID}`);
//       if (res.data.status) {
//         setCustomers(res.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching customers:", err);
//     }
//   };

//   // Fetch income vouchers
//   const fetchIncomeVouchers = async () => {
//     setFetching(true);
//     try {
//       const response = await axiosInstance.get(`/income-vouchers/company/${COMPANY_ID}`);
//       if (response.data.success) {
//         const transformedVouchers = response.data.data.map(voucher => {
//           // ✅ Parse entries correctly
//           const items = (voucher.entries || []).map(entry => ({
//             account: entry.income_account || "",
//             amount: parseFloat(entry.amount).toFixed(2),
//             narration: entry.row_narration || ""
//           }));

//           const dateObj = new Date(voucher.date);
//           const formattedDate = dateObj.toLocaleDateString('en-GB', {
//             day: 'numeric',
//             month: 'short',
//             year: 'numeric'
//           }).replace(/ /g, ' ');

//           // Find customer name if received_from exists
//           let receivedFromName = "N/A";
//           if (voucher.received_from) {
//             const cust = customers.find(c => c.id == voucher.received_from);
//             receivedFromName = cust ? (cust.name_english || cust.account_name) : "N/A";
//           }

//           return {
//             id: voucher.id,
//             date: formattedDate,
//             autoReceiptNo: voucher.auto_receipt_no,
//             manualReceiptNo: voucher.manual_receipt_no,
//             depositedTo: voucher.deposited_to,
//             receivedFrom: receivedFromName,
//             receivedFromId: voucher.received_from,
//             items,
//             narration: voucher.narration,
//             totalAmount: voucher.total_amount,
//             status: voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)
//           };
//         });
//         setIncomeVouchers(transformedVouchers);
//       }
//     } catch (error) {
//       console.error("Error fetching income vouchers:", error);
//       setIncomeVouchers([]);
//     } finally {
//       setFetching(false);
//     }
//   };

//   useEffect(() => {
//     setAutoReceiptNo(generateAutoReceiptNo());
//     fetchAccounts();
//     fetchCustomers();
//   }, []);

//   // Re-fetch vouchers when customers/accounts load (to resolve names)
//   useEffect(() => {
//     if (accounts.length > 0 && customers.length > 0) {
//       fetchIncomeVouchers();
//     }
//   }, [accounts, customers]);

//   // Reset form on modal close
//   useEffect(() => {
//     const modal = modalRef.current;
//     if (modal) {
//       const handleHidden = () => {
//         setAutoReceiptNo(generateAutoReceiptNo());
//         setManualReceiptNo("");
//         setTableRows([{ id: 1, account: "", amount: "0.00", narration: "" }]);
//         setNarration("");
//         setReceivedFromId("");
//         setLoading(false);
//         setEditVoucher(null);
//       };
//       modal.addEventListener('hidden.bs.modal', handleHidden);
//       return () => modal.removeEventListener('hidden.bs.modal', handleHidden);
//     }
//   }, []);

//   const getStatusBadge = (status) => {
//     switch (status.toLowerCase()) {
//       case "received":
//       case "approved": return "badge bg-success";
//       case "pending": return "badge bg-warning text-dark";
//       case "rejected": return "badge bg-danger";
//       default: return "badge bg-secondary";
//     }
//   };

//   const calculateTotal = () => {
//     return tableRows.reduce((total, row) => total + parseFloat(row.amount || 0), 0).toFixed(2);
//   };

//   const handleAddRow = () => {
//     setTableRows([...tableRows, { id: Date.now(), account: "", amount: "0.00", narration: "" }]);
//   };

//   const handleDeleteRow = (id) => {
//     if (tableRows.length > 1) {
//       setTableRows(tableRows.filter(row => row.id !== id));
//     }
//   };

//   const handleRowChange = (id, field, value) => {
//     setTableRows(tableRows.map(row => row.id === id ? { ...row, [field]: value } : row));
//   };

//   const handleReceivedFromChange = (e) => {
//     const customerId = e.target.value;
//     setReceivedFromId(customerId);
//     if (customerId) {
//       const customer = customers.find(c => c.id == customerId);
//       if (customer) {
//         setTableRows([...tableRows, {
//           id: Date.now(),
//           account: customer.name_english || customer.account_name,
//           amount: "0.00",
//           narration: ""
//         }]);
//         setReceivedFromId(""); // reset dropdown
//       }
//     }
//   };

//   // ✅ CREATE VOUCHER
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const entries = tableRows
//       .map(row => ({
//         income_account: row.account,
//         amount: parseFloat(row.amount) || 0,
//         row_narration: row.narration || ""
//       }))
//       .filter(entry => entry.income_account && entry.amount > 0);

//     if (entries.length === 0) {
//       alert("Please add at least one valid income entry.");
//       setLoading(false);
//       return;
//     }

//     const payload = {
//       company_id: COMPANY_ID,
//       auto_receipt_no: autoReceiptNo,
//       manual_receipt_no: manualReceiptNo,
//       voucher_date: e.target.voucherDate.value,
//       deposited_to: e.target.depositedTo.value,
//       received_from: receivedFromId || null,
//       narration: narration,
//       status: "approved",
//       entries
//     };

//     try {
//       await axiosInstance.post("/income-vouchers", payload);
//       // ✅ Refresh list
//       await fetchIncomeVouchers();
//       // ✅ Close modal properly
//       const modalEl = document.getElementById("createVoucherModal");
//       if (modalEl) {
//         const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
//         modalInstance.hide();
//       }

//     } catch (error) {
//       console.error("Error creating voucher:", error);
//       alert(error.response?.data?.message || "Failed to create income voucher.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ EDIT VOUCHER (simplified – entries not editable in this version)
//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     if (!editVoucher) return;
//     setLoading(true);

//     const payload = {
//       company_id: COMPANY_ID,
//       auto_receipt_no: e.target.autoReceiptNo.value,
//       manual_receipt_no: e.target.manualReceiptNo.value,
//       voucher_date: e.target.voucherDate.value,
//       deposited_to: e.target.depositedTo.value,
//       received_from: editVoucher.receivedFromId || null,
//       narration: e.target.narration.value,
//       status: e.target.status.value,
//       entries: editVoucher.items.map(item => ({
//         income_account: item.account,
//         amount: parseFloat(item.amount) || 0,
//         row_narration: item.narration || ""
//       })).filter(entry => entry.income_account)
//     };

//     try {
//       await axiosInstance.patch(`/income-vouchers/${editVoucher.id}`, payload);
//       await fetchIncomeVouchers();
//       const modal = document.getElementById('editVoucherModal');
//       if (modal) {
//         const modalInstance = bootstrap.Modal.getInstance(modal);
//         if (modalInstance) modalInstance.hide();
//       }
//     } catch (error) {
//       console.error("Error updating voucher:", error);
//       alert(error.response?.data?.message || "Failed to update voucher.");
//     } finally {
//       setLoading(false);
//       setEditVoucher(null);
//     }
//   };

//   // ✅ DELETE
//   const confirmDelete = async () => {
//     if (!deleteVoucher) return;
//     try {
//       await axiosInstance.delete(`/income-vouchers/${deleteVoucher.id}`);
//       await fetchIncomeVouchers();
//       const modal = document.getElementById('deleteVoucherModal');
//       if (modal) {
//         const modalInstance = bootstrap.Modal.getInstance(modal);
//         if (modalInstance) modalInstance.hide();
//       }
//     } catch (error) {
//       console.error("Error deleting voucher:", error);
//       alert(error.response?.data?.message || "Failed to delete voucher.");
//     } finally {
//       setDeleteVoucher(null);
//     }
//   };

//   const handleEdit = (voucher) => setEditVoucher(voucher);
//   const handleDelete = (voucher) => setDeleteVoucher(voucher);

//   const filteredVouchers = incomeVouchers.filter(voucher => {
//     return (
//       (!filters.accountName || voucher.receivedFrom.toLowerCase().includes(filters.accountName.toLowerCase())) &&
//       (!filters.receiptNo ||
//         (voucher.autoReceiptNo && voucher.autoReceiptNo.toLowerCase().includes(filters.receiptNo.toLowerCase())) ||
//         (voucher.manualReceiptNo && voucher.manualReceiptNo.toLowerCase().includes(filters.receiptNo.toLowerCase()))) &&
//       (!filters.depositedTo || voucher.depositedTo === filters.depositedTo)
//     );
//   });

//   return (
//     <div className="bg-light p-4 mt-1 product-header">
//       {/* Header */}
//       <div className="d-flex justify-content-between gap-4 mb-4">
//         <div>
//           <h5 className="fw-bold mb-1">Income Voucher</h5>
//           <p className="text-muted mb-0">Manage your income receipts</p>
//         </div>
//         <div className="d-flex align-items-center gap-2 flex-wrap">
//           <button className="btn btn-light border text-danger"><FaFilePdf /></button>
//           <button className="btn btn-light border text-success"><FaFileExcel /></button>
//           <button
//             className="btn text-white d-flex align-items-center gap-2"
//             style={{ backgroundColor: "#3daaaa" }}
//             data-bs-toggle="modal"
//             data-bs-target="#createVoucherModal"
//             disabled={fetching}
//           >
//             <FaPlusCircle /> Create Income Voucher
//           </button>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white p-3 rounded shadow-sm mb-4">
//         <div className="row g-3">
//           <div className="col-md-4">
//             <label className="form-label fw-semibold">Receipt No</label>
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search by Receipt No..."
//               value={filters.receiptNo}
//               onChange={(e) => setFilters({ ...filters, receiptNo: e.target.value })}
//             />
//           </div>
//           <div className="col-md-4">
//             <label className="form-label fw-semibold">Account</label>
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search by Account..."
//               value={filters.accountName}
//               onChange={(e) => setFilters({ ...filters, accountName: e.target.value })}
//             />
//           </div>
//           <div className="col-md-4">
//             <label className="form-label fw-semibold">Deposited To</label>
//             <select
//               className="form-select"
//               value={filters.depositedTo}
//               onChange={(e) => setFilters({ ...filters, depositedTo: e.target.value })}
//             >
//               <option value="">All</option>
//               {accounts.map(acc => (
//                 <option key={acc.id} value={acc.account_name}>
//                   {acc.account_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Loading */}
//       {fetching ? (
//         <div className="text-center my-4">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <p className="mt-2">Loading income vouchers...</p>
//         </div>
//       ) : (
//         <>
//           <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
//             <Tab eventKey="direct" title="All Income Vouchers">
//               <div className="table-responsive">
//                 {filteredVouchers.length === 0 ? (
//                   <div className="text-center py-4">
//                     <p className="text-muted">No income vouchers found.</p>
//                   </div>
//                 ) : (
//                   <table className="table table-bordered text-center align-middle mb-0">
//                     <thead className="table-light">
//                       <tr>
//                         <th>DATE</th>
//                         <th>AUTO RECEIPT NO</th>
//                         <th>MANUAL RECEIPT NO</th>
//                         <th>DEPOSITED TO</th>
//                         {/* <th>RECEIVED FROM</th> */}
//                         <th>RECEIVED FROM</th>
//                         <th>TOTAL AMOUNT</th>
//                         <th>NARRATION</th>
//                         <th>STATUS</th>
//                         <th>ACTION</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredVouchers.map((voucher) => (
//                         <tr key={voucher.id}>
//                           <td>{voucher.date}</td>
//                           <td>{voucher.autoReceiptNo}</td>
//                           <td>{voucher.manualReceiptNo}</td>
//                           <td>{voucher.depositedTo}</td>
//                           {/* <td>{voucher.receivedFrom}</td> */}
//                           <td>
//                             {voucher.items.map((item, index) => (
//                               <div key={index}>{item.account}</div>
//                             ))}
//                           </td>
//                           <td>{voucher.totalAmount}</td>
//                           <td>{voucher.narration}</td>
//                           <td><span className={getStatusBadge(voucher.status)}>{voucher.status}</span></td>
//                           <td className="d-flex gap-2 justify-content-center">
//                             <button
//                               className="btn btn-sm text-info"
//                               data-bs-toggle="modal"
//                               data-bs-target="#voucherDetailModal"
//                               onClick={() => setSelectedVoucher(voucher)}
//                             >
//                               <FaEye />
//                             </button>
//                             <button
//                               className="btn btn-sm text-warning"
//                               data-bs-toggle="modal"
//                               data-bs-target="#editVoucherModal"
//                               onClick={() => handleEdit(voucher)}
//                             >
//                               <FaEdit />
//                             </button>
//                             <button
//                               className="btn btn-sm text-danger"
//                               data-bs-toggle="modal"
//                               data-bs-target="#deleteVoucherModal"
//                               onClick={() => handleDelete(voucher)}
//                             >
//                               <FaTrash />
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             </Tab>
//           </Tabs>

//           <div className="d-flex justify-content-between align-items-center mt-3 px-3">
//             <span className="small text-muted">
//               Showing 1 to {filteredVouchers.length} of {incomeVouchers.length} results
//             </span>
//             <nav>
//               <ul className="pagination pagination-sm mb-0">
//                 <li className="page-item disabled"><button className="page-link">&laquo;</button></li>
//                 <li className="page-item active"><button className="page-link" style={{ backgroundColor: '#3daaaa' }}>1</button></li>
//                 <li className="page-item"><button className="page-link">2</button></li>
//                 <li className="page-item"><button className="page-link">&raquo;</button></li>
//               </ul>
//             </nav>
//           </div>
//         </>
//       )}

//       {/* CREATE MODAL */}
//       <div ref={modalRef} className="modal fade" id="createVoucherModal" tabIndex="-1" aria-hidden="true">
//         <div className="modal-dialog modal-dialog-centered modal-lg">
//           <div className="modal-content">
//             <div className="modal-header border-0">
//               <h5 className="modal-title fw-bold">Create Income Voucher</h5>
//               <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
//             </div>
//             <div className="modal-body">
//               <form onSubmit={handleSubmit}>
//                 <div className="row mb-3">
//                   <div className="col-md-6">
//                     <label className="form-label fw-semibold">Auto Receipt No</label>
//                     <input type="text" className="form-control" value={autoReceiptNo} readOnly />
//                   </div>
//                   <div className="col-md-6">
//                     <label className="form-label fw-semibold">Manual Receipt No</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={manualReceiptNo}
//                       onChange={(e) => setManualReceiptNo(e.target.value)}
//                       placeholder="Enter manual receipt number"
//                     />
//                   </div>
//                 </div>
//                 <div className="row mb-3">
//                   <div className="col-md-6">
//                     <label className="form-label fw-semibold">Voucher Date</label>
//                     <input type="date" className="form-control" name="voucherDate" defaultValue={new Date().toISOString().split('T')[0]} required />
//                   </div>
//                   <div className="col-md-6">
//                     <label className="form-label fw-semibold">Deposited To</label>
//                     <select className="form-select" name="depositedTo" required>
//                       <option value="">Select Account</option>
//                       {accounts.map(acc => (
//                         <option key={acc.id} value={acc.account_name}>
//                           {acc.account_name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//                 <div className="row mb-3">
//                   <div className="col-md-12">
//                     <label className="form-label fw-semibold">Received From</label>
//                     <select className="form-select" value={receivedFromId} onChange={handleReceivedFromChange}>
//                       <option value="">Select Customer</option>
//                       {customers.map(cust => (
//                         <option key={cust.id} value={cust.id}>
//                           {cust.name_english || cust.account_name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="mb-3">
//                   <table className="table table-bordered">
//                     <thead>
//                       <tr>
//                         <th>Income Account</th>
//                         <th>Amount</th>
//                         <th>Narration</th>
//                         <th>Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {tableRows.map((row) => (
//                         <tr key={row.id}>
//                           <td>
//                             <input
//                               type="text"
//                               className="form-control"
//                               value={row.account}
//                               onChange={(e) => handleRowChange(row.id, 'account', e.target.value)}
//                               placeholder="e.g., Sales Revenue"
//                               required
//                             />
//                           </td>
//                           <td>
//                             <input
//                               type="text"
//                               className="form-control"
//                               value={row.amount}
//                               onChange={(e) => {
//                                 const val = e.target.value;
//                                 if (/^\d*\.?\d*$/.test(val) || val === "") {
//                                   handleRowChange(row.id, 'amount', val);
//                                 }
//                               }}
//                               required
//                             />
//                           </td>
//                           <td>
//                             <input
//                               type="text"
//                               className="form-control"
//                               placeholder="Row narration"
//                               value={row.narration}
//                               onChange={(e) => handleRowChange(row.id, 'narration', e.target.value)}
//                             />
//                           </td>
//                           <td>
//                             <button
//                               type="button"
//                               className="btn btn-sm btn-danger"
//                               onClick={() => handleDeleteRow(row.id)}
//                               disabled={tableRows.length <= 1}
//                             >
//                               <FaTrash />
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                     <tfoot>
//                       <tr>
//                         <td colSpan={3} className="text-end fw-bold">Total: {calculateTotal()}</td>
//                         <td></td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>

//                 <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
//                   <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleAddRow}>+ Add Row</button>
//                   <div className="form-check d-flex align-items-center gap-2 mb-0">
//                     <input
//                       className="form-check-input mb-0"
//                       type="checkbox"
//                       id="showNarrationCheck"
//                       checked={showNarration}
//                       onChange={(e) => setShowNarration(e.target.checked)}
//                     />
//                     <label className="form-check-label fw-semibold mb-0" htmlFor="showNarrationCheck">Add Voucher Narration</label>
//                   </div>
//                 </div>

//                 {showNarration && (
//                   <div className="mb-3">
//                     <label className="form-label fw-semibold">Narration</label>
//                     <textarea
//                       className="form-control"
//                       rows="3"
//                       value={narration}
//                       onChange={(e) => setNarration(e.target.value)}
//                       placeholder="Enter narration for this income voucher..."
//                     ></textarea>
//                   </div>
//                 )}

//                 <div className="d-flex justify-content-end gap-2">
//                   <button
//                     type="submit"
//                     className="btn"
//                     style={{ backgroundColor: "#3daaaa", color: "white" }}
//                     disabled={loading}
//                   >
//                     {loading ? "Saving..." : "Save"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* VIEW MODAL */}
//       <div className="modal fade" id="voucherDetailModal" tabIndex="-1" aria-hidden="true">
//         <div className="modal-dialog modal-lg">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h5 className="modal-title">Income Voucher Details</h5>
//               <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={() => setSelectedVoucher(null)}></button>
//             </div>
//             <div className="modal-body">
//               {selectedVoucher && (
//                 <div>
//                   <table className="table table-bordered">
//                     <tbody>
//                       <tr><td><strong>Date</strong></td><td>{selectedVoucher.date}</td></tr>
//                       <tr><td><strong>Auto Receipt No</strong></td><td>{selectedVoucher.autoReceiptNo}</td></tr>
//                       <tr><td><strong>Manual Receipt No</strong></td><td>{selectedVoucher.manualReceiptNo}</td></tr>
//                       <tr><td><strong>Deposited To</strong></td><td>{selectedVoucher.depositedTo}</td></tr>
//                       {/* <tr><td><strong>Received From</strong></td><td>{selectedVoucher.receivedFrom}</td></tr> */}
//                       <tr><td><strong>Status</strong></td><td>{selectedVoucher.status}</td></tr>
//                       <tr><td><strong>Total Amount</strong></td><td>{selectedVoucher.totalAmount}</td></tr>
//                       <tr><td><strong>Narration</strong></td><td>{selectedVoucher.narration}</td></tr>
//                     </tbody>
//                   </table>
//                   <h6 className="mt-4 mb-3">Income Account Details</h6>
//                   <table className="table table-bordered">
//                     <thead>
//                       <tr>
//                         <th>Income Account</th>
//                         <th>Amount</th> {/* ✅ Added Amount column */}
//                         <th>Narration</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedVoucher.items.map((item, index) => (
//                         <tr key={index}>
//                           <td>{item.account}</td>
//                           <td>{item.amount}</td> {/* ✅ Display amount */}
//                           <td>{item.narration || ""}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* EDIT MODAL */}
//       <div className="modal fade" id="editVoucherModal" tabIndex="-1" aria-hidden="true">
//         <div className="modal-dialog modal-dialog-centered modal-lg">
//           <div className="modal-content">
//             <div className="modal-header border-0">
//               <h5 className="modal-title">Edit Income Voucher</h5>
//               <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={() => setEditVoucher(null)}></button>
//             </div>
//             <div className="modal-body">
//               {editVoucher && (
//                 <form onSubmit={handleEditSubmit}>
//                   <div className="row mb-3">
//                     <div className="col-md-6">
//                       <input type="text" className="form-control" name="autoReceiptNo" defaultValue={editVoucher.autoReceiptNo} readOnly />
//                     </div>
//                     <div className="col-md-6">
//                       <input type="text" className="form-control" name="manualReceiptNo" defaultValue={editVoucher.manualReceiptNo || ""} />
//                     </div>
//                   </div>
//                   <div className="row mb-3">
//                     <div className="col-md-6">
//                       <input type="date" className="form-control" name="voucherDate" defaultValue={new Date().toISOString().split('T')[0]} required />
//                     </div>
//                     <div className="col-md-6">
//                       <select className="form-select" name="depositedTo" defaultValue={editVoucher.depositedTo}>
//                         {accounts.map(acc => (
//                           <option key={acc.id} value={acc.account_name}>{acc.account_name}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                   <div className="row mb-3">
//                     <div className="col-md-12">
//                       <input type="text" className="form-control" defaultValue={editVoucher.receivedFrom} readOnly />
//                     </div>
//                   </div>
//                   <div className="row mb-3">
//                     <div className="col-md-12">
//                       <input type="text" className="form-control" defaultValue={editVoucher.items.map(i => i.account).join(', ')} readOnly />
//                     </div>
//                   </div>
//                   <div className="row mb-3">
//                     <div className="col-md-12">
//                       <input type="text" className="form-control" defaultValue={editVoucher.totalAmount} readOnly />
//                     </div>
//                   </div>
//                   <div className="row mb-3">
//                     <div className="col-md-12">
//                       <textarea className="form-control" rows="3" defaultValue={editVoucher.narration} name="narration"></textarea>
//                     </div>
//                   </div>
//                   <div className="row mb-3">
//                     <div className="col-md-12">
//                       <select className="form-select" name="status" defaultValue={editVoucher.status.toLowerCase()}>
//                         <option value="pending">Pending</option>
//                         <option value="approved">Approved</option>
//                         <option value="rejected">Rejected</option>
//                       </select>
//                     </div>
//                   </div>
//                   <div className="d-flex justify-content-end gap-3 mt-4">
//                     <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
//                     <button type="submit" className="btn" style={{ backgroundColor: "#3daaaa", color: "white" }} disabled={loading}>
//                       {loading ? "Saving..." : "Save Changes"}
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* DELETE MODAL */}
//       <div className="modal fade" id="deleteVoucherModal" tabIndex="-1" aria-hidden="true">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content border-0" style={{ borderRadius: 16 }}>
//             <div className="modal-body text-center py-4">
//               <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                 <FaTrash size={32} color="#F04438" />
//               </div>
//               <h4 className="fw-bold mb-2">Delete Income Voucher</h4>
//               <p className="mb-4" style={{ color: "#555" }}>Are you sure you want to delete this income voucher?</p>
//               <div className="d-flex justify-content-center gap-3">
//                 <button className="btn btn-dark" data-bs-dismiss="modal">No, Cancel</button>
//                 <button
//                   className="btn"
//                   style={{ background: "#3daaaa", color: "#fff", fontWeight: 600 }}
//                   data-bs-dismiss="modal"
//                   onClick={confirmDelete}
//                   disabled={loading}
//                 >
//                   Yes, Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Page Info */}
//       <Card className="mb-4 p-3 shadow rounded-4 mt-2">
//         <Card.Body>
//           <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
//           <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
//             <li>Create and manage income vouchers for various revenue sources.</li>
//             <li>Each voucher has both auto-generated and manual receipt numbers for tracking.</li>
//             <li>Helps maintain accurate financial records and income tracking.</li>
//           </ul>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default Income;


import React, { useState, useEffect, useRef } from "react";
import {
  Tabs,
  Tab,
  Button,
  Form,
  Badge,
  Card,
} from "react-bootstrap";
import {
  FaFilePdf,
  FaFileExcel,
  FaPlusCircle,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import axiosInstance from "../../../Api/axiosInstance";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const Income = () => {
  const COMPANY_ID = 13;

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [editVoucher, setEditVoucher] = useState(null);
  const [deleteVoucher, setDeleteVoucher] = useState(null);
  const [activeTab, setActiveTab] = useState("direct");
  const [filters, setFilters] = useState({
    accountName: "",
    receiptNo: "",
    depositedTo: "",
  });

  const [tableRows, setTableRows] = useState([
    { id: 1, account: "", amount: "0.00", narration: "" }
  ]);
  const [receivedFromId, setReceivedFromId] = useState(""); // store customer ID
  const [narration, setNarration] = useState("");
  const [showNarration, setShowNarration] = useState(true);
  const [autoReceiptNo, setAutoReceiptNo] = useState("");
  const [manualReceiptNo, setManualReceiptNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [incomeVouchers, setIncomeVouchers] = useState([]);

  const [accounts, setAccounts] = useState([]);     // for Deposited To
  const [customers, setCustomers] = useState([]);   // for Received From
  
  // Modal visibility states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const modalRef = useRef(null);

  // Generate auto receipt number
  const generateAutoReceiptNo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REC-${year}${month}${day}-${random}`;
  };

  // Fetch accounts for "Deposited To"
  const fetchAccounts = async () => {
    try {
      const res = await axiosInstance.get(`/account/getAccountByCompany/${COMPANY_ID}`);
      if (res.data.status) {
        setAccounts(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  // Fetch customers for "Received From"
  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get(`/customers/getCustomersByCompany/${COMPANY_ID}`);
      if (res.data.status) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  // Fetch income vouchers
  const fetchIncomeVouchers = async () => {
    setFetching(true);
    try {
      const response = await axiosInstance.get(`/income-vouchers/company/${COMPANY_ID}`);
      if (response.data.success) {
        const transformedVouchers = response.data.data.map(voucher => {
          // ✅ Parse entries correctly
          const items = (voucher.entries || []).map(entry => ({
            account: entry.income_account || "",
            amount: parseFloat(entry.amount).toFixed(2),
            narration: entry.row_narration || ""
          }));

          const dateObj = new Date(voucher.date);
          const formattedDate = dateObj.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }).replace(/ /g, ' ');

          // Find customer name if received_from exists
          let receivedFromName = "N/A";
          if (voucher.received_from) {
            const cust = customers.find(c => c.id == voucher.received_from);
            receivedFromName = cust ? (cust.name_english || cust.account_name) : "N/A";
          }

          return {
            id: voucher.id,
            date: formattedDate,
            autoReceiptNo: voucher.auto_receipt_no,
            manualReceiptNo: voucher.manual_receipt_no,
            depositedTo: voucher.deposited_to,
            receivedFrom: receivedFromName,
            receivedFromId: voucher.received_from,
            items,
            narration: voucher.narration,
            totalAmount: voucher.total_amount,
            status: voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)
          };
        });
        setIncomeVouchers(transformedVouchers);
      }
    } catch (error) {
      console.error("Error fetching income vouchers:", error);
      setIncomeVouchers([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    setAutoReceiptNo(generateAutoReceiptNo());
    fetchAccounts();
    fetchCustomers();
  }, []);

  // Re-fetch vouchers when customers/accounts load (to resolve names)
  useEffect(() => {
    if (accounts.length > 0 && customers.length > 0) {
      fetchIncomeVouchers();
    }
  }, [accounts, customers]);

  // Reset form when modals are closed
  useEffect(() => {
    if (!showCreateModal) {
      setAutoReceiptNo(generateAutoReceiptNo());
      setManualReceiptNo("");
      setTableRows([{ id: 1, account: "", amount: "0.00", narration: "" }]);
      setNarration("");
      setReceivedFromId("");
      setLoading(false);
    }
  }, [showCreateModal]);

  useEffect(() => {
    if (!showViewModal) {
      setSelectedVoucher(null);
    }
  }, [showViewModal]);

  useEffect(() => {
    if (!showEditModal) {
      setEditVoucher(null);
    }
  }, [showEditModal]);

  useEffect(() => {
    if (!showDeleteModal) {
      setDeleteVoucher(null);
    }
  }, [showDeleteModal]);

  // ✅ FIXED: Updated getStatusBadge function to properly handle all statuses
  const getStatusBadge = (status) => {
    if (!status) return "badge bg-secondary";
    
    const statusLower = status.toLowerCase();
    
    if (statusLower === "received" || statusLower === "approved") {
      return "badge bg-success";
    } else if (statusLower === "pending") {
      return "badge bg-warning text-dark";
    } else if (statusLower === "rejected") { 
      return "badge bg-danger";                   
    } else {
      return "badge bg-secondary";
    }
  };

  const calculateTotal = () => {
    return tableRows.reduce((total, row) => total + parseFloat(row.amount || 0), 0).toFixed(2);
  };

  const handleAddRow = () => {
    setTableRows([...tableRows, { id: Date.now(), account: "", amount: "0.00", narration: "" }]);
  };

  const handleDeleteRow = (id) => {
    if (tableRows.length > 1) {
      setTableRows(tableRows.filter(row => row.id !== id));
    }
  };

  const handleRowChange = (id, field, value) => {
    setTableRows(tableRows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleReceivedFromChange = (e) => {
    const customerId = e.target.value;
    setReceivedFromId(customerId);
    if (customerId) {
      const customer = customers.find(c => c.id == customerId);
      if (customer) {
        setTableRows([...tableRows, {
          id: Date.now(),
          account: customer.name_english || customer.account_name,
          amount: "0.00",
          narration: ""
        }]);
        setReceivedFromId(""); // reset dropdown
      }
    }
  };

  // ✅ CREATE VOUCHER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const entries = tableRows
      .map(row => ({
        income_account: row.account,
        amount: parseFloat(row.amount) || 0,
        row_narration: row.narration || ""
      }))
      .filter(entry => entry.income_account && entry.amount > 0);

    if (entries.length === 0) {
      alert("Please add at least one valid income entry.");
      setLoading(false);
      return;
    }

    const payload = {
      company_id: COMPANY_ID,
      auto_receipt_no: autoReceiptNo,
      manual_receipt_no: manualReceiptNo,
      voucher_date: e.target.voucherDate.value,
      deposited_to: e.target.depositedTo.value,
      received_from: receivedFromId || null,
      narration: narration,
      status: "pending",
      entries
    };

    try {
      await axiosInstance.post("/income-vouchers", payload);
      // ✅ Refresh list
      await fetchIncomeVouchers();
      // ✅ Show success message and close modal
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Income voucher created successfully!',
        confirmButtonColor: '#3daaaa',
      }).then(() => {
        setShowCreateModal(false);
      });
    } catch (error) {
      console.error("Error creating voucher:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || "Failed to create income voucher.",
        confirmButtonColor: '#3daaaa',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ EDIT VOUCHER
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editVoucher) return;
    setLoading(true);

    const payload = {
      company_id: COMPANY_ID,
      auto_receipt_no: e.target.autoReceiptNo.value,
      manual_receipt_no: e.target.manualReceiptNo.value,
      voucher_date: e.target.voucherDate.value,
      deposited_to: e.target.depositedTo.value,
      received_from: editVoucher.receivedFromId || null,
      narration: e.target.narration.value,
      status: e.target.status.value,
      entries: editVoucher.items.map(item => ({
        income_account: item.account,
        amount: parseFloat(item.amount) || 0,
        row_narration: item.narration || ""
      })).filter(entry => entry.income_account)
    };

    try {
      await axiosInstance.patch(`/income-vouchers/${editVoucher.id}`, payload);
      await fetchIncomeVouchers();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Income voucher updated successfully!',
        confirmButtonColor: '#3daaaa',
      }).then(() => {
        setShowEditModal(false);
      });
    } catch (error) {
      console.error("Error updating voucher:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || "Failed to update voucher.",
        confirmButtonColor: '#3daaaa',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const confirmDelete = async () => {
    if (!deleteVoucher) return;
    try {
      await axiosInstance.delete(`/income-vouchers/${deleteVoucher.id}`);
      await fetchIncomeVouchers();
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Income voucher has been deleted.',
        confirmButtonColor: '#3daaaa',
      }).then(() => {
        setShowDeleteModal(false);
      });
    } catch (error) {
      console.error("Error deleting voucher:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || "Failed to delete voucher.",
        confirmButtonColor: '#3daaaa',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (voucher) => {
    setSelectedVoucher(voucher);
    setShowViewModal(true);
  };

  const handleEdit = (voucher) => {
    setEditVoucher(voucher);
    setShowEditModal(true);
  };

  const handleDelete = (voucher) => {
    setDeleteVoucher(voucher);
    setShowDeleteModal(true);
  };

  const filteredVouchers = incomeVouchers.filter(voucher => {
    return (
      (!filters.accountName || voucher.receivedFrom.toLowerCase().includes(filters.accountName.toLowerCase())) &&
      (!filters.receiptNo ||
        (voucher.autoReceiptNo && voucher.autoReceiptNo.toLowerCase().includes(filters.receiptNo.toLowerCase())) ||
        (voucher.manualReceiptNo && voucher.manualReceiptNo.toLowerCase().includes(filters.receiptNo.toLowerCase()))) &&
      (!filters.depositedTo || voucher.depositedTo === filters.depositedTo)
    );
  });

  return (
    <div className="bg-light p-4 mt-1 product-header">
      {/* Header */}
      <div className="d-flex justify-content-between gap-4 mb-4">
        <div>
          <h5 className="fw-bold mb-1">Income Voucher</h5>
          <p className="text-muted mb-0">Manage your income receipts</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-light border text-danger"><FaFilePdf /></button>
          <button className="btn btn-light border text-success"><FaFileExcel /></button>
          <button
            className="btn text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: "#3daaaa" }}
            onClick={() => setShowCreateModal(true)}
            disabled={fetching}
          >
            <FaPlusCircle /> Create Income Voucher
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded shadow-sm mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Receipt No</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Receipt No..."
              value={filters.receiptNo}
              onChange={(e) => setFilters({ ...filters, receiptNo: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Account</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Account..."
              value={filters.accountName}
              onChange={(e) => setFilters({ ...filters, accountName: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Deposited To</label>
            <select
              className="form-select"
              value={filters.depositedTo}
              onChange={(e) => setFilters({ ...filters, depositedTo: e.target.value })}
            >
              <option value="">All</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.account_name}>
                  {acc.account_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {fetching ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading income vouchers...</p>
        </div>
      ) : (
        <>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
            <Tab eventKey="direct" title="All Income Vouchers">
              <div className="table-responsive">
                {filteredVouchers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No income vouchers found.</p>
                  </div>
                ) : (
                  <table className="table table-bordered text-center align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>DATE</th>
                        <th>AUTO RECEIPT NO</th>
                        <th>MANUAL RECEIPT NO</th>
                        <th>DEPOSITED TO</th>
                        <th>RECEIVED FROM</th>
                        <th>TOTAL AMOUNT</th>
                        <th>NARRATION</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVouchers.map((voucher) => (
                        <tr key={voucher.id}>
                          <td>{voucher.date}</td>
                          <td>{voucher.autoReceiptNo}</td>
                          <td>{voucher.manualReceiptNo}</td>
                          <td>{voucher.depositedTo}</td>
                          <td>
                            {voucher.items.map((item, index) => (
                              <div key={index}>{item.account}</div>
                            ))}
                          </td>
                          <td>{voucher.totalAmount}</td>
                          <td>{voucher.narration}</td>
                          <td><span className={getStatusBadge(voucher.status)}>{voucher.status}</span></td>
                          <td className="d-flex gap-2 justify-content-center">
                            <button
                              className="btn btn-sm text-info"
                              onClick={() => handleView(voucher)}
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-sm text-warning"
                              onClick={() => handleEdit(voucher)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm text-danger"
                              onClick={() => handleDelete(voucher)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Tab>
          </Tabs>

          <div className="d-flex justify-content-between align-items-center mt-3 px-3">
            <span className="small text-muted">
              Showing 1 to {filteredVouchers.length} of {incomeVouchers.length} results
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled"><button className="page-link">&laquo;</button></li>
                <li className="page-item active"><button className="page-link" style={{ backgroundColor: '#3daaaa' }}>1</button></li>
                <li className="page-item"><button className="page-link">2</button></li>
                <li className="page-item"><button className="page-link">&raquo;</button></li>
              </ul>
            </nav>
          </div>
        </>
      )}

      {/* CREATE MODAL */}
      <div className={`modal fade ${showCreateModal ? 'show' : ''}`} 
           style={{ display: showCreateModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
           tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Create Income Voucher</h5>
              <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Auto Receipt No</label>
                    <input type="text" className="form-control" value={autoReceiptNo} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Manual Receipt No</label>
                    <input
                      type="text"
                      className="form-control"
                      value={manualReceiptNo}
                      onChange={(e) => setManualReceiptNo(e.target.value)}
                      placeholder="Enter manual receipt number"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Voucher Date</label>
                    <input type="date" className="form-control" name="voucherDate" defaultValue={new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Deposited To</label>
                    <select className="form-select" name="depositedTo" required>
                      <option value="">Select Account</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.account_name}>
                          {acc.account_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Received From</label>
                    <select className="form-select" value={receivedFromId} onChange={handleReceivedFromChange}>
                      <option value="">Select Customer</option>
                      {customers.map(cust => (
                        <option key={cust.id} value={cust.id}>
                          {cust.name_english || cust.account_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Income Account</th>
                        <th>Amount</th>
                        <th>Narration</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={row.account}
                              onChange={(e) => handleRowChange(row.id, 'account', e.target.value)}
                              placeholder="e.g., Sales Revenue"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={row.amount}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*\.?\d*$/.test(val) || val === "") {
                                  handleRowChange(row.id, 'amount', val);
                                }
                              }}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Row narration"
                              value={row.narration}
                              onChange={(e) => handleRowChange(row.id, 'narration', e.target.value)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteRow(row.id)}
                              disabled={tableRows.length <= 1}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="text-end fw-bold">Total: {calculateTotal()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleAddRow}>+ Add Row</button>
                  <div className="form-check d-flex align-items-center gap-2 mb-0">
                    <input
                      className="form-check-input mb-0"
                      type="checkbox"
                      id="showNarrationCheck"
                      checked={showNarration}
                      onChange={(e) => setShowNarration(e.target.checked)}
                    />
                    <label className="form-check-label fw-semibold mb-0" htmlFor="showNarrationCheck">Add Voucher Narration</label>
                  </div>
                </div>

                {showNarration && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Narration</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={narration}
                      onChange={(e) => setNarration(e.target.value)}
                      placeholder="Enter narration for this income voucher..."
                    ></textarea>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="submit"
                    className="btn"
                    style={{ backgroundColor: "#3daaaa", color: "white" }}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      <div className={`modal fade ${showViewModal ? 'show' : ''}`} 
           style={{ display: showViewModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
           tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Income Voucher Details</h5>
              <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
            </div>
            <div className="modal-body">
              {selectedVoucher && (
                <div>
                  <table className="table table-bordered">
                    <tbody>
                      <tr><td><strong>Date</strong></td><td>{selectedVoucher.date}</td></tr>
                      <tr><td><strong>Auto Receipt No</strong></td><td>{selectedVoucher.autoReceiptNo}</td></tr>
                      <tr><td><strong>Manual Receipt No</strong></td><td>{selectedVoucher.manualReceiptNo}</td></tr>
                      <tr><td><strong>Deposited To</strong></td><td>{selectedVoucher.depositedTo}</td></tr>
                      <tr><td><strong>Status</strong></td><td><span className={getStatusBadge(selectedVoucher.status)}>{selectedVoucher.status}</span></td></tr>
                      <tr><td><strong>Total Amount</strong></td><td>{selectedVoucher.totalAmount}</td></tr>
                      <tr><td><strong>Narration</strong></td><td>{selectedVoucher.narration}</td></tr>
                    </tbody>
                  </table>
                  <h6 className="mt-4 mb-3">Income Account Details</h6>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Income Account</th>
                        <th>Amount</th>
                        <th>Narration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVoucher.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.account}</td>
                          <td>{item.amount}</td>
                          <td>{item.narration || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <div className={`modal fade ${showEditModal ? 'show' : ''}`} 
           style={{ display: showEditModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
           tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Edit Income Voucher</h5>
              <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
            </div>
            <div className="modal-body">
              {editVoucher && (
                <form onSubmit={handleEditSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <input type="text" className="form-control" name="autoReceiptNo" defaultValue={editVoucher.autoReceiptNo} readOnly />
                    </div>
                    <div className="col-md-6">
                      <input type="text" className="form-control" name="manualReceiptNo" defaultValue={editVoucher.manualReceiptNo || ""} />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <input type="date" className="form-control" name="voucherDate" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="col-md-6">
                      <select className="form-select" name="depositedTo" defaultValue={editVoucher.depositedTo}>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.account_name}>{acc.account_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <input type="text" className="form-control" defaultValue={editVoucher.receivedFrom} readOnly />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <input type="text" className="form-control" defaultValue={editVoucher.items.map(i => i.account).join(', ')} readOnly />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <input type="text" className="form-control" defaultValue={editVoucher.totalAmount} readOnly />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <textarea className="form-control" rows="3" defaultValue={editVoucher.narration} name="narration"></textarea>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <select className="form-select" name="status" defaultValue={editVoucher.status.toLowerCase()}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 mt-4">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                    <button type="submit" className="btn" style={{ backgroundColor: "#3daaaa", color: "white" }} disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} 
           style={{ display: showDeleteModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
           tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 16 }}>
            <div className="modal-body text-center py-4">
              <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaTrash size={32} color="#F04438" />
              </div>
              <h4 className="fw-bold mb-2">Delete Income Voucher</h4>
              <p className="mb-4" style={{ color: "#555" }}>Are you sure you want to delete this income voucher?</p>
              <div className="d-flex justify-content-center gap-3">
                <button className="btn btn-dark" onClick={() => setShowDeleteModal(false)}>No, Cancel</button>
                <button
                  className="btn"
                  style={{ background: "#3daaaa", color: "#fff", fontWeight: 600 }}
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Info */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>Create and manage income vouchers for various revenue sources.</li>
            <li>Each voucher has both auto-generated and manual receipt numbers for tracking.</li>
            <li>Helps maintain accurate financial records and income tracking.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Income;