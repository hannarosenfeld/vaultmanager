from flask import Blueprint, jsonify
from app.models import Rack

rack_routes = Blueprint('racks', __name__)

@rack_routes.route('/warehouse/<int:warehouse_id>', methods=['GET'])
def get_racks_by_warehouse(warehouse_id):
    racks = Rack.query.filter_by(warehouse_id=warehouse_id).all()
    return jsonify([rack.to_dict() for rack in racks])