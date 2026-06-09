# PROJECT STATUS — El Pirata David

> Auditoría basada exclusivamente en el código real existente.
> Fecha: 2026-06-01 | Total archivos fuente: 87 | Total líneas: ~9,177

---

## 1. ANÁLISIS POR MÓDULO

### 1.1 Auth

| Aspecto | Estado |
|---------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 100% |
| **Archivos** | 6 (`auth.controller.ts`, `auth.service.ts`, `auth.module.ts`, `dto/auth.dto.ts`, `strategies/jwt.strategy.ts`, `strategies/google.strategy.ts`) |
| **Líneas** | 460 |
| **Backend** | `register()`, `login()`, `googleLogin()`, `getProfile()`, `updateProfile()`, `changePassword()` — todos con Prisma real, bcrypt, JWT |
| **Frontend** | `auth-context.tsx` con login/register/logout/updateProfile funcionales. `login/page.tsx` y `register/page.tsx` con llamadas API reales |
| **Lo que falta** | Refresh token rotation, 2FA, verificación email, reCAPTCHA, rate limit por endpoint |

### 1.2 Users

| Aspecto | Estado |
|---------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 95% |
| **Archivos** | 3 (`users.controller.ts`, `users.service.ts`, `users.module.ts`) |
| **Líneas** | 213 |
| **Backend** | CRUD completo con paginación, búsqueda insensible, filtros por rol/estado |
| **Frontend** | `admin/users/page.tsx` — tabla con 7 usuarios mock, sin acciones funcionales |
| **Lo que falta** | DTO file específico (usa tipos inline), frontend admin no conectado a API |

### 1.3 Products

| Aspecto | Estado |
|---------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 100% |
| **Archivos** | 4 (`products.controller.ts`, `products.service.ts`, `products.module.ts`, `dto/product.dto.ts`) |
| **Líneas** | 693 |
| **Backend** | CRUD completo con 6 modos de ordenamiento, filtros múltiples, búsqueda full-text, gestión de stock, imágenes y especificaciones. DTO con 30+ campos validados |
| **Frontend** | Catálogo (`products/page.tsx`) intenta API real con fallback a 8 productos mock. Detalle (`[slug]/page.tsx`) 100% mock. Add-to-cart es `console.log` |
| **Lo que falta** | Frontend detalle no conectado a API. Imágenes son emojis placeholder. Sin reviews, sin wishlist |

### 1.4 Categories

| Aspecto | Estado |
|---------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 100% |
| **Archivos** | 4 (`categories.controller.ts`, `categories.service.ts`, `categories.module.ts`, `dto/category.dto.ts`) |
| **Líneas** | 252 |
| **Backend** | CRUD completo con estructura jerárquica (3 niveles children), validación padre/hijo, slug auto-generado |
| **Frontend** | Landing muestra categorías hardcodeadas con emojis. Admin categories no existe (lleva a 404) |
| **Lo que falta** | Frontend lista de categorías desde API |

### 1.5 Cart

| Aspecto | Estado |
|---------|--------|
| **Estado** | PARCIAL |
| **Completitud** | 30% |
| **Archivos** | 3 (`cart.controller.ts`, `cart.service.ts`, `cart.module.ts`) |
| **Líneas** | 205 |
| **Backend** | `Map<string, Cart>` en memoria — **los datos se pierden al reiniciar el servidor**. Sin persistencia en DB. Sin DTOs. Sin `dto/` directory |
| **Frontend** | `cart/page.tsx` con 3 items mock en estado local. Sin conexión a API. Sin CartContext/Provider global |
| **Lo que falta** | Modelo Cart en Prisma. Persistencia en DB. DTOs. CartProvider global. Sincronización con backend |

### 1.6 Checkout

| Aspecto | Estado |
|---------|--------|
| **Estado** | MOCK |
| **Completitud** | 15% |
| **Archivos** | 1 (`checkout/page.tsx`) |
| **Líneas** | 390 |
| **Backend** | No existe módulo Checkout separado — la lógica está en Orders + Payments |
| **Frontend** | Multi-step form completo visualmente: dirección → pago → revisar → confirmación. **100% mock**. Order submission simula con `setTimeout`. Items mock hardcodeados. Sin integración con carrito real |
| **Lo que falta** | Conectar con backend Orders. Pasar datos reales del carrito. Integrar Mercado Pago SDK frontend |

### 1.7 Orders

| Aspecto | Estado |
|---------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 100% |
| **Archivos** | 4 (`orders.controller.ts`, `orders.service.ts`, `orders.module.ts`, `dto/order.dto.ts`) |
| **Líneas** | 479 |
| **Backend** | Creación transaccional con `$transaction`. Validación stock, decremento atómico, tracking-status histórico, cancelación con restauración de stock. DTOs completos |
| **Frontend** | Lista (`orders/page.tsx`) 100% mock (4 órdenes). Detalle (`[id]/page.tsx`) 100% mock (solo ID 1 funciona) |
| **Lo que falta** | Frontend conectado a API. Cancelar orden desde UI |

### 1.8 Payments

| Aspecto | Estado |
|--------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 95% |
| **Archivos** | 4 (`payments.controller.ts`, `payments.service.ts`, `payments.module.ts`, `dto/payment.dto.ts`) |
| **Líneas** | 365 |
| **Backend** | Mercado Pago SDK integrado (creación preference + webhook). Transferencia bancaria con confirmación manual. Webhook procesa notificaciones MP reales |
| **Frontend** | Checkout muestra opciones MP y Transferencia, pero sin SDK frontend de MP |
| **Lo que falta** | Widget de Mercado Pago en frontend (Checkout Pro). Manejo de errores MP más robusto |

### 1.9 Addresses

| Aspecto | Estado |
|--------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 100% |
| **Archivos** | 4 (`addresses.controller.ts`, `addresses.service.ts`, `addresses.module.ts`, `dto/address.dto.ts`) |
| **Líneas** | 237 |
| **Backend** | CRUD completo con gestión de dirección por defecto. Validación de propietario. DTO completo |
| **Frontend** | No hay página de gestión de direcciones. El checkout tiene campos de dirección inline sin conectar a API |
| **Lo que falta** | Frontend de gestión de direcciones en perfil |

### 1.10 Upload

| Aspecto | Estado |
|--------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 95% |
| **Archivos** | 3 (`upload.controller.ts`, `upload.service.ts`, `upload.module.ts`) |
| **Líneas** | 250 |
| **Backend** | Cloudinary con fallback local. Validación MIME (jpg/png/webp/gif). Límite 5MB. Single + multiple upload |
| **Frontend** | No hay UI de upload en productos ni perfil |
| **Lo que falta** | Componente frontend de upload. Integración con admin productos |

### 1.11 Admin

| Aspecto | Estado |
|--------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 100% |
| **Archivos** | 3 (`admin.controller.ts`, `admin.service.ts`, `admin.module.ts`) |
| **Líneas** | 326 |
| **Backend** | Dashboard con 11 queries paralelas (stats, revenue mensual, bajo stock, orders recientes, status grouping). Reportes de ventas, productos y usuarios con agrupaciones avanzadas |
| **Frontend** | Dashboard 100% mock. Products/Orders/Users/AI-requests 100% mock. Botones sin acciones. Admin layout con sidebar funcional. Páginas `/admin/categories` y `/admin/reports` no existen (404) |
| **Lo que falta** | Conexión frontend→API. CRUD actions reales. Charts library. Export reports |

### 1.12 AI Requests (Pedido por Enlace)

| Aspecto | Estado |
|--------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 100% |
| **Archivos** | 4 (`ai-requests.controller.ts`, `ai-requests.service.ts`, `ai-requests.module.ts`, `dto/ai-request.dto.ts`) |
| **Líneas** | 571 |
| **Backend** | OpenAI GPT-4o-mini integrado para extraer datos de productos. Matching con productos locales vía keywords + brand + price proximity (confidence scoring 0-1). Flujo completo: PENDING → PROCESSING → ANALYZED → ALTERNATIVES_FOUND → COMPLETED/REJECTED. Creación de orden en approve |
| **Frontend** | Formulario de envío + lista de solicitudes + detalle — **100% mock**. Sin conexión a API. Botones "Seleccionar" y "Reintentar" son no-op |
| **Lo que falta** | Frontend conectado a API. Gatillo real de análisis IA. Selección real de alternativas |

### 1.13 Prisma Schema

| Aspecto | Estado |
|--------|--------|
| **Estado** | PARCIAL |
| **Completitud** | 60% |
| **Archivos** | 1 (`prisma/schema.prisma`) |
| **Líneas** | 330 |
| **Modelos existentes** | User, Address, Category, Product, ProductImage, ProductSpecification, Order, OrderItem, OrderTracking, Payment, AIRequest, ProductAlternative, AIRequestReview |
| **Modelos faltantes** | Cart/CartItem, Supplier, SupplierProduct, SupplierPricing, ImportRequest, ImportAlternative, ImportNegotiation, ImportTimeline, ImportDocument, PurchaseOrder, PurchaseOrderItem, Warehouse, ProductStock, StockMovement, Role, UserRoleAssignment, AuditLog, NotificationTemplate, NotificationLog |
| **Lo que falta** | ~18 modelos para operación de importación profesional |

### 1.14 OpenAI Integration

| Aspecto | Estado |
|--------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 90% |
| **Código** | `ai-requests.service.ts` líneas 133-215 |
| **Backend** | Llamada real a GPT-4o-mini con prompt estructurado. Parsea respuesta JSON. Extrae nombre, marca, modelo, categoría, precio, especificaciones, imágenes |
| **Lo que falta** | Retry con backoff. Validación de schema de respuesta. Fallback a modelo más barato. Streaming de progreso al frontend |

### 1.15 Google OAuth

| Aspecto | Estado |
|--------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 100% |
| **Código** | `strategies/google.strategy.ts` + `auth.controller.ts` (GET /auth/google, GET /auth/google/callback) |
| **Backend** | Passport strategy completa con callback, creación/actualización de usuario |
| **Frontend** | Botón "Google" en login/register con link directo a backend |

### 1.16 Mercado Pago

| Aspecto | Estado |
|--------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 90% |
| **Código** | `payments.service.ts` líneas 220-290 |
| **Backend** | SDK integrado dinámicamente. Creación de Preference con items, back_urls, notification_url. Webhook processing |
| **Lo que falta** | Frontend Checkout Pro (widget de MP). Manejo de excepciones de API de MP |

### 1.17 Cloudinary

| Aspecto | Estado |
|--------|--------|
| **Estado** | COMPLETO |
| **Completitud** | 90% |
| **Código** | `upload.service.ts` líneas 80-130 |
| **Backend** | SDK integrado dinámicamente. Upload stream con carpeta configurable. Delete. Fallback a filesystem local |
| **Lo que falta** | Webhook de eliminación. Componente frontend de upload |

### 1.18 Email System

| Aspecto | Estado |
|--------|--------|
| **Estado** | NO IMPLEMENTADO |
| **Completitud** | 0% |
| **Dependencia** | `resend` en `package.json` — **NUNCA importado** |
| **Código** | No existe ni un archivo, ni un servicio, ni un template |
| **Lo que falta** | Módulo completo: NotificationService, templates, cola de envío, webhooks de entrega |

### 1.19 WhatsApp Integration

| Aspecto | Estado |
|--------|--------|
| **Estado** | NO IMPLEMENTADO |
| **Completitud** | 0% |
| **Código** | No existe |
| **Lo que falta** | Módulo completo con WABA/Meta Cloud API |

---

## 2. COMPLETITUD POR CAPA

### Backend (51 archivos, 4,294 líneas)

| Métrica | Valor |
|---------|-------|
| Módulos 100% reales | 10 de 12 (Auth, Users, Products, Categories, Orders, Payments, Addresses, AI Requests, Upload, Admin) |
| Módulo parcial | Cart (30%) |
| Módulos no implementados | Email System, WhatsApp |
| **Completitud backend** | **~88%** |

### Frontend (36 archivos, 4,553 líneas)

| Métrica | Valor |
|---------|-------|
| Páginas con API real | 3 de 16 (login, register, profile lectura) |
| Páginas 100% mock | 9 de 16 (product detail, cart, checkout, orders, orders detail, ai-requests, ai-requests detail, admin pages) |
| Páginas con fallback API | 1 (products catalog) |
| Páginas completamente estáticas | 1 (landing) |
| Componentes reutilizables | 6 (Button, Card, Input, Badge, Header, Footer) |
| Empty directories | 3 (types/, hooks/, styles/) |
| Páginas linked que no existen | 5 (/contact, /faq, /shipping, /admin/categories, /admin/reports) |
| **Completitud frontend** | **~25%** |

### Infraestructura

| Componente | Estado | Completitud |
|------------|--------|-------------|
| Monorepo (Turborepo) | COMPLETO | 100% |
| TypeScript strict | COMPLETO | 100% |
| Prisma ORM | COMPLETO | 100% |
| PostgreSQL config | COMPLETO | 100% |
| Env configuration | COMPLETO | 100% |
| Docker | NO IMPLEMENTADO | 0% |
| CI/CD | NO IMPLEMENTADO | 0% |
| Tests (spec) | NO IMPLEMENTADO | 0% |
| **Completitud infraestructura** | **~55%** |

### Completitud Global

| Capa | Peso | % | Ponderado |
|------|------|---|-----------|
| Backend | 45% | 88% | 39.6% |
| Frontend | 40% | 25% | 10.0% |
| Infraestructura | 15% | 55% | 8.25% |
| **TOTAL** | **100%** | | **~58%** |

---

## 3. BRECHA BACKEND vs FRONTEND

```
Backend:  ████████████████████░░░░  88%  (10/12 módulos completos)
Frontend: █████░░░░░░░░░░░░░░░░░░░  25%  (3/16 páginas con API real)
```

El backend está significativamente más avanzado que el frontend. La mayoría de los endpoints funcionan con Prisma real, pero el frontend consume datos mock. La prioridad inmediata debe ser **conectar frontend a API**.

---

## 4. LISTA PRIORIZADA

### FASE 1 — Imprescindible para MVP

> Objetivo: Lanzar con stock propio + pedido por enlace funcional.

| # | Tarea | Módulo | Esfuerzo | Depende de |
|---|-------|--------|----------|------------|
| P0 | Persistir carrito en DB + conectar frontend | Cart | 2 días | Modelo Cart en Prisma |
| P0 | Conectar frontend productos a API real | Products | 1 día | — |
| P0 | Implementar add-to-cart real (product detail → API) | Cart | 1 día | Cart DB |
| P0 | Conectar frontend AI Requests a API real | AI Requests | 2 días | — |
| P0 | Pasar datos reales del carrito al checkout | Checkout | 1 día | Cart DB |
| P1 | Implementar creación de orden real desde checkout | Orders | 2 días | Cart + Checkout |
| P1 | Integrar widget Mercado Pago frontend | Payments | 2 días | Checkout |
| P1 | Conectar frontend órdenes a API real | Orders | 1 día | — |
| P0 | **TOTAL FASE 1** | | **~12 días** | |

### FASE 2 — Necesario para Producción

> Objetivo: Operación profesional con gestión completa.

| # | Tarea | Módulo | Esfuerzo |
|---|-------|--------|----------|
| P1 | Conectar frontend admin a API real | Admin | 3 días |
| P1 | Implementar CRUD admin productos (create/edit/delete) | Admin | 2 días |
| P1 | Implementar gestión de estados de orden en admin | Admin | 1 día |
| P1 | Implementar módulo de emails transaccionales (Resend) | Email | 3 días |
| P1 | Implementar recuperación de contraseña | Auth | 1 día |
| P2 | Implementar refresh token rotation | Auth | 1 día |
| P2 | Agregar reCAPTCHA en login/register | Auth | 1 día |
| P2 | Implementar rate limiting por endpoint | Security | 1 día |
| P2 | Agregar audit logging en operaciones críticas | Security | 2 días |
| P2 | Completar direcciones de envío en frontend perfil | Addresses | 1 día |
| P2 | Componente upload de imágenes en admin | Upload | 1 día |
| P2 | SEO técnico (sitemap, robots, structured data) | SEO | 2 días |
| P2 | Implementar página de categorías desde API | Categories | 1 día |
| P2 | **TOTAL FASE 2** | | **~20 días** |

### FASE 3 — Escalamiento Enterprise

> Objetivo: 100k usuarios, multi-proveedor, automatización IA.

| # | Tarea | Módulo | Esfuerzo |
|---|-------|--------|----------|
| P2 | Módulo Proveedores (Supplier, SupplierProduct, SupplierPricing) | New | 5 días |
| P2 | Sistema de cotizaciones de importación (ImportRequest completo) | New | 5 días |
| P2 | Purchase Orders a proveedores | New | 3 días |
| P2 | Gestión de bodega multi-warehouse | New | 3 días |
| P2 | Sistema de notificaciones WhatsApp | New | 3 días |
| P2 | RBAC granular con permisos atómicos | Auth | 2 días |
| P2 | Dashboard analítico con charts | Admin | 3 días |
| P3 | Multi-currency + exchange rates | Products | 2 días |
| P3 | 2FA (TOTP) | Auth | 2 días |
| P3 | Portal de proveedores self-service | New | 5 días |
| P3 | Automatización IA de cotizaciones completas | AI | 5 días |
| P3 | Chatbot IA para soporte | New | 5 días |
| P3 | App móvil (React Native) | New | 20 días |
| P3 | Internacionalización (EN/PT) | i18n | 5 días |
| P3 | **TOTAL FASE 3** | | **~68 días** |

---

## 5. RIESGOS TÉCNICOS INMEDIATOS

| Riesgo | Impacto | Detectado en |
|--------|---------|--------------|
| Carrito en memoria → pérdida de datos en reinicio | 🔴 Alto | `cart.service.ts` — `Map<string, Cart>` |
| Detalle producto no conectado a API → add-to-cart no funcional | 🔴 Alto | `products/[slug]/page.tsx` — `console.log` |
| Checkout completamente mock → sin conversión real | 🔴 Alto | `checkout/page.tsx` — `setTimeout` |
| Admin CRUD no funcional → operaciones manuales | 🟡 Medio | admin/* pages — botones sin handler |
| Sin tests → riesgo de regresión en cada cambio | 🟡 Medio | 0 archivos `.spec.ts` en todo el proyecto |
| Sin emails → cliente no recibe confirmaciones ni tracking | 🟡 Medio | Resend en package.json, 0 imports |
| Páginas linked rotas → 5 páginas del UI llevan a 404 | 🟢 Bajo | /contact, /faq, /shipping, /admin/categories, /admin/reports |

---

## 6. MÉTRICAS CLAVE

```
Backend real:         ████████████████████░░░░░░  88%
Frontend real:        ██████░░░░░░░░░░░░░░░░░░░░  25%
Prisma modelos:       ██████████████░░░░░░░░░░░░  60%  (13/31 modelos)
UI components:        ████████████████░░░░░░░░░░  66%  (4/6 needed)
Admin funcional:      ██████░░░░░░░░░░░░░░░░░░░░  20%
Email/WhatsApp:       ░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
Tests:                ░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
```

**Conclusión**: El backend es sólido (88%). El frontend es la deuda técnica principal (25%). La prioridad #1 es conectar frontend a APIs existentes. La prioridad #2 es implementar email y finalizar carrito. El módulo de proveedores y el sistema de importaciones avanzado deben construirse después de tener el flujo básico funcional de extremo a extremo.
