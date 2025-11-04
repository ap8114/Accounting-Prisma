import React, { useContext } from "react";
import { CurrencyContext } from "../../../hooks/CurrencyContext";

export const CurrencySetting = () => {
  const { currency, setCurrency } = useContext(CurrencyContext);

  return (
    <div>
      <h3>🌍 Select Currency</h3>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        style={{ padding: "6px", marginTop: "5px" }}
      >
        <option value="USD">USD - US Dollar</option>
        <option value="INR">INR - Indian Rupee</option>
        <option value="EUR">EUR - Euro</option>
        <option value="GBP">GBP - Pound</option>
        <option value="AUD">AUD - Australian Dollar</option>
        <option value="CAD">CAD - Canadian Dollar</option>
      </select>
    </div>
  );
};
