from flask import Blueprint, session, render_template, request, jsonify
from connection.database import execute_query
import base64

########## PARA LAVADO_MANOS.HTML ###################################################################################

lavadoMano = Blueprint('lavado_Manos', __name__)

@lavadoMano.route('/', methods=['GET', 'POST'])
def lavado_Manos():
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

            return render_template('lavado_manos.html', trabajadores=trabajadores, genero=genero)
        except Exception as e:
            print(f"Error al obtener datos: {e}")
            return render_template('lavado_manos.html')

        #Solicitar usuarios

        
