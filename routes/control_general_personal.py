from flask import Blueprint, render_template, request, jsonify, make_response, send_file
from connection.database import execute_query
import psycopg2
import base64
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Image, Spacer, Frame, PageTemplate
import io

controlGeneral = Blueprint('control_general', __name__)

@controlGeneral.route('/', methods=['GET', 'POST'])
def control_general():
    if request.method == 'GET':
        try:
            # Obtener a los trabajadores
            query_trabajador = """SELECT t.idtrabajador, t.dni, t.nombres, t.apellidos, 
                                  t.fecha_nacimiento, t.direccion, t.celular, 
                                  t.celular_emergencia, t.fecha_ingreso, 
                                  t.area, t.cargo, t.fk_idsexo, c.carnet_salud 
                                  FROM trabajadores t 
                                  LEFT JOIN controles_generales_personal c 
                                  ON t.idtrabajador = c.fk_idtrabajador"""
            trabajadores = execute_query(query_trabajador)

            query_genero = "SELECT * FROM sexos"
            genero = execute_query(query_genero)

            # Convertir la imagen en Base64 para ser mostrada en el frontend
            for trabajador in trabajadores:
                if trabajador['carnet_salud']:
                    trabajador['carnet_salud'] = base64.b64encode(trabajador['carnet_salud']).decode('utf-8')

            return render_template('control_general_persona.html', trabajadores=trabajadores, genero=genero)
        except Exception as e:
            print(f"Error al obtener datos: {e}")
            return render_template('control_general_persona.html', trabajadores=[], genero=[]), 500


    elif request.method == 'POST':
        try:
            # Obtener datos del formulario
            dniTrabajador = request.form.get('dniTrabajador')
            nombresTrabajador = request.form.get('nombresTrabajador')
            apellidosTrabajador = request.form.get('apellidosTrabajador')
            fechaNacimiento = request.form.get('fechaNacimiento')
            direccionTrabajador = request.form.get('direccionTrabajador')
            celularTrabajador = request.form.get('celularTrabajador')
            celularEmergenciaTrabajador = request.form.get('celularEmergenciaTrabajador')
            fechaIngreso = request.form.get('fechaIngreso')
            areaTrabajador = request.form.get('areaTrabajador')
            cargoTrabajador = request.form.get('cargoTrabajador')
            genero_seleccionar = request.form.get('genero_seleccionar')

            # Manejo del archivo
            carnetSaludTrabajador = request.files.get('carnetSaludTrabajador')
            if not carnetSaludTrabajador:
                return jsonify({'status': 'error', 'message': 'El carnet de salud es obligatorio.'}), 400
            
            file_data = carnetSaludTrabajador.read()

            # Insertar trabajador en la base de datos
            query_insertar_trabajador = """ 
                INSERT INTO trabajadores (dni, nombres, apellidos, fecha_nacimiento, direccion, celular, 
                celular_emergencia, fecha_ingreso, area, cargo, fk_idsexo) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING idtrabajador;
            """
            result = execute_query(query_insertar_trabajador, (
                dniTrabajador, nombresTrabajador, apellidosTrabajador, fechaNacimiento,
                direccionTrabajador, celularTrabajador, celularEmergenciaTrabajador, fechaIngreso,
                areaTrabajador, cargoTrabajador, genero_seleccionar
            ))

            if result and len(result) > 0:
                idTrabajador = result[0]['idtrabajador']

                # Insertar control general personal
                query_insertar_control = """ 
                    INSERT INTO controles_generales_personal (carnet_salud, fk_idtrabajador, fk_idformatos) 
                    VALUES (%s, %s, %s);
                """
                execute_query(query_insertar_control, (
                    psycopg2.Binary(file_data), idTrabajador, 1
                ))

                return jsonify({'status': 'success', 'message': 'Trabajador registrado exitosamente.'}), 200
            else:
                return jsonify({'status': 'error', 'message': 'Error al insertar el trabajador en la base de datos.'}), 500

        except Exception as e:
            print(f"Error al procesar la solicitud POST: {e}")
            return jsonify({'status': 'error', 'message': 'Ocurrió un error al procesar la solicitud.'}), 500



@controlGeneral.route('/update', methods=['POST'])
def update_trabajador():
    try:
        # Obtener datos del formulario
        idTrabajador = request.form.get('idTrabajador')
        dniTrabajador = request.form.get('dniTrabajador')
        nombresTrabajador = request.form.get('nombresTrabajador')
        apellidosTrabajador = request.form.get('apellidosTrabajador')
        fechaNacimiento = request.form.get('fechaNacimiento')
        direccionTrabajador = request.form.get('direccionTrabajador')
        celularTrabajador = request.form.get('celularTrabajador')
        celularEmergenciaTrabajador = request.form.get('celularEmergenciaTrabajador')
        fechaIngreso = request.form.get('fechaIngreso')
        areaTrabajador = request.form.get('areaTrabajador')
        cargoTrabajador = request.form.get('cargoTrabajador')
        genero_seleccionar = request.form.get('genero_seleccionar')

        # Manejo del archivo
        carnetSaludTrabajador = request.files.get('carnetSaludTrabajador')
        file_data = None

        if carnetSaludTrabajador:
            file_data = carnetSaludTrabajador.read()

        # Actualizar información del trabajador en la base de datos
        query_actualizar_trabajador = """ 
            UPDATE trabajadores 
            SET dni=%s, nombres=%s, apellidos=%s, fecha_nacimiento=%s, direccion=%s, 
                celular=%s, celular_emergencia=%s, fecha_ingreso=%s, area=%s, cargo=%s, fk_idsexo=%s
            WHERE idtrabajador=%s;
        """
        execute_query(query_actualizar_trabajador, (
            dniTrabajador, nombresTrabajador, apellidosTrabajador, fechaNacimiento,
            direccionTrabajador, celularTrabajador, celularEmergenciaTrabajador, fechaIngreso,
            areaTrabajador, cargoTrabajador, genero_seleccionar, idTrabajador
        ))

        if file_data:
            # Actualizar el carnet de salud si se subió un nuevo archivo
            query_actualizar_carnet = """ 
                UPDATE controles_generales_personal 
                SET carnet_salud=%s
                WHERE fk_idtrabajador=%s;
            """
            execute_query(query_actualizar_carnet, (
                psycopg2.Binary(file_data), idTrabajador
            ))

        return jsonify({'status': 'success', 'message': 'Información del trabajador actualizada correctamente.'}), 200

    except Exception as e:
        print(f"Error al actualizar el trabajador: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error al actualizar la información del trabajador.'}), 500
    
@controlGeneral.route('/delete', methods=['POST'])
def delete_trabajador():
    try:
        idTrabajador = request.form.get('idTrabajador')

        # Eliminar el registro relacionado en controles_generales_personal
        query_eliminar_control = """
            DELETE FROM controles_generales_personal WHERE fk_idtrabajador = %s;
        """
        execute_query(query_eliminar_control, (idTrabajador,))

        # Eliminar el trabajador de la base de datos
        query_eliminar_trabajador = """
            DELETE FROM trabajadores WHERE idtrabajador = %s;
        """
        execute_query(query_eliminar_trabajador, (idTrabajador,))

        

        return jsonify({'status': 'success', 'message': 'Trabajador eliminado correctamente.'}), 200

    except Exception as e:
        print(f"Error al eliminar el trabajador: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al eliminar el trabajador.'}), 500
    

def generar_pdf_formato_generales_personal():
    try:
        # Crear un buffer en memoria
        pdf_buffer = io.BytesIO()

        # Configurar el documento PDF
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter, topMargin=20)

        # Lista de elementos para el PDF
        elements = []

        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(name='Title', fontSize=16, spaceAfter=10, alignment=1)
        subtitle_style = ParagraphStyle(name='Subtitle', fontSize=14, spaceAfter=10, alignment=1)
        normal_style = ParagraphStyle(name='Normal', parent=styles['Normal'], fontSize=12)

        # Información del encabezado
        data_header = [
            ['CAPÍTULO V: FORMATOS', 'CONTROL GENERAL DEL PERSONAL'],
            ['Edición: 01', 'Revisión: 0', 'Fecha de Aprobación: Febrero 2023', 'Código: TI-BPM-F07-CGP']
        ]
        table_header = Table(data_header, colWidths=[120, 120, 160, 120])

        table_header.setStyle(TableStyle([
            ('SPAN', (0, 0), (1, 0)),
            ('SPAN', (2, 1), (3, 1)),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.red),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elements.append(table_header)

        # Datos del personal
        data_personal = [
            ['NOMBRES:', '', 'APELLIDOS:', ''],
            ['FECHA DE NACIMIENTO:', '', 'SEXO:', ''],
            ['DIRECCIÓN:', '', 'TELÉFONO/CELULAR:', '', 'CELULAR DE EMERGENCIA:', ''],
            ['DNI:', '', 'FECHA DE INGRESO:', ''],
            ['ÁREA:', '', 'CARGO:', '']
        ]
        
        table_personal = Table(data_personal, colWidths=[80, 140, 80, 140, 80, 140])
        table_personal.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('SPAN', (0, 2), (1, 2)),
            ('SPAN', (3, 2), (4, 2)),
            ('SPAN', (0, 4), (1, 4)),
            ('SPAN', (3, 4), (4, 4)),
        ]))
        elements.append(Paragraph("1. DATOS DEL PERSONAL", style_normal))
        elements.append(table_personal)

        # Espacio para el carnet de salud
        elements.append(Paragraph("\n\nPegar Carnet de Salud Vigente", style_normal))

        # Crear el documento PDF
        pdf.build(elements)

        # Configurar la respuesta HTTP
        response = make_response(buffer.getvalue())
        response.headers['Content-Disposition'] = 'attachment; filename=formato_control_general.pdf'
        response.mimetype = 'application/pdf'
        
        buffer.close()
        
        return response

    except Exception as e:
        print(f"Error al generar el PDF: {e}")
        return jsonify({'status': 'error', 'message': 'Error al generar el PDF.'}), 500
    
@controlGeneral.route('/download_formato', methods=['GET'])
def download_formato():

    detalle_trabajador = execute_query("SELECT * FROM trabajadores")

    detalle_control_general = execute_query("SELECT * FROM trabajadores")

    pdf_buffer = generar_pdf_formato_generales_personal(detalle_trabajador,detalle_control_general)

    return send_file(pdf_buffer, as_attachment=True, download_name="reporte_cotizar_utiles.pdf", mimetype='application/pdf')
