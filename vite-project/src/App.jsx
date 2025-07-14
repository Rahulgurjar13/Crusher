import './App.css';
import { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import Home from './pages/Home';
import Production from './pages/Production';
import Dispatch from './pages/Dispatch';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Stock from './pages/Stock';
import Rates from './pages/Rates';
import VendorLedger from './pages/VendorLedger';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import CalendarView from './components/CalendarView';
import Materials from './pages/Materials';
import Trucks from './pages/Trucks';
import Vendors from './pages/Vendors';

export const AuthContext = createContext();

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    return token && role ? { token, role } : null;
  });

  const refreshToken = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${apiUrl}/auth/refresh-token`, {
        refreshToken: localStorage.getItem('refreshToken'),
      });
      console.log('Refresh token response:', response.data);
      localStorage.setItem('token', response.data.token);
      setUser({ ...user, token: response.data.token });
      return response.data.token;
    } catch (err) {
      console.error('Refresh token error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
  };

  useEffect(() => {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error('API error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          headers: error.config?.headers,
        });
        if (error.response?.status === 401 && error.response?.data?.message === 'Token expired') {
          console.log('Token expired, attempting to refresh');
          const newToken = await refreshToken();
          if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axios(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refreshToken, logout }}>
      <BrowserRouter>
        {user && (
          <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-b border-blue-500">
            <div className="container mx-auto px-6">
              {/* Top Header */}
              <div className="flex justify-between items-center py-4">
                <div className="text-2xl font-bold text-white">Stone Crusher Portal</div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-blue-100">Welcome, {user.role}</span>
                  <button 
                    onClick={logout} 
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </div>
              
              {/* Navigation Links */}
              <div className="border-t border-blue-500 border-opacity-30 py-3">
                <div className="flex flex-wrap gap-2">
                  {/* Primary Navigation */}
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to="/dashboard" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-indigo-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-indigo-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                    >
                      Dashboard
                    </Link>
                    
                    {['admin', 'operator'].includes(user.role) && (
                      <>
                        <Link 
                          to="/production" 
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-green-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-green-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                        >
                          Production
                        </Link>
                        <Link 
                          to="/dispatch" 
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-orange-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-orange-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                        >
                          Dispatch
                        </Link>
                        <Link 
                          to="/sales" 
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-purple-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-purple-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                        >
                          Sales
                        </Link>
                        <Link 
                          to="/expenses" 
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-red-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-red-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                        >
                          Expenses
                        </Link>
                        <Link 
                          to="/maintenance" 
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-yellow-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-yellow-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                        >
                          Maintenance
                        </Link>
                      </>
                    )}
                    
                    <Link 
                      to="/stock" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-teal-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-teal-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                    >
                      Stock
                    </Link>
                    <Link 
                      to="/rates" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-cyan-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-cyan-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                    >
                      Rates
                    </Link>
                    
                    {['admin', 'partner'].includes(user.role) && (
                      <>
                        <Link 
                          to="/vendor-ledger" 
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-emerald-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-emerald-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                        >
                          Vendor Ledger
                        </Link>
                        <Link 
                          to="/reports" 
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-violet-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-violet-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                        >
                          Reports
                        </Link>
                        <Link 
                          to="/audit-logs" 
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-pink-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-pink-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                        >
                          Audit Logs
                        </Link>
                      </>
                    )}
                    
                    <Link 
                      to="/calendar" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-rose-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-rose-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                    >
                      Calendar
                    </Link>
                    <Link 
                      to="/materials" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-amber-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-amber-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                    >
                      Materials
                    </Link>
                    <Link 
                      to="/trucks" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-lime-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-lime-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                    >
                      Trucks
                    </Link>
                    <Link 
                      to="/vendors" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-sky-500 hover:bg-opacity-30 border border-blue-300 border-opacity-30 hover:border-sky-300 hover:border-opacity-50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-105"
                    >
                      Vendors
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        )}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthForm type="login" />} />
              <Route path="/reset-password" element={<AuthForm type="reset" />} />
              <Route path="/reset-password/verify" element={<AuthForm type="verify" />} />
              <Route path="/dashboard" element={<PrivateRoute roles={['admin', 'partner', 'operator']}><Dashboard /></PrivateRoute>} />
              <Route path="/production" element={<PrivateRoute roles={['admin', 'operator']}><Production /></PrivateRoute>} />
              <Route path="/dispatch" element={<PrivateRoute roles={['admin', 'operator']}><Dispatch /></PrivateRoute>} />
              <Route path="/sales" element={<PrivateRoute roles={['admin', 'operator']}><Sales /></PrivateRoute>} />
              <Route path="/expenses" element={<PrivateRoute roles={['admin', 'operator']}><Expenses /></PrivateRoute>} />
              <Route path="/stock" element={<PrivateRoute roles={['admin', 'partner', 'operator']}><Stock /></PrivateRoute>} />
              <Route path="/rates" element={<PrivateRoute roles={['admin', 'partner', 'operator']}><Rates /></PrivateRoute>} />
              <Route path="/vendor-ledger" element={<PrivateRoute roles={['admin', 'partner']}><VendorLedger /></PrivateRoute>} />
              <Route path="/maintenance" element={<PrivateRoute roles={['admin', 'operator']}><Maintenance /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute roles={['admin', 'partner']}><Reports /></PrivateRoute>} />
              <Route path="/audit-logs" element={<PrivateRoute roles={['admin', 'partner']}><AuditLogs /></PrivateRoute>} />
              <Route path="/calendar" element={<PrivateRoute roles={['admin', 'partner', 'operator']}><CalendarView /></PrivateRoute>} />
              <Route path="/materials" element={<PrivateRoute roles={['admin', 'partner', 'operator']}><Materials /></PrivateRoute>} />
              <Route path="/trucks" element={<PrivateRoute roles={['admin', 'partner', 'operator']}><Trucks /></PrivateRoute>} />
              <Route path="/vendors" element={<PrivateRoute roles={['admin', 'partner', 'operator']}><Vendors /></PrivateRoute>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

function PrivateRoute({ children, roles }) {
  const { user } = useContext(AuthContext);
  return user && roles.includes(user.role) ? children : <Navigate to="/login" />;
}

export default App;