import os

from flask import Blueprint, render_template, request, jsonify, send_file
from connection.database import execute_query
from datetime import datetime
from datetime import time
from .utils.constans import BPM
from .utils.helpers import image_to_base64
from .utils.helpers import generar_reporte
from .utils.helpers import get_cabecera_formato


limpieza_areas = Blueprint('limpieza_areas', __name__)

@limpieza_areas.route('/', methods=['GET'])
def limpiezaAreas():
    try:
        # Obtener todas las áreas
        query_areas = "SELECT * FROM areas_produccion"
        areas = execute_query(query_areas)

        # Obtener los registros de verificación de limpieza y desinfección creados
        query_vista_limpieza_areas = "SELECT * FROM v_verificacion_limpieza_desinfeccion_areas WHERE estado = 'CREADO' ORDER BY id_verificacion_limpieza_desinfeccion_area DESC"
        v_limpieza_areas = execute_query(query_vista_limpieza_areas)

        # Obtener los registros finalizados, agrupados por mes y año
        query_la_finalizados = """
            SELECT 
                mes, anio, 
                json_agg(json_build_object('id_verificacion_limpieza_desinfeccion_area', id_verificacion_limpieza_desinfeccion_area, 
                                           'detalle_area_produccion', detalle_area_produccion,
                                           'estado', estado,
                                           'id_area_produccion', id_area_produccion)) AS registros
            FROM v_verificacion_limpieza_desinfeccion_areas 
            WHERE estado = 'CERRADO' 
            GROUP BY mes, anio
            ORDER BY anio DESC, mes DESC
        """
        v_finalizados_LA = execute_query(query_la_finalizados)
        
        # Obtener las observaciones y acciones correctivas
        asignacion_observaciones_limpieza_areas = execute_query("SELECT * FROM v_asingaciones_observaciones_acCorrec_limpieza_areas")

        return render_template('limpieza_areas.html', 
                               areas=areas, 
                               v_limpieza_areas=v_limpieza_areas, 
                               v_finalizados_LA=v_finalizados_LA, 
                               asignacion_observaciones_limpieza_areas=asignacion_observaciones_limpieza_areas)
    except Exception as e:
        print(f"Error al obtener datos: {e}")
        return render_template('limpieza_areas.html')

        
@limpieza_areas.route('/agregar_registro_limpieza_areas/<int:selectArea>', methods=['POST'])
def agregar_registro_limpieza_areas(selectArea):
    try:
        fecha_actual = datetime.now()

        mes = fecha_actual.month
        anio = fecha_actual.year

        mes_consultar = str(mes)
        anio_consultar = str(anio)

        consult_eviromental_condition_month =  "SELECT * FROM verificacion_limpieza_desinfeccion_areas WHERE mes = %s AND anio = %s AND fk_idarea_produccion = %s AND estado = 'CREADO'" 
        verificar_limpieza_area = execute_query(consult_eviromental_condition_month, (mes_consultar, anio_consultar,selectArea))
        if not verificar_limpieza_area:
            execute_query("INSERT INTO verificacion_limpieza_desinfeccion_areas(mes, anio, estado, fk_idarea_produccion) VALUES (%s,%s,%s,%s)", (mes, anio, 'CREADO', selectArea))
            return jsonify({'status': 'success', 'message': 'Se registro una verificación de limpieza y desinfección para esta área.'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'El formato para esta área ya existe para este mes.'}), 500
    except Exception as e:
        print(f"Error al registrar una verificación de limpieza: {e}")
        return jsonify({'status': 'error', 'message': 'No se registro una verificación de limpieza y desinfección para esta área.'}), 500

@limpieza_areas.route('/detalles_limpieza_areas/<int:id_verificacion_limpieza_desinfeccion_area>', methods=['GET'])
def detalles_limpieza_areas(id_verificacion_limpieza_desinfeccion_area):

    # Obtener los detalles de la condición ambiental
    query_detalle_limpieza_areas = "SELECT * FROM v_detalles_verificacion_limpieza_desinfeccion_areas WHERE id_verificacion_limpieza_desinfeccion_area = %s"
    detalle_limpieza_areas = execute_query(query_detalle_limpieza_areas, (id_verificacion_limpieza_desinfeccion_area,))


    return jsonify(detalle_limpieza_areas)

@limpieza_areas.route('/obtener_categorias_area/<int:id_area>', methods=['GET'])
def obtener_categorias_area(id_area):
    try:
        # Consulta para obtener categorías específicas para un área dada
        if id_area == 2:
            query_categorias = """SELECT * 
                                    FROM categorias_limpieza_desinfeccion 
                                    WHERE id_categorias_limpieza_desinfeccion IN (1, 2, 3, 4, 5, 6, 7);"""
            categorias = execute_query(query_categorias, (id_area,))
            return jsonify({'status': 'success', 'categorias': categorias}), 200
        elif id_area == 3:
            query_categorias = """SELECT * 
                                    FROM categorias_limpieza_desinfeccion 
                                    WHERE id_categorias_limpieza_desinfeccion IN (1, 2, 3, 4, 5, 7, 8, 9);"""
            categorias = execute_query(query_categorias, (id_area,))
            return jsonify({'status': 'success', 'categorias': categorias}), 200
        elif id_area == 4:
            query_categorias = """SELECT * 
                                    FROM categorias_limpieza_desinfeccion 
                                    WHERE id_categorias_limpieza_desinfeccion IN (1, 2, 3, 4, 5, 6);"""
            categorias = execute_query(query_categorias, (id_area,))
            return jsonify({'status': 'success', 'categorias': categorias}), 200
        elif id_area == 5:
            query_categorias = """SELECT * 
                                    FROM categorias_limpieza_desinfeccion 
                                    WHERE id_categorias_limpieza_desinfeccion IN (1, 2, 3, 4, 5, 10, 9);"""
            categorias = execute_query(query_categorias, (id_area,))
            return jsonify({'status': 'success', 'categorias': categorias}), 200
        elif id_area == 6:
            query_categorias = """SELECT * 
                                    FROM categorias_limpieza_desinfeccion 
                                    WHERE id_categorias_limpieza_desinfeccion IN (1, 2, 3, 4, 11, 7, 12, 13, 10, 9);"""
            categorias = execute_query(query_categorias, (id_area,))
            return jsonify({'status': 'success', 'categorias': categorias}), 200
        elif id_area == 7:
            query_categorias = """SELECT * 
                                    FROM categorias_limpieza_desinfeccion 
                                    WHERE id_categorias_limpieza_desinfeccion IN (1, 2, 3, 14, 4, 5, 15, 16, 17, 9);"""
            categorias = execute_query(query_categorias, (id_area,))
            return jsonify({'status': 'success', 'categorias': categorias}), 200
        elif id_area == 8:
            query_categorias = """SELECT * 
                                    FROM categorias_limpieza_desinfeccion 
                                    WHERE id_categorias_limpieza_desinfeccion IN (1, 2, 18, 19, 3, 4, 5, 20, 9);"""
            categorias = execute_query(query_categorias, (id_area,))
            return jsonify({'status': 'success', 'categorias': categorias}), 200
        elif id_area == 9:
            query_categorias = """SELECT * 
                                    FROM categorias_limpieza_desinfeccion 
                                    WHERE id_categorias_limpieza_desinfeccion IN (1, 2, 3, 4, 5, 21);"""
            categorias = execute_query(query_categorias, (id_area,))
            return jsonify({'status': 'success', 'categorias': categorias}), 200
    except Exception as e:
        print(f"Error al obtener las categorías para el área: {e}")
        return jsonify({'status': 'error', 'message': 'No se pudieron obtener las categorías para el área especificada.'}), 500

@limpieza_areas.route('/registrar_fecha_limpieza', methods=['POST'])
def registrar_fecha_limpieza():
    try:
        # Obtener datos de la solicitud
        data = request.get_json()
        fecha = data.get('fecha')
        categoria_id = data.get('categoria_id')
        id_verificacion = data.get('id_verificacion')
        print(data)
        print(fecha)
        print(categoria_id)
        print(id_verificacion)

        # Validar que todos los datos estén presentes
        if not fecha or not categoria_id or not id_verificacion:
            return jsonify({'status': 'error', 'message': 'Faltan datos para registrar la fecha de limpieza.'}), 400

        # Insertar el registro de limpieza en la tabla detalles_verificacion_limpieza_desinfeccion_areas
        query = """
            INSERT INTO detalles_verificacion_limpieza_desinfeccion_areas 
            (fecha, fk_id_verificacion_limpieza_desinfeccion_area, fk_id_categorias_limpieza_desinfeccion) 
            VALUES (%s, %s, %s)
        """
        execute_query(query, (fecha, id_verificacion, categoria_id))

        # Responder con éxito
        return jsonify({'status': 'success', 'message': 'La fecha de limpieza ha sido registrada correctamente.'}), 200

    except Exception as e:
        print(f"Error al registrar la fecha de limpieza: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar la fecha de limpieza.'}), 500

@limpieza_areas.route('/obtener_fechas_limpieza/<int:id_verificacion>/<int:id_area>', methods=['GET'])
def obtener_fechas_limpieza(id_verificacion,id_area):
    try:
        query_fechas = """SELECT * 
                                FROM v_detalles_verificacion_limpieza_desinfeccion_areas 
                                WHERE id_verificacion_limpieza_desinfeccion_area = %s AND id_categorias_limpieza_desinfeccion = %s"""
        fechas = execute_query(query_fechas, (id_verificacion,id_area,))
        return jsonify({'status': 'success', 'fechas': fechas}), 200
    except Exception as e:
        print(f"Error al obtener las fechas: {e}")
        return jsonify({'status': 'error', 'message': 'No se pudieron obtener las fechas.'}), 500
    
@limpieza_areas.route('/finalizar_limpieza_areas/<int:id_verificacion>', methods=['POST'])
def finalizar_limpieza_areas(id_verificacion):
    try:
        execute_query("UPDATE verificacion_limpieza_desinfeccion_areas SET estado = 'CERRADO'  WHERE id_verificacion_limpieza_desinfeccion_area = %s", (id_verificacion,))
        # Responder con éxito
        return jsonify({'status': 'success', 'message': 'Se finalizo la verificación de la limpieza y desinfección de esta área.'}), 200
    except Exception as e:
        print(f"Error al registrar la fecha de limpieza: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al finalizar la verificación de la limpieza y desinfección de esta área.'}), 500
    

@limpieza_areas.route('/observaciones_desinfeccion_areas', methods=['POST'])
def observaciones_desinfeccion_areas():
    try:
        data = request.get_json()
        medida_correctiva = data.get('observacion')
        fecha_actual = datetime.now()

        # Ejecutar la consulta SQL para insertar la medida correctiva
        query = "INSERT INTO medidascorrectivasobservaciones(detalledemedidacorrectiva, fecha) VALUES (%s, %s, %s, %s)"
        execute_query(query, (medida_correctiva, fecha_actual, idmano))
        
        # Ejecuta la consulta para obtener el idlavadomano
        result = execute_query("SELECT id_verificacion_limpieza_desinfeccion_area FROM verificacion_limpieza_desinfeccion_areas WHERE estado = 'CREADO'")
        
        # Verifica si el resultado no está vacío y si es una lista
        if not result or len(result) == 0:
            return jsonify({'status': 'error', 'message': 'No hay lavados de manos con estado CREADO.'}), 404
        
        for r in result:
            execute_query("INSERT INTO ")
        # Accede al primer registro de la lista
        idmano = result[0]['idlavadomano'] if isinstance(result[0], dict) else result[0]
        
        # Verifica que los parámetros necesarios estén presentes
        if not idmano or not medida_correctiva:
            return jsonify({'status': 'error', 'message': 'Faltan parámetros necesarios.'}), 400

        

        return jsonify({'status': 'success'}), 200

    except Exception as e:
        print(f"Error al registrar la medida correctiva: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error.'}), 500
    

@limpieza_areas.route('/registrar_observaciones_limpieza_area', methods=['POST'])
def registrar_observaciones_limpieza_area():
    try:
        fecha_actual = datetime.now()
        mes = fecha_actual.month
        mes_format = str(mes)
        data = request.json
        
        # Extracción de los datos del formulario
        observacionLimpiezaAreas = data.get('observacionLimpiezaAreas')
        accionCorrectivaLimpiezaAreas = data.get('accionCorrectivaLimpiezaAreas')
        
        # Verificar que todos los campos estén presentes
        if not observacionLimpiezaAreas or not accionCorrectivaLimpiezaAreas:
            return jsonify({'status': 'error', 'message': 'Faltan datos para registrar la observación.'}), 400

        # Ingresar la acción correctiva y retornar su ID
        query_accion_correctiva = "INSERT INTO acciones_correctivas(detalle_accion_correctiva, estado) VALUES (%s, %s) RETURNING idaccion_correctiva"
        accion_correctiva_result = execute_query(query_accion_correctiva, (accionCorrectivaLimpiezaAreas, 'PENDIENTE'))
        
        # Verificar que se haya obtenido el ID de la acción correctiva
        if not accion_correctiva_result or 'idaccion_correctiva' not in accion_correctiva_result[0]:
            return jsonify({'status': 'error', 'message': 'Error al registrar la acción correctiva.'}), 500
        
        id_accion_correctiva = accion_correctiva_result[0]['idaccion_correctiva']

        # Ingresar la observación y retornar su ID
        query_observacion = "INSERT INTO medidascorrectivasobservaciones(detalledemedidacorrectiva, fecha, fk_id_accion_correctiva) VALUES (%s, %s, %s) RETURNING idmedidacorrectivaob"
        observacion_result = execute_query(query_observacion, (observacionLimpiezaAreas, fecha_actual, id_accion_correctiva))
        
        # Verificar que se haya obtenido el ID de la observación
        if not observacion_result or 'idmedidacorrectivaob' not in observacion_result[0]:
            return jsonify({'status': 'error', 'message': 'Error al registrar la observación.'}), 500

        id_observacion = observacion_result[0]['idmedidacorrectivaob']

        # Obtener las verificaciones de limpieza y desinfección de las áreas activas
        limpieza_areas = execute_query("SELECT id_verificacion_limpieza_desinfeccion_area FROM verificacion_limpieza_desinfeccion_areas WHERE mes = %s", (mes_format,))
        
        # Asignar las observaciones a cada registro de limpieza de área para el mes actual
        for la in limpieza_areas:
            execute_query("INSERT INTO asignaciones_medidas_correctivas_limpieza_areas(fk_id_verificacion_limpieza_desinfeccion_area, fk_idmedidacorrectivaob) VALUES (%s, %s)", (la['id_verificacion_limpieza_desinfeccion_area'], id_observacion))

        return jsonify({'status': 'success', 'message': 'Se registró la observación y medida correctiva correctamente.'}), 200

    except Exception as e:
        print(f"Error al registrar la observación y medida correctiva: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar la observación y medida correctiva.'}), 500

@limpieza_areas.route('/estadoAC/<int:id_ca>', methods=['POST'])
def estadoAC(id_ca):
    try:
        execute_query("UPDATE acciones_correctivas SET estado = %s WHERE idaccion_correctiva = %s", ('SOLUCIONADO', id_ca))
        return jsonify({'status': 'success', 'message': 'Se cambió el estado de esta acción correctiva.'}), 200
    except Exception as e:
        print(f"Error al modificar el estado de la acción correctiva: {e}")
        return jsonify({'status': 'error', 'message': 'No hay acción correctiva para validar.'}), 500

@limpieza_areas.route('/get_observaciones_limpieza_areas', methods=['GET'])
def get_observaciones_limpieza_areas():
    try:
        # Consulta para obtener todas las observaciones con sus acciones correctivas y estados
        asignacion_observaciones_limpieza_areas = execute_query("SELECT * FROM v_asingaciones_observaciones_acCorrec_limpieza_areas")

        # Asegúrate de retornar las observaciones correctamente en el formato esperado por el frontend
        return jsonify({'status': 'success', 'observaciones': asignacion_observaciones_limpieza_areas}), 200
    except Exception as e:
        print(f"Error al obtener observaciones: {e}")
        return jsonify({'status': 'error', 'message': 'Error al obtener observaciones.'}), 500

