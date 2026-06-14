import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Activity, TestTube, History, Clock } from 'lucide-react';

const LabTechDashboard = () => {
    const [activeTab, setActiveTab] = useState('Pending Tests');
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resultsInput, setResultsInput] = useState({});

    useEffect(() => {
        fetchTests();
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

    const updateStatus = async (id, newStatus) => {
        try {
            const payload = { status: newStatus };
            if (newStatus === 'Completed') {
                payload.resultsSummary = resultsInput[id] || '';
            }
            await api.put(`/api/labs/${id}`, payload);
            fetchTests();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleResultChange = (id, value) => {
        setResultsInput(prev => ({ ...prev, [id]: value }));
    };

    const filterTests = () => {
        if (activeTab === 'Pending Tests') return tests.filter(t => t.status === 'Requested');
        if (activeTab === 'Sample Collection') return tests.filter(t => t.status === 'Sample Collected' || t.status === 'Testing');
        if (activeTab === 'Test History') return tests.filter(t => t.status === 'Completed');
        return tests;
    };

    // Sidebar Items
    const navItems = [
        { name: 'Pending Tests', icon: <Clock className="w-5 h-5 mr-3" /> },
        { name: 'Sample Collection', icon: <TestTube className="w-5 h-5 mr-3" /> },
        { name: 'Test History', icon: <History className="w-5 h-5 mr-3" /> }
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
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading tests...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-400">
                                        <th className="p-4 font-medium">Patient</th>
                                        <th className="p-4 font-medium">Test Name</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterTests().map(test => (
                                        <tr key={test.id || test._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">{test.patientName || 'Unknown Patient'}</td>
                                            <td className="p-4">{test.testName}</td>
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
                                                    <button onClick={() => updateStatus(test.id || test._id, 'Sample Collected')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
                                                        Collect Sample
                                                    </button>
                                                )}
                                                {test.status === 'Sample Collected' && (
                                                    <button onClick={() => updateStatus(test.id || test._id, 'Testing')} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors">
                                                        Start Testing
                                                    </button>
                                                )}
                                                {test.status === 'Testing' && (
                                                    <div className="flex flex-col space-y-2">
                                                        <textarea
                                                            placeholder="Enter Results Summary..."
                                                            className="bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-hms-primary"
                                                            value={resultsInput[test.id || test._id] || ''}
                                                            onChange={(e) => handleResultChange(test.id || test._id, e.target.value)}
                                                        />
                                                        <button onClick={() => updateStatus(test.id || test._id, 'Completed')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors w-fit">
                                                            Mark Completed
                                                        </button>
                                                    </div>
                                                )}
                                                {test.status === 'Completed' && (
                                                    <span className="text-gray-400 text-sm">
                                                        {test.resultsSummary}
                                                    </span>
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
