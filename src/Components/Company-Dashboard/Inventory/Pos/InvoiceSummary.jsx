import React, { useState } from 'react';
import { Row, Col, Table, Button, Badge } from 'react-bootstrap';
import {
  FaEdit, FaPrint, FaMoneyBill, FaPaperPlane, FaEye,
  FaGlobe, FaExchangeAlt, FaTimes, FaCaretUp,FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
const InvoiceSummary = () => {
  const [languageMode, setLanguageMode] = useState("en"); // "en" | "ar" | "both"
  const navigate = useNavigate();
  const t = (en, ar) => {
    if (languageMode === "both") {
      return (
        <div>
          <div>{en}</div>
          <div className="text-muted small">{ar}</div>
        </div>
      );
    }
    return languageMode === "ar" ? ar : en;
  };

  return (
    <>
      <div className={`p-4 mt-2 ${languageMode === "ar" ? 'arabic-mode' : ''}`}>
      <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/company/ponitofsale')}
          className="mb-3 d-flex align-items-center gap-1"
        >
          <FaArrowLeft /> {t("Back", "رجوع")}
        </Button>
        {/* Action Bar */}
        <Row className="mb-4 align-items-start">
          <Col md={8}>
            <div className="d-flex flex-wrap gap-2">
              {/* Language Toggle Buttons */}
              <Button
                variant={languageMode === "en" ? "dark" : "outline-dark"}
                onClick={() => setLanguageMode("en")}
              >
                🌐 English
              </Button>
              <Button
                variant={languageMode === "ar" ? "dark" : "outline-dark"}
                onClick={() => setLanguageMode("ar")}
              >
                🇴🇲 Arabic
              </Button>
              <Button
                variant={languageMode === "both" ? "dark" : "outline-dark"}
                onClick={() => setLanguageMode("both")}
              >
                🌍 English & Arabic
              </Button>

              <Button variant="warning" className="d-flex align-items-center gap-1">
                <FaEdit /> <span>{t("Edit Invoice", "تعديل الفاتورة")}</span>
              </Button>
              <Button variant="success" className="d-flex align-items-center gap-1">
                <FaMoneyBill /> <span>{t("Receive Payment", "استلام الدفع")}</span>
              </Button>
              <Button variant="primary" className="d-flex align-items-center gap-1">
                <FaPaperPlane /> <span>{t("Send", "إرسال")}</span>
              </Button>
              <Button variant="success" className="d-flex align-items-center gap-1">
                <FaPrint /> <span>{t("Print Invoice", "طباعة الفاتورة")}</span>
              </Button>
              <Button variant="info" className="d-flex align-items-center gap-1">
                <FaGlobe /> <span>{t("Print  Preview", "طباعة العامة")}</span>
              </Button>
              <Button variant="secondary" className="d-flex align-items-center gap-1">
                <FaExchangeAlt /> <span>{t("Change Status", "تغيير الحالة")}</span>
              </Button>
              <Button variant="danger" className="d-flex align-items-center gap-1">
                <FaTimes /> <span>{t("Cancel", "إلغاء")}</span>
              </Button>
              <Button variant="success" className="d-flex align-items-center gap-1">
                <FaEdit /> <span>{t("Delivery Note", "مذكرة التسليم")}</span>
              </Button>
              <Button variant="info" className="d-flex align-items-center gap-1">
                <FaEye /> <span>{t("Proforma Invoice", "الفاتورة الأولية")}</span>
              </Button>
              <Button variant="secondary" className="d-flex align-items-center gap-1">
                <FaCaretUp /> <span>{t("Copy Invoice", "نسخ الفاتورة")}</span>
              </Button>
            </div>
          </Col>

          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <h5 className="fw-bold mb-1">{t("Sales Invoice", "فاتورة المبيعات")}</h5>
            <div>{t("Invoice#", "رقم الفاتورة")} SI-1045</div>
            <div>{t("Reference:", "المرجع:")}</div>
            <div className="fw-bold mt-2">{t("Gross Amount:", "المبلغ الإجمالي:")} <span className="text-success">$ 10.90</span></div>
          </Col>
        </Row>

        {/* Customer Info */}
        <Row className="mb-4">
        <Col md={6}>
  <strong className="d-block mb-2">{t("Bill To", "إلى الفاتورة")}</strong>
  <div><strong className="text-primary">{t("Haroun Spiers", "هارون سبيرز")}</strong></div>
  <div>{t("4 Kings Park", "4 كينجز بارك")}</div>
  <div>{t("Zouparia do Monte, Portugal", "زوباريا دو مونتي، البرتغال")}</div>
  <div>{t("Phone:", "الهاتف:")} 489-737-5435</div>
  <div>{t("Email:", "البريد الإلكتروني:")} hspiers2g@redcross.org</div>
</Col>

          <Col md={6} className="text-md-end mt-4 mt-md-0">
            <div><strong>{t("Invoice Date:", "تاريخ الفاتورة:")}</strong> 15-07-2025</div>
            <div><strong>{t("Due Date:", "تاريخ الاستحقاق:")}</strong> 15-07-2025</div>
            <div><strong>{t("Terms:", "الشروط:")}</strong> {t("Payment Due On Receipt", "الدفع عند الاستلام")}</div>
          </Col>
        </Row>

        {/* Item Table */}
        <div className="table-responsive mb-4">
          <Table bordered className="align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>{t("Description", "الوصف")}</th>
                <th>{t("Rate", "السعر")}</th>
                <th>{t("Qty", "الكمية")}</th>
                <th>{t("Tax", "الضريبة")}</th>
                <th>{t("Discount", "الخصم")}</th>
                <th>{t("Amount", "المبلغ")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>{t("Sample Product", "منتج تجريبي")}</td>
                <td>$ 10.00</td>
                <td>1</td>
                <td>$ 1.90 (19.00%)</td>
                <td>$ 1.00 (1.00 flat)</td>
                <td>$ 10.90</td>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* Payment Summary */}
        <Row className="mb-4">
          <Col md={6}>
            <p><strong>{t("Payment Status:", "حالة الدفع:")}</strong> <Badge bg="success">{t("Paid", "مدفوع")}</Badge></p>
            <p><strong>{t("Payment Method:", "طريقة الدفع:")}</strong> <u>{t("Cash", "نقداً")}</u></p>
            <p><strong>{t("Note:", "ملاحظة:")}</strong></p>
          </Col>
          <Col md={6}>
            <div className="table-responsive">
              <Table borderless className="text-end">
                <tbody>
                  <tr><td>{t("Sub Total", "المجموع الفرعي")}</td><td>$ 10.00</td></tr>
                  <tr><td>{t("TAX", "الضريبة")}</td><td>$ 1.90</td></tr>
                  <tr><td>{t("Shipping", "الشحن")}</td><td>$ 0.00</td></tr>
                  <tr className="fw-bold border-top"><td>{t("Total", "الإجمالي")}</td><td>$ 10.90</td></tr>
                  <tr className="text-danger"><td>{t("Payment Received", "المبلغ المدفوع")}</td><td>(-) $ 10.90</td></tr>
                  <tr className="fw-bold border-top"><td>{t("Balance Due", "الرصيد المستحق")}</td><td>$ 0.00</td></tr>
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>

        {/* Signature */}
        <div className="text-end mt-5 mb-5">
          <div>(John Doe)</div>
          <small>{t("Business Owner", "صاحب العمل")}</small>
        </div>

        {/* Credit Transactions */}
        <h6 className="mb-3">{t("Credit Transactions:", "المعاملات الائتمانية:")}</h6>
        <div className="table-responsive mb-5">
          <Table bordered>
            <thead className="table-light">
              <tr>
                <th>{t("Date", "التاريخ")}</th>
                <th>{t("Method", "الطريقة")}</th>
                <th>{t("Amount", "المبلغ")}</th>
                <th>{t("Note", "ملاحظة")}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={4} className="text-center">{t("No transactions", "لا توجد معاملات")}</td></tr>
            </tbody>
          </Table>
        </div>

        {/* Terms */}
        <h6>{t("Terms & Conditions", "الشروط والأحكام")}</h6>
        <p className="mb-1 fw-bold">{t("Payment Due On Receipt", "الدفع عند الاستلام")}</p>
        <p className="mb-3">
          1. <strong>{t("Prices And Payment:", "الأسعار والدفع:")}</strong><br />
          {t("Payments are to be made in U.S. funds. Unless otherwise specified, all invoices are due net 30 days from shipment date.",
            "يجب أن تتم المدفوعات بالدولار الأمريكي. ما لم يُذكر خلاف ذلك، تستحق جميع الفواتير خلال 30 يومًا من تاريخ الشحن.")}
        </p>

        {/* Public Access */}
        <p className="text-muted small mb-4">
          {t("Public Access URL:", "رابط الوصول العام:")}<br />
          https://billing.ultimatekode.com/neo/billing/sales?id=1045&token=XXXXXXX
        </p>

        {/* File Upload */}
        <div className="mt-4 mb-5">
          <label className="fw-bold d-block mb-2">{t("Attachments", "المرفقات")}</label>
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
            <Button variant="success" size="sm">{t("Select files...", "اختر الملفات...")}</Button>
            <input type="file" />
          </div>
          <small className="text-muted">{t("Allowed: gif, jpeg, png, docx, docs, txt, pdf, xls", "الملفات المسموح بها: gif، jpeg، png، docx، docs، txt، pdf، xls")}</small>
        </div>
      </div>

      {/* 👇 Inline CSS for Arabic */}
      <style>{`
        .arabic-mode {
          font-family: 'Cairo', sans-serif;
        }
        .arabic-mode * {
          direction: ltr !important;
          text-align: left !important;
        }
      `}</style>
    </>
  );
};

export default InvoiceSummary;
