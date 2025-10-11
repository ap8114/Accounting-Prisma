import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function JournalEntries() {
  // State for form data
  const [voucherNo, setVoucherNo] = useState('VCH-001');
  const [manualVoucherNo, setManualVoucherNo] = useState('');
  const [voucherDate, setVoucherDate] = useState('2023-03-29');
  
  // State for journal entries
  const [entries, setEntries] = useState([]);
  
  // State for narration
  const [narration, setNarration] = useState('');
  
  // State for document upload
  const [document, setDocument] = useState(null);
  
  // State for all journal entries (table data)
  const [allJournalEntries, setAllJournalEntries] = useState([]);
  
  // State for viewing a journal entry
  const [viewJournal, setViewJournal] = useState(null);
  
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    autoVoucherNo: '',
    manualVoucherNo: '',
    minDebit: '',
    minCredit: ''
  });
  
  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);
  
  // State for update
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [journalToUpdate, setJournalToUpdate] = useState(null);
  
  // Sample data for dropdowns
  const accountOptions = [
    { id: 1, name: 'Cash' },
    { id: 2, name: 'Bank' },
    { id: 3, name: 'Sales' },
    { id: 4, name: 'Purchase' },
    { id: 5, name: 'Salary Expense' },
    { id: 6, name: 'Rent Expense' },
    { id: 7, name: 'Accounts Receivable' },
    { id: 8, name: 'Accounts Payable' }
  ];
  
  // Function to add a new entry when an account is selected
  const handleAccountSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    
    const account = accountOptions.find(opt => opt.id.toString() === selectedId);
    if (!account) return;
    
    const newEntry = {
      id: entries.length + 1,
      accountName: account.name,
      debitAmount: '',
      creditAmount: '',
      narrationText: ''
    };
    
    setEntries([...entries, newEntry]);
    // Reset the select dropdown
    e.target.value = '';
  };
  
  // Function to update entry field
  const updateEntryField = (id, field, value) => {
    setEntries(entries.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };
        
        if (field === 'debitAmount' && value) {
          updatedEntry.creditAmount = '';
        } else if (field === 'creditAmount' && value) {
          updatedEntry.debitAmount = '';
        }
        
        return updatedEntry;
      }
      return entry;
    }));
  };
  
  // Function to calculate total debit and credit
  const calculateTotals = () => {
    const totalDebit = entries.reduce((total, entry) => {
      return total + (parseFloat(entry.debitAmount) || 0);
    }, 0);
    
    const totalCredit = entries.reduce((total, entry) => {
      return total + (parseFloat(entry.creditAmount) || 0);
    }, 0);
    
    return {
      totalDebit: totalDebit.toFixed(2),
      totalCredit: totalCredit.toFixed(2)
    };
  };
  
  // Function to handle document upload
  const handleDocumentUpload = (e) => {
    setDocument(e.target.files[0]);
  };
  
  // Function to remove an entry
  const removeEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };
  
  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isUpdateMode && journalToUpdate) {
      // Update existing journal entry
      const updatedJournalEntry = {
        ...journalToUpdate,
        voucherNo,
        manualVoucherNo,
        voucherDate,
        entries: [...entries],
        narration,
        document: document ? document.name : journalToUpdate.document,
        totals: calculateTotals(),
        timestamp: new Date().toLocaleString()
      };
      
      setAllJournalEntries(allJournalEntries.map(journal => 
        journal.id === journalToUpdate.id ? updatedJournalEntry : journal
      ));
      setIsUpdateMode(false);
      setJournalToUpdate(null);
    } else {
      // Create new journal entry
      const newJournalEntry = {
        id: allJournalEntries.length + 1,
        voucherNo,
        manualVoucherNo,
        voucherDate,
        entries: [...entries],
        narration,
        document: document ? document.name : null,
        totals: calculateTotals(),
        timestamp: new Date().toLocaleString()
      };
      
      setAllJournalEntries([newJournalEntry, ...allJournalEntries]);
    }
    
    setShowModal(false);
    resetForm();
  };
  
  // Function to reset form
  const resetForm = () => {
    setVoucherNo('VCH-001');
    setManualVoucherNo('');
    setVoucherDate('2023-03-29');
    setEntries([]);
    setNarration('');
    setDocument(null);
    setIsUpdateMode(false);
    setJournalToUpdate(null);
  };
  
  // Function to handle update
  const handleUpdate = (journal) => {
    setJournalToUpdate(journal);
    setIsUpdateMode(true);
    setShowModal(true);
    setVoucherNo(journal.voucherNo);
    setManualVoucherNo(journal.manualVoucherNo);
    setVoucherDate(journal.voucherDate);
    setEntries([...journal.entries]);
    setNarration(journal.narration || '');
    // Note: We can't set the actual file, just the name
    setDocument(journal.document ? { name: journal.document } : null);
  };
  
  // Function to handle delete
  const handleDelete = (journal) => {
    setJournalToDelete(journal);
    setShowDeleteModal(true);
  };
  
  // Function to confirm delete
  const confirmDelete = () => {
    setAllJournalEntries(allJournalEntries.filter(entry => entry.id !== journalToDelete.id));
    setShowDeleteModal(false);
    setJournalToDelete(null);
  };
  
  // Filter journal entries based on filter criteria
  const filteredJournalEntries = allJournalEntries.filter(journal => {
    const journalDate = new Date(journal.voucherDate);
    const from = filters.fromDate ? new Date(filters.fromDate) : null;
    const to = filters.toDate ? new Date(filters.toDate) : null;
    
    // Date filter
    if (from && journalDate < from) return false;
    if (to && journalDate > new Date(to.getTime() + 86400000)) return false;
    
    // Auto Voucher No filter
    if (filters.autoVoucherNo && !journal.voucherNo.toLowerCase().includes(filters.autoVoucherNo.toLowerCase())) {
      return false;
    }
    
    // Manual Voucher No filter
    if (filters.manualVoucherNo && journal.manualVoucherNo && 
        !journal.manualVoucherNo.toLowerCase().includes(filters.manualVoucherNo.toLowerCase())) {
      return false;
    }
    
    // Min Debit filter
    if (filters.minDebit && parseFloat(journal.totals.totalDebit) < parseFloat(filters.minDebit)) {
      return false;
    }
    
    // Min Credit filter
    if (filters.minCredit && parseFloat(journal.totals.totalCredit) < parseFloat(filters.minCredit)) {
      return false;
    }
    
    return true;
  });
  
  const totals = calculateTotals();
  
  return (
    <div className="container mt-4">
      {/* Page Title */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark">Journal Entries</h3>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
          style={{
            backgroundColor: "#53b2a5",
            border: "none",
            padding: "8px 16px",
          }}
        >
          + Add Journal Entry
        </button>
      </div>
      
      {/* Filters */}
      <div className="card mb-2">
        <div className="card-body">
          <h5>Filter Journal Entries</h5>
          <div className="row g-3">
            <div className="col-md-2">
              <label>From Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label>To Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label>Auto Voucher No</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by auto voucher..."
                value={filters.autoVoucherNo}
                onChange={(e) => setFilters({ ...filters, autoVoucherNo: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label>Manual Voucher No</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by manual voucher..."
                value={filters.manualVoucherNo}
                onChange={(e) => setFilters({ ...filters, manualVoucherNo: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label>Min Debit</label>
              <input
                type="number"
                className="form-control"
                placeholder="Min debit amount"
                value={filters.minDebit}
                onChange={(e) => setFilters({ ...filters, minDebit: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label>Min Credit</label>
              <input
                type="number"
                className="form-control"
                placeholder="Min credit amount"
                value={filters.minCredit}
                onChange={(e) => setFilters({ ...filters, minCredit: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Journal Entries Table */}
      <div className="card">
        <div className="card-body">
          {allJournalEntries.length === 0 ? (
            <p className="text-center text-muted">No journal entries yet. Click "Add Journal Entry" to create one.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="thead-light">
                  <tr>
                    <th>Auto Voucher No</th>
                    <th>Manual Voucher No</th>
                    <th>Date</th>
                    <th>Total Debit</th>
                    <th>Total Credit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJournalEntries.map(journal => (
                    <tr key={journal.id}>
                      <td>{journal.voucherNo}</td>
                      <td>{journal.manualVoucherNo || '-'}</td>
                      <td>{journal.voucherDate}</td>
                      <td>₹{journal.totals.totalDebit}</td>
                      <td>₹{journal.totals.totalCredit}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#53b2a5",
                              borderColor: "#53b2a5",
                              color: "white",
                              width: "36px",
                              height: "36px",
                            }}
                            onClick={() => setViewJournal(journal)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#ffc107",
                              borderColor: "#ffc107",
                              color: "white",
                              width: "36px",
                              height: "36px",
                            }}
                            onClick={() => handleUpdate(journal)}
                            title="Update"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "#dc3545",
                              borderColor: "#dc3545",
                              color: "white",
                              width: "36px",
                              height: "36px",
                            }}
                            onClick={() => handleDelete(journal)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal for Add/Update Journal Entry */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isUpdateMode ? 'Update Journal Entry' : 'New Journal Entry'}</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="card-header text-dark">
                  <h4 className="mb-2">Journal Entries</h4>
                </div>
                <div className="card">
                  <div className="card-body">
                    <div className="row mb-4">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="voucherNo">Voucher No (Auto)</label>
                          <input
                            type="text"
                            className="form-control"
                            id="voucherNo"
                            value={voucherNo}
                            onChange={(e) => setVoucherNo(e.target.value)}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="manualVoucherNo">Voucher No (Manual)</label>
                          <input
                            type="text"
                            className="form-control"
                            id="manualVoucherNo"
                            placeholder="Enter manual voucher no"
                            value={manualVoucherNo}
                            onChange={(e) => setManualVoucherNo(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="voucherDate">Voucher Date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="voucherDate"
                            value={voucherDate}
                            onChange={(e) => setVoucherDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="row mb-4">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label htmlFor="accountSelect">Select Account</label>
                          <select
                            className="form-control"
                            id="accountSelect"
                            onChange={handleAccountSelect}
                          >
                            <option value="">-- Select an Account --</option>
                            {accountOptions.map(account => (
                              <option key={account.id} value={account.id}>
                                {account.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="table-responsive">
                      <table className="table table-bordered table-striped">
                        <thead className="thead-light">
                          <tr>
                            <th>Account</th>
                            <th>Debit Amount</th>
                            <th>Credit Amount</th>
                            <th>Narration</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.length > 0 ? (
                            entries.map((entry) => (
                              <tr key={entry.id}>
                                <td>
                                  <div>{entry.accountName}</div>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={entry.debitAmount}
                                    onChange={(e) =>
                                      updateEntryField(entry.id, 'debitAmount', e.target.value)
                                    }
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={entry.creditAmount}
                                    onChange={(e) =>
                                      updateEntryField(entry.id, 'creditAmount', e.target.value)
                                    }
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td>
                                  <textarea
                                    className="form-control"
                                    rows="1"
                                    value={entry.narrationText || ''}
                                    onChange={(e) =>
                                      updateEntryField(entry.id, 'narrationText', e.target.value)
                                    }
                                    placeholder="Enter narration..."
                                  />
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => removeEntry(entry.id)}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center">
                                No entries added yet. Select an account above to add it to the table.
                              </td>
                            </tr>
                          )}
                          <tr className="table-active">
                            <td>
                              <strong>Total</strong>
                            </td>
                            <td>
                              <strong>₹{totals.totalDebit}</strong>
                            </td>
                            <td>
                              <strong>₹{totals.totalCredit}</strong>
                            </td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="row mb-4">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label htmlFor="narration">Narration</label>
                          <textarea
                            className="form-control"
                            id="narration"
                            rows="3"
                            value={narration}
                            onChange={(e) => setNarration(e.target.value)}
                            placeholder="Enter narration details..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row mb-4">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label htmlFor="documentUpload">Upload Document</label>
                          <input
                            type="file"
                            className="form-control-file"
                            id="documentUpload"
                            onChange={handleDocumentUpload}
                          />
                          {document && (
                            <div className="mt-2">
                              <span className="text-success">Selected file: {document.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="row mt-4">
                      <div className="col-md-6">
                      </div>
                      <div className="col-md-6 text-right">
                        <button className="btn btn-success" onClick={handleSubmit}>
                          {isUpdateMode ? 'Update Journal Entry' : 'Submit Journal Entry'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Journal Entry Modal */}
      {viewJournal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Journal Entry Details</h5>
                <button type="button" className="close" onClick={() => setViewJournal(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label><strong>Auto Voucher No</strong></label>
                    <p>{viewJournal.voucherNo}</p>
                  </div>
                  <div className="col-md-4">
                    <label><strong>Manual Voucher No</strong></label>
                    <p>{viewJournal.manualVoucherNo || '-'}</p>
                  </div>
                  <div className="col-md-4">
                    <label><strong>Date</strong></label>
                    <p>{viewJournal.voucherDate}</p>
                  </div>
                </div>
                
                {/* Entries Table */}
                <div className="table-responsive mb-4">
                  <table className="table table-bordered">
                    <thead className="thead-light">
                      <tr>
                        <th>Account</th>
                        <th>Debit Amount</th>
                        <th>Credit Amount</th>
                        <th>Narration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewJournal.entries.map(entry => (
                        <tr key={entry.id}>
                          <td>{entry.accountName}</td>
                          <td>₹{entry.debitAmount || '0.00'}</td>
                          <td>₹{entry.creditAmount || '0.00'}</td>
                          <td>{entry.narrationText || '-'}</td>
                        </tr>
                      ))}
                      <tr className="table-active">
                        <td><strong>Total</strong></td>
                        <td><strong>₹{viewJournal.totals.totalDebit}</strong></td>
                        <td><strong>₹{viewJournal.totals.totalCredit}</strong></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Additional Narration */}
                {viewJournal.narration && (
                  <div className="form-group mb-3">
                    <label><strong>Additional Narration</strong></label>
                    <p className="border p-2 bg-light rounded">{viewJournal.narration}</p>
                  </div>
                )}
                
                {/* Document */}
                {viewJournal.document && (
                  <div className="form-group mb-3">
                    <label><strong>Attached Document</strong></label>
                    <p className="border p-2 bg-light rounded">{viewJournal.document}</p>
                  </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Created: </strong> {viewJournal.timestamp}
                  </div>
                  <button className="btn btn-secondary" onClick={() => setViewJournal(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="close" onClick={() => setShowDeleteModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this journal entry?</p>
                <p><strong>Voucher No:</strong> {journalToDelete?.voucherNo}</p>
                <p><strong>Date:</strong> {journalToDelete?.voucherDate}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalEntries;