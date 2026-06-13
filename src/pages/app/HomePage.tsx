import { useState, useEffect } from 'react'
import { Search, MapPin, Star, StarHalf, Loader2, Store } from 'lucide-react'
import { partnerService, type PartnerResponse } from '../../services/partner.service'

const CATEGORIES = [
  { label: 'Todos',               value: '' },
  { label: 'Clínica Veterinária', value: 'CLINICA' },
  { label: 'Petshop',             value: 'PETSHOP' },
  { label: 'Hotel',               value: 'HOTEL' },
  { label: 'Banho & Tosa',        value: 'BANHO_TOSA' },
]

function RatingStars({ value }: { value: number }) {
  const full  = Math.floor(value)
  const half  = value - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full  }).map((_, i) => (
        <Star key={`f${i}`} size={12} className="fill-amber-400 text-amber-400" />
      ))}
      {half && <StarHalf size={12} className="fill-amber-400 text-amber-400" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} size={12} className="text-(--color-border)" />
      ))}
    </span>
  )
}

function PartnerCard({ partner }: { partner: PartnerResponse }) {
  const location = [partner.city, partner.state].filter(Boolean).join(', ')
  const tags     = partner.services?.slice(0, 3) ?? []

  return (
    <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-sm
                    overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Foto */}
      <div className="h-40 bg-(--color-bg) flex items-center justify-center overflow-hidden">
        {partner.pictureUrl
          ? <img src={partner.pictureUrl} alt={partner.name}
                 className="w-full h-full object-cover" />
          : <Store size={40} className="text-(--color-text-muted) opacity-40" />
        }
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-(--color-text-heading) text-sm leading-tight line-clamp-2">
            {partner.name}
          </h3>
          {!partner.active && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                             bg-red-100 text-red-600 shrink-0">
              Fechado
            </span>
          )}
        </div>

        {location && (
          <div className="flex items-center gap-1 text-(--color-text-muted)">
            <MapPin size={12} />
            <span className="text-xs">{location}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <RatingStars value={partner.rating ?? 0} />
          <span className="text-xs text-(--color-text-muted)">
            {(partner.rating ?? 0).toFixed(1)}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {tags.map(s => (
              <span key={s.id}
                    className="text-[11px] px-2 py-0.5 rounded-full
                               bg-(--color-bg) border border-(--color-border)
                               text-(--color-text-muted) whitespace-nowrap">
                {s.name}
              </span>
            ))}
            {(partner.services?.length ?? 0) > 3 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full
                               bg-(--color-bg) border border-(--color-border)
                               text-(--color-text-muted)">
                +{(partner.services?.length ?? 0) - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [input,    setInput]    = useState('')
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('')
  const [page,     setPage]     = useState(0)
  const [partners, setPartners] = useState<PartnerResponse[]>([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(false)

  // debounce de busca
  useEffect(() => {
    const t = setTimeout(() => { setSearch(input); setPage(0) }, 400)
    return () => clearTimeout(t)
  }, [input])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    partnerService
      .listAll({ name: search || undefined, category: category || undefined, page, size: 12 })
      .then(data => {
        if (cancelled) return
        setPartners(data.content)
        setTotal(data.totalPages)
      })
      .catch(() => {
        if (!cancelled) setPartners([])
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [search, category, page])

  function handleCategory(val: string) {
    setCategory(val)
    setPage(0)
  }

  return (
    <div className="space-y-5">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-(--color-text-heading)">
          Encontre o melhor para o seu pet
        </h1>
        <p className="text-sm text-(--color-text-muted) mt-1">
          Clínicas, petshops, hotéis e muito mais perto de você
        </p>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Buscar por nome do estabelecimento…"
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-(--color-border)
                     bg-(--color-surface) text-(--color-text-body)
                     placeholder:text-(--color-text-muted) outline-none
                     focus:ring-2 focus:ring-(--color-primary-500)"
        />
      </div>

      {/* Filtros de categoria */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => handleCategory(c.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
              ${category === c.value
                ? 'bg-(--color-secondary-500) border-(--color-secondary-500) text-white'
                : 'bg-(--color-surface) border-(--color-border) text-(--color-text-body) hover:border-(--color-secondary-400)'
              }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-(--color-primary-700)" />
        </div>
      ) : partners.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="w-14 h-14 rounded-full bg-(--color-bg) border border-(--color-border)
                          flex items-center justify-center">
            <Store size={24} className="text-(--color-text-muted)" />
          </div>
          <p className="text-sm font-semibold text-(--color-text-body)">
            Nenhum estabelecimento encontrado
          </p>
          <p className="text-xs text-(--color-text-muted)">
            Tente ajustar os filtros ou a busca
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {partners.map(p => <PartnerCard key={p.id} partner={p} />)}
          </div>

          {/* Paginação */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 text-sm rounded-lg border border-(--color-border)
                           text-(--color-text-body) disabled:opacity-40
                           hover:bg-(--color-bg) transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-(--color-text-muted)">
                {page + 1} / {total}
              </span>
              <button
                onClick={() => setPage(p => Math.min(total - 1, p + 1))}
                disabled={page >= total - 1}
                className="px-4 py-2 text-sm rounded-lg border border-(--color-border)
                           text-(--color-text-body) disabled:opacity-40
                           hover:bg-(--color-bg) transition-colors"
              >
                Próximo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
