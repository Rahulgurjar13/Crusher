import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { Link } from 'react-router-dom';
import NotificationBanner from './NotificationBanner';
import { 
  TrendingUp, 
  Truck, 
  DollarSign, 
  TrendingDown, 
  PieChart, 
  Package, 
  AlertTriangle,
  Plus,
  Eye,
  FileText,
  Activity
} from 'lucide-react';

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
    pendingDues: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMetrics(response.data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      }
    };
    fetchMetrics();
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const MetricCard = ({ title, value, icon: Icon, linkTo, linkText, color = "blue", suffix = "" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
      </div>
      {linkTo && (
        <Link 
          to={linkTo} 
          className={`inline-flex items-center text-sm font-medium text-${color}-600 hover:text-${color}-700 transition-colors duration-200`}
        >
          {linkText}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );

  const QuickActionCard = ({ title, actions }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors duration-200 group"
          >
            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );

  const StockCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Stock Levels</h3>
        <Package className="w-6 h-6 text-blue-600" />
      </div>
      <div className="space-y-3 mb-4">
        {metrics.stock.length > 0 ? (
          metrics.stock.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center">
                {item.quantity < 50 && (
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                )}
                <span className={`text-sm font-medium ${item.quantity < 50 ? 'text-red-600' : 'text-gray-700'}`}>
                  {item.material}
                </span>
              </div>
              <span className={`text-sm font-semibold ${item.quantity < 50 ? 'text-red-600' : 'text-gray-900'}`}>
                {item.quantity} tons
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No stock data available</p>
        )}
      </div>
      <Link 
        to="/stock" 
        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
      >
        <Eye className="w-4 h-4 mr-1" />
        View Stock Details
      </Link>
    </div>
  );

  const getRoleBasedGreeting = () => {
    const greetings = {
      admin: "Welcome back, Administrator",
      partner: "Welcome back, Partner",
      operator: "Welcome back, Operator"
    };
    return greetings[user.role] || "Welcome back";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">{getRoleBasedGreeting()}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Notification Banner */}
        <div className="mb-6">
          <NotificationBanner />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Admin Only Cards */}
          {user.role === 'admin' && (
            <>
              <MetricCard
                title="Today's Production"
                value={metrics.production}
                suffix=" tons"
                icon={TrendingUp}
                linkTo="/production"
                linkText="Add Production"
                color="green"
              />
              <MetricCard
                title="Truck Dispatches"
                value={metrics.dispatch}
                suffix=" trips"
                icon={Truck}
                linkTo="/dispatch"
                linkText="Add Dispatch"
                color="blue"
              />
            </>
          )}

          {/* Non-Operator Cards */}
          {user.role !== 'operator' && (
            <>
              <MetricCard
                title="Sales"
                value={formatCurrency(metrics.sales)}
                icon={DollarSign}
                linkTo="/sales"
                linkText="View Sales"
                color="emerald"
              />
              <MetricCard
                title="Expenses"
                value={formatCurrency(metrics.expenses)}
                icon={TrendingDown}
                linkTo="/expenses"
                linkText="View Expenses"
                color="red"
              />
              <MetricCard
                title="Profit"
                value={formatCurrency(metrics.profit)}
                icon={PieChart}
                linkTo="/reports"
                linkText="View Reports"
                color="purple"
              />
              <MetricCard
                title="Pending Dues"
                value={formatCurrency(metrics.pendingDues)}
                icon={AlertTriangle}
                linkTo="/vendor-ledger"
                linkText="View Ledger"
                color="orange"
              />
            </>
          )}

          {/* Partner Share Card */}
          {user.role === 'partner' && (
            <MetricCard
              title="Your Share (20%)"
              value={formatCurrency(metrics.partnerShare)}
              icon={PieChart}
              color="indigo"
            />
          )}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Levels */}
          <div className="lg:col-span-1">
            <StockCard />
          </div>

          {/* Quick Actions for Operator */}
          {user.role === 'operator' && (
            <div className="lg:col-span-2">
              <QuickActionCard
                title="Data Entry"
                actions={[
                  { label: "Add Production", link: "/production" },
                  { label: "Add Dispatch", link: "/dispatch" },
                  { label: "Add Sale", link: "/sales" }
                ]}
              />
            </div>
          )}

          {/* Additional Quick Actions for Admin/Partner */}
          {user.role !== 'operator' && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/reports"
                    className="flex items-center p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
                  >
                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Generate Reports</p>
                      <p className="text-sm text-gray-600">View detailed analytics</p>
                    </div>
                  </Link>
                  <Link
                    to="/stock"
                    className="flex items-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
                  >
                    <Activity className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Monitor Stock</p>
                      <p className="text-sm text-gray-600">Track inventory levels</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;