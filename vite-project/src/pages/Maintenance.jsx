import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';

const Maintenance = () => {
  const columns = [
    { key: 'equipment', label: 'Equipment' },
    { key: 'issue', label: 'Issue' },
    { key: 'cost', label: 'Cost (₹)' },
    { key: 'date', label: 'Date' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Maintenance Logbook</h1>
      <DataForm type="maintenance" />
      <DataTable endpoint="maintenance" columns={columns} />
    </div>
  );
};

export default Maintenance;