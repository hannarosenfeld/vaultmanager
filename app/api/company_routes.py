from flask import Blueprint, jsonify
from app.models import db, Company

company_routes = Blueprint('companies', __name__)

@company_routes.route('/')
def get_all_companies():
    companies = Company.query.all()
    print("🌺", { company.id : company.to_dict() for company in companies })
    return { company.id : company.to_dict() for company in companies }
