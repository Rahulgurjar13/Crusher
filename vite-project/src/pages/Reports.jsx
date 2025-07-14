import { useContext } from 'react';
import { AuthContext } from '../App';
import ReportCharts from '../components/ReportCharts';
import DataTable from '../components/DataTable';
import { FileText, AlertTriangle, BarChart3 } from 'lucide-react';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'date', label: 'Date' },
  ];

  if (!['admin', 'partner'].includes(user.role)) {
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
            <div className="p-3 rounded-lg bg-purple-50 mr-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
              <p className="text-gray-600 mt-1">View comprehensive financial analytics</p>
            </div>
          </div>
        </div>

        {/* Report Charts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-blue-50 mr-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
              <p className="text-gray-600 text-sm">Visual representation of financial data</p>
            </div>
          </div>
          <ReportCharts />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <DataTable endpoint="reports" columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default Reports;