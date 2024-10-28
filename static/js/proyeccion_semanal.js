document.addEventListener('DOMContentLoaded', function () {

    $('#selectProducto').select2({
        theme: 'bootstrap4',
        placeholder: "Seleccione el producto",
        allowClear: true,
        width: '100%'
    });
});


function GenerarProyeccion() {
    document.getElementById('loaderGenerar').style.display = 'block';
    fetch('/proyeccion_semanal/generar_proyeccion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loaderGenerar').style.display = 'none';
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: '¡Proyección generada!',
                text: 'La proyección semanal se generó correctamente.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                location.reload();  // Recargar la página para mostrar los cambios
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Hubo un error al generar la proyección. Por favor, inténtelo nuevamente.',
            });
        }
    })
    .catch(error => {
        console.error('Error al generar la proyección:', error);
    });
}

function FinalizarProyeccion(){
    document.getElementById('loaderFinalizar').style.display = 'block';
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción finalizará la proyección semanal.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, finalizar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/proyeccion_semanal/finalizar_proyeccion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('loaderFinalizar').style.display = 'none';
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Proyección finalizada!',
                        text: 'La proyección semanal se finalizó correctamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Hubo un error al finalizar la proyección. Por favor, inténtelo nuevamente.',
                    });
                }
            })
            .catch(error => {
                console.error('Error al finalizar la proyección:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
                });
            });
        }
    });
}

function QuitarProyeccion(idproyeccion) {
    // Mostrar alerta de confirmación
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará la proyección seleccionada.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario confirma, se realiza la solicitud de eliminación
            fetch(`/proyeccion_semanal/quitar_proyeccion/${idproyeccion}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Proyección quitada!',
                        text: 'La proyección semanal se quitó correctamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Hubo un error al quitar la proyección. Por favor, inténtelo nuevamente.',
                    });
                }
            })
            .catch(error => {
                console.error('Error al quitar la proyección:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
                });
            });
        }
    });
}

function AgregarProducto(){
    const selectProducto = document.getElementById('selectProducto').value;
    
    if (!selectProducto) {
        Swal.fire({
            icon: 'warning',
            title: 'Seleccione un producto',
            text: 'Debe seleccionar un producto antes de agregarlo a la proyección.'
        });
        return;
    }

    fetch('/proyeccion_semanal/AgregarProducto', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectProducto: selectProducto })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: '¡Proyección generada!',
                text: 'La proyección para este producto se agregó para esta semana.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                location.reload(); 
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Hubo un error al generar la proyección. Por favor, inténtelo nuevamente.',
            });
        }
    })
    .catch(error => {
        console.error('Error al generar la proyección:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
        });
    });
}


// Filtros
function filterOpenProduct() {
    let input = document.getElementById('filtrarProducto');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('TableOpen');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toLowerCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}

function GuardarProyeccion() {
    // Mostrar loader
    document.getElementById('loader').style.display = 'block';

    let table = document.getElementById('TableOpen');
    let rows = table.getElementsByTagName('tr');
    let cambios = [];

    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let id = row.getAttribute('data-id');
        let proyeccion_register = row.querySelector('input[name="proyeccion_register"]').value;
        let selectSemana = row.querySelector('select[name="selectSemana"]').value;

        cambios.push({
            idproyeccion: id,
            proyeccion_register: proyeccion_register,
            selectSemana: selectSemana
        });
    }

    fetch('/proyeccion_semanal/guardar_proyeccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios)
    })
    .then(response => response.json())
    .then(data => {
        // Ocultar loader al completar la operación
        document.getElementById('loader').style.display = 'none';

        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: '¡Proyección actualizada!',
                text: 'La proyección fue actualizada correctamente.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => location.reload());
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Hubo un error al actualizar la proyección. Intente nuevamente.'
            });
        }
    })
    .catch(error => {
        console.error('Error al guardar los cambios:', error);
        document.getElementById('loader').style.display = 'none';
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al guardar los cambios. Intente nuevamente.'
        });
    });
}

// Función de filtro para el historial de proyecciones
function filterHistory() {
    // Obtener la fecha seleccionada en el input de tipo date
    let input = document.getElementById("filter").value;
    if (!input) return; // Si no hay fecha seleccionada, salir

    // Convertir la fecha seleccionada al formato "yyyy-mm-dd" para la comparación
    let filterDate = new Date(input).toISOString().split('T')[0];

    // Obtener todas las cards en el acordeón
    let cards = document.getElementById("acordionProyeccionesFinalizadas").getElementsByClassName("card");

    for (let i = 0; i < cards.length; i++) {
        let btn = cards[i].getElementsByTagName("button")[0];
        if (btn) {
            // Obtener las fechas de inicio y fin en el formato "dd/mm/yyyy - dd/mm/yyyy"
            let text = btn.textContent || btn.innerText;
            let dateRange = text.match(/\d{2}\/\d{2}\/\d{4}/g);

            if (dateRange) {
                // Convertir las fechas de rango a "yyyy-mm-dd" para comparar
                let startDate = formatDateToISO(dateRange[0]);
                let endDate = formatDateToISO(dateRange[1]);

                // Verificar si la fecha seleccionada está dentro del rango
                if (filterDate >= startDate && filterDate <= endDate) {
                    cards[i].style.display = "";
                } else {
                    cards[i].style.display = "none";
                }
            } else {
                cards[i].style.display = "none"; // Si no hay fechas, ocultar el card
            }
        }
    }
}

// Función para convertir "dd/mm/yyyy" a "yyyy-mm-dd" para la comparación
function formatDateToISO(dateStr) {
    let [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}



const itemsPerPage = 5; // Número de semanas por página
        let currentPage = 1;
    
        // Función para cargar las semanas paginadas
        function loadHistoryPage(page = 1) {
            currentPage = page;
            fetch(`/proyeccion_semanal/historial?page=${page}&itemsPerPage=${itemsPerPage}`)
                .then(response => response.json())
                .then(data => {
                    renderHistory(data.weeks);
                    renderPagination(data.totalPages, page);
                });
        }
    
        // Renderizar la lista de semanas
        function renderHistory(weeks) {
            const container = document.getElementById('acordionProyeccionesFinalizadas');
            container.innerHTML = '';
            weeks.forEach((week, index) => {
                container.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-header bg-warning" id="heading${index}">
                            <h6 class="mb-0">
                                <button class="btn btn-link text-white p-0 font-weight-bold" onclick="loadWeekDetails(${week.id})">
                                    Proyección de la Semana: ${week.semana}
                                </button>
                            </h6>
                        </div>
                    </div>`;
            });
        }
    
        // Renderizar los controles de paginación
        function renderPagination(totalPages, currentPage) {
            const pagination = document.getElementById('pagination');
            pagination.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                pagination.innerHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="javascript:loadHistoryPage(${i})">${i}</a>
                    </li>`;
            }
        }
    
        // Cargar detalles de una semana en el modal
        function loadWeekDetails(weekId) {
            fetch(`/proyeccion_semanal/detalle/${weekId}`)
                .then(response => response.text())
                .then(data => {
                    document.getElementById('detalleSemanaContent').innerHTML = data;
                    $('#detalleSemanaModal').modal('show');
                });
        }
    
        // Cargar la primera página al iniciar
        loadHistoryPage();