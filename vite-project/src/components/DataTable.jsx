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
    
    // Add title with better formatting
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} Report`, 14, 20);
    
    // Add generated date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare table data with proper formatting
    const tableData = data.map(item => 
      columns.map(col => {
        const value = item[col.key];
        if (col.format && value !== null && value !== undefined) {
          return col.format(value);
        }
        return value || 'N/A';
      })
    );
    
    doc.autoTable({
      startY: 40,
      head: [columns.map(col => col.label)],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [59, 130, 246], // Blue-500
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Gray-50
      },
      columnStyles: {
        // Auto-adjust column widths
        0: { cellWidth: 'auto' }
      },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      margin: { top: 40, right: 14, bottom: 20, left: 14 }
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
    <div className="w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <ToastContainer position="top-right" />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 text-white p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold capitalize tracking-wide">
              {endpoint.replace(/([A-Z])/g, ' $1').trim()} Data
            </h2>
            <p className="text-indigo-100 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full"></span>
              {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} found
            </p>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-3">
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              onClick={exportToExcel}
              disabled={loading || data.length === 0}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
              </svg>
              Excel
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              onClick={exportToPDF}
              disabled={loading || data.length === 0}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"/>
              </svg>
              PDF
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              onClick={exportToJSON}
              disabled={loading || data.length === 0}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
            placeholder="Search records..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">Loading data...</p>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Data Found</h3>
            <p className="text-purple-600 font-medium">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-all duration-200 select-none"
                          onClick={() => handleSort(col.key)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-700">{col.label}</span>
                            <div className="flex flex-col">
                              <svg 
                                className={`w-3 h-3 ${sort.key === col.key && sort.order === 'asc' ? 'text-emerald-600' : 'text-gray-400'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/>
                              </svg>
                              <svg 
                                className={`w-3 h-3 -mt-1 ${sort.key === col.key && sort.order === 'desc' ? 'text-rose-600' : 'text-gray-400'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                              </svg>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((row, i) => (
                      <tr key={i} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                        {columns.map((col) => (
                          <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="max-w-xs truncate text-gray-800 font-medium" title={col.format ? col.format(row[col.key]) : row[col.key] || 'N/A'}>
                              {col.format ? col.format(row[col.key]) : row[col.key] || 'N/A'}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                <div className="text-sm text-gray-700 font-medium bg-white px-4 py-2 rounded-lg shadow-sm">
                  Showing <span className="text-purple-600 font-bold">{(page - 1) * rowsPerPage + 1}</span> to <span className="text-purple-600 font-bold">{Math.min(page * rowsPerPage, filteredData.length)}</span> of <span className="text-indigo-600 font-bold">{filteredData.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                            pageNum === page
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                              : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages || loading}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DataTable;