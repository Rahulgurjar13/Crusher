import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationBanner = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [enabled, setEnabled] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setNotifications(response.data);
        response.data.slice((page - 1) * rowsPerPage, page * rowsPerPage).forEach((notif) =>
          toast.info(notif.message, { toastId: notif._id })
        );
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, [user, page]);

  const toggleNotifications = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/notifications/toggle`,
        { enabled: !enabled },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setEnabled(!enabled);
      toast.success(`Notifications ${enabled ? 'disabled' : 'enabled'}`);
    } catch (err) {
      console.error('Error toggling notifications:', err);
    }
  };

  const dismissNotification = (id) => {
    toast.dismiss(id);
    setNotifications(notifications.filter((n) => n._id !== id));
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
      <div className="mt-2">
        {notifications.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((notif) => (
          <div key={notif._id} className="bg-yellow-100 p-2 rounded-md mb-2 flex justify-between">
            <span>{notif.message}</span>
            <button
              className="text-red-500"
              onClick={() => dismissNotification(notif._id)}
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {Math.ceil(notifications.length / rowsPerPage)}</span>
        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={() => setPage(page + 1)}
          disabled={page * rowsPerPage >= notifications.length}
        >
          Next
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default NotificationBanner;