import os

from flask import Blueprint, render_template, request, jsonify
from connection.database import execute_query
from datetime import datetime
from .utils.constans import BPM
from .utils.helpers import image_to_base64
from .utils.helpers import generar_reporte
from .utils.helpers import get_cabecera_formato
from .utils.helpers import get_ultimo_dia_laboral_del_mes

########## PARA REGISTRO Y CONTROL DE ENVASADOS ###################################################################################

controlEnvasados = Blueprint('control_envasados', __name__)

@controlEnvasados.route('/', methods=['GET', 'POST'])
def control_envasados():
    if request.method == 'GET':
        try:
            #Obtener si existe el registro de control de envasados creado
            query_registros_envasados = "SELECT * FROM registros_controles_envasados WHERE estado = 'CREADO'"
            control_envasados_creado = execute_query(query_registros_envasados)

            #Obtener el responsable para seleccionar
            responsable_envasado = execute_query("SELECT * FROM trabajadores WHERE estado_trabajador = 'ACTIVO'")

            #Obtener el producto para seleccionar
            producto_envasado = execute_query("SELECT * FROM productos")

            #Obtener el proveedor a seleccionar 
            proveedores_envasado = execute_query("SELECT idproveedor, nom_empresa FROM proveedores")

            #Vista para mostrar el detalle de los registros de control de envasados activos
            detalle_control_envasados = execute_query("SELECT * FROM v_registros_controles_envasados WHERE estado = 'CREADO'")

            #Obtener el historial de los registros de controles ambientales
            query_historial_envasados = "SELECT * FROM v_historial_registros_controles_envasados"
            historial_envasados  = execute_query(query_historial_envasados)

            return render_template('registro_control_envasados.html', control_envasados_creado=control_envasados_creado, historial_envasados=historial_envasados, responsable_envasado=responsable_envasado, producto_envasado=producto_envasado, proveedores_envasado=proveedores_envasado, detalle_control_envasados=detalle_control_envasados)
        
        except Exception as e:
            print(f"Error al obtener datos: {e}")
            return render_template('registro_control_envasados.html')

    elif request.method == 'POST':
        try:

            # Obtener datos del formulario
            responsable = request.form.get('selectResponsable')
            producto = request.form.get('selectProducto')
            cantidadProducida = request.form.get('cantidadProducida')
            Proveedor =request.form.get('selectProveedor')
            loteProveedor = request.form.get('loteProveedor')
            loteAsignado = request.form.get('loteAsignado')
            fechaVencimiento = request.form.get('fechaVencimiento')
            observacionesEnvasados = request.form.get('observacionesEnvasados')

            # Verificar si hay un formato 'CREADO' para el tipo de formato 2
            query_formatos = "SELECT id_registro_control_envasados FROM registros_controles_envasados WHERE fk_idtipoformatos = 5 AND estado = 'CREADO'"
            registroEnvasado = execute_query(query_formatos)

            if not registroEnvasado:
                return jsonify({'status': 'error', 'message': 'No se encontró un formato válido para registrar el registro de control de envasados.'}), 400
            
            if not observacionesEnvasados:
                observacionAsignada = "-"
            else:
                observacionAsignada = observacionesEnvasados

            try:
                # Insertar lavado de manos
                query_insertar_controles_envasados = """ 
                    INSERT INTO detalles_registros_controles_envasados (fk_idtrabajador, fk_idproducto, cantidad_producida, 
                                                                        fk_idproveedor, lote_proveedor, lote_asignado, fecha_vencimiento, 
                                                                        observacion, fk_id_registro_control_envasado) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                """
                
                execute_query(query_insertar_controles_envasados, (responsable, producto, cantidadProducida, Proveedor, loteProveedor, loteAsignado, fechaVencimiento, observacionAsignada, registroEnvasado[0]['id_registro_control_envasados']))
            except Exception as e:
                # Convertir el mensaje de error a string
                return jsonify({'status': 'error', 'message': str(e)}), 500
            
            return jsonify({'status': 'success', 'message': 'Controles de envasados registrado.'}), 200

        except Exception as e:
            print(f"Error al procesar la solicitud POST: {e}")
            return jsonify({'status': 'error', 'message': 'Ocurrió un error al registrar el control de envasados registrado.'}), 500

@controlEnvasados.route('/generar_formato_envasados', methods=['POST'])
def generar_formato_envasados():
    try:
        fecha_actual = datetime.now()

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

