import os
from flask import Flask, render_template, request, session, redirect, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_login import LoginManager, login_required
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from .models import db, User
from .api.user_routes import user_routes
from .api.auth_routes import auth_routes
from .api.vault_routes import vault_routes
from .api.field_routes import field_routes
from .api.customers_routes import customers_routes
from .api.warehouse_routes import warehouse_routes
from .api.order_router import order_routes
from .api.search_routes import search_routes
from .api.attachment_routes import attachment_routes
from .api.company_routes import company_routes
from .api.stage_routes import stage_routes
from .api.rack_routes import rack_routes
from .api.pallet_routes import pallet_routes  # Import the pallet_routes blueprint
from .seeds import seed_commands
from .config import Config

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

# Setup login manager
login = LoginManager(app)
login.login_view = 'auth.unauthorized'

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

# Tell flask about our seed commands
app.cli.add_command(seed_commands)

app.config.from_object(Config)
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(vault_routes, url_prefix='/api/vaults')
app.register_blueprint(field_routes, url_prefix='/api/fields')
app.register_blueprint(customers_routes, url_prefix='/api/customers')
app.register_blueprint(warehouse_routes, url_prefix='/api/warehouse')
app.register_blueprint(order_routes, url_prefix='/api/orders')
app.register_blueprint(search_routes, url_prefix='/api/search')
app.register_blueprint(attachment_routes, url_prefix='/api/attachments')
app.register_blueprint(company_routes, url_prefix='/api/companies')
app.register_blueprint(stage_routes, url_prefix='/api/stage')
app.register_blueprint(rack_routes, url_prefix='/api/racks')
app.register_blueprint(pallet_routes, url_prefix='/api/pallets')  # Register the blueprint

db.init_app(app)
Migrate(app, db)

# Application Security
CORS(app)

# Google Drive API setup
SCOPES = ['https://www.googleapis.com/auth/drive.file']
private_key = os.getenv("GOOGLE_CLOUD_PRIVATE_KEY")
if private_key is None:
    raise RuntimeError("GOOGLE_CLOUD_PRIVATE_KEY environment variable is not set")
SERVICE_ACCOUNT_INFO = {
    "type": os.getenv("GOOGLE_CLOUD_TYPE"),
    "project_id": os.getenv("GOOGLE_CLOUD_PROJECT_ID"),
    "private_key_id": os.getenv("GOOGLE_CLOUD_PRIVATE_KEY_ID"),
    "private_key": private_key.replace("\\n", "\n"),
    "client_email": os.getenv("GOOGLE_CLOUD_CLIENT_EMAIL"),
    "client_id": os.getenv("GOOGLE_CLOUD_CLIENT_ID"),
    "auth_uri": os.getenv("GOOGLE_CLOUD_AUTH_URI"),
    "token_uri": os.getenv("GOOGLE_CLOUD_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("GOOGLE_CLOUD_CLIENT_X509_CERT_URL")
}
credentials = service_account.Credentials.from_service_account_info(SERVICE_ACCOUNT_INFO, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=credentials)

@app.before_request
def https_redirect():
    if os.environ.get('FLASK_ENV') == 'production':
        if request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            code = 301
            return redirect(url, code=code)

@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
        samesite='Strict' if os.environ.get(
            'FLASK_ENV') == 'production' else None,
        httponly=True)
    return response

@app.route("/api/docs")
@login_required
def api_help():
    """
    Returns all API routes and their doc strings
    """
    acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    route_list = { rule.rule: [[ method for method in rule.methods if method in acceptable_methods ],
                    app.view_functions[rule.endpoint].__doc__ ]
                    for rule in app.url_map.iter_rules() if rule.endpoint != 'static' }
    return route_list

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def react_root(path):
    """
    This route will direct to the public directory in our
    react builds in the production environment for favicon
    or index.html requests
    """
    if path == 'favicon.ico':
        return app.send_from_directory('public', 'favicon.ico')
    return app.send_static_file('index.html')

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')