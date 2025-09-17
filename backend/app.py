import os
import sqlite3
import time
import random
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
DB_PATH = os.path.join(app.instance_path, 'database.db')
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Database helper functions
def get_db_connection():
    """Create a connection to the SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name: row['column_name']
    return conn

def dict_factory(cursor, row):
    """Convert database row objects to a dictionary"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def execute_query(query, params=(), one=False, commit=False):
    """Execute a query and return results"""
    conn = get_db_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    try:
        cursor.execute(query, params)
        
        if commit:
            conn.commit()
            last_id = cursor.lastrowid
            result = {"lastrowid": last_id} if last_id else {}
        else:
            if one:
                result = cursor.fetchone()
            else:
                result = cursor.fetchall()
    except Exception as e:
        conn.rollback() if commit else None
        raise e
    finally:
        cursor.close()
        conn.close()
        
    return result

def init_db():
    """Initialize the database with schema"""
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS product (
        product_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        total_quantity INTEGER,
        location_id TEXT,
        FOREIGN KEY (location_id) REFERENCES location (location_id)
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS location (
        location_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS product_movement (
        movement_id TEXT PRIMARY KEY,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        from_location TEXT,
        to_location TEXT,
        product_id TEXT NOT NULL,
        qty INTEGER NOT NULL,
        FOREIGN KEY (from_location) REFERENCES location (location_id),
        FOREIGN KEY (to_location) REFERENCES location (location_id),
        FOREIGN KEY (product_id) REFERENCES product (product_id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Product endpoints
@app.route('/products', methods=['GET'])
def get_products():
    query = '''
    SELECT product_id, name, description, total_quantity, location_id
    FROM product
    '''
    products = execute_query(query)
    return jsonify(products)

@app.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    if not data or not data.get('product_id') or not data.get('name'):
        return jsonify({'error': 'product_id and name required'}), 400
    
    # Check if product exists
    check_query = 'SELECT product_id FROM product WHERE product_id = ?'
    existing = execute_query(check_query, (data['product_id'],), one=True)
    if existing:
        return jsonify({'error': 'Product ID already exists'}), 400
    
    # Check if location exists if provided
    location_id = data.get('location_id')
    if location_id:
        location_query = 'SELECT location_id FROM location WHERE location_id = ?'
        location = execute_query(location_query, (location_id,), one=True)
        if not location:
            return jsonify({'error': 'Location does not exist'}), 400
    
    # Insert new product
    total_qty = data.get('total_quantity')
    insert_query = '''
    INSERT INTO product (product_id, name, description, total_quantity, location_id)
    VALUES (?, ?, ?, ?, ?)
    '''
    try:
        execute_query(
            insert_query, 
            (data['product_id'], data['name'], data.get('description'), total_qty, location_id), 
            commit=True
        )
        
        # Automatically create inbound movement if location and quantity are set
        if location_id and total_qty > 0:
            movement_id = f'INIT-{data["product_id"]}'
            timestamp = datetime.utcnow().isoformat()
            movement_query = '''
            INSERT INTO product_movement (movement_id, timestamp, from_location, to_location, product_id, qty)
            VALUES (?, ?, ?, ?, ?, ?)
            '''
            execute_query(
                movement_query,
                (movement_id, timestamp, None, location_id, data['product_id'], total_qty),
                commit=True
            )
            
        return jsonify({'message': 'Product created', 'product_id': data['product_id']}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/products/<product_id>', methods=['GET'])
def get_product(product_id):
    query = '''
    SELECT product_id, name, description, total_quantity, location_id
    FROM product
    WHERE product_id = ?
    '''
    product = execute_query(query, (product_id,), one=True)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product)

@app.route('/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    # Check if product exists
    check_query = 'SELECT * FROM product WHERE product_id = ?'
    product = execute_query(check_query, (product_id,), one=True)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json()

    # Check if location exists if provided
    if 'location_id' in data:
        if data['location_id']:
            location_query = 'SELECT location_id FROM location WHERE location_id = ?'
            location = execute_query(location_query, (data['location_id'],), one=True)
            if not location:
                return jsonify({'error': 'Location does not exist'}), 400

    # Calculate remaining stock if location changes
    location_changed = False
    old_location = product.get('location_id')
    new_location = data.get('location_id', old_location)
    total_quantity = data.get('total_quantity', product.get('total_quantity', 0))
    if old_location and new_location and old_location != new_location:
        location_changed = True

    # Build update query dynamically based on provided fields
    update_fields = []
    params = []

    if 'name' in data:
        update_fields.append('name = ?')
        params.append(data['name'])

    if 'description' in data:
        update_fields.append('description = ?')
        params.append(data['description'])

    if 'total_quantity' in data:
        update_fields.append('total_quantity = ?')
        params.append(data['total_quantity'])

    if 'location_id' in data:
        update_fields.append('location_id = ?')
        params.append(data['location_id'])

    if not update_fields:
        return jsonify({'message': 'No fields to update'}), 200

    update_query = f'''
    UPDATE product
    SET {', '.join(update_fields)}
    WHERE product_id = ?
    '''
    params.append(product_id)

    try:
        execute_query(update_query, tuple(params), commit=True)

        # If location changed, add a new inbound movement for the remaining stock to the new location
        if location_changed:
            # Calculate total inbound to old location
            in_query = '''
            SELECT COALESCE(SUM(qty), 0) as total_in
            FROM product_movement
            WHERE product_id = ? AND to_location = ?
            '''
            in_result = execute_query(in_query, (product_id, old_location), one=True)
            in_qty = in_result['total_in'] if in_result else 0

            # Calculate total outbound from old location
            out_query = '''
            SELECT COALESCE(SUM(qty), 0) as total_out
            FROM product_movement
            WHERE product_id = ? AND from_location = ?
            '''
            out_result = execute_query(out_query, (product_id, old_location), one=True)
            out_qty = out_result['total_out'] if out_result else 0

            remaining = in_qty - out_qty
            if remaining > 0:
                # Add inbound movement to new location for remaining stock
                movement_id = f'RELOC-{product_id}-{int(time.time())}'
                timestamp = datetime.utcnow().isoformat()
                movement_query = '''
                INSERT INTO product_movement (movement_id, timestamp, from_location, to_location, product_id, qty)
                VALUES (?, ?, ?, ?, ?, ?)
                '''
                execute_query(
                    movement_query,
                    (movement_id, timestamp, old_location, new_location, product_id, remaining),
                    commit=True
                )


        # If total_quantity is changed, update the INIT movement as well (qty and timestamp)
        if 'total_quantity' in data:
            from datetime import datetime
            init_movement_id = f'INIT-{product_id}'
            update_init_query = '''
            UPDATE product_movement
            SET qty = ?, timestamp = ?
            WHERE movement_id = ?
            '''
            execute_query(update_init_query, (data['total_quantity'], datetime.utcnow().isoformat(), init_movement_id), commit=True)

        return jsonify({'message': 'Product updated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    # Check if product exists
    check_query = 'SELECT product_id FROM product WHERE product_id = ?'
    product = execute_query(check_query, (product_id,), one=True)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    delete_query = 'DELETE FROM product WHERE product_id = ?'
    try:
        execute_query(delete_query, (product_id,), commit=True)
        return jsonify({'message': 'Product deleted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
# Location endpoints
@app.route('/locations', methods=['GET'])
def get_locations():
    query = '''
    SELECT location_id, name, address
    FROM location
    '''
    locations = execute_query(query)
    return jsonify(locations)

@app.route('/locations', methods=['POST'])
def add_location():
    data = request.get_json()
    if not data or not data.get('location_id') or not data.get('name'):
        return jsonify({'error': 'location_id and name required'}), 400
    
    # Check if location exists
    check_query = 'SELECT location_id FROM location WHERE location_id = ?'
    existing = execute_query(check_query, (data['location_id'],), one=True)
    if existing:
        return jsonify({'error': 'Location ID already exists'}), 400
    
    # Insert new location
    insert_query = '''
    INSERT INTO location (location_id, name, address)
    VALUES (?, ?, ?)
    '''
    try:
        execute_query(
            insert_query, 
            (data['location_id'], data['name'], data.get('address')), 
            commit=True
        )
        return jsonify({'message': 'Location created', 'location_id': data['location_id']}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/locations/<location_id>', methods=['GET'])
def get_location(location_id):
    query = '''
    SELECT location_id, name, address
    FROM location
    WHERE location_id = ?
    '''
    location = execute_query(query, (location_id,), one=True)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    return jsonify(location)

@app.route('/locations/<location_id>', methods=['PUT'])
def update_location(location_id):
    # Check if location exists
    check_query = 'SELECT * FROM location WHERE location_id = ?'
    location = execute_query(check_query, (location_id,), one=True)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    
    data = request.get_json()
    
    # Build update query dynamically based on provided fields
    update_fields = []
    params = []
    
    if 'name' in data:
        update_fields.append('name = ?')
        params.append(data['name'])
    
    if 'address' in data:
        update_fields.append('address = ?')
        params.append(data['address'])
    
    if not update_fields:
        return jsonify({'message': 'No fields to update'}), 200
    
    update_query = f'''
    UPDATE location
    SET {', '.join(update_fields)}
    WHERE location_id = ?
    '''
    params.append(location_id)
    
    try:
        execute_query(update_query, tuple(params), commit=True)
        return jsonify({'message': 'Location updated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/locations/<location_id>', methods=['DELETE'])
def delete_location(location_id):
    # Check if location exists
    check_query = 'SELECT location_id FROM location WHERE location_id = ?'
    location = execute_query(check_query, (location_id,), one=True)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    
    delete_query = 'DELETE FROM location WHERE location_id = ?'
    try:
        execute_query(delete_query, (location_id,), commit=True)
        return jsonify({'message': 'Location deleted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
# Movement endpoints
@app.route('/movements', methods=['GET'])
def get_movements():
    query = '''
    SELECT movement_id, timestamp, from_location, to_location, product_id, qty
    FROM product_movement
    '''
    movements = execute_query(query)
    return jsonify(movements)

@app.route('/movements', methods=['POST'])
def add_movement():
    try:
        data = request.get_json()
        if not data or not data.get('product_id') or not data.get('qty'):
            return jsonify({'error': 'product_id and qty required'}), 400
        
        # Generate or validate movement ID
        if 'movement_id' in data and data['movement_id']:
            movement_id = data['movement_id']
            
            # Check if movement exists
            check_query = 'SELECT movement_id FROM product_movement WHERE movement_id = ?'
            existing = execute_query(check_query, (movement_id,), one=True)
            if existing:
                return jsonify({'error': 'Movement ID already exists'}), 400
        else:
            # Generate a unique movement ID using timestamp and random number
            movement_id = f"{int(time.time())}-{random.randint(1000, 9999)}"
        
        # Check if product exists
        product_query = 'SELECT product_id FROM product WHERE product_id = ?'
        product = execute_query(product_query, (data['product_id'],), one=True)
        if not product:
            return jsonify({'error': 'Product does not exist'}), 400
        
        # Check from_location if provided
        if data.get('from_location'):
            from_loc_query = 'SELECT location_id FROM location WHERE location_id = ?'
            from_loc = execute_query(from_loc_query, (data['from_location'],), one=True)
            if not from_loc:
                return jsonify({'error': 'from_location does not exist'}), 400
        
        # Check to_location if provided
        if data.get('to_location'):
            to_loc_query = 'SELECT location_id FROM location WHERE location_id = ?'
            to_loc = execute_query(to_loc_query, (data['to_location'],), one=True)
            if not to_loc:
                return jsonify({'error': 'to_location does not exist'}), 400
        
        qty = int(data['qty'])
        if qty <= 0:
            return jsonify({'error': 'qty must be positive'}), 400
        
        # Per-location stock validation
        if data.get('from_location'):
            # Calculate inbound quantity to the from_location
            in_query = '''
            SELECT COALESCE(SUM(qty), 0) as total_in
            FROM product_movement
            WHERE product_id = ? AND to_location = ?
            '''
            in_result = execute_query(in_query, (data['product_id'], data['from_location']), one=True)
            in_qty = in_result['total_in'] if in_result else 0
            
            # Calculate outbound quantity from the from_location
            out_query = '''
            SELECT COALESCE(SUM(qty), 0) as total_out
            FROM product_movement
            WHERE product_id = ? AND from_location = ?
            '''
            out_result = execute_query(out_query, (data['product_id'], data['from_location']), one=True)
            out_qty = out_result['total_out'] if out_result else 0
            
            available = in_qty - out_qty
            if available <= 0:
                return jsonify({'error': f'No stock for product {data["product_id"]} at location {data["from_location"]}'}), 400
            if qty > available:
                return jsonify({'error': f'Not enough stock at {data["from_location"]}. Available: {available}'}), 400
        
        # Insert new movement
        timestamp = datetime.utcnow().isoformat()
        insert_query = '''
        INSERT INTO product_movement (movement_id, timestamp, from_location, to_location, product_id, qty)
        VALUES (?, ?, ?, ?, ?, ?)
        '''
        execute_query(
            insert_query, 
            (movement_id, timestamp, data.get('from_location'), data.get('to_location'), data['product_id'], qty),
            commit=True
        )
        return jsonify({'message': 'Movement created', 'movement_id': movement_id}), 201
    except Exception as e:
        print(f"Error in add_movement: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/movements/<movement_id>', methods=['GET'])
def get_movement(movement_id):
    query = '''
    SELECT movement_id, timestamp, from_location, to_location, product_id, qty
    FROM product_movement
    WHERE movement_id = ?
    '''
    movement = execute_query(query, (movement_id,), one=True)
    if not movement:
        return jsonify({'error': 'Movement not found'}), 404
    return jsonify(movement)

@app.route('/movements/<movement_id>', methods=['PUT'])
def update_movement(movement_id):
    # Check if movement exists
    check_query = 'SELECT * FROM product_movement WHERE movement_id = ?'
    movement = execute_query(check_query, (movement_id,), one=True)
    if not movement:
        return jsonify({'error': 'Movement not found'}), 404
    
    data = request.get_json()
    
    # Validate data
    if 'qty' in data and int(data['qty']) <= 0:
        return jsonify({'error': 'qty must be positive'}), 400
    
    if 'product_id' in data:
        prod_query = 'SELECT product_id FROM product WHERE product_id = ?'
        product = execute_query(prod_query, (data['product_id'],), one=True)
        if not product:
            return jsonify({'error': 'Product does not exist'}), 400
    
    if 'from_location' in data and data['from_location']:
        from_loc_query = 'SELECT location_id FROM location WHERE location_id = ?'
        from_loc = execute_query(from_loc_query, (data['from_location'],), one=True)
        if not from_loc:
            return jsonify({'error': 'from_location does not exist'}), 400
    
    if 'to_location' in data and data['to_location']:
        to_loc_query = 'SELECT location_id FROM location WHERE location_id = ?'
        to_loc = execute_query(to_loc_query, (data['to_location'],), one=True)
        if not to_loc:
            return jsonify({'error': 'to_location does not exist'}), 400
    
    # Build update query dynamically based on provided fields
    update_fields = []
    params = []

    if 'product_id' in data:
        update_fields.append('product_id = ?')
        params.append(data['product_id'])

    if 'qty' in data:
        update_fields.append('qty = ?')
        params.append(int(data['qty']))

    if 'from_location' in data:
        update_fields.append('from_location = ?')
        params.append(data['from_location'])

    if 'to_location' in data:
        update_fields.append('to_location = ?')
        params.append(data['to_location'])

    # Always update timestamp to now if any field is updated
    if update_fields:
        update_fields.append('timestamp = ?')
        from datetime import datetime
        params.append(datetime.utcnow().isoformat())
    else:
        return jsonify({'message': 'No fields to update'}), 200

    update_query = f'''
    UPDATE product_movement
    SET {', '.join(update_fields)}
    WHERE movement_id = ?
    '''
    params.append(movement_id)

    try:
        execute_query(update_query, tuple(params), commit=True)
        return jsonify({'message': 'Movement updated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/movements/<movement_id>', methods=['DELETE'])
def delete_movement(movement_id):
    # Check if movement exists
    check_query = 'SELECT movement_id FROM product_movement WHERE movement_id = ?'
    movement = execute_query(check_query, (movement_id,), one=True)
    if not movement:
        return jsonify({'error': 'Movement not found'}), 404
    
    delete_query = 'DELETE FROM product_movement WHERE movement_id = ?'
    try:
        execute_query(delete_query, (movement_id,), commit=True)
        return jsonify({'message': 'Movement deleted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Report endpoint
@app.route('/report', methods=['GET'])
def report():
    # Get all products
    products_query = 'SELECT product_id, name FROM product'
    products_result = execute_query(products_query)
    products = {p['product_id']: p['name'] for p in products_result}
    
    # Get all locations
    locations_query = 'SELECT location_id, name FROM location'
    locations_result = execute_query(locations_query)
    locations = {l['location_id']: l['name'] for l in locations_result}
    
    # Get inbound quantities per product/location
    in_query = '''
    SELECT product_id, to_location as location_id, SUM(qty) as in_qty
    FROM product_movement
    WHERE to_location IS NOT NULL
    GROUP BY product_id, to_location
    '''
    in_result = execute_query(in_query)
    in_map = {(r['product_id'], r['location_id']): r['in_qty'] for r in in_result}
    
    # Get outbound quantities per product/location
    out_query = '''
    SELECT product_id, from_location as location_id, SUM(qty) as out_qty
    FROM product_movement
    WHERE from_location IS NOT NULL
    GROUP BY product_id, from_location
    '''
    out_result = execute_query(out_query)
    out_map = {(r['product_id'], r['location_id']): r['out_qty'] for r in out_result}
    
    # Calculate balance for each product/location
    results = []
    for key in set(list(in_map.keys()) + list(out_map.keys())):
        p_id, l_id = key
        in_qty = in_map.get(key, 0)
        out_qty = out_map.get(key, 0)
        qty = in_qty - out_qty
        
        if qty != 0:
            results.append({
                'product_id': p_id,
                'product_name': products.get(p_id),
                'location_id': l_id,
                'location_name': locations.get(l_id),
                'qty': qty
            })
    
    return jsonify(results)

if __name__ == '__main__':
    # Initialize the database if it doesn't exist
    if not os.path.exists(DB_PATH):
        init_db()
    
    app.run(debug=True)