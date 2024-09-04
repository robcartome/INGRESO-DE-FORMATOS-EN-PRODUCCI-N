from flask import Blueprint, render_template, request, jsonify, send_file
from connection.database import execute_query
from datetime import datetime

kardex = Blueprint('kardex', __name__)

@kardex.route('/', methods=['GET', 'POST'])
def kardex_info():
    if request.method == 'GET':
        try:
            # Obtener a los trabajadores
            query_productos = "SELECT * FROM productos"
            productos = execute_query(query_productos)

            query_kardex = "SELECT * FROM v_kardex WHERE estado = 'CREADO'"
            v_kardex = execute_query(query_kardex)

            query_proveedores = "SELECT * FROM proveedores"
            proveedor = execute_query(query_proveedores)

            return render_template('kardex.html', productos=productos, v_kardex=v_kardex, proveedor=proveedor)
        except Exception as e:
            print(f"Error al obtener datos: {e}")
            return render_template('kardex.html')
    elif request.method == 'POST':
        try:
            producto = request.form.get('selectProducto')
            fecha_actual = datetime.now()

            mes_actual = fecha_actual.month
            anio_actual = fecha_actual.year
            
            query_crear_formato = """
                INSERT INTO kardex(mes, anio, estado, fk_idproducto, fk_idtipoformatos)
                VALUES (%s, %s, %s, %s, %s)
            """
            execute_query(query_crear_formato, (mes_actual, anio_actual, 'CREADO', producto, 3))

            return jsonify({'status': 'success', 'message': 'Kardex creado correctamente.'}), 200

        except Exception as e:
            print(f"Error al crear el kardex: {e}")
            return jsonify({'status': 'error', 'message': 'Ocurrió un error al crear el kardex.'}), 500
        
@kardex.route('/agregar_producto', methods = ['POST'])
def agregar_producto():
    try:
        detalle_producto = request.form.get('descripcionProducto')
        print(detalle_producto)

        query_insert_product = "INSERT INTO productos (descripcion_producto) VALUES (%s)"
        execute_query(query_insert_product, (detalle_producto,))

        return jsonify({'status': 'success', 'message': 'Se registro el producto correctamente.'}), 200

    except Exception as e:
        print(f"Error al agregar un producto: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error registrar el producto.'}), 500 
    
@kardex.route('/detalles_kardex/<int:id_kardex>', methods=['GET'])
def detalles_kardex(id_kardex):
    try:
        query_detalles = "SELECT * FROM detalles_kardex WHERE fk_idkardex = %s"
        detalles = execute_query(query_detalles, (id_kardex,))

        detalles_json = []
        for detalle in detalles:
            detalles_json.append({
                'fecha': detalle['fecha'],
                'lote': detalle['lote'],
                'saldo_inicial': detalle['saldo_inicial'],
                'ingreso': detalle['ingreso'],
                'salida': detalle['salida'],
                'saldo_final': detalle['saldo_final'],
                'observaciones': detalle['observaciones']
            })

        return jsonify(detalles_json), 200

    except Exception as e:
        print(f"Error al obtener los detalles del kardex: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al obtener los detalles del kardex.'}), 500