import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Trash2, ArrowLeft, CalendarDays,
  Clock, User, PawPrint, Store, ShoppingBag, Loader2,
} from 'lucide-react'
import { useCart, type CartItem } from '../../contexts/CartContext'
import { paymentService } from '../../services/payment.service'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
  })
}

function formatDuration(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

// ── Item card ─────────────────────────────────────────────────────────────────

function CartItemCard({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
  const meta = (item.metadata ?? {}) as Record<string, string | number>

  return (
    <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-(--color-text-heading) text-base">{item.label}</h3>
          {item.description && (
            <p className="text-xs text-(--color-text-muted) mt-0.5 line-clamp-2">{item.description}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-(--color-text-muted) hover:text-red-500
                     hover:bg-red-50 transition-colors shrink-0"
          title="Remover do carrinho"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Booking details from metadata */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {meta.partnerName && (
          <span className="flex items-center gap-1.5 text-xs text-(--color-text-muted)">
            <Store size={12} className="shrink-0" />
            {meta.partnerName}
          </span>
        )}
        {meta.scheduledDate && (
          <span className="flex items-center gap-1.5 text-xs text-(--color-text-muted)">
            <CalendarDays size={12} className="shrink-0" />
            {formatDate(meta.scheduledDate as string)}
          </span>
        )}
        {meta.scheduledTime && (
          <span className="flex items-center gap-1.5 text-xs text-(--color-text-muted)">
            <Clock size={12} className="shrink-0" />
            {meta.scheduledTime as string}
            {meta.durationMinutes && ` · ${formatDuration(meta.durationMinutes as number)}`}
          </span>
        )}
        {meta.staffName && (
          <span className="flex items-center gap-1.5 text-xs text-(--color-text-muted)">
            <User size={12} className="shrink-0" />
            {meta.staffName}
          </span>
        )}
        {meta.petName && (
          <span className="flex items-center gap-1.5 text-xs text-(--color-text-muted)">
            <PawPrint size={12} className="shrink-0" />
            {meta.petName}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mt-3 pt-3 border-t border-(--color-border) flex items-center justify-between">
        <span className="text-xs text-(--color-text-muted)">Qtd: {item.quantity}</span>
        <span className="font-bold text-(--color-primary-700) text-base">
          {formatBRL(item.price * item.quantity)}
        </span>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const MP_SANDBOX = import.meta.env.VITE_MP_SANDBOX !== 'false'

export default function CartPage() {
  const { items, removeItem, clearCart, total, itemCount } = useCart()
  const navigate    = useNavigate()
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  async function handleCheckout() {
    if (items.length === 0) return
    setPaying(true)
    setPayError('')
    try {
      const result = await paymentService.checkout({
        items: items.map(i => ({
          productId:   i.productId,
          label:       i.label,
          description: i.description,
          price:       i.price,
          quantity:    i.quantity,
          metadata:    i.metadata,
        })),
      })
      const url = MP_SANDBOX ? result.sandboxInitPoint : result.initPoint
      window.location.href = url
    } catch (err: any) {
      console.error('Checkout error:', err?.response?.data ?? err)
      setPayError('Não foi possível iniciar o pagamento. Tente novamente.')
      setPaying(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-(--color-border) text-(--color-text-muted)
                     hover:text-(--color-text-body) hover:bg-(--color-bg) transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-(--color-text-heading) flex items-center gap-2">
            <ShoppingCart size={22} /> Carrinho
          </h1>
          <p className="text-sm text-(--color-text-muted) mt-0.5">
            {itemCount === 0 ? 'Nenhum item' : `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-5 py-24 text-center
                        border-2 border-dashed border-(--color-border) rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-(--color-surface) border border-(--color-border)
                          flex items-center justify-center">
            <ShoppingBag size={28} className="text-(--color-text-muted)" />
          </div>
          <div>
            <p className="text-sm font-medium text-(--color-text-body)">Seu carrinho está vazio</p>
            <p className="text-xs text-(--color-text-muted) mt-1">
              Encontre um estabelecimento e agende um serviço.
            </p>
          </div>
          <button
            onClick={() => navigate('/app/home')}
            className="flex items-center gap-2 bg-(--color-secondary-500) hover:bg-(--color-secondary-600)
                       text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            Explorar estabelecimentos
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Items */}
          {items.map(item => (
            <CartItemCard
              key={item.cartItemId}
              item={item}
              onRemove={() => removeItem(item.cartItemId)}
            />
          ))}

          {/* Summary */}
          <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-(--color-text-heading) mb-3">Resumo do pedido</h4>
            <div className="space-y-2 text-sm">
              {items.map(item => (
                <div key={item.cartItemId} className="flex justify-between text-(--color-text-muted)">
                  <span className="truncate mr-4">{item.label}</span>
                  <span className="shrink-0">{formatBRL(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-(--color-border) pt-2 flex justify-between font-bold
                              text-(--color-text-heading) text-base">
                <span>Total</span>
                <span className="text-(--color-primary-700)">{formatBRL(total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {payError && (
            <p className="text-xs text-red-500 font-medium text-center">{payError}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => { if (confirm('Limpar todos os itens do carrinho?')) clearCart() }}
              disabled={paying}
              className="flex-1 border border-(--color-border) text-(--color-text-muted)
                         hover:border-red-300 hover:text-red-500 hover:bg-red-50
                         font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpar carrinho
            </button>
            <button
              onClick={handleCheckout}
              disabled={paying}
              className="flex-grow flex items-center justify-center gap-2 bg-(--color-primary-700)
                         hover:bg-(--color-primary-800) text-white font-semibold px-6 py-2.5
                         rounded-xl text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {paying && <Loader2 size={15} className="animate-spin" />}
              {paying ? 'Redirecionando...' : 'Finalizar pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
