import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, BarChart3, LogOut, CheckCircle, Search, Clock, DollarSign, XCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const BillingDashboard = () => {
  const [activeTab, setActiveTab] = useState('Payment Processing');
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Invoice form state
  const [selectedPatient, setSelectedPatient] = useState('');
  const [lineItems, setLineItems] = useState([{ description: '', amount: '', category: 'Consultation' }]);
  const [toastMessage, setToastMessage] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/api/patients');
      setPatients(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/billing/all');
      const data = res.data.data || res.data;
      setInvoices(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (id) => {
    try {
      setProcessingId(id);
      await api.put(`/api/billing/${id}/pay`, { paymentMethod: 'Card' });
      await fetchInvoices();
    } catch (err) {
      console.error(err);
      alert('Failed to process payment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', amount: '', category: 'Consultation' }]);
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    setLineItems(newItems);
  };

  const handleRemoveLineItem = (index) => {
    const newItems = [...lineItems];
    newItems.splice(index, 1);
    setLineItems(newItems);
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedPatient || lineItems.some(item => !item.description || !item.amount)) {
      alert("Please fill all fields");
      return;
    }
    try {
      const formattedItems = lineItems.map(item => ({
        description: item.description,
        amount: Number(item.amount),
        category: item.category || 'Consultation'
      }));
      await api.post('/api/billing', {
        patientId: selectedPatient,
        lineItems: formattedItems
      });
      setToastMessage('Invoice generated successfully!');
      setSelectedPatient('');
      setLineItems([{ description: '', amount: '', category: 'Consultation' }]);
      fetchInvoices();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'Paid');
  const unpaidInvoices = invoices.filter(inv => inv.paymentStatus !== 'Paid');

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const pendingRevenue = unpaidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-hms-dark text-hms-text font-sans relative overflow-hidden flex">
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)'
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-hms-dark/90 via-hms-dark/80 to-hms-dark/95" />

      {/* Sidebar */}
      <div className="w-72 bg-black/40 backdrop-blur-2xl border-r border-white/10 z-10 flex flex-col h-screen transition-all duration-300">
        <div className="p-6 border-b border-white/10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-hms-primary to-blue-400 flex items-center justify-center shadow-lg shadow-hms-primary/20">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">HMS<span className="text-hms-primary">Billing</span></h1>
            <p className="text-xs text-gray-400 font-medium">Financial Operations</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {[
            { id: 'Payment Processing', icon: CreditCard, label: 'Payment Processing' },
            { id: 'Generate Invoice', icon: FileText, label: 'Generate Invoice' },
            { id: 'Revenue Summary', icon: BarChart3, label: 'Revenue Summary' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                activeTab === tab.id 
                  ? 'bg-hms-primary/20 text-white border border-hms-primary/30 shadow-lg shadow-hms-primary/10' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-hms-primary' : 'text-gray-500 group-hover:text-gray-300'}`} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 z-10 overflow-y-auto">
        <header className="sticky top-0 z-20 bg-black/20 backdrop-blur-lg border-b border-white/10 px-8 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{activeTab}</h2>
            <p className="text-sm text-gray-400 mt-1">Manage billing and financial records</p>
          </div>
        </header>

        <main className="p-8">
          {activeTab === 'Payment Processing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Invoices</p>
                    <p className="text-2xl font-bold text-white">{invoices.length}</p>
                  </div>
                </div>
                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Paid Invoices</p>
                    <p className="text-2xl font-bold text-white">{paidInvoices.length}</p>
                  </div>
                </div>
                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Unpaid Invoices</p>
                    <p className="text-2xl font-bold text-white">{unpaidInvoices.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                    Pending Payments
                  </h3>
                  <button onClick={fetchInvoices} className="text-sm text-hms-primary hover:text-blue-400 transition-colors">
                    Refresh
                  </button>
                </div>
                
                {loading ? (
                  <div className="p-10 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-hms-primary"></div>
                  </div>
                ) : error ? (
                  <div className="p-6 text-red-400 flex items-center"><XCircle className="w-5 h-5 mr-2" />{error}</div>
                ) : unpaidInvoices.length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                    <p>No pending payments. All caught up!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                          <th className="p-4 font-medium">Invoice ID</th>
                          <th className="p-4 font-medium">Patient</th>
                          <th className="p-4 font-medium">Date</th>
                          <th className="p-4 font-medium">Amount</th>
                          <th className="p-4 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {unpaidInvoices.map(inv => (
                          <tr key={inv._id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-white font-medium">
                              #{inv._id?.substring(0, 8).toUpperCase()}
                            </td>
                            <td className="p-4 text-gray-300">
                              {inv.patientId?.userId?.name || 'Unknown Patient'}
                            </td>
                            <td className="p-4 text-gray-400 text-sm">
                              {new Date(inv.createdAt || inv.date).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-white font-bold">
                              ${inv.totalAmount?.toFixed(2)}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleProcessPayment(inv._id)}
                                disabled={processingId === inv._id}
                                className="inline-flex items-center space-x-2 bg-hms-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                {processingId === inv._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <CreditCard className="w-4 h-4" />
                                )}
                                <span>Process</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mt-6">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                    Recently Paid
                  </h3>
                </div>
                
                {paidInvoices.length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <p>No paid invoices found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                          <th className="p-4 font-medium">Invoice ID</th>
                          <th className="p-4 font-medium">Patient</th>
                          <th className="p-4 font-medium">Amount</th>
                          <th className="p-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {paidInvoices.slice(0, 5).map(inv => (
                          <tr key={inv._id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-gray-300 text-sm">
                              #{inv._id?.substring(0, 8).toUpperCase()}
                            </td>
                            <td className="p-4 text-gray-300">
                              {inv.patientId?.userId?.name || 'Unknown Patient'}
                            </td>
                            <td className="p-4 text-white">
                              ${inv.totalAmount?.toFixed(2)}
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                Paid
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Generate Invoice' && (
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative">
              {toastMessage && (
                <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg flex items-center shadow-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {toastMessage}
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-hms-primary" />
                Generate New Invoice
              </h3>
              
              <form onSubmit={handleGenerateInvoice} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select Patient</label>
                  <select 
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-hms-primary transition-colors"
                  >
                    <option value="">-- Choose Patient --</option>
                    {Array.isArray(patients) && patients.map(p => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.userId?.name || p.name || 'Unknown Patient'} ({p.patientId || 'No ID'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-400">Line Items</label>
                    <button 
                      type="button" 
                      onClick={handleAddLineItem}
                      className="text-xs bg-hms-primary/20 text-hms-primary border border-hms-primary/30 px-3 py-1.5 rounded-lg hover:bg-hms-primary hover:text-white transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {lineItems.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <input 
                          type="text" 
                          placeholder="Description (e.g. Consultation)" 
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-hms-primary transition-colors"
                        />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-3.5 text-gray-400">$</span>
                          <input 
                            type="number" 
                            placeholder="Amount" 
                            value={item.amount}
                            onChange={(e) => handleLineItemChange(idx, 'amount', e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-8 text-white focus:outline-none focus:border-hms-primary transition-colors"
                          />
                        </div>
                        <select
                          value={item.category || 'Consultation'}
                          onChange={(e) => handleLineItemChange(idx, 'category', e.target.value)}
                          className="w-36 bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-hms-primary transition-colors"
                        >
                          <option value="Consultation">Consultation</option>
                          <option value="Lab Test">Lab Test</option>
                          <option value="Pharmacy">Pharmacy</option>
                          <option value="Admission">Admission</option>
                          <option value="Other">Other</option>
                        </select>
                        {lineItems.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors border border-transparent hover:border-red-500/30"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-[200px]">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-medium">Total:</span>
                        <span className="text-xl font-bold text-white">
                          ${lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button 
                    type="submit"
                    className="w-full bg-hms-primary hover:bg-blue-600 text-white font-medium py-3.5 rounded-xl transition-colors shadow-lg shadow-hms-primary/20 flex justify-center items-center"
                  >
                    Generate Invoice
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'Revenue Summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-green-400">Collected Revenue</h3>
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-green-400/80 mt-2">From {paidInvoices.length} paid invoices</p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-yellow-400">Pending Revenue</h3>
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white">${pendingRevenue.toFixed(2)}</p>
                  <p className="text-sm text-yellow-400/80 mt-2">From {unpaidInvoices.length} pending invoices</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BillingDashboard;
