import { useState } from 'react';
import axios from 'axios';
import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';
import jsPDF from 'jspdf';

const Sales = () => {
  const columns = [
    { key: 'vendor', label: 'Vendor' },
    { key: 'material', label: 'Material' },
    { key: 'quantity', label: 'Quantity (tons)' },
    { key: 'rate', label: 'Rate (₹/ton)' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'status', label: 'Status' },
  ];

  const generateInvoice = async (saleId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/sales/${saleId}`);
      const sale = response.data;
      const doc = new jsPDF();
      doc.text(`Invoice for Sale #${saleId}`, 10, 10);
      doc.text(`Vendor: ${sale.vendor}`, 10, 20);
      doc.text(`Material: ${sale.material}`, 10, 30);
      doc.text(`Quantity: ${sale.quantity} tons`, 10, 40);
      doc.text(`Total: ₹${sale.quantity * sale.rate}`, 10, 50);
      doc.save(`invoice_${saleId}.pdf`);
    } catch (err) {
      console.error('Error generating invoice:', err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Sales</h1>
      <DataForm type="sales" />
      <DataTable endpoint="sales" columns={columns} />
    </div>
  );
};

export default Sales;