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
