import ReportCharts from '../components/ReportCharts';
import DataTable from '../components/DataTable';

const Reports = () => {
  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'date', label: 'Date' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Financial Reports</h1>
      <ReportCharts />
      <DataTable endpoint="reports" columns={columns} />
    </div>
  );
};

export default Reports;