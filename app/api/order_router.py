from flask import Blueprint, jsonify, request, Flask
from app.models import db, Order
from flask_cors import CORS, cross_origin

order_routes = Blueprint('orders', __name__)

@order_routes.route('/')
@cross_origin()
def get_all_rows():
    orders = Order.query.all()
    return { order.id: order.to_dict() for order in orders }

@order_routes.route('/<int:id>')
def get_order(id):
    """
    Query for a order by id and returns that order in a dictionary
    """
    order = Order.query.get(id)
    return order.to_dict()