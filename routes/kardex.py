import os

from flask import Blueprint, render_template, request, jsonify, send_file
from connection.database import execute_query
from datetime import datetime
from .utils.constans import BPM
from .utils.helpers import image_to_base64
from .utils.helpers import generar_reporte
from .utils.helpers import get_cabecera_formato

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

            return render_template('kardex.html', productos=productos, v_kardex=v_kardex, v_kardex_cerrado=v_kardex_cerrado)
        except Exception as e:
            print(f"Error al obtener datos: {e}")
            return render_template('kardex.html')
    elif request.method == 'POST':
        try:
            producto = request.form.get('selectProducto')
            fecha_actual = datetime.now()

            mes_actual = fecha_actual.month
            anio_actual = fecha_actual.year

            mes_consultar = str(mes_actual)
            anio_consultar = str(anio_actual)
            
            consult_product_kardex_month =  "SELECT * FROM kardex WHERE mes = %s AND anio = %s AND fk_idproducto = %s AND estado = 'CREADO'" 
            verificar_producto = execute_query(consult_product_kardex_month, (mes_consultar, anio_consultar, producto,))
            
            if not verificar_producto:
                query_crear_formato = """
                    INSERT INTO kardex(mes, anio, estado, fk_idproducto, fk_idtipoformatos)
                    VALUES (%s, %s, %s, %s, %s)
                """
                execute_query(query_crear_formato, (mes_actual, anio_actual, 'CREADO', producto, 3))

                return jsonify({'status': 'success', 'message': 'Kardex creado correctamente.'}), 200
            else:
                return jsonify({'status': 'error', 'message': 'El kardex para este producto ya existe para este mes.'}), 500
        except Exception as e:
            print(f"Error al crear el kardex: {e}")
            return jsonify({'status': 'error', 'message': 'Ocurrió un error al crear el kardex.'}), 500

@kardex.route('/get_stock', methods=['POST'])
def get_stock():
    try:
        # Obtener el JSON enviado desde el frontend
        data = request.get_json()
        
        # Asegurarse de que el idkardex esté presente en los datos
        if 'idkardex' not in data:
            return jsonify({'status': 'error', 'message': 'idkardex no proporcionado.'}), 400

        idkardex = data['idkardex']

        # Consulta para obtener el stock asociado al idkardex
        query_stock = """
            SELECT stock 
            FROM productos 
            WHERE idproducto = (
                SELECT fk_idproducto 
                FROM public.kardex 
                WHERE idkardex = %s
            )
        """
        result = execute_query(query_stock, (idkardex,))
        stock = result[0]['stock'] if result else 0

        # Retornar el stock en formato JSON
        return jsonify({'status': 'success', 'stock': stock}), 200

    except Exception as e:
        print(f"Error al obtener el stock: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al obtener el stock.'}), 500


@kardex.route('/agregar_producto', methods = ['POST'])
def agregar_producto():
    try:
        detalle_producto = request.form.get('descripcionProducto')
        stock_producto = request.form.get('stockProducto')

        query_insert_product = "INSERT INTO productos (descripcion_producto,stock) VALUES (%s,%s)"
        execute_query(query_insert_product, (detalle_producto,stock_producto,))

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

    
@kardex.route('/registrar_lote_kardex', methods=['POST'])
def registrar_lote_kardex():
    try:
        data = request.json
        # Extracción de los datos del formulario
        id_kardex = data['idkardex']
        fecha = data['fecha']
        lote = data['lote']
        saldo_inicial = data['saldo_inicial']
        ingreso = data['ingreso']
        salida = data['salida']
        observaciones = data['observaciones']

        # Validación de datos
        if not all([id_kardex, fecha, lote, saldo_inicial, ingreso]):
            return jsonify({'status': 'error', 'message': 'Todos los campos son obligatorios.'}), 400
        
        # Convertir a números si es necesario
        saldo_inicial = float(saldo_inicial)
        ingreso = float(ingreso)
        salida = float(salida)

        saldo_final = saldo_inicial + ingreso - salida

        if not observaciones:
            observaciones = "-"

        query_update_stock = "UPDATE productos SET stock = %s WHERE idproducto = (SELECT fk_idproducto FROM kardex WHERE idkardex = %s)"
        execute_query(query_update_stock, (saldo_final,id_kardex))

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
    query_detalle_kardex = "SELECT * FROM detalles_kardex WHERE fk_idkardex = %s ORDER BY iddetallekardex DESC"
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

    cabecera = get_cabecera_formato("kardex", id_kardex)

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

    # Generar Template para reporte
    logo_path = os.path.join('static', 'img', 'logo.png')
    logo_base64 = image_to_base64(logo_path)
    title_report=cabecera[0]['nombreformato']

    # Renderiza la plantilla de Kardex
    template = render_template(
        "reports/reporte_kardex.html",
        title_manual=BPM,
        title_report=title_report,
        format_code_report=cabecera[0]['codigo'],
        frecuencia_registro=cabecera[0]['frecuencia'],
        logo_base64=logo_base64,
        info=detalles_formateados,
        kardex=kardex[0]
    )

    file_name=f"{title_report} - {kardex[0]['mes']} - {kardex[0]['descripcion_producto']}"
    return generar_reporte(template, file_name)


@kardex.route('/finalizar_kardex', methods=['POST'])
def finalizar_kardex():
    try:
        # Extracción de los datos del formulario
        data = request.json
        id_kardex = data['idKardex']

        query_update_estado_kardex = "UPDATE kardex SET estado = %s WHERE idkardex = %s"
        execute_query(query_update_estado_kardex,('CERRADO', id_kardex))
        return jsonify({'status': 'success', 'message': 'Se finalizo correctamente el Kardex'}), 200

    except Exception as e:
        print(f"Error al agregar detalle de kardex: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar el producto.'}), 500