from io import BytesIO
from connection.Adls import Adls 
from dotenv import load_dotenv
import os

load_dotenv()

# Instancia de la clase Adls para interactuar con Azure Blob Storage
adls = Adls(type=1, container=os.getenv('container'))

def upload_file(file_data, file_name):
    """
    Sube un documento a Azure Blob Storage en la carpeta repositorio_IFP.
    """
    try:
        if not file_data:
            raise ValueError("El archivo proporcionado está vacío.")

        # Verificar que el contenedor esté configurado
        container = os.getenv('container')

        if not container:
            raise ValueError("El contenedor no está configurado correctamente.")

        # Crear un nombre único para el archivo si no se proporciona
        if not file_name:
            raise ValueError("El documento no tiene nombre.")
        
        # Definir la ruta del archivo en el contenedor de Azure Blob Storage
        blob_url_file = f"repositorio_IFP/{file_name}"
        print(f"Subiendo archivo a: {blob_url_file}")

        # Convertir los datos del archivo a un flujo de BytesIO
        file_bytes = BytesIO(file_data)
        print("Bytes leídos del archivo:", file_bytes.getbuffer().nbytes)

        # Subir el archivo a Azure Blob Storage
        file_upload_result = adls.upload_from_memory(file_bytes, blob_url_file)
        print("Resultado de la carga:", file_upload_result)

        if file_upload_result:
            print(f"El documento '{file_name}' ha sido subido correctamente.")
        else:
            print(f"Error al subir el documento '{file_name}'.")
            return False

        return True

    except Exception as e:
        print(f"Error al subir el documento: {str(e)}")
        return False
