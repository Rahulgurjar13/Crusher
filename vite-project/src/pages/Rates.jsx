import { useContext } from 'react';
import { AuthContext } from '../App';
import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';
import { DollarSign } from 'lucide-react';

const Rates = () => {
  const { user } = useContext(AuthContext);
  const columns = [
    { key: 'material', label: 'Material' },
    { key: 'rate', label: 'Rate (₹/ton)' },
    { key: 'changedBy', label: 'Changed By' },
    { key: 'date', label: 'Date' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-yellow-50 mr-4">
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Material Rates</h1>
              <p className="text-gray-600 mt-1">Manage and track material pricing</p>
            </div>
          </div>
        </div>

        {/* Data Forms - Only for Admin */}
        {user.role === 'admin' && (
          <div className="space-y-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <DataForm type="rates" />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <DataForm
                type="materials"
                customTitle="Add Material"
                customFields={['name', 'rate']}
              />
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <DataTable endpoint="rates" columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default Rates;