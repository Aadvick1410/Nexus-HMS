import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Activity, TestTube, History, Clock, LogOut, UploadCloud, Calendar } from 'lucide-react';

const LabTechDashboard = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user_name');
        navigate('/login');
    };

    const [activeTab, setActiveTab] = useState('Pending Tests');
    const [tests, setTests] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Test Completion State
    const [resultsInput, setResultsInput] = useState({});
    const [uploadFiles, setUploadFiles] = useState({});
    const [uploadingId, setUploadingId] = useState(null);

    // Schedule Test State
    const [scheduleForm, setScheduleForm] = useState({ patientId: '', testType: '' });
    const [isScheduling, setIsScheduling] = useState(false);

    useEffect(() => {
        fetchTests();
        fetchPatients();
    }, []);

    const fetchTests = async () => {
        try {
            const response = await api.get('/api/labs');
            setTests(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching labs:", error);
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get('/api/patients');
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };

    const handleScheduleTest = async (e) => {
        e.preventDefault();
        setIsScheduling(true);
        try {
            await api.post('/api/labs', {
                patientId: scheduleForm.patientId,
                testType: scheduleForm.testType
            });
            alert('Test scheduled successfully!');
            setScheduleForm({ patientId: '', testType: '' });
            fetchTests();
            setActiveTab('Pending Tests');
        } catch (error) {
            console.error('Error scheduling test:', error);
            alert('Failed to schedule test');
        }
        setIsScheduling(false);
    };

    const handleCompleteTest = async (id) => {
        try {
            let reportUrl = '';
            const file = uploadFiles[id];
            
            if (file) {
                setUploadingId(id);
                const formData = new FormData();
                formData.append('record', file);
                const uploadRes = await api.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                reportUrl = uploadRes.data;
                setUploadingId(null);
            }

            const payload = { 
                status: 'Completed',
                resultsSummary: resultsInput[id] || '',
            };
            if (reportUrl) payload.reportUrl = reportUrl;

            await api.put(`/api/labs/${id}`, payload);
            fetchTests();
        } catch (error) {
            console.error("Error completing test:", error);
            setUploadingId(null);
            alert('Failed to complete test');
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/api/labs/${id}`, { status: newStatus });
            fetchTests();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const filterTests = () => {
        if (activeTab === 'Pending Tests') return tests.filter(t => t.status === 'Requested');
        if (activeTab === 'Sample Collection') return tests.filter(t => t.status === 'Sample Collected' || t.status === 'Testing');
        if (activeTab === 'Test History') return tests.filter(t => t.status === 'Completed');
        return tests;
    };

    const navItems = [
        { name: 'Pending Tests', icon: <Clock className="w-5 h-5 mr-3" /> },
        { name: 'Sample Collection', icon: <TestTube className="w-5 h-5 mr-3" /> },
        { name: 'Test History', icon: <History className="w-5 h-5 mr-3" /> },
        { name: 'Schedule Test', icon: <Calendar className="w-5 h-5 mr-3" /> }
    ];

    return (
        <div className="flex h-screen bg-hms-dark text-white font-sans overflow-hidden"
             style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Sidebar */}
            <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 z-10 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold text-hms-primary flex items-center">
                        <Activity className="w-8 h-8 mr-2" />
                        Lab Tech
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === item.name ? 'bg-hms-primary/20 text-hms-primary border border-hms-primary/50' : 'hover:bg-white/5 text-gray-300'}`}
                        >
                            {item.icon}
                            {item.name}
                        </button>
                    ))}
                </nav>
            
                <div className="p-3 border-t border-white/10 mt-auto">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-white/40 hover:text-red-400 transition-colors w-full p-2.5 rounded-xl hover:bg-red-500/10">
                        <LogOut size={18} />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto z-10">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold">{activeTab}</h2>
                        <p className="text-gray-400 mt-1">Manage laboratory tests and reports</p>
                    </div>
                </header>

                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    {activeTab === 'Schedule Test' ? (
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-xl font-bold mb-6">Schedule New Lab Test</h3>
                            <form onSubmit={handleScheduleTest} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Select Patient</label>
                                    <select 
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-hms-primary"
                                        value={scheduleForm.patientId}
                                        onChange={e => setScheduleForm({...scheduleForm, patientId: e.target.value})}
                                    >
                                        <option value="">-- Select a Patient --</option>
                                        {patients.map(p => (
                                            <option key={p._id} value={p._id}>{p.userId?.name || p.patientId} ({p.patientId})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Test Type</label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="e.g., Complete Blood Count (CBC)"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-hms-primary"
                                        value={scheduleForm.testType}
                                        onChange={e => setScheduleForm({...scheduleForm, testType: e.target.value})}
                                    />
                                </div>
                                <button disabled={isScheduling} type="submit" className="w-full py-3 bg-hms-primary hover:bg-hms-primary/80 text-white rounded-xl transition-colors font-medium">
                                    {isScheduling ? 'Scheduling...' : 'Order Test'}
                                </button>
                            </form>
                        </div>
                    ) : loading ? (
                        <div className="text-center py-10 text-gray-400">Loading tests...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-400">
                                        <th className="p-4 font-medium">Patient</th>
                                        <th className="p-4 font-medium">Test Type</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterTests().map(test => (
                                        <tr key={test._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                {test.patientId?.userId?.name || test.patientId?.patientId || 'Unknown Patient'}
                                            </td>
                                            <td className="p-4">{test.testType}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs border ${
                                                    test.status === 'Requested' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    test.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {test.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {test.status === 'Requested' && (
                                                    <button onClick={() => updateStatus(test._id, 'Sample Collected')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
                                                        Collect Sample
                                                    </button>
                                                )}
                                                {test.status === 'Sample Collected' && (
                                                    <button onClick={() => updateStatus(test._id, 'Testing')} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors">
                                                        Start Testing
                                                    </button>
                                                )}
                                                {test.status === 'Testing' && (
                                                    <div className="flex flex-col space-y-3">
                                                        <textarea
                                                            placeholder="Enter Results Summary..."
                                                            className="bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-hms-primary"
                                                            value={resultsInput[test._id] || ''}
                                                            onChange={(e) => setResultsInput(prev => ({...prev, [test._id]: e.target.value}))}
                                                        />
                                                        
                                                        {/* File Upload Input */}
                                                        <div className="relative group cursor-pointer border border-dashed border-white/20 rounded-lg p-2 hover:border-hms-primary transition-colors text-center text-xs text-gray-400">
                                                            <input 
                                                                type="file" 
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) => setUploadFiles(prev => ({...prev, [test._id]: e.target.files[0]}))}
                                                            />
                                                            <div className="flex items-center justify-center gap-2">
                                                                <UploadCloud size={14} />
                                                                {uploadFiles[test._id] ? uploadFiles[test._id].name : 'Attach Report File'}
                                                            </div>
                                                        </div>

                                                        <button 
                                                            disabled={uploadingId === test._id}
                                                            onClick={() => handleCompleteTest(test._id)} 
                                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors w-full disabled:opacity-50">
                                                            {uploadingId === test._id ? 'Uploading...' : 'Mark Completed'}
                                                        </button>
                                                    </div>
                                                )}
                                                {test.status === 'Completed' && (
                                                    <div className="text-gray-400 text-sm flex flex-col gap-1">
                                                        <span>{test.resultsSummary}</span>
                                                        {test.reportUrl && (
                                                            <a href={`http://localhost:5000${test.reportUrl}`} target="_blank" rel="noreferrer" className="text-hms-primary hover:underline text-xs flex items-center gap-1">
                                                                <UploadCloud size={12} /> View Report
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filterTests().length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-400">
                                                No tests found for this category.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LabTechDashboard;
