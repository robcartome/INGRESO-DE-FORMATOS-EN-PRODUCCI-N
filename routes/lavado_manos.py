from flask import Blueprint, session, render_template, request, jsonify

########## PARA LAVADO_MANOS.HTML ###################################################################################

lavadoMano = Blueprint('lavado_Manos', __name__)

@lavadoMano.route('/', methods=['GET', 'POST'])
def lavado_Manos():
    if request.method == 'GET':

        #Solicitar usuarios

        return render_template('lavado_manos.html')
