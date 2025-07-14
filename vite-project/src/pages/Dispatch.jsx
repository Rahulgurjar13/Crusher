import { useContext } from 'react';
import { AuthContext } from '../App';
import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';
import { Truck, AlertTriangle } from 'lucide-react';

const Dispatch = () => {
  const { user } = useContext(AuthContext);
  const columns = [
    { key: 'truck', label: 'Truck' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'material', label: 'Material' },
    { key: 'quantity', label: 'Quantity (tons)' },
    { key: 'destination', label: 'Destination' },
    { key: 'rate', label: 'Rate (₹/ton)' },
    { key: 'freight', label: 'Freight' },
    { key: 'date', label: 'Date' },
  ];

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
            <div className="p-3 rounded-lg bg-blue-50 mr-4">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Truck Dispatch</h1>
              <p className="text-gray-600 mt-1">Manage truck dispatches and deliveries</p>
            </div>
          </div>
        </div>

        {/* Data Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <DataForm type="dispatch" />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <DataTable endpoint="dispatch" columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default Dispatch;