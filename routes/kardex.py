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

            query_kardex_cerrado = "SELECT * FROM v_kardex WHERE estado = 'CERRADO'"
            v_kardex_cerrado = execute_query(query_kardex_cerrado)

            query_proveedores = "SELECT * FROM proveedores"
            proveedor = execute_query(query_proveedores)

            return render_template('kardex.html', productos=productos, v_kardex=v_kardex, proveedor=proveedor, v_kardex_cerrado=v_kardex_cerrado)
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
        query_detalles = "SELECT * FROM detalle_kardex WHERE fk_idkardex = %s"
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

    
def obtener_iniciales(cadena):
    palabras = cadena.split()  # Divide la cadena en palabras
    iniciales = ''.join([palabra[0] for palabra in palabras if palabra.isalpha()])  # Toma la primera letra de cada palabra
    return iniciales.upper()  # Convierte las iniciales a mayúsculas
    
@kardex.route('/registrar_lote_kardex', methods=['POST'])
def registrar_lote_kardex():
    try:
        fecha_actual = datetime.now()

        # Extracción de los datos del formulario
        id_kardex = request.form['idkardex']
        producto = request.form['descripcion_producto']
        fecha = request.form['fecha']
        dias = request.form['dias']
        proveedor = request.form['proveedor']
        saldo_inicial = request.form['saldo_inicial']
        ingreso = request.form['ingreso']
        salida = request.form['salida']
        observaciones = request.form['observaciones']

        # Validación de datos
        if not all([id_kardex, producto, fecha, dias, proveedor, saldo_inicial, ingreso, salida]):
            return jsonify({'status': 'error', 'message': 'Todos los campos son obligatorios.'}), 400
        
        # Convertir a números si es necesario
        saldo_inicial = float(saldo_inicial)
        ingreso = float(ingreso)
        salida = float(salida)

        saldo_final = saldo_inicial + ingreso - salida

        if not observaciones:
            observaciones = "-"

        # Generación del lote
        anio_actual = fecha_actual.year
        lote = f"LT{dias}{str(anio_actual)[-2:]}{obtener_iniciales(proveedor)}{obtener_iniciales(producto)}"

        # Suponiendo que tienes una función 'execute_query' definida para manejar la base de datos
        query_insert_detalle_kardex = """
            INSERT INTO detalles_kardex 
            (fecha, lote, saldo_inicial, ingreso, salida, saldo_final, observaciones, fk_idkardex) 
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """
        execute_query(query_insert_detalle_kardex, (fecha, lote, saldo_inicial, ingreso, salida, saldo_final, observaciones, id_kardex))

        return jsonify({'status': 'success', 'message': 'Se registró el producto correctamente.'}), 200

    except Exception as e:
        print(f"Error al agregar detalle de kardex: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar el producto.'}), 500
    
@kardex.route('/detalle_kardex_table/<int:id_kardex>', methods=['GET'])
def detalle_kardex_table(id_kardex):
    query_detalle_kardex = "SELECT * FROM detalles_kardex WHERE fk_idkardex = %s"
    detalle_kardex = execute_query(query_detalle_kardex, (id_kardex,))

    # Convertir la fecha al formato deseado antes de enviarlo al frontend
    detalles_formateados = []
    for detalle in detalle_kardex:
        detalle['fecha'] = detalle['fecha'].strftime('%d/%m/%Y')  # Formatear la fecha a DD/MM/YYYY
        detalles_formateados.append(detalle)

    return jsonify(detalles_formateados)


@kardex.route('/descargar_formato_kardex/<int:id_kardex>', methods=['GET'])
def descargar_formato_kardex(id_kardex):
    id_kardex = int(id_kardex)
    
    # Consulta para obtener el kardex
    query_kardex = "SELECT * FROM v_kardex WHERE idkardex = %s"
    kardex = execute_query(query_kardex, (id_kardex,))
    
    # Consulta para obtener los detalles del kardex
    query_detalle_kardex = "SELECT * FROM detalles_kardex WHERE fk_idkardex = %s"
    detalle_kardex = execute_query(query_detalle_kardex, (id_kardex,))

    # Formatear la fecha en los detalles
    detalles_formateados = []
    for detalle in detalle_kardex:
        detalle['fecha'] = detalle['fecha'].strftime('%d/%m/%Y')  # Formato DD/MM/YYYY
        detalles_formateados.append(detalle)

    print(kardex, detalles_formateados)

    # Empaquetar ambos resultados en un solo diccionario
    return jsonify({'kardex': kardex, 'detalles': detalles_formateados})

@kardex.route('/finalizar_kardex', methods=['POST'])
def finalizar_kardex():
    try:
        # Extracción de los datos del formulario
        id_kardex = request.form['idKardex']

        query_update_estado_kardex = "UPDATE kardex SET estado = %s WHERE idkardex = %s"
        execute_query(query_update_estado_kardex,('CERRADO', id_kardex))

        return jsonify({'status': 'success', 'message': 'Se finalizo correctamente el Kardex'}), 200

    except Exception as e:
        print(f"Error al agregar detalle de kardex: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar el producto.'}), 500