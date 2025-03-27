from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, TextAreaField, BooleanField
from flask_wtf.file import FileField
from wtforms.validators import DataRequired

class VaultForm(FlaskForm):
    customer_name = StringField('customer_name')
    field_id = IntegerField('field_id', validators=[DataRequired()])
    position = StringField('position', validators=[DataRequired()])
    vault_id = StringField('vault_id')
    order_name= StringField('order_name')
    attachment = FileField('attachment')
    note = TextAreaField('note')
    empty = BooleanField('empty')
    type = StringField('type')