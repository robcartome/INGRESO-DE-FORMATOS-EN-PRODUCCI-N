from flask import Blueprint, render_template

home = Blueprint('home', __name__)

@home.route('/', methods=['GET'])
def principal():
    return render_template('home.html')