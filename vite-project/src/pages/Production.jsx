import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';

const Production = () => {
  const columns = [
    { key: 'material', label: 'Material' },
    { key: 'quantity', label: 'Quantity (tons)' },
    { key: 'date', label: 'Date' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Production</h1>
      <DataForm type="production" />
      <DataTable endpoint="production" columns={columns} />
    </div>
  );
};

export default Production;