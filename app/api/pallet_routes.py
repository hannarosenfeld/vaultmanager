from flask import Blueprint, jsonify, request
from app.models import Pallet, Shelf, db

pallet_routes = Blueprint('pallets', __name__)

@pallet_routes.route('/shelf/<int:shelf_id>/add', methods=['POST'])
def add_pallet_to_shelf(shelf_id):
    print(f"POST /shelf/{shelf_id}/add called")  # Debug log
    data = request.get_json()
    print(f"🔍 Received data: {data}")  # Debugging: Log received data

    name = data.get('name')
    weight = data.get('weight')
    customer_name = data.get('customer_name')  # New field
    pallet_number = data.get('pallet_number')  # New field
    notes = data.get('notes')  # New field

    # Log the values of the required fields for debugging
    print(f"🔍 Validating fields: name={name}, weight={weight}, customer_name={customer_name}")

    if not name or weight is None or not customer_name:  # Ensure customer_name is required
        print(f"❌ Missing required fields: name={name}, weight={weight}, customer_name={customer_name}")  # Debugging
        return jsonify({'error': 'Name, weight, and customer name are required'}), 400

    shelf = Shelf.query.get(shelf_id)
    if not shelf:
        print(f"❌ Shelf not found for ID: {shelf_id}")  # Debugging
        return jsonify({'error': 'Shelf not found'}), 404

    if len(shelf.pallets) >= shelf.capacity:  # Check if shelf capacity is exceeded
        print(f"❌ Shelf capacity exceeded for shelf ID: {shelf_id}")  # Debugging
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
        print(f"✅ Pallet added successfully: {new_pallet.to_dict()}")  # Debugging: Log pallet data
        return jsonify(shelf.to_dict()), 201  # Return the updated shelf data
    except Exception as e:
        print(f"❌ Error adding pallet: {e}")  # Debugging: Log error details
        db.session.rollback()
        return jsonify({'error': 'Failed to add pallet', 'details': str(e)}), 500

@pallet_routes.route('/shelf/<int:shelf_id>/pallets', methods=['GET'])
def get_pallets_for_shelf(shelf_id):
    shelf = Shelf.query.get(shelf_id)
    if not shelf:
        print(f"❌ Shelf not found for ID: {shelf_id}")  # Debugging
        return jsonify({'error': 'Shelf not found'}), 404

    pallets = [pallet.to_dict() for pallet in shelf.pallets]
    print(f"✅ Retrieved pallets for shelf ID {shelf_id}: {pallets}")  # Debugging
    return jsonify(pallets), 200
