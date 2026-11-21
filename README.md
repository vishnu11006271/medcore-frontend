# Medcore HMS — Angular Frontend

Medcore HMS is a role-based hospital management platform. This repository contains the Angular web application used by platform administrators, hospital teams, clinicians, and patients.

## Live application

- **Web application:** https://medcore-frontend-7uhi.vercel.app/
- **Backend API:** https://medcore-api.duckdns.org
- **Backend source and setup:** https://github.com/vishnu11006271/medcore-backend
- **Backend API reference:** `https://medcore-api.duckdns.org/api/docs` (available after the Swagger-enabled backend is deployed)

## Features

The frontend uses role-aware navigation and guarded routes for the following workflows:

- **Authentication:** login, patient registration, email verification, and session refresh.
- **Super Admin:** hospital onboarding and verification, platform user administration, platform analytics.
- **Hospital Admin:** hospital dashboard, departments, doctors, staff, patients, appointments, laboratory, pharmacy, and billing.
- **Doctor:** appointments, patient details, medical records, prescriptions, and lab workflows.
- **Patient:** appointment booking and history, appointment details, prescriptions, medical history, and approved lab results.
- **Laboratory Technician:** lab orders, sample collection, processing, and result upload.
- **Pharmacist:** medicine catalogue, batches, stock receiving, and prescription dispensing.
- **Receptionist / Accountant:** appointment and billing workflows permitted by backend role policies.
- **Shared experience:** responsive layout, breadcrumbs, notifications, loading/error/empty states, reusable forms, confirmation dialogs, and mobile-friendly tables.

The backend remains the source of truth for authorization and data ownership. Frontend route guards improve navigation UX but do not replace API authorization.

## Technology stack

- Angular 22
- TypeScript 6
- RxJS 7
- Angular Router with lazy-loaded standalone components
- Angular Forms and HttpClient
- Vitest and jsdom for unit testing
- Vercel deployment

## Requirements

- Node.js 24 or a version supported by the installed Angular CLI.
- npm 11 (the repository declares npm 11.19.1 as its package manager).
- A running Medcore HMS backend, or access to the configured development API.

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/vishnu11006271/medcore-frontend.git
cd medcore-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API URL

The API base URL is configured in `src/environments/environment.ts`.

For local development, point it to:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

For the deployed environment, use the production API origin:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://medcore-api.duckdns.org'
};
```

Keep secrets out of frontend environment files. Any value compiled into an Angular application is visible to browser users. Authentication uses a short-lived access token and an HttpOnly refresh cookie managed by the backend; API calls that need the refresh cookie must send credentials.

### 4. Run the development server

```bash
npm start
```

Open http://localhost:4200.

## Build and tests

Development build:

```bash
npm run build
```

Production build:

```bash
ng build --configuration production
```

Unit tests:

```bash
npm test
```

Watch mode:

```bash
npm run watch
```

## Application structure

The application is organized by shared core services and feature areas:

```text
src/app/
├── core/
│   ├── guards/          # Authentication and role route guards
│   ├── interceptors/    # API/authentication HTTP behavior
│   ├── models/          # Shared TypeScript models
│   └── services/        # API and application services
├── features/
│   ├── auth/
│   ├── appointments/
│   ├── availability/
│   ├── billing/
│   ├── dashboard/
│   ├── departments/
│   ├── doctors/
│   ├── hospital-admin/
│   ├── hospitals/
│   ├── laboratory/
│   ├── lab-technician/
│   ├── patient/
│   ├── pharmacy/
│   └── users/
└── layouts/
    └── dashboard-layout/
```

Feature routes are lazy-loaded. Authentication and role guards protect the dashboard route tree and individual role-specific pages.

## Backend API

The Angular application consumes the NestJS API in the [Medcore backend repository](https://github.com/vishnu11006271/medcore-backend).

- Local API: `http://localhost:3000`
- Local Swagger UI: `http://localhost:3000/api/docs`
- Production API: `https://medcore-api.duckdns.org`
- Production Swagger UI: `https://medcore-api.duckdns.org/api/docs`

For backend setup, database migrations, environment variables, authentication details, and endpoint contracts, see the backend README and Swagger documentation.

## Deployment

The frontend is deployed on Vercel. Before deploying a new build:

1. Confirm the API base URL points to the intended backend environment.
2. Confirm the backend CORS allowlist includes the exact frontend origin.
3. Confirm the backend is configured for credentialed requests and secure refresh cookies in production.
4. Run `npm test` and `npm run build`.
5. Verify login, refresh, logout, and role-specific navigation against the deployed API.

## Security and privacy

This application displays patient and clinical information. Use synthetic data in development, avoid screenshots containing personal health information, and do not store secrets in frontend source. Backend role checks and resource-level authorization must remain enabled for all protected operations.

The project should undergo a dedicated security, privacy, and regulatory review before being used with real patient data in a production healthcare setting.
