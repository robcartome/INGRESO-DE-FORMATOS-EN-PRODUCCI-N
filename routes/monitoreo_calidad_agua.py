from flask import Blueprint, render_template, request, jsonify, send_file
from connection.database import execute_query
from datetime import datetime
from auth.auth import login_require


monitoreoAgua = Blueprint('monitoreoAgua', __name__)

@monitoreoAgua.route('/')
@login_require
def monitoreo_agua():
    try:
        # Obtener el formato creado con el id de formato 11
        formato_MCA = execute_query("SELECT * FROM public.headers_formats WHERE estado = 'CREADO' AND fk_idtipoformatos = 13")
        
        #Tipos de controles de calidad del agua
        tipos_controles = execute_query("SELECT * FROM tipos_controles_calidad_agua")
        
        #Obtener los detalles del formato registrados
        detalles = execute_query("SELECT * FROM v_detalles_monitoreos_calidad_agua WHERE estado = 'CREADO'")
        
        #Paginador
        page = request.args.get('page', 1, type=int)
        per_page = 5
        offset = (page - 1) * per_page
        
        # Obtener los parámetros de mes y año desde la URL
        filter_date = request.args.get('date', None)
        
        # Construir condiciones de filtro
        filter_conditions = "WHERE estado = 'CERRADO'"
        if  filter_date:
            # Si hay filtro de mes y año, solo obtenemos registros que coincidan
            filter_conditions += f" AND fecha = '{filter_date}'"
            limit_offset_clause = ""  # Sin paginación cuando hay un filtro
        else:
            # Usar paginación si no hay filtro de fecha
            limit_offset_clause = f" LIMIT {per_page} OFFSET {offset}"
        
        #Obtener el detalle de regisitros finalizados
        query_finalizados = f"""
                            SELECT
                                fecha,
                                estado,
                                json_agg(
                                    json_build_object(
                                        'iddetalle_monitoreo_calidad_agua', iddetalle_monitoreo_calidad_agua,
                                        'detalle_control', detalle_control,
                                        'unidad', unidad,
                                        'detection_limit', detection_limit,
                                        'resultado', resultado
                                    )
                                ) AS registros
                            FROM v_detalles_monitoreos_calidad_agua
                            {filter_conditions}
                            GROUP BY fecha, estado
                            ORDER BY fecha
                            {limit_offset_clause}"""
        
        finalizados = execute_query(query_finalizados)
        
        print(finalizados)
        
        # Si no hay filtro de fecha, contar el total de páginas
        if not filter_date:
            query_count = """SELECT COUNT(*) AS total
                            FROM (SELECT DISTINCT fecha 
                                FROM v_detalles_monitoreos_calidad_agua
                                WHERE estado = 'CERRADO') AS distinct_date;"""
            
            total_count = execute_query(query_count)[0]['total']
            total_pages = (total_count + per_page - 1) // per_page
        else:
            total_pages = 1  # Solo una "página" si estamos en modo de filtro
        
        return render_template('monitoreo_calidad_agua.html', 
                                formato_MCA=formato_MCA,
                                tipos_controles=tipos_controles,
                                detalles=detalles,
                                finalizados=finalizados,
                                page=page,
                                total_pages=total_pages)

    except Exception as e:
        print(f"Error al obtener datos: {e}")
        return render_template('monitoreo_agua.html')
    
#Función para generar el formato de monitoreo de la calidad de agua
@monitoreoAgua.route('/generar_formato_MCA', methods=['POST'])
def generar_formato_MCA():
    try:
        data = request.get_json()  # Cambiar a recibir JSON
        laboratorio = data.get('laboratorio')
        fecha = data.get('dateCreation')  # Asegurar que coincida con el nombre del cliente
        
        print(laboratorio, fecha)
        
        fecha_actual = datetime.now()
        mes_actual = fecha_actual.month
        anio_actual = fecha_actual.year

        execute_query("INSERT INTO headers_formats(mes, anio, fk_idtipoformatos, estado, laboratorio, fecha) VALUES (%s,%s,%s,%s,%s,%s)", 
                        (mes_actual, anio_actual, 13, 'CREADO', laboratorio, fecha))
        
        return jsonify({'status': 'success', 'message': 'Formato generado.'}), 200
    except Exception as e:
        print(f"Error al generar el formato: {e}")
        return jsonify({'status': 'error', 'message': 'No se pudo generar el formato.'}), 500


@monitoreoAgua.route('/guardar_formato_calidad_agua', methods=['POST'])
def guardar_formato_calidad_agua():
    try:
        cambios = request.get_json()
        print(cambios)
        #Obtener el formato activo
        formato_activo = execute_query("SELECT * FROM public.headers_formats WHERE estado = 'CREADO' AND fk_idtipoformatos = 13")
        id_headers_formats = formato_activo[0]['id_header_format']

        for cambio in cambios:
            
            observacion = None
            if cambio['observaciones_register']:
                observacion = cambio['observaciones_register']
            
            #Verificar que no haya datos guardados
            detalles = execute_query("SELECT * FROM v_detalles_monitoreos_calidad_agua WHERE estado = 'CREADO' AND id_header_format = %s AND fk_id_tipo_control_calidad_agua=%s", 
                                        (id_headers_formats,cambio['idTipo'],))
            
            if detalles:
                execute_query("UPDATE detalles_monitoreos_calidad_agua SET resultado = %s, observaciones = %s WHERE fk_id_tipo_control_calidad_agua = %s", 
                                (cambio['resultado_register'],observacion,cambio['idTipo']))
            else:
                execute_query("INSERT INTO detalles_monitoreos_calidad_agua(resultado, observaciones, fk_id_tipo_control_calidad_agua, fk_id_header_format) VALUES (%s, %s, %s, %s)",
                                (cambio['resultado_register'], observacion, cambio['idTipo'], id_headers_formats))

        return jsonify({'status': 'success', 'message': 'Registro guardado correctamente'}), 200

    except Exception as e:
        print(f"Error al guardar el registro: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al guardar el registro'}), 500

#Finalizar el registro
@monitoreoAgua.route('/finalizar_registro', methods=['POST'])
def finalizar_registro():
    try:
        #Obtener el formato activo
        formato_activo = execute_query("SELECT * FROM public.headers_formats WHERE estado = 'CREADO' AND fk_idtipoformatos = 13")
        id_headers_formats = formato_activo[0]['id_header_format']

        execute_query("UPDATE headers_formats SET estado = 'CERRADO' WHERE id_header_format = %s", (id_headers_formats, ))

        return jsonify({'status': 'success', 'message': 'Registro finalizado correctamente'}), 200

    except Exception as e:
        print(f"Error al finalizar el registro: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al finalizar el registro'}), 500
