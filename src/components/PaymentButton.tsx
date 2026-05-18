'use client';

import { useState } from 'react';

interface PaymentButtonProps {
  amount: number;
  description: string;
  serviceType: string;
  packageName?: string;
  className?: string;
  label?: string;
}

export default function PaymentButton({
  amount,
  description,
  serviceType,
  packageName,
  className = '',
  label = 'רכוש עכשיו',
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');

    // Prompt for customer details
    const name = window.prompt('שם מלא:');
    if (!name) { setLoading(false); return; }
    const email = window.prompt('אימייל:');
    if (!email) { setLoading(false); return; }

    try {
      const res = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description, customerName: name, customerEmail: email, serviceType, packageName }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || 'שגיאה ביצירת תשלום');
      }
    } catch {
      setError('שגיאת רשת, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className={`w-full text-white text-sm font-bold px-4 py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? 'מעבד...' : label}
      </button>
      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
