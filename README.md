# DevInterview Pro – Full-Stack Developer Interview Preparation Platform

> Production-ready, full-stack interview preparation platform designed for software engineers preparing for mid-level, senior, and lead engineering interviews (₹15 LPA – ₹40 LPA) at high-growth product companies, service leaders, and tech startups.

---

## 🌟 Key Features

### 1. Comprehensive Interview Question Bank (30+ Technologies)
- **Deep domain coverage**: Java (JVM, Collections, Concurrency, Virtual Threads), Spring Boot (Auto-config, Transactions, JPA, AOP), React 18 (Fiber, Concurrent Mode, Hooks), Next.js (App Router, RSC, Caching), Node.js & NestJS (Event Loop, libuv, Lifecycle), Databases (MySQL B+ Trees, PostgreSQL, Redis, MongoDB), Kafka, Docker, Kubernetes, AWS, and Distributed Systems (2PC vs Saga, Outbox Pattern).
- **Enterprise response anatomy**:
  - 60-Second Short Interview-Ready Answer
  - In-Depth Architectural & Internal Mechanics Explanation
  - Real-World Production Scenario
  - Formatted Practical Implementation & Code Snippet
  - Common Pitfalls & Mistakes to Avoid
  - Interviewer Follow-Up Questions & Negotiation Tips

### 2. Multi-Language Sandboxed Coding Practice
- **Monaco Code Editor**: Professional syntax highlighting, bracket pairing, and code formatting.
- **Languages supported**: Java, JavaScript, TypeScript, Python 3, C++, C.
- **Secure sandbox execution**: Sandboxed subprocess runners with timeouts (5s), memory caps, input sanitation, and zero arbitrary execution inside the main server thread.
- **Dual test runners**: Sample test cases for instant debugging + hidden test cases for final submission.
- **Visual outputs**: Test case pass/fail indicators, memory usage, runtime latency (ms), and compiler/runtime stack traces.

### 3. DSA Roadmap & Preparation Tracker
- **Curated 6-stage roadmap**:
  - Stage 1: Algorithmic Foundations & Two Pointers
  - Stage 2: Linear Data Structures & Hash Maps
  - Stage 3: Binary Search, Sorting & Recursion
  - Stage 4: Hierarchical Trees & Graph Traversals
  - Stage 5: Dynamic Programming & Heaps
  - Stage 6: Enterprise Real-World & SQL Challenges
- Problem difficulty breakdown (Easy / Medium / Hard) and interactive progress tracking.

### 4. Interactive System Design Studio (HLD & LLD)
- Detailed blueprints for high-scale systems: **URL Shortener (TinyURL)**, **Real-Time Chat (WhatsApp / Slack)**, Netflix, Uber, Swiggy, and Payment Gateways.
- Back-of-the-envelope capacity estimations (QPS, DAU, 5-year storage, bandwidth).
- Tiered architecture breakdowns with Mermaid blueprints and component deep-dives.
- Database schemas with partition keys and indexing rules.
- REST / RPC API designs with request/response contracts.
- Trade-offs, failure scenarios, and self-healing strategies.

### 5. Interactive Mock Interview Module
- Simulated technical rounds for: *Java Developer*, *React Developer*, *Node.js Developer*, *Full Stack*, *Spring Boot*, *System Design*, *Database Engineer*, and *DevOps*.
- Timed live session with real-time countdown clock and question navigation palette.
- **AI-Powered Evaluation**: Analyzes answer depth, keyword density, production reasoning, and structural clarity. Generates specific strengths, weaknesses, and model answer comparisons.

### 6. Assessment & Quiz Engine
- Varied question formats: Multiple Choice, Multiple Select, True/False, Output Prediction, Find the Bug, and SQL Query Output.
- Configurable negative marking and time limits.
- Global leaderboard and detailed question-by-question explanations.

### 7. Daily Learning & Bookmarking
- Deterministic Question of the Day & Coding Challenge of the Day.
- Daily active streaks with motivational quotes.
- Bookmarks and personal note-taking area.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Redux Toolkit, React Router v6, Monaco Editor (`@monaco-editor/react`), Recharts, Lucide Icons, Sonner |
| **Backend** | Node.js 22, NestJS 10, TypeScript, TypeORM, Passport.js, JWT, bcryptjs, class-validator, Swagger OpenAPI |
| **Database & Cache** | MySQL 8.0, Redis 7 (with zero-config SQLite development fallback) |
| **DevOps & Infra** | Docker, Docker Compose, Kubernetes manifests (`k8s/`), Nginx, GitHub Actions CI/CD |

---

## 🚀 Quick Start Guide (Local Development)

### Prerequisites
- Node.js 20+ (Node 22 / 24 tested)
- npm 10+

### 1. Start Backend
```bash
cd backend

# Install dependencies
npm install

# Start NestJS development server
npm run start:dev
```
The backend starts on `http://localhost:4000`:
- **API Base URL**: `http://localhost:4000/api`
- **Swagger Documentation**: `http://localhost:4000/api/docs`
- *Note:* The database seeds automatically on initial startup.

### 2. Start Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The frontend is available at `http://localhost:5173`.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Target CTC |
|---|---|---|---|
| **Demo Developer** | `developer@devinterview.pro` | `Dev@12345` | ₹25–30 LPA |
| **Administrator** | `admin@devinterview.pro` | `Admin@123` | ₹35–40 LPA |

---

## 🐳 Docker Compose Deployment

Run the complete multi-tier infrastructure (MySQL, Redis, NestJS Backend, and Nginx React Frontend):

```bash
docker-compose up --build -d
```

- **Frontend App**: `http://localhost:80`
- **Backend API**: `http://localhost:4000`
- **MySQL**: `localhost:3306` (database: `devinterview_db`)
- **Redis**: `localhost:6379`

---

## ☸️ Kubernetes Deployment

Deploy to any Kubernetes cluster (Minikube, EKS, GKE, AKS):

```bash
# 1. Apply namespace and configurations
kubectl apply -f k8s/configmap.yaml

# 2. Deploy database and cache
kubectl apply -f k8s/mysql-statefulset.yaml

# 3. Deploy application services
kubectl apply -f k8s/backend-deployment.yaml
```

Includes:
- Horizontal Pod Autoscaler (HPA) targeting 75% CPU utilization.
- Zero-downtime Rolling Updates (`maxSurge: 1`, `maxUnavailable: 0`).
- Liveness and Readiness probes on health endpoints.
- Ingress with TLS termination support.

---

## 📜 License
DevInterview Pro is distributed under the MIT License.
