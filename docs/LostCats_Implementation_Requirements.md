# LostCats — Изисквания за реалната имплементация  
**(вариант: NestJS + Next.js + PostgreSQL + Google Cloud Storage + k3s)**

Този документ описва **как** да се имплементира платформата според избран стек и инфраструктура.  
Продуктовото описание и логическите данни са в отделния файл „Пълно продуктово описание“.

---

## 1) Технологичен стек
- **Backend:** **NestJS (Node.js, TypeScript)** — **монолитно приложение**
- **Frontend:** **Next.js (React, App Router)**
- **Database:** PostgreSQL
- **Object Storage:** **Google Cloud Storage (GCS)**
- **Containerization:** Docker
- **Orchestration / Deploy:** k3s cluster (Kubernetes)

Допълнителни зависимости (препоръчителни):
- **ORM:** Prisma или TypeORM
- **Auth:** JWT access + refresh (или cookie-based sessions)
- **Migrations:** Prisma Migrate или TypeORM migrations
- **Background jobs:** BullMQ + Redis
- **Observability:** Prometheus/Grafana + Loki (по избор), OpenTelemetry (по избор)

---

## 2) Архитектура

### 2.1 Backend архитектура (NestJS — монолит)

Backend-ът е **монолитно NestJS приложение**, организирано **модулно**, а не като микросървиси.

> ⚠️ Това е **съзнателен архитектурен избор** за първата версия.  
> В бъдеще модулите могат да бъдат **екстрахирани като самостоятелни микросървиси**, без промяна в бизнес логиката.

#### Слоеве в монолита:
- **Controllers**
  - HTTP endpoints
  - DTOs
  - Guards, Pipes, Interceptors

- **Services**
  - бизнес логика
  - правила, лимити, matching
  - orchestration между домейн модули

- **Repositories**
  - ORM достъп (Prisma/TypeORM)
  - транзакции
  - оптимизирани заявки

- **Storage abstraction**
  - Google Cloud Storage client
  - signed URLs
  - bucket policies

- **Background workers**
  - thumbnails
  - EXIF strip
  - scheduled tasks

---

## 3) Frontend архитектура (Next.js)

- App Router
- Server Components (read-heavy)
- Client Components (форми, upload, messaging)
- Data fetching: Server Actions или TanStack Query
- Forms: React Hook Form
- Maps: Leaflet / Mapbox / Google Maps
- Image optimization: Next Image

---

## 4) Backend модули (в рамките на монолита)

- `AuthModule`
- `UsersModule`
- `PostsModule`
- `PhotosModule`
- `ChipLookupModule`
- `MessagingModule`
- `ReportsModule`
- `MatchingModule`
- `AdminModule`

Всеки модул съдържа:
- controller
- service
- repository
- DTOs
- tests

---

## 5) База данни (PostgreSQL)

Логическият модел остава **непроменен**.

### Таблици
- `users`
- `posts`
- `post_photos`
- `message_threads`
- `messages`
- `reports`
- `match_suggestions`
- `audit_logs`

### Индекси
- `posts(type, status, event_datetime desc)`
- `posts(chip_number)`
- Гео-индекс:
  - **вариант A:** PostGIS
  - **вариант B:** lat/lng + Haversine
- `message_threads(post_id, created_at)`
- `messages(thread_id, created_at)`

---

## 6) Съхранение на снимки — Google Cloud Storage

### 6.1 Изисквания
- upload на оригинал
- автоматично генериране на thumbnail
- премахване на EXIF
- private bucket
- публичен достъп **само чрез signed URLs**

### 6.2 Реализация (NestJS + GCS)
- Bucket: `lostcats-photos`
- Bucket policy: **private**
- Service Account с ограничени права (`storage.objectAdmin`)

#### API
- `POST /api/v1/posts/{id}/photos`
  - Multer interceptor
  - MIME/type и size validation
  - upload към GCS
  - запис в `post_photos`
  - enqueue thumbnail job (BullMQ)

- Signed URLs:
  - кратък TTL (напр. 10–30 мин)
  - генерират се от backend-а

---

## 7) API договори

API е **REST**, без GraphQL или BFF слой.

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-email`

### Posts
- `GET /api/v1/posts`
- `POST /api/v1/posts`
- `GET /api/v1/posts/{id}`
- `PATCH /api/v1/posts/{id}`
- `POST /api/v1/posts/{id}/resolve`
- `POST /api/v1/posts/{id}/archive`

### Photos
- `POST /api/v1/posts/{id}/photos`
- `DELETE /api/v1/photos/{photo_id}`
- `PATCH /api/v1/posts/{id}/photos/reorder`

### Messaging
- `POST /api/v1/posts/{id}/contact`
- `GET /api/v1/threads`
- `GET /api/v1/threads/{id}/messages`
- `POST /api/v1/threads/{id}/messages`

---

## 8) Сигурност
- Password hashing: bcrypt / argon2
- JWT:
  - access token: 15–30 мин
  - refresh token: 7–30 дни
- NestJS Guards:
  - `AuthGuard`
  - `RolesGuard`
- Rate limiting:
  - NestJS Throttler + Redis
- Upload защита:
  - max size
  - MIME allowlist
- CORS:
  - само frontend домейна

---

## 9) Локално развитие
- Docker Compose:
  - `api` (NestJS)
  - `web` (Next.js)
  - `db` (Postgres)
  - `redis`
- GCS:
  - emulator или реален GCP проект
- Migrations:
  - `prisma migrate dev`

---

## 10) Деплой в k3s

### Компоненти
- Namespace: `lostcats`
- Deployments:
  - `lostcats-api` (NestJS монолит)
  - `lostcats-web` (Next.js standalone)
  - `postgres`
  - `redis`
  - `worker` (BullMQ)

### Ingress
- `/` → Next.js
- `/api` → NestJS

---

## 11) Definition of Done
- Работеща регистрация и вход
- CRUD за LOST / FOUND
- Upload до 5 снимки (GCS)
- Geo search
- Chip lookup
- Messaging
- Монолитно приложение деплойнато в k3s с TLS

---

## 12) Архитектурна еволюция
- Първа версия: **монолит**
- Следваща версия:
  - изнасяне на `photos`, `messaging`, `matching` като microservices
  - async комуникация (events / queues)
- Този документ описва **само монолитната имплементация**
