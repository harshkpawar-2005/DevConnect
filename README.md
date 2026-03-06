
# DevConnect – Developer Collaboration Platform

DevConnect is a platform where developers can **discover projects, recruit teammates, and collaborate through structured workspaces**.

It helps students and developers **build real-world projects together** by solving one of the most common problems in developer communities:

> Finding the right teammates to build meaningful projects.

---

# Problem DevConnect Solves

Many developers have project ideas but struggle with:

- Finding teammates with the right skills
- Organizing collaboration
- Managing applications from interested contributors

Existing platforms focus on **job hiring**, not **project collaboration**.

DevConnect introduces a structured system for **project-based team formation**.

---

# Key Features

## Project Marketplace
Developers can post projects describing their idea and required roles.
Other users can browse the marketplace and discover projects to join.

## Role-Based Applications
Applicants apply for **specific roles** within a project.

Example roles:
- Frontend Developer
- Backend Developer
- AI/ML Engineer
- Product Designer

Each application contains:
- selected role
- optional message

## Applicant Management Dashboard
Project owners can review applications through a **role-segregated dashboard**.

Applications are organized by:
- role
- application status
- applicant profile

## Developer Profiles
Each user has a **public developer profile** that includes:
- headline
- skills
- GitHub profile
- LinkedIn profile
- project participation

## Workspace System
Once an applicant is accepted, they become part of the **project workspace**.

The workspace provides:
- visibility of all team members
- role-based team grouping
- easy navigation to member profiles

## Application Tracking
Users can track their application status in **My Applications**.

Statuses include:
- Pending
- Accepted
- Rejected

Accepted applicants gain direct access to the **project workspace**.

## Project Watchlist
Users can save projects they find interesting and revisit them later.

---

# Tech Stack

## Frontend
- React.js
- Tailwind CSS
- ShadCN UI
- React Router
- Axios

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## Tools
- Postman (API testing)
- Git & GitHub
- Cloudinary (image storage)

---

# System Architecture

React Frontend  
↓ REST API  
Node.js + Express Backend  
↓  
MongoDB Database  

The backend handles:
- authentication
- project management
- application workflow
- workspace membership
- watchlist system

---

# Core Data Models

## User
Stores developer profile information.

## Project
Contains project details including:
- description
- tech stack
- required roles
- recruitment status

## JoinRequest
Handles the **application workflow** between applicants and project owners.

## Membership
Tracks accepted members and their assigned roles within projects.

---

# Authentication & Security

DevConnect implements **JWT-based authentication** with secure API protection.

Security features include:
- access token authentication
- refresh token flow
- protected routes via middleware
- ownership-based authorization for project actions

---

# Application Workflow

User discovers a project  
↓  
User applies for a specific role  
↓  
Project owner reviews application  
↓  
Accept / Reject decision  
↓  
Accepted applicant becomes a project member  
↓  
Member gains access to project workspace  

---

# Current Features

- Project marketplace
- Role-based applications
- Applicant management dashboard
- Workspace system
- Developer profiles
- Application tracking
- Project watchlist
- Secure JWT authentication

---

# Upcoming Enhancements

The following features are planned:

- Real-time team chat
- Project discussion threads
- Team activity feed
- Automatic recruitment closing when roles are filled
- Workspace collaboration tools

---

# Author

**Harshal Pawar**  
Full Stack Developer  

GitHub: https://github.com/harshkpawar-2005  
LinkedIn: https://www.linkedin.com/in/harshal-pawar-b96652290/
