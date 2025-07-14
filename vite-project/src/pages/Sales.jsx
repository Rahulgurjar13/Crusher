import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';
import jsPDF from 'jspdf';
import { DollarSign, AlertTriangle } from 'lucide-react';

const Sales = () => {
  const { user } = useContext(AuthContext);
  const columns = [
    { key: 'vendor', label: 'Vendor' },
    { key: 'material', label: 'Material' },
    { key: 'quantity', label: 'Quantity (tons)' },
    { key: 'rate', label: 'Rate (₹/ton)' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'status', label: 'Status' },
    {
      key: '_id',
      label: 'Actions',
      render: (saleId, row) => (
        <div className="flex gap-2">
          <button
            className="text-blue-600 hover:text-blue-700 font-medium text-sm px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
            onClick={() => generateInvoice(saleId)}
          >
            Invoice
          </button>
          {user.role === 'admin' && row.status === 'Credit' && (
            <button
              className="text-green-600 hover:text-green-700 font-medium text-sm px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors duration-200"
              onClick={() => markAsPaid(saleId)}
            >
              Mark Paid
            </button>
          )}
        </div>
      ),
    },
  ];

  const generateInvoice = async (saleId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/sales/${saleId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const sale = response.data;
      const doc = new jsPDF();
      doc.text(`Invoice for Sale #${saleId}`, 10, 10);
      doc.text(`Vendor: ${sale.vendor}`, 10, 20);
      doc.text(`Material: ${sale.material}`, 10, 30);
      doc.text(`Quantity: ${sale.quantity} tons`, 10, 40);
      doc.text(`Rate: ₹${sale.rate}/ton`, 10, 50);
      doc.text(`Total: ₹${sale.total}`, 10, 60);
      doc.text(`Payment Method: ${sale.paymentMethod}`, 10, 70);
      doc.text(`Status: ${sale.status}`, 10, 80);
      doc.text(`Date: ${new Date(sale.date).toLocaleDateString()}`, 10, 90);
      doc.save(`invoice_${saleId}.pdf`);
    } catch (err) {
      console.error('Error generating invoice:', err);
    }
  };

  const markAsPaid = async (saleId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/vendor-ledger/pay`,
        { saleId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      window.location.reload(); // Refresh to update table
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  if (!['admin', 'operator'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700 text-sm font-medium">Access Denied</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-emerald-50 mr-4">
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
              <p className="text-gray-600 mt-1">Manage sales transactions and invoices</p>
            </div>
          </div>
        </div>

        {/* Data Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <DataForm type="sales" />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <DataTable endpoint="sales" columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default Sales;