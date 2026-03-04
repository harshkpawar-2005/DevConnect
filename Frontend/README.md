# 🚀 DevConnect

**DevConnect** is a collaborative platform where developers can **post projects**, **find teammates**, and **apply to real-world tech projects**.  
It is designed for **students, freelancers, and builders** to connect based on **skills, interests, and availability**.

---

## 🌐 Platform Vision
A single place to:

- Post your project ideas
- Discover collaboration opportunities
- Apply to real-world projects
- Manage applications efficiently
- Build a public developer profile

DevConnect focuses on **community-driven development** with a clean, scalable architecture.

---

## ✨ Key Features

### 👤 Authentication
- Secure authentication using **Clerk**
- Sign up / Sign in with modal-based flow
- User profiles automatically created on first login

---

### 📌 Projects
- Create and manage projects
- Define roles, responsibilities, and requirements
- Set application deadlines
- Automatic **Open / Closed** project status handling
- Safe project deletion that removes:
  - Applications
  - Wishlist references
  - Project data itself

---

### 📨 Applications
- Apply only once per project (duplicate prevention)
- Real-time application tracking
- Application statuses:
  - Pending
  - Interviewing
  - Accepted
  - Rejected
- Disclaimer displayed when a user is accepted

---

### ❤️ Wishlist
- Save and unsave projects
- Wishlist synced across sessions

---

### 👤 Developer Profiles
- Skills management
- External links (GitHub, LinkedIn, Portfolio, etc.)
- Platform detection with icons/emojis
- Public profile view for sharing

---

### ⚡ UI & UX
- Fully responsive layout
- Consistent card-based UI
- Fixed-size project cards
- Gradient-based theme with clean typography
- Smooth transitions and animations

---

## 🛠 Tech Stack

### Frontend
- **React (Vite)**
- **Tailwind CSS**
- **ShadCN UI**
- **Lucide Icons**

### Backend & Services
- **Firebase Firestore** (Database)
- **Firebase Security Rules**
- **Clerk Authentication**

### Utilities & Logic
- Real-time Firestore listeners
- Batch operations
- Automatic project auto-close logic

---

## 📂 Project Structure

```
src/
 ├── components/
 │   ├── core/
 │   ├── layout/
 │   ├── project/
 │   └── ui/
 ├── firebase/
 │   ├── applicationApi.js
 │   ├── projectApi.js
 │   └── userApi.js
 ├── pages/
 │   ├── Dashboard.jsx
 │   ├── ProjectDetails.jsx
 │   ├── MyProjects.jsx
 │   ├── MyApplications.jsx
 │   └── Profile.jsx
 ├── utils/
 │   └── autoCloseProjects.js
```

---

## 🔐 Security
- Firestore security rules enforced
- Owner-only permissions for:
  - Project deletion
  - Application status updates
- Client-side and server-side validation

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/devconnect.git
cd devconnect
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Setup

Create a `.env` file in the root directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_key_here
VITE_FIREBASE_API_KEY=your_key_here
```

### 4️⃣ Run Locally

```bash
npm run dev
```

---

## 📌 Future Enhancements
- Dedicated backend using Node.js & PostgreSQL
- Notification system
- Chat between project owners and applicants
- Profile analytics
- Role-based access control (RBAC)

---

## 🤝 Contribution
This project is currently **solo-built** for learning and portfolio purposes.  
Open to collaboration in future iterations.

---

## 📬 Contact
For feedback or collaboration ideas:

📧 **contact@devconnect.com**

---

## ⭐ Why DevConnect?
DevConnect demonstrates:

- Real-world full-stack architecture
- Firebase + authentication integration
- Clean and scalable UI/UX
- Production-ready data modeling
- Thoughtful feature design

---

👨‍💻 **Author**  
Harshal Pawar

---

If you find this project useful, consider giving it a ⭐ on GitHub!