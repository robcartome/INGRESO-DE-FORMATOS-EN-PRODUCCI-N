import os

from flask import Blueprint, render_template, request, jsonify
from connection.database import execute_query
from .utils.constans import BPM
from .utils.helpers import image_to_base64
from .utils.helpers import generar_reporte
from .utils.helpers import get_cabecera_formato
from .utils.helpers import get_ultimo_dia_laboral_del_mes
from datetime import datetime

########## PARA REGISTRO Y CONTROL DE ENVASADOS ###################################################################################

controlEnvasados = Blueprint('control_envasados', __name__)

@controlEnvasados.route('/', methods=['GET'])
def control_envasados():
    try:
        # Obtener datos principales
        control_envasados_creado = execute_query("SELECT * FROM registros_controles_envasados WHERE estado = 'CREADO'")
        responsable_envasado = execute_query("SELECT * FROM trabajadores WHERE estado_trabajador = 'ACTIVO'")
        producto_envasado = execute_query("SELECT * FROM productos")
        proveedores_envasado = execute_query("SELECT idproveedor, nom_empresa FROM proveedores")
        detalle_control_envasados = execute_query("SELECT * FROM v_registros_controles_envasados WHERE estado = 'CREADO'")

        page = request.args.get('page', 1, type=int)
        per_page = 5
        offset = (page - 1) * per_page

        # Carga y paginación de registros sin filtro de fecha
        query_count = """
            SELECT COUNT(*) AS total
            FROM (SELECT DISTINCT mes, anio 
                FROM v_historial_registros_controles_envasados 
                WHERE estado = 'CERRADO') AS distinct_months_years;
        """
        
        query_finalizados_envasados = f"""
            SELECT 
                month_name, 
                anio,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id_registro_control_envasados', id_registro_control_envasados,
                        'fecha', fecha
                    )
                ) AS registros
            FROM 
                v_historial_registros_controles_envasados
            GROUP BY 
                month_name, mes, anio
            ORDER BY 
                anio DESC, 
                mes DESC
            LIMIT {per_page} OFFSET {offset}
        """
        total_count = execute_query(query_count)[0]['total']
        total_pages = (total_count + per_page - 1) // per_page
        finalizados_envasados = execute_query(query_finalizados_envasados)

        return render_template('registro_control_envasados.html', 
                                control_envasados_creado=control_envasados_creado,
                                responsable_envasado=responsable_envasado,
                                producto_envasado=producto_envasado,
                                proveedores_envasado=proveedores_envasado,
                                detalle_control_envasados=detalle_control_envasados,
                                finalizados_envasados=finalizados_envasados,
                                page=page,
                                total_pages=total_pages)
    except Exception as e:
        print(f"Error al obtener datos: {e}")
        return render_template('registro_control_envasados.html')

@controlEnvasados.route('/filtrar_por_fecha', methods=['POST'])
def filtrar_por_fecha():
    try:
        # Leer fecha desde JSON
        data = request.get_json()
        filter_fecha = data.get('fecha_filtrar')

        if filter_fecha:
            fecha_format = datetime.strptime(filter_fecha, '%Y-%m-%d').strftime('%d/%m/%Y')
            query_finalizados_envasados = f"SELECT * FROM v_historial_registros_controles_envasados WHERE fecha = '{fecha_format}'"
            finalizados_envasados = execute_query(query_finalizados_envasados)

            # Retornar la tabla en un template parcial solo si es una solicitud AJAX
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return render_template('partials/tabla_historial_envasados.html', finalizados_envasados=finalizados_envasados)
        
        # Si no hay una fecha específica, retornar una tabla vacía
        return render_template('partials/tabla_historial_envasados.html', finalizados_envasados=[])

    except Exception as e:
        print(f"Error al procesar la solicitud de filtrado: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al filtrar los datos.'}), 500


@controlEnvasados.route('/registro_control_envasados_reg', methods=['POST'])
def registro_control_envasados_reg():
    try:
        # Obtener datos del JSON de la solicitud
        data = request.get_json()
        responsable = data.get('selectResponsable')
        producto = data.get('selectProducto')
        cantidadProducida = data.get('cantidadProducida')
        Proveedor = data.get('selectProveedor')
        loteProveedor = data.get('loteProveedor')
        loteAsignado = data.get('loteAsignado')
        fechaVencimiento = data.get('fechaVencimiento')
        observacionesEnvasados = data.get('observacionesEnvasados', '-')

        # Log de los datos para verificar
        print(responsable, producto, cantidadProducida, Proveedor, loteProveedor, loteAsignado, fechaVencimiento, observacionesEnvasados)

        # Verificar si hay un formato 'CREADO' para el tipo de formato 5
        query_formatos = "SELECT id_registro_control_envasados FROM registros_controles_envasados WHERE fk_idtipoformatos = 5 AND estado = 'CREADO'"
        registroEnvasado = execute_query(query_formatos)

        if not registroEnvasado:
            return jsonify({'status': 'error', 'message': 'No se encontró un formato válido para registrar el registro de control de envasados.'}), 400

        try:
            # Verificar si existe el kardex del producto
            verify_creation_kardex = execute_query("SELECT idkardex FROM kardex WHERE fk_idproducto = %s AND estado = 'CREADO'", (producto,))
            if verify_creation_kardex:
                # Insertar control de envasados
                query_insertar_controles_envasados = """ 
                    INSERT INTO detalles_registros_controles_envasados (fk_idtrabajador, fk_idproducto, cantidad_producida, 
                                                                        fk_idproveedor, lote_proveedor, lote_asignado, fecha_vencimiento, 
                                                                        observacion, fk_id_registro_control_envasado) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                """
                
                execute_query(query_insertar_controles_envasados, (responsable, producto, cantidadProducida, Proveedor, loteProveedor, loteAsignado, fechaVencimiento, observacionesEnvasados, registroEnvasado[0]['id_registro_control_envasados']))
                
                # Actualizar el stock
                stock_anterior_product = execute_query("SELECT stock FROM productos WHERE idproducto = %s", (producto,))
                stock = stock_anterior_product[0]['stock']
                stock_actual = stock + int(cantidadProducida)
                execute_query("UPDATE productos SET stock = %s WHERE idproducto = %s", (stock_actual, producto))

                # Insertar en kardex
                query_kardex = "SELECT idkardex FROM kardex WHERE fk_idproducto = %s AND estado = 'CREADO'"
                kardex = execute_query(query_kardex, (producto,))
                id_kardex = kardex[0]['idkardex']

                fecha_ingreso = execute_query("SELECT fecha FROM registros_controles_envasados WHERE estado = 'CREADO'")
                fecha_kardex = fecha_ingreso[0]['fecha']

                query_insert_kardex = "INSERT INTO detalles_kardex (fecha, lote, saldo_inicial, ingreso, salida, saldo_final, observaciones, fk_idkardex) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
                execute_query(query_insert_kardex, (fecha_kardex, loteAsignado, stock, cantidadProducida, 0, stock_actual, observacionesEnvasados, id_kardex))
            else:
                return jsonify({'status': 'error', 'message': 'Cree el kardex de este producto antes de realizar el ingreso de control de envasados.'}), 400
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

        return jsonify({'status': 'success', 'message': 'Control de envasados registrado.'}), 200

    except Exception as e:
        print(f"Error al procesar la solicitud POST: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar el control de envasados.'}), 500



@controlEnvasados.route('/generar_formato_envasados', methods=['POST'])
def generar_formato_envasados():
    try:
        data = request.json
        fecha_actual = data.get('fechaCreacion')

        # Eliminar el registro relacionado en controles_generales_personal
        query_generar_formato = """
            INSERT INTO registros_controles_envasados(fecha,fk_idtipoformatos,estado) VALUES  (%s,%s,%s);
        """
        
        execute_query(query_generar_formato, (fecha_actual,5,'CREADO'))

        return jsonify({'status': 'success', 'message': 'Se genero el registro.'}), 200

    except Exception as e:
        print(f"Error al generar el formato: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al generar el formato.'}), 500
    
@controlEnvasados.route('/finalizar_Control_Envasados', methods=['POST'])
def finalizar_Control_Envasados():
    try:
        #Actualizar el estado de "CREADO" a "CERRADO"
        execute_query("UPDATE registros_controles_envasados SET estado = 'CERRADO' WHERE estado = 'CREADO'")
        # Enviar los detalles de vuelta al frontend
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        print(f"Error al finalizar: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al finalizar el control de envasados.'}), 500
    
@controlEnvasados.route('/obtener_detalle_envasados/<int:id_formatos>', methods=['GET'])
def obtener_detalle_envasados(id_formatos):
    try:
        # Ejecutar la consulta SQL para obtener los detalles
        query = "SELECT * FROM v_registros_controles_envasados WHERE id_registro_control_envasados = %s"
        detalles = execute_query(query, (id_formatos,))

        # Verificar si se encontraron resultados
        if not detalles:
            return jsonify({'status': 'error', 'message': 'No se encontraron detalles para el registro.'}), 404

        # Enviar los detalles de vuelta al frontend
        return jsonify({'status': 'success', 'detalles': detalles}), 200

    except Exception as e:
        print(f"Error al obtener los detalles: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al obtener los detalles.'}), 500
    

@controlEnvasados.route('/download_formato', methods=['GET'])
def download_formato():

    # Obtener el id del trabajador de los argumentos de la URL
    formato_lavado_id = request.args.get('formato_id')
    cabecera = get_cabecera_formato("registros_controles_envasados", formato_lavado_id)

    #Realizar la consulta para todos los registros y controles de envasados finalizados
    registros_controles_envasados = execute_query(f"SELECT * FROM registros_controles_envasados WHERE id_registro_control_envasados = {formato_lavado_id}")

    # Realizar la consulta para el detalle de todos los registros y controles de envasados finalizados
    detalle_registros_controles_envasados = execute_query(f"SELECT * FROM v_registros_controles_envasados WHERE id_registro_control_envasados = {formato_lavado_id}")

    # Crear info para el Template
    info={}
    info['fecha'] = registros_controles_envasados[0]['fecha'].strftime('%d/%m/%Y')
    info['detalle'] = detalle_registros_controles_envasados

    # Generar Template para reporte
    logo_path = os.path.join('static', 'img', 'logo.png')
    logo_base64 = image_to_base64(logo_path)
    title_report=cabecera[0]['nombreformato']

    # Renderiza la plantilla
    template = render_template(
        "reports/reporte_registro_control_envasados.html",
        title_manual=BPM,
        title_report=title_report,
        format_code_report=cabecera[0]['codigo'],
        frecuencia_registro=cabecera[0]['frecuencia'],
        logo_base64=logo_base64,
        info=info,
        fecha_periodo=get_ultimo_dia_laboral_del_mes()
    )

    file_name=f"{title_report}"
    return generar_reporte(template, file_name)

@controlEnvasados.route('/historial', methods=['GET'])
def historial_control_envasados():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = 5
        offset = (page - 1) * per_page

        # Carga y paginación de registros sin filtro de fecha
        query_count = """
            SELECT COUNT(*) AS total
            FROM (SELECT DISTINCT mes, anio 
                FROM v_historial_registros_controles_envasados 
                WHERE estado = 'CERRADO') AS distinct_months_years;
        """
        
        query_finalizados_envasados = f"""
            SELECT 
                month_name, 
                anio,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id_registro_control_envasados', id_registro_control_envasados,
                        'fecha', fecha
                    )
                ) AS registros
            FROM 
                v_historial_registros_controles_envasados
            GROUP BY 
                month_name, mes, anio
            ORDER BY 
                anio DESC, 
                mes DESC
            LIMIT {per_page} OFFSET {offset}
        """
        total_count = execute_query(query_count)[0]['total']
        total_pages = (total_count + per_page - 1) // per_page
        finalizados_envasados = execute_query(query_finalizados_envasados)

        return render_template('partials/historial_control_envasados.html', 
                                finalizados_envasados=finalizados_envasados,
                                page=page,
                                total_pages=total_pages)
    except Exception as e:
        print(f"Error al obtener datos: {e}")
        return jsonify({"error": "Error al obtener datos"}), 500
