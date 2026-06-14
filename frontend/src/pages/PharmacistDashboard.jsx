import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Pill, AlertTriangle, Package, FileText } from 'lucide-react';

const PharmacistDashboard = () => {
    const [activeTab, setActiveTab] = useState('Inventory');
    const [medicines, setMedicines] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stockInput, setStockInput] = useState({});

    useEffect(() => {
        fetchMedicines();
        fetchPrescriptions();
    }, []);

    const fetchMedicines = async () => {
        try {
            const response = await api.get('/api/pharmacy');
            setMedicines(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching medicines:", error);
            setLoading(false);
        }
    };

    const fetchPrescriptions = async () => {
        try {
            const response = await api.get('/api/prescriptions/all');
            setPrescriptions(response.data);
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
        }
    };

    const markDispensed = async (id) => {
        try {
            await api.put(`/api/prescriptions/${id}/status`, { status: 'Dispensed' });
            fetchPrescriptions();
        } catch (error) {
            console.error("Error marking dispensed:", error);
        }
    };

    const updateStock = async (id, quantity) => {
        try {
            await api.put(`/api/pharmacy/${id}/stock`, { quantity: Number(quantity) });
            setStockInput(prev => ({ ...prev, [id]: '' }));
            fetchMedicines();
        } catch (error) {
            console.error("Error updating stock:", error);
        }
    };

    const handleStockInputChange = (id, value) => {
        setStockInput(prev => ({ ...prev, [id]: value }));
    };

    const getLowStockMedicines = () => {
        // Assume < 10 is low stock
        return medicines.filter(m => m.stock < 10);
    };

    const navItems = [
        { name: 'Pending Prescriptions', icon: <FileText className="w-5 h-5 mr-3" /> },
        { name: 'Inventory', icon: <Package className="w-5 h-5 mr-3" /> },
        { name: 'Stock Alerts', icon: <AlertTriangle className="w-5 h-5 mr-3" /> }
    ];

    return (
        <div className="flex h-screen bg-hms-dark text-white font-sans overflow-hidden"
             style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Sidebar */}
            <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 z-10 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold text-hms-primary flex items-center">
                        <Pill className="w-8 h-8 mr-2" />
                        Pharmacist
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
                            {item.name === 'Stock Alerts' && getLowStockMedicines().length > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {getLowStockMedicines().length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto z-10">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold">{activeTab}</h2>
                        <p className="text-gray-400 mt-1">Manage pharmacy inventory and prescriptions</p>
                    </div>
                </header>

                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading pharmacy data...</div>
                    ) : activeTab === 'Pending Prescriptions' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-400">
                                        <th className="p-4 font-medium">Patient Name</th>
                                        <th className="p-4 font-medium">Doctor</th>
                                        <th className="p-4 font-medium">Medications</th>
                                        <th className="p-4 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.filter(p => p.status === 'Pending').map(p => (
                                        <tr key={p._id || p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">{p.patientId?.name || p.patientName || 'Unknown'}</td>
                                            <td className="p-4">{p.doctorId?.name || p.doctorName || 'Unknown'}</td>
                                            <td className="p-4">
                                                <ul className="list-disc list-inside">
                                                    {p.medications?.map((m, idx) => (
                                                        <li key={idx} className="text-sm">
                                                            {m.medicineId?.name || m.medicineName} ({m.dosage}, {m.duration})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => markDispensed(p._id || p.id)}
                                                    className="px-3 py-2 bg-hms-primary hover:bg-opacity-80 text-white rounded-lg text-sm transition-colors"
                                                >
                                                    Mark Dispensed
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {prescriptions.filter(p => p.status === 'Pending').length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-400">
                                                No pending prescriptions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-400">
                                        <th className="p-4 font-medium">Medicine Name</th>
                                        <th className="p-4 font-medium">Category</th>
                                        <th className="p-4 font-medium">Current Stock</th>
                                        <th className="p-4 font-medium">Update Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'Stock Alerts' ? getLowStockMedicines() : medicines).map(medicine => (
                                        <tr key={medicine.id || medicine._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">{medicine.name}</td>
                                            <td className="p-4">{medicine.category || 'General'}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs border ${
                                                    medicine.stock < 10 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                                                }`}>
                                                    {medicine.stock} units
                                                </span>
                                            </td>
                                            <td className="p-4 flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    placeholder="Qty (+/-)"
                                                    className="w-24 bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-hms-primary"
                                                    value={stockInput[medicine.id || medicine._id] || ''}
                                                    onChange={(e) => handleStockInputChange(medicine.id || medicine._id, e.target.value)}
                                                />
                                                <button
                                                    onClick={() => updateStock(medicine.id || medicine._id, stockInput[medicine.id || medicine._id])}
                                                    disabled={!stockInput[medicine.id || medicine._id]}
                                                    className="px-3 py-2 bg-hms-primary hover:bg-opacity-80 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Update
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(activeTab === 'Stock Alerts' ? getLowStockMedicines() : medicines).length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-400">
                                                No medicines found.
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

export default PharmacistDashboard;
