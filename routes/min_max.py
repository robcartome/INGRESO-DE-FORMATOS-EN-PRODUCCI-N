from flask import Blueprint, render_template, request, jsonify
from connection.database import execute_query

minmax = Blueprint('min_max', __name__)

@minmax.route('/', methods=['GET'])
def min_max():
    min_max = execute_query("SELECT * FROM v_min_max ORDER BY id_min_max")
    return render_template('min_max.html', min_max=min_max)

@minmax.route('/guardar_cambios', methods=['POST'])
def guardar_cambios():
    try:
        # Obtener los datos enviados desde el frontend
        cambios = request.get_json()

        # Actualizar cada fila en la tabla min_max
        for cambio in cambios:
            query = """
                UPDATE min_max
                SET minimo_und = %s, maximo_und = %s
                WHERE id_min_max = %s
            """
            params = (cambio['minimo_und'], cambio['maximo_und'], cambio['id_min_max'])
            execute_query(query, params)

        return jsonify({'status': 'success', 'message': 'Cambios guardados correctamente'}), 200

    except Exception as e:
        print(f"Error al guardar los cambios: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al guardar los cambios'}), 500

