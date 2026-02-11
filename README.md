# ⚔️ Focus Arena: Awaken Your Inner Hunter
> *"I alone level up."* — **Turn your daily tasks into a Solo Leveling RPG experience.**

Focus Arena is a gamified productivity application inspired by "Solo Leveling". It turns your daily tasks into quests, awarding XP, badges, and ranks (E to S) as you complete them.

## 🚀 Key Features

### 🎮 Gamification & Progression
- **Rank System**: Level up from E-Rank to S-Rank Hunter based on XP.
- **Quest System**: Create, manage, and complete tasks (Quests) to earn rewards.
- **Badges**: Unlock 7 unique Solo Leveling themed badges (e.g., "Shadow Monarch", "Daily Quest Master").
- **Streaks**: Maintain daily activity streaks to boost your stats.
- **Leaderboards**: Compete globally or weekly with other hunters.

### 📊 Analytics & Insights
- **XP Growth Charts**: Track your progress over time.
- **Category Distribution**: See where you focus your energy.
- **Activity Heatmap**: Visual calendar of your daily productivity.

### ⚡ Real-Time & Social
- **Live Updates**: Instant notifications for level-ups, badge unlocks, and leaderboard changes via SignalR.
- **Social**: View other hunters' profiles and stats.

---

## 🛠️ Technology Stack

- **Backend**: ASP.NET Core 8 Web API
- **Database**: SQLite (Dev) / SQL Server (Prod) with Entity Framework Core
- **Real-Time**: SignalR
- **Security**: JWT Authentication, BCrypt Hashing
- **Frontend** (Planned): React + TypeScript + Tailwind CSS

---

## 🏁 Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js (for frontend)

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Chaitanyahoon/focusarenaa.git
   cd focusarenaa
   ```
2. Navigate to the backend directory (if applicable) and restore dependencies:
   ```bash
   dotnet restore
   ```
3. Update the database:
   ```bash
   dotnet ef database update
   ```
4. Run the API:
   ```bash
   dotnet run
   ```
   Server will start at `http://localhost:5134`.

---

## 🔒 Environment Variables

Create an `appsettings.json` or configure environment variables for production:

| Variable | Description |
|----------|-------------|
| `ConnectionStrings__DefaultConnection` | Database connection string |
| `JwtSettings__SecretKey` | Secret key for JWT signing (min 32 chars) |
| `EmailSettings__ApiKey` | API Key for email service (e.g., SendGrid) |

---

## 📚 API Documentation

The API documentation is available via Swagger when running locally: `http://localhost:5134/swagger`

**Core Endpoints:**
- `POST /api/auth/register` - Create a new account
- `GET /api/tasks` - List all quests
- `PUT /api/tasks/{id}/complete` - Complete a quest
- `GET /api/profile` - View hunter profile

---

## 📜 License

This project is licensed under the MIT License.

---
*Arise.* 🌑
