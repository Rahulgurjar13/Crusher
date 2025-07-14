import { useContext } from 'react';
import { AuthContext } from '../App';
import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';

const Trucks = () => {
  const { user } = useContext(AuthContext);
  const columns = [
    { key: 'number', label: 'Truck Number' },
  ];

  if (!['admin', 'partner', 'operator'].includes(user.role)) {
    return <div className="p-6 text-red-500">Access Denied</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Trucks</h1>
      {user.role === 'admin' && (
        <DataForm
          type="trucks"
          customTitle="Add Truck"
          customFields={['number']}
        />
      )}
      <DataTable endpoint="trucks" columns={columns} />
    </div>
  );
};

export default Trucks;