import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation links based on user role
  const navLinks = {
    admin: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/production', label: 'Production' },
      { path: '/dispatch', label: 'Dispatch' },
      { path: '/sales', label: 'Sales' },
      { path: '/expenses', label: 'Expenses' },
      { path: '/stock', label: 'Stock' },
      { path: '/rates', label: 'Rates' },
      { path: '/vendor-ledger', label: 'Vendor Ledger' },
      { path: '/maintenance', label: 'Maintenance' },
      { path: '/reports', label: 'Reports' },
      { path: '/audit-logs', label: 'Audit Logs' },
      { path: '/calendar', label: 'Calendar' },
    ],
    partner: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/production', label: 'Production' },
      { path: '/dispatch', label: 'Dispatch' },
      { path: '/sales', label: 'Sales' },
      { path: '/expenses', label: 'Expenses' },
      { path: '/stock', label: 'Stock' },
      { path: '/rates', label: 'Rates' },
      { path: '/vendor-ledger', label: 'Vendor Ledger' },
      { path: '/maintenance', label: 'Maintenance' },
      { path: '/reports', label: 'Reports' },
      { path: '/audit-logs', label: 'Audit Logs' },
      { path: '/calendar', label: 'Calendar' },
    ],
    operator: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/production', label: 'Production' },
      { path: '/dispatch', label: 'Dispatch' },
      { path: '/sales', label: 'Sales' },
      { path: '/expenses', label: 'Expenses' },
      { path: '/maintenance', label: 'Maintenance' },
    ],
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-b border-blue-500">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Stone Crusher Portal</h1>
          <div className="flex gap-1 items-center">
            {user && navLinks[user.role].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 hover:shadow-sm"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="ml-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;