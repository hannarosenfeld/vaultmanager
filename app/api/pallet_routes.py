from flask import Blueprint, jsonify, request
from app.models import Pallet, Shelf, db

pallet_routes = Blueprint('pallets', __name__)

@pallet_routes.route('/shelf/<int:shelf_id>/add', methods=['POST'])
def add_pallet_to_shelf(shelf_id):
    data = request.get_json()
    customer_name = data.get('customer_name')
    pallet_number = data.get('pallet_number')
    notes = data.get('notes')
    weight = data.get('weight', 0)  # Default weight to 0 if not provided

    # Generate a name for the pallet if not provided
    name = data.get('name') or f"Pallet-{shelf_id}-{pallet_number}"

    # Validate required fields
    if not customer_name or not pallet_number:
        return jsonify({'error': 'Customer name and pallet number are required'}), 400

    shelf = Shelf.query.get(shelf_id)
    if not shelf:
        return jsonify({'error': 'Shelf not found'}), 404

    if len(shelf.pallets) >= shelf.capacity:
        return jsonify({'error': 'Shelf capacity exceeded'}), 400

    try:
        new_pallet = Pallet(
            name=name,
            weight=weight,
            customer_name=customer_name,
            pallet_number=pallet_number,
            notes=notes,
            shelf_id=shelf_id
        )
        db.session.add(new_pallet)
        db.session.commit()
        return jsonify(shelf.to_dict()), 201  # Return updated shelf with all pallets
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add pallet', 'details': str(e)}), 500

@pallet_routes.route('/shelf/<int:shelf_id>/pallets', methods=['GET'])
def get_pallets_for_shelf(shelf_id):
    shelf = Shelf.query.get(shelf_id)
    if not shelf:
        return jsonify({'error': 'Shelf not found'}), 404

    pallets = [pallet.to_dict() for pallet in shelf.pallets]
    return jsonify(pallets), 200

@pallet_routes.route('/<int:pallet_id>/edit', methods=['PUT'])
def edit_pallet(pallet_id):
    data = request.get_json()
    pallet = Pallet.query.get(pallet_id)

    if not pallet:
        return jsonify({'error': 'Pallet not found'}), 404

    try:
        pallet.customer_name = data.get('customer_name', pallet.customer_name)
        pallet.pallet_number = data.get('pallet_number', pallet.pallet_number)
        pallet.notes = data.get('notes', pallet.notes)
        pallet.weight = data.get('weight', pallet.weight)
        db.session.commit()
        return jsonify(pallet.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to edit pallet', 'details': str(e)}), 500
