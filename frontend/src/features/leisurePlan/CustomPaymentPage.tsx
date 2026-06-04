import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { paymentService } from './services/paymentApi';
import { API_ENDPOINTS } from '../../config/apiConfig';

const ENV_STRIPE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.STRIPE_PUBLISHABLE_KEY as string) ||
  '';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1f2937',
      fontFamily: '"Inter", "Poppins", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
  },
};

function CheckoutForm({ clientSecret, amount, leisurePlanId }: { clientSecret: string; amount: number; leisurePlanId: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError('Please provide your full name and email address.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setIsProcessing(false);
      return;
    }

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumberElement,
        billing_details: {
          name: name.trim(),
          email: email.trim(),
        },
      },
    });

    if (paymentError) {
      setError(paymentError.message ?? 'An unexpected error occurred.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      navigate(`/leisure-plan/payment/success?plan_id=${leisurePlanId}&session_id=${paymentIntent.id}`);
    } else {
      setError('Payment status is not confirmed. Please try again or contact support.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30"
            required
            disabled={isProcessing}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">Cardholder Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30"
            required
            disabled={isProcessing}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">Card Number</label>
          <div className="w-full rounded-lg border border-gray-200 bg-white px-3 py-[11px] focus-within:border-transparent focus-within:ring-2 focus-within:ring-[#1a2b6b]/30">
            <CardNumberElement id="card-number" options={{ ...CARD_ELEMENT_OPTIONS, placeholder: '4242 4242 4242 4242' }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">Expiry Date</label>
            <div className="w-full rounded-lg border border-gray-200 bg-white px-3 py-[11px] focus-within:border-transparent focus-within:ring-2 focus-within:ring-[#1a2b6b]/30">
              <CardExpiryElement id="card-expiry" options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">CVC</label>
            <div className="w-full rounded-lg border border-gray-200 bg-white px-3 py-[11px] focus-within:border-transparent focus-within:ring-2 focus-within:ring-[#1a2b6b]/30">
              <CardCvcElement id="card-cvc" options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" strokeWidth={2} />
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#f2ae66] py-4 text-sm font-bold text-[#1a2b6b] shadow-sm shadow-orange-200 transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing payment…
            </>
          ) : (
            `Pay £${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          )}
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-gray-400">
        <ShieldCheck size={16} />
        <p className="text-center text-[11px] font-medium">
          Secured by <span className="font-bold text-gray-500">Stripe</span> — card details are tokenized in the browser.
        </p>
      </div>
    </form>
  );
}

export default function CustomPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  interface PaymentState {
    amount: number;
    planTitle: string;
    leisurePlanId: number;
  }
  const state = location.state as PaymentState | null;

  if (!state || !state.amount || !state.planTitle || !state.leisurePlanId) {
    return <Navigate to="/leisure-plan" replace />;
  }

  const { amount, planTitle, leisurePlanId } = state;

  const [clientSecret, setClientSecret] = useState<string>('');
  const [publishableKey, setPublishableKey] = useState<string>(ENV_STRIPE_PUBLISHABLE_KEY);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setIsInitializing(true);
      setInitError(null);
      setClientSecret('');

      try {
        let pk = ENV_STRIPE_PUBLISHABLE_KEY;
        if (!pk) {
          const keyRes = await axios.get<{ publishableKey: string | null }>(`${API_ENDPOINTS.PAYMENT}/stripe-publishable-key`);
          pk = keyRes.data?.publishableKey?.trim() ?? '';
        }
        if (cancelled) {
          return;
        }
        if (!pk) {
          setInitError('Stripe publishable key is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY or Stripe:PublishableKey in appsettings.');
          setIsInitializing(false);
          return;
        }
        setPublishableKey(pk);

        const intentRes = await paymentService.createPaymentIntent({ amount, planTitle, leisurePlanId });
        if (!cancelled) {
          setClientSecret(intentRes.clientSecret);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          console.error('Failed to initialize payment', err);
          const ax = err as { response?: { data?: { error?: string } }; message?: string };
          setInitError(ax?.response?.data?.error || ax?.message || 'System error. Could not initialize payment.');
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [amount, planTitle, leisurePlanId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-poppins sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-bold text-gray-500 transition-colors hover:text-gray-800"
          >
            &larr; Back
          </button>
        </div>

        <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-black text-gray-900">Checkout</h1>
            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Booking Summary</p>
              <p className="mb-3 font-semibold leading-snug text-gray-800">{planTitle}</p>
              <div className="flex items-end justify-between border-t border-gray-200 pt-3">
                <span className="text-sm font-medium tracking-wide text-gray-500">Total due</span>
                <span className="text-xl font-black text-[#1a2b6b]">
                  £{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {isInitializing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={36} className="mb-4 animate-spin text-[#1a2b6b]" strokeWidth={2} />
              <p className="text-sm font-medium text-gray-500">Preparing secure checkout…</p>
            </div>
          ) : initError ? (
            <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <AlertCircle size={32} className="mb-4 text-red-500" strokeWidth={1.5} />
              <h3 className="mb-2 font-bold text-red-800">Initialization Failed</h3>
              <p className="mb-5 text-sm text-red-600">{initError}</p>
              <button
                type="button"
                onClick={() => navigate('/leisure-plan')}
                className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                Return to Plans
              </button>
            </div>
          ) : (
            clientSecret && publishableKey && stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <CheckoutForm clientSecret={clientSecret} amount={amount} leisurePlanId={leisurePlanId} />
              </Elements>
            ) : null
          )}
        </div>
      </div>
      <style>{`
                .font-poppins { font-family: 'Poppins', sans-serif; }
            `}</style>
    </div>
  );
}
