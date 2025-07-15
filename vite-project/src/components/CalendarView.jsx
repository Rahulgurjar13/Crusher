import { useState, useEffect, useContext } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import { AuthContext } from '../App';
import { CalendarDays, Clock, User, Activity, AlertCircle, Search, Filter, Download, RefreshCw, ChevronRight, Eye, Calendar as CalIcon, TrendingUp, BarChart3, Settings } from 'lucide-react';

const CalendarView = () => {
  const { user } = useContext(AuthContext);
  const [date, setDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [stats, setStats] = useState({ total: 0, errors: 0, warnings: 0, info: 0 });

  const fetchLogs = async (selectedDate = date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/logs`, {
        params: { date: selectedDate.toISOString().split('T')[0] },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const processedLogs = response.data.map(log => ({
        ...log,
        date: new Date(log.date).toLocaleDateString(),
        time: new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: log.id || Math.random().toString(36).substr(2, 9)
      }));
      setLogs(processedLogs);
      
      // Calculate stats
      const newStats = {
        total: processedLogs.length,
        errors: processedLogs.filter(log => log.type === 'error').length,
        warnings: processedLogs.filter(log => log.type === 'warning').length,
        info: processedLogs.filter(log => log.type === 'info').length
      };
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to fetch logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [date, user]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const logTypes = [...new Set(logs.map(log => log.type))];

  const getLogTypeStyle = (type) => {
    const styles = {
      error: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badge: 'bg-red-500',
        icon: 'text-red-500'
      },
      warning: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-500',
        icon: 'text-amber-500'
      },
      info: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        badge: 'bg-blue-500',
        icon: 'text-blue-500'
      },
      success: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-500',
        icon: 'text-emerald-500'
      }
    };
    return styles[type] || styles.info;
  };

  const getLogTypeIcon = (type) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'info': return <Activity className="w-4 h-4" />;
      case 'success': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Type,Details,Date,Time\n" +
      filteredLogs.map(log => `${log.type},"${log.details}",${log.date},${log.time}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `activity_logs_${date.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (!['admin', 'partner', 'operator'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">Access Denied</h2>
          <p className="text-gray-600 text-center leading-relaxed">You don't have the required permissions to view this page. Please contact your administrator.</p>
          <button className="w-full mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Activity Calendar</h1>
                  <p className="text-blue-100 mt-1">Monitor and track system activities</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <User className="w-5 h-5 text-white" />
                  <span className="text-white font-medium capitalize">{user.role}</span>
                </div>
                <button className="p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Logs"
            value={stats.total}
            icon={BarChart3}
            color="bg-blue-500"
            trend="+12% from yesterday"
          />
          <StatCard
            title="Errors"
            value={stats.errors}
            icon={AlertCircle}
            color="bg-red-500"
          />
          <StatCard
            title="Warnings"
            value={stats.warnings}
            icon={AlertCircle}
            color="bg-amber-500"
          />
          <StatCard
            title="Info"
            value={stats.info}
            icon={Activity}
            color="bg-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar Section */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <CalIcon className="w-5 h-5 mr-3 text-blue-600" />
                  Select Date
                </h2>
                <p className="text-sm text-gray-600 mt-1">Choose a date to view logs</p>
              </div>
              
              <div className="p-6">
                <div className="calendar-container">
                  <Calendar
                    onChange={setDate}
                    value={date}
                    className="w-full border-0 shadow-none modern-calendar"
                    tileClassName="hover:bg-blue-50 rounded-lg transition-all duration-200 relative"
                  />
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Selected Date</p>
                      <p className="text-lg font-bold text-blue-800">{date.toLocaleDateString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logs Section */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Controls Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-blue-600" />
                      Activity Logs
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredLogs.length} logs found for {date.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'list' 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        List
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'grid' 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Grid
                      </button>
                    </div>
                    
                    <button
                      onClick={() => fetchLogs()}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    
                    <button
                      onClick={exportLogs}
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search logs by type or details..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                    />
                  </div>
                  <div className="relative sm:w-48">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white shadow-sm transition-all duration-200"
                    >
                      <option value="all">All Types</option>
                      {logTypes.map(type => (
                        <option key={type} value={type} className="capitalize">{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Logs Content */}
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Loading logs...</p>
                      <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Logs</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={() => fetchLogs()}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Logs Found</h3>
                    <p className="text-gray-600">No activity logs found for the selected date and filters.</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 p-6' : 'divide-y divide-gray-100'}>
                    {filteredLogs.map((log) => {
                      const style = getLogTypeStyle(log.type);
                      return viewMode === 'grid' ? (
                        <div
                          key={log.id}
                          className={`${style.bg} ${style.border} border rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group`}
                          onClick={() => setSelectedLog(log)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`flex items-center space-x-2 ${style.icon}`}>
                              {getLogTypeIcon(log.type)}
                              <span className={`text-sm font-semibold ${style.text} capitalize`}>
                                {log.type}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">{log.time}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                          </div>
                          <p className={`${style.text} text-sm line-clamp-2 leading-relaxed`}>
                            {log.details}
                          </p>
                        </div>
                      ) : (
                        <div
                          key={log.id}
                          className="p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                          onClick={() => setSelectedLog(log)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className={`w-2 h-2 rounded-full ${style.badge}`}></div>
                                <span className={`text-sm font-semibold ${style.text} capitalize`}>
                                  {log.type}
                                </span>
                                <span className="text-xs text-gray-500">{log.time}</span>
                              </div>
                              <p className="text-gray-900 line-clamp-2 leading-relaxed">
                                {log.details}
                              </p>
                            </div>
                            <div className="ml-4 flex items-center space-x-2">
                              <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <Eye className="w-4 h-4 text-gray-400" />
                              </button>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getLogTypeStyle(selectedLog.type).badge}`}>
                      {getLogTypeIcon(selectedLog.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Log Details</h3>
                      <p className="text-sm text-gray-600">Detailed information about this log entry</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Log Type</label>
                      <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getLogTypeStyle(selectedLog.type).bg} ${getLogTypeStyle(selectedLog.type).text} ${getLogTypeStyle(selectedLog.type).border} border`}>
                        {getLogTypeIcon(selectedLog.type)}
                        <span className="ml-2 capitalize">{selectedLog.type}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Timestamp</label>
                      <p className="text-gray-900 bg-gray-50 rounded-lg px-3 py-2 font-mono text-sm">
                        {selectedLog.date} at {selectedLog.time}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Details</label>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {selectedLog.details}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .modern-calendar {
          font-family: inherit;
        }
        .modern-calendar .react-calendar__tile {
          border-radius: 8px;
          border: none;
          background: none;
          padding: 8px;
          font-weight: 500;
        }
        .modern-calendar .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white;
        }
        .modern-calendar .react-calendar__tile:hover {
          background: #eff6ff;
        }
        .modern-calendar .react-calendar__navigation button {
          font-weight: 600;
          color: #374151;
        }
        .modern-calendar .react-calendar__navigation button:hover {
          background: #f3f4f6;
          border-radius: 6px;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CalendarView;