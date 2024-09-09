import base64
import pdfkit

from flask import make_response


def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


def generar_reporte(template, title_report='Reporte sin título', orientation='portrait'):
    """
    Genera un reporte en formato PDF a partir de una plantilla HTML.

    Args:
        template (str): El contenido HTML de la plantilla a renderizar.
        orientation (str): La orientación del PDF ('portrait' para vertical, 'landscape' para horizontal).

    Returns:
        Flask Response: Una respuesta HTTP con el contenido del PDF generado.
    """
    try:
        # Definir opciones para la generación del PDF
        options = {
            'page-size': 'A4',
            'margin-top': '0.4cm',
            'margin-right': '0.4cm',
            'margin-bottom': '1cm',
            'margin-left': '0.4cm',
            'encoding': 'UTF-8',
            'enable-local-file-access': None,
            'orientation': 'landscape' if orientation.lower() == 'landscape' else 'portrait'
        }

        # Configuración de pdfkit con la ruta del ejecutable wkhtmltopdf
        config = pdfkit.configuration(
            wkhtmltopdf="tools/wkhtmltox/bin/wkhtmltopdf.exe")

        # Generar el PDF en memoria desde la cadena HTML de la plantilla
        pdf_content = pdfkit.from_string(template, False, configuration=config, options=options)

        # Crear la respuesta HTTP con el contenido PDF
        response = make_response(pdf_content)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename={title_report}.pdf'
        return response
    except Exception as e:
        print(f"Error al generar el reporte: {e}")
        return make_response("Error al generar el reporte.", 500)
