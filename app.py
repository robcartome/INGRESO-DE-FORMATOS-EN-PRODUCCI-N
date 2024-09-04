from flask import Flask, redirect

# Rutas
from routes.home import home
from routes.lavado_manos import lavadoMano
from routes.control_general_personal import controlGeneral
from routes.kardex import kardex

app = Flask(__name__)

# Llamar a las rutas
app.register_blueprint(home, url_prefix="/home")
app.register_blueprint(lavadoMano, url_prefix = "/lavado_Manos")
app.register_blueprint(controlGeneral, url_prefix='/control_general')
app.register_blueprint(kardex, url_prefix='/kardex')

# Definiendo la ruta por defecto
@app.route('/')
def default():
    return redirect('/home')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

