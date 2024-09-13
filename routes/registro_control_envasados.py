import os

from flask import Blueprint, render_template, request, jsonify
from connection.database import execute_query
from datetime import datetime
from collections import defaultdict
from  .utils.helpers import image_to_base64
from  .utils.helpers import generar_reporte

########## PARA REGISTRO Y CONTROL DE ENVASADOS ###################################################################################

controlEnvasados = Blueprint('control_envasados', __name__)

@controlEnvasados.route('/', methods=['GET', 'POST'])
def control_envasados():
    if request.method == 'GET':
        try:
            # Obtener a los trabajadores
            query_registros_envasados = """SELECT * FROM registros_controles_envasados"""
            control_envasados = execute_query(query_registros_envasados)

            return render_template('registro_control_envasados.html', control_envasados=control_envasados)
        
        except Exception as e:
            print(f"Error al obtener datos: {e}")
            return render_template('registro_control_envasados.html')

    elif request.method == 'POST':
        try:
            # Obtener datos del formulario
            fechaLavado = request.form.get('fechaLavado')
            horaLavado = request.form.get('horaLavado')
            selectTrabajador = request.form.get('selectTrabajador')

            # Verificar si hay un formato 'CREADO' para el tipo de formato 2
            query_formatos = "SELECT idlavadomano FROM lavadosmanos WHERE fk_idtipoformatos = 2 AND estado = 'CREADO'"
            formato = execute_query(query_formatos)

            if not formato:
                return jsonify({'status': 'error', 'message': 'No se encontró un formato válido para registrar el lavado de manos.'}), 400
            
            try:
                # Insertar lavado de manos
                query_insertar_trabajador = """ 
                    INSERT INTO detalle_lavados_manos (fecha, hora, fk_idtrabajador, fk_idlavadomano) 
                    VALUES (%s, %s, %s, %s);
                """
                
                execute_query(query_insertar_trabajador, (fechaLavado, horaLavado, selectTrabajador, formato[0]['idlavadomano']))
            except Exception as e:
                # Convertir el mensaje de error a string
                return jsonify({'status': 'error', 'message': str(e)}), 500
            
            return jsonify({'status': 'success', 'message': 'Lavado de manos registrado.'}), 200

        except Exception as e:
            print(f"Error al procesar la solicitud POST: {e}")
            return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar el lavado de manos.'}), 500