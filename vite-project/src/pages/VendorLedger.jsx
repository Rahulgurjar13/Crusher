import { useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import DataTable from '../components/DataTable';

const VendorLedger = () => {
  const { user } = useContext(AuthContext);
  const columns = [
    { key: 'vendor', label: 'Vendor' },
    {
      key: 'saleId',
      label: 'Sale Details',
      render: (saleId, row) => (
        <span>{row.saleId?.material} ({row.saleId?.quantity} tons)</span>
      ),
    },
    { key: 'amount', label: 'Amount (₹)' },
    {
      key: 'status',
      label: 'Status',
      render: (status, row) =>
        status === 'Credit' && user.role === 'admin' ? (
          <button
            className="text-green-500 hover:underline"
            onClick={() => markAsPaid(row.saleId?._id)}
          >
            Mark Paid
          </button>
        ) : (
          status
        ),
    },
  ];

  const markAsPaid = async (saleId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/vendor-ledger/pay`,
        { saleId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      window.location.reload();
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  if (!['admin', 'partner'].includes(user.role)) {
    return <div className="p-6 text-red-500">Access Denied</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Vendor Ledger</h1>
      <DataTable endpoint="vendor-ledger" columns={columns} />
    </div>
  );
};

export default VendorLedger;