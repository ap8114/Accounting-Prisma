// LedgerPage.jsx
import React from 'react';
import { Container, Table, Button, Card } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const LedgerPageAccount= () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Receive account data from navigation state
  const { accountName, accountType } = location.state || {};

  // Mock ledger data (in real app, fetch from API)
  const mockLedgerData = [
    {
      date: "2025-01-10",
      particulars: "Opening Balance",
      vchNo: "",
      refNo: "",
      vchType: "",
      debit: 50000,
      credit: 0,
      runningBalance: 50000,
    },
    {
      date: "2025-01-15",
      particulars: "Sales to Customer A",
      vchNo: "S001",
      refNo: "REF1001",
      vchType: "Sales",
      debit: 25000,
      credit: 0,
      runningBalance: 75000,
    },
    {
      date: "2025-01-20",
      particulars: "Payment to Supplier X",
      vchNo: "P005",
      refNo: "REF1002",
      vchType: "Payment",
      debit: 0,
      credit: 15000,
      runningBalance: 60000,
    },
  ];

  if (!accountName || !accountType) {
    return (
      <Container className="py-4">
        <Card className="p-4 text-center">
          <h5 className="text-danger">Invalid Account Data</h5>
          <p>No account selected. Please go back and try again.</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Back Button */}
      <div className="mb-3">
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          className="p-0 d-flex align-items-center gap-1"
        >
          <FaArrowLeft /> Back
        </Button>
      </div>

      {/* Page Header */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4 className="fw-bold">{accountName}</h4>
          <p className="text-muted mb-0">
            <strong>Account Type:</strong> {accountType}
          </p>
        </Card.Body>
      </Card>

      {/* Ledger Table */}
      <Card>
        <Table striped hover className="mb-0 text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>DATE</th>
              <th>PARTICULARS</th>
              <th>VCH NO</th>
              <th>REF NO</th>
              <th>VCH TYPE</th>
              <th>DEBIT</th>
              <th>CREDIT</th>
              <th>RUNNING BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {/* Opening Balance */}
            <tr>
              <td colSpan="5" className="text-end fw-bold">Opening Balance</td>
              <td></td>
              <td></td>
              <td className="text-end">
                KWD{mockLedgerData[0]?.runningBalance?.toFixed(2) || "0.00"}
              </td>
            </tr>

            {/* Transactions */}
            {mockLedgerData.map((tx, index) => (
              <tr key={index}>
                <td>{tx.date}</td>
                <td className="text-start">{tx.particulars}</td>
                <td>{tx.vchNo}</td>
                <td>{tx.refNo}</td>
                <td>{tx.vchType}</td>
                <td className="text-end">{tx.debit > 0 ? `KWD${tx.debit.toFixed(2)}` : ""}</td>
                <td className="text-end">{tx.credit > 0 ? `KWD${tx.credit.toFixed(2)}` : ""}</td>
                <td className="text-end">KWD{tx.runningBalance.toFixed(2)}</td>
              </tr>
            ))}

            {/* Closing Balance */}
            <tr className="table-secondary fw-bold">
              <td colSpan="5" className="text-end">Closing Balance</td>
              <td></td>
              <td></td>
              <td className="text-end">
                KWD{mockLedgerData[mockLedgerData.length - 1]?.runningBalance?.toFixed(2) || "0.00"}
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>

      {/* Note */}
      <div className="mt-3 text-muted small">
        <p><strong>Note:</strong> This is a sample ledger. Transactions will be fetched from the backend in production.</p>
      </div>
    </Container>
  );
};

export default LedgerPageAccount;