import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="container mx-auto py-16 md:py-20">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="max-w-xs">
            <span className="text-base tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
              El Pirata David
            </span>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Importamos los mejores productos del mundo directo a tu puerta en Argentina.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-12 gap-y-8">
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-4">Productos</h4>
              <ul className="space-y-2.5">
                <li><Link href="/products" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Catálogo</Link></li>
                <li><Link href="/products?isFeatured=true" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Destacados</Link></li>
                <li><Link href="/ai-requests" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Pedido por Enlace</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-4">Soporte</h4>
              <ul className="space-y-2.5">
                <li><Link href="/contact" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Contacto</Link></li>
                <li><Link href="/faq" className="text-sm text-foreground/60 hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link href="/shipping" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Envíos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-4">Contacto</h4>
              <ul className="space-y-2.5 text-sm text-foreground/60">
                <li>Buenos Aires, Argentina</li>
                <li>info@elpiratadavid.com</li>
                <li>+54 11 5555 0000</li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mt-16 pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} El Pirata David
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">Términos</Link>
            <Link href="/privacy" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
