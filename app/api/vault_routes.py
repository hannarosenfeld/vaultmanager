from flask import Blueprint, jsonify, request
from flask_login import login_required
from app.models import Customer, Vault, Field, Order, Attachment, Warehouse, db
from app.forms import VaultForm, EditVaultForm
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
import uuid
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

load_dotenv()

vault_routes = Blueprint('vaults', __name__)

def validation_errors_to_error_messages(validation_errors):
    """
    Simple function that turns the WTForms validation errors into a simple list
    """
    errorMessages = []
    for field in validation_errors:
        for error in validation_errors[field]:
            errorMessages.append(f'{field} : {error}')
    return errorMessages

# Google Drive API setup
SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_INFO = {
    "type": os.getenv("GOOGLE_CLOUD_TYPE"),
    "project_id": os.getenv("GOOGLE_CLOUD_PROJECT_ID"),
    "private_key_id": os.getenv("GOOGLE_CLOUD_PRIVATE_KEY_ID"),
    "private_key": os.getenv("GOOGLE_CLOUD_PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("GOOGLE_CLOUD_CLIENT_EMAIL"),
    "client_id": os.getenv("GOOGLE_CLOUD_CLIENT_ID"),
    "auth_uri": os.getenv("GOOGLE_CLOUD_AUTH_URI"),
    "token_uri": os.getenv("GOOGLE_CLOUD_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("GOOGLE_CLOUD_CLIENT_X509_CERT_URL")
}
credentials = service_account.Credentials.from_service_account_info(SERVICE_ACCOUNT_INFO, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=credentials)



@vault_routes.route('/upload', methods=['POST'])
def upload_file():
    """Handles file uploads and sends to Google Drive"""
    try:
        attachment = request.files.get('attachment')
        vault_id = request.form.get('vault_id')

        if not attachment or not vault_id:
            return jsonify({'error': 'Missing file or vault ID'}), 400

        print("Starting file upload to Google Drive...")

        # Save the file temporarily
        file_path = os.path.join('/tmp', secure_filename(attachment.filename))
        attachment.save(file_path)
        print(f"File saved to {file_path}")

        # Google Drive Upload
        file_metadata = {
            'name': attachment.filename,
            'parents': [os.getenv("GOOGLE_DRIVE_FOLDER_ID")]
        }
        media = MediaFileUpload(file_path, mimetype=attachment.content_type)

        # Handle broken pipe by retrying
        retry_attempts = 3
        for attempt in range(retry_attempts):
            try:
                file = drive_service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id'
                ).execute()

                file_id = file.get('id')
                print(f"File uploaded successfully: {file_id}")
                break
            except Exception as e:
                print(f"Upload attempt {attempt + 1} failed: {e}")
                if attempt == retry_attempts - 1:
                    raise e

        # Clean up
        os.remove(file_path)
        print(f"File removed from local storage: {file_path}")

        # Store attachment in DB
        file_url = f'https://drive.google.com/file/d/{file_id}/view'
        new_attachment = Attachment(
            vault_id=vault_id,
            file_name=attachment.filename,
            unique_name=attachment.filename,
            file_url=file_url,
        )

        db.session.add(new_attachment)
        db.session.commit()

        return jsonify({'message': 'File uploaded successfully', 'attachment': new_attachment.to_dict()}), 200

    except Exception as e:
        print(f"Error uploading file: {e}")
        return jsonify({'error': f"Error uploading file: {e}"}), 500
    

@vault_routes.route('/', methods=['POST'])
# @login_required
def add_vault():
    form = VaultForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    
    try:
        if form.validate_on_submit():
            print("❤️ Form data:", form.data)
            customer_name = form.data['customer_name'].upper()
            order_name = form.data['order_name']

            existent_customer = Customer.query.filter_by(name=customer_name).first() if customer_name else None
            existent_order = Order.query.filter_by(name=order_name).first() if order_name else None

            # Get company_id directly from request.form
            company_id = request.form.get('company_id')

            new_vault = Vault(
                name=None if customer_name in ("EMPTY T2", "EMPTY LIFTVAN") else form.data['vault_id'],
                customer_id=existent_customer.id if existent_customer else None,
                field_id=form.data['field_id'],
                order_id=existent_order.id if existent_order else None,
                position=form.data['position'],
                note=form.data['note'],
                empty=form.data['empty'],
                type=form.data['type'],
                company_id=company_id if company_id else None,
            )
            
            db.session.add(new_vault)
            db.session.commit()

            if not existent_customer:
                if customer_name:
                    new_customer = Customer(name=customer_name)
                    db.session.add(new_customer) 
                    db.session.commit()                   
                    new_vault.customer_id = new_customer.id
                    db.session.commit()

            if not existent_order:
                if order_name:
                    new_order = Order(name=order_name)
                    db.session.add(new_order)
                    db.session.commit()
                    new_order.order_vaults.append(new_vault)
                    db.session.commit()

            field = Field.query.get(new_vault.field_id)

            # TODO check conditionally if production or local, if local field.vaults.count() == 1
            if field.type == "couchbox" and field.vaults.count() == 3:
                field.full = True

            # Handle file upload
            attachment = request.files.get('attachment')
            
            print("Attachment:", attachment)

            if attachment:
                # Generate a unique file name
                unique_filename = str(uuid.uuid4()) + secure_filename(attachment.filename)
                file_path = os.path.join('/tmp', unique_filename)
                attachment.save(file_path)
                print(f"File saved to {file_path}")

                # Google Drive Upload
                file_metadata = {
                    'name': unique_filename,
                    'parents': [os.getenv("GOOGLE_DRIVE_FOLDER_ID")]
                }
                media = MediaFileUpload(file_path, mimetype=attachment.content_type)

                # Handle broken pipe by retrying
                retry_attempts = 3
                for attempt in range(retry_attempts):
                    try:
                        file = drive_service.files().create(
                            body=file_metadata,
                            media_body=media,
                            fields='id'
                        ).execute()

                        file_id = file.get('id')
                        print(f"File uploaded successfully: {file_id}")
                        break
                    except Exception as e:
                        print(f"Upload attempt {attempt + 1} failed: {e}")
                        if attempt == retry_attempts - 1:
                            raise e

                # Clean up
                os.remove(file_path)
                print(f"File removed from local storage: {file_path}")

                # Store attachment in DB
                file_url = f'https://drive.google.com/file/d/{file_id}/view'
                new_attachment = Attachment(
                    vault_id=new_vault.id,
                    file_name=attachment.filename,
                    unique_name=unique_filename,
                    file_url=file_url,
                )
                db.session.add(new_attachment)
                db.session.commit()

            # Retrieve the customer name for the response
            customer_name = Customer.query.get(new_vault.customer_id).name if new_vault.customer_id else None
            dict_new_vault = new_vault.to_dict()
            dict_new_vault["customer_name"] = customer_name

            return {"vault": dict_new_vault, "fieldId": field.id}

    except Exception as e:
        print(f"Error in add_vault route: {e}")
        return jsonify({'error': str(e)}), 500

    return jsonify({'errors': validation_errors_to_error_messages(form.errors)}), 400


@vault_routes.route('/move', methods=['PUT'])
# @login_required
def move_vault():
    data = request.get_json()
    vault_id = data.get('vaultId')
    field_id = data.get('fieldId')
    position = data.get('position')

    vault = Vault.query.get(vault_id)
    
    if vault:
        vault.field_id = field_id
        vault.position = position
        db.session.commit()
        return jsonify({
            "vaultId": vault_id,
            "fieldId": field_id,
            "position": position,
            "vault": vault.to_dict()
        })
    else:
        return jsonify({"message": "Vault not found"}), 404
    
    
@vault_routes.route('/all', methods=['GET'])
# @login_required
def get_all_vaults():
    """
    Query for all vaults and return them in a list of vault dictionaries
    """
    vaults = Vault.query.all()
    vaults_with_warehouse = []
    for vault in vaults:
        field = Field.query.get(vault.field_id)
        warehouse_id = field.warehouse_id if field else None
        warehouse = Warehouse.query.get(warehouse_id) if warehouse_id else None
        vault_dict = vault.to_dict()
        vault_dict['warehouse_name'] = warehouse.name if warehouse else None
        vault_dict['field_id'] = "staged" if vault.field_id is None else vault.field_id
        vault_dict['field_name'] = field.name if field else "staged"
        vaults_with_warehouse.append(vault_dict)
        
    return jsonify(vaults_with_warehouse)

@vault_routes.route('/<int:id>', methods=['GET', 'PUT'])
# @login_required
def manage_vault(id):
    """
    Query for a vault by id and manage it (GET, PUT)
    """
    vault = Vault.query.get(id)

    if not vault:
        return {'errors': 'Vault not found'}, 404

    if request.method == 'GET':
        return vault.to_dict()

    if request.method == 'PUT':
        form = EditVaultForm()
        form['csrf_token'].data = request.cookies['csrf_token']
            

        if form.validate_on_submit():
            if form.data['staging']:
                field_id = vault.field_id
                vault.field_id = None
                vault.position = None
                field = Field.query.get(field_id)

                db.session.commit()
                return {'vault': vault.to_dict(), 'field': field.to_dict()}
            
            
            if form.data['customer_name'] == "EMPTY LIFTVAN" or form.data['customer_name'] == "EMPTY T2":
                vault.name = None

            else: vault.name = form.data['name']
                
            vault.note = form.data['note']

            # Check if customer exists, if not, create a new customer
            customer_name = form.data['customer_name']
            existent_customer = Customer.query.filter_by(name=customer_name).first()
            if not existent_customer:
                new_customer = Customer(name=customer_name)
                db.session.add(new_customer)
                db.session.commit()
                vault.customer_id = new_customer.id
            else:
                vault.customer_id = existent_customer.id

            # Update order
            if "EMPTY" in customer_name.upper():
                vault.order_id = None  # Clear order_id when empty
            else:
                order_name = form.data['order_name']
                existent_order = Order.query.filter_by(name=order_name).first()
                if not existent_order:
                    new_order = Order(name=order_name)
                    db.session.add(new_order)
                    db.session.commit()
                    vault.order_id = new_order.id
                else:
                    vault.order_id = existent_order.id

            db.session.commit()

            # Handle file uploads
            for key, value in request.files.items():
                if key.startswith('attachment'):
                    attachment = value

                    response = upload_file()
                    if response.status_code != 200:
                        return response

            db.session.commit()
            return vault.to_dict()
        else:
            return jsonify({'errors': validation_errors_to_error_messages(form.errors)}), 400

    
@vault_routes.route('/<int:id>', methods=['DELETE'])
# @login_required
def delete_vault(id):
    """
    Delete a vault by id and all its attachments
    """
    vault = Vault.query.get(id)
    
    if not vault:
        return {'errors': 'Vault not found'}, 404
    
    if vault.field_id == None:
        try:
            # Delete all attachments
            attachments = Attachment.query.filter_by(vault_id=id).all()
            for attachment in attachments:
                db.session.delete(attachment)
            
            db.session.delete(vault)
            db.session.commit()
            print(f"Vault {id} deleted successfully from stage")
            return jsonify({'vaultId': id, "deleteFrom": "stage"})
        except Exception as e:
            print(f"Error deleting vault from stage: {e}")
            return jsonify({'error': str(e)}), 500
    
    field = Field.query.get(vault.field_id)

    if field:
        field.full = False
        
    customer = Customer.query.get(vault.customer_id)
    order = Order.query.get(vault.order_id)   

    try:
        # Delete all attachments
        attachments = Attachment.query.filter_by(vault_id=id).all()
        for attachment in attachments:
            db.session.delete(attachment) 
                
        # Check if the customer has any other vaults
        if customer and len(customer.vaults) == 1:
            db.session.delete(customer)

        # Check if the order has any other vaults
        if order and len(order.order_vaults) == 1:
            db.session.delete(order)
                        
        db.session.delete(vault)
        db.session.commit()
        
        warehouse = Warehouse.query.get(field.warehouse_id)
        
        print(f"Vault {id} deleted successfully")
        return jsonify({'warehouse': warehouse.to_dict(), 'field': field.to_dict(), 'vaultId': id})
    except Exception as e:
        print(f"Error deleting vault: {e}")
        return jsonify({'error': str(e)}), 500