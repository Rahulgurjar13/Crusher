import { useContext } from 'react';
import { AuthContext } from '../App';
import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';

const Rates = () => {
  const { user } = useContext(AuthContext);
  const columns = [
    { key: 'material', label: 'Material' },
    { key: 'rate', label: 'Rate (₹/ton)' },
    { key: 'changedBy', label: 'Changed By' },
    { key: 'date', label: 'Date' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Material Rates</h1>
      {user.role === 'admin' && <DataForm type="rates" />}
      <DataTable endpoint="rates" columns={columns} />
    </div>
  );
};

export default Rates;