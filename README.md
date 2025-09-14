# Inventory Management Web Application

This is a simple inventory management web application with a Flask backend and a React frontend.

## Features
- Manage products, locations, and product movements
- Track per-location stock and total inventory
- Modern, responsive UI (React + Tailwind CSS)
- No authentication required

## Backend
- **Framework:** Flask
- **Database:** SQLite with raw SQL queries
- **API:** RESTful endpoints for products, locations, movements, and reports
- **Location:** `backend/app.py`
- **SQL Queries:** All database queries are documented in `backend/queries.sql`

### Running the Backend
1. Install dependencies:
   ```sh
   pip install flask flask_cors
   ```
2. Start the server:
   ```sh
   cd backend
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
   cd frontend
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

## Database Structure
The application uses SQLite with the following tables:
- `product`: Stores product information
- `location`: Stores location information
- `product_movement`: Tracks movement of products between locations

## API Endpoints

### Products
- `GET /products` - List all products
- `POST /products` - Create a new product
- `GET /products/<product_id>` - Get a specific product
- `PUT /products/<product_id>` - Update a product
- `DELETE /products/<product_id>` - Delete a product

### Locations
- `GET /locations` - List all locations
- `POST /locations` - Create a new location
- `GET /locations/<location_id>` - Get a specific location
- `PUT /locations/<location_id>` - Update a location
- `DELETE /locations/<location_id>` - Delete a location

### Movements
- `GET /movements` - List all product movements
- `POST /movements` - Create a new movement
- `GET /movements/<movement_id>` - Get a specific movement
- `PUT /movements/<movement_id>` - Update a movement
- `DELETE /movements/<movement_id>` - Delete a movement

### Reports
- `GET /report` - Get inventory report by product and location

## Notes
- No login or authentication is required
- All data is stored in a local SQLite database (`backend/instance/database.db`)
- The application uses direct SQL queries instead of an ORM for database operations

---

Feel free to modify and extend this project as needed!
