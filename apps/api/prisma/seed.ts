import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Limpiando base de datos...');
  await prisma.orderTracking.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.aIRequestReview.deleteMany();
  await prisma.productAlternative.deleteMany();
  await prisma.aIRequest.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Base de datos limpia');

  const adminHash = await bcrypt.hash('Admin123!', 10);
  const clientHash = await bcrypt.hash('Test123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@pirata.com',
      password: adminHash,
      name: 'Admin',
      lastName: 'Pirata',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const client = await prisma.user.create({
    data: {
      email: 'cliente@test.com',
      password: clientHash,
      name: 'Cliente',
      lastName: 'Prueba',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log('✅ Usuarios creados');

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Computación', slug: 'computacion', description: 'Equipos de cómputo, tablets y accesorios', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', order: 1 } }),
    prisma.category.create({ data: { name: 'Electrónica', slug: 'electronica', description: 'Smartphones, wearables, audio y cámaras', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800', order: 2 } }),
    prisma.category.create({ data: { name: 'Deportes', slug: 'deportes', description: 'Bicicletas y equipamiento deportivo', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800', order: 3 } }),
    prisma.category.create({ data: { name: 'Herramientas', slug: 'herramientas', description: 'Herramientas eléctricas y manuales profesionales', image: 'https://images.unsplash.com/photo-1581147036324-f1c0cd5a1c25?w=800', order: 4 } }),
    prisma.category.create({ data: { name: 'Hogar', slug: 'hogar', description: 'Electrodomésticos y artículos para el hogar', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800', order: 5 } }),
  ]);

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    catMap[cat.slug] = cat.id;
  }

  console.log('✅ Categorías creadas');

  interface MockProduct {
    name: string;
    slug: string;
    description: string;
    price: number;
    categoryId: string;
    brand?: string;
    model?: string;
    stock: number;
    image?: string;
    specifications: { name: string; value: string }[];
  }

  const mockProducts: MockProduct[] = [
    { name: 'MacBook Pro 14" M4 Pro', slug: 'macbook-pro-14-m4-pro', description: 'MacBook Pro de 14 pulgadas con chip M4 Pro de Apple. Pantalla Liquid Retina XDR, 24GB de memoria unificada, SSD de 512GB y hasta 22 horas de batería.', price: 7999999, categoryId: 'computacion', brand: 'Apple', model: 'M4 Pro', stock: 8, image: 'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800', specifications: [{ name: 'Chip', value: 'Apple M4 Pro' }, { name: 'Pantalla', value: '14.2" Liquid Retina XDR' }, { name: 'Memoria', value: '24GB Unificada' }, { name: 'Almacenamiento', value: '512GB SSD' }, { name: 'Batería', value: 'Hasta 22 horas' }, { name: 'Puertos', value: '3x Thunderbolt 4, HDMI, SDXC' }, { name: 'Peso', value: '1.61 kg' }] },
    { name: 'MacBook Air 15" M3', slug: 'macbook-air-15-m3', description: 'MacBook Air de 15 pulgadas con chip M3. Ultra delgada y liviana, perfecta para el día a día.', price: 5499999, categoryId: 'computacion', brand: 'Apple', model: 'M3', stock: 12, image: 'https://images.unsplash.com/photo-1499673610122-01c7122c5dcb?w=800', specifications: [{ name: 'Chip', value: 'Apple M3' }, { name: 'Pantalla', value: '15.3" Liquid Retina' }, { name: 'Memoria', value: '16GB Unificada' }, { name: 'Almacenamiento', value: '256GB SSD' }, { name: 'Batería', value: 'Hasta 18 horas' }, { name: 'Peso', value: '1.51 kg' }] },
    { name: 'MacBook Pro 16" M4 Max', slug: 'macbook-pro-16-m4-max', description: 'La MacBook Pro más potente. Chip M4 Max con CPU de 16 núcleos y GPU de 40 núcleos.', price: 11999999, categoryId: 'computacion', brand: 'Apple', model: 'M4 Max', stock: 3, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', specifications: [{ name: 'Chip', value: 'Apple M4 Max' }, { name: 'Pantalla', value: '16.2" Liquid Retina XDR' }, { name: 'Memoria', value: '48GB Unificada' }, { name: 'Almacenamiento', value: '1TB SSD' }, { name: 'Batería', value: 'Hasta 22 horas' }, { name: 'Puertos', value: '3x Thunderbolt 4, HDMI, SDXC' }, { name: 'Peso', value: '2.14 kg' }] },
    { name: 'iMac 24" M4', slug: 'imac-24-m4', description: 'iMac de 24 pulgadas con chip M4. Diseño icónico en 7 colores vibrantes.', price: 6299999, categoryId: 'computacion', brand: 'Apple', model: 'M4', stock: 6, image: 'https://images.unsplash.com/photo-1616763355603-9755a640a287?w=800', specifications: [{ name: 'Chip', value: 'Apple M4' }, { name: 'Pantalla', value: '24" 4.5K Retina' }, { name: 'Memoria', value: '16GB Unificada' }, { name: 'Almacenamiento', value: '256GB SSD' }, { name: 'Cámara', value: '1080p FaceTime HD' }, { name: 'Colores', value: '7 colores' }] },
    { name: 'Mac mini M4 Pro', slug: 'mac-mini-m4-pro', description: 'Mac mini con chip M4 Pro. Potencia increíble en un formato ultracompacto.', price: 3299999, categoryId: 'computacion', brand: 'Apple', model: 'M4 Pro', stock: 15, image: 'https://images.unsplash.com/photo-1758857087569-83791ac9edd5?w=800', specifications: [{ name: 'Chip', value: 'Apple M4 Pro' }, { name: 'Memoria', value: '24GB Unificada' }, { name: 'Almacenamiento', value: '512GB SSD' }, { name: 'Puertos', value: '3x Thunderbolt 4, HDMI, USB-A' }, { name: 'Conectividad', value: 'WiFi 6E, Bluetooth 5.3' }, { name: 'Peso', value: '670 g' }] },
    { name: 'iPad Pro M4 13"', slug: 'ipad-pro-m4-13', description: 'iPad Pro de 13 pulgadas con chip M4. Pantalla Ultra Retina XDR con tecnología tandem OLED.', price: 5799999, categoryId: 'computacion', brand: 'Apple', model: 'M4', stock: 7, image: 'https://images.unsplash.com/photo-1648806030599-c963fd14a22f?w=800', specifications: [{ name: 'Chip', value: 'Apple M4' }, { name: 'Pantalla', value: '13" Ultra Retina XDR' }, { name: 'Almacenamiento', value: '256GB' }, { name: 'Cámara', value: '12MP + LiDAR' }, { name: 'Conectividad', value: 'WiFi 6E, Bluetooth 5.3' }, { name: 'Peso', value: '579 g' }] },
    { name: 'iPad Air M2 11"', slug: 'ipad-air-m2-11', description: 'iPad Air de 11 pulgadas con chip M2. Pantalla Liquid Retina, 128GB.', price: 3499999, categoryId: 'computacion', brand: 'Apple', model: 'M2', stock: 10, image: 'https://images.unsplash.com/photo-1682427286841-1f3ff788752b?w=800', specifications: [{ name: 'Chip', value: 'Apple M2' }, { name: 'Pantalla', value: '11" Liquid Retina' }, { name: 'Almacenamiento', value: '128GB' }, { name: 'Cámara', value: '12MP' }, { name: 'Conectividad', value: 'WiFi 6, Bluetooth 5.0' }, { name: 'Peso', value: '462 g' }] },
    { name: 'iPad 10ª Gen', slug: 'ipad-10-gen', description: 'iPad de 10ª generación. Pantalla Liquid Retina de 10.9 pulgadas, chip A14 Bionic.', price: 2299999, categoryId: 'computacion', brand: 'Apple', model: 'A14 Bionic', stock: 0, image: 'https://images.unsplash.com/photo-1630331528526-7d04c6eb463f?w=800', specifications: [{ name: 'Chip', value: 'A14 Bionic' }, { name: 'Pantalla', value: '10.9" Liquid Retina' }, { name: 'Almacenamiento', value: '64GB' }, { name: 'Cámara', value: '12MP' }, { name: 'Conector', value: 'USB-C' }, { name: 'Peso', value: '477 g' }] },
    { name: 'iPhone 16 Pro Max 256GB', slug: 'iphone-16-pro-max-256gb', description: 'El iPhone más avanzado. Chip A18 Pro, pantalla Super Retina XDR de 6.9 pulgadas.', price: 6999999, categoryId: 'electronica', brand: 'Apple', model: 'A18 Pro', stock: 10, image: 'https://images.unsplash.com/photo-1527334919515-b8dee906a34b?w=800', specifications: [{ name: 'Chip', value: 'A18 Pro' }, { name: 'Pantalla', value: '6.9" Super Retina XDR' }, { name: 'Almacenamiento', value: '256GB' }, { name: 'Cámara Principal', value: '48MP Fusion' }, { name: 'Zoom', value: 'Óptico 5x' }, { name: 'Material', value: 'Titanio' }, { name: 'Batería', value: 'Hasta 33 horas' }] },
    { name: 'iPhone 16 Pro 128GB', slug: 'iphone-16-pro-128gb', description: 'iPhone 16 Pro con chip A18 Pro. Pantalla de 6.3 pulgadas, cámara de 48MP.', price: 5999999, categoryId: 'electronica', brand: 'Apple', model: 'A18 Pro', stock: 14, image: 'https://images.unsplash.com/photo-1726587912121-ea21fcc57ff8?w=800', specifications: [{ name: 'Chip', value: 'A18 Pro' }, { name: 'Pantalla', value: '6.3" Super Retina XDR' }, { name: 'Almacenamiento', value: '128GB' }, { name: 'Cámara Principal', value: '48MP Fusion' }, { name: 'Zoom', value: 'Óptico 3x' }, { name: 'Material', value: 'Titanio' }, { name: 'Batería', value: 'Hasta 27 horas' }] },
    { name: 'iPhone 16 128GB', slug: 'iphone-16-128gb', description: 'iPhone 16 con chip A18. Pantalla Super Retina XDR de 6.1 pulgadas.', price: 4499999, categoryId: 'electronica', brand: 'Apple', model: 'A18', stock: 20, image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800', specifications: [{ name: 'Chip', value: 'A18' }, { name: 'Pantalla', value: '6.1" Super Retina XDR' }, { name: 'Almacenamiento', value: '128GB' }, { name: 'Cámara Principal', value: '48MP Fusion' }, { name: 'Ultra Gran Angular', value: '12MP' }, { name: 'Batería', value: 'Hasta 22 horas' }] },
    { name: 'Apple Watch Ultra 2', slug: 'apple-watch-ultra-2', description: 'Apple Watch Ultra 2 con chip S9. Caja de titanio de 49mm, GPS de doble frecuencia.', price: 3499999, categoryId: 'electronica', brand: 'Apple', model: 'Ultra 2', stock: 5, image: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800', specifications: [{ name: 'Chip', value: 'Apple S9' }, { name: 'Pantalla', value: '49mm, 3000 nits' }, { name: 'Material', value: 'Titanio' }, { name: 'GPS', value: 'Doble frecuencia' }, { name: 'Batería', value: 'Hasta 36 horas' }, { name: 'Resistencia', value: '100m (EN13319)' }] },
    { name: 'Apple Watch Series 9', slug: 'apple-watch-series-9', description: 'Apple Watch Series 9 con chip S9. Procesamiento de Siri en dispositivo.', price: 2299999, categoryId: 'electronica', brand: 'Apple', model: 'Series 9', stock: 11, image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800', specifications: [{ name: 'Chip', value: 'Apple S9' }, { name: 'Pantalla', value: 'Siempre activa' }, { name: 'Sensor', value: 'Oxímetro + ECG' }, { name: 'GPS', value: 'Integrado' }, { name: 'Batería', value: 'Hasta 18 horas' }] },
    { name: 'AirPods Pro 2', slug: 'airpods-pro-2', description: 'AirPods Pro de 2ª generación. Cancelación activa de ruido 2x más efectiva.', price: 999999, categoryId: 'electronica', brand: 'Apple', model: 'AirPods Pro 2', stock: 25, image: 'https://images.unsplash.com/photo-1754142654807-1dfcdc3f7f22?w=800', specifications: [{ name: 'Chip', value: 'Apple H2' }, { name: 'Cancelación', value: 'Activa 2x' }, { name: 'Audio', value: 'Espacial personalizado' }, { name: 'Resistencia', value: 'IPX4' }, { name: 'Batería', value: '6h (30h con estuche)' }] },
    { name: 'AirPods Max', slug: 'airpods-max', description: 'AirPods Max con audio de alta fidelidad. Auriculares over-ear con cancelación activa de ruido.', price: 2499999, categoryId: 'electronica', brand: 'Apple', model: 'AirPods Max', stock: 6, image: 'https://images.unsplash.com/photo-1556196148-1fb724238998?w=800', specifications: [{ name: 'Tipo', value: 'Over-ear' }, { name: 'Cancelación', value: 'Activa' }, { name: 'Audio', value: 'Espacial con seguimiento' }, { name: 'Driver', value: 'Apple de 40mm' }, { name: 'Batería', value: '20 horas' }, { name: 'Peso', value: '385 g' }] },
    { name: 'Shure SM7B', slug: 'shure-sm7b', description: 'Micrófono dinámico cardioide de estudio. Estándar de la industria para broadcasting.', price: 1499999, categoryId: 'electronica', brand: 'Shure', model: 'SM7B', stock: 9, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800', specifications: [{ name: 'Tipo', value: 'Dinámico' }, { name: 'Patrón Polar', value: 'Cardioide' }, { name: 'Respuesta', value: '50Hz - 20kHz' }, { name: 'Impedancia', value: '150Ω' }, { name: 'Filtro Pop', value: 'Integrado' }, { name: 'Peso', value: '765 g' }] },
    { name: 'Rode NT-USB Mini', slug: 'rode-nt-usb-mini', description: 'Micrófono USB condensador con calidad de estudio. Diseño compacto.', price: 599999, categoryId: 'electronica', brand: 'Rode', model: 'NT-USB Mini', stock: 18, image: 'https://images.unsplash.com/photo-1652071148620-99be24e731a8?w=800', specifications: [{ name: 'Tipo', value: 'Condensador' }, { name: 'Patrón Polar', value: 'Cardioide' }, { name: 'Respuesta', value: '20Hz - 20kHz' }, { name: 'Conexión', value: 'USB-C' }, { name: 'Monitoreo', value: 'Sin latencia' }, { name: 'Peso', value: '385 g' }] },
    { name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: 'Auriculares inalámbricos con cancelación de ruido líder en la industria.', price: 1299999, categoryId: 'electronica', brand: 'Sony', model: 'WH-1000XM5', stock: 22, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', specifications: [{ name: 'Tipo', value: 'Over-ear inalámbrico' }, { name: 'Cancelación', value: 'Adaptativa líder' }, { name: 'Driver', value: '30mm' }, { name: 'Batería', value: '30 horas' }, { name: 'Carga', value: 'USB-C, 3h a full' }, { name: 'Peso', value: '250 g' }] },
    { name: 'DJI Osmo Pocket 3', slug: 'dji-osmo-pocket-3', description: 'Cámara compacta con estabilización de 3 ejes. Sensor de 1 pulgada.', price: 1899999, categoryId: 'electronica', brand: 'DJI', model: 'Osmo Pocket 3', stock: 7, image: 'https://images.unsplash.com/photo-1715200811091-b7fc060667ff?w=800', specifications: [{ name: 'Sensor', value: '1" CMOS' }, { name: 'Video', value: '4K 120fps' }, { name: 'Estabilización', value: '3 ejes mecánica' }, { name: 'Pantalla', value: '2" táctil giratoria' }, { name: 'Batería', value: 'Hasta 2 horas' }, { name: 'Peso', value: '179 g' }] },
    { name: 'GoPro HERO12 Black', slug: 'gopro-hero12-black', description: 'Cámara de acción definitiva. Video 5.3K a 60fps, HyperSmooth 6.0.', price: 1599999, categoryId: 'electronica', brand: 'GoPro', model: 'HERO12 Black', stock: 4, image: 'https://images.unsplash.com/photo-1703145204993-d1178bfc3f9f?w=800', specifications: [{ name: 'Video', value: '5.3K 60fps' }, { name: 'Foto', value: '27MP' }, { name: 'Estabilización', value: 'HyperSmooth 6.0' }, { name: 'Resistencia', value: '10m sin carcasa' }, { name: 'Batería', value: 'Enduro, 70min 5.3K' }] },
    { name: 'Trek FX 3 Disc', slug: 'trek-fx-3-disc', description: 'Bicicleta híbrida de alto rendimiento. Cuadro de aluminio Alpha Gold.', price: 4999999, categoryId: 'deportes', brand: 'Trek', model: 'FX 3 Disc', stock: 3, image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800', specifications: [{ name: 'Cuadro', value: 'Aluminio Alpha Gold' }, { name: 'Horquilla', value: 'Carbono' }, { name: 'Transmisión', value: 'Shimano Alivio 18v' }, { name: 'Frenos', value: 'Disco hidráulicos' }, { name: 'Ruedas', value: '700c Bontrager' }, { name: 'Peso', value: '10.5 kg' }] },
    { name: 'Specialized Rockhopper', slug: 'specialized-rockhopper', description: 'MTB de entrada con calidad superior. Cuadro A1 Premium Aluminio.', price: 3799999, categoryId: 'deportes', brand: 'Specialized', model: 'Rockhopper', stock: 5, image: 'https://images.unsplash.com/photo-1633707167682-9068729bc84c?w=800', specifications: [{ name: 'Cuadro', value: 'A1 Premium Aluminio' }, { name: 'Suspensión', value: 'SR Suntour XCR 100mm' }, { name: 'Transmisión', value: 'microSHIFT Advent X 10v' }, { name: 'Frenos', value: 'Disco hidráulicos' }, { name: 'Ruedas', value: '29" Specialized' }, { name: 'Peso', value: '13.8 kg' }] },
    { name: 'Taladro Bosch Professional 18V', slug: 'taladro-bosch-professional-18v', description: 'Taladro inalámbrico Professional GSR 18V-50. Mandril autoajustable de 13mm.', price: 899999, categoryId: 'herramientas', brand: 'Bosch', model: 'GSR 18V-50', stock: 16, image: 'https://images.unsplash.com/photo-1645651964715-d200ce0939cc?w=800', specifications: [{ name: 'Voltaje', value: '18V' }, { name: 'Mandril', value: '13mm autoajustable' }, { name: 'Velocidad', value: 'Variable 2 marchas' }, { name: 'Par', value: '50 Nm' }, { name: 'Batería', value: 'Iones de litio 4.0Ah' }, { name: 'Peso', value: '1.3 kg' }] },
    { name: 'DeWalt Sierra Circular 7¼"', slug: 'dewalt-sierra-circular-7-14', description: 'Sierra circular inalámbrica DeWalt DCS575. Motor sin escobillas.', price: 1299999, categoryId: 'herramientas', brand: 'DeWalt', model: 'DCS575', stock: 8, image: 'https://images.unsplash.com/photo-1642006953671-1bda5cd362ba?w=800', specifications: [{ name: 'Hoja', value: '7¼" (184mm)' }, { name: 'Motor', value: 'Sin escobillas' }, { name: 'Bisel', value: '0° - 57°' }, { name: 'Guía', value: 'Láser integrada' }, { name: 'Batería', value: '18V XR 5.0Ah' }, { name: 'Peso', value: '3.8 kg' }] },
    { name: 'Makita Lijadora Orbital', slug: 'makita-lijadora-orbital', description: 'Lijadora orbital aleatoria Makita BO5041. Diámetro de órbita de 5mm.', price: 699999, categoryId: 'herramientas', brand: 'Makita', model: 'BO5041', stock: 12, image: 'https://images.unsplash.com/photo-1689935421853-cb23a0bc92e4?w=800', specifications: [{ name: 'Tipo', value: 'Orbital aleatoria' }, { name: 'Órbita', value: '5mm' }, { name: 'Velocidad', value: '4000-12000 OPM' }, { name: 'Extracción', value: 'Polvo integrada' }, { name: 'Plato', value: '125mm (5")' }, { name: 'Peso', value: '1.6 kg' }] },
    { name: 'Dyson V15 Detect', slug: 'dyson-v15-detect', description: 'Aspiradora inalámbrica Dyson V15 Detect. Láser revela polvo invisible.', price: 3299999, categoryId: 'hogar', brand: 'Dyson', model: 'V15 Detect', stock: 6, image: 'https://images.unsplash.com/photo-1569698134101-f15cde5cd66c?w=800', specifications: [{ name: 'Succión', value: '240W (240AW)' }, { name: 'Autonomía', value: 'Hasta 60 min' }, { name: 'Filtración', value: 'HEPA completa' }, { name: 'Tecnología', value: 'Laser Detect' }, { name: 'Pantalla', value: 'LCD con conteo' }, { name: 'Peso', value: '2.7 kg' }] },
    { name: 'Philips Airfryer XXL', slug: 'philips-airfryer-xxl', description: 'Freidora de aire Philips Airfryer XXL con tecnología Rapid Air.', price: 1199999, categoryId: 'hogar', brand: 'Philips', model: 'Airfryer XXL', stock: 14, image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800', specifications: [{ name: 'Capacidad', value: '2kg (7 porciones)' }, { name: 'Tecnología', value: 'Rapid Air' }, { name: 'Programas', value: '7 predefinidos' }, { name: 'Temperatura', value: '80°C - 200°C' }, { name: 'Pantalla', value: 'Táctil digital' }, { name: 'Potencia', value: '2000W' }] },
    { name: 'Nespresso Vertuo Next', slug: 'nespresso-vertuo-next', description: 'Cafetera Nespresso Vertuo Next. Tecnología Centrifusion.', price: 699999, categoryId: 'hogar', brand: 'Nespresso', model: 'Vertuo Next', stock: 20, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', specifications: [{ name: 'Sistema', value: 'Centrifusion' }, { name: 'Tamaños', value: '5 (Espresso a Alto)' }, { name: 'Depósito', value: '1.1L' }, { name: 'Conectividad', value: 'WiFi + Bluetooth' }, { name: 'Material', value: 'Plástico reciclado 54%' }, { name: 'Peso', value: '3.8 kg' }] },
  ];

  const createdProducts: { id: string; name: string; slug: string; price: number; sku: string }[] = [];

  for (const mp of mockProducts) {
    const productSlug = mp.slug;
    const productSku = `SKU-${mp.categoryId.toUpperCase().slice(0, 4)}-${productSlug.slice(0, 20).toUpperCase()}`;

    const product = await prisma.product.create({
      data: {
        name: mp.name,
        slug: productSlug,
        description: mp.description,
        brand: mp.brand ?? null,
        model: mp.model ?? null,
        sku: productSku,
        price: new Prisma.Decimal(mp.price),
        stock: mp.stock,
        isActive: true,
        isFeatured: mp.stock > 0,
        categoryId: catMap[mp.categoryId],
        images: {
          create: {
            url: mp.image ?? `https://picsum.photos/seed/${productSlug}/800/800`,
            alt: mp.name,
            order: 0,
          },
        },
        specifications: {
          create: mp.specifications.map((spec) => ({
            name: spec.name,
            value: spec.value,
          })),
        },
      },
    });

    createdProducts.push({
      id: product.id,
      name: mp.name,
      slug: productSlug,
      price: mp.price,
      sku: productSku,
    });

    console.log(`  ✓ ${mp.name}`);
  }

  console.log(`✅ ${createdProducts.length} productos creados`);

  const address = await prisma.address.create({
    data: {
      userId: client.id,
      alias: 'Casa',
      fullName: 'Cliente Prueba',
      phone: '+5493815551234',
      street: 'Av. Independencia',
      number: '1234',
      city: 'San Miguel de Tucumán',
      state: 'Tucumán',
      country: 'AR',
      isDefault: true,
    },
  });

  console.log('✅ Dirección creada');

  const now = new Date();
  const getProducts = (indices: number[]) => indices.map((i) => createdProducts[i]);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  // Order 1: PENDING — 2 items (MacBook Pro 14 + AirPods Pro 2)
  const o1p = getProducts([0, 13]);
  const o1sub = o1p.reduce((s, p) => s + p.price, 0);
  const o1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-001`,
      userId: client.id, type: 'STOCK', status: 'PENDING',
      subtotal: new Prisma.Decimal(o1sub), shippingCost: new Prisma.Decimal(15000),
      tax: new Prisma.Decimal(0), total: new Prisma.Decimal(o1sub).plus(15000),
      shippingAddressId: address.id,
      items: { create: o1p.map((p) => ({ productId: p.id, name: p.name, sku: p.sku, quantity: 1, unitPrice: new Prisma.Decimal(p.price), totalPrice: new Prisma.Decimal(p.price), image: `https://images.unsplash.com/seed/${p.slug}/200` })) },
      payments: { create: { method: 'BANK_TRANSFER', status: 'PENDING', amount: new Prisma.Decimal(o1sub).plus(15000), currency: 'ARS' } },
      tracking: { create: { status: 'PENDING', description: 'Pedido creado pendiente de confirmación' } },
    },
  });

  // Order 2: CONFIRMED — 1 item (Sony WH-1000XM5)
  const o2p = getProducts([17]);
  const o2sub = o2p.reduce((s, p) => s + p.price, 0);
  const o2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-002`,
      userId: client.id, type: 'STOCK', status: 'CONFIRMED',
      subtotal: new Prisma.Decimal(o2sub), shippingCost: new Prisma.Decimal(10000),
      tax: new Prisma.Decimal(0), total: new Prisma.Decimal(o2sub).plus(10000),
      shippingAddressId: address.id,
      items: { create: o2p.map((p) => ({ productId: p.id, name: p.name, sku: p.sku, quantity: 1, unitPrice: new Prisma.Decimal(p.price), totalPrice: new Prisma.Decimal(p.price), image: `https://images.unsplash.com/seed/${p.slug}/200` })) },
      payments: { create: { method: 'MERCADO_PAGO', status: 'APPROVED', amount: new Prisma.Decimal(o2sub).plus(10000), currency: 'ARS', transactionId: 'MP-TEST-TXN-001', payerEmail: 'cliente@test.com' } },
      tracking: { createMany: { data: [{ status: 'PENDING', description: 'Pedido creado', createdAt: daysAgo(1) }, { status: 'CONFIRMED', description: 'Pedido confirmado y pago aprobado', createdAt: now }] } },
    },
  });

  // Order 3: DELIVERED — 3 items (Taladro Bosch, Makita Lijadora, Dyson V15)
  const o3p = getProducts([22, 24, 25]);
  const o3sub = o3p.reduce((s, p) => s + p.price, 0);
  const o3 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-003`,
      userId: client.id, type: 'STOCK', status: 'DELIVERED',
      subtotal: new Prisma.Decimal(o3sub), shippingCost: new Prisma.Decimal(20000),
      tax: new Prisma.Decimal(0), total: new Prisma.Decimal(o3sub).plus(20000),
      shippingAddressId: address.id,
      items: { create: o3p.map((p, i) => ({ productId: p.id, name: p.name, sku: p.sku, quantity: i === 0 ? 2 : 1, unitPrice: new Prisma.Decimal(p.price), totalPrice: new Prisma.Decimal(p.price * (i === 0 ? 2 : 1)), image: `https://images.unsplash.com/seed/${p.slug}/200` })) },
      payments: { create: { method: 'MERCADO_PAGO', status: 'APPROVED', amount: new Prisma.Decimal(o3sub).plus(20000), currency: 'ARS', transactionId: 'MP-TEST-TXN-002', payerEmail: 'cliente@test.com' } },
      tracking: { createMany: { data: [
        { status: 'PENDING', description: 'Pedido creado', createdAt: daysAgo(5) },
        { status: 'CONFIRMED', description: 'Pedido confirmado y pago aprobado', createdAt: daysAgo(4) },
        { status: 'PROCESSING', description: 'Productos en preparación', createdAt: daysAgo(3) },
        { status: 'SHIPPED', description: 'Paquete enviado', createdAt: daysAgo(2) },
        { status: 'DELIVERED', description: 'Entregado al cliente', createdAt: daysAgo(1) },
      ] } },
    },
  });

  console.log('✅ Órdenes de ejemplo creadas');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎉 BASE DE DATOS POBLADA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  Usuarios:');
  console.log('    Admin:   admin@pirata.com / Admin123!');
  console.log('    Cliente: cliente@test.com / Test123!');
  console.log('');
  console.log(`  ${categories.length} categorías`);
  console.log(`  ${createdProducts.length} productos`);
  console.log('  3 órdenes de ejemplo (PENDING, CONFIRMED, DELIVERED)');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
