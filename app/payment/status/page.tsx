'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface PaymentStatus {
  orderId: string;
  referenceId: string;
  paymentStatus: string;
  orderStatus: string;
  amount: number;
  currency: string;
  reason?: string;
}

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const referenceId = searchParams.get('referenceId');
  
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkCount, setCheckCount] = useState(0);
  const maxChecks = 20; // Check for up to 2 minutes (6 seconds * 20)

  useEffect(() => {
    if (!orderId || !referenceId) {
      setError('Missing order or reference ID');
      setLoading(false);
      return;
    }

    checkPaymentStatus();
    
    // Set up polling for payment status
    const interval = setInterval(() => {
      if (checkCount < maxChecks) {
        checkPaymentStatus();
        setCheckCount(prev => prev + 1);
      } else {
        clearInterval(interval);
        if (!status || status.paymentStatus === 'PENDING') {
          setError('Payment verification timeout. Please check your order status later.');
        }
      }
    }, 6000); // Check every 6 seconds

    return () => clearInterval(interval);
  }, [orderId, referenceId, checkCount]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(
        `/api/payments/momo/status?orderId=${orderId}&referenceId=${referenceId}`
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus(data);
        
        // Stop polling if payment is completed (success or failed)
        if (data.paymentStatus === 'SUCCESSFUL' || data.paymentStatus === 'FAILED') {
          setLoading(false);
        }
      } else {
        setError(data.error || 'Failed to check payment status');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setError('Failed to check payment status');
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!status) return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
    
    switch (status.paymentStatus) {
      case 'SUCCESSFUL':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'PENDING':
      default:
        return <Clock className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    if (error) return error;
    if (!status) return 'Checking payment status...';
    
    switch (status.paymentStatus) {
      case 'SUCCESSFUL':
        return 'Payment successful! Your order has been confirmed.';
      case 'FAILED':
        return `Payment failed. ${status.reason || 'Please try again or contact support.'}`;
      case 'PENDING':
      default:
        return 'Waiting for payment confirmation. Please complete the payment on your phone.';
    }
  };

  const getStatusColor = () => {
    if (error) return 'text-red-600';
    if (!status) return 'text-blue-600';
    
    switch (status.paymentStatus) {
      case 'SUCCESSFUL':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      case 'PENDING':
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        
        <h1 className="text-2xl font-bold mb-4">
          {status?.paymentStatus === 'SUCCESSFUL' ? 'Payment Successful!' :
           status?.paymentStatus === 'FAILED' ? 'Payment Failed' :
           'Processing Payment'}
        </h1>
        
        <p className={`text-lg mb-6 ${getStatusColor()}`}>
          {getStatusMessage()}
        </p>
        
        {status && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{status.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference ID:</span>
                <span className="font-mono">{status.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>{status.currency} {status.amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className={`font-medium ${
                  status.paymentStatus === 'SUCCESSFUL' ? 'text-green-600' :
                  status.paymentStatus === 'FAILED' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {status.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Order Status:</span>
                <span className="font-medium capitalize">{status.orderStatus}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-4 justify-center">
          {status?.paymentStatus === 'SUCCESSFUL' && (
            <Link href={`/orders/${orderId}`}>
              <Button>View Order</Button>
            </Link>
          )}
          
          {status?.paymentStatus === 'FAILED' && (
            <Link href="/checkout">
              <Button>Try Again</Button>
            </Link>
          )}
          
          <Link href="/orders">
            <Button variant="outline">My Orders</Button>
          </Link>
        </div>
        
        {loading && status?.paymentStatus === 'PENDING' && (
          <p className="text-sm text-gray-500 mt-4">
            Checking payment status... ({checkCount}/{maxChecks})
          </p>
        )}
      </div>
    </div>
  );
}