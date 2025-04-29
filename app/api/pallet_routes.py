from flask import Blueprint, jsonify, request
from app.models import Pallet, Shelf, db

pallet_routes = Blueprint('pallets', __name__)

@pallet_routes.route('/shelf/<int:shelf_id>/add', methods=['POST'])
def add_pallet_to_shelf(shelf_id):
    print(f"POST /shelf/{shelf_id}/add called")  # Debug log
    data = request.get_json()
    name = data.get('name')
    weight = data.get('weight')

    if not name or not weight:
        return jsonify({'error': 'Name and weight are required'}), 400

    shelf = Shelf.query.get(shelf_id)
    if not shelf:
        return jsonify({'error': 'Shelf not found'}), 404

    if len(shelf.pallets) >= shelf.capacity:  # Check if shelf capacity is exceeded
        return jsonify({'error': 'Shelf capacity exceeded'}), 400

    try:
        new_pallet = Pallet(name=name, weight=weight, shelf_id=shelf_id)
        db.session.add(new_pallet)
        db.session.commit()
        return jsonify(shelf.to_dict()), 201  # Return the updated shelf data
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
