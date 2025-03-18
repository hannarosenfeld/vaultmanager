from flask import Blueprint, jsonify, request
from app.models import db, Vault, Attachment
import os
from dotenv import load_dotenv
import boto3
import botocore
import uuid
from werkzeug.utils import secure_filename
from app.forms import EditVaultForm

load_dotenv()


attachment_routes = Blueprint('attachments', __name__)

@attachment_routes.route('/<int:vaultId>')
def get_all_vault_attachments(vaultId):
    vault = Vault.query.get(vaultId)
    attachments = vault.attachments

    return { attachment.id : attachment.to_dict() for attachment in attachments }


@attachment_routes.route('/<int:vaultId>/<int:attachmentId>', methods=['DELETE'])
def delete_attachment(vaultId, attachmentId):
    vault = Vault.query.get(vaultId)
    form = EditVaultForm()

    attachment = next((a for a in vault.attachments if a.id == attachmentId), None)
    attachment_unique_name = form.data['attachment_to_delete']

    if attachment_unique_name:
        # Perform the logic to delete the attachment (e.g., remove from database or storage)
        aws_access_key_id = os.getenv('AWS_ACCESS_KEY')
        aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        s3_bucket_name = os.getenv('AWS_BUCKET_NAME')
        
        # Delete the file from AWS S3
        s3 = boto3.client('s3', aws_access_key_id=aws_access_key_id, aws_secret_access_key=aws_secret_access_key)
        s3_key = f'attachments/{attachment_unique_name}'
        s3.delete_object(Bucket=s3_bucket_name, Key=s3_key)
        
        # Remove the attachment from the database
        vault.attachments.remove(attachment)
        db.session.delete(attachment)        
        db.session.delete(attachment)
        db.session.commit()

    else:
        print("💖 Attachment not found")

    return {'message': 'Attachment deleted successfully'}