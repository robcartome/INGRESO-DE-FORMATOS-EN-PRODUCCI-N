# Utiliza una imagen base de Python en Alpine
FROM python:alpine3.18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo requirements.txt al contenedor
COPY requirements.txt .

# Instala las dependencias necesarias del sistema y Python
RUN \
 apk add --no-cache python3 postgresql-libs && \
 apk add --no-cache --virtual .build-deps gcc python3-dev musl-dev postgresql-dev && \
 python3 -m pip install --upgrade pip && \
 python3 -m pip install -r requirements.txt --no-cache-dir && \
 apk --purge del .build-deps && \
 pip install gunicorn eventlet

# Copia el resto de los archivos de la aplicación al contenedor
COPY . .

# Expone el puerto 5000 para la aplicación
EXPOSE 5000

# # Ejecuta Gunicorn para correr la aplicación Flask usando el worker eventlet
# CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--worker-class", "eventlet", "--timeout", "300", "app:app"]

# Ejecuta Flask en modo de desarrollo
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]