# ⚔️ Focus Arena: S-Rank Productivity Platform
> *"I alone level up."* — **Turn your daily work into a Massively Multiplayer RPG.**

**Focus Arena** is a full-stack gamified productivity application inspired by "Solo Leveling". It transforms mundane tasks into interactive Dungeon Raids, Guild Wars, and character progression, built with modern enterprise-grade architecture.

![Project Status](https://img.shields.io/badge/Status-Live-success) ![License](https://img.shields.io/badge/License-MIT-blue) ![Stack](https://img.shields.io/badge/Stack-React%20%7C%20.NET%208-purple)

## 🚀 Key Features

### 👹 Core Gameplay (Productivity)
- **Task System**: Create tasks with Difficulty (E-Rank to S-Rank), Categories, and Recurrence.
- **Progression**: Earn XP and Gold. Level up to unlock new features and stats.
- **Dungeon Raids (Gates)**: Interactive boss battles where task completion deals damage. Features live HP bars and loot drops.
- **Streaks**: Daily activity tracking with "Shadow Army" badge rewards.

### 🛡️ Social & Real-Time (SignalR)
- **Guild System**: Form guilds, recruit members, and access exclusive Guild Chat.
- **Global Chat**: Real-time public chat for all Hunters.
- **Friend System**: Send requests, view profiles, and private message (DM) other users.
- **Notifications**: Real-time badges and toasts for messages and friend requests (Global).
- **Leaderboards**: Live Global and Weekly rankings (Banned/Admin users excluded).

### 💎 Economy & Customization
- **Shop**: Spend Gold on Potions (Buffs), XP Scrolls, and Avatar Frames.
- **Inventory**: Manage your earned items and active buffs.
- **Themes**: Unlock and equip different UI themes (Blue, Red, Purple, Gold, Green).
- **Profile**: Customize your avatar, bio, and showcase earned Badges.

### 🔧 Admin Dashboard
- **User Management**: Inspect users, Ban/Unban functionality.
- **Content Management**: Create/Edit Shop Items, Global Quests, and Global Gates.
- **System Broadcasts**: Send server-wide announcements.

---

## 💻 Tech Stack

### Frontend (Client)
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Headless UI, Framer Motion (Animations)
- **State Management**: Zustand
- **Real-Time**: `@microsoft/signalr`
- **HTTP Client**: Axios

### Backend (API)
- **Framework**: ASP.NET Core 8 Web API
- **Language**: C#
- **Database**: MySQL (Entity Framework Core)
- **Real-Time**: SignalR Hubs (GameHub)
- **Auth**: JWT Bearer Authentication (Access + Refresh Tokens)
- **Docs**: Swagger / OpenAPI

### DevOps & Deployment
- **Frontend**: Vercel (SPA Routing)
- **Backend**: Render (Docker Container)
- **Database**: Aiven (Managed MySQL)

---

## 🏗️ Architecture

The project follows **Clean Architecture** principles to separate concerns:
- **FocusArena.Domain**: Core entities (`User`, `AppTask`, `Guild`, `ShopItem`) and Enums. No external dependencies.
- **FocusArena.Application**: Interfaces (`IGuildService`, `IAuthService`) and DTOs.
- **FocusArena.Infrastructure**: Implementation of services, Database Context (`ApplicationDbContext`), and Repositories.
- **FocusArena.API**: Controllers, SignalR Hubs (`GameHub`), and Program entry point.

---

## 🏁 Building & Running Locally

### Prerequisites
- .NET 8.0 SDK
- Node.js (v18+) & npm
- MySQL Server (Local or Remote)

### 1. Backend Setup
1.  Navigate to the API folder:
    ```bash
    cd backend/FocusArena.API
    ```
2.  Configure `appsettings.json` with your MySQL connection string and JWT settings.
3.  Run database migrations:
    ```bash
    dotnet ef database update
    ```
4.  Start the server:
    ```bash
    dotnet run
    ```
    *API will run on `http://localhost:5276` (or configured port).*

### 2. Frontend Setup
1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure `.env`:
    ```
    VITE_API_URL=http://localhost:5276/api
    VITE_HUB_URL=http://localhost:5276/gamehub
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    *App will run on `http://localhost:5173`.*

---

## 📜 License
This project is licensed under the MIT License.

---
*Arise.* 🌑
