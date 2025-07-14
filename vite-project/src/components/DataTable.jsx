import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DataTable = ({ endpoint, columns, data: preloadedData, emptyMessage = 'No data available' }) => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(preloadedData || []);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({ key: columns[0]?.key || '', order: 'asc' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!preloadedData) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          // Handle both flat array and paginated response
          const fetchedData = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];
          const formattedData = fetchedData.map(item => ({
            ...item,
            user: item.user?.email || item.user || 'N/A',
            changedBy: item.changedBy?.email || item.changedBy || 'N/A',
            saleId: item.saleId?._id || item.saleId || 'N/A',
            date: item.date ? new Date(item.date).toLocaleDateString() : 'N/A',
            lastUpdated: item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A',
          }));
          setData(formattedData);
          // Set total pages for client-side pagination
          setTotalPages(Math.ceil(formattedData.length / rowsPerPage));
        } catch (err) {
          console.error('Error fetching data:', err);
          toast.error(err.response?.data?.message || `Failed to load ${endpoint} data`);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setData(preloadedData);
      setTotalPages(Math.ceil(preloadedData.length / rowsPerPage));
    }
  }, [endpoint, user.token, preloadedData, rowsPerPage]);

  const exportToExcel = () => {
    const formattedData = data.map(item => {
      const row = {};
      columns.forEach(col => {
        row[col.label] = col.format ? col.format(item[col.key]) : item[col.key] || 'N/A';
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${endpoint}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} Report`, 14, 20);
    doc.autoTable({
      startY: 30,
      head: [columns.map(col => col.label)],
      body: data.map(item => columns.map(col => col.format ? col.format(item[col.key]) : item[col.key] || 'N/A')),
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });
    doc.save(`${endpoint}.pdf`);
  };

  const exportToJSON = () => {
    const formattedData = data.map(item => {
      const row = {};
      columns.forEach(col => {
        row[col.key] = col.format ? col.format(item[col.key]) : item[col.key] || 'N/A';
      });
      return row;
    });
    const blob = new Blob([JSON.stringify(formattedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${endpoint}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (key) => {
    setSort({
      key,
      order: sort.key === key && sort.order === 'asc' ? 'desc' : 'asc',
    });
    setPage(1); // Reset to first page on sort change
  };

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sort.key] || '';
    const valB = b[sort.key] || '';
    return sort.order === 'asc'
      ? valA.toString().localeCompare(valB.toString(), undefined, { numeric: true })
      : valB.toString().localeCompare(valA.toString(), undefined, { numeric: true });
  });

  const filteredData = sortedData.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(filter.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="w-full p-6">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <input
          className="border p-2 rounded-md w-full sm:w-1/3"
          placeholder="Filter data..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1); // Reset to first page on filter change
          }}
        />
        <div className="flex gap-2">
          <button
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
            onClick={exportToExcel}
            disabled={loading || data.length === 0}
          >
            Excel
          </button>
          <button
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            onClick={exportToPDF}
            disabled={loading || data.length === 0}
          >
            PDF
          </button>
          <button
            className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 disabled:bg-gray-400"
            onClick={exportToJSON}
            disabled={loading || data.length === 0}
          >
            JSON
          </button>
        </div>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : paginatedData.length === 0 ? (
        <p className="text-gray-500">{emptyMessage}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-md shadow-md">
              <thead>
                <tr className="bg-gray-200">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="p-2 text-left cursor-pointer hover:bg-gray-300"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label} {sort.key === col.key ? (sort.order === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.key} className="p-2">
                        {col.format ? col.format(row[col.key]) : row[col.key] || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between mt-4">
              <button
                className="bg-blue-500 text-white p-2 rounded-md disabled:bg-gray-400"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                className="bg-blue-500 text-white p-2 rounded-md disabled:bg-gray-400"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;