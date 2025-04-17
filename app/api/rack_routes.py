from flask import Blueprint, jsonify, request
from app.models import Rack, Shelf, Warehouse, db

rack_routes = Blueprint('racks', __name__)


@rack_routes.route('/warehouse/<int:warehouse_id>', methods=['GET'])
def get_racks_for_warehouse(warehouse_id):
    racks = Rack.query.filter_by(warehouse_id=warehouse_id).all()
    return jsonify([rack.to_dict() for rack in racks])

@rack_routes.route('/warehouse/<int:warehouse_id>/add', methods=['POST'])
def add_rack_to_warehouse(warehouse_id):
    data = request.get_json()
    position = data.get('position')  # Expecting x, y, width, height
    name = data.get('name', f"Rack in Warehouse {warehouse_id}")
    capacity = data.get('capacity', 100)
    location = data.get('location', f"Rack-{warehouse_id}-{position.get('x', 0)}-{position.get('y', 0)}")

    if not position:
        return jsonify({'error': 'Position is required'}), 400

    # Validate warehouse existence
    warehouse = Warehouse.query.get(warehouse_id)
    if not warehouse:
        return jsonify({'error': 'Warehouse not found'}), 404

    # Validate rack position
    new_rack = Rack(
        name=name,
        capacity=capacity,
        warehouse_id=warehouse_id,
        position=position,
        location=location  # Ensure location is set
    )

    # Debugging: Log rack position validation
    is_valid_position = warehouse.validate_rack_position(new_rack)

    if not is_valid_position:
        return jsonify({'error': 'Invalid rack position'}), 400

    try:
        # Save the rack to the database
        db.session.add(new_rack)
        db.session.commit()
    except Exception as e:
        return jsonify({'error': 'Failed to save rack', 'details': str(e)}), 500

    return jsonify(new_rack.to_dict()), 201


@rack_routes.route('/<int:warehouse_id>/rack/<int:rack_id>', methods=['PUT'])
def update_rack_position(warehouse_id, rack_id):
    """
    Update the position of a rack in the warehouse.
    """
    data = request.get_json()
    new_position = data.get('position')

    # Debugging: Log the received position data
    print(f"🔍 Received position data: {new_position}")

    if not new_position:
        return jsonify({'error': 'Position is required'}), 400

    # Validate position data
    try:
        x = new_position.get('x')
        y = new_position.get('y')
        width = new_position.get('width')
        height = new_position.get('height')

        if any(value is None or not isinstance(value, (int, float)) for value in [x, y, width, height]):
            raise ValueError("Position values must be valid numbers.")

    except Exception as e:
        print(f"❌ Invalid position data: {e}")
        return jsonify({'error': 'Invalid position data', 'details': str(e)}), 400

    # Debugging: Log validated position data
    print(f"✅ Validated position data: {new_position}")

    rack = Rack.query.filter_by(id=rack_id, warehouse_id=warehouse_id).first()
    if not rack:
        return jsonify({'error': 'Rack not found'}), 404

    warehouse = Warehouse.query.get(warehouse_id)
    if not warehouse:
        return jsonify({'error': 'Warehouse not found'}), 404

    # Validate the new position
    try:
        rack.position = new_position
        if not warehouse.validate_rack_position(rack):
            return jsonify({'error': 'Invalid rack position'}), 400
    except Exception as e:
        # Debugging: Log validation error
        print(f"❌ Error validating rack position: {e}")
        return jsonify({'error': 'Invalid position data', 'details': str(e)}), 400

    try:
        db.session.commit()
        return jsonify({'message': 'Rack position updated successfully', 'rack': rack.to_dict()}), 200
    except Exception as e:
        # Debugging: Log the exception
        print(f"❌ Error updating rack position: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500