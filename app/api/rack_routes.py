from flask import Blueprint, jsonify, request
from app.models import Rack, Shelf, Warehouse, db, Pallet
from app.models.customer import Customer 

rack_routes = Blueprint('racks', __name__)


@rack_routes.route('/warehouse/<int:warehouse_id>', methods=['GET'])
def get_racks_for_warehouse(warehouse_id):
    try:
        racks = Rack.query.filter_by(warehouse_id=warehouse_id).all()
        response = [rack.to_dict() for rack in racks]
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch racks', 'details': str(e)}), 500


@rack_routes.route('/warehouse/<int:warehouse_id>/add', methods=['POST'])
def add_rack_to_warehouse(warehouse_id):
    data = request.get_json()

    position = data.get('position', {})
    orientation = data.get('orientation', 'vertical')
    width = data.get('width')
    length = data.get('length')
    capacity = data.get('capacity')

    if not isinstance(capacity, int) or capacity <= 0:
        return jsonify({'error': 'Invalid capacity value'}), 400

    if orientation == 'horizontal':
        position['width'], position['length'] = width, length
    else:
        position['width'], position['length'] = length, width

    name = data.get('name', f"Rack in Warehouse {warehouse_id}")
    num_shelves = data.get('num_shelves')

    if not position:
        return jsonify({'error': 'Position is required'}), 400

    warehouse = Warehouse.query.get(warehouse_id)
    if not warehouse:
        return jsonify({'error': 'Warehouse not found'}), 404

    if not width or not length:
        return jsonify({'error': 'Rack dimensions are missing. Please try again.'}), 400

    if not isinstance(width, (int, float)) or not isinstance(length, (int, float)):
        return jsonify({'error': 'Invalid dimensions provided. Please try again.'}), 400

    new_rack = Rack(
        name=name,
        capacity=capacity,
        warehouse_id=warehouse_id,
        position=position,
        orientation=orientation,
        width=width,
        length=length,
    )

    is_valid_position = warehouse.validate_rack_position(new_rack)

    if not is_valid_position:
        return jsonify({'error': 'Invalid rack position'}), 400

    try:
        db.session.add(new_rack)
        db.session.flush()  # Flush to get the rack ID before committing

        # Format the rack name for shelf naming
        formatted_rack_name = "-".join(new_rack.name.lower().split())

        # Create shelves and add them to the rack's shelves relationship
        for i in range(1, num_shelves + 1):
            shelf_name = f"{formatted_rack_name}-shelf-{i}"
            new_shelf = Shelf(name=shelf_name, rack_id=new_rack.id)  # Default capacity of 50
            new_rack.shelves.append(new_shelf)  # Append directly to the rack's shelves relationship
            db.session.add(new_shelf)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to save rack or shelves', 'details': str(e)}), 500

    return jsonify(new_rack.to_dict()), 201


@rack_routes.route('/<int:warehouse_id>/rack/<int:rack_id>', methods=['PUT'])
def update_rack_position(warehouse_id, rack_id):
    """
    Update the position of a rack in the warehouse.
    """
    data = request.get_json()

    new_position = data.get('position', {})
    x = new_position.get('x')
    y = new_position.get('y')

    if x is None or y is None:
        return jsonify({'error': 'Position (x, y) is required'}), 400

    rack = Rack.query.filter_by(id=rack_id, warehouse_id=warehouse_id).first()
    if not rack:
        return jsonify({'error': 'Rack not found'}), 404

    warehouse = Warehouse.query.get(warehouse_id)
    if not warehouse:
        return jsonify({'error': 'Warehouse not found'}), 404

    try:
        rack.position = {'x': x, 'y': y}

        if not warehouse.validate_rack_position(rack):
            return jsonify({'error': 'Invalid rack position'}), 400
    except Exception as e:
        return jsonify({'error': 'Invalid position data', 'details': str(e)}), 400

    try:
        db.session.commit()
        return jsonify({'message': 'Rack position updated successfully', 'rack': rack.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rack_routes.route('/pallets/shelf/<int:shelf_id>/add', methods=['POST'])
def add_pallet_to_shelf(shelf_id):
    data = request.get_json()
    shelf_id = data.get('shelf_id')
    customer_name = data.get('customer_name')
    pallet_number = data.get('pallet_number')
    notes = data.get('notes')
    weight = data.get('weight', 0)
    shelf_spots = data.get('shelf_spots', 1)

    if not shelf_id or not customer_name or not pallet_number:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        new_pallet = Pallet(
            name=f"Pallet-{shelf_id}-{pallet_number}",
            weight=weight,
            shelf_id=shelf_id,
            customer_name=customer_name,
            pallet_number=pallet_number,
            notes=notes,
            shelf_spots=shelf_spots,
        )
        db.session.add(new_pallet)
        db.session.commit()
        return jsonify(new_pallet.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rack_routes.route('/pallets', methods=['POST'])
def create_pallet():
    data = request.get_json()
    shelf_id = data.get('shelf_id')
    customer_name = data.get('customer_name')
    pallet_number = data.get('pallet_number')
    notes = data.get('notes')
    weight = data.get('weight')
    shelf_spots = data.get('shelf_spots')
    slot_index = data.get('slot_index')  # Accept slot_index
    name = data.get('name')  # Get name from request

    if not shelf_id or not customer_name or not name:
        return jsonify({'error': 'Missing required fields'}), 400

    customer_name = customer_name.upper()  # Ensure uppercase

    # --- Begin: Ensure customer exists ---
    customer = Customer.query.filter(
        db.func.upper(Customer.name) == customer_name
    ).first()
    if not customer:
        customer = Customer(name=customer_name)
        db.session.add(customer)
        db.session.flush()  # Get customer.id before commit
    # --- End: Ensure customer exists ---

    try:
        new_pallet = Pallet(
            name=name,  # Use provided name
            weight=weight,
            shelf_id=shelf_id,
            customer_name=customer_name,
            pallet_number=pallet_number,
            notes=notes,
            shelf_spots=shelf_spots,
            slot_index=slot_index,  # Store slot_index
            customer_id=customer.id,  # Associate with customer
        )
        db.session.add(new_pallet)
        db.session.commit()
        return jsonify(new_pallet.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rack_routes.route('/<int:warehouse_id>/rack/<int:rack_id>/delete', methods=['DELETE'])
def delete_rack(warehouse_id, rack_id):
    rack = Rack.query.filter_by(id=rack_id, warehouse_id=warehouse_id).first()
    if not rack:
        return jsonify({'error': 'Rack not found'}), 404
    try:
        db.session.delete(rack)
        db.session.commit()
        return jsonify({'message': 'Rack deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete rack', 'details': str(e)}), 500


@rack_routes.route('/pallets/<int:id>/edit', methods=['PUT'])
def edit_pallet(id):
    data = request.get_json()
    pallet = Pallet.query.get(id)
    if not pallet:
        return jsonify({'error': 'Pallet not found'}), 404

    # Update fields if present in request
    pallet.name = data.get('name', pallet.name)
    pallet.customer_name = data.get('customer_name', pallet.customer_name)
    pallet.pallet_number = data.get('pallet_number', pallet.pallet_number)
    pallet.notes = data.get('notes', pallet.notes)
    pallet.weight = data.get('weight', pallet.weight)
    pallet.shelf_spots = data.get('pallet_spaces', pallet.shelf_spots)

    # Update customer_id if customer_name is changed
    if 'customer_name' in data:
        customer_name = data['customer_name'].upper()
        customer = Customer.query.filter(
            db.func.upper(Customer.name) == customer_name
        ).first()
        if not customer:
            customer = Customer(name=customer_name)
            db.session.add(customer)
            db.session.flush()
        pallet.customer_id = customer.id

    try:
        db.session.commit()
        return jsonify(pallet.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500