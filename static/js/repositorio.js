// Función para guardar documentos
function sendFileIFP() {
    const archivosPDF = document.getElementById('archivosPDF').files;
    if (archivosPDF.length === 0) {
        alert("Por favor, selecciona al menos un archivo.");
        return;
    }

    const data = new FormData();
    for (let i = 0; i < archivosPDF.length; i++) {
        data.append('archivosPDF', archivosPDF[i]);
    }

    // Seleccionar el loader específico para el grupo
    const loader = document.getElementById(`loagDocument`);

    if (loader) {
        loader.style.display = 'flex';
    }

    fetch('/repositorio_IFP/send_file_IFP', {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            loader.style.display = 'none';
            Swal.fire({
                // Ocultar el loader después de completar o si ocurre un error
                icon: 'success',
                title: '¡Archivos guardados!',
                text: 'Se guardaron exitosamente todos los documentos.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || 'Ocurrió un error al guardar los documentos. Inténtalo de nuevo.',
            });
        }
    })
    .catch(error => {
        console.error("Error al cargar los documentos:", error);
        Swal.fire('Error', 'Hubo un error al cargar los documentos. Inténtelo nuevamente.', 'error');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    function loadFiles(mesAnio) {

        // Seleccionar el loader específico para el grupo
        const loader = document.getElementById(`loagDocumentSubidos`);

        if (loader) {
            loader.style.display = 'flex';
        }

        const [anio, mes] = mesAnio ? mesAnio.split('-') : ['', ''];
        const mesTexto = monthNames[parseInt(mes) - 1]; // Convertir número a nombre de mes

        fetch(`/repositorio_IFP/list_files?mes=${mesTexto}&anio=${anio}`)
            .then(response => response.json())
            .then(data => {
                const accordion = document.getElementById('accordionDocumentos');
                accordion.innerHTML = ''; // Limpiar el acordeón antes de cargar

                if (data.status === 'success') {
                    loader.style.display = 'none';
                    const groupedFiles = data.files;
                    let index = 0;

                    for (const [nombreFormato, files] of Object.entries(groupedFiles)) {
                        // Crear encabezado para el acordeón
                        const card = document.createElement('div');
                        card.className = 'card';

                        const cardHeader = document.createElement('div');
                        cardHeader.className = 'card-header d-flex justify-content-between align-items-center';
                        cardHeader.id = `heading${index}`;
                        cardHeader.style = `background-color: #FFD700; border: 1px solid black;`;
                        cardHeader.innerHTML = `
                            <h5 class="mb-0">
                                <button class="btn btn-link" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}" style="color: black">
                                    ${nombreFormato}
                                </button>
                            </h5>
                        `;
                        card.appendChild(cardHeader);

                        // Crear el cuerpo del acordeón
                        const collapseDiv = document.createElement('div');
                        collapseDiv.id = `collapse${index}`;
                        collapseDiv.className = 'collapse';
                        collapseDiv.setAttribute('aria-labelledby', `heading${index}`);
                        collapseDiv.setAttribute('data-parent', '#accordionDocumentos');

                        const cardBody = document.createElement('div');
                        cardBody.className = 'card-body';

                        files.forEach(file => {
                            const listItem = document.createElement('div');
                            listItem.className = 'd-flex justify-content-between align-items-center mb-2 accordion-item-hover';
                            
                            // Mostrar solo el nombre del archivo
                            const fileName = file.file_name.replace('repositorio_IFP/', '');
                        
                            // Asigna el evento de previsualización al elemento completo
                            listItem.onclick = () => previewDocument(file.file_name);
                        
                            listItem.innerHTML = `
                                <span>${fileName}</span>
                                <div class="d-flex align-items-center gap-2">
                                    <button class="btn btn-warning btn-sm px-3 py-2 rounded-pill shadow-sm" onclick="event.stopPropagation(); downloadFile('${file.file_name}')">
                                        <i class="bi bi-download me-1"></i> Descargar
                                    </button>
                                </div>
                            `;
                            cardBody.appendChild(listItem);
                        });                        

                        collapseDiv.appendChild(cardBody);
                        card.appendChild(collapseDiv);
                        accordion.appendChild(card);

                        index++;
                    }
                } else {
                    console.error(data.message);
                    Swal.fire('Error', data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error al obtener la lista de documentos:', error);
                Swal.fire('Error', 'Hubo un error al obtener la lista de documentos', 'error');
            });
    }

    document.getElementById('filterButton').addEventListener('click', function() {
        const mesAnio = document.getElementById('mesAnioFiltro').value;
        loadFiles(mesAnio);
    });
});

function previewDocument(filename) {
    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.src = `/repositorio_IFP/preview/${filename}`;
    $('#previewModal').modal('show');
}

function downloadFile(filename) {
    window.location.href = `/repositorio_IFP/downloadFile/${filename}`;
}
