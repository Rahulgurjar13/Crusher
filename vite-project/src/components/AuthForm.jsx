import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

const AuthForm = ({ type }) => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    axios.get(`${apiUrl}/health`)
      .then((response) => {
        console.log('Health check:', response.data);
        setServerStatus(response.data.status === 'ok' ? 'Backend is running' : 'Backend error');
      })
      .catch((err) => {
        console.error('Health check error:', err);
        setServerStatus('Backend not reachable');
        setError('Error: Backend server is not running or is misconfigured at http://localhost:3000');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      if (!import.meta.env.VITE_API_URL) {
        console.warn('VITE_API_URL is not defined in .env, using fallback:', apiUrl);
      }
      if (type === 'login') {
        const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
        console.log('Login response:', response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('role', response.data.role);
        setUser({ token: response.data.token, role: response.data.role });
        navigate('/dashboard');
      } else if (type === 'reset') {
        await axios.post(`${apiUrl}/auth/reset-password`, { email });
        setError('Password reset link sent to your email.');
      } else if (type === 'verify') {
        const token = new URLSearchParams(location.search).get('token');
        await axios.post(`${apiUrl}/auth/reset-password/verify`, {
          token,
          newPassword,
        });
        setError('Password reset successfully');
        navigate('/login');
      }
    } catch (err) {
      console.error('Auth error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        headers: err.response?.headers,
        requestData: err.config?.data,
      });
      let errorMessage = err.response?.data?.message || 'Something went wrong';
      if (err.response?.status === 403) {
        errorMessage = err.response?.headers?.server?.includes('AirTunes')
          ? 'Wrong server: Another application (possibly AirTunes) is running on port 3000'
          : 'Forbidden: Check backend CORS settings for http://localhost:5173';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error: Ensure the backend server is running at http://localhost:3000';
      }
      setError(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded-md shadow-md w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center">
          {type === 'login' ? 'Login' : type === 'reset' ? 'Reset Password' : 'Verify Password Reset'}
        </h2>
        {serverStatus && <p className="text-blue-500">{serverStatus}</p>}
        {error && <p className="text-red-500">{error}</p>}
        {['login', 'reset'].includes(type) && (
          <input
            className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        )}
        {type === 'login' && (
          <input
            className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        )}
        {type === 'verify' && (
          <input
            className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
          />
        )}
        <button
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          onClick={handleSubmit}
        >
          {type === 'login' ? 'Login' : type === 'reset' ? 'Reset Password' : 'Verify Reset'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;