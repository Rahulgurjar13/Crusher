import DataTable from '../components/DataTable';

const VendorLedger = () => {
  const columns = [
    { key: 'vendor', label: 'Vendor' },
    { key: 'saleId', label: 'Sale ID' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Vendor Ledger</h1>
      <DataTable endpoint="vendor-ledger" columns={columns} />
    </div>
  );
};

export default VendorLedger;