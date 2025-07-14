import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Activity, AlertTriangle, BarChart3, FileText } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Maintenance = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({ monthlyCosts: [], frequentIssues: [] });
  const columns = [
    { key: 'equipment', label: 'Equipment' },
    { key: 'issue', label: 'Issue' },
    { key: 'cost', label: 'Cost (₹)' },
    { key: 'remarks', label: 'Remarks' },
    {
      key: 'fileUrl',
      label: 'File',
      render: (value) => value ? <a href={`${import.meta.env.VITE_API_URL}${value}`} className="text-blue-500">Download</a> : '-',
    },
    { key: 'date', label: 'Date' },
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/maintenance/analytics`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching maintenance analytics:', err);
      }
    };
    fetchAnalytics();
  }, [user]);

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
            <div className="p-3 rounded-lg bg-orange-50 mr-4">
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Maintenance Logbook</h1>
              <p className="text-gray-600 mt-1">Track equipment maintenance and repairs</p>
            </div>
          </div>
        </div>

        {/* Data Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <DataForm type="maintenance" />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <DataTable endpoint="maintenance" columns={columns} />
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-purple-50 mr-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Maintenance Analytics</h2>
              <p className="text-gray-600 text-sm">Track costs and recurring issues</p>
            </div>
          </div>

          {/* Monthly Costs Chart */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Monthly Costs</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <Bar
                data={{
                  labels: analytics.monthlyCosts.map((c) => c.month),
                  datasets: [
                    {
                      label: 'Cost (₹)',
                      data: analytics.monthlyCosts.map((c) => c.cost),
                      backgroundColor: '#8b5cf6',
                      borderColor: '#7c3aed',
                      borderWidth: 1,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { 
                    legend: { position: 'top' }, 
                    title: { display: true, text: 'Monthly Maintenance Costs' }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: '#f3f4f6',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Frequent Issues */}
          <div>
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Frequent Issues</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              {analytics.frequentIssues.length > 0 ? (
                <div className="space-y-3">
                  {analytics.frequentIssues.map((issue, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {issue.equipment} - {issue.issue}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        {issue.count} times
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No frequent issues data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;