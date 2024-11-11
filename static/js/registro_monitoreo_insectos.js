$(document).ready(function() {
    setDefaultFecha();
});

// Función para establecer la fecha actual en los campos de fecha
function setDefaultFecha() {
    const today = new Date().toISOString().split('T')[0];  // Obtiene la fecha actual en formato YYYY-MM-DD
    
    // Selecciona todos los inputs que tienen la clase 'fecha_monitoreo_insectos'
    $('.fecha_monitoreo_insectos').each(function() {
        $(this).val(today);  // Asigna la fecha actual a cada campo
    });
}


function generarFormatoMonitoreoInsecto() {
    fetch('/registro_monitoreo_insectos/generar_formato_monitoreo_insecto', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respuesta del servidor:', data);
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Formato generado',
                text: 'Se generó un formato de verificación de limpieza y desinfección de equipos de medición.',
                showConfirmButton: false,
                timer: 500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al generar un formato de verificación de limpieza y desinfección de equipos de medición. Por favor, inténtelo nuevamente.',
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


function registrarDetalleMonitoreoInsectos() {
    // Obtener los valores de los elementos del formulario
    const fecha = document.getElementById('fecha_monitoreo_insectos').value;
    const hora = document.getElementById('hora_monitoreo_insectos').value;
    const observaciones = document.getElementById('observaciones').value || '-';
    const accionCorrectiva = document.getElementById('accionCorrectiva').value;

    // Obtener los checkboxes marcados
    const areasSeleccionadas = Array.from(document.querySelectorAll('input[name="areas"]:checked')).map(checkbox => checkbox.value);

    // Validar que se seleccionó al menos un área
    if (areasSeleccionadas.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Por favor, selecciona al menos un área a verificar.',
        });
        return;
    }

    // Crear el cuerpo de la solicitud con los datos recolectados
    const data = {
        fecha: fecha,
        hora: hora,
        areas: areasSeleccionadas,
        observaciones: observaciones,
        accion_correctiva: accionCorrectiva
    };

    // Enviar la solicitud al backend
    fetch('/registro_monitoreo_insectos/ruta_para_guardar_monitoreo_insectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Registrado',
                text: 'El monitoreo se ha registrado exitosamente.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || 'Ocurrió un error al registrar el monitoreo. Inténtalo de nuevo más tarde.',
            });
        }
    })
    .catch(error => {
        console.error("Error al registrar el monitoreo:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al registrar el monitoreo. Inténtalo de nuevo más tarde.',
        });
    });
}

function modificarEstadoAC(idAC) {
    fetch(`/registro_monitoreo_insectos/estadoAC/${idAC}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Registrado',
                text: 'Se registró la corrección de la observación.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message,
            });
        }
    })
    .catch(error => {
        console.error("Error al modificar el estado de la acción correctiva:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al modificar estado',
            text: 'Ocurrió un error al modificar el estado de la acción correctiva. Inténtalo de nuevo más tarde.',
        });
    });
}


function finalizar_monitoreo_insectos() {
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
            fetch('/registro_monitoreo_insectos/finalizar_monitoreo_insectos', {
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



function verDetalleHistorial(idFormatos) {
    fetch(`/registro_monitoreo_insectos/obtener_detalle_monitoreo_insectos/${idFormatos}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const detalles = data.detalles;
            const verificaciones = data.verificaciones;

            let detallesHTML = `
                <div class="table-responsive mt-2">
                <table class="table table-bordered" id="detalleTabla">
                    <thead style="background-color: #FF8C00; color: white;">
                        <tr>
                            <th class="text-center">Fecha</th>
                            <th class="text-center">Hora</th>
                            <th class="text-center">Área M. Prima</th>
                            <th class="text-center">Alm. P. Terminado</th>
                            <th class="text-center">A. de Proceso</th>
                            <th class="text-center">Vestuario</th>
                            <th class="text-center">Lav. de Manos</th>
                            <th class="text-center">SS.HH.</th>
                            <th class="text-center">Oficinas</th>
                            <th class="text-center">Pasadizo</th>
                            <th class="text-center">A. de Empaque</th>
                            <th class="text-center">A. de Lavado</th>
                            <th class="text-center">Observaciones / AC</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // Agregar los detalles al HTML
            detalles.forEach(detalle => {
                detallesHTML += `
                    <tr>
                        <td class="text-center">${detalle.fecha}</td>
                        <td class="text-center">${detalle.hora}</td>`;

                // Agregar cada área al detalle
                [2, 4, 10, 11, 12, 7, 8, 13, 14, 15].forEach(area_id => {
                    const areaVerificada = verificaciones.filter(v => v.fk_id_detalle_registro_monitoreo_insecto_roedor === detalle.id_detalle_registro_monitoreo_insecto_roedor && v.fk_id_area_produccion === area_id);
                    detallesHTML += `
                        <td class="text-center">
                            ${areaVerificada.length > 0 ? '<i class="fas fa-check-circle text-success"></i>' : '<i class="fas fa-times-circle text-danger"></i>'}
                        </td>`;
                });

                // Observaciones y acciones correctivas
                detallesHTML += `
                    <td class="text-center font-weight-bold" style="${detalle.estado_accion_correctiva === 'PENDIENTE' ? 'color: red;' : 'color: green;'}">
                        ${detalle.observacion} <br>
                        <small>${detalle.detalle_accion_correctiva}</small>
                    </td>
                </tr>`;
            });

            detallesHTML += `
                    </tbody>
                </table>
            </div>
            `;

            $('#detalleContenido').html(detallesHTML);

            // Mostrar el modal de detalles corregido
            $('#detalleHistorialMonitoreoInsecto').modal('show');

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


// Filtrar la tabla de detalle del kardex por la fecha seleccionada
function filterTableDetalleCA() {
    // Obtener el valor del input de fecha
    let input = document.getElementById('filterFechaDetalleCA');
    let filter = input.value;  // El valor del input de fecha es en formato yyyy-mm-dd

    let table = document.getElementById('detalle_table_HP');
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

// Función para convertir una fecha en formato dd/mm/yyyy o mm/dd/yyyy a yyyy-mm-dd
function formatDate(dateString) {
    // Suponiendo que la fecha de la celda está en formato dd/mm/yyyy
    let parts = dateString.split('/');
    
    // Verificar si la fecha tiene el formato esperado dd/mm/yyyy
    if (parts.length === 3) {
        let day = parts[0];
        let month = parts[1];
        let year = parts[2];

        // Retornar en formato yyyy-mm-dd
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Si el formato no es dd/mm/yyyy, devolver la fecha tal como está
    return dateString;
}


function loadHistorialPage(page) {
    fetch(`/registro_monitoreo_insectos/historial?page=` + page)
        .then(response => response.text())
        .then(html => {
            document.querySelector("#historialLavadoManos .modal-body").innerHTML = html;
        })
        .catch(error => {
            console.error("Error al cargar el historial:", error);
        });
}