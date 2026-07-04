# System Architecture, Folder Structure, & Dependencies

This document provides a comprehensive view of the architectural layout, directory organization, and dependency requirements for the **AI Software Engineering Learning Platform**.

---

## 1. High-Level Architecture Diagram

The diagram below illustrates the flow of requests from the user interaction in the browser down through the application layers, data storage, and external AI orchestrations.

```mermaid
graph TD
    %% Frontend Client
    subgraph Client [Frontend Tier]
        UI[Vite + React App]
        Playground[Interactive Code Sandbox]
        UI -->|Axios / Fetch REST API| Gateway
    end

    %% Backend Server
    subgraph Server [Backend Service Tier]
        Gateway[API Gateway / Routing]

        %% Core Backend Modules
        subgraph BackendModules [Domain Services]
            AuthSvc[Auth Controller & Service]
            LearnSvc[Learning Engine Service]
            ProjSvc[Industry Projects Service]
            AISvc[AI Orchestrator Service]
        end

        Gateway --> AuthSvc
        Gateway --> LearnSvc
        Gateway --> ProjSvc
        Gateway --> AISvc
    end

    %% Data Layer
    subgraph Data [Storage Tier]
        AuthSvc --> Postgres[(PostgreSQL: User Data & Logs)]
        LearnSvc --> Postgres
        ProjSvc --> Postgres
        LearnSvc --> Redis[(Redis: Session Cache & Rate Limits)]
        AISvc --> Redis
        AISvc --> VectorDB[(Vector DB: RAG Context & Agent Memory)]
    end

    %% AI Integrations
    subgraph AIProviders [External Foundation Models]
        AISvc --> AIOrch[AI Provider Abstraction]
        AIOrch --> Gemini[Gemini 1.5 Flash/Pro]
        AIOrch --> OpenAI[GPT-4o]
    end
```

---

## 2. Folder Structure Documentation

### Monorepo Workspaces Layout

Below is the directory breakdown of the enterprise monorepo, outlining the roles of the apps and shared packages.

```
webbbbb/
├── apps/
│   ├── backend/                  # REST API Server Application
│   │   ├── prisma/               # Prisma Database Schemas & Migrations
│   │   └── src/
│   │       ├── config/           # Server configurations & env setups
│   │       ├── controllers/      # Route request/response entrypoints
│   │       ├── middleware/       # Express security & validation filters
│   │       ├── modules/          # Business logic groups (e.g., Learning, Projects)
│   │       ├── repositories/     # Data Access Objects wrapping Prisma clients
│   │       ├── routes/           # Endpoint registrations & controller mapping
│   │       ├── services/         # Orchestrates operations, DB query maps
│   │       ├── types/            # Local server typing specifications
│   │       ├── utils/            # Shared utilities (logging, hashing)
│   │       ├── validators/       # Input schemas validation (Zod)
│   │       └── index.ts          # Express application entrypoint
│   │
│   └── frontend/                 # Client SPA Application
│       ├── e2e/                  # Playwright browser integration tests
│       └── src/
│           ├── assets/           # Logos, SVGs, static image resources
│           ├── components/       # Layout-agnostic visual component blocks
│           ├── contexts/         # React system states (Auth, Progress tracking)
│           ├── hooks/            # Custom React hooks (usePlayground, useAI)
│           ├── layouts/          # Responsive page containers (Sidebar, Layout shell)
│           ├── pages/            # Navigable page routing layouts
│           ├── services/         # Axios wrapper connections for backend endpoints
│           ├── styles/           # Global design-token systems (Vanilla CSS)
│           ├── types/            # Component property interface specs
│           ├── utils/            # Client side formatters and parsers
│           └── main.tsx          # Client bundle mount script
│
├── packages/                     # Shareable internal library packages
│   ├── config/                   # Global configuration variables & theme options
│   ├── shared/                   # Shared validation rules, string utils, and tools
│   ├── types/                    # Common interface types shared between client & server
│   └── ui/                       # Decoupled component library (Design tokens UI)
│
├── docker/                       # Dockerfiles and docker-compose definitions
├── docs/                         # Specifications & Analysis documentation reports
└── scripts/                      # Operational management shell/batch scripts
```

---

## 3. Monorepo Dependency Diagram

To prevent circular dependencies and compile conflicts, the platform enforces a **strict one-way dependency resolution**. Shareable packages are resolved locally by `pnpm`, and they cannot import upward (e.g., packages cannot import from apps).

```mermaid
graph TD
    %% Applications
    AppFE[apps/frontend]
    AppBE[apps/backend]

    %% Shared Packages
    PkgUI[packages/ui]
    PkgShared[packages/shared]
    PkgTypes[packages/types]
    PkgConfig[packages/config]

    %% Applications Dependencies
    AppFE --> PkgUI
    AppFE --> PkgShared
    AppFE --> PkgTypes
    AppFE --> PkgConfig

    AppBE --> PkgShared
    AppBE --> PkgTypes
    AppBE --> PkgConfig

    %% UI Library Dependencies
    PkgUI --> PkgShared
    PkgUI --> PkgTypes
    PkgUI --> PkgConfig

    %% Shared Library Dependencies
    PkgShared --> PkgTypes
    PkgShared --> PkgConfig

    %% Leaf nodes
    PkgTypes --> PkgConfig
```

### Dependency Rules:

1.  **Leaf Nodes**: `packages/types` and `packages/config` depend on nothing else, acting as clean primitives.
2.  **No Downward Imports**: Packages cannot import files or utilities from `apps/frontend` or `apps/backend`.
3.  **No Circular References**: Packages cannot import horizontally in a circular manner (e.g., `packages/types` is prohibited from importing `packages/shared`).
