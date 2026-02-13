# ⚔️ Focus Arena: S-Rank Productivity Platform
> *"I alone level up."* — **Turn your daily work into a Massively Multiplayer RPG.**

**Focus Arena** is a full-stack gamified productivity application inspired by "Solo Leveling". It transforms mundane tasks into interactive Dungeon Raids, Guild Wars, and character progression, built with modern enterprise-grade architecture.

![Project Status](https://img.shields.io/badge/Status-Completed-success) ![License](https://img.shields.io/badge/License-MIT-blue) ![Stack](https://img.shields.io/badge/Stack-React%20%7C%20.NET%208-purple)

## 🚀 Key Features (Implemented)

### 👹 Dungeon Raids (Interactive Projects)
- **Boss Battles**: Each project is a "Gate". Tasks are monsters. Completing them damages the Gate Boss (E-Rank to S-Rank).
- **Raid Mechanics**: Live HP bars, enrage timers, and massive loot drops (XP/Gold) upon clearing gates.
- **Visuals**: Dynamic boss sprites and attack animations.

### 🛡️ Guilds & Real-Time Social
- **Guild System**: Form guilds, recruit members, and chat in real-time using **SignalR**.
- **Leaderboards**: Compete globally or weekly. Updates instantly without page reloads.
- **Shop & Economy**: Earn Gold from tasks. Buy potions, scrolls, and avatar frames in the System Shop.

### 🎮 Gamification Engine
- **RPG Progression**: Level up your Hunter. Increase stats (Strength, Intelligence, Agility).
- **Streak System**: Maintain daily activity streaks to unlock "Shadow Army" badges.
- **Recurring Quests**: Automated daily/weekly tasks that reset at midnight.

### 💻 Modern Tech Stack
- **Frontend**: React 18 (Vite), TypeScript, Tailwind CSS, Framer Motion, Headless UI.
- **Backend**: ASP.NET Core 8 Web API, Entity Framework Core, Clean Architecture.
- **Real-Time**: SignalR Hubs for Chat & Leaderboards.
- **Database**: PostgreSQL / SQL Server.
- **Auth**: JWT Authentication with Refresh Tokens & Email Password Reset.

---

## 📸 Screenshots
*(Add your screenshots here)*

---

## 🏁 Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js & npm
- PostgreSQL or SQL Server

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Chaitanyahoon/focusarenaa.git
   ```

2. **Backend Setup**
   ```bash
   cd backend/FocusArena.API
   dotnet restore
   dotnet ef database update
   dotnet run
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🏗️ Architecture
The project follows **Clean Architecture** principles:
- **Domain**: Core entities (User, Task, Guild, ShopItem).
- **Application**: Business logic (CQRS pattern, Services).
- **Infrastructure**: Database access, SignalR implementation, Email services.
- **API**: Comparison controllers and endpoints.

---

## 📜 License
This project is licensed under the MIT License.

---
*Arise.* 🌑
