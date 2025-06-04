from flask import Blueprint, request, jsonify
from app.models import Vault, Field, db
from sqlalchemy import and_

stage_routes = Blueprint('stage', __name__)

@stage_routes.route('/vaults/<int:vault_id>', methods=['POST'])
def stage_vault(vault_id):
    try:
        vault = Vault.query.get(vault_id)
        
        if not vault:
            return jsonify({"error": "Vault not found"}), 404
        
        field = Field.query.get(vault.field_id)
        field.full = False
        db.session.commit()
        
        old_field_id = vault.field_id
        vault.field_id = None
        vault.position = None
        db.session.commit()

        response_data = vault.to_dict()
        response_data['old_field_id'] = old_field_id

        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@stage_routes.route('/vaults/<int:company_id>', methods=['GET'])
def get_all_staged_vaults(company_id):
    try:
        staged_vaults = Vault.query.filter(
            Vault.field_id == None,
            Vault.company_id == company_id
        ).all()
        return jsonify([vault.to_dict() for vault in staged_vaults]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500