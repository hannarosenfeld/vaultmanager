from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import Warehouse, Field, Order, Vault, db

warehouse_routes = Blueprint('warehouse', __name__)


# fetch current field
@warehouse_routes.route('/<int:warehouse_id>/<int:field_id>')
def get_current_field(warehouse_id, field_id):
    field = Field.query.get(field_id)
    field_dict = field.to_dict()
    field_dict['vaults'] = {vault['id']: vault for vault in sorted(field_dict['vaults'], key=lambda x: x['id'])}
    return jsonify(field_dict)


@warehouse_routes.route('/<int:warehouse_id>', methods=['DELETE'])
def delete_warehouse(warehouse_id):    
    warehouse = Warehouse.query.get(warehouse_id)
    
    if not warehouse:
        return jsonify({'error': 'Warehouse not found'}), 404

    if warehouse.warehouse_fields:
        for field in warehouse.warehouse_fields:
            field_to_delete = Field.query.get(field.id)
            for vault in field_to_delete.vaults:
                vault_to_delete = Vault.query.get(vault.id)
                if vault_to_delete.order_id:
                    order_to_delete = Order.query.get(vault_to_delete.order_id)
                    if order_to_delete:
                        db.session.delete(order_to_delete)
                db.session.delete(vault_to_delete)
            db.session.delete(field_to_delete)
    else:
        print("No fields found for this warehouse.")

    db.session.delete(warehouse)
    db.session.commit()
    
    return jsonify({'message': 'Warehouse deleted successfully'}), 200


@warehouse_routes.route('/<int:warehouse_id>', methods=['GET'])
def get_warehouse_info(warehouse_id):
    """
    Retrieve information about the warehouse
    """
    warehouse = Warehouse.query.get(warehouse_id)

    if not warehouse:
        return {'errors': 'Warehouse not found'}, 404

    return {'warehouse_info': warehouse.to_dict()}


@warehouse_routes.route('/add-warehouse', methods=['POST'])
@login_required
def add_warehouse():
    """
    Add a new warehouse along with rows, fields, and dimensions.
    """
    company_id = current_user.company_id
    data = request.get_json()
    name = data.get('name')
    rows = data.get('rows')
    cols = data.get('cols')
    field_capacity = data.get('field_capacity')
    length = data.get('length')
    width = data.get('width')

    if not name or rows is None or cols is None or field_capacity is None or length is None or width is None:
        return jsonify({'error': 'Name, rows, cols, field capacity, length, and width are required'}), 400

    try:
        warehouse = Warehouse(
            name=name,
            rows=rows,
            cols=cols,
            field_capacity=field_capacity,
            length=length,
            width=width,
            company_id=company_id
        )
        db.session.add(warehouse)
        db.session.commit()

        # Fetch warehouse with associated rows and fields
        warehouse = Warehouse.query.filter_by(name=name).first()
        warehouse_id = warehouse.id

        # Create columns and fields, DO NOT set capacity on Field
        for i in range(1, cols + 1):
            col_char = chr(64 + i)
            for field_num in range(1, rows + 1):
                field_name = f"{col_char}{field_num}"
                field = Field(
                    name=field_name,
                    warehouse_id=warehouse_id,
                    full=False,
                    type='vault'
                    # Do NOT set capacity here
                )
                db.session.add(field)
                db.session.commit()

        return jsonify(warehouse.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@warehouse_routes.route('/<int:warehouse_id>/edit-field-capacity', methods=['PATCH'])
@login_required
def edit_field_capacity(warehouse_id):
    """
    Edit the field capacity of a warehouse.
    """
    data = request.get_json()
    new_field_capacity = data.get('field_capacity')

    if new_field_capacity is None:
        return jsonify({'error': 'Field capacity is required'}), 400

    warehouse = Warehouse.query.get(warehouse_id)

    if not warehouse:
        return jsonify({'error': 'Warehouse not found'}), 404

    try:
        warehouse.field_capacity = new_field_capacity
        db.session.commit()
        return jsonify({'message': 'Field capacity updated successfully', 'warehouse': warehouse.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@warehouse_routes.route('/<int:warehouse_id>/edit-dimensions', methods=['PATCH'])
@login_required
def edit_warehouse_dimensions(warehouse_id):
    """
    Edit the field capacity, length, and width of a warehouse.
    """
    data = request.get_json()
    field_capacity = data.get('field_capacity')
    length = data.get('length')
    width = data.get('width')

    warehouse = Warehouse.query.get(warehouse_id)
    if not warehouse:
        return jsonify({'error': 'Warehouse not found'}), 404

    try:
        if field_capacity is not None:
            warehouse.field_capacity = field_capacity
        if length is not None:
            warehouse.length = length
        if width is not None:
            warehouse.width = width
        db.session.commit()
        return jsonify({'message': 'Warehouse dimensions updated successfully', 'warehouse': warehouse.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@warehouse_routes.route('/<int:warehouse_id>/field-grid', methods=['PUT'])
def update_field_grid(warehouse_id):
    """
    Update the field grid position of a warehouse.
    """
    data = request.get_json()
    new_position = data.get('fieldgridLocation')

    if not new_position:
        return jsonify({'error': 'Field grid position is required'}), 400

    warehouse = Warehouse.query.get(warehouse_id)

    if not warehouse:
        return jsonify({'error': 'Warehouse not found'}), 404

    try:
        warehouse.fieldgrid_location = new_position
        db.session.commit()
        return jsonify({'message': 'Field grid position updated successfully', 'fieldgridLocation': new_position}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@warehouse_routes.route('/company/<int:company_id>', methods=['GET'])
def get_warehouses_by_company(company_id):
    warehouses = Warehouse.query.filter_by(company_id=company_id).all()
    if not warehouses:
        return jsonify([]), 200

    sorted_warehouses = []
    for warehouse in warehouses:
        warehouse_dict = warehouse.to_dict()
        sorted_warehouses.append(warehouse_dict)

    return jsonify(sorted_warehouses)

