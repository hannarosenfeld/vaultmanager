from flask import Blueprint, jsonify, request
from app.models import Rack, db

rack_routes = Blueprint('racks', __name__)


@rack_routes.route('/warehouse/<int:warehouse_id>', methods=['GET'])
def get_racks_by_warehouse(warehouse_id):
    racks = Rack.query.filter_by(warehouse_id=warehouse_id).all()
    return jsonify([rack.to_dict() for rack in racks])

from flask import Blueprint, jsonify, request
from app.models import Rack, Shelf, db  # Ensure Shelf is imported

rack_routes = Blueprint('racks', __name__)


@rack_routes.route('/warehouse/<int:warehouse_id>/add', methods=['POST'])
def add_rack_to_warehouse(warehouse_id):
    data = request.get_json()
    location = data.get('location')
    name = data.get('name', f"Rack in Warehouse {warehouse_id}")
    shelves_count = data.get('shelves', 0)  # Number of shelves to create

    if not location:
        return jsonify({'error': 'Location is required'}), 400

    # Create a new rack
    new_rack = Rack(
        name=name,
        capacity=100,
        warehouse_id=warehouse_id,
        location=location
    )
    db.session.add(new_rack)
    db.session.flush()  # Get the rack ID before committing

    # Create the associated shelves
    shelves = []
    for i in range(shelves_count):
        shelf = Shelf(
            name=f"{name} - Shelf {i + 1}",
            capacity=50,
            rack_id=new_rack.id
        )
        shelves.append(shelf)
        db.session.add(shelf)

    db.session.commit()
    return jsonify(new_rack.to_dict()), 201


@rack_routes.route('/warehouse/<int:warehouse_id>/remove/<int:rack_id>', methods=['DELETE'])
def remove_rack_from_warehouse(warehouse_id, rack_id):
    rack = Rack.query.filter_by(id=rack_id, warehouse_id=warehouse_id).first()

    if not rack:
        return jsonify({'error': 'Rack not found'}), 404

    db.session.delete(rack)
    db.session.commit()
    return jsonify({'message': 'Rack removed successfully'}), 200