import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportCharts = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/reports`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const { profit, expenses, partnerShare } = response.data;
        setChartData({
          labels: ['Profit', 'Expenses', 'Partner Share'],
          datasets: [
            {
              label: 'Financial Overview',
              data: [profit, expenses, partnerShare],
              backgroundColor: ['#4b5e40', '#8b8b8b', '#ff9900'],
            },
          ],
        });
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Financial Reports</h2>
      <div className="w-full h-64">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: { legend: { position: 'top' }, title: { display: true, text: 'Financial Overview' } },
          }}
        />
      </div>
    </div>
  );
};

export default ReportCharts;