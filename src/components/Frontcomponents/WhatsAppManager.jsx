import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Add toast
import 'react-toastify/dist/ReactToastify.css';

const WhatsAppManager = () => {
  const [status, setStatus] = useState({});
  const [expiringPackages, setExpiringPackages] = useState([]);
  const [dueTodayPackages, setDueTodayPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState({ phone: '', message: '' });
  const [activeTab, setActiveTab] = useState('status');
  
  // New state for payment receipt modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentData, setPaymentData] = useState({ 
    amount: '', 
    method: 'Cash', 
    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  });

  useEffect(() => {
    fetchStatus();
    fetchExpiringPackages();
    fetchDueTodayPackages();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/whatsapp/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
      toast.error('Error fetching WhatsApp status');
    }
  };

  const fetchExpiringPackages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/whatsapp/expiring-packages?days=3');
      setExpiringPackages(response.data);
    } catch (error) {
      console.error('Error fetching expiring packages:', error);
      toast.error('Error fetching expiring packages');
    }
  };

  const fetchDueTodayPackages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/whatsapp/due-today');
      setDueTodayPackages(response.data);
    } catch (error) {
      console.error('Error fetching due today packages:', error);
      toast.error('Error fetching due today packages');
    }
  };

  const sendTestMessage = async () => {
    if (!testMessage.phone || !testMessage.message) {
      toast.error('Please enter both phone number and message');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/whatsapp/send-test', testMessage);
      if (response.data.success) {
        toast.success('Message sent successfully!');
        setTestMessage({ phone: '', message: '' });
      } else {
        toast.error(`Failed: ${response.data.error}`);
      }
    } catch (error) {
      toast.error('Error sending message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const runExpiryCheck = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/whatsapp/check-expiring');
      toast.success(`Expiry check completed: ${response.data.summary.successful} successful, ${response.data.summary.failed} failed`);
      fetchExpiringPackages();
    } catch (error) {
      toast.error('Error running expiry check: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const runDueTodayCheck = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/whatsapp/check-due-today');
      toast.success(`Due today check completed: ${response.data.summary.successful} successful, ${response.data.summary.failed} failed`);
      fetchDueTodayPackages();
    } catch (error) {
      toast.error('Error running due today check: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Updated sendPaymentReceipt function with modal
  const openPaymentModal = (customer) => {
    setSelectedCustomer(customer);
    setPaymentData({
      amount: customer.amount || '',
      method: 'Cash',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedCustomer(null);
    setPaymentData({ 
      amount: '', 
      method: 'Cash', 
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    });
  };

  const sendPaymentReceipt = async () => {
    if (!paymentData.amount || !paymentData.method) {
      toast.error('Please enter both amount and payment method');
      return;
    }

    try {
      // First update bill status in database
      await updateBillStatusInDatabase();
      
      // Then send WhatsApp receipt
      const response = await axios.post(
        `http://localhost:5000/api/whatsapp/send-payment-receipt/${selectedCustomer._id}`,
        {
          ...paymentData,
          customerName: selectedCustomer.customerName,
          phone: selectedCustomer.phone,
          packageName: selectedCustomer.packageName
        }
      );
      
      if (response.data.success) {
        toast.success('Payment receipt sent successfully!');
      } else {
        toast.error(`Failed: ${response.data.error}`);
      }
      
      closePaymentModal();
    } catch (error) {
      console.error('Error sending payment receipt:', error);
      toast.error('Error sending payment receipt');
    }
  };

  const updateBillStatusInDatabase = async () => {
    try {
      const currentDate = new Date();
      await axios.post('http://localhost:5000/api/bill-status/mark-paid', {
        customerId: selectedCustomer._id,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        transactionId: paymentData.transactionId,
        paymentAmount: paymentData.amount,
        paymentMethod: paymentData.method,
        paymentDate: currentDate.toISOString()
      });
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast.error('Error updating bill status in database');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📱 WhatsApp Billing Manager</h1>

      {/* Payment Receipt Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Send Payment Receipt</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">{selectedCustomer.customerName}</p>
              <p className="text-sm text-gray-600">Phone: {selectedCustomer.phone}</p>
              <p className="text-sm">Package: {selectedCustomer.packageName}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (Rs.)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Transaction ID</label>
                <input
                  type="text"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                  className="w-full p-2 border rounded bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={sendPaymentReceipt}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Send Receipt
              </button>
              <button
                onClick={closePaymentModal}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your WhatsAppManager JSX remains the same */}
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'status' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('status')}
        >
          Status & Test
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'expiring' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('expiring')}
        >
          Expiring Soon
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'due' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('due')}
        >
          Due Today
        </button>
      </div>

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={status.isConnected ? 'text-green-600' : 'text-red-600'}>
                {status.isConnected ? 'Connected to WhatsApp' : 'Disconnected from WhatsApp'}
              </span>
              <button 
                onClick={fetchStatus}
                className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Refresh Status
              </button>
            </div>
            {!status.isConnected && (
              <p className="mt-2 text-yellow-600 text-sm">
                Please check the terminal/console for QR code to scan with WhatsApp
              </p>
            )}
          </div>

          {/* Test Message Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Send Test Message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g., 0300-1234567"
                  value={testMessage.phone}
                  onChange={(e) => setTestMessage({...testMessage, phone: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  placeholder="Enter your message here..."
                  value={testMessage.message}
                  onChange={(e) => setTestMessage({...testMessage, message: e.target.value})}
                  className="w-full p-2 border rounded h-20"
                />
              </div>
              <button
                onClick={sendTestMessage}
                disabled={loading}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Test Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expiring Soon Tab */}
      {activeTab === 'expiring' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Packages Expiring Soon (Next 3 Days)</h2>
            <button
              onClick={runExpiryCheck}
              disabled={loading}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Send Expiry Reminders'}
            </button>
          </div>
          
          {expiringPackages.length === 0 ? (
            <p className="text-gray-500">No packages expiring in the next 3 days.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expiringPackages.map((customer) => (
                <div key={customer._id} className="border rounded-lg p-4 bg-yellow-50">
                  <h3 className="font-semibold">{customer.customerName}</h3>
                  <p className="text-sm text-gray-600">Phone: {customer.phone}</p>
                  <p className="text-sm">Package: {customer.packageName}</p>
                  <p className="text-sm">Amount: Rs. {customer.amount}</p>
                  <p className="text-sm font-semibold">Expiry Day: {customer.billReceiveDate}</p>
                  <p className="text-sm">{customer.expiryDate}</p>
                  <button
                    onClick={() => openPaymentModal(customer)}
                    className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Send Receipt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Due Today Tab */}
      {activeTab === 'due' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Packages Due Today</h2>
            <button
              onClick={runDueTodayCheck}
              disabled={loading}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Send Due Reminders'}
            </button>
          </div>
          
          {dueTodayPackages.length === 0 ? (
            <p className="text-gray-500">No packages due today.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dueTodayPackages.map((customer) => (
                <div key={customer._id} className="border rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold">{customer.customerName}</h3>
                  <p className="text-sm text-gray-600">Phone: {customer.phone}</p>
                  <p className="text-sm">Package: {customer.packageName}</p>
                  <p className="text-sm">Amount: Rs. {customer.amount}</p>
                  <p className="text-sm font-semibold">Due Day: {customer.billReceiveDate}</p>
                  <button
                    onClick={() => openPaymentModal(customer)}
                    className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Send Receipt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsAppManager;