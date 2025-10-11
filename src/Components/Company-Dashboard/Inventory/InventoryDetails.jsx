import React, { useState, useEffect } from "react";
import { Row, Col, Table, Button, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const InventoryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  // Raw sample data
  const rawData = [
    {
      date: "01/03/2025",
      vchType: "Purchase",
      particulars: "Textile Suppliers Inc.",
      vchNo: "PO1-02345",
      warehouse: "Main Location",
      rate: "0.360",
      inwardsQty: "500.00 yds",
      inwardsValue: "180.000",
      outwardsQty: "0.000",
      outwardsValue: "0.000",
      closingQty: "500.00 yds",
      description: "10 CTN",
      narration: "Bulk purchase",
      transactionType: "purchase"
    },
    {
      date: "15/03/2025",
      vchType: "Delivery Challan",
      particulars: "Atef Hassaw",
      vchNo: "DC1-05394",
      warehouse: "Main Location",
      rate: "0.360",
      inwardsQty: "0.000",
      inwardsValue: "0.000",
      outwardsQty: "150.00 yds",
      outwardsValue: "54.000",
      closingQty: "350.00 yds",
      description: "1 CTN",
      narration: "",
      transactionType: "sale"
    },
    {
      date: "20/04/2025",
      vchType: "Purchase Return",
      particulars: "Textile Suppliers Inc.",
      vchNo: "PR1-00123",
      warehouse: "Main Location",
      rate: "0.360",
      inwardsQty: "-50.00 yds",
      inwardsValue: "-18.000",
      outwardsQty: "0.000",
      outwardsValue: "0.000",
      closingQty: "300.00 yds",
      description: "1 CTN",
      narration: "Damaged goods return",
      transactionType: "return"
    },
    {
      date: "05/05/2025",
      vchType: "Sales Invoice",
      particulars: "Fashion Retail Ltd.",
      vchNo: "SI1-11234",
      warehouse: "Main Location",
      rate: "0.360",
      inwardsQty: "0.000",
      inwardsValue: "0.000",
      outwardsQty: "200.00 yds",
      outwardsValue: "72.000",
      closingQty: "100.00 yds",
      description: "2 CTN",
      narration: "Bulk order",
      transactionType: "sale"
    },
    {
      date: "10/06/2025",
      vchType: "Sales Return",
      particulars: "Fashion Retail Ltd.",
      vchNo: "SR1-00567",
      warehouse: "Main Location",
      rate: "0.360",
      inwardsQty: "30.00 yds",
      inwardsValue: "10.800",
      outwardsQty: "0.000",
      outwardsValue: "0.000",
      closingQty: "130.00 yds",
      description: "1 CTN",
      narration: "Defective items returned",
      transactionType: "return"
    }
  ];

  // Auto-generate VCH001, VCH002, etc.
  const [data] = useState(() => {
    const usedNumbers = rawData
      .map(item => {
        const match = item.vchNo?.match(/VCH(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);

    const maxUsed = usedNumbers.length > 0 ? Math.max(...usedNumbers) : 0;

    return rawData.map((item, index) => {
      const nextNumber = maxUsed + index + 1;
      const vchNoAuto = `VCH${nextNumber.toString().padStart(3, '0')}`;
      return { ...item, vchNoAuto };
    });
  });

  // Get item data from navigation state
  useEffect(() => {
    if (location.state && location.state.item) {
      setItem(location.state.item);
    } else {
      navigate('/company/inventorys');
    }
  }, [location, navigate]);

  // Filters state
  const [filters, setFilters] = useState({
    date: "",
    vchNo: "",
    vchNoAuto: "", 
    vchType: "",
    warehouse: "",
    particulars: "",
  });

  const handleSendEmail = () => {
    const subject = "Inventory Details";
    const body = `Item: ${item?.itemName}\nCurrent Stock: ${item?.quantity} ${item?.unit}\nValue: ₹${item?.value}\n\nCheck full details in the app.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredData = data.filter((item) => {
    return (
      (filters.date === "" || item.date.includes(filters.date)) &&
      (filters.vchNo === "" || 
        item.vchNo.includes(filters.vchNo)
      ) &&
      (filters.vchNoAuto === "" || 
        item.vchNoAuto.includes(filters.vchNoAuto)
      ) &&
      (filters.vchType === "" ||
        item.vchType.toLowerCase().includes(filters.vchType.toLowerCase())) &&
      (filters.warehouse === "" ||
        item.warehouse.toLowerCase().includes(filters.warehouse.toLowerCase())) &&
      (filters.particulars === "" ||
        item.particulars.toLowerCase().includes(filters.particulars.toLowerCase()))
    );
  });

  // Separate histories
  const purchaseHistory = filteredData.filter(item => item.transactionType === "purchase");
  const salesHistory = filteredData.filter(item => item.transactionType === "sale");
  const returnHistory = filteredData.filter(item => item.transactionType === "return");

  // Calculate totals
  const totalPurchases = purchaseHistory.reduce((sum, item) => sum + parseFloat(item.inwardsValue), 0);
  const totalSales = salesHistory.reduce((sum, item) => sum + parseFloat(item.outwardsValue), 0);
  const totalReturns = returnHistory.reduce((sum, item) => {
    return sum + Math.abs(parseFloat(item.inwardsValue));
  }, 0);

  if (!item) {
    return (
      <div className="flex items-center justify-center mt-[50px] w-screen">
        <div className="bg-white w-11/12 h-auto p-6 rounded-lg shadow-lg text-center">
          <p>Loading item details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className=" h-auto p-6 rounded-lg shadow-lg">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Inventory Item Details</h3>
            <p className="text-sm text-gray-600">01/01/2025 to 21/08/2025</p>
            <Button onClick={handleSendEmail} className="btn-sm">Send Email</Button>
          </div>
          <Button 
            variant="outline-secondary"                                                                    
            onClick={() => navigate('/company/inventorys')}
            className="flex items-center gap-2"
          >
            <span>&larr;</span> Back to Inventory
          </Button>
        </div>

        {/* Item Details Card */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xl font-bold text-blue-800">{item.itemName}</h4>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <p><span className="font-medium">HSN:</span> {item.hsn}</p>
                <p><span className="font-medium">Barcode:</span> {item.barcode}</p>
                <p><span className="font-medium">Category:</span> {item.itemCategory}</p>
                <p><span className="font-medium">Warehouse:</span> {item.warehouse}</p>
                <p><span className="font-medium">Current Stock:</span> {item.quantity} {item.unit}</p>
                <p><span className="font-medium">Status:</span> 
                  <Badge bg={item.status === "In Stock" ? "success" : "danger"} className="ms-2">
                    {item.status}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">Item Value</p>
              <p className="text-2xl font-bold text-blue-700">₹{item.value}</p>
              <p className="text-sm text-gray-600">Cost: ₹{item.cost}/unit</p>
            </div>
          </div>
        </div>

      {/* Filters */}
<div className="flex flex-wrap gap-4 mb-6">
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">Date</label>
    <input
      type="date"
      name="date"
      value={filters.date}
      onChange={handleFilterChange}
      className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>

  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">VCH No</label>
    <input
      type="text"
      name="vchNo"
      placeholder="PO1-02345"
      value={filters.vchNo}
      onChange={handleFilterChange}
      className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>

  {/* New: Auto Voucher No Filter */}
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">Voucher No (Auto)</label>
    <input
      type="text"
      name="vchNoAuto"
      placeholder="VCH001"
      value={filters.vchNoAuto}
      onChange={handleFilterChange}
      className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>

  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">VCH Type</label>
    <input
      type="text"
      name="vchType"
      placeholder="Enter VCH Type"
      value={filters.vchType}
      onChange={handleFilterChange}
      className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">Warehouse</label>
    <input
      type="text"
      name="warehouse"
      placeholder="Enter Warehouse"
      value={filters.warehouse}
      onChange={handleFilterChange}
      className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>
</div>



        {/* Opening Inventory */}
        <div className="p-3 rounded bg-gray-50 text-sm mb-4 border">
          <strong>{item.itemName}</strong> <br />
          <strong>Opening Inventory:</strong> <span className="font-medium">0.00 yds X 0.000 = 0.000</span>
        </div>

        {/* All Transactions */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-3">All Transactions</h4>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">DATE</th>
                  <th className="border p-2">VCH TYPE</th>
                  <th className="border p-2">PARTICULARS</th>
                  <th className="border p-2">VCH NO</th>
                  <th className="border p-2">VOUCHER NO (AUTO)</th>
                  <th className="border p-2">WAREHOUSE</th>
                  <th className="border p-2">RATE/UNIT</th>
                  <th className="border p-2">INWARDS (QTY)</th>
                  <th className="border p-2">INWARDS (VALUE)</th>
                  <th className="border p-2">OUTWARDS (QTY)</th>
                  <th className="border p-2">OUTWARDS (VALUE)</th>
                  <th className="border p-2">CLOSING QUANTITY</th>
                  <th className="border p-2">DESCRIPTION</th>
                  <th className="border p-2">NARRATION</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="border p-2">{row.date}</td>
                      <td className="border p-2">{row.vchType}</td>
                      <td className="border p-2">{row.particulars}</td>
                      <td className="border p-2">
                        {row.vchNo}<br />
                        <small className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          {row.vchNoAuto}
                        </small>
                      </td>
                      <td className="border p-2">
  <span className="font-medium text-blue-700">{row.vchNoAuto}</span>
</td>
                      <td className="border p-2">{row.warehouse}</td>
                      <td className="border p-2">{row.rate}</td>
                      <td className="border p-2">{row.inwardsQty}</td>
                      <td className="border p-2">{row.inwardsValue}</td>
                      <td className="border p-2">{row.outwardsQty}</td>
                      <td className="border p-2">{row.outwardsValue}</td>
                      <td className="border p-2">{row.closingQty}</td>
                      <td className="border p-2">{row.description}</td>
                      <td className="border p-2">{row.narration}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="text-center p-4 text-gray-500">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase History */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-green-700">Purchase History</h4>
            <Badge bg="success" className="me-2">Total Purchases: ₹{totalPurchases.toFixed(2)}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-green-100">
                <tr>
                  <th className="border p-2">DATE</th>
                  <th className="border p-2">VCH TYPE</th>
                  <th className="border p-2">PARTICULARS</th>
                  <th className="border p-2">VCH NO</th>
                  <th className="border p-2">VOUCHER NO (AUTO)</th>
                  <th className="border p-2">WAREHOUSE</th>
                  <th className="border p-2">RATE/UNIT</th>
                  <th className="border p-2">QTY</th>
                  <th className="border p-2">VALUE</th>
                  <th className="border p-2">DESCRIPTION</th>
                  <th className="border p-2">NARRATION</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.length > 0 ? (
                  purchaseHistory.map((row, index) => (
                    <tr key={index} className="hover:bg-green-50">
                      <td className="border p-2">{row.date}</td>
                      <td className="border p-2">{row.vchType}</td>
                      <td className="border p-2">{row.particulars}</td>
                      <td className="border p-2">
                        {row.vchNo}<br />
                        <small className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          {row.vchNoAuto}
                        </small>
                      </td>
                      <td className="border p-2">
  <span className="font-medium text-blue-700">{row.vchNoAuto}</span>
</td>
                      <td className="border p-2">{row.warehouse}</td>
                      <td className="border p-2">{row.rate}</td>
                      <td className="border p-2">{row.inwardsQty}</td>
                      <td className="border p-2">{row.inwardsValue}</td>
                      <td className="border p-2">{row.description}</td>
                      <td className="border p-2">{row.narration}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center p-4 text-gray-500">
                      No purchase records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales History */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-red-700">Sales History</h4>
            <Badge bg="danger" className="me-2">Total Sales: ₹{totalSales.toFixed(2)}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-red-100">
                <tr>
                  <th className="border p-2">DATE</th>
                  <th className="border p-2">VCH TYPE</th>
                  <th className="border p-2">PARTICULARS</th>
                  <th className="border p-2">VCH NO</th>
                  <th className="border p-2">VOUCHER NO (AUTO)</th>
                  <th className="border p-2">WAREHOUSE</th>
                  <th className="border p-2">RATE/UNIT</th>
                  <th className="border p-2">QTY</th>
                  <th className="border p-2">VALUE</th>
                  <th className="border p-2">DESCRIPTION</th>
                  <th className="border p-2">NARRATION</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory.length > 0 ? (
                  salesHistory.map((row, index) => (
                    <tr key={index} className="hover:bg-red-50">
                      <td className="border p-2">{row.date}</td>
                      <td className="border p-2">{row.vchType}</td>
                      <td className="border p-2">{row.particulars}</td>
                      <td className="border p-2">
                        {row.vchNo}<br />
                        <small className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          {row.vchNoAuto}
                        </small>
                      </td>
                      <td className="border p-2">
  <span className="font-medium text-blue-700">{row.vchNoAuto}</span>
</td>
                      <td className="border p-2">{row.warehouse}</td>
                      <td className="border p-2">{row.rate}</td>
                      <td className="border p-2">{row.outwardsQty}</td>
                      <td className="border p-2">{row.outwardsValue}</td>
                      <td className="border p-2">{row.description}</td>
                      <td className="border p-2">{row.narration}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center p-4 text-gray-500">
                      No sales records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Return History */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-purple-700">Return History</h4>
            <Badge bg="warning" text="dark" className="me-2">Total Returns: ₹{totalReturns.toFixed(2)}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-purple-100">
                <tr>
                  <th className="border p-2">DATE</th>
                  <th className="border p-2">VCH TYPE</th>
                  <th className="border p-2">PARTICULARS</th>
                  <th className="border p-2">VCH NO</th>
                  <th className="border p-2">VOUCHER NO (AUTO)</th>
                  <th className="border p-2">WAREHOUSE</th>
                  <th className="border p-2">RATE/UNIT</th>
                  <th className="border p-2">QTY</th>
                  <th className="border p-2">VALUE</th>
                  <th className="border p-2">DESCRIPTION</th>
                  <th className="border p-2">NARRATION</th>
                </tr>
              </thead>
              <tbody>
                {returnHistory.length > 0 ? (
                  returnHistory.map((row, index) => (
                    <tr key={index} className="hover:bg-purple-50">
                      <td className="border p-2">{row.date}</td>
                      <td className="border p-2">{row.vchType}</td>
                      <td className="border p-2">{row.particulars}</td>
                      <td className="border p-2">
                        {row.vchNo}<br />
                        <small className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          {row.vchNoAuto}
                        </small>
                      </td>
                      <td className="border p-2">
  <span className="font-medium text-blue-700">{row.vchNoAuto}</span>
</td>
                      <td className="border p-2">{row.warehouse}</td>
                      <td className="border p-2">{row.rate}</td>
                      <td className="border p-2">{row.inwardsQty}</td>
                      <td className="border p-2">{row.inwardsValue}</td>
                      <td className="border p-2">{row.description}</td>
                      <td className="border p-2">{row.narration}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center p-4 text-gray-500">
                      No return records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Closing Inventory */}
        <div className="mt-4 border p-3 rounded bg-gray-100 text-sm">
          <strong>Closing Inventory:</strong> <span className="font-medium">130.00 yds X 0.360 = 46.800</span>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;