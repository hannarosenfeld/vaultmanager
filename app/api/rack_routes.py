from flask import Blueprint, jsonify, request
from app.models import Rack, Shelf, Warehouse, db, Pallet  # Ensure Pallet is imported

rack_routes = Blueprint('racks', __name__)


@rack_routes.route('/warehouse/<int:warehouse_id>', methods=['GET'])
def get_racks_for_warehouse(warehouse_id):
    try:
        racks = Rack.query.filter_by(warehouse_id=warehouse_id).all()
        response = [rack.to_dict() for rack in racks]
        print(f"🔍 API Response for racks: {response}")  # Debugging: Log API response
        return jsonify(response), 200
    except Exception as e:
        print(f"❌ Error fetching racks for warehouse {warehouse_id}: {e}")
        return jsonify({'error': 'Failed to fetch racks', 'details': str(e)}), 500


@rack_routes.route('/warehouse/<int:warehouse_id>/add', methods=['POST'])
def add_rack_to_warehouse(warehouse_id):
    data = request.get_json()
    print(f"🔍 Received data for adding rack: {data}")  # Debugging: Log received data

    position = data.get('position', {})
    orientation = data.get('orientation', 'vertical')
    width = data.get('width')
    length = data.get('length')
    capacity = data.get('capacity', 100)  # Default to 100 if not provided

    # Debugging: Log the capacity value
    print(f"📦 Rack capacity received: {capacity}")

    if not isinstance(capacity, int) or capacity <= 0:
        return jsonify({'error': 'Invalid capacity value'}), 400

    if orientation == 'horizontal':
        position['width'], position['length'] = width, length
    else:
        position['width'], position['length'] = length, width

    name = data.get('name', f"Rack in Warehouse {warehouse_id}")
    num_shelves = data.get('num_shelves', 0)  # Get the number of shelves from the form

    if not position:
        return jsonify({'error': 'Position is required'}), 400

    # Validate warehouse existence
    warehouse = Warehouse.query.get(warehouse_id)
    if not warehouse:
        return jsonify({'error': 'Warehouse not found'}), 404

    # Validate dimensions
    if not width or not length:
        print(f"❌ Rack dimensions are missing: width={width}, length={length}")  # Debugging: Log missing dimensions
        return jsonify({'error': 'Rack dimensions are missing. Please try again.'}), 400

    # Stop further processing if dimensions are invalid
    if not isinstance(width, (int, float)) or not isinstance(length, (int, float)):
        return jsonify({'error': 'Invalid dimensions provided. Please try again.'}), 400

    # Validate rack position
    new_rack = Rack(
        name=name,
        capacity=capacity,  # Pass capacity to the Rack model
        warehouse_id=warehouse_id,
        position=position,
        orientation=orientation,
        width=width,
        length=length,
    )

    # Debugging: Log rack position validation
    is_valid_position = warehouse.validate_rack_position(new_rack)

    if not is_valid_position:
        print(f"❌ Rack position validation failed: {new_rack.to_dict()}")  # Debugging: Log failed validation
        return jsonify({'error': 'Invalid rack position'}), 400

    try:
        # Save the rack to the database
        db.session.add(new_rack)
        db.session.flush()  # Flush to get the rack ID before committing

        # Format the rack name for shelf naming
        formatted_rack_name = "-".join(new_rack.name.lower().split())
        print(f"🔍 Formatted rack name for shelves: {formatted_rack_name}")  # Debugging: Log formatted name

        # Create shelves and add them to the rack's shelves relationship
        for i in range(1, num_shelves + 1):
            shelf_name = f"{formatted_rack_name}-shelf-{i}"
            new_shelf = Shelf(name=shelf_name, rack_id=new_rack.id)  # Default capacity of 50
            new_rack.shelves.append(new_shelf)  # Append directly to the rack's shelves relationship
            db.session.add(new_shelf)
            print(f"✅ Shelf created: {new_shelf.to_dict()}")  # Debugging: Log shelf creation

        db.session.commit()

        print(f"✅ Rack and shelves added successfully: {new_rack.to_dict()}")  # Debugging: Log rack data after saving
    except Exception as e:
        print(f"❌ Error saving rack or shelves: {e}")  # Debugging: Log error details
        db.session.rollback()
        return jsonify({'error': 'Failed to save rack or shelves', 'details': str(e)}), 500

    return jsonify(new_rack.to_dict()), 201


@rack_routes.route('/<int:warehouse_id>/rack/<int:rack_id>', methods=['PUT'])
def update_rack_position(warehouse_id, rack_id):
    """
    Update the position of a rack in the warehouse.
    """
    data = request.get_json()
    print(f"🔍 Received data for updating rack: {data}")  # Debugging: Log received data

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

    # Validate the new position
    try:
        rack.position = {'x': x, 'y': y}  # Only update position
        print(f"🔍 Rack before validation: {rack.to_dict()}")  # Debugging: Log rack data before validation

        if not warehouse.validate_rack_position(rack):
            print(f"❌ Rack position validation failed for position: {new_position}")
            return jsonify({'error': 'Invalid rack position'}), 400
    except Exception as e:
        print(f"❌ Error validating rack position: {e}")
        return jsonify({'error': 'Invalid position data', 'details': str(e)}), 400

    try:
        db.session.commit()
        print(f"✅ Rack updated successfully: {rack.to_dict()}")  # Debugging: Log rack data after saving
        return jsonify({'message': 'Rack position updated successfully', 'rack': rack.to_dict()}), 200
    except Exception as e:
        print(f"❌ Error updating rack position: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rack_routes.route('/pallets/shelf/<int:shelf_id>/add', methods=['POST'])
def add_pallet_to_shelf(shelf_id):
    # make sure we are properly creatging a pallet
    data = request.get_json()
    # Required fields: shelf_id, customer_name, pallet_number, weight, shelf_spots
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
    # Required fields: shelf_id, customer_name, pallet_number, weight, shelf_spots
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