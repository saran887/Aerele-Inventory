import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
db = SQLAlchemy(app)

## User model removed

class Product(db.Model):
    product_id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    total_quantity = db.Column(db.Integer)
    location_id = db.Column(db.String, db.ForeignKey('location.location_id'), nullable=True)

class Location(db.Model):
    location_id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String)

class ProductMovement(db.Model):
    movement_id = db.Column(db.String, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    from_location = db.Column(db.String, db.ForeignKey('location.location_id'), nullable=True)
    to_location = db.Column(db.String, db.ForeignKey('location.location_id'), nullable=True)
    product_id = db.Column(db.String, db.ForeignKey('product.product_id'), nullable=False)
    qty = db.Column(db.Integer, nullable=False)

## Auth endpoints removed

# Product endpoints
@app.route('/products', methods=['GET'])

def get_products():
    products = Product.query.all()
    return jsonify([
        {'product_id': p.product_id, 'name': p.name, 'description': p.description, 'total_quantity': p.total_quantity, 'location_id': p.location_id} for p in products
    ])

@app.route('/products', methods=['POST'])

def add_product():
    data = request.get_json()
    if not data or not data.get('product_id') or not data.get('name'):
        return jsonify({'error': 'product_id and name required'}), 400
    if db.session.get(Product, data['product_id']):
        return jsonify({'error': 'Product ID already exists'}), 400
    total_qty = data.get('total_quantity', 0)
    location_id = data.get('location_id')
    if location_id and not db.session.get(Location, location_id):
        return jsonify({'error': 'Location does not exist'}), 400
    p = Product(
        product_id=data['product_id'],
        name=data['name'],
        description=data.get('description'),
        total_quantity=total_qty,
        location_id=location_id
    )
    db.session.add(p)
    db.session.commit()
    # Automatically create inbound movement if location and quantity are set
    if location_id and total_qty > 0:
        from datetime import datetime
        movement = ProductMovement(
            movement_id=f'INIT-{p.product_id}',
            product_id=p.product_id,
            qty=total_qty,
            from_location=None,
            to_location=location_id,
            timestamp=datetime.utcnow()
        )
        db.session.add(movement)
        db.session.commit()
    return jsonify({'message': 'Product created', 'product_id': p.product_id}), 201

@app.route('/products/<product_id>', methods=['GET'])

def get_product(product_id):
    p = Product.query.get(product_id)
    if not p:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'product_id': p.product_id, 'name': p.name, 'description': p.description, 'total_quantity': p.total_quantity})

@app.route('/products/<product_id>', methods=['PUT'])

def update_product(product_id):
    p = Product.query.get(product_id)
    if not p:
        return jsonify({'error': 'Product not found'}), 404
    data = request.get_json()
    p.name = data.get('name', p.name)
    p.description = data.get('description', p.description)
    if 'total_quantity' in data:
        p.total_quantity = data['total_quantity']
    if 'location_id' in data:
        if data['location_id'] and not Location.query.get(data['location_id']):
            return jsonify({'error': 'Location does not exist'}), 400
        p.location_id = data['location_id']
    db.session.commit()
    return jsonify({'message': 'Product updated'})

@app.route('/products/<product_id>', methods=['DELETE'])

def delete_product(product_id):
    p = Product.query.get(product_id)
    if not p:
        return jsonify({'error': 'Product not found'}), 404
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Product deleted'})

# Location endpoints
@app.route('/locations', methods=['GET'])

def get_locations():
    locations = Location.query.all()
    return jsonify([{'location_id': l.location_id, 'name': l.name, 'address': l.address} for l in locations])

@app.route('/locations', methods=['POST'])

def add_location():
    data = request.get_json()
    if not data or not data.get('location_id') or not data.get('name'):
        return jsonify({'error': 'location_id and name required'}), 400
    if Location.query.get(data['location_id']):
        return jsonify({'error': 'Location ID already exists'}), 400
    l = Location(location_id=data['location_id'], name=data['name'], address=data.get('address'))
    db.session.add(l)
    db.session.commit()
    return jsonify({'message': 'Location created', 'location_id': l.location_id}), 201

@app.route('/locations/<location_id>', methods=['GET'])

def get_location(location_id):
    l = Location.query.get(location_id)
    if not l:
        return jsonify({'error': 'Location not found'}), 404
    return jsonify({'location_id': l.location_id, 'name': l.name, 'address': l.address})

@app.route('/locations/<location_id>', methods=['PUT'])

def update_location(location_id):
    l = Location.query.get(location_id)
    if not l:
        return jsonify({'error': 'Location not found'}), 404
    data = request.get_json()
    l.name = data.get('name', l.name)
    l.address = data.get('address', l.address)
    db.session.commit()
    return jsonify({'message': 'Location updated'})

@app.route('/locations/<location_id>', methods=['DELETE'])

def delete_location(location_id):
    l = Location.query.get(location_id)
    if not l:
        return jsonify({'error': 'Location not found'}), 404
    db.session.delete(l)
    db.session.commit()
    return jsonify({'message': 'Location deleted'})

# List all movements endpoint
@app.route('/movements', methods=['GET'])
def get_movements():
    movements = ProductMovement.query.all()
    return jsonify([
        {
            'movement_id': m.movement_id,
            'timestamp': m.timestamp.isoformat(),
            'from_location': m.from_location,
            'to_location': m.to_location,
            'product_id': m.product_id,
            'qty': m.qty
        } for m in movements
    ])

# Create new movement endpoint
@app.route('/movements', methods=['POST'])
def add_movement():
    try:
        data = request.get_json()
        if not data or not data.get('product_id') or not data.get('qty'):
            return jsonify({'error': 'product_id and qty required'}), 400
        
        if 'movement_id' in data and data['movement_id']:
            movement_id = data['movement_id']
            if ProductMovement.query.get(movement_id):
                return jsonify({'error': 'Movement ID already exists'}), 400
        else:
            # Generate a unique movement ID using timestamp and random number
            import time
            import random
            movement_id = f"{int(time.time())}-{random.randint(1000, 9999)}"
            
        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'error': 'Product does not exist'}), 400
            
        if data.get('from_location') and not Location.query.get(data['from_location']):
            return jsonify({'error': 'from_location does not exist'}), 400
            
        if data.get('to_location') and not Location.query.get(data['to_location']):
            return jsonify({'error': 'to_location does not exist'}), 400
            
        qty = int(data['qty'])
        if qty <= 0:
            return jsonify({'error': 'qty must be positive'}), 400
            
        # Per-location stock validation
        if data.get('from_location'):
            from sqlalchemy import func
            in_q = db.session.query(func.sum(ProductMovement.qty)).filter_by(product_id=data['product_id'], to_location=data['from_location']).scalar() or 0
            out_q = db.session.query(func.sum(ProductMovement.qty)).filter_by(product_id=data['product_id'], from_location=data['from_location']).scalar() or 0
            available = in_q - out_q
            if available <= 0:
                return jsonify({'error': f'No stock for product {data["product_id"]} at location {data["from_location"]}'}), 400
            if qty > available:
                return jsonify({'error': f'Not enough stock at {data["from_location"]}. Available: {available}'}), 400
                
        # Remaining quantity checks removed as per request
            
        m = ProductMovement(
            movement_id=movement_id,
            product_id=data['product_id'],
            qty=qty,
            from_location=data.get('from_location'),
            to_location=data.get('to_location')
        )
        db.session.add(m)
        db.session.commit()
        return jsonify({'message': 'Movement created', 'movement_id': m.movement_id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in add_movement: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/movements/<movement_id>', methods=['GET'])
def get_movement(movement_id):
    m = ProductMovement.query.get(movement_id)
    if not m:
        return jsonify({'error': 'Movement not found'}), 404
    return jsonify({
        'movement_id': m.movement_id,
        'timestamp': m.timestamp.isoformat(),
        'from_location': m.from_location,
        'to_location': m.to_location,
        'product_id': m.product_id,
        'qty': m.qty
    })

@app.route('/movements/<movement_id>', methods=['PUT'])

def update_movement(movement_id):
    m = ProductMovement.query.get(movement_id)
    if not m:
        return jsonify({'error': 'Movement not found'}), 404
    data = request.get_json()
    if 'qty' in data and int(data['qty']) <= 0:
        return jsonify({'error': 'qty must be positive'}), 400
    if 'product_id' in data and not Product.query.get(data['product_id']):
        return jsonify({'error': 'Product does not exist'}), 400
    if 'from_location' in data and data['from_location'] and not Location.query.get(data['from_location']):
        return jsonify({'error': 'from_location does not exist'}), 400
    if 'to_location' in data and data['to_location'] and not Location.query.get(data['to_location']):
        return jsonify({'error': 'to_location does not exist'}), 400
    m.product_id = data.get('product_id', m.product_id)
    m.qty = int(data.get('qty', m.qty))
    m.from_location = data.get('from_location', m.from_location)
    m.to_location = data.get('to_location', m.to_location)
    db.session.commit()
    return jsonify({'message': 'Movement updated'})

@app.route('/movements/<movement_id>', methods=['DELETE'])

def delete_movement(movement_id):
    m = ProductMovement.query.get(movement_id)
    if not m:
        return jsonify({'error': 'Movement not found'}), 404
    db.session.delete(m)
    db.session.commit()
    return jsonify({'message': 'Movement deleted'})

# Report endpoint
@app.route('/report', methods=['GET'])

def report():
    # Compute balance per product/location
    from sqlalchemy import func
    products = {p.product_id: p.name for p in Product.query.all()}
    locations = {l.location_id: l.name for l in Location.query.all()}
    in_q = db.session.query(
        ProductMovement.product_id,
        ProductMovement.to_location.label('location_id'),
        func.sum(ProductMovement.qty).label('in_qty')
    ).filter(ProductMovement.to_location != None).group_by(ProductMovement.product_id, ProductMovement.to_location)
    out_q = db.session.query(
        ProductMovement.product_id,
        ProductMovement.from_location.label('location_id'),
        func.sum(ProductMovement.qty).label('out_qty')
    ).filter(ProductMovement.from_location != None).group_by(ProductMovement.product_id, ProductMovement.from_location)
    in_map = {(r.product_id, r.location_id): r.in_qty for r in in_q}
    out_map = {(r.product_id, r.location_id): r.out_qty for r in out_q}
    results = []
    for (p_id, l_id) in set(list(in_map.keys()) + list(out_map.keys())):
        in_qty = in_map.get((p_id, l_id), 0)
        out_qty = out_map.get((p_id, l_id), 0)
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
    if not os.path.exists('database.db'):
        with app.app_context():
            db.create_all()
    app.run(debug=True)
