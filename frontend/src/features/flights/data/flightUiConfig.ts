export const flightUiConfig = {
  supportPhone: '0208 100 0000',
  supportLabel: '24/7 support',
  payment: {
    reservationWarningPrefix: 'Attention! Your booking is reserved. Complete payment within',
    reservationDurationMinutes: 30,
    reservationWarningSuffix: 'to secure your seats.',
    termsAcceptanceText: 'I have read and accepted the terms and conditions and the privacy policy.',
    payCtaSuffix: 'Securely',
    stripeFooterText: 'Stripe powered by SafePay',
    baggageIncludedLabel: 'Included',
    promotionalDiscountLabel: 'Promotional Discount',
    promotionalDiscountAmount: '-£0.00',
    secureEncryptionText: 'Your payment is 256-bit SSL encrypted. We never store card details.',
  },
} as const;
