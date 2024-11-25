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
        let inicio = row.querySelector('input[name="fechaInicio"]').value;
        let fin = row.querySelector('input[name="fechaFin"]').value;

        cambios.push({
            idproyeccion: id,
            proyeccion_register: proyeccion_register,
            inicioFecha : inicio,
            finFecha : fin
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

function filterHistory() {
    // Obtener la fecha seleccionada en el input de tipo date
    let input = document.getElementById("filter").value;
    if (!input) return; // Si no hay fecha seleccionada, salir

    // Convertir la fecha seleccionada al formato "yyyy-mm-dd" para la comparación
    let filterDate = new Date(input).toISOString().split('T')[0];

    // Obtener la tabla específica usando su ID
    let table = document.getElementById("productionTable");

    // Verificar si la tabla existe
    if (!table) {
        console.error("No se encontró la tabla con el ID 'productionTable'.");
        return;
    }

    // Obtener todas las filas del cuerpo de la tabla
    let rows = table.querySelectorAll("tbody tr");

    rows.forEach(row => {
        // Obtener las celdas de las fechas de inicio y fin
        let startDateCell = row.querySelector("td:nth-child(4)"); // Columna de inicio
        let endDateCell = row.querySelector("td:nth-child(5)");   // Columna de fin

        if (startDateCell && endDateCell) {
            // Extraer y convertir las fechas a formato "yyyy-mm-dd"
            let startDate = formatDateToISO(startDateCell.textContent.trim());
            let endDate = formatDateToISO(endDateCell.textContent.trim());

            // Verificar si la fecha seleccionada está dentro del rango
            if (filterDate >= startDate && filterDate <= endDate) {
                row.style.display = ""; // Mostrar fila
            } else {
                row.style.display = "none"; // Ocultar fila
            }
        } else {
            row.style.display = "none"; // Si no hay fechas, ocultar la fila
        }
    });
}


// Función auxiliar para convertir fechas en formato "dd/mm/yyyy" a "yyyy-mm-dd"
function formatDateToISO(dateString) {
    // Si la fecha ya está en formato "yyyy-mm-dd", devolverla directamente
    if (dateString.includes("-")) {
        return dateString;
    }

    // Dividir la fecha en día, mes y año
    let [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`; // Retornar en formato "yyyy-mm-dd"
}

function registerObservation(idproyeccion){
    Swal.fire({
        title: 'Registrar Observación',
        input: 'textarea',
        inputLabel: 'Describe la observación correspondiente',
        inputPlaceholder: 'Por favor, redacta aquí la observación. Asegurate de incluir el motivo por el cual se produjo fuera del periodo correspondiente si es el caso.',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: (observacion) => {
            if (!observacion) {
                Swal.showValidationMessage('Por favor, ingresa una observación para continuar');
                return false;
            }
            return observacion;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const observacion = result.value;
            fetch(`/proyeccion_semanal/register_observation/${idproyeccion}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    observacion: observacion
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire(
                        'Guardado',
                        'La observación ha sido registrada con éxito.',
                        'success'
                    ).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire(
                        'Error',
                        data.message || 'Hubo un error al registrar la observación. Por favor, inténtelo nuevamente.',
                        'error'
                    );
                }
            })
            .catch(error => {
                Swal.fire(
                    'Error',
                    'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
                    'error'
                );
            });
        }
    });
}