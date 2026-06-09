import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Electrónica', slug: 'electronica', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop' },
  { name: 'Computación', slug: 'computacion', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop' },
  { name: 'Hogar', slug: 'hogar', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop' },
  { name: 'Moda', slug: 'moda', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop' },
  { name: 'Deportes', slug: 'deportes', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop' },
  { name: 'Juguetes', slug: 'juguetes', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=600&fit=crop' },
];

interface CollageProduct {
  id: string;
  image: string;
  style: React.CSSProperties;
  duration: number;
  delay: number;
  glow?: boolean;
}

const shadow = 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))';

const collageProducts: CollageProduct[] = [
  {
    id: 'smartphone',
    image: 'https://pngimg.com/uploads/smartphone/smartphone_PNG8536.png',
    style: { top: '10%', left: '8%', zIndex: 25, transform: 'rotate(-15deg) scale(1.1)', filter: shadow },
    duration: 4,
    delay: 0,
  },
  {
    id: 'drone',
    image: 'https://pngimg.com/uploads/drone/drone_PNG208.png',
    style: { top: '7%', right: '10%', zIndex: 5, transform: 'scale(0.7)', filter: 'blur(1px)' },
    duration: 6,
    delay: 0.8,
  },
  {
    id: 'chair',
    image: 'https://pngimg.com/uploads/chair/chair_PNG6910.png',
    style: { top: '30%', left: '16%', zIndex: 15, transform: 'rotate(5deg)', filter: shadow },
    duration: 5.5,
    delay: 0.4,
  },
  {
    id: 'headphones',
    image: 'https://pngimg.com/uploads/headphones/headphones_PNG101952.png',
    style: { top: '32%', right: '10%', zIndex: 20, filter: `${shadow} drop-shadow(0 0 25px rgba(0, 255, 255, 0.8))` },
    duration: 5,
    delay: 0.2,
    glow: true,
  },
  {
    id: 'sneakers',
    image: 'https://pngimg.com/uploads/running_shoes/running_shoes_PNG5801.png',
    style: { bottom: '36%', left: '25%', zIndex: 25, transform: 'rotate(-10deg)', filter: shadow },
    duration: 4.5,
    delay: 0.6,
  },
  {
    id: 'handbag',
    image: 'https://pngimg.com/uploads/women_bag/women_bag_PNG6406.png',
    style: { bottom: '38%', right: '22%', zIndex: 10, transform: 'scale(0.9)', filter: shadow },
    duration: 5,
    delay: 1,
  },
  {
    id: 'jacket',
    image: 'https://pngimg.com/uploads/jacket/jacket_PNG8058.png',
    style: { top: '20%', left: '0%', zIndex: 12, transform: 'rotate(8deg) scale(0.85)', filter: shadow },
    duration: 5.5,
    delay: 0.5,
  },
  {
    id: 'macbook',
    image: 'https://pngimg.com/uploads/macbook/macbook_PNG59.png',
    style: { top: '14%', left: '42%', zIndex: 20, transform: 'rotate(-6deg) scale(1.05)', filter: shadow },
    duration: 4.5,
    delay: 0.3,
  },
  {
    id: 'bicycle',
    image: 'https://pngimg.com/uploads/bicycle/bicycle_PNG102561.png',
    style: { bottom: '34%', left: '3%', zIndex: 6, transform: 'rotate(-5deg) scale(0.55)', filter: shadow },
    duration: 6,
    delay: 0.7,
  },
  {
    id: 'scooter',
    image: 'https://pngimg.com/uploads/scooter/scooter_PNG11342.png',
    style: { bottom: '36%', right: '3%', zIndex: 9, transform: 'rotate(12deg) scale(0.65)', filter: shadow },
    duration: 5,
    delay: 1.2,
  },
];

export default function HomePage() {
  return (
    <>
      <style>{`
        @keyframes float-smartphone {
          0% { transform: translateY(0px) rotate(-15deg) scale(1.1); }
          100% { transform: translateY(-15px) rotate(-15deg) scale(1.1); }
        }
        @keyframes float-drone {
          0% { transform: translateY(0px) scale(0.7); }
          100% { transform: translateY(-10px) scale(0.7); }
        }
        @keyframes float-chair {
          0% { transform: translateY(0px) rotate(5deg); }
          100% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes float-headphones {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-14px); }
        }
        @keyframes float-sneakers {
          0% { transform: translateY(0px) rotate(-10deg); }
          100% { transform: translateY(-16px) rotate(-10deg); }
        }
        @keyframes float-handbag {
          0% { transform: translateY(0px) scale(0.9); }
          100% { transform: translateY(-11px) scale(0.9); }
        }
        @keyframes float-jacket {
          0% { transform: translateY(0px) rotate(8deg) scale(0.85); }
          100% { transform: translateY(-13px) rotate(8deg) scale(0.85); }
        }
        @keyframes float-macbook {
          0% { transform: translateY(0px) rotate(-6deg) scale(1.05); }
          100% { transform: translateY(-12px) rotate(-6deg) scale(1.05); }
        }
        @keyframes float-bicycle {
          0% { transform: translateY(0px) rotate(-5deg) scale(0.55); }
          100% { transform: translateY(-8px) rotate(-5deg) scale(0.55); }
        }
        @keyframes float-scooter {
          0% { transform: translateY(0px) rotate(12deg) scale(0.65); }
          100% { transform: translateY(-9px) rotate(12deg) scale(0.65); }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 30px rgba(0, 255, 255, 0.3)); }
          50% { filter: drop-shadow(0 0 25px rgba(0, 255, 255, 0.9)) drop-shadow(0 0 50px rgba(0, 255, 255, 0.5)); }
        }
        @keyframes particle-fade {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>

      <section className="relative min-h-screen flex items-center bg-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-accent/20" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="container mx-auto relative pt-20 pb-24 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-3xl">
              <div className="animate-reveal">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.85] text-primary-foreground">
                  El mundo
                  <br />
                  a tu puerta.
                </h1>
              </div>
              <p className="mt-8 text-base md:text-lg text-primary-foreground/60 max-w-md leading-relaxed animate-fade-up">
                Importamos los mejores productos del mundo para vos. 
                Tecnología, hogar, moda y más, directo a tu casa en Argentina.
              </p>
              <p className="mt-4 text-xs text-primary-foreground/40 tracking-wide animate-fade-up">
                Stock en Argentina · Envío a todo el país · Importación garantizada
              </p>
              <div className="mt-8 flex gap-4 animate-fade-up">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary-foreground text-foreground text-sm font-medium hover:opacity-90 transition-all active:scale-[0.97]"
                >
                  Explorar productos
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/ai-requests"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-full border border-primary-foreground/20 text-primary-foreground/80 text-sm font-medium hover:border-primary-foreground/40 hover:text-primary-foreground transition-all"
                >
                  Pedir por enlace
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block w-full h-[500px] md:h-[550px]">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)',
                }}
              />

              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 600 500"
                preserveAspectRatio="xMidYMid meet"
                style={{ opacity: 0.12 }}
              >
                <path d="M300,420 Q160,200 48,50" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M300,420 Q440,200 540,35" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M300,420 Q200,280 96,150" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M300,420 Q440,280 540,160" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M300,420 Q220,370 150,320" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M300,420 Q380,370 468,310" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M300,420 Q150,240 0,100" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M300,420 Q280,220 252,70" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M300,420 Q160,390 18,330" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M300,420 Q460,380 582,320" fill="none" stroke="white" strokeWidth="0.5" />
              </svg>

              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={`p-${i}`}
                  className="absolute w-[2px] h-[2px] rounded-full pointer-events-none"
                  style={{
                    top: `${5 + Math.random() * 90}%`,
                    left: `${5 + Math.random() * 90}%`,
                    backgroundColor: i % 3 === 0 ? 'rgba(0, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.3)',
                    animation: `particle-fade ${1.5 + Math.random() * 2.5}s ease-in-out ${Math.random() * 3}s infinite`,
                  }}
                />
              ))}

              {/* Import box */}
              <div className="absolute select-none" style={{ bottom: '7%', left: '50%', zIndex: 2, transform: 'translateX(-50%)' }}>
                <div className="relative flex flex-col items-center" style={{ width: 155 }}>
                  <div className="w-[95%]" style={{
                    height: 28,
                    background: 'linear-gradient(180deg, #c4956a 0%, #a0764a 100%)',
                    borderRadius: '3px 3px 0 0',
                    transform: 'perspective(300px) rotateX(35deg)',
                    transformOrigin: 'bottom center',
                    borderBottom: '1px solid rgba(0,0,0,0.15)',
                  }} />
                  <div className="w-[92%]" style={{
                    height: 14,
                    background: 'linear-gradient(180deg, #2a1a0a 0%, #4a2e14 100%)',
                    marginTop: '-1px',
                    borderLeft: '2px solid rgba(60,40,20,0.3)',
                    borderRight: '2px solid rgba(60,40,20,0.3)',
                  }} />
                  <div className="w-full relative" style={{
                    height: 82,
                    background: 'linear-gradient(160deg, #d4a373 0%, #b8895c 60%, #a0764a 100%)',
                    borderRadius: 2,
                    boxShadow: '0 10px 35px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)',
                    marginTop: '-1px',
                  }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[18px] h-full" style={{
                      background: 'rgba(210,195,160,0.3)',
                      borderLeft: '1px solid rgba(255,255,255,0.06)',
                      borderRight: '1px solid rgba(0,0,0,0.06)',
                    }} />
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[18px]" style={{
                      background: 'rgba(210,195,160,0.3)',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                    }} />
                    <div className="absolute inset-x-0 text-center" style={{ bottom: 7 }}>
                      <span className="text-[7px] font-bold tracking-[0.25em] uppercase" style={{
                        color: 'rgba(60,40,20,0.5)',
                        textShadow: '0 1px 0 rgba(255,255,255,0.08)',
                      }}>
                        IMPORT
                      </span>
                    </div>
                  </div>
                  <div className="w-[92%]" style={{
                    height: 16,
                    background: 'linear-gradient(0deg, #8b6240 0%, #b8895c 100%)',
                    borderRadius: '0 0 3px 3px',
                    transform: 'perspective(300px) rotateX(-35deg)',
                    transformOrigin: 'top center',
                    marginTop: '-2px',
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                  }} />
                  <div className="absolute -bottom-3 left-[10%] right-[10%] h-4 rounded-full" style={{
                    background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
                    filter: 'blur(4px)',
                  }} />
                </div>
              </div>

              {collageProducts.map((product) => (
                <div key={product.id} className="absolute" style={product.style}>
                  <div
                    className="w-[120px] md:w-[140px]"
                    style={{
                      animation: `float-${product.id} ${product.duration}s ease-in-out ${product.delay}s infinite alternate`,
                    }}
                  >
                    <img
                      src={product.image}
                      alt=""
                      className="w-full h-auto block"
                      style={{
                        filter: product.glow
                          ? 'brightness(1.1) contrast(1.05) saturate(1.1)'
                          : 'brightness(1.05) contrast(1.05) saturate(1.1)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="container mx-auto">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Cómo funciona
            </span>
            <h2 className="mt-6 editorial-heading">
              Elegís. Gestionamos. Recibís.
            </h2>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-xl">
              El proceso es simple: elegís tu producto de nuestro catálogo o nos 
              enviás un link, nosotros gestionamos toda la importación y lo 
              recibís directo en tu casa.
            </p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-12 md:gap-8">
            <div className="border-t border-border pt-6">
              <span className="text-4xl font-light text-foreground/[0.06] select-none" style={{ fontFamily: 'var(--font-playfair)' }}>
                01
              </span>
              <h3 className="mt-4 text-lg font-medium tracking-tight">Elegís tu producto</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Explorá nuestro catálogo con stock en Argentina o envianos el link 
                de cualquier producto del mundo.
              </p>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 mt-6 text-xs font-medium border-b border-foreground/20 pb-0.5 hover:border-foreground transition-colors"
              >
                Ver catálogo
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="border-t border-border pt-6">
              <span className="text-4xl font-light text-foreground/[0.06] select-none" style={{ fontFamily: 'var(--font-playfair)' }}>
                02
              </span>
              <h3 className="mt-4 text-lg font-medium tracking-tight">Gestionamos la importación</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Nos encargamos de la compra en el exterior, el despacho aduanero 
                y el transporte hasta tu puerta. Sin complicaciones.
              </p>
            </div>
            <div className="border-t border-border pt-6">
              <span className="text-4xl font-light text-foreground/[0.06] select-none" style={{ fontFamily: 'var(--font-playfair)' }}>
                03
              </span>
              <h3 className="mt-4 text-lg font-medium tracking-tight">Lo recibís en Argentina</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                El producto llega directo a tu domicilio en toda Argentina. 
                Recibí seguimiento en cada paso del trayecto.
              </p>
              <Link
                href="/ai-requests"
                className="group inline-flex items-center gap-2 mt-6 text-xs font-medium border-b border-foreground/20 pb-0.5 hover:border-foreground transition-colors"
              >
                Solicitar importación
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section bg-foreground text-primary-foreground">
        <div className="container mx-auto">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-primary-foreground/40">
              Categorías
            </span>
            <h2 className="mt-6 editorial-heading text-primary-foreground">
              Todo lo que importás, en un solo lugar.
            </h2>
            <p className="mt-6 text-sm text-primary-foreground/50 leading-relaxed">
              Desde electrónica de última generación hasta artículos para el hogar. 
              Seleccionamos cada producto para garantizar calidad y precio.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?categoryId=${cat.slug}`}
                className="group relative aspect-[4/3] rounded-2xl bg-secondary/10 overflow-hidden flex items-end p-6 hover:bg-secondary/15 transition-colors"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <span className="absolute top-4 right-4 text-7xl font-bold text-primary-foreground/[0.04] select-none tracking-tighter">
                  {cat.name.charAt(0)}
                </span>
                <span className="relative z-10 text-sm font-medium text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section border-b border-border/50">
        <div className="container mx-auto">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Confianza
            </span>
            <h2 className="mt-6 editorial-heading">
              Importamos con transparencia.
            </h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-10 md:gap-16">
            <div>
              <h3 className="text-sm font-medium">Productos originales</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Todos nuestros productos son importados de proveedores verificados. 
                Garantizamos autenticidad y calidad en cada compra.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Envíos a toda Argentina</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Entregamos tu pedido directo a tu domicilio con seguimiento en 
                tiempo real. Sin demoras ni sorpresas.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Atención personalizada</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Respondemos tus dudas antes, durante y después de la importación. 
                Sin bots, sin esperas, sin vueltas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
