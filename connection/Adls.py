from io import BytesIO
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

class Adls:
    def __init__(self, type: int = 1, container: str = None):
        # Cargar las variables de entorno
        load_dotenv()

        # Obtener la cadena de conexión del archivo .env
        self.__connections_string = os.getenv('connections_string')
        self.__container = container

        if not self.__connections_string:
            raise ValueError("La cadena de conexión no está configurada en el archivo .env")

        # Inicializar el cliente de servicio de blobs al crear la instancia
        self.blob_service_client = BlobServiceClient.from_connection_string(self.__connections_string)

    @property
    def container(self):
        return self.__container

    @container.setter
    def container(self, value: str):
        self.__container = value

    def upload_from_memory(self, memory_file: BytesIO, url: str):
        """
        Sube un archivo desde la memoria (BytesIO) al contenedor de Azure Blob Storage.
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(container=self.__container, blob=url)
            blob_client.upload_blob(memory_file, overwrite=True)
            return True
        except Exception as e:
            print(f"Error al subir archivo desde memoria: {e}")
            return False

    def download(self, url: str):
        """
        Descarga un archivo desde Azure Blob Storage y lo devuelve como un stream.
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(container=self.__container, blob=url)
            print(f"Descargando archivo desde Azure Blob Storage: {url}")
            blob_stream = blob_client.download_blob().readall()

            if not blob_stream:
                print("El archivo está vacío o no se pudo descargar.")
                return None

            return blob_stream
        except Exception as e:
            print(f"Error al descargar archivo: {str(e)}")
            return None

    def list_files_in_directory(self, directory_path: str):
        """
        Lista todos los archivos en un directorio específico dentro del contenedor.
        """
        try:
            container_client = self.blob_service_client.get_container_client(self.__container)
            blob_list = container_client.list_blobs(name_starts_with=directory_path)
            return [blob.name for blob in blob_list]
        except Exception as e:
            print(f"Error al listar archivos: {e}")
            return None

    def generate_sas_url(self, blob_name: str, expiration_minutes: int = 43200):
        """
        Genera una URL con firma SAS para acceder al archivo de manera segura durante un mes.
        :param blob_name: Nombre del archivo en el contenedor.
        :param expiration_days: Tiempo en días para que la URL expire.
        :return: URL con firma SAS.
        """
        try:
            # Configurar la expiración para un mes (30 días)
            sas_token = generate_blob_sas(
                account_name=self.blob_service_client.account_name,
                container_name=self.__container,
                blob_name=blob_name,
                account_key=self.blob_service_client.credential.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(minutes=expiration_minutes)
            )

            # Construir la URL completa con el token SAS
            sas_url = f"https://{self.blob_service_client.account_name}.blob.core.windows.net/{self.__container}/{blob_name}?{sas_token}"
            return sas_url

        except Exception as e:
            print(f"Error al generar la URL SAS: {str(e)}")
            return None
