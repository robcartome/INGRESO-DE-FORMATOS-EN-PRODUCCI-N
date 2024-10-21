from flask import Blueprint, render_template

from connection.database import execute_query

home = Blueprint('home', __name__)

@home.route('/', methods=['GET'])
def principal():
    productos = execute_query("""SELECT 
                                    ROW_NUMBER() OVER (ORDER BY idproducto) AS contador,
                                    *
                                FROM productos
                                ORDER BY idproducto;""")
    
    return render_template('home.html', productos = productos)