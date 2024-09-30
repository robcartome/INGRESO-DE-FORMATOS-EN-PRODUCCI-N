$(document).ready(function() {
    setDefaultFechalimpiezaAreas();
});

function generarFormatoEquiposMedicion() {
    fetch('/limpieza_equipos_medicion/generar_formato_equipos_medicion', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
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


// Función para cargar las fechas registradas de limpieza de equipos de medición
function cargarFechasLimpiezaEquiposMedicion(categoriaId) {
    fetch(`/limpieza_equipos_medicion/obtener_fechas_limpieza/${categoriaId}`)
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById(`tablaDetallesCA_${categoriaId}`);
        tbody.innerHTML = ''; // Limpiar la tabla

        // Verificar que haya fechas para mostrar
        if (data.status === 'success' && data.fechas.length > 0) {
            data.fechas.forEach(fecha => {
                const row = `
                    <tr>
                        <td class="text-center ${fecha.estado_verificacion === true ? 'text-success' : 'text-danger'}">${fecha.fecha}</td>
                        <td class="text-center">
                            <button class="btn btn-danger btn-sm" onclick="registrarNoConforme('${fecha.id_detalle_verificacion_equipos_medicion}','${fecha.fecha}', ${categoriaId}, '${fecha.id_verificacion_equipo_medicion}')">
                                No Conforme
                            </button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            // Mostrar mensaje cuando no hay fechas registradas
            const row = `<tr><td class="text-center" colspan="2">No hay registros de fechas.</td></tr>`;
            tbody.innerHTML = row;
        }
    })
    .catch(error => {
        console.error("Error al cargar las fechas de limpieza:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar fechas',
            text: 'Ocurrió un error al cargar las fechas de limpieza. Inténtalo de nuevo más tarde.',
        });
    });
}

// Función para registrar un evento "No Conforme"
function registrarNoConforme(id_detalle_verificacion_equipos_medicion, fecha, categoriaId, id_verificacion_equipos_medicion) {
    Swal.fire({
        title: 'Registrar No Conforme',
        html: `
            <div>
                <p>¿Estás seguro de registrar "No Conforme" para la fecha ${fecha}?</p>
                <div class="form-group text-left">
                    <label for="observacion" style="font-weight: bold;">Observación:</label>
                    <input type="text" id="observacion" class="swal2-input" placeholder="Ingresa una observación" required>
                </div>
                <div class="form-group text-left">
                    <label for="accionCorrectiva" style="font-weight: bold;">Acción Correctiva:</label>
                    <input type="text" id="accionCorrectiva" class="swal2-input" placeholder="Ingresa una acción correctiva" required>
                </div>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const observacion = Swal.getPopup().querySelector('#observacion').value;
            const accionCorrectiva = Swal.getPopup().querySelector('#accionCorrectiva').value;
            
            // Verificar que ambos campos estén llenos
            if (!observacion || !accionCorrectiva) {
                Swal.showValidationMessage(`Por favor, completa ambos campos.`);
            }
            
            return { observacion: observacion, accionCorrectiva: accionCorrectiva };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Realizar la llamada a la API para registrar el evento "No Conforme"
            fetch('/limpieza_equipos_medicion/registrar_no_conforme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_detalle_verificacion_equipos_medicion: id_detalle_verificacion_equipos_medicion,
                    fecha: fecha,
                    categoria_id: categoriaId,
                    id_verificacion_equipos_medicion: id_verificacion_equipos_medicion,
                    observacion: result.value.observacion,
                    accion_correctiva: result.value.accionCorrectiva
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    cargarFechasLimpiezaEquiposMedicion(categoriaId);
                    Swal.fire({
                        icon: 'success',
                        title: 'Registrado',
                        text: 'El evento "No Conforme" ha sido registrado exitosamente.',
                        showConfirmButton: false,
                        timer: 1500
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
                console.error("Error al registrar No Conforme:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al registrar',
                    text: 'Ocurrió un error al registrar el evento "No Conforme". Inténtalo de nuevo más tarde.',
                });
            });
        }
    });
}


// Función para registrar una fecha de limpieza en equipos de medición
function registrarFechaLimpiezaEquiposMedicion(categoriaId) {
    const fechaInput = document.getElementById(`fecha_${categoriaId}`);
    const fecha = fechaInput.value;

    // Verificar que haya una fecha seleccionada
    if (!fecha) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Por favor, seleccione una fecha para registrar.',
        });
        return;
    }

    // Enviar la solicitud para registrar la fecha
    fetch('/limpieza_equipos_medicion/registrar_fecha_limpieza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: fecha, categoria_id: categoriaId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Registrado',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                // Limpiar el campo de fecha y recargar la tabla de fechas
                fechaInput.value = '';
                cargarFechasLimpiezaEquiposMedicion(categoriaId); // Recargar fechas
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
        console.error("Error al registrar la fecha de limpieza:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text: 'Ocurrió un error al registrar la fecha de limpieza. Inténtalo de nuevo más tarde.',
        });
    });
}

function finalizarVerificacionLimpiezaEquiposMedicion(id_verificacion_equipo_medicion) {
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
            // Si el usuario confirma, se procede con el fetch
            fetch('/limpieza_equipos_medicion/finalizar_estado_equipos_medicion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_verificacion_equipo_medicion: id_verificacion_equipo_medicion })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Registrado',
                        text: data.message,
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        location.reload(); // Recargar la página después de finalizar
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
                console.error("Error al finalizar el registro:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al registrar',
                    text: 'Ocurrió un error al finalizar el registro. Inténtalo de nuevo más tarde.',
                });
            });
        }
    });
}



function modificarEstadoAC(idAC) {
    fetch(`/limpieza_equipos_medicion/estadoAC/${idAC}`, {
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
                cargarObservacionesLimpiezaEquiposMedicion();
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


function cargarObservacionesLimpiezaEquiposMedicion() {
    fetch('/limpieza_equipos_medicion/obtener_observaciones')
    .then(response => response.json())
    .then(data => {
        // Limpia la tabla de observaciones
        var tableBody = $('#tablaDetallesObservaciones');
        tableBody.empty(); // Método jQuery para limpiar

        if (data.status === 'success' && Array.isArray(data.observaciones) && data.observaciones.length > 0) {
            // Recorre cada observación y crea una fila para la tabla
            data.observaciones.forEach(observacion => {
                let row = `
                    <tr>
                        <td class="text-center">${observacion.detalledemedidacorrectiva}</td>
                        <td class="text-center">${observacion.fecha}</td>
                        <td class="text-center ${observacion.estado === 'SOLUCIONADO' ? 'text-success' : 'text-danger'}">${observacion.detalle_accion_correctiva}</td>
                        <td class="text-center">
                            <button type="button" class="btn d-block w-100 mb-1" style="background-color: #FF8C00; color: white;" onclick="modificarEstadoAC('${observacion.idaccion_correctiva}')">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        </td>
                    </tr>`;
                // Añadir la fila a la tabla
                tableBody.append(row);
            });            
        } else {
            let noDataRow = '<tr><td colspan="4" class="text-center">No hay observaciones disponibles para este mes.</td></tr>';
            tableBody.html(noDataRow); // Método jQuery para añadir HTML cuando no hay datos
        }
    })
    .catch(error => {
        console.error("Error al cargar las observaciones:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar observaciones',
            text: 'Ocurrió un error al cargar las observaciones. Inténtalo de nuevo más tarde.',
        });
    });
}



// Función para cargar las fechas registradas de limpieza de equipos de medición finalizados
function cargarFechasLimpiezaEquiposMedicionFinalizados(categoriaId, id_verificacion_equipo_medicion) {
    fetch(`/limpieza_equipos_medicion/obtener_fechas_limpieza_finalizados/${categoriaId}/${id_verificacion_equipo_medicion}`)
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById(`tablaDetallesCAFinalizados_${categoriaId}`);
        tbody.innerHTML = ''; // Limpiar la tabla

        // Verificar que haya fechas para mostrar
        if (data.status === 'success' && data.fechas.length > 0) {
            data.fechas.forEach(fecha => {
                const row = `
                    <tr>
                        <td class="text-center ${fecha.estado_verificacion ? 'text-success' : 'text-danger'}">${fecha.fecha}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            // Mostrar mensaje cuando no hay fechas registradas
            const row = `<tr><td class="text-center" colspan="2">No hay registros de fechas.</td></tr>`;
            tbody.innerHTML = row;
        }
    })
    .catch(error => {
        console.error("Error al cargar las fechas de limpieza:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar fechas',
            text: 'Ocurrió un error al cargar las fechas de limpieza. Inténtalo de nuevo más tarde.',
        });
    });
}


function filterByDate() {
    const mes = document.getElementById("filtrarMesLACLOSE").value;
    
    // Mapear meses en número a nombre
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];

    if (mes) {
        const mesInput = mes.split("-")[1]; // Obtener el mes en formato numérico (MM)
        const anoInput = mes.split("-")[0]; // Obtener el año (YYYY)
        
        // Convertir el mes numérico a nombre (Setiembre, Octubre, etc.)
        const nombreMesInput = meses[parseInt(mesInput) - 1]; // Restar 1 porque el índice del array comienza en 0

        // Obtener todas las tarjetas (grupos de meses/años)
        const cards = document.querySelectorAll("#accordionFinalizados .card");

        cards.forEach(function (card) {
            // Extraer el texto del botón del acordeón (Ejemplo: "Setiembre del 2024")
            const headerText = card.querySelector('.card-header button').textContent;
            
            // Verificar si el texto contiene el mes y el año seleccionados
            const mesFiltrado = headerText.includes(`${nombreMesInput} del ${anoInput}`);

            // Mostrar u ocultar la tarjeta basado en los filtros
            if (mesFiltrado) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    }
}

// Función para establecer la fecha actual en los campos de fecha
function setDefaultFechalimpiezaAreas() {
    const today = new Date().toISOString().split('T')[0];  // Obtiene la fecha actual en formato YYYY-MM-DD
    
    // Selecciona todos los inputs que tienen la clase 'fecha_actual'
    document.querySelectorAll('.fecha_actual').forEach(campo => {
        campo.value = today;  // Asigna la fecha actual a cada campo
    });
}
