from flask import Flask, redirect

# Rutas
from routes.home import home
from routes.lavado_manos import lavadoMano
from routes.control_general_personal import controlGeneral
from routes.kardex import kardex
from routes.control_condiciones_ambientales import condiciones_ambientales
from routes.registro_control_envasados import controlEnvasados
from routes.higiene_personal import higienePersona
from routes.limpieza_areas import limpieza_areas
from routes.limpieza_equipos_medicion import limpieza_equipos_medicion
from routes.registro_monitoreo_insectos import registro_monitoreo_insectos
from routes.registro_monitoreo_roedores import registro_monitoreo_roedores

app = Flask(__name__)

# Llamar a las rutas
app.register_blueprint(home, url_prefix="/home")
app.register_blueprint(lavadoMano, url_prefix = "/lavado_Manos")
app.register_blueprint(controlGeneral, url_prefix='/control_general')
app.register_blueprint(kardex, url_prefix='/kardex')
app.register_blueprint(condiciones_ambientales, url_prefix='/condiciones_ambientales')
app.register_blueprint(controlEnvasados, url_prefix='/control_envasados')
app.register_blueprint(higienePersona, url_prefix='/higiene_personal')
app.register_blueprint(limpieza_areas, url_prefix='/limpieza_areas')
app.register_blueprint(limpieza_equipos_medicion, url_prefix='/limpieza_equipos_medicion')
app.register_blueprint(registro_monitoreo_insectos, url_prefix = '/registro_monitoreo_insectos')
app.register_blueprint(registro_monitoreo_roedores, url_prefix = '/registro_monitoreo_roedores')

# Definiendo la ruta por defecto
@app.route('/')
def default():
    return redirect('/home')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
