// services/payment.service.ts
import Stripe from 'stripe';
import { supabaseClient } from '@/config/database.config';
import { BadRequestError } from '@/utils/error.utils';

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

export const PaymentService = {
  /** Create a Payment Intent and return client secret */
  async createPaymentIntent(amountCents: number, currency = 'usd', metadata?: Record<string, string>) {
    const s = stripe();
    const intent = await s.paymentIntents.create({
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });
    return { clientSecret: intent.client_secret, id: intent.id };
  },

  /** Record a payment row in DB (after webhook confirms payment) */
  async recordPayment(orderId: string, provider: string, providerRef: string, amountCents: number, status: 'PENDING'|'PAID'|'FAILED'|'REFUNDED') {
    const db = supabaseClient('service'); // server-side write
    const { data, error } = await db.from('payments').insert({
      order_id: orderId,
      provider,
      provider_ref: providerRef,
      amount_cents: amountCents,
      status,
      paid_at: status === 'PAID' ? new Date().toISOString() : null,
    }).select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },
};
