from flask_wtf import FlaskForm
from wtforms import StringField, BooleanField, TextAreaField

class EditVaultForm(FlaskForm):
    customer_name = StringField('customer_name')
    name = StringField('name')
    order_name = StringField('order_name')
    attachment_to_delete = StringField('attachment_to_delete')
    staging = BooleanField('staging')
    note = TextAreaField('note')    