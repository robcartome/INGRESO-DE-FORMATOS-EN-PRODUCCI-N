<<<<<<< HEAD
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
=======
FROM python:3.11.9-slim

WORKDIR /home/app

COPY requirements.txt .

# Instala dependencias de sistema y wkhtmltopdf
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wkhtmltopdf \
    libxrender1 \
    libxext6 \
    libfontconfig1 \
    fontconfig && \
    fc-cache -f -v && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install gunicorn && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE 5000

CMD gunicorn --bind 0.0.0.0:5000 run:app
>>>>>>> 36e7f79b2cc142cacd61821fed6ac27fe90aea9d
