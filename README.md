# 📚 SmartStudy

> **"Plan smarter. Study better."**

A smart, deterministic, and adaptive study timetable generator designed for students preparing for multiple simultaneous exams under strict time constraints.

[![Automated Tests](https://img.shields.io/badge/tests-21%20passed-emerald)](https://github.com/Surekha-VK/SmartStudy)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deployed on GitHub Pages](https://img.shields.io/badge/deployment-live-success)](https://surekha-vk.github.io/SmartStudy/)

---

## 🌐 Public Deployment & Repository Links

* **Live Public Website:** [https://surekha-vk.github.io/SmartStudy/](https://surekha-vk.github.io/SmartStudy/)
* **GitHub Repository:** [https://github.com/Surekha-VK/SmartStudy](https://github.com/Surekha-VK/SmartStudy)

---

## 🎯 Problem Statement

During college exam seasons, students typically face 4 to 8 intense exams within a span of 10 to 20 days. Students routinely encounter:
1. **Decision Paralysis:** Inability to decide whether to study for the earliest exam or the most difficult one.
2. **Subject Neglect:** Over-focusing on familiar topics while underestimating complex or low-preparation subjects until it is too late.
3. **Rigid Timetables:** Static study plans that break permanently the moment a single study session is missed or delayed.
4. **Cognitive Burnout:** Marathon cramming without structured breaks, causing steep drops in recall speed and retention during exams.

---

## 💡 The SmartStudy Solution

SmartStudy replaces guesswork with a **transparent, deterministic priority engine**. Rather than relying on unpredictable black-box AI models or static spreadsheets, SmartStudy:
* Continuously computes mathematical priority scores for every active subject.
* Proportionally allocates available daily hours using the Largest Remainder (Hare-Niemeyer) method.
* Interleaves focused 50-minute study blocks with 10-minute restorative breaks.
* Automatically detects missed/unfinished study sessions and **adaptively redistributes** the workload across the remaining days without overloading any single day.
* Monitors **Study Plan Health** (🟢 On Track, 🟠 Needs Attention, 🔴 High Attention) using objective completion and urgency metrics.

---

## ✨ Features

* **Student Subject Setup:**
  * Multi-subject input with custom color tagging.
  * Exam date picker with real-time countdown badges ("TODAY", "TOMORROW", "X days left").
  * 3-tier difficulty weighting (Easy, Medium, Hard).
  * Interactive preparation slider (0% to 100%).
  * Preloaded high-yield topic banks for rapid curriculum planning.

* **Flexible Study Availability:**
  * Uniform mode (consistent daily study hours).
  * Custom day-by-day mode (e.g. heavier hours on weekends, lighter on weekdays).
  * Configurable start time (e.g., 5:00 PM), session duration (30/45/50/60m), and break duration (5/10/15m).
  * Zero negative values allowed; graceful handling of rest days.

* **Smart Priority Scheduling Engine:**
  * 100% deterministic, explainable mathematical formulation.
  * Live formula breakdown modal detailing individual points per subject.

* **Day-by-Day Timetable & Integrated Breaks:**
  * Chronological study blocks with exact clock times (e.g. `5:00 PM – 5:50 PM`).
  * 10-minute restorative rest intervals (`5:50 PM – 6:00 PM ☕ Break`).
  * Dynamic high-yield topic assignment preventing back-to-back subject monotony.
  * Day tabs, "All Days" full overview, and clean print-optimized format (`[ Print ]`).

* **Interactive Progress Tracker:**
  * Checkable study sessions with immediate completion calculation and celebration confetti.
  * "Missed?" toggle allowing simulation of missed sessions for live hackathon demos.
  * Integrated **Focus Pomodoro Timer** modal with Web Audio chime and visual circular countdown.

* **Adaptive Rescheduling (`[ Recalculate Plan ]`):**
  * Detects past uncompleted or flagged sessions.
  * Re-injects missed subject topics into future days.
  * Preserves completed historical sessions and protects daily hour ceilings.
  * Produces clear adjustment notifications.

* **Study Plan Health Diagnostics:**
  * 🟢 **ON TRACK:** ≥ 75% completion rate, 0 missed sessions, no critical overdue subjects.
  * 🟠 **NEEDS ATTENTION:** 1–2 missed sessions, completion between 45–74%, or approaching exam with <40% prep.
  * 🔴 **HIGH ATTENTION:** ≥ 3 missed sessions, completion < 45%, or missed sessions on an exam occurring within 3 days.

* **Real-Time Analytics & Dynamic Recommendations:**
  * Summary metrics: Total Subjects, Planned Hours, Completed Hours, Overall Progress %, Next Exam countdown.
  * Visual dual-layer Subject Progress bars and mastery indicators.
  * Weekly planned vs. completed study hours SVG bar chart.
  * Rule-based dynamic recommendations (urgency alerts, study pace praise, time reallocation advice).

* **Demo & Persistence Utilities:**
  * `[ Load Demo Data ]`: Instantly loads the official 4-subject exam scenario (DBMS, COA, Python, Mathematics).
  * `[ Reset Planner ]`: Safe modal-confirmed reset clearing all browser state.
  * Automatic `localStorage` persistence surviving page refreshes.

---

## 🧠 Smart Priority Algorithm & Formulas

The scheduling engine uses a multi-factor mathematical formula to assign an absolute Priority Score $P_i$ to each active subject $i$:

$$\text{Priority Score} = \text{Urgency Score } (U) + \text{Difficulty Score } (D) + \text{Preparation Gap Score } (G)$$

### 1. Urgency Score ($U \in [5, 50]$)
Calculated from whole days remaining $\Delta_{\text{days}} = \lfloor (D_{\text{exam}} - D_{\text{today}}) / 86400000 \rfloor$:
* $\Delta_{\text{days}} \le 0$ (Exam Today / Overdue): **50 pts**
* $\Delta_{\text{days}} = 1$ (Exam Tomorrow): **46 pts**
* $2 \le \Delta_{\text{days}} \le 3$: $40 - (\Delta_{\text{days}} - 1) \times 4$
* $4 \le \Delta_{\text{days}} \le 7$: $30 - (\Delta_{\text{days}} - 3) \times 2$
* $8 \le \Delta_{\text{days}} \le 14$: $21 - (\Delta_{\text{days}} - 7) \times 1$
* $\Delta_{\text{days}} > 14$: $\max(5, 14 - \lfloor(\Delta_{\text{days}} - 14) \times 0.3\rfloor)$

### 2. Difficulty Score ($D \in [10, 30]$)
* **Hard:** **30 pts**
* **Medium:** **20 pts**
* **Easy:** **10 pts**

### 3. Preparation Gap Score ($G \in [0, 40]$)
Quantifies the deficit between mastery and current confidence:
$$\text{PrepGap} = 100 - \text{CurrentPreparation}$$
$$G = \text{round}\left(\frac{\text{PrepGap}}{100} \times 40\right)$$

*Example: 30% preparation $\implies \text{Gap} = 70 \implies G = 28\text{ pts}$.*

### 4. Time Allocation (Largest Remainder Method)
For a day with $K$ total available session slots and $N$ active subjects:
$$\text{Weight}_i = \frac{P_i}{\sum_{j=1}^{N} P_j}$$
$$\text{Quota}_i = \text{Weight}_i \times K$$
Integer portions $\lfloor \text{Quota}_i \rfloor$ are allocated first, and any leftover slots are assigned to subjects in order of descending fractional remainders $\text{Quota}_i - \lfloor \text{Quota}_i \rfloor$.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **React 19** | Declarative state-driven UI and seamless DOM re-rendering |
| **Language** | **TypeScript 5.8+** | Strict end-to-end typing for deterministic scheduler entities |
| **Build Tool** | **Vite 5.4** | Sub-second HMR and optimized production bundling |
| **Styling** | **Tailwind CSS 3.4** | Utility-first responsive design system with custom print stylesheets |
| **Icons** | **Lucide React** | Crisp, accessible vector iconography |
| **Interactivity** | **Canvas Confetti & Web Audio API** | Zero-latency celebratory feedback and Pomodoro audio chimes |
| **Persistence**| **Browser LocalStorage** | Zero-configuration persistence without privacy risks or network latency |
| **Testing** | **TSX & Custom Automated Harness** | Fast native TypeScript execution of 21 test assertions |
| **Hosting** | **GitHub Pages** | Fast, free HTTPS hosting directly from GitHub repository |

---

## 📂 Project Structure

```
SmartStudy/
├── public/
│   └── favicon.svg               # Brand SVG vector icon
├── src/
│   ├── types/
│   │   └── study.ts              # Core domain models (Subject, Session, DayPlan, Health)
│   ├── scheduler/
│   │   ├── priorityEngine.ts     # Deterministic Urgency, Difficulty & PrepGap math
│   │   ├── timeAllocator.ts      # Largest Remainder slot quota & clock time formatters
│   │   ├── timetableGenerator.ts # Day-by-day timetable generator with breaks
│   │   └── adaptiveEngine.ts     # Missed session audit & adaptive catch-up engine
│   ├── services/
│   │   ├── healthService.ts      # Objective plan health scoring
│   │   ├── recommendationService.ts # Rule-based actionable advice generator
│   │   └── storageService.ts     # LocalStorage state serialization/deserialization
│   ├── data/
│   │   └── demoData.ts           # Hackathon dataset (DBMS, COA, Python, Math)
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation header, health badge, action triggers
│   │   ├── LandingPage.tsx       # Value proposition, feature highlights, and CTA
│   │   ├── Setup/
│   │   │   ├── SubjectForm.tsx   # Subject configuration & validation
│   │   │   └── AvailabilityForm.tsx # Daily/custom hour availability controls
│   │   ├── Plan/
│   │   │   ├── TimetableOverview.tsx # Day-by-day timeline view & print trigger
│   │   │   ├── SessionCard.tsx   # Study block & break card with interactive check
│   │   │   ├── PriorityExplanationModal.tsx # Live formula math breakdown table
│   │   │   └── PomodoroModal.tsx # Circular focus countdown & Web Audio chime
│   │   ├── Dashboard/
│   │   │   ├── DashboardView.tsx # Master analytics layout + Today's checklist
│   │   │   ├── SummaryCards.tsx  # Key performance indicators
│   │   │   ├── PlanHealthCard.tsx # Health status diagnostic badge & details
│   │   │   ├── SubjectProgress.tsx # Subject mastery progress bars
│   │   │   ├── UpcomingExams.tsx # Chronological exam countdown list
│   │   │   └── HoursAnalytics.tsx # Planned vs completed weekly SVG chart
│   │   ├── Recommendations/
│   │   │   └── RecommendationsView.tsx # Dynamic study tips & priority warnings
│   │   └── Common/
│   │       ├── ConfirmModal.tsx  # Safe reset confirmation modal
│   │       └── Toast.tsx         # Notification toast container
│   ├── tests/
│   │   └── runTests.ts           # Automated test suite (21 assertions)
│   ├── App.tsx                   # Master application orchestrator
│   ├── main.tsx                  # React DOM root entry
│   └── index.css                 # Tailwind layers and print styles
├── package.json                  # Scripts and dependencies
├── tailwind.config.js            # Tailwind color schemes and layout tokens
├── vite.config.ts                # Vite build config with relative base path
└── README.md                     # Comprehensive project documentation
```

---

## 🚀 Running Locally

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

### 2. Clone the Repository
```bash
git clone https://github.com/Surekha-VK/SmartStudy.git
cd SmartStudy
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Automated Test Suite
```bash
npm test
```
*Executes all 21 algorithm and integration test cases.*

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 6. Build for Production
```bash
npm run build
```
Generates an optimized static bundle in `dist/`.

---

## 🧪 Testing Verification Report

The test suite (`src/tests/runTests.ts`) executes 21 assertions covering the entire functional lifecycle:

| Test ID | Test Scenario | Verified Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Test 1** | Single Subject Allocation | Subject receives 100% of study slots | ✅ PASSED |
| **Test 2** | Multiple Subjects Allocation | All active subjects receive relative priority quotas | ✅ PASSED |
| **Test 3** | Difficulty Sensitivity | Hard subjects receive more priority points than Easy | ✅ PASSED |
| **Test 4** | Exam Urgency Sensitivity | Exam tomorrow receives higher urgency score than exam in 14 days | ✅ PASSED |
| **Test 5** | Preparation Gap Weighting | 20% prep produces higher gap points (32) than 90% prep (4) | ✅ PASSED |
| **Test 6a**| Multi-Day Plan Span | Generates day-by-day timetable through final exam date | ✅ PASSED |
| **Test 6b**| Integrated Break Cadence | Interleaves 50-minute study blocks with 10-minute rest breaks | ✅ PASSED |
| **Test 6c**| Dynamic Time Formatting | Schedules begin accurately at configured start time (5:00 PM) | ✅ PASSED |
| **Test 7** | Interactive Checklist | Marking session completed increments completed count | ✅ PASSED |
| **Test 8** | Dynamic Progress Metrics | Overall completion percentage updates in real-time | ✅ PASSED |
| **Test 9a**| Missed Session Detection | Audits uncompleted past sessions and identifies backlog | ✅ PASSED |
| **Test 9b**| Adaptive Rescheduling | Dynamically reallocates missed topics into remaining days | ✅ PASSED |
| **Test 9c**| Rescheduling Notification | Produces clear user notification without overloading single days | ✅ PASSED |
| **Test 10a**| Past Exam Detection | Past exam dates flagged with negative countdown | ✅ PASSED |
| **Test 10b**| Input Clamping (<0%) | Clamps negative preparation percentages to 0% | ✅ PASSED |
| **Test 10c**| Input Clamping (>100%) | Clamps excessive preparation percentages to 100% | ✅ PASSED |
| **Test 11**| Zero Study Hours | 0 available hours handled gracefully as a Rest Day | ✅ PASSED |
| **Test 12**| Plan Health Classification | Complete sessions produce 🟢 ON TRACK status | ✅ PASSED |
| **Test 13a**| Dynamic Recommendations | Generates tailored rule-based advice from live user data | ✅ PASSED |
| **Test 13b**| Urgency Warning Alerts | Approaching exams trigger prominent urgent recommendation badges | ✅ PASSED |
| **Test 14**| Demo Dataset Integrity | Official demo dataset contains DBMS, COA, Python, Math | ✅ PASSED |

---

## 🎤 3-Minute Hackathon Demo Flow

1. **Open Landing Page:**
   * Showcase the clean tagline: *"Plan smarter. Study better."*
   * Explain the 3-step value flow (Add Exams $\to$ Set Hours $\to$ Generate & Adapt).
2. **Click "Load Demo Data" or "View Demo":**
   * Shows 4 standard college exam subjects:
     * **DBMS:** Exam in 3 days, Hard difficulty, 30% preparation.
     * **COA:** Exam in 6 days, Hard difficulty, 50% preparation.
     * **Python:** Exam in 10 days, Medium difficulty, 70% preparation.
     * **Mathematics:** Exam in 13 days, Easy difficulty, 80% preparation.
3. **Inspect Availability:**
   * Point out the 3.5 average daily study hours with preferred 5:00 PM start time and 50m study / 10m break intervals.
4. **Click "GENERATE MY PLAN":**
   * Transitions to **My Plan** displaying the day-by-day timetable.
   * Point out that **DBMS receives the highest study allocation** because its exam is in 3 days and preparation is low (30%).
   * Point out the interspersed **☕ Break (10 min)** between study blocks.
5. **Open "How Priority Works" Modal:**
   * Show the judges the transparent mathematical breakdown ($U + D + G = \text{Total Score}$).
6. **Mark a Session Complete:**
   * Check off the first DBMS block: celebratory confetti triggers, completed hours increment immediately, progress updates.
7. **Simulate a Missed Session & Adaptive Rescheduling:**
   * Click the **"Missed?"** button on a study block.
   * Notice the amber **Recalculate Plan** button pulses.
   * Click **[ Recalculate Plan ]**: The adaptive engine dynamically re-injects the missed topic into tomorrow's plan as a **Catch-up Block**, and displays the notification: *"Your plan has been adjusted based on unfinished sessions."*
8. **Switch to Dashboard:**
   * Show the **Study Plan Health** indicator (🟢 On Track / 🟠 Needs Attention).
   * Show the **Subject-Wise Progress** mastery bars.
   * Show the **Upcoming Exams** urgency countdowns.
   * Show the **Planned vs Completed Study Hours** weekly chart.
9. **Switch to Insights:**
   * Show rule-based dynamic recommendations highlighting the top-priority subject and study advice.

---

## 👥 Hackathon Team

* **Surekha V K** — *Lead Full-Stack Developer & Algorithm Designer*
* **Sinchana Bhat** — *UI/UX Designer & Product Researcher*
* **Sinchana M C** — *Frontend Engineer & Quality Assurance*
* **Sinchana N** — *Documentation & Presentation Specialist*
