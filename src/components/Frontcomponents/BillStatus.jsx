import React, { useState } from 'react';
import { saveBillStatus } from '../api';

const BillStatus = ({ customer, month, year, refreshBillStatuses }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Enable button only when both fields are filled
  const isFormValid = paymentMethod && paymentNote.trim() !== '';

  const markAsPaid = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      await saveBillStatus({
        customerId: customer._id,
        month,
        year,
        billStatus: true,
        paymentMethod,
        paymentNote
      });
      
      // Refresh the bill statuses
      await refreshBillStatuses();
      
    } catch (err) {
      console.error('Failed to record payment:', err);
      setError('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        disabled={isSubmitting}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">-- Select Payment Method --</option>
        <option value="Cash">Cash</option>
        <option value="Online">Online</option>
        <option value="Bank Transfer">Bank Transfer</option>
      </select>
      
      <input
        type="text"
        placeholder="Payment description *"
        value={paymentNote}
        onChange={(e) => setPaymentNote(e.target.value)}
        disabled={isSubmitting}
        className="w-full p-2 border rounded"
        required
      />
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      <button
        onClick={markAsPaid}
        disabled={isSubmitting || !isFormValid}
        className={`px-4 py-1 text-white rounded w-full ${
          isSubmitting || !isFormValid
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {isSubmitting ? 'Processing...' : 'Confirm Payment'}
      </button>
    </div>
  );
};

export default BillStatus;