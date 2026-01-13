# 4. Technology Stack & Architectural Overview

## 4.1 MERN Stack Components

- **MongoDB**: Document-oriented database for storing persistent application data such as users, courses, enrollments, evaluations/submissions, wallet transactions, notifications, reports, reviews, posts, Q&A, certificates, and file-share metadata.
- **Express.js**: Node.js web framework used to build the RESTful API, define routes/controllers/middleware, handle authentication/authorization, validation, and integrate supporting services.
- **React.js**: Front-end library used to build the responsive and interactive user interface (pages, components, routing, and state management via Context).
- **Node.js**: JavaScript runtime for executing the back-end application, running the API server, background/service integrations, and real-time socket features.

## 4.2 High-Level Architecture

- **Presentation Layer (React.js)**: Handles user interaction, form submissions, routing/navigation, and displays data fetched from the API (via an Axios client layer and feature-specific API modules).
- **Business Logic Layer (Express.js/Node.js)**: Processes requests, enforces business rules (e.g., auth, wallet ledger integrity, evaluation submission/grading rules), orchestrates data flow across controllers/services, and exposes REST endpoints.
- **Data Layer (MongoDB)**: Stores all persistent data as MongoDB documents accessed via Mongoose models, including accounts and all learning/workflow records.

## 4.3 Supporting Tools & Technologies

- **Mongoose (ODM)**: Defines schemas/models and provides query utilities for MongoDB collections.
- **JWT + HTTP-only Cookies**: Session/auth mechanism (access token handling) with server middleware enforcing protected routes.
- **Socket.io**: Real-time updates (e.g., live session/messaging/notifications, depending on feature usage).
- **Cloudinary**: Media storage/management integration for uploaded assets (images/files).
- **Nodemailer**: Email delivery for flows such as verification and password recovery.
- **Puppeteer (Certificates)**: Headless browser tooling used for generating certificate PDFs.
- **Vite**: Front-end dev server and build tooling for the React client.
- **Tailwind CSS**: Utility-first styling approach used across the React UI.
- **ESLint**: Linting for code quality and consistency (client and server configs present).
