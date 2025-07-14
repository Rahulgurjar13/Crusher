import './App.css';
import { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthForm type="login" />} />
          <Route path="/reset-password" element={<AuthForm type="reset" />} />
          <Route path="/reset-password/verify" element={<AuthForm type="verify" />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/production" element={<PrivateRoute><Production /></PrivateRoute>} />
          <Route path="/dispatch" element={<PrivateRoute><Dispatch /></PrivateRoute>} />
          <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
          <Route path="/stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
          <Route path="/rates" element={<PrivateRoute><Rates /></PrivateRoute>} />
          <Route path="/vendor-ledger" element={<PrivateRoute><VendorLedger /></PrivateRoute>} />
          <Route path="/maintenance" element={<PrivateRoute><Maintenance /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/audit-logs" element={<PrivateRoute><AuditLogs /></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute><CalendarView /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

export default App;