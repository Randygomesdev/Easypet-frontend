import { api } from '../lib/api'

// ── Checkout ──────────────────────────────────────────────────────────────────

export interface CheckoutItem {
  productId:    string
  label:        string
  description?: string
  price:        number
  quantity:     number
  metadata?:    Record<string, unknown>
}

export interface CheckoutRequest {
  items:       CheckoutItem[]
  successUrl?: string
  failureUrl?: string
  pendingUrl?: string
}

export interface CheckoutResponse {
  transactionId:    string
  preferenceId:     string
  initPoint:        string
  sandboxInitPoint: string
}

// ── Easypet booking metadata stored in cart item ──────────────────────────────

export interface EasypetCartMeta {
  partnerId:       string
  partnerName:     string
  bookingType:     'CONSULTATION' | 'VACCINATION' | 'GROOMING' | 'BOARDING' | 'OTHER'
  scheduledDate:   string   // YYYY-MM-DD
  scheduledTime:   string   // HH:mm
  durationMinutes: number
  staffId?:        string
  staffName?:      string
  petId:           string
  petName:         string
}

// ── Service ───────────────────────────────────────────────────────────────────

export const paymentService = {
  checkout: (data: CheckoutRequest): Promise<CheckoutResponse> =>
    api.post('/payments/checkout', data).then(r => r.data),
}
