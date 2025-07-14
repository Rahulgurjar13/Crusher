import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';

const CalendarView = () => {
  const [date, setDate] = useState(new Date());
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/logs`, {
          params: { date: date.toISOString().split('T')[0] },
        });
        setLogs(response.data);
      } catch (err) {
        console.error('Error fetching logs:', err);
      }
    };
    fetchLogs();
  }, [date]);

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
            <li key={i} className="py-1">{log.type}: {log.details}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CalendarView;