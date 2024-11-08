import os

from flask import Blueprint, render_template, request, jsonify, send_file
from connection.database import execute_query
from datetime import datetime
from datetime import time
from .utils.constans import BPM
from .utils.constans import MESES_BY_NUM
from .utils.helpers import image_to_base64
from .utils.helpers import generar_reporte
from .utils.helpers import get_cabecera_formato
from .utils.helpers import get_ultimo_dia_laboral_del_mes


condiciones_ambientales = Blueprint('condiciones_ambientales', __name__)

@condiciones_ambientales.route('/', methods=['GET', 'POST'])
def condicionesAmbientales():
    if request.method == 'GET':
        try:
            # Obtener toas las áreas
            query_areas = "SELECT * FROM areas"
            areas = execute_query(query_areas)

            query_vista_condiciones_ambientales = "SELECT * FROM v_condiciones_ambientales WHERE estado = 'CREADO'"
            v_condiciones_ambientales = execute_query(query_vista_condiciones_ambientales)

            query_ca_finalizados = "SELECT * FROM v_condiciones_ambientales WHERE estado = 'CERRADO' ORDER BY idcondicionambiental DESC"
            v_finalizados_CA = execute_query(query_ca_finalizados)

            return render_template('control_condiciones_ambientales.html', areas=areas, v_condiciones_ambientales=v_condiciones_ambientales, v_finalizados_CA=v_finalizados_CA)
        except Exception as e:
            print(f"Error al obtener datos: {e}")
            return render_template('control_condiciones_ambientales.html')
    elif request.method == 'POST':
        try:
            area = request.form.get('selectArea')
            fecha_actual = datetime.now()

            mes_actual = fecha_actual.month
            anio_actual = fecha_actual.year

            mes_consultar = str(mes_actual)
            anio_consultar = str(anio_actual)
            
            consult_eviromental_condition_month =  "SELECT * FROM condiciones_ambientales WHERE mes = %s AND anio = %s AND fk_idarea = %s AND estado = 'CREADO'" 
            verificar_producto = execute_query(consult_eviromental_condition_month, (mes_consultar, anio_consultar, area))
            
            if not verificar_producto:
                query_crear_formato = """
                    INSERT INTO condiciones_ambientales(mes, anio, estado, fk_idarea, fk_idtipoformatos)
                    VALUES (%s, %s, %s, %s, %s)
                """
                execute_query(query_crear_formato, (mes_actual, anio_actual, 'CREADO', area, 4))

                return jsonify({'status': 'success', 'message': 'Control de condiciones ambientales creado.'}), 200
            else:
                return jsonify({'status': 'error', 'message': 'El formato para esta área ya existe para este mes.'}), 500
        except Exception as e:
            print(f"Error al crear el kardex: {e}")
            return jsonify({'status': 'error', 'message': 'Error al crear el Control de condiciones ambientales'}), 500
        
@condiciones_ambientales.route('/registrar_condiciones_ambientales', methods=['POST'])
def registrar_condiciones_ambientales():
    try:
        data = request.json
        # Extracción de los datos del formulario
        idcondicionambiental = data['idcondicionambiental']
        fecha = data['fecha']
        hora = data['hora']
        limpio = data.get('limpio') == 'true'
        ordenado = data.get('ordenado') == 'true'
        paletasLimpias = data.get('paletasLimpias') == 'true'
        paletasBuenEstado = data.get('paletasBuenEstado') == 'true'
        temperatura = data['temperatura']
        humedadRelativa = data['humedadRelativa']
        observaciones = data['observaciones'] or "-"
        accionesCorrectivas = data['accionesCorrectivas'] or "-"

        idaccion_correctiva = None
        if accionesCorrectivas != "-":
            result_accion_correctiva = execute_query("INSERT INTO acciones_correctivas(detalle_accion_correctiva, estado) VALUES (%s,%s) RETURNING idaccion_correctiva", 
                                                    (accionesCorrectivas, 'PENDIENTE'))
            idaccion_correctiva = result_accion_correctiva[0]['idaccion_correctiva']

        # Inserción de detalle_condiciones_ambientales
        query_insert_detalle_CA = """
            INSERT INTO detalle_condiciones_ambientales 
            (fecha, hora, temperatura, humedad, observaciones, fk_idaccion_correctiva, fk_idcondicion_ambiental) 
            VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING iddetalle_ca
        """
        result_detalle = execute_query(query_insert_detalle_CA, 
                                    (fecha, hora, temperatura, humedadRelativa, observaciones, idaccion_correctiva, idcondicionambiental))

        id_detalle = result_detalle[0]['iddetalle_ca']

        # Inserciones para verificación previa
        if limpio:
            execute_query("INSERT INTO asignacion_verificacion_previa_condicion_ambiental(fk_iddetalle_condicion_ambiental, fk_idverificacion_previa) VALUES (%s,%s)", 
                        (id_detalle, 1))
        if ordenado:
            execute_query("INSERT INTO asignacion_verificacion_previa_condicion_ambiental(fk_iddetalle_condicion_ambiental, fk_idverificacion_previa) VALUES (%s,%s)", 
                        (id_detalle, 2))
        if paletasLimpias:
            execute_query("INSERT INTO asignacion_verificacion_previa_condicion_ambiental(fk_iddetalle_condicion_ambiental, fk_idverificacion_previa) VALUES (%s,%s)", 
                        (id_detalle, 3))
        if paletasBuenEstado:
            execute_query("INSERT INTO asignacion_verificacion_previa_condicion_ambiental(fk_iddetalle_condicion_ambiental, fk_idverificacion_previa) VALUES (%s,%s)", 
                    (id_detalle, 4))

        return jsonify({'status': 'success', 'message': 'Se registró el control de condición ambiental correctamente.'}), 200

    except Exception as e:
        print(f"Error al agregar detalle de condiciones ambientales: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar el control de condición ambiental.'}), 500

    

@condiciones_ambientales.route('/detalles_condiciones_ambientales/<int:id_ca>', methods=['GET'])
def detalles_condiciones_ambientales(id_ca):
    
    #Area
    quer_area = execute_query("SELECT fk_idarea FROM condiciones_ambientales WHERE idcondicionambiental = %s", (id_ca,))
    area = quer_area[0]['fk_idarea']
    
    # Obtener los detalles de la condición ambiental
    query_detalle_CA = "SELECT * FROM v_detalle_control_CA WHERE idcondicionambiental = %s ORDER BY iddetalle_ca DESC"
    detalle_CA = execute_query(query_detalle_CA, (id_ca,))

    # Obtener las asignaciones de verificación previa para cada detalle
    detalles_formateados = []

    for detalle in detalle_CA:
        # Formatear la fecha
        detalle['fecha'] = detalle['fecha'].strftime('%d/%m/%Y')  # Formatear la fecha a DD/MM/YYYY

        if isinstance(detalle['hora'], time):
            detalle['hora'] = detalle['hora'].strftime('%H:%M:%S')  # Convertir la hora a cadena (HH:MM:SS)

        # Obtener las asignaciones de verificación previa para cada detalle
        query_asignaciones = "SELECT fk_idverificacion_previa FROM asignacion_verificacion_previa_condicion_ambiental WHERE fk_iddetalle_condicion_ambiental = %s"
        asignaciones = execute_query(query_asignaciones, (detalle['iddetalle_ca'],))
        
        if area == 2 or area == 4:
            verificacion = {1: False, 2: False, 3: None, 4: None}
            for asig in asignaciones:
                if asig['fk_idverificacion_previa'] in verificacion:
                    verificacion[asig['fk_idverificacion_previa']] = True
        else:
            # Crear un diccionario con las verificaciones previas (1-4)
            verificacion = {1: False, 2: False, 3: False, 4: False}
            for asig in asignaciones:
                if asig['fk_idverificacion_previa'] in verificacion:
                    verificacion[asig['fk_idverificacion_previa']] = True

        # Añadir las asignaciones al detalle
        detalle['verificacion_previa'] = verificacion
        detalles_formateados.append(detalle)

    return jsonify(detalles_formateados)


@condiciones_ambientales.route('/estadoAC/<int:id_ca>', methods=['POST'])
def estadoAC(id_ca):
    try:
        execute_query("UPDATE acciones_correctivas SET estado = %s WHERE idaccion_correctiva = %s", ('SOLUCIONADO', id_ca))
        return jsonify({'status': 'success', 'message': 'Se cambió el estado de esta acción correctiva.'}), 200
    except Exception as e:
        print(f"Error al modificar el estado de la acción correctiva: {e}")
        return jsonify({'status': 'error', 'message': 'No hay acción correctiva para validar.'}), 500

@condiciones_ambientales.route('/finalizarDetallesCA', methods=['POST'])
def finalizarDetallesCA():
    try:
        data = request.json
        # Extracción de los datos del formulario
        idcondicionambiental = data['idcondicionambiental']

        query_update_estado_CA = "UPDATE condiciones_ambientales SET estado = %s WHERE idcondicionambiental = %s"
        execute_query(query_update_estado_CA,('CERRADO', idcondicionambiental))

        return jsonify({'status': 'success', 'message': 'Se finalizo correctamente el control de condición ambiental.'}), 200

    except Exception as e:
        print(f"Error al agregar detalle de kardex: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar el control de condición ambiental.'}), 500

@condiciones_ambientales.route('/descargar_formato_CA/<int:idCA>', methods=['GET'])
def descargar_formato_CA(idCA):
    idCA = int(idCA)
    cabecera = get_cabecera_formato("condiciones_ambientales", idCA)

    # Consulta
    query_CA = "SELECT * FROM v_detalle_control_CA WHERE idcondicionambiental = %s ORDER BY fecha, hora ASC;"
    ConsultCADetails = execute_query(query_CA, (idCA,))

    # Set fecha, mes y año
    fecha = ConsultCADetails[0]['fecha'].strftime("%d/%m/%Y")
    _fecha = datetime.strptime(fecha, '%d/%m/%Y')
    mes=MESES_BY_NUM[_fecha.month].capitalize()
    anio=_fecha.year

    # Formatear la fecha en los detalles
    detalles_formateados = []
    for detalle in ConsultCADetails:
        detalle['fecha'] = detalle['fecha'].strftime('%d/%m/%Y')  # Formato DD/MM/YYYY
        detalles_formateados.append(detalle)

        # Obtener las asignaciones de verificación previa para cada detalle
        query_asignaciones = "SELECT fk_idverificacion_previa FROM asignacion_verificacion_previa_condicion_ambiental WHERE fk_iddetalle_condicion_ambiental = %s"
        asignaciones = execute_query(query_asignaciones, (detalle['iddetalle_ca'],))

        # Crear un diccionario con las verificaciones previas (1-4)
        verificacion = {1: False, 2: False, 3: False, 4: False}
        for asignacion in asignaciones:
            if asignacion['fk_idverificacion_previa'] in verificacion:
                verificacion[asignacion['fk_idverificacion_previa']] = True

        # Añadir las asignaciones al detalle
        detalle['verificacion_previa'] = verificacion

    # Generar Template para reporte
    logo_path = os.path.join('static', 'img', 'logo.png')
    logo_base64 = image_to_base64(logo_path)
    title_report=cabecera[0]['nombreformato']

    # Renderiza la plantilla de Kardex
    template = render_template(
        "reports/reporte_control_condiciones_ambientales.html",
        title_manual=BPM,
        title_report=title_report,
        format_code_report=cabecera[0]['codigo'],
        frecuencia_registro=cabecera[0]['frecuencia'],
        logo_base64=logo_base64,
        info=detalles_formateados,
        mes=mes,
        anio=anio,
        fecha_periodo=get_ultimo_dia_laboral_del_mes()
    )

    file_name=f"{title_report}"
    return generar_reporte(template, file_name)

