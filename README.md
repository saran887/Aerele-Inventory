# Inventory Management Web Application

This is a simple inventory management web application with a Flask backend and a React frontend.

## Features
- Manage products, locations, and product movements
- Track per-location stock and total inventory
- Modern, responsive UI (React + Tailwind CSS)
- No authentication required

## Backend
- **Framework:** Flask
- **Database:** SQLite (via SQLAlchemy)
- **API:** RESTful endpoints for products, locations, movements, and reports
- **Location:** `backend/app.py`

### Running the Backend
1. Install dependencies:
   ```sh
   pip install flask flask_sqlalchemy flask_cors
   ```
2. Start the server:
   ```sh
   python app.py
   ```
3. The API will be available at `http://127.0.0.1:5000`

## Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Location:** `frontend/`

### Running the Frontend
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. The app will be available at `http://localhost:5173`

## Usage
- Add, edit, and delete products and locations
- Move products between locations
- View per-location and total stock in the report

## Notes
- No login or authentication is required
- All data is stored in a local SQLite database (`backend/database.db`)

---

Feel free to modify and extend this project as needed!
