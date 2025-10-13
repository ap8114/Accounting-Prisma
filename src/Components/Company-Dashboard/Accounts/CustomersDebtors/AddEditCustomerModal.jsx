import React, { useState, useEffect } from "react";
import { Button, Col, Form, Modal, Row, Alert } from "react-bootstrap";
import { toast } from "react-toastify"; // ✅ Import toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Import styles
import GetCompanyId from "../../../../Api/GetCompanyId";
import axiosInstance from "../../../../Api/axiosInstance";
import BaseUrl from "../../../../Api/BaseUrl";

const AddEditCustomerModal = ({
  show,
  onHide,
  editMode,
  customerFormData,
  setCustomerFormData,
  onSave,
  customerId,
}) => {
  const companyId = GetCompanyId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null); // Keep for form-specific validation errors
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!show) return;

    if (!editMode) {
      setCustomerFormData({
        name: "",
        nameArabic: "",
        companyName: "",
        companyLocation: "",
        idCardImage: null,
        extraFile: null,
        accountName: "",
        accountBalance: "0.00",
        creationDate: new Date().toISOString().split("T")[0],
        bankAccountNumber: "",
        bankIFSC: "",
        bankName: "",
        country: "",
        state: "",
        pincode: "",
        address: "",
        stateCode: "",
        shippingAddress: "",
        phone: "",
        email: "",
        creditPeriod: "",
        gstEnabled: false,
        gstin: "",
      });
      setError(null);
    } else if (editMode && customerId) {
      const fetchCustomerData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axiosInstance.get(
            `customers/${customerId}`
          );
          if (response.data.status && response.data.data) {
            const customer = response.data.data;
            setCustomerFormData({
              name: customer.name_english || "",
              nameArabic: customer.name_arabic || "",
              companyName: customer.company_name || "",
              companyLocation: customer.google_location || "",
              idCardImage: null,
              extraFile: null,
              accountName: customer.account_name || "",
              accountBalance: customer.account_balance?.toString() || "0.00",
              creationDate: customer.creation_date
                ? customer.creation_date.split("T")[0]
                : new Date().toISOString().split("T")[0],
              bankAccountNumber: customer.bank_account_number || "",
              bankIFSC: customer.bank_ifsc || "",
              bankName: customer.bank_name_branch || "",
              country: customer.country || "",
              state: customer.state || "",
              pincode: customer.pincode || "",
              address: customer.address || "",
              stateCode: customer.state_code || "",
              shippingAddress: customer.shipping_address || "",
              phone: customer.phone || "",
              email: customer.email || "",
              creditPeriod: customer.credit_period?.toString() || "",
              gstEnabled:
                customer.enable_gst === "1" || customer.enable_gst === true,
              gstin: customer.gstin || "",
            });
          } else {
            setError("Failed to load customer data.");
            toast.error("Failed to load customer data."); // ✅ Toast error
          }
        } catch (err) {
          console.error("Error fetching customer:", err);
          setError("Error loading customer. Please try again.");
          toast.error("Error loading customer. Please try again."); // ✅ Toast error
        } finally {
          setIsLoading(false);
        }
      };

      fetchCustomerData();
    }
  }, [editMode, show, customerId, setCustomerFormData]);

  const handleSaveCustomer = async () => {
    try {
      setIsSubmitting(true);
      setError(null); // Clear inline error

      const formData = new FormData();
      formData.append("company_id", companyId);
      formData.append("name_english", customerFormData.name);
      formData.append("name_arabic", customerFormData.nameArabic);
      formData.append("company_name", customerFormData.companyName);
      formData.append("google_location", customerFormData.companyLocation);
      formData.append("account_name", customerFormData.accountName);
      formData.append("account_balance", customerFormData.accountBalance);
      formData.append("creation_date", customerFormData.creationDate);
      formData.append(
        "bank_account_number",
        customerFormData.bankAccountNumber
      );
      formData.append("bank_ifsc", customerFormData.bankIFSC);
      formData.append("bank_name_branch", customerFormData.bankName);
      formData.append("country", customerFormData.country);
      formData.append("state", customerFormData.state);
      formData.append("pincode", customerFormData.pincode);
      formData.append("address", customerFormData.address);
      formData.append("state_code", customerFormData.stateCode);
      formData.append("shipping_address", customerFormData.shippingAddress);
      formData.append("phone", customerFormData.phone);
      formData.append("email", customerFormData.email);
      formData.append("credit_period", customerFormData.creditPeriod);
      formData.append("enable_gst", customerFormData.gstEnabled ? "1" : "0");
      formData.append("gstin", customerFormData.gstin);

      if (
        customerFormData.idCardImage &&
        customerFormData.idCardImage instanceof File
      ) {
        if (!validateImageFile(customerFormData.idCardImage)) {
          setError(
            "Invalid ID card image. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
          );
          toast.error(
            "Invalid ID card image. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
          );
          setIsSubmitting(false);
          return;
        }
        formData.append(
          "id_card_image",
          customerFormData.idCardImage,
          customerFormData.idCardImage.name
        );
      }

      if (
        customerFormData.extraFile &&
        customerFormData.extraFile instanceof File
      ) {
        if (customerFormData.extraFile.type.match("image.*")) {
          if (!validateImageFile(customerFormData.extraFile)) {
            setError(
              "Invalid image file. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
            );
            toast.error(
              "Invalid image file. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
            );
            setIsSubmitting(false);
            return;
          }
        }
        formData.append(
          "image",
          customerFormData.extraFile,
          customerFormData.extraFile.name
        );
      }

      let response;
      if (editMode && customerId) {
        response = await axiosInstance.patch(
          `customers/${customerId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        response = await axiosInstance.post("customers", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.status) {
        onSave(response.data.data, editMode ? "edit" : "add");
        onHide();
        // toast.success(editMode ? "Customer updated successfully!" : "Customer added successfully!"); // ✅ Success toast
      } else {
        setError(response.data.message || "Error saving customer");
        toast.error(response.data.message || "Error saving customer"); // ✅ Error toast
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while saving customer";
      setError(errorMessage);
      toast.error(errorMessage); // ✅ Error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateImageFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) return false;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return false;
    return true;
  };

  const handleIdCardImageChange = (e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.match("image.*")) {
        if (validateImageFile(file)) {
          setCustomerFormData({
            ...customerFormData,
            idCardImage: file,
          });
        } else {
          setError(
            "Invalid ID card image. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
          );
          toast.error(
            "Invalid ID card image. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
          );
        }
      } else {
        setError("Please select an image file for ID card");
        toast.error("Please select an image file for ID card");
      }
    }
  };

  const handleExtraFileChange = (e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.match("image.*")) {
        if (validateImageFile(file)) {
          setCustomerFormData({
            ...customerFormData,
            extraFile: file,
          });
        } else {
          setError(
            "Invalid image file. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
          );
          toast.error(
            "Invalid image file. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
          );
        }
      } else {
        setCustomerFormData({
          ...customerFormData,
          extraFile: file,
        });
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>{editMode ? "Edit Customer" : "Add Customer"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Keep inline error for immediate form feedback */}
        {error && <Alert variant="danger">{error}</Alert>}
        {isLoading && <Alert variant="info">Loading customer data...</Alert>}

        <Form>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Name (English)</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomerFormData({
                      ...customerFormData,
                      name: value,
                      accountName:
                        customerFormData.name === customerFormData.accountName
                          ? value
                          : customerFormData.accountName,
                    });
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Name (Arabic)</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.nameArabic}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      nameArabic: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.companyName}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      companyName: e.target.value,
                    })
                  }
                  placeholder="Enter company name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Company Google Location</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.companyLocation}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      companyLocation: e.target.value,
                    })
                  }
                  placeholder="Enter Google Maps link"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>ID Card Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={handleIdCardImageChange}
                />
                {customerFormData.idCardImage ? (
                  <div className="mt-2">
                    <small className="text-muted">
                      {customerFormData.idCardImage instanceof File}
                    </small>
                  </div>
                ) : editMode ? (
                  <div className="mt-2">
                    <small className="text-muted">
                      Previously uploaded (re-upload to change)
                    </small>
                  </div>
                ) : null}
                <Form.Text className="text-muted">
                  JPEG, PNG or JPG (max 5MB)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Any File</Form.Label>
                <Form.Control type="file" onChange={handleExtraFileChange} />
                {customerFormData.extraFile ? (
                  <div className="mt-2">
                    <small className="text-muted">
                      {customerFormData.extraFile instanceof File}
                    </small>
                  </div>
                ) : editMode ? (
                  <div className="mt-2">
                    <small className="text-muted">
                      Previously uploaded (re-upload to change)
                    </small>
                  </div>
                ) : null}
                <Form.Text className="text-muted">
                  Any file type. If image, max 5MB
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Account Type</Form.Label>
                <Form.Control
                  type="text"
                  value="Sundry Debtors"
                  readOnly
                  disabled
                  style={{ backgroundColor: "#fff" }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Balance Type</Form.Label>
                <Form.Control
                  type="text"
                  value="Debit"
                  readOnly
                  disabled
                  style={{ backgroundColor: "#fff" }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Account Name</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.accountName}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      accountName: e.target.value,
                    })
                  }
                  placeholder=""
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Account Balance</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={customerFormData.accountBalance}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomerFormData({
                      ...customerFormData,
                      accountBalance: value || "0.00",
                    });
                  }}
                  placeholder="Enter account balance"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Creation Date</Form.Label>
                <Form.Control
                  type="date"
                  value={customerFormData.creationDate}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      creationDate: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Bank Account Number</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.bankAccountNumber}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      bankAccountNumber: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Bank IFSC</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.bankIFSC}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      bankIFSC: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Bank Name & Branch</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.bankName}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      bankName: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.country}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      country: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.state}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      state: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Pincode</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.pincode}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      pincode: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.address}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      address: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>State Code</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.stateCode}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      stateCode: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Shipping Address</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.shippingAddress}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      shippingAddress: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.phone}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      phone: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={customerFormData.email}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      email: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Credit Period (days)</Form.Label>
                <Form.Control
                  type="number"
                  value={customerFormData.creditPeriod}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      creditPeriod: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="d-flex align-items-center">
                {customerFormData.gstEnabled && (
                  <div className="flex-grow-1 me-3">
                    <Form.Label>GSTIN</Form.Label>
                    <Form.Control
                      type="text"
                      value={customerFormData.gstin}
                      onChange={(e) =>
                        setCustomerFormData({
                          ...customerFormData,
                          gstin: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <Form.Label className="me-2">Enable</Form.Label>
                  <Form.Check
                    type="switch"
                    id="gstin-toggle"
                    checked={customerFormData.gstEnabled}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
                        gstEnabled: e.target.checked,
                        gstin: e.target.checked ? customerFormData.gstin : "",
                      })
                    }
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          style={{ backgroundColor: "#53b2a5", border: "none" }}
          onClick={handleSaveCustomer}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting
            ? "Saving..."
            : editMode
            ? "Update Customer"
            : "Save Customer"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddEditCustomerModal;
