document.addEventListener('DOMContentLoaded', function () {
    setDefaultFechaKardex();

    document.getElementById('FormCCA').addEventListener('submit', function (event) {
        event.preventDefault();
        var formElement = document.getElementById('FormCCA');
        var formData = new FormData(formElement);

        fetch('/control_cloro_residual/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registrado!',
                    text: 'Se registró el control de cloro residual de agua correctamente.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Hubo un error al registrar el control de cloro residual de agua.',
                });
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
            });
        });
    });
});

function setDefaultFechaKardex() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fechaCCA').value = today;
}

function generarFormatoCloroResidualAgua(){
    fetch('/control_cloro_residual/generar_formato_CCA',{
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Formato generado',
                text: 'Se generó un formato de control de cloro residual de agua.',
                showConfirmButton: false,
                timer: 500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al generar un formato de control de cloro residual de agua. Por favor, inténtelo nuevamente.',
            });
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error en la solicitud. Por favor, inténtelo nuevamente.',
        });
    });
}

function modificarEstadoAC(idaccion_correctiva){
    fetch(`/control_cloro_residual/modificar_estado_CCA/${idaccion_correctiva}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Estado modificado',
                text: 'Se modificó el estado de la acción correctiva correctamente.',
                showConfirmButton: false,
                timer: 500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al modificar el estado de la acción correctiva. Por favor, inténtelo nuevamente.',
            });
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error en la solicitud. Por favor, inténtelo nuevamente.',
        });
    });
}

// Formatear una fecha de dd/mm/yyyy a yyyy-mm-dd
function formatDate(dateString) {
    let parts = dateString.split('/');
    // Asegurarse de que hay tres partes (día, mes, año)
    if (parts.length === 3) {
        let day = parts[0].padStart(2, '0');  // Asegurar dos dígitos para el día
        let month = parts[1].padStart(2, '0'); // Asegurar dos dígitos para el mes
        let year = parts[2];
        return `${year}-${month}-${day}`; // Formato yyyy-mm-dd
    }
    return ""; // Retorna vacío si no está en el formato esperado
}


// Filtrar la tabla de detalle del kardex por la fecha seleccionada
function filterTableDetalleCCA() {
    // Obtener el valor del input de fecha
    let input = document.getElementById('filterFechaDetalleCCA');
    let filter = input.value;  // El valor del input de fecha es en formato yyyy-mm-dd

    let table = document.getElementById('detalleCCATable');
    let tr = table.getElementsByTagName('tr');

    // Iterar sobre las filas de la tabla (excepto la cabecera)
    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];  // Obtener la primera celda (columna de fecha)

        if (td) {
            // Obtener el valor de la fecha de la celda
            let txtValue = td.textContent || td.innerText;

            // Asegurarse de que ambas fechas estén en formato yyyy-mm-dd antes de compararlas
            let formattedCellDate = formatDate(txtValue);  // Formateamos la fecha de la celda

            if (formattedCellDate === filter || filter === "") {
                // Si coinciden o no hay filtro, mostrar la fila
                tr[i].style.display = "";
            } else {
                // Si no coinciden, ocultar la fila
                tr[i].style.display = "none";
            }
        }
    }
}


function verDetalleHistorial(idFormatos) {
    fetch(`/control_cloro_residual/obtener_detalle_CCA/${idFormatos}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            let detalles = `
                <table class="table table-bordered">
                    <thead style="background-color: #FFC107; color: white;">
                        <tr>
                            <th class="text-center">Fecha</th>
                            <th class="text-center">Hora</th>
                            <th class="text-center">Lectura</th>
                            <th class="text-center">Observaciones</th>
                            <th class="text-center">Acciones Correctivas</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.detalles.forEach(detalle => {
                detalles += `
                    <tr>
                        <td class="text-center">${detalle.fecha}</td>
                        <td class="text-center">${detalle.hora}</td>
                        <td class="text-center">${detalle.lectura}</td>
                        <td class="text-center">${detalle.observacion}</td>
                        <td class="text-center">${detalle.detalle_accion_correctiva} / ${detalle.estado_accion_correctiva}</td>
                    </tr>
                `;
            });

            detalles += `
                    </tbody>
                </table>
            `;

            document.getElementById('detalleContenido').innerHTML = detalles;
            $('#detalleCCA').modal('show');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron obtener los detalles del registro. Por favor, inténtelo nuevamente.',
            });
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al intentar obtener los detalles. Por favor, inténtelo nuevamente.',
        });
    });
}

//PAra finalizar el registro
function finalizarRegistroCCA() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, finalizar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/control_cloro_residual/finalizar_registro_CCA', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire(
                        'Finalizado',
                        'Se finalizó el registro.',
                        'success'
                    ).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire(
                        'Error',
                        data.message || 'Hubo un error al finalizar el registro. Por favor, inténtelo nuevamente.',
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

function loadHistorialPage(page) {
    fetch(`/control_cloro_residual/historial?page=` + page)
        .then(response => response.text())
        .then(html => {
            document.querySelector("#historialCCAModal .modal-body").innerHTML = html;
        })
        .catch(error => {
            console.error("Error al cargar el historial:", error);
        });
}
