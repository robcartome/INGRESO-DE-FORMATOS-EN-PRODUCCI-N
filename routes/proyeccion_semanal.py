from flask import Blueprint, render_template, request, jsonify
from connection.database import execute_query
from datetime import datetime, timedelta
from math import ceil

proyeccionsemanal = Blueprint('proyeccion_semanal', __name__)

@proyeccionsemanal.route('/', methods=['GET'])
def proyeccion_semanal():
    proyeccion = execute_query("""SELECT * 
                                    FROM v_proyeccion_semanal 
                                    WHERE estado = 'CREADO' 
                                    ORDER BY 
                                        CASE 
                                            WHEN dia = 'Lunes' THEN 1
                                            WHEN dia = 'Martes' THEN 2
                                            WHEN dia = 'Miércoles' THEN 3
                                            WHEN dia = 'Jueves' THEN 4
                                            WHEN dia = 'Viernes' THEN 5
                                            WHEN dia = 'Sábado' THEN 6
                                            WHEN dia = 'Domingo' THEN 7
                                        END,
                                        idproyeccion;""") or []
    
    productos = execute_query("SELECT * FROM productos ORDER BY idproducto")

    # Paginación para el historial de proyecciones finalizadas
    page = int(request.args.get('page', 1))  # Página actual
    items_per_page = 5  # Elementos por página
    offset = (page - 1) * items_per_page

    # Contar el total de proyecciones finalizadas
    total_proyecciones = execute_query("SELECT COUNT(*) FROM proyeccion WHERE estado = 'CERRADO'")[0]['count']
    total_pages = ceil(total_proyecciones / items_per_page)

    # Obtener las proyecciones cerradas con paginación
    proyectEnd = execute_query("""
        SELECT * FROM proyeccion WHERE estado = 'CERRADO'
        ORDER BY idprojection DESC
        LIMIT %s OFFSET %s
    """, (items_per_page, offset)) or []

    # Obtener los detalles correspondientes para las proyecciones en esta página
    proyectEndIds = [p['idprojection'] for p in proyectEnd]
    if proyectEndIds:
        format_ids = ','.join(map(str, proyectEndIds))
        proyectEndDetalles = execute_query(f"""
            SELECT * FROM v_proyeccion_semanal
            WHERE estado = 'CERRADO' AND idprojection IN ({format_ids})
            ORDER BY 
            CASE 
                WHEN dia = 'Lunes' THEN 1
                WHEN dia = 'Martes' THEN 2
                WHEN dia = 'Miércoles' THEN 3
                WHEN dia = 'Jueves' THEN 4
                WHEN dia = 'Viernes' THEN 5
                WHEN dia = 'Sábado' THEN 6
                WHEN dia = 'Domingo' THEN 7
            END,
            idproyeccion;
        """) or []
    else:
        proyectEndDetalles = []

    return render_template(
        'proyeccion_semanal.html',
        proyeccion=proyeccion,
        productos=productos,
        proyectEnd=proyectEnd,
        proyectEndDetalles=proyectEndDetalles,
        current_page=page,
        total_pages=total_pages,
    )


def obtener_dias_semana():
    fecha_actual = datetime.now()

    # Calcular el lunes de la semana actual
    inicio_semana = fecha_actual - timedelta(days=fecha_actual.weekday())

    # Crear una lista con las fechas de lunes a domingo
    fechas_semana = [(inicio_semana + timedelta(days=i)).date() for i in range(6)]

    return fechas_semana

@proyeccionsemanal.route('/generar_proyeccion', methods=['POST'])
def generar_proyeccion():
    try:
        verify = execute_query("SELECT idprojection FROM proyeccion WHERE estado = 'CREADO'")
        if verify:
            return jsonify({'status': 'error', 'message': 'Ya existe una proyección creada'})
        else:
            # Obtener productos con su stock
            productos = execute_query("SELECT idproducto, stock FROM productos ORDER BY idproducto")

            # Obtener la fecha del lunes de la semana actual
            fecha_actual = datetime.now()
            inicio_semana = fecha_actual - timedelta(days=fecha_actual.weekday())  # Lunes de la semana actual
            fin_semana = inicio_semana + timedelta(days=5)  #Día sábado de la semana actual

            # Formatear las fechas en "dd/mm/yyyy"
            semana = f"{inicio_semana.strftime('%d/%m/%Y')} - {fin_semana.strftime('%d/%m/%Y')}"

            # Insertar en la tabla proyeccion y obtener el fk_proyeccion
            fk_proyeccion = execute_query(
                "INSERT INTO proyeccion(estado, semana) VALUES (%s, %s) RETURNING idprojection", 
                ('CREADO', semana)
            )
            id_proyeccion = fk_proyeccion[0]['idprojection']  # Obtener el ID de la proyección generada

            for p in productos:
                idproducto = p['idproducto']
                stock = int(p['stock'])  # Asegúrate de que el stock es un entero

                # Obtener el máximo por producto
                maximo_und = execute_query("SELECT maximo_und FROM min_max WHERE fk_id_productos = %s", (idproducto,))
                
                if maximo_und:
                    maximo_und = int(maximo_und[0]['maximo_und'])  # Convertir el valor a entero
                    proyeccion = maximo_und - stock  # Calcular la proyección
                    proyeccion = max(proyeccion, 0)  # Establecer en 0 si es negativa
                else:
                    proyeccion = 0  # Si no hay un valor de máximo, la proyección es 0

                # Insertar solo si la proyección es mayor que 0
                if proyeccion > 0:
                    execute_query(
                        "INSERT INTO proyeccion_semanal(proyeccion, fk_id_productos, fk_proyeccion) VALUES (%s, %s, %s);", 
                        (proyeccion, idproducto, id_proyeccion)
                    )

            return jsonify({'status': 'success', 'message': 'Proyección generada correctamente'}), 200

    except Exception as e:
        print(f"Error al generar la proyección: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al generar la proyección'}), 500


@proyeccionsemanal.route('/quitar_proyeccion/<int:idproyeccion>', methods=['POST'])
def quitar_proyeccion(idproyeccion):
    try:
        print(f"Proyección a eliminar: {idproyeccion}")
        
        # Ejecutar la consulta para eliminar la proyección
        execute_query("DELETE FROM proyeccion_semanal WHERE idproyeccion = %s", (idproyeccion,))

        return jsonify({'status': 'success', 'message': 'Proyección eliminada correctamente'}), 200
    
    except Exception as e:
        print(f"Error al quitar la proyección: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al eliminar la proyección'}), 500

@proyeccionsemanal.route('/AgregarProducto', methods=['POST'])
def AgregarProducto():
    try:
        # Obtener el valor de 'selectProducto' desde el cuerpo de la solicitud
        data = request.get_json()
        idproducto = data.get('selectProducto')

        if not idproducto:
            return jsonify({'status': 'error', 'message': 'No se seleccionó ningún producto.'}), 400

        # Obtener el stock del producto
        stock_Extract = execute_query("SELECT stock FROM productos WHERE idproducto = %s", (idproducto,))
        stock = int(stock_Extract[0]['stock'])

        # Obtener el máximo por producto
        maximo_und = execute_query("SELECT maximo_und FROM min_max WHERE fk_id_productos = %s", (idproducto,))
        
        if maximo_und:
            maximo_und = int(maximo_und[0]['maximo_und'])
            proyeccion = max(maximo_und - stock, 0)  # Establecer en 0 si la proyección es negativa
        else:
            proyeccion = 0

        # Obtener la proyección activa con estado 'CREADO'
        fk_proyeccion = execute_query("SELECT idprojection FROM proyeccion WHERE estado = 'CREADO'")
        if not fk_proyeccion:
            return jsonify({'status': 'error', 'message': 'No existe una proyección activa con estado CREADO.'}), 400

        id_proyeccion = fk_proyeccion[0]['idprojection']

        # Verificar si el producto ya tiene una proyección en `proyeccion_semanal` para el `id_proyeccion` actual
        producto_existente = execute_query(
            "SELECT 1 FROM proyeccion_semanal WHERE fk_id_productos = %s AND fk_proyeccion = %s",
            (idproducto, id_proyeccion)
        )

        if producto_existente:
            return jsonify({'status': 'error', 'message': 'El producto ya existe en la proyección semanal.'}), 400

        # Insertar la proyección en la base de datos si no existe
        execute_query(
            "INSERT INTO proyeccion_semanal(proyeccion, fk_id_productos, fk_proyeccion) VALUES (%s, %s, %s);",
            (proyeccion, idproducto, id_proyeccion)
        )

        return jsonify({'status': 'success', 'message': 'Proyección agregada correctamente'}), 200

    except Exception as e:
        print(f"Error al agregar el producto a la proyección: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al agregar el producto a la proyección'}), 500

@proyeccionsemanal.route('/guardar_proyeccion', methods=['POST'])
def guardar_proyeccion():
    try:
        cambios = request.get_json()

        for cambio in cambios:
            query = """
                UPDATE proyeccion_semanal
                SET proyeccion = %s, dia = %s
                WHERE idproyeccion = %s
            """
            params = (cambio['proyeccion_register'], cambio['selectSemana'], cambio['idproyeccion'])
            execute_query(query, params)

        return jsonify({'status': 'success', 'message': 'Proyección guardada correctamente'}), 200

    except Exception as e:
        print(f"Error al guardar la proyección: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al guardar la proyección'}), 500

@proyeccionsemanal.route('/finalizar_proyeccion', methods=['POST'])
def finalizar_proyeccion():
    try:
        # Obtener la proyección activa con estado 'CREADO'
        fk_proyeccion = execute_query("SELECT idprojection, semana, idproducto FROM v_proyeccion_semanal WHERE estado = 'CREADO'")
        if not fk_proyeccion:
            return jsonify({'status': 'error', 'message': 'No existe una proyección activa con estado CREADO.'}), 400

        id_proyeccion = fk_proyeccion[0]['idprojection']

        semana = fk_proyeccion[0]['semana']

        inicio, fin = semana.split(' - ')

        lunes = datetime.strptime(inicio, "%d/%m/%Y").strftime("%Y-%m-%d")
        print(lunes)
        
        sabado = datetime.strptime(fin, "%d/%m/%Y").strftime("%Y-%m-%d")
        print(sabado)

        #Ingresar la cantidad producida a la proyección semanal para poder hacer las comparaciones
        for proyection in fk_proyeccion:
            cantidad_producida = obtener_producido(lunes, sabado, proyection['idproducto'])
            execute_query("UPDATE proyeccion_semanal SET producido = %s WHERE fk_id_productos = %s AND fk_proyeccion = %s", (cantidad_producida, proyection['idproducto'], id_proyeccion,))


        # Actualizar el estado de la proyección a 'CERRADO'
        execute_query("UPDATE proyeccion SET estado = 'CERRADO' WHERE idprojection = %s", (id_proyeccion, ))

        return jsonify({'status': 'success', 'message': 'Proyección finalizada correctamente'}), 200

    except Exception as e:
        print(f"Error al finalizar la proyección: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al finalizar la proyección'}), 500

# Función para obtener la cantidad total producida por producto en una semana  
def obtener_producido(inicio, fin, producto):

    cantidad_producida = execute_query("SELECT SUM(cantidad_producida) FROM v_registros_controles_envasados WHERE idproducto = %s AND date_insertion BETWEEN %s AND %s", (producto, inicio, fin))
    
    return cantidad_producida[0]['sum'] or 0