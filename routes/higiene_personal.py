import os

from flask import Blueprint, render_template, request, jsonify, send_file
from connection.database import execute_query
from datetime import datetime

higienePersona = Blueprint('higiene_personal', __name__)

@higienePersona.route('/', methods=['GET', 'POST'])
def higiene_personal():
    if request.method == 'GET':
        try:
            #Obtener si existe el registro de control de envasados creado
            query_higiene_personal = "SELECT * FROM controles_higiene_personal WHERE estado = 'CREADO'"
            control_higiene_personal = execute_query(query_higiene_personal)

            #Obtener el responsable para seleccionar
            trabajador = execute_query("SELECT * FROM trabajadores")

            #Obtener el producto para seleccionar
            detalle_higiene_personal = execute_query("SELECT * FROM v_detalle_higiene_personal")

            #Obtener la verifiacion el 
            query_verificacion_higiene_personal = "SELECT fk_idverificacion_previa FROM asignacion_verificacion_previa_higiene_personal)"
            verificacion_higiene_personal = execute_query(query_verificacion_higiene_personal, ())

            #Obtener el historial de los registros de controles ambientales
            query_historial_higiene_personal = "SELECT * FROM v_historial_higiene_personal"
            historial_higiene_personal  = execute_query(query_historial_higiene_personal)

            return render_template('higiene_personal.html', historial_higiene_personal=historial_higiene_personal, control_higiene_personal=control_higiene_personal, trabajador=trabajador, detalle_higiene_personal=detalle_higiene_personal)
        except Exception as e:
            print(f"Error al obtener datos: {e}")
            return render_template('higiene_personal.html')
        

@higienePersona.route('/generar_formato_higiene', methods=['POST'])
def generar_formato_higiene():
    try:
        fecha_actual = datetime.now()

        mes_actual = fecha_actual.month
        anio_actual = fecha_actual.year

        # Eliminar el registro relacionado en controles_generales_personal
        query_generar_formato = """
            INSERT INTO controles_higiene_personal(mes,anio,fk_idtipoformato,estado) VALUES  (%s,%s,%s,%s);
        """
        execute_query(query_generar_formato, (mes_actual,anio_actual,6,'CREADO'))

        return jsonify({'status': 'success', 'message': 'Se genero el registro.'}), 200

    except Exception as e:
        print(f"Error al generar el formato: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al generar el formato.'}), 500

@higienePersona.route('/registrar_higiene_personal', methods=['POST'])
def registrar_higiene_personal():
    try:
        # Extracción de los datos del formulario
        fecha = request.form['fecha']
        trabajador = request.form['trabajador']

        correctaPresentacion = request.form.get('correctaPresentacion') == 'true'
        limpiezaManos = request.form.get('limpiezaManos') == 'true'
        habitosHigiene = request.form.get('habitosHigiene') == 'true'

        observaciones = request.form['observaciones'] or "-"
        accionesCorrectivas = request.form['accionesCorrectivas'] or "-"

        # Obtener el id del control de higiene personal activo
        id_control = execute_query("SELECT id_control_higiene_personal FROM controles_higiene_personal WHERE estado = 'CREADO'")

        if not id_control:
            return jsonify({'status': 'error', 'message': 'No se encontró un control de higiene personal activo.'}), 400

        id_control_higiene_personal = id_control[0]['id_control_higiene_personal']

        # Inicializar idaccion_correctiva
        idaccion_correctiva = None

        if accionesCorrectivas != "-":
            result_accion_correctiva = execute_query(
                "INSERT INTO acciones_correctivas(detalle_accion_correctiva, estado) VALUES (%s,%s) RETURNING idaccion_correctiva",
                (accionesCorrectivas, 'PENDIENTE')
            )
            
            if result_accion_correctiva:
                idaccion_correctiva = result_accion_correctiva[0]['idaccion_correctiva']

        # Inserción de detalle_condiciones_ambientales
        query_insert_detalle_higiene_personal = """
            INSERT INTO detalles_controles_higiene_personal
            (fecha, fk_idtrabajador, observaciones, fk_idaccion_correctiva, fk_idcontrol_higiene_personal) 
            VALUES (%s, %s, %s, %s, %s) RETURNING id_detalle_control_higiene_personal
        """

        # Usar None si no hay acción correctiva
        result_detalle = execute_query(
            query_insert_detalle_higiene_personal,
            (fecha, trabajador, observaciones, idaccion_correctiva, id_control_higiene_personal)
        )

        if not result_detalle:
            return jsonify({'status': 'error', 'message': 'No se pudo registrar el detalle del control.'}), 500

        id_detalle = result_detalle[0]['id_detalle_control_higiene_personal']

        # Inserciones para verificación previa
        if correctaPresentacion:
            execute_query("INSERT INTO asignacion_verificacion_previa_higiene_personal(fk_iddetalle_control_higiene_personal, fk_idverificacion_previa) VALUES (%s,%s)",
                          (id_detalle, 5))
        if limpiezaManos:
            execute_query("INSERT INTO asignacion_verificacion_previa_higiene_personal(fk_iddetalle_control_higiene_personal, fk_idverificacion_previa) VALUES (%s,%s)",
                          (id_detalle, 6))
        if habitosHigiene:
            execute_query("INSERT INTO asignacion_verificacion_previa_higiene_personal(fk_iddetalle_control_higiene_personal, fk_idverificacion_previa) VALUES (%s,%s)",
                          (id_detalle, 7))

        return jsonify({'status': 'success', 'message': 'Se registró el control de aseo e higiene del personal.'}), 200

    except Exception as e:
        print(f"Error al agregar detalle de control de aseo e higiene del personal: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar el control de aseo e higiene del personal.'}), 500

