import { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Move components outside to prevent recreation on every render
const InputField = ({ name, type = 'text', placeholder, required = false, accept, step, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {placeholder}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      name={name}
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      accept={accept}
      required={required}
      step={step}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const SelectField = ({ name, options, placeholder, required = false, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {placeholder}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const FileInput = ({ name, accept, onChange, selectedFileName, onRemoveFile, dragActive, onDragEnter, onDragLeave, onDragOver, onDrop }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Attachment
      <span className="text-gray-500 text-xs ml-1">(optional)</span>
    </label>
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        name={name}
        type="file"
        onChange={onChange}
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      {selectedFileName ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{selectedFileName}</span>
          </div>
          <button
            type="button"
            onClick={onRemoveFile}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Remove file
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
              Click to upload
            </span>
            <span> or drag and drop</span>
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, PDF up to 10MB
          </p>
        </div>
      )}
    </div>
  </div>
);

const SubmitButton = ({ loading }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md disabled:cursor-not-allowed transition-colors"
  >
    {loading ? 'Submitting...' : 'Submit'}
  </button>
);

const FormContainer = ({ title, children }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  </div>
);

const DataForm = ({ type, customTitle, customFields }) => {
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
    paymentStatus: 'Credit',
    expenseCategory: '',
    amount: '',
    equipment: '',
    issue: '',
    cost: '',
    remarks: '',
    file: null,
    name: '',
    number: '',
  });
  const [materials, setMaterials] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [materialRes, truckRes, vendorRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/materials`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/trucks`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/vendors`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);
        setMaterials(materialRes.data);
        setTrucks(truckRes.data);
        setVendors(vendorRes.data);
      } catch (err) {
        console.error('Error fetching options:', err);
        toast.error(err.response?.data?.message || 'Failed to load form options');
      }
    };
    if (['production', 'dispatch', 'sales'].includes(type)) {
      fetchOptions();
    }
  }, [user, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = {
        production: '/production',
        dispatch: '/dispatch',
        sales: '/sales',
        expenses: '/expenses',
        maintenance: '/maintenance',
        materials: '/materials',
        trucks: '/trucks',
        vendors: '/vendors',
      }[type];

      let data = {};
      let headers = { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' };

      // Use FormData only for maintenance (file upload)
      if (type === 'maintenance') {
        data = new FormData();
        const fields = ['equipment', 'issue', 'cost', 'remarks', 'file'];
        fields.forEach((key) => {
          if (formData[key] && (!customFields || customFields.includes(key))) {
            data.append(key, formData[key]);
          }
        });
        if (!formData.equipment || !formData.issue || !formData.cost) {
          throw new Error('Equipment, issue, and cost are required');
        }
        headers = { Authorization: `Bearer ${user.token}` }; // Let FormData set Content-Type
      } else {
        // Use JSON for other endpoints
        Object.keys(formData).forEach((key) => {
          if (formData[key] && (!customFields || customFields.includes(key)) && key !== 'file') {
            data[key] = formData[key];
          }
        });

        // Validate required fields
        if (type === 'production' && (!data.material || !data.quantity)) {
          throw new Error('Material and quantity are required');
        } else if (type === 'dispatch' && (!data.truck || !data.vendor || !data.material || !data.quantity)) {
          throw new Error('Truck, vendor, material, and quantity are required');
        } else if (type === 'sales' && (!data.material || !data.quantity || !data.vendor || !data.rate)) {
          throw new Error('Material, quantity, vendor, and rate are required');
        } else if (type === 'expenses' && (!data.expenseCategory || !data.amount)) {
          throw new Error('Expense category and amount are required');
        } else if (type === 'materials' && (!data.name || !data.rate)) {
          throw new Error('Material name and rate are required');
        } else if (type === 'trucks' && !data.number) {
          throw new Error('Truck number is required');
        } else if (type === 'vendors' && !data.name) {
          throw new Error('Vendor name is required');
        }
      }

      await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, data, { headers });
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
      setFormData({
        material: '',
        quantity: '',
        truck: '',
        vendor: '',
        destination: '',
        rate: '',
        freight: '',
        paymentMethod: 'Cash',
        paymentStatus: 'Credit',
        expenseCategory: '',
        amount: '',
        equipment: '',
        issue: '',
        cost: '',
        remarks: '',
        file: null,
        name: '',
        number: '',
      });
      setSelectedFileName('');
      navigate(`/${type}`);
    } catch (err) {
      console.error('Form submission error:', err);
      toast.error(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Use useCallback to prevent function recreation
  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files && files[0]) {
      setSelectedFileName(files[0].name);
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      setFormData(prev => ({ ...prev, file: file }));
    }
  }, []);

  const removeFile = useCallback(() => {
    setFormData(prev => ({ ...prev, file: null }));
    setSelectedFileName('');
  }, []);

  // Custom form for vendors
  if (type === 'vendors') {
    return (
      <FormContainer title={customTitle || 'Add Vendor'}>
        <form onSubmit={handleSubmit}>
          <InputField
            name="name"
            placeholder="Vendor Name"
            required
            value={formData.name}
            onChange={handleChange}
          />
          <div className="mt-6 pt-4 border-t border-gray-200">
            <SubmitButton loading={loading} />
          </div>
        </form>
      </FormContainer>
    );
  }

  // Custom form for trucks
  if (type === 'trucks') {
    return (
      <FormContainer title={customTitle || 'Add Truck'}>
        <form onSubmit={handleSubmit}>
          <InputField
            name="number"
            placeholder="Truck Number"
            required
            value={formData.number}
            onChange={handleChange}
          />
          <div className="mt-6 pt-4 border-t border-gray-200">
            <SubmitButton loading={loading} />
          </div>
        </form>
      </FormContainer>
    );
  }

  // Custom form for materials
  if (type === 'materials') {
    return (
      <FormContainer title={customTitle || 'Add Material'}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="name"
              placeholder="Material Name"
              required
              value={formData.name}
              onChange={handleChange}
            />
            <InputField
              name="rate"
              type="number"
              placeholder="Rate (₹/ton)"
              required
              step="0.01"
              value={formData.rate}
              onChange={handleChange}
            />
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <SubmitButton loading={loading} />
          </div>
        </form>
      </FormContainer>
    );
  }

  // Default form for other types
  return (
    <FormContainer title={customTitle || `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Material and Quantity fields for production, dispatch, sales */}
          {['production', 'dispatch', 'sales'].includes(type) && (
            <>
              <SelectField
                name="material"
                placeholder="Select Material"
                required
                value={formData.material}
                onChange={handleChange}
                options={materials.map(m => ({ value: m.name, label: m.name }))}
              />
              <InputField
                name="quantity"
                type="number"
                placeholder="Quantity (tons)"
                required
                step="0.01"
                value={formData.quantity}
                onChange={handleChange}
              />
            </>
          )}

          {/* Dispatch specific fields */}
          {type === 'dispatch' && (
            <>
              <SelectField
                name="truck"
                placeholder="Select Truck"
                required
                value={formData.truck}
                onChange={handleChange}
                options={trucks.map(t => ({ value: t.number, label: t.number }))}
              />
              <SelectField
                name="vendor"
                placeholder="Select Vendor"
                required
                value={formData.vendor}
                onChange={handleChange}
                options={vendors.map(v => ({ value: v.name, label: v.name }))}
              />
              <InputField
                name="destination"
                placeholder="Destination"
                value={formData.destination}
                onChange={handleChange}
              />
              <InputField
                name="rate"
                type="number"
                placeholder="Rate (₹/ton)"
                step="0.01"
                value={formData.rate}
                onChange={handleChange}
              />
              <InputField
                name="freight"
                type="number"
                placeholder="Freight Cost (₹)"
                step="0.01"
                value={formData.freight}
                onChange={handleChange}
              />
            </>
          )}

          {/* Sales specific fields */}
          {type === 'sales' && (
            <>
              <SelectField
                name="vendor"
                placeholder="Select Vendor"
                required
                value={formData.vendor}
                onChange={handleChange}
                options={vendors.map(v => ({ value: v.name, label: v.name }))}
              />
              <InputField
                name="rate"
                type="number"
                placeholder="Rate (₹/ton)"
                required
                step="0.01"
                value={formData.rate}
                onChange={handleChange}
              />
              <SelectField
                name="paymentMethod"
                placeholder="Payment Method"
                value={formData.paymentMethod}
                onChange={handleChange}
                options={[
                  { value: 'Cash', label: 'Cash' },
                  { value: 'UPI', label: 'UPI' },
                  { value: 'Bank', label: 'Bank Transfer' }
                ]}
              />
              <SelectField
                name="paymentStatus"
                placeholder="Payment Status"
                value={formData.paymentStatus}
                onChange={handleChange}
                options={[
                  { value: 'Credit', label: 'Credit' },
                  { value: 'Paid', label: 'Paid' }
                ]}
              />
            </>
          )}

          {/* Expenses specific fields */}
          {type === 'expenses' && (
            <>
              <SelectField
                name="expenseCategory"
                placeholder="Select Category"
                required
                value={formData.expenseCategory}
                onChange={handleChange}
                options={[
                  { value: 'Fuel', label: 'Fuel' },
                  { value: 'Electricity', label: 'Electricity' },
                  { value: 'Salary', label: 'Salary' },
                  { value: 'Maintenance', label: 'Maintenance' },
                  { value: 'Other', label: 'Other' }
                ]}
              />
              <InputField
                name="amount"
                type="number"
                placeholder="Amount (₹)"
                required
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
              />
            </>
          )}

          {/* Maintenance specific fields */}
          {type === 'maintenance' && (
            <>
              <InputField
                name="equipment"
                placeholder="Equipment Name"
                required
                value={formData.equipment}
                onChange={handleChange}
              />
              <InputField
                name="issue"
                placeholder="Issue Description"
                required
                value={formData.issue}
                onChange={handleChange}
              />
              <InputField
                name="cost"
                type="number"
                placeholder="Repair Cost (₹)"
                required
                step="0.01"
                value={formData.cost}
                onChange={handleChange}
              />
              <div className="md:col-span-2">
                <InputField
                  name="remarks"
                  placeholder="Additional Remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <FileInput
                  name="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleChange}
                  selectedFileName={selectedFileName}
                  onRemoveFile={removeFile}
                  dragActive={dragActive}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                />
              </div>
            </>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <SubmitButton loading={loading} />
        </div>
      </form>
    </FormContainer>
  );
};

export default DataForm;