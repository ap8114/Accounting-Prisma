import { useState } from "react";
import { useNavigate } from "react-router-dom";

const dummyCustomers = [
  { id: "1", first_name: "John", last_name: "Doe" },
  { id: "2", first_name: "Jane", last_name: "Smith" },
  { id: "3", first_name: "Alice", last_name: "Brown" },
];

const CustomerList = ({ onSelectCustomer }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customers] = useState(dummyCustomers);

  const handleSelectCustomer = (customer) => {
    onSelectCustomer(customer);
    setIsDropdownOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => setIsDropdownOpen(false), 150);
  };

  const filteredCustomers = customers.filter((c) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customer-search-container position-relative mx-3 my-3">
      <div className="input-group mt-4">
        <span className="input-group-text">Customer</span>
        <input
          type="text"
          className="form-control"
          placeholder="Search customer"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={handleBlur}
        />
        <span
          className="input-group-text btn text-white"
          style={{ backgroundColor: "#1d1b31", cursor: "pointer" }}
          onClick={() => navigate("/company/customersdebtors")}
        >
          <i className="fa fa-plus"></i>
        </span>
      </div>

      {isDropdownOpen && (
        <ul
          className="list-group position-absolute bg-white border shadow-sm"
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            width: "100%",
            zIndex: 1000,
          }}
        >
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <li
                key={customer.id}
                className="list-group-item"
                onClick={() => handleSelectCustomer(customer)}
                style={{ cursor: "pointer" }}
              >
                {customer.first_name} {customer.last_name}
              </li>
            ))
          ) : (
            <li className="list-group-item text-muted">No customers found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomerList;
