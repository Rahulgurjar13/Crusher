import DataTable from '../components/DataTable';
import NotificationBanner from '../components/NotificationBanner';

const Stock = () => {
  const columns = [
    { key: 'material', label: 'Material' },
    { key: 'quantity', label: 'Quantity (tons)' },
    { key: 'lastUpdated', label: 'Last Updated' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Stock Management</h1>
      <NotificationBanner />
      <DataTable endpoint="stock" columns={columns} />
    </div>
  );
};

export default Stock;