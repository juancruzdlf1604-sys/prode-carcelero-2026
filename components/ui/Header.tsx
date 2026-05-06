'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Trophy, List, Gift, Calendar } from 'lucide-react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-naval border-b border-azul/40 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo/logo.jpg" alt="Club San Carlos" width={36} height={36} className="rounded-full" />
          <div className="leading-tight">
            <div className="text-xs text-dorado font-semibold tracking-wide">PRODE CARCELERO</div>
            <div className="text-sm font-bold text-white">2026</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink href="/prode" icon={<Calendar size={14} />}>Prode</NavLink>
          <NavLink href="/premios" icon={<Gift size={14} />}>Premios</NavLink>
          <NavLink href="/tabla" icon={<Trophy size={14} />}>Tabla</NavLink>
          <NavLink href="/jugar" icon={<List size={14} />}>Jugá</NavLink>
        </nav>

        {/* Mobile menu button */}
        <button className="sm:hidden text-white p-1" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="sm:hidden bg-oscuro border-t border-azul/30 px-4 py-3 flex flex-col gap-2">
          <MobileNavLink href="/prode" onClick={() => setOpen(false)}>📅 Fixture del Mundial</MobileNavLink>
          <MobileNavLink href="/premios" onClick={() => setOpen(false)}>🎁 Premios</MobileNavLink>
          <MobileNavLink href="/tabla" onClick={() => setOpen(false)}>🏆 Tabla de posiciones</MobileNavLink>
          <MobileNavLink href="/jugar" onClick={() => setOpen(false)}>⚽ Hacé tu prode</MobileNavLink>
        </div>
      )}
    </header>
  )
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-1 text-sm text-white/80 hover:text-dorado px-3 py-1.5 rounded-lg hover:bg-azul/20 transition-colors font-medium">
      {icon}{children}
    </Link>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="text-white py-2 px-3 rounded-lg hover:bg-naval transition-colors font-medium">
      {children}
    </Link>
  )
}
