import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';

export interface CreateCheckoutSessionRequest {
    planTitle: string;
    amount: number;        // in GBP (e.g. 1200.00) — backend converts to pence
    successUrl: string;
    cancelUrl: string;
    leisurePlanId?: number;
}

export interface CheckoutSessionResponse {
    sessionId: string;
    url: string;
}

export interface PaymentIntentResponse {
    clientSecret: string;
}

export const paymentService = {
    createCheckoutSession: async (
        request: CreateCheckoutSessionRequest
    ): Promise<CheckoutSessionResponse> => {
        const response = await axios.post(
            `${API_ENDPOINTS.PAYMENT}/create-checkout-session`,
            request,
            { withCredentials: true }
        );
        return response.data;
    },
    createPaymentIntent: async (
        request: { amount: number; planTitle: string; leisurePlanId: number }
    ): Promise<PaymentIntentResponse> => {
        const response = await axios.post(
            `${API_ENDPOINTS.PAYMENT}/create-payment-intent`,
            request,
            { withCredentials: true }
        );
        return response.data;
    },

    /** Same Stripe account as leisure checkout; anonymous allowed for guest flight booking. */
    createFlightPaymentIntent: async (request: {
        flightId: number;
        amount: number;
        summary?: string;
    }): Promise<PaymentIntentResponse> => {
        const response = await axios.post(
            `${API_ENDPOINTS.PAYMENT}/create-flight-payment-intent`,
            request,
            { withCredentials: true }
        );
        return response.data;
    },
};
