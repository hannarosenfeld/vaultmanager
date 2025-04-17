from flask import Blueprint, jsonify, request
from app.models import Rack, Shelf, Warehouse, db

rack_routes = Blueprint('racks', __name__)


@rack_routes.route('/warehouse/<int:warehouse_id>', methods=['GET'])
def get_racks_for_warehouse(warehouse_id):
    racks = Rack.query.filter_by(warehouse_id=warehouse_id).all()
    return jsonify([rack.to_dict() for rack in racks])

@rack_routes.route('/warehouse/<int:warehouse_id>/add', methods=['POST'])
def add_rack_to_warehouse(warehouse_id):
    print("🍑 EN ROUTE")
    data = request.get_json()
    print(f"📥 Received data: {data}")  # Log incoming data
    position = data.get('position')  # Expecting x, y, width, height
    name = data.get('name', f"Rack in Warehouse {warehouse_id}")
    capacity = data.get('capacity', 100)
    location = data.get('location', f"Rack-{warehouse_id}-{position.get('x', 0)}-{position.get('y', 0)}")

    # Debugging: Log parsed data
    print(f"Parsed position: {position}, name: {name}, capacity: {capacity}, location: {location}")

    if not position:
        print("❌ Error: Position is required")
        return jsonify({'error': 'Position is required'}), 400

    # Validate warehouse existence
    warehouse = Warehouse.query.get(warehouse_id)
    if not warehouse:
        print(f"❌ Error: Warehouse {warehouse_id} not found")
        return jsonify({'error': 'Warehouse not found'}), 404

    # Debugging: Log warehouse details
    print(f"🏢 Warehouse found: {warehouse.to_dict()}")

    # Validate rack position
    new_rack = Rack(
        name=name,
        capacity=capacity,
        warehouse_id=warehouse_id,
        position=position,
        location=location  # Ensure location is set
    )
    print(f"🛠️ New rack object created: {new_rack.to_dict()}")

    # Debugging: Log rack position validation
    is_valid_position = warehouse.validate_rack_position(new_rack)
    print(f"✅ Rack position validation result: {is_valid_position}")

    if not is_valid_position:
        print("❌ Error: Invalid rack position")
        return jsonify({'error': 'Invalid rack position'}), 400

    try:
        # Save the rack to the database
        db.session.add(new_rack)
        db.session.commit()
        print(f"✅ Rack saved successfully: {new_rack.to_dict()}")
    except Exception as e:
        # Debugging: Log the error
        print(f"❌ Error saving rack: {e}")
        return jsonify({'error': 'Failed to save rack', 'details': str(e)}), 500

    return jsonify(new_rack.to_dict()), 201


@rack_routes.route('/warehouse/<int:warehouse_id>/remove/<int:rack_id>', methods=['DELETE'])
def remove_rack_from_warehouse(warehouse_id, rack_id):
    rack = Rack.query.filter_by(id=rack_id, warehouse_id=warehouse_id).first()

    if not rack:
        return jsonify({'error': 'Rack not found'}), 404

    db.session.delete(rack)
    db.session.commit()
    return jsonify({'message': 'Rack removed successfully'}), 200

print("💖💖💖💖💖💖💖💖💖💖")

@rack_routes.route('/warehouse/<int:warehouse_id>/rack/<int:rack_id>', methods=['PUT'])
def update_rack_position(warehouse_id, rack_id):
    print("💖💖💖💖💖💖💖💖💖💖")
    print(f"🔄 Updating position for rack {rack_id} in warehouse {warehouse_id}")
    data = request.get_json()
    print(f"📥 Received data: {data}")

    position = data.get('position')
    if not position:
        print("❌ Error: Position is required")
        return jsonify({'error': 'Position is required'}), 400

    # Validate rack existence
    rack = Rack.query.filter_by(id=rack_id, warehouse_id=warehouse_id).first()
    if not rack:
        print(f"❌ Error: Rack {rack_id} not found in warehouse {warehouse_id}")
        return jsonify({'error': 'Rack not found'}), 404

    # Validate warehouse existence
    warehouse = Warehouse.query.get(warehouse_id)
    if not warehouse:
        print(f"❌ Error: Warehouse {warehouse_id} not found")
        return jsonify({'error': 'Warehouse not found'}), 404

    # Validate new position
    rack.position = position
    if not warehouse.validate_rack_position(rack):
        print("❌ Error: Invalid rack position")
        return jsonify({'error': 'Invalid rack position'}), 400

    try:
        db.session.commit()
        print(f"✅ Rack position updated successfully: {rack.to_dict()}")
    except Exception as e:
        print(f"❌ Error updating rack position: {e}")
        return jsonify({'error': 'Failed to update rack position', 'details': str(e)}), 500

    return jsonify(rack.to_dict()), 200