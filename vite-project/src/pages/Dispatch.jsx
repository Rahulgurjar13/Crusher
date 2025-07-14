import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';

const Dispatch = () => {
  const columns = [
    { key: 'truck', label: 'Truck' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'material', label: 'Material' },
    { key: 'quantity', label: 'Quantity (tons)' },
    { key: 'destination', label: 'Destination' },
    { key: 'rate', label: 'Rate (₹/ton)' },
    { key: 'freight', label: 'Freight' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Truck Dispatch</h1>
      <DataForm type="dispatch" />
      <DataTable endpoint="dispatch" columns={columns} />
    </div>
  );
};

export default Dispatch;