# Diagram Assessment

A modern, collaborative diagramming application built with React, TypeScript, and React Flow. Features real-time persistence, role-based access control (RBAC), and a customizable editor.

## Features

-   **Interactive Editor**: Drag-and-drop interface powered by [React Flow](https://reactflow.dev/).
    -   Custom nodes with inline editing.
    -   Smooth zooming and panning.
-   **Cloud Persistence**: Real-time saving and loading of diagrams using **Firebase Firestore**.
-   **Authentication & Security**:
    -   User authentication via **Firebase Auth**.
    -   **Role-Based Access Control (RBAC)**: manage permissions (Owner, Editor, Viewer).
    -   Secure diagram sharing with specific user roles.
-   **Theming**: Built-in support for **Light** and **Dark** modes, persisting user preference.
-   **Responsive Design**: Modern UI using CSS variables and flexbox/grid layouts.
-   **Sharing**: Share diagrams with other users via email, granting them view or edit access.
-   **Demo Features**: The **Profile** screen includes a "Switch Role" button. This allows you to toggle your account between **Editor** and **Viewer** roles to test the RBAC (Role-Based Access Control) functionality without needing multiple accounts.

## Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Build Tool**: Vite
-   **Diagramming**: @xyflow/react (React Flow)
-   **Backend / BaaS**: Firebase (Auth, Firestore)
-   **Styling**: Native CSS with Variables, Lucide React (Icons)
-   **Testing**: Vitest, React Testing Library

## Getting Started

### Prerequisites

-   Node.js (v18+ recommended)
-   pnpm (recommended) or npm/yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd diagram-assessment
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory with your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Start the development server**
    ```bash
    pnpm dev
    ```

## Scripts

-   `pnpm dev`: Start the development server.
-   `pnpm build`: Type-check and build the application for production.
-   `pnpm preview`: Preview the production build locally.
-   `pnpm lint`: Run ESLint to check code quality.
-   `pnpm test`: Run unit tests with Vitest.

## Project Structure

```
src/
├── components/         # Reusable UI components (Button, Input, etc.)
├── contexts/           # React Contexts (Auth, Theme)
├── hooks/              # Custom Hooks (useAuth, useDiagrams, useTheme)
├── pages/              # Page components (Dashboard, Editor, Login)
├── routes/             # Routing configuration and wrappers
├── services/           # External service integrations (Firebase)
├── styles/             # Global styles and variables
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── App.tsx             # Root application component
```

## Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.
