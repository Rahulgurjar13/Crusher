import { useContext } from 'react';
import { AuthContext } from '../App';
import DataTable from '../components/DataTable';

const AuditLogs = () => {
  const { user } = useContext(AuthContext);
  const columns = [
    { key: 'action', label: 'Action' },
    { key: 'user', label: 'User' },
    { key: 'date', label: 'Date' },
  ];

  if (user.role !== 'partner') {
    return <div className="p-6 text-red-500">Access Denied</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>
      <DataTable endpoint="audit-logs" columns={columns} />
    </div>
  );
};

export default AuditLogs;