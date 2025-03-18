from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired

class CustomerForm(FlaskForm):
    name = StringField('customer_name', validators=[DataRequired()])