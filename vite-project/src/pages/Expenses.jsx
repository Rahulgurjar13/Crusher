import DataForm from '../components/DataForm';
import DataTable from '../components/DataTable';

const Expenses = () => {
  const columns = [
    { key: 'expenseCategory', label: 'Category' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'date', label: 'Date' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Expenses</h1>
      <DataForm type="expenses" />
      <DataTable endpoint="expenses" columns={columns} />
    </div>
  );
};

export default Expenses;