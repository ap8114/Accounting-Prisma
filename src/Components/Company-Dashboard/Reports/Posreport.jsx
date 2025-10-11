import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card } from "react-bootstrap";


const PosReport = () => {
  const posSummary = {
    totalInvoices: 2,
    totalAmount: 300,
    totalGST: 30
    // Shift removed
  };

  const posData = [
    {
      invoice: 'INV001',
      product: 'Product A',
      amount: 100,
      gstRate: 10,
      paymentType: 'Cash',
      time: '10:15 AM'
      // Shift removed
    },
    {
      invoice: 'INV002',
      product: 'Product B',
      amount: 200,
      gstRate: 10,
      paymentType: 'UPI',
      time: '11:00 AM'
      // Shift removed
    }
  ];

  return (
    <div className="container my-4">
      <div className="mb-4">
        <h4 className="fw-bold">POS Report</h4>
        <p className="text-muted">Daily invoice transactions summary</p>
      </div>

      {/* Summary Boxes */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Invoices', value: posSummary.totalInvoices, border: 'info' },
          { label: 'Total Amount', value: `₹${posSummary.totalAmount}`, border: 'success' },
          { label: 'Total GST', value: `₹${posSummary.totalGST}`, border: 'warning' }
          // Shift box removed
        ].map((item, idx) => (
          <div className="col-12 col-md-4" key={idx}> {/* Updated col size for 3 items */}
            <div className={`shadow-sm rounded p-3 bg-white border border-${item.border} d-flex align-items-center justify-content-between`}>
              <div>
                <small className="text-muted">{item.label}</small>
                <h5 className="fw-bold">{item.value}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="fw-bold mb-0">Transaction Details</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-light">Export PDF</button>
            <button className="btn btn-light">Export Excel</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Invoice No</th>
                <th>Product</th>
                <th>Payment Type</th>
                <th>Time</th>
                <th>Amount (₹)</th>
                <th>GST (₹)</th>
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {posData.map((item, idx) => {
                const gstAmount = (item.amount * item.gstRate) / 100;
                const totalAmount = item.amount + gstAmount;

                return (
                  <tr key={idx}>
                    <td>{item.invoice}</td>
                    <td>{item.product}</td>
                    <td>{item.paymentType}</td>
                    <td>{item.time}</td>
                    <td>₹{item.amount}</td>
                    <td>₹{gstAmount.toFixed(2)}</td>
                    <td>₹{totalAmount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3 px-2">
          <span className="small text-muted">Showing {posData.length} invoices</span>
        </div>
        <Card className="mb-4 p-3 shadow rounded-4 mt-2">
  <Card.Body>
    {/* Heading */}
    <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>

    {/* Invoice Summary Bullet Points */}
    <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
      <li>Provides a detailed summary of invoices categorized by product.</li>
      <li>Includes breakdown of GST amounts applicable per item or invoice.</li>
      <li>Displays payment status and method for each invoice entry.</li>
    </ul>
  </Card.Body>
</Card>

      </div>
    </div>
  );
};

export default PosReport;