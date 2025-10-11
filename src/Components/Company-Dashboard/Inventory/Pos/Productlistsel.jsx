import React, { useState, useEffect } from "react";

import AddProductModal from "../AddProductModal";
const Productlistsel = ({ products = [], onProductSelect, showModal }) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // State for Add Product Modal
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  useEffect(() => {
    if (!Array.isArray(products)) return;
    let updatedList = products;
    if (searchQuery) {
      updatedList = updatedList.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    updatedList = [...updatedList].sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );
    setFilteredProducts(updatedList);
  }, [searchQuery, sortOrder, products]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const getStockStatus = (quantity) => {
    if (quantity < 5) return { color: "red", label: "Low Stock" };
    if (quantity <= 10) return { color: "orange", label: "Medium Stock" };
    return { color: "green", label: "In Stock" };
  };

  // Modal handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    // Your add item logic here
    setShowAdd(false);
  };

  const handleUpdateItem = () => {
    // Your update item logic here
    setShowEdit(false);
  };

  const handleAddCategory = () => {
    // Your add category logic here
    setShowAddCategoryModal(false);
  };

  return (
    <div className="p-3 ml-2">
      <h5 className="my-3">📦 Product List</h5>
      <div className="d-flex justify-content-between align-items-center mb-3 me-2">
  {/* Search Bar */}
  <input
    type="text"
    placeholder="Search by Name..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="form-control"
    style={{ width: '55%', marginRight: '20px' }} // Increased gap with margin
  />

  {/* Buttons Group (Add + Sort) */}
  <div className="d-flex align-items-center" style={{ gap: '8px' }}>
    {/* Add Product Button */}
    <button 
      onClick={() => setShowAdd(true)}
      className="btn"
      style={{
        backgroundColor: '#27b2b6',
        color: '#fff',
        padding: '4px 10px',  // smaller padding
        borderRadius: '4px',
        fontSize: '13px',
      }}
    >
      Add Product
    </button>

    {/* Sort Button */}
    <button
      className="btn btn-dark"
      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      style={{
        fontSize: '13px',
        padding: '4px 10px',  // smaller padding
      }}
    >
      Sort by Price {sortOrder === "asc" ? "🔼" : "🔽"}
    </button>
  </div>
</div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
   
              <th>Name</th>
              <th>Warehouse</th>
              <th>Category</th>
              <th>HSN</th>
              <th>Amount</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => {
              const { color, label } = getStockStatus(product.quantity || 10);
              return (
                <tr
                  key={product._id}
                  onClick={() => showModal(product)}
                  style={{ cursor: "pointer" }}
                >
           
                  <td>{product.name}</td>
                  <td>{product.warehouse || "-"}</td>
                  <td>{product.categories || "-"}</td>
                  <td>{product.hsns || "-"}</td>
                  <td>₹{product.price}</td>
                  <td style={{ color }}>{product.quantity ?? 0} <small>({label})</small></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-primary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          ⬅️ Prev
        </button>
        <span className="align-self-center">Page {currentPage}</span>
        <button
          className="btn btn-primary"
          disabled={indexOfLastItem >= filteredProducts.length}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next ➡️
        </button>
      </div>

      {/* Add Product Modal */}


      <AddProductModal      showAdd={showAdd}
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
        handleChange={handleChange}
        handleAddItem={handleAddItem}
        handleUpdateItem={handleUpdateItem}
        handleAddCategory={handleAddCategory}  />
    </div>
  );
};

export default Productlistsel;