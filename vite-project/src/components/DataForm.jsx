import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

const DataForm = ({ type }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    material: '',
    quantity: '',
    truck: '',
    vendor: '',
    destination: '',
    rate: '',
    freight: '',
    paymentMethod: 'Cash',
    expenseCategory: '',
    amount: '',
    equipment: '',
    issue: '',
    cost: '',
    remarks: '',
    file: null,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = {
        production: '/production',
        dispatch: '/dispatch',
        sales: '/sales',
        expenses: '/expenses',
        maintenance: '/maintenance',
      }[type];

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });

      await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, data, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/${type}`);
    } catch (err) {
      setError('Error: ' + (err.response?.data?.message || 'Something went wrong'));
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  return (
    <form className="bg-white p-6 rounded-md shadow-md flex flex-col gap-4 w-full max-w-lg">
      <h2 className="text-xl font-semibold">Add {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
      {error && <p className="text-red-500">{error}</p>}
      {['production', 'dispatch', 'sales'].includes(type) && (
        <select
          name="material"
          value={formData.material}
          onChange={handleChange}
          className="border p-2 rounded-md"
        >
          <option value="">Select Material</option>
          <option value="10mm">10mm</option>
          <option value="20mm">20mm</option>
          <option value="Dust">Dust</option>
          <option value="GSB">GSB</option>
        </select>
      )}
      {['production', 'dispatch', 'sales'].includes(type) && (
        <input
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Quantity (tons)"
          className="border p-2 rounded-md"
        />
      )}
      {['dispatch'].includes(type) && (
        <>
          <input
            name="truck"
            value={formData.truck}
            onChange={handleChange}
            placeholder="Truck Number"
            className="border p-2 rounded-md"
          />
          <input
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            placeholder="Vendor"
            className="border p-2 rounded-md"
          />
          <input
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Destination"
            className="border p-2 rounded-md"
          />
          <input
            name="rate"
            type="number"
            value={formData.rate}
            onChange={handleChange}
            placeholder="Rate (₹/ton)"
            className="border p-2 rounded-md"
          />
          <input
            name="freight"
            type="number"
            value={formData.freight}
            onChange={handleChange}
            placeholder="Freight Cost"
            className="border p-2 rounded-md"
          />
        </>
      )}
      {type === 'sales' && (
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="border p-2 rounded-md"
        >
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Bank">Bank</option>
        </select>
      )}
      {type === 'expenses' && (
        <select
          name="expenseCategory"
          value={formData.expenseCategory}
          onChange={handleChange}
          className="border p-2 rounded-md"
        >
          <option value="">Select Category</option>
          <option value="Fuel">Fuel</option>
          <option value="Electricity">Electricity</option>
          <option value="Salary">Salary</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      )}
      {type === 'expenses' && (
        <input
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="border p-2 rounded-md"
        />
      )}
      {type === 'maintenance' && (
        <>
          <input
            name="equipment"
            value={formData.equipment}
            onChange={handleChange}
            placeholder="Equipment"
            className="border p-2 rounded-md"
          />
          <input
            name="issue"
            value={formData.issue}
            onChange={handleChange}
            placeholder="Issue"
            className="border p-2 rounded-md"
          />
          <input
            name="cost"
            type="number"
            value={formData.cost}
            onChange={handleChange}
            placeholder="Cost"
            className="border p-2 rounded-md"
          />
          <input
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Remarks"
            className="border p-2 rounded-md"
          />
          <input
            name="file"
            type="file"
            onChange={handleChange}
            className="border p-2 rounded-md"
          />
        </>
      )}
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </form>
  );
};

export default DataForm;