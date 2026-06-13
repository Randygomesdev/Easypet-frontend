import { PawPrint } from 'lucide-react'

export default function PetsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-(--color-text-heading)">Meus Pets</h1>
        <p className="text-sm text-(--color-text-muted) mt-1">
          Gerencie o perfil e o prontuário dos seus pets
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 py-24">
        <div className="w-14 h-14 rounded-full bg-(--color-bg) border border-(--color-border)
                        flex items-center justify-center">
          <PawPrint size={24} className="text-(--color-text-muted)" />
        </div>
        <p className="text-sm font-semibold text-(--color-text-body)">Em breve</p>
        <p className="text-xs text-(--color-text-muted) max-w-xs text-center">
          O cadastro e o prontuário dos seus pets estará disponível em breve.
        </p>
      </div>
    </div>
  )
}
