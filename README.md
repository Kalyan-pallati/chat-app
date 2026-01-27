# 💬 Real-time Chat Application

A full-stack chat application built with **FastAPI** and **React**. It features secure JWT authentication, real-time messaging, and a modern UI.

##  Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL & SQLModel (ORM)
- **Authentication:** JWT (JSON Web Tokens) & Passlib (Bcrypt)

### Frontend
- **Framework:** React 
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

---

## 🛠️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
clone the respository
cd chat-app

### 2. Backend Setup 

Navigate to the backend folder and create a virtual environment.

cd backend
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

Database Config: Make sure you have PostgreSQL installed and running. Update your environment variables with your database URL.

# Run the server
uvicorn main:app --reload

The backend runs on http://localhost:8000

### 3. Frontend Setup

Navigate to the frontend folder and run these commands.

cd frontend
npm install

# Run the development server
npm run dev