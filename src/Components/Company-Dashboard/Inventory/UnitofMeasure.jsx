import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import GetCompanyId from '../../../Api/GetCompanyId';
import BaseUrl from '../../../Api/BaseUrl'; // ✅ Import BaseUrl
import axiosInstance from '../../../Api/axiosInstance'; // ✅ Import axiosInstance
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const companyId = GetCompanyId();

const UnitOfMeasure = () => {
  // States
  const [units, setUnits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [editId, setEditId] = useState(null);

  const [newUOM, setNewUOM] = useState("");
  const [showAddUOMModal, setShowAddUOMModal] = useState(false);
  const [uoms, setUoms] = useState([]);

  // ✅ For Unit Details Modal
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [weightPerUnit, setWeightPerUnit] = useState("");

  // ✅ For Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Changed from 5 to 10

  // Loading & Error States for API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uomLoading, setUomLoading] = useState(false); // Separate loading for UOM dropdown
  const [unitsLoading, setUnitsLoading] = useState(false); // Loading for units table

  // Fetch UOMs from API - NEW ENDPOINT: /api/uoms
  const fetchUOMs = async () => {
    setUomLoading(true);
    try {
      const response = await axiosInstance.get(`${BaseUrl}uoms`);
      if (response.data.success) { // ✅ Changed from 'status' to 'success'
        // Extract unique unit names from the response data
        const uniqueUoms = [...new Set(response.data.data.map(item => item.unit_name))];
        setUoms(uniqueUoms);
      } else {
        setError("Failed to fetch UOMs");
      }
    } catch (err) {
      console.error("Fetch UOMs API Error:", err);
      setError("Failed to fetch UOMs. Please try again.");
    } finally {
      setUomLoading(false);
    }
  };

  // Fetch Units from API by company ID - using the specific endpoint
  const fetchUnits = async () => {
    setUnitsLoading(true);
    try {
      // ✅ NEW ENDPOINT: /api/unit-details/getUnitDetailsByCompanyId/{company_id}
      const response = await axiosInstance.get(`${BaseUrl}unit-details/getUnitDetailsByCompanyId/${companyId}`);
      
      console.log("API Response:", response.data); // Debug log
      
      if (response.data.success) { // ✅ Changed from 'status' to 'success'
        // The API already filters by company_id, so we can use the data directly
        setUnits(response.data.data);
      } else {
        setError("Failed to fetch units");
      }
    } catch (err) {
      console.error("Fetch Units API Error:", err);
      setError("Failed to fetch units. Please try again.");
    } finally {
      setUnitsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchUOMs();
    fetchUnits();
  }, []);

  // Handle Create/Edit Unit Modal
  const handleModalClose = () => {
    setShowModal(false);
    setUnitName("");
    setAbbreviation("");
    setEditId(null);
  };

  const handleModalShow = (data = null) => {
    if (data) {
      setEditId(data.id);
      setUnitName(data.uom_name || ""); // ✅ Changed from 'unit_name' to 'uom_name'
      setWeightPerUnit(data.weight_per_unit || "");
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Find the UOM ID from the selected unit name
      const uomResponse = await axiosInstance.get(`${BaseUrl}uoms`);
      let uomId = null;
      
      if (uomResponse.data.success) { // ✅ Changed from 'status' to 'success'
        const selectedUomData = uomResponse.data.data.find(item => item.unit_name === unitName);
        if (selectedUomData) {
          uomId = selectedUomData.id;
        }
      }

      const unitData = {
        company_id: companyId,
        uom_id: uomId,
        weight_per_unit: weightPerUnit,
      };

      if (editId) {
        // Update existing unit
        const response = await axiosInstance.put(`${BaseUrl}unit-details/${editId}`, unitData);
        if (response.data.success) { // ✅ Changed from 'status' to 'success'
          setUnits(units.map(u => u.id === editId ? { ...u, ...unitData, uom_name: unitName } : u)); // ✅ Changed from 'unit_name' to 'uom_name'
          toast.success("Unit updated successfully!", {
            toastId: 'unit-update-success',
            autoClose: 3000
          });
        }
      } else {
        // Create new unit
        const response = await axiosInstance.post(`${BaseUrl}unit-details`, unitData);
        if (response.data.success) { // ✅ Changed from 'status' to 'success'
          setUnits([...units, { ...response.data.data, uom_name: unitName }]); // ✅ Changed from 'unit_name' to 'uom_name'
          toast.success("Unit created successfully!", {
            toastId: 'unit-create-success',
            autoClose: 3000
          });
        }
      }
      handleModalClose();
      fetchUnits(); // Refresh data
    } catch (err) {
      console.error("Save Unit API Error:", err);
      setError("Failed to save unit. Please try again.");
      toast.error("Failed to save unit. Please try again.", {
        toastId: 'unit-save-error',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete Unit - Show confirmation modal
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    
    try {
      const response = await axiosInstance.delete(`${BaseUrl}unit-details/${deleteId}`, {
        data: { company_id: companyId }
      });
      if (response.data.success) { // ✅ Changed from 'status' to 'success'
        setUnits(units.filter(u => u.id !== deleteId));
        toast.success("Unit deleted successfully.", {
          toastId: 'unit-delete-success',
          autoClose: 3000
        });
        fetchUnits(); // Refresh data
      }
    } catch (err) {
      console.error("Delete Unit API Error:", err);
      setError("Failed to delete unit. Please try again.");
      toast.error("Failed to delete unit. Please try again.", {
        toastId: 'unit-delete-error',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(units.length / itemsPerPage);
  const currentItems = units.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Import Excel
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        setLoading(true);
        const promises = data.map(async (item) => {
          // Find UOM ID for the unit name
          const uomResponse = await axiosInstance.get(`${BaseUrl}uoms`);
          let uomId = null;
          
          if (uomResponse.data.success) { // ✅ Changed from 'status' to 'success'
            const selectedUomData = uomResponse.data.data.find(u => u.unit_name === item["Unit Name"]);
            if (selectedUomData) {
              uomId = selectedUomData.id;
            }
          }
          
          const newUnit = {
            company_id: companyId,
            uom_id: uomId,
            weight_per_unit: item["Weight per Unit"] || "",
          };
          return axiosInstance.post(`${BaseUrl}unit-details`, newUnit);
        });
        
        await Promise.all(promises);
        fetchUnits(); // Refresh the list after import
        toast.success("Units imported successfully!", {
          toastId: 'units-import-success',
          autoClose: 3000
        });
      } catch (error) {
        console.error("Import Error:", error);
        setError("Failed to import units. Please try again.");
        toast.error("Failed to import units. Please try again.", {
          toastId: 'units-import-error',
          autoClose: 3000
        });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = units.map(({ uom_name, weight_per_unit }) => ({ // ✅ Changed from 'unit_name' to 'uom_name'
      "Unit Name": uom_name || "",
      "Weight per Unit": weight_per_unit || "",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Units");
    XLSX.writeFile(wb, "unit-of-measure.xlsx");
    toast.success("Units exported successfully!", {
      toastId: 'units-export-success',
      autoClose: 3000
    });
  };

  // Download Template
  const handleDownloadTemplate = () => {
    const template = [{ 
      "Unit Name": "",
      "Weight per Unit": "" 
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "uom-template.xlsx");
  };

  // Page Change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // ✅ POST: Add New UOM via API - NEW ENDPOINT: /api/uoms
  const handleAddUOM = async () => {
    const uomName = newUOM.trim();

    if (!uomName) {
      toast.error("Please enter a valid UOM name.", {
        toastId: 'uom-name-validation-error',
        autoClose: 3000
      });
      return;
    }

    if (uoms.includes(uomName)) {
      toast.error("This UOM already exists.", {
        toastId: 'uom-exists-error',
        autoClose: 3000
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post(`${BaseUrl}uoms`, {
        company_id: companyId,
        unit_name: uomName,
      });

      // Assuming success returns 200/201 and you want to add to local list
      if (response.status === 200 || response.status === 201) {
        // Refresh UOMs list after adding new one
        await fetchUOMs();
        setSelectedUnit(uomName); // Optional: auto-select in parent modal
        setNewUOM("");
        setShowAddUOMModal(false);
        toast.success("UOM added successfully!", {
          toastId: 'uom-add-success',
          autoClose: 3000
        });
      } else {
        throw new Error("Failed to add UOM");
      }
    } catch (err) {
      console.error("Add UOM API Error:", err);
      setError("Failed to add UOM. Please try again.");
      toast.error("Failed to add UOM. Please try again.", {
        toastId: 'uom-add-error',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ POST: Submit Unit Details - NEW ENDPOINT: /api/unit-details
  const handleSubmitUnitDetails = async () => {
    if (!selectedUnit || !weightPerUnit) {
      toast.error("Please fill all fields", {
        toastId: 'unit-details-validation-error',
        autoClose: 3000
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Find the UOM ID from the selected unit name
      const uomResponse = await axiosInstance.get(`${BaseUrl}uoms`);
      if (uomResponse.data.success) { // ✅ Changed from 'status' to 'success'
        const selectedUomData = uomResponse.data.data.find(item => item.unit_name === selectedUnit);
        
        if (!selectedUomData) {
          toast.error("Selected unit not found", {
            toastId: 'unit-not-found-error',
            autoClose: 3000
          });
          return;
        }

        const response = await axiosInstance.post(`${BaseUrl}unit-details`, {
          company_id: companyId,
          uom_id: selectedUomData.id,
          weight_per_unit: weightPerUnit
        });

        if (response.status === 200 || response.status === 201) {
          toast.success("Unit details saved successfully!", {
            toastId: 'unit-details-save-success',
            autoClose: 3000
          });
          setShowUOMModal(false);
          setSelectedUnit("");
          setWeightPerUnit("");
          // Refresh the units list
          fetchUnits();
        } else {
          throw new Error("Failed to save unit details");
        }
      }
    } catch (err) {
      console.error("Save Unit Details API Error:", err);
      setError("Failed to save unit details. Please try again.");
      toast.error("Failed to save unit details. Please try again.", {
        toastId: 'unit-details-save-error',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-md-5 mt-5 mx-3">
        <div className="shadow p-4">
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <h4 className="fw-semibold">Manage Unit of Measure</h4>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                className="rounded-pill text-white"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onClick={() => document.getElementById("excelImport").click()}
                disabled={loading}
              >
                <i className="fas fa-file-import me-2" /> Import
              </Button>

              <input
                type="file"
                id="excelImport"
                accept=".xlsx, .xls"
                style={{ display: "none" }}
                onChange={handleImport}
              />

              <Button
                className="rounded-pill text-white"
                style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14" }}
                onClick={handleExport}
                disabled={loading}
              >
                <i className="fas fa-file-export me-2" /> Export
              </Button>

              <Button
                className="rounded-pill text-white"
                style={{ backgroundColor: "#ffc107", borderColor: "#ffc107" }}
                onClick={handleDownloadTemplate}
                disabled={loading}
              >
                <i className="fas fa-download me-2" /> Download Template
              </Button>

              <Button
                className="set_btn text-white fw-semibold"
                style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}
                onClick={() => setShowUOMModal(true)}
                disabled={loading} // Disable during API call
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="fa fa-plus me-2"></i>
                )}
                Create Unit
              </Button>
            </div>
          </div>

          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <div className="table-responsive mt-3">
            <Table bordered striped hover>
              <thead className="table-light">
                <tr>
                  <th>S.No</th>
                  <th>Unit Name</th>
                  <th>Weight per Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {unitsLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                      Loading units...
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((u, index) => (
                    <tr key={u.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{u.uom_name || ""}</td> {/* ✅ Changed from 'unit_name' to 'uom_name' */}
                      <td>{u.weight_per_unit || ""}</td>
                      <td>
                        <Button
                          variant="link"
                          className="text-warning p-0 me-2"
                          onClick={() => handleModalShow(u)}
                          disabled={loading}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger p-0 me-2"
                          onClick={() => handleDeleteClick(u.id)}
                          disabled={loading}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No units found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2 px-2">
            <span className="small text-muted">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, units.length)} of {units.length} entries
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0 flex-wrap">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link rounded-start"
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    disabled={loading}
                  >
                    &laquo;
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      style={
                        currentPage === index + 1
                          ? { backgroundColor: '#3daaaa', borderColor: '#3daaaa', color: 'white' }
                          : {}
                      }
                      onClick={() => handlePageChange(index + 1)}
                      disabled={loading}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link rounded-end"
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                    disabled={loading}
                  >
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* ✅ Edit Unit Modal */}
        <Modal show={showModal} onHide={handleModalClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? "Edit Unit" : "Add Unit"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleFormSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Unit Name</Form.Label>
                <Form.Select
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  required
                  disabled={loading || uomLoading}
                >
                  <option value="">Select Unit</option>
                  {uomLoading ? (
                    <option disabled>Loading units...</option>
                  ) : (
                    uoms.map((uom, idx) => (
                      <option key={idx} value={uom}>
                        {uom}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Weight per Unit</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. 0.5 KG"
                  value={weightPerUnit}
                  onChange={(e) => setWeightPerUnit(e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleModalClose}
              style={{
                border: 'none',
                color: '#fff',
                padding: '6px 16px',
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleFormSubmit}
              style={{
                backgroundColor: '#27b2b6',
                border: 'none',
                color: '#fff',
                padding: '6px 16px',
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : (editId ? "Update" : "Save")}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ✅ Unit Details Modal */}
        <Modal show={showUOMModal} onHide={() => setShowUOMModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Unit Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0">Unit of Measurement (UOM)</Form.Label>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowAddUOMModal(true)}
                    style={{
                      backgroundColor: '#27b2b6',
                      border: 'none',
                      color: '#fff',
                      padding: '6px 12px',
                      fontSize: '12px',
                    }}
                    disabled={loading}
                  >
                    + Add New
                  </Button>
                </div>
                <Form.Select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="mt-2"
                  disabled={loading || uomLoading}
                >
                  <option value="">Select Unit</option>
                  {uomLoading ? (
                    <option disabled>Loading units...</option>
                  ) : (
                    uoms.map((uom, idx) => (
                      <option key={idx} value={uom}>
                        {uom}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Weight per Unit</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. 0.5 KG"
                  value={weightPerUnit}
                  onChange={(e) => setWeightPerUnit(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowUOMModal(false)}
              style={{
                border: 'none',
                color: '#fff',
                padding: '6px 16px',
              }}
              disabled={loading}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitUnitDetails}
              style={{
                backgroundColor: '#27b2b6',
                border: 'none',
                color: '#fff',
                padding: '6px 16px',
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ✅ Add New UOM Modal */}
        <Modal show={showAddUOMModal} onHide={() => setShowAddUOMModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New UOM</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Unit of Measurement</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Pack, Dozen, Roll"
                value={newUOM}
                onChange={(e) => setNewUOM(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            {error && <div className="text-danger small mt-2">{error}</div>}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowAddUOMModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              style={{
                backgroundColor: '#27b2b6',
                border: 'none',
                color: '#fff',
                padding: '6px 16px',
              }}
              onClick={handleAddUOM}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ✅ Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this unit?</p>
            <p className="text-muted small">This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
      />
    </>
  );
};

export default UnitOfMeasure;