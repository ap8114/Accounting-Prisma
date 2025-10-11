import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProfitLoss = () => {
  const [detailedView, setDetailedView] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  
  const profitLossData = [
    { 
      id: 1,
      particulars: 'Sales', 
      debit: 0, 
      credit: 280000,
      type: 'income',
      details: [
        { date: '2025-01-05', description: 'Product Sales', amount: 150000 },
        { date: '2025-01-15', description: 'Service Revenue', amount: 80000 },
        { date: '2025-02-10', description: 'Online Sales', amount: 50000 }
      ]
    },
    { 
      id: 2,
      particulars: 'Cost of Goods Sold', 
      debit: 120000, 
      credit: 0,
      type: 'expense',
      details: [
        { date: '2025-01-08', description: 'Raw Materials', amount: 70000 },
        { date: '2025-01-20', description: 'Direct Labor', amount: 30000 },
        { date: '2025-02-05', description: 'Manufacturing Overhead', amount: 20000 }
      ]
    },
    { 
      id: 3,
      particulars: 'Gross Profit', 
      debit: 0, 
      credit: 160000,
      type: 'summary'
    },
    { 
      id: 4,
      particulars: 'Operating Expenses', 
      debit: 0, 
      credit: 0,
      type: 'header'
    },
    { 
      id: 5,
      particulars: 'Salaries', 
      debit: 30000, 
      credit: 0,
      type: 'expense',
      details: [
        { date: '2025-01-01', description: 'Staff Salaries', amount: 20000 },
        { date: '2025-02-01', description: 'Management Salaries', amount: 10000 }
      ]
    },
    { 
      id: 6,
      particulars: 'Rent', 
      debit: 15000, 
      credit: 0,
      type: 'expense',
      details: [
        { date: '2025-01-01', description: 'Office Rent', amount: 15000 }
      ]
    },
    { 
      id: 7,
      particulars: 'Utilities', 
      debit: 5000, 
      credit: 0,
      type: 'expense',
      details: [
        { date: '2025-01-10', description: 'Electricity', amount: 3000 },
        { date: '2025-01-25', description: 'Water', amount: 1000 },
        { date: '2025-02-15', description: 'Internet', amount: 1000 }
      ]
    },
    { 
      id: 8,
      particulars: 'Marketing', 
      debit: 10000, 
      credit: 0,
      type: 'expense',
      details: [
        { date: '2025-01-12', description: 'Online Ads', amount: 5000 },
        { date: '2025-01-28', description: 'Print Media', amount: 3000 },
        { date: '2025-02-20', description: 'Social Media Campaign', amount: 2000 }
      ]
    },
    { 
      id: 9,
      particulars: 'Total Operating Expenses', 
      debit: 60000, 
      credit: 0,
      type: 'summary'
    },
    { 
      id: 10,
      particulars: 'Operating Income', 
      debit: 0, 
      credit: 100000,
      type: 'summary'
    },
    { 
      id: 11,
      particulars: 'Other Income', 
      debit: 0, 
      credit: 0,
      type: 'header'
    },
    { 
      id: 12,
      particulars: 'Interest Income', 
      debit: 0, 
      credit: 2000,
      type: 'income',
      details: [
        { date: '2025-01-31', description: 'Bank Interest', amount: 2000 }
      ]
    },
    { 
      id: 13,
      particulars: 'Other Expenses', 
      debit: 0, 
      credit: 0,
      type: 'header'
    },
    { 
      id: 14,
      particulars: 'Interest Expense', 
      debit: 2000, 
      credit: 0,
      type: 'expense',
      details: [
        { date: '2025-01-15', description: 'Loan Interest', amount: 2000 }
      ]
    },
    { 
      id: 15,
      particulars: 'Depreciation', 
      debit: 8000, 
      credit: 0,
      type: 'expense',
      details: [
        { date: '2025-01-31', description: 'Equipment Depreciation', amount: 5000 },
        { date: '2025-02-28', description: 'Vehicle Depreciation', amount: 3000 }
      ]
    },
    { 
      id: 16,
      particulars: 'Net Profit Before Tax', 
      debit: 0, 
      credit: 92000,
      type: 'summary'
    },
    { 
      id: 17,
      particulars: 'Income Tax Expense', 
      debit: 18400, 
      credit: 0,
      type: 'expense',
      details: [
        { date: '2025-03-15', description: 'Quarterly Tax Payment', amount: 18400 }
      ]
    },
    { 
      id: 18,
      particulars: 'Net Profit', 
      debit: 0, 
      credit: 73600,
      type: 'summary'
    }
  ];
  
  // Get month name from number
  const getMonthName = (monthNum) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNum) - 1];
  };
  
  const toggleDetailedView = () => {
    setDetailedView(!detailedView);
  };
  
  const handleAccountClick = (account) => {
    if (account.type !== 'header' && account.type !== 'summary') {
      setSelectedAccount(account);
      // Reset date filters when opening a new account
      setFilterFromDate('');
      setFilterToDate('');
    }
  };
  
  const closeModal = () => {
    setSelectedAccount(null);
  };
  
  // Filter details by selected date range
  const filterDetailsByDateRange = (details) => {
    if (!details) return [];
    
    return details.filter(detail => {
      const detailDate = new Date(detail.date);
      const from = filterFromDate ? new Date(filterFromDate) : null;
      const to = filterToDate ? new Date(filterToDate) : null;
      
      if (from && to) {
        return detailDate >= from && detailDate <= to;
      } else if (from) {
        return detailDate >= from;
      } else if (to) {
        return detailDate <= to;
      }
      return true; // No filter applied
    });
  };
  
  // Calculate total amount for filtered details
  const calculateTotal = (details) => {
    return details.reduce((sum, detail) => sum + detail.amount, 0);
  };
  return (
    <div className="container mt-4 profit-loss-container">
      <div className="card">
        <div className="card-header text-dark">
  <div className="d-flex flex-wrap justify-content-between align-items-center">
    <div className="mb-2 mb-md-0">
      <h4 className="mb-0">Profit & Loss Statement</h4>
      <p className="mb-0">January 1, 2025 - August 20, 2025</p>
    </div>
    <div className="d-flex flex-wrap align-items-center gap-2">
      <div className="mr-3">
        <label className="mr-2 mb-0">Year:</label>
        <select 
          className="form-control form-control-sm d-inline-block" 
          style={{width: 'auto'}}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>
      <div className="mr-3">
        <label className="mr-2 mb-0">Month:</label>
        <select 
          className="form-control form-control-sm d-inline-block" 
          style={{width: 'auto'}}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>
      <div className="mt-2 mt-md-0">
        <button className="btn btn-light w-100 w-md-auto" onClick={toggleDetailedView}>
          {detailedView ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
    </div>
  </div>
</div>

        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <thead className="thead-light">
                <tr>
                  <th className="particulars-col">ACCOUNT</th>
                  <th className="amount-col">DEBIT</th>
                  <th className="amount-col">CREDIT</th>
                </tr>
              </thead>
              <tbody>
                {profitLossData.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`${item.type === 'header' ? 'table-header' : ''} ${item.type === 'summary' ? 'summary-row fw-bold bg-light' : ''} ${item.type !== 'header' && item.type !== 'summary' ? 'clickable-row' : ''}`}
                    onClick={() => handleAccountClick(item)}
                  >
                    <td className={item.type === 'header' ? 'fw-bold' : ''}>
                      {item.type !== 'header' && item.type !== 'summary' ? (
                        <a href="#" className="text-primary text-decoration-none" onClick={(e) => {
                          e.preventDefault();
                          handleAccountClick(item);
                        }}>
                          {item.particulars}
                        </a>
                      ) : item.particulars}
                    </td>
                    <td className="text-right">{item.debit > 0 ? item.debit.toFixed(2) : ''}</td>
                    <td className="text-right">{item.credit > 0 ? item.credit.toFixed(2) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card-footer text-center">
          <div className="mt-3 text-info">
            <p className="mb-0">Click on any account to view detailed transactions</p>
          </div>
        </div>
      </div>
      
      {detailedView && (
        <div className="card mt-4">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">Detailed Transactions for {getMonthName(selectedMonth)} {selectedYear}</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="thead-light">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {profitLossData.flatMap(item => 
                    item.details ? item.details.map((detail, index) => (
                      <tr key={`${item.id}-${index}`}>
                        <td>{detail.date}</td>
                        <td>{detail.description}</td>
                        <td className="text-right">{detail.amount.toFixed(2)}</td>
                      </tr>
                    )) : []
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Account Details Modal */}
      {selectedAccount && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header  text-dark">
                <h5 className="modal-title">
                  <a href="#" className="text-dark text-decoration-none">
                    {selectedAccount.particulars}
                  </a> - Detailed Transactions
                </h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {/* Account Summary Card */}
                <div className="card mb-4 bg-light">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <h6 className="fw-bold">Account Type</h6>
                        <p className="mb-0">{selectedAccount.type}</p>
                      </div>
                      <div className="col-md-4">
                        <h6 className="fw-bold">Total Amount</h6>
                        <p className="mb-0 fs-5">
                          {selectedAccount.type === 'income' ? '+' : '-'}
                          {calculateTotal(selectedAccount.details || []).toFixed(2)}
                        </p>
                      </div>
                      <div className="col-md-4">
                        <h6 className="fw-bold">Transaction Count</h6>
                        <p className="mb-0">{selectedAccount.details ? selectedAccount.details.length : 0}</p>
                      </div>
                    </div>
                    
                    {/* Additional Account Information */}
                    <div className="row mt-3">
                      <div className="col-md-4">
                        <h6 className="fw-bold">Debit Amount</h6>
                        <p className="mb-0">{selectedAccount.debit > 0 ? selectedAccount.debit.toFixed(2) : '0.00'}</p>
                      </div>
                      <div className="col-md-4">
                        <h6 className="fw-bold">Credit Amount</h6>
                        <p className="mb-0">{selectedAccount.credit > 0 ? selectedAccount.credit.toFixed(2) : '0.00'}</p>
                      </div>
                      <div className="col-md-4">
                        <h6 className="fw-bold">Account Balance</h6>
                        <p className="mb-0">
                          {selectedAccount.credit - selectedAccount.debit > 0 ? '+' : ''}
                          {(selectedAccount.credit - selectedAccount.debit).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Date Filter */}
                <div className="row mb-3">
                  <div className="col-md-5">
                    <label className="form-label">From Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={filterFromDate}
                      onChange={(e) => setFilterFromDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">To Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={filterToDate}
                      onChange={(e) => setFilterToDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button 
                      className="btn btn-sm btn-secondary w-100" 
                      onClick={() => {
                        setFilterFromDate('');
                        setFilterToDate('');
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {/* Transaction Details Table */}
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="thead-light">
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAccount.details && selectedAccount.details.length > 0 ? (
                        filterDetailsByDateRange(selectedAccount.details).map((detail, index) => (
                          <tr key={index}>
                            <td>{detail.date}</td>
                            <td>{detail.description}</td>
                            <td className="text-right">{detail.amount.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center">No transactions available</td>
                        </tr>
                      )}
                    </tbody>
                    {selectedAccount.details && selectedAccount.details.length > 0 && (
                      <tfoot className="table-light fw-bold">
                        <tr>
                          <td colSpan="2" className="text-end">Total:</td>
                          <td className="text-right">
                            {calculateTotal(filterDetailsByDateRange(selectedAccount.details)).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLoss;