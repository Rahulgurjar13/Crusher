import { useState, useEffect, useContext } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import { AuthContext } from '../App';

const CalendarView = () => {
  const { user } = useContext(AuthContext);
  const [date, setDate] = useState(new Date());
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/logs`, {
          params: { date: date.toISOString().split('T')[0] },
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setLogs(response.data.map(log => ({
          ...log,
          date: new Date(log.date).toLocaleDateString(),
        })));
      } catch (err) {
        console.error('Error fetching logs:', err);
      }
    };
    fetchLogs();
  }, [date, user]);

  if (!['admin', 'partner', 'operator'].includes(user.role)) {
    return <div className="p-6 text-red-500">Access Denied</div>;
  }

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Activity Calendar</h2>
      <Calendar
        onChange={setDate}
        value={date}
        className="mb-4"
      />
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Logs for {date.toLocaleDateString()}</h3>
        <ul className="list-disc pl-5">
          {logs.map((log, i) => (
            <li key={i} className="py-1">{log.type}: {log.details} ({log.date})</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CalendarView;