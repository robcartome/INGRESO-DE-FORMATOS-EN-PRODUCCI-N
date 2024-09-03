from flask import Blueprint, render_template, request, jsonify, send_file
from connection.database import execute_query
import base64
from datetime import datetime
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer, Frame, PageTemplate, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import io
from collections import defaultdict

########## PARA LAVADO_MANOS.HTML ###################################################################################

lavadoMano = Blueprint('lavado_Manos', __name__)

@lavadoMano.route('/', methods=['GET', 'POST'])
def lavado_Manos():
    if request.method == 'GET':
        try:
            # Obtener a los trabajadores
            query_lavado_manos = """SELECT * FROM v_lavados_manos WHERE estado = 'CREADO' ORDER BY idmano DESC"""
            lavado_manos = execute_query(query_lavado_manos)

            query_trabajadores = "SELECT idtrabajador, CONCAT(nombres, ' ', apellidos) AS nombres FROM trabajadores"
            trabajadores = execute_query(query_trabajadores)

            query_formatos = "SELECT estado FROM formatos WHERE fk_idtipoformato = 2 AND estado = 'CREADO'"
            formatos = execute_query(query_formatos)

            query_historialLavadoMano = "SELECT * FROM v_historial_lavado_manos"
            historialLavadoMano = execute_query(query_historialLavadoMano)

            return render_template('lavado_manos.html', formatos=formatos, lavado_manos=lavado_manos, trabajadores=trabajadores, historialLavadoMano=historialLavadoMano)
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
    
@lavadoMano.route('/finalizar_lavado_manos', methods=['POST'])
def finalizar_lavado_manos():
    try:
        # Consulta para obtener el id del formato en estado 'CREADO'
        query_formatos = "SELECT idformatos FROM formatos WHERE fk_idtipoformato = 2 AND estado = 'CREADO'"
        formato = execute_query(query_formatos)

        # Verificar si se obtuvo un resultado
        if not formato or len(formato) == 0:
            return jsonify({'status': 'error', 'message': 'No se encontró un formato en estado "CREADO".'}), 400

        # Asegurarse de acceder correctamente al ID del formato
        id_formatos = formato[0][0] if isinstance(formato[0], (list, tuple)) else formato[0]['idformatos']

        # Actualizar el estado del formato a 'CERRADO'
        query_update_lavado = "UPDATE formatos SET estado = 'CERRADO' WHERE idformatos = %s"
        execute_query(query_update_lavado, (id_formatos,))

        return jsonify({'status': 'success', 'message': 'Se cerró el formato de lavado de manos.'}), 200

    except Exception as e:
        print(f"Error al generar el formato: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al generar el formato.'}), 500

@lavadoMano.route('/obtener_detalle_lavado/<int:id_formatos>', methods=['GET'])
def obtener_detalle_lavado(id_formatos):
    try:
        # Ejecutar la consulta SQL para obtener los detalles
        query = "SELECT * FROM lavadosmanos WHERE idmano = %s"
        detalles = execute_query(query, (id_formatos,))

        # Verificar si se encontraron resultados
        if not detalles:
            return jsonify({'status': 'error', 'message': 'No se encontraron detalles para el registro.'}), 404

        # Convertir los objetos datetime a string para JSON serialization
        detalle = detalles[0]
        detalle['fecha'] = detalle['fecha'].strftime('%Y-%m-%d')  # Formato de fecha
        detalle['hora'] = detalle['hora'].strftime('%H:%M:%S')    # Formato de hora

        # Enviar los detalles de vuelta al frontend
        return jsonify({'status': 'success', 'detalle': detalle}), 200

    except Exception as e:
        print(f"Error al obtener los detalles: {e}")
        return jsonify({'status': 'error', 'message': 'Hubo un error al obtener los detalles.'}), 500
    

def generar_pdf_formato_lavado_mano(detalle_lavado_manos,formato_lavado_registro):
    try:
        # Verificar que la consulta trajo resultados y acceder al primer elemento
        if not detalle_lavado_manos:
            raise Exception("No se encontraron detalles para el formato de lavado de manos.")

        # Asumiendo que detalle_lavado_manos es una lista y accedemos al primer registro
        detalle = detalle_lavado_manos[0]
        fecha_lavado = detalle['fecha'].strftime('%d/%m/%Y')
        hora_lavado = detalle['hora'].strftime('%H:%M')
        nombre_trabajador = detalle.get('nombre_formateado', 'N/A')

        mes = str(formato_lavado_registro['mes'])
        anio = str(formato_lavado_registro['anio'])

        # Crear un buffer en memoria
        pdf_buffer = io.BytesIO()

        # Configurar el documento PDF
        doc = SimpleDocTemplate(pdf_buffer, pagesize=landscape(letter), topMargin=20)

        # Lista de elementos para el PDF
        elements = []

        # Estilos para el texto
        styles = getSampleStyleSheet()
        header_style = ParagraphStyle(
            'header_style',
            parent=styles['Title'],
            fontSize=16,
            spaceAfter=12,
            alignment=1  # Centrado
        )
        normal_style = ParagraphStyle(name='Normal', parent=styles['Normal'], fontSize=10)
        bold_style = ParagraphStyle(name='Bold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10)
        center_style = ParagraphStyle(
            name='CenterAligned',
            parent=getSampleStyleSheet()['Normal'],
            alignment=1
        )
        # Crear un estilo de párrafo para alineación a la derecha
        right_aligned_style = ParagraphStyle(
            name='RightAligned',
            parent=getSampleStyleSheet()['Normal'],
            alignment=2  # 2 representa la alineación a la derecha
        )


        # Encabezado
        header = [Paragraph("MANUAL DE BUENAS PRÁCTICAS DE MANUFACTURA", header_style)]
        table_header = [[header[0]]]

        # Información del encabezado
        table_header.append([
            Paragraph('CAPÍTULO V: FORMATOS', normal_style),
            Paragraph('CONTROL GENERAL DEL PERSONAL', normal_style)
        ])
        table_header.append([
            Paragraph('Edición: 01', normal_style),
            Paragraph('Revisión: 0', normal_style),
            Paragraph('Fecha de Aprobación: Febrero 2023', normal_style),
            Paragraph('Código: TI-BPM-F07-CGP', normal_style)
        ])

        # Definir la tabla y los estilos
        table = Table(table_header, colWidths=[1.775 * inch, 1.475 * inch, 2.975 * inch, 2.275 * inch])
        table.setStyle(TableStyle([
            ('SPAN', (0, 0), (-1, 0)),  
            ('BACKGROUND', (0, 0), (-1, 0), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('SPAN', (0, 1), (0, 1)),  
            ('SPAN', (1, 1), (-1, 1)),  
            ('ALIGN', (0, 1), (0, 1), 'LEFT'),  
            ('ALIGN', (1, 1), (-1, 1), 'CENTER'),  
            ('VALIGN', (1, 1), (-1, 1), 'MIDDLE'),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 12),
            ('BACKGROUND', (0, 1), (-1, 1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, 1), colors.black),
            ('BOTTOMPADDING', (0, 1), (-1, 1), 8),
            ('ALIGN', (0, 2), (-1, 2), 'CENTER'),
            ('FONTNAME', (0, 2), (-1, 2), 'Helvetica'),
            ('FONTSIZE', (0, 2), (-1, 2), 10),
            ('BACKGROUND', (0, 2), (-1, 2), colors.white),
            ('TEXTCOLOR', (0, 2), (-1, 2), colors.black),
            ('BOTTOMPADDING', (0, 2), (-1, 2), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))

        # Cargar la imagen y ajustar el tamaño
        image_path = 'static/img/logo.png'  # Reemplaza con la ruta de tu imagen
        imagen = Image(image_path, width=1 * inch, height=0.5 * inch)

        # Crear una tabla con la imagen y la tabla de contenido
        combined_table = Table([[imagen, table]], colWidths=[1.5 * inch, 8.5 * inch])
        combined_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('VALIGN', (0, 0), (0, 0), 'MIDDLE'),
            ('VALIGN', (1, 0), (1, 0), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))

        elements.append(combined_table)
        elements.append(Spacer(1, 6))

        # Crear contenido de las celdas como Paragraphs
        fecha = Paragraph(F"<b>Fecha: {fecha_lavado}</b>", normal_style)

        # Subtabla para "Mes" y "Año"
        mes_anio = Table(
            [[Paragraph(f"<b>Mes: {mes}</b>", normal_style), Paragraph(f"<b>Año: {anio}</b>", normal_style)]],
            colWidths=[90, 70]
        )

        # "Frecuencia de Registro" alineado a la derecha
        frecuencia_registro = Paragraph("<b>Frecuencia de Registro:</b>", right_aligned_style)
        dias_al_mes = Paragraph("<b>DÍAS AL MES</b>", center_style)

        # Crear la tabla con el diseño requerido y una celda vacía solo entre "Mes-Año" y "Frecuencia de Registro"
        data = [
            [fecha, mes_anio, '', frecuencia_registro, dias_al_mes]
        ]

        # Definir la tabla y su estilo
        table_data = Table(data, colWidths=[1.7 * inch, 3 * inch, 1.6 * inch, 2 * inch, 1.7 * inch])
        table_data.setStyle(TableStyle([
            ('GRID', (0, 0), (0, -1), 0.5, colors.white),
            ('GRID', (1, 0), (1, -1), 0.5, colors.grey),  # Borde de las celdas
            ('GRID', (2, 0), (3, -1), 0.5, colors.white),
            ('GRID', (4, 0), (4, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),        # Alineación vertical en el medio
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),             # Alineación del primer texto a la izquierda
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),           # Alineación del sub-table en el centro
            ('ALIGN', (3, 0), (3, 0), 'RIGHT'),            # Alineación de "Frecuencia de Registro" a la derecha
            ('ALIGN', (4, 0), (4, 0), 'CENTER'),           # Alineación del texto "DÍAS AL MES" en el centro
            ('LEFTPADDING', (2, 0), (2, 0), 5),            # Espaciado solo entre "Mes-Año" y "Frecuencia de Registro"
            ('RIGHTPADDING', (2, 0), (2, 0), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),           # Espaciado superior
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),        # Espaciado inferior
        ]))

        elements.append(table_data)
        elements.append(Spacer(1, 12))

        # Crear la tabla principal con el encabezado "FECHA", "NOMBRES" y "HORAS"
        data_dos = [['FECHA', 'NOMBRES', 'HORAS']]  # Encabezado de la tabla
        span_indices = []  # Para guardar los índices de las filas que necesitan `SPAN`

        # Crear un diccionario para agrupar los registros por fecha y nombre
        agrupados_por_fecha = defaultdict(lambda: defaultdict(list))
        for registro in detalle_lavado_manos:
            fecha = registro['fecha']
            nombre = registro['nombre_formateado']
            hora = registro['hora'].strftime('%H:%M')  # Formatear la hora
            agrupados_por_fecha[fecha][nombre].append(hora)

        # Agregar las fechas, nombres y horas correspondientes a `data_dos`
        for fecha, nombres in agrupados_por_fecha.items():
            fecha_formateada = fecha.strftime('%d/%m/%Y')  # Formatea la fecha como día/mes/año
            
            # Añadir cada nombre en filas separadas bajo la misma fecha con sus horas
            first_row = True
            for nombre, horas in nombres.items():
                # Crear la lista de horas en columnas con líneas divisorias verticales
                horas_registradas = [[Paragraph(hora, normal_style) for hora in horas]]
                
                # Convertir las horas en una subtabla con líneas divisorias verticales
                horas_table = Table(horas_registradas)
                horas_table.setStyle(TableStyle([
                    ('LINEAFTER', (0, 0), (-2, 0), 0.5, colors.grey),  # Línea divisoria vertical entre horas
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ]))

                if first_row:
                    data_dos.append([fecha_formateada, nombre, horas_table])  # Agrega la fecha en la primera fila de los nombres y horas
                    span_start = len(data_dos) - 1  # Marca el inicio del span
                    first_row = False
                else:
                    data_dos.append(['', nombre, horas_table])  # Añadir nombres y horas en las siguientes filas bajo la misma fecha
            
            # Agregar los índices de span para la fecha actual
            span_indices.append((span_start, len(data_dos) - 1))

        # Crear la tabla con las fechas, nombres y horas
        table_registro = Table(data_dos, colWidths=[2 * inch, 2.5 * inch, 4 * inch])  # Ajusta el ancho de las columnas según sea necesario
        table_style = TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),  # Borde de las celdas
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),          # Alinear al centro
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),         # Alinear verticalmente al medio
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), # Cabecera en negrita
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),  # Fondo gris para la cabecera
        ])

        # Aplicar SPAN a las fechas
        for start, end in span_indices:
            table_style.add('SPAN', (0, start), (0, end))

        # Agregar el estilo a la tabla
        table_registro.setStyle(table_style)

        # Agregar la tabla al documento
        elements.append(table_registro)

        # Construir el documento
        doc.build(elements)

        # Regresar el buffer del PDF
        pdf_buffer.seek(0)
        return pdf_buffer

    except Exception as e:
        print(f"Error al generar el PDF: {e}")
        return jsonify({'status': 'error', 'message': 'Error al generar el PDF.'}), 500

@lavadoMano.route('/download_formato', methods=['GET'])
def download_formato():
    # Obtener el id del trabajador de los argumentos de la URL
    formato_lavado_id = request.args.get('formato_id')

    # Realizar la consulta para obtener el formato de lavado de mano que corresponda
    detalle_lavado_manos = execute_query(f"SELECT * FROM v_lavados_manos WHERE idformatos = {formato_lavado_id}")

    #Obtener el formato de lavado de manos con sus detalles
    formato_lavado_registro = execute_query(F"""SELECT 
                                                    idformatos,
                                                    TO_CHAR(TO_DATE(mes || ' ' || anio, 'MM YYYY'), 'TMMonth') AS mes,
                                                    anio,
                                                    fk_idtipoformato,
                                                    estado
                                                FROM 
                                                    formatos 
                                                WHERE 
                                                    idformatos = {formato_lavado_id}""")
    seleccionar_formato = formato_lavado_registro[0]
    # Generar el PDF con la información del trabajador
    pdf_buffer = generar_pdf_formato_lavado_mano(detalle_lavado_manos,seleccionar_formato)

    return send_file(pdf_buffer, as_attachment=True, download_name="Formato_Lavado_Manos.pdf", mimetype='application/pdf')