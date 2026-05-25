# FlowSync - Team Pulse Manager

FlowSync is a premium, real-time status tracker and team synchronization application. It automates sentiment mapping, blockers identification, and daily updates summaries using state-of-the-art AI. Designed with an ultra-modern dark navy glassmorphic layout, it features interactive dashboards for both team members and managers.

![FlowSync Dashboard Mockup](https://raw.githubusercontent.com/username/project/main/screenshot-placeholder.png)
*(Replace this with your project screenshot)*

---

## 🚀 Key Features

### 👥 Team Member Portal
*   **Structured 60-Second Daily Updates**: Simple status logging input field with quick-select prompt chips.
*   **Web Speech API Integration**: Speak to input your daily status updates hands-free using real-time browser transcription.
*   **Interactive AI Insights**: Immediate post-submission feedback powered by Groq (sentiment scoring, brief summary, blocker warnings, and motivational quotes).
*   **Update History**: A detailed timeline log of previous status updates with 📋 calendar dates, sentiment badges, and archived summaries.
*   **My Trend Widget**: Active 3-day sentiment mood indicator displaying visual trends of team members' morale over the current week.

### 📊 Manager Dashboard Portal
*   **4-Point Pulse Metrics Row**: Real-time counters showing Total Members, Updates Submitted Today, Pending Updates (with click action to notify), and Team Health Morale.
*   **AI Daily Team Summary**: Generates team overview summaries, highlight accomplishments, blocker rollups, and manager recommendations at the click of a button.
*   **Team Pulse Feed**: Chronological lists of team updates with expandable log previews, relative time stamps, and sentiment pills.
*   **Sparkline Activity & 7-Day History**: Mini Recharts sparklines showing submission frequency alongside 7 colored sentiment dots.
*   **Coaching Suggestions Modal**: Interactive member details popup providing AI trend forecasts, pattern recognition, and coaching tips.
*   **🏆 Team Consistency Leaderboard**: Ranks the top 3 members by weekly updates count, prompting competitive team consistency (using Gold, Silver, and Bronze badges).
*   **Pending Updates Alert Modal**: Interactive drawer showing team members who haven't updated today, with mock push notifications to send reminders.
*   **Today's Blocker Notification Dropdown**: Navigation bar bell icon 🔔 displaying a red notification dot if any team member flags a blocker, expanding to show warning summaries on click.

---

## 🛠️ Tech Stack
*   **Frontend**: React (v19), Vite, TailwindCSS (v4), Framer Motion, Recharts, Lucide Icons, Web Speech API
*   **Backend**: Node.js, Express.js, Mongoose, MongoDB
*   **AI Integration**: Groq SDK (`llama-3.1-8b-instant`)

---

## ⚙️ Environment Variables

### Backend (`/server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/flowsync
JWT_SECRET=your_jwt_secret_key_here
GROQ_API_KEY=your_groq_api_key_here
```

---

## 🏃 How to Run Locally

### Prerequisites
*   Node.js (v18+)
*   MongoDB installed and running locally on port `27017`

### Step 1: Clone the Project
```bash
git clone <repository-url>
cd FlowSync
```

### Step 2: Configure & Start Backend Server
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the `.env` variables (as described above).
4. Run in development mode:
   ```bash
   npm run dev
   ```
   *The server will start running on [http://localhost:5000](http://localhost:5000).*

### Step 3: Configure & Start Frontend Client
1. Open a new terminal in the root folder and navigate to client:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev compiler:
   ```bash
   npm run dev
   ```
   *The client will start running on [http://localhost:5173](http://localhost:5173).*

---

## 👨‍💻 Author
Built with ❤️ by **Piyush Sharad Patil**
