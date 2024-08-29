from flask import Blueprint, render_template, request, jsonify
from connection.database import execute_query
import base64
from datetime import datetime

########## PARA LAVADO_MANOS.HTML ###################################################################################

lavadoMano = Blueprint('lavado_Manos', __name__)

@lavadoMano.route('/', methods=['GET', 'POST'])
def lavado_Manos():
    if request.method == 'GET':
        try:
            # Obtener a los trabajadores
            query_lavado_manos = """SELECT * FROM v_lavados_manos ORDER BY idmano DESC"""
            lavado_manos = execute_query(query_lavado_manos)

            query_trabajadores = "SELECT idtrabajador, CONCAT(nombres, ' ', apellidos) AS nombres FROM trabajadores"
            trabajadores = execute_query(query_trabajadores)

            formatos = "SELECT estado FROM formatos WHERE fk_idtipoformato = 2 AND estado = 'CREADO'"

            return render_template('lavado_manos.html', formatos=formatos, lavado_manos=lavado_manos, trabajadores=trabajadores)
        except Exception as e:
            print(f"Error al obtener datos: {e}")
            return render_template('lavado_manos.html')

    elif request.method == 'POST':
        try:
            # Obtener datos del formulario
            fechaLavado = request.form.get('fechaLavado')
            horaLavado = request.form.get('horaLavado')
            selectTrabajador = request.form.get('selectTrabajador')

            # Verificar si hay un formato 'CREADO' para el tipo de formato 2
            query_formatos = "SELECT idformatos FROM formatos WHERE fk_idtipoformato = 2 AND estado = 'CREADO'"
            formato = execute_query(query_formatos)

            if not formato:
                return jsonify({'status': 'error', 'message': 'No se encontró un formato válido para registrar el lavado de manos.'}), 400
            
            try:
                # Insertar lavado de manos
                query_insertar_trabajador = """ 
                    INSERT INTO lavadosmanos (fecha, hora, fk_idtrabajador, fk_idformatos) 
                    VALUES (%s, %s, %s, %s);
                """
                
                execute_query(query_insertar_trabajador, (fechaLavado, horaLavado, selectTrabajador, formato[0]['idformatos']))
            except Exception as e:
                # Convertir el mensaje de error a string
                return jsonify({'status': 'error', 'message': str(e)}), 500
            
            return jsonify({'status': 'success', 'message': 'Lavado de manos registrado.'}), 200

        except Exception as e:
            print(f"Error al procesar la solicitud POST: {e}")
            return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar el lavado de manos.'}), 500

        
@lavadoMano.route('/generar_formato_lavado', methods=['POST'])
def generar_formato_lavado():
    try:
        fecha_actual = datetime.now()

        mes_actual = fecha_actual.month
        anio_actual = fecha_actual.year

        # Eliminar el registro relacionado en controles_generales_personal
        query_generar_formato = """
            INSERT INTO formatos(mes,anio,fk_idtipoformato,estado) VALUES  (%s,%s,%s,%s);
        """
        execute_query(query_generar_formato, (mes_actual,anio_actual,2,'CREADO'))

        return jsonify({'status': 'success', 'message': 'Se genero el formato.'}), 200

    except Exception as e:
        print(f"Error al generar el formato: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al generar el formato.'}), 500