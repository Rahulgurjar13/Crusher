import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { Link } from 'react-router-dom';
import NotificationBanner from './NotificationBanner';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({
    production: 0,
    dispatch: 0,
    sales: 0,
    expenses: 0,
    profit: 0,
    stock: [],
    partnerShare: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMetrics(response.data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    };
    fetchMetrics();
  }, [user]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <NotificationBanner />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {user.role === 'admin' && (
          <>
            <div className="bg-white p-4 rounded-md shadow-md">
              <h2 className="text-xl font-semibold">Today’s Production</h2>
              <p>{metrics.production} tons</p>
              <Link to="/production" className="text-blue-500 hover:underline">Add Production</Link>
            </div>
            <div className="bg-white p-4 rounded-md shadow-md">
              <h2 className="text-xl font-semibold">Truck Dispatches</h2>
              <p>{metrics.dispatch} trips</p>
              <Link to="/dispatch" className="text-blue-500 hover:underline">Add Dispatch</Link>
            </div>
          </>
        )}
        {user.role !== 'operator' && (
          <>
            <div className="bg-white p-4 rounded-md shadow-md">
              <h2 className="text-xl font-semibold">Sales</h2>
              <p>₹{metrics.sales}</p>
              <Link to="/sales" className="text-blue-500 hover:underline">View Sales</Link>
            </div>
            <div className="bg-white p-4 rounded-md shadow-md">
              <h2 className="text-xl font-semibold">Expenses</h2>
              <p>₹{metrics.expenses}</p>
              <Link to="/expenses" className="text-blue-500 hover:underline">View Expenses</Link>
            </div>
            <div className="bg-white p-4 rounded-md shadow-md">
              <h2 className="text-xl font-semibold">Profit</h2>
              <p>₹{metrics.profit}</p>
              <Link to="/reports" className="text-blue-500 hover:underline">View Reports</Link>
            </div>
            {user.role === 'partner' && (
              <div className="bg-white p-4 rounded-md shadow-md">
                <h2 className="text-xl font-semibold">Your Share (20%)</h2>
                <p>₹{metrics.partnerShare}</p>
              </div>
            )}
          </>
        )}
        {user.role === 'operator' && (
          <div className="bg-white p-4 rounded-md shadow-md">
            <h2 className="text-xl font-semibold">Data Entry</h2>
            <Link to="/production" className="text-blue-500 hover:underline">Add Production</Link>
            <Link to="/dispatch" className="text-blue-500 hover:underline ml-4">Add Dispatch</Link>
            <Link to="/sales" className="text-blue-500 hover:underline ml-4">Add Sale</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;