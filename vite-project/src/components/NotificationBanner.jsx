import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationBanner = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setNotifications(response.data);
        response.data.forEach((notif) => toast.info(notif.message));
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, [user]);

  const toggleNotifications = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/notifications/toggle`,
        { enabled: !enabled },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setEnabled(!enabled);
      toast.success(`Notifications ${enabled ? 'disabled' : 'enabled'}`);
    } catch (err) {
      console.error('Error toggling notifications:', err);
    }
  };

  return (
    <div className="mb-4">
      {user.role === 'admin' && (
        <button
          className={`p-2 rounded-md ${enabled ? 'bg-red-500' : 'bg-green-500'} text-white`}
          onClick={toggleNotifications}
        >
          {enabled ? 'Disable Notifications' : 'Enable Notifications'}
        </button>
      )}
      <ToastContainer />
    </div>
  );
};

export default NotificationBanner;