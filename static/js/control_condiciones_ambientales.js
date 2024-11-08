$(document).ready(function() {
    setDefaultFechaKardex();

    // Controlar el registro de kardex
    $('#formCondicionAmbiental').on('submit', function(event) {
        event.preventDefault();
        var formElement = document.getElementById('formCondicionAmbiental');
        var formData = new FormData(formElement);

        fetch('/condiciones_ambientales/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: '¡Control creado!',
                    text: 'Se registro el control de condiciones ambientales correctamente.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message,  // Mostrar el mensaje de error enviado desde el servidor
                });
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error inesperado.',
            });
        });
    });
});

function setDefaultFechaKardex() {
    const today = new Date().toISOString().split('T')[0];  // Obtiene la fecha actual en formato YYYY-MM-DD
    document.getElementById('fecha_CA').value = today;  // Asigna la fecha al campo de fecha
}

function verDetallesCondicionesAmbientales(idcondicionambiental, detalle_area, mes, anio) {
    console.log(detalle_area);

    // Desactivar los checkboxes si el área es "Envases y Embalajes" o "Productos Químicos y de Limpieza"
    if (detalle_area === "Envases y Embalajes" || detalle_area === "Productos Químicos y de Limpieza") {
        document.getElementById('paletasLimpias').disabled = true;
        document.getElementById('paletasBuenEstado').disabled = true;
    } else {
        // Asegurarse de habilitarlos nuevamente en caso de que se trate de un área diferente
        document.getElementById('paletasLimpias').disabled = false;
        document.getElementById('paletasBuenEstado').disabled = false;
    }

    document.getElementById('listaCA').style.display = 'none';
    document.getElementById('llenarFormularioCA').style.display = 'block';
    document.getElementById('detallesCA').style.display = 'block';
    document.getElementById('tituloDetallesCA').innerText = `Detalles de ${detalle_area} - ${mes}/${anio}`;
    document.getElementById('idcondicionambiental_hidden').value = idcondicionambiental;
    document.getElementById('detallearea_hidden').value = detalle_area;
    document.getElementById('mesCA').value = mes;
    document.getElementById('anioCA').value = anio;

    fetch(`/condiciones_ambientales/detalles_condiciones_ambientales/${idcondicionambiental}`)
        .then(response => response.json())
        .then(data => {
            var tableBody = $('#tablaDetallesCA');
            tableBody.empty();

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(function(item) {
                    var verificacionPrevia = item.verificacion_previa;
                    var estadoColor = item.estado === "PENDIENTE" ? 'color: red;' : 'color: green;';

                    // Crear una fila HTML y dejar en blanco las celdas donde verificación previa sea None para áreas 2 o 3
                    var row = `
                        <tr>
                            <td class="text-center">${item.fecha}</td>
                            <td class="text-center">${item.hora}</td>
                            <td class="text-center">${verificacionPrevia[1] === true ? '✅' : (verificacionPrevia[1] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacionPrevia[2] === true ? '✅' : (verificacionPrevia[2] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacionPrevia[3] === true ? '✅' : (verificacionPrevia[3] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacionPrevia[4] === true ? '✅' : (verificacionPrevia[4] === false ? '❌' : '')}</td>
                            <td class="text-center">${item.temperatura} °C</td>
                            <td class="text-center">${item.humedad} %</td>
                            <td class="text-center">${item.observaciones}</td>
                            <td class="text-center" style="${estadoColor}">${item.detalle_accion_correctiva}</td>
                            <td class="text-center">
                                <button type="button" class="btn d-block w-100 mb-1" style="background-color: #FF8C00; color: white;" onclick="modificarEstadoAC(${item.idaccion_correctiva})">
                                    <i class="fas fa-check-circle"></i>
                                </button>
                            </td>
                        </tr>`;
                    tableBody.append(row);
                });
            } else {
                var noDataRow = '<tr><td colspan="11" class="text-center">No hay detalles disponibles para este control de condiciones ambientales.</td></tr>';
                tableBody.append(noDataRow);
            }
        })
        .catch(error => {
            console.error("Error al cargar los detalles de control de condiciones ambientales:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar detalles',
                text: 'Ocurrió un error al cargar los detalles de control de condiciones ambientales. Inténtalo de nuevo más tarde.',
            });
        });
}


function modificarEstadoAC(idAC) {
    var idcondicionambiental = document.getElementById('idcondicionambiental_hidden').value;
    var detallearea = document.getElementById('detallearea_hidden').value;
    var mes = document.getElementById('mesCA').value; 
    var anio = document.getElementById('anioCA').value;

    fetch(`/condiciones_ambientales/estadoAC/${idAC}`, {
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
                sessionStorage.setItem('idcondicionambiental', idcondicionambiental);
                sessionStorage.setItem('detallearea', detallearea);
                sessionStorage.setItem('mes', mes);
                sessionStorage.setItem('anio', anio);
                verDetallesCondicionesAmbientales(idcondicionambiental, detallearea, mes, anio);
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

function registrarDetalleCA() {
    var idcondicionambiental = document.getElementById('idcondicionambiental_hidden').value;
    var fecha = document.getElementById('fecha_CA').value;
    var hora = document.getElementById('hora_CA').value;
    var limpio = document.getElementById('limpio').checked ? 'true' : 'false';
    var ordenado = document.getElementById('ordenado').checked ? 'true' : 'false';
    var paletasLimpias = document.getElementById('paletasLimpias').checked ? 'true' : 'false';
    var paletasBuenEstado = document.getElementById('paletasBuenEstado').checked ? 'true' : 'false';
    var temperatura = document.getElementById('temperatura').value;
    var humedadRelativa = document.getElementById('humedadRelativa').value;
    var observaciones = document.getElementById('observaciones').value || "-";
    var accionesCorrectivas = document.getElementById('accionesCorrectivas').value || "-";
    var detallearea = document.getElementById('detallearea_hidden').value;
    var mes = document.getElementById('mesCA').value; 
    var anio = document.getElementById('anioCA').value;

    if (!fecha || !hora || !temperatura || !humedadRelativa) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos obligatorios antes de enviar.',
        });
        return;
    }

    fetch('/condiciones_ambientales/registrar_condiciones_ambientales', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idcondicionambiental: idcondicionambiental,
            fecha: fecha,
            hora: hora,
            limpio: limpio,
            ordenado: ordenado,
            paletasLimpias: paletasLimpias,
            paletasBuenEstado: paletasBuenEstado,
            temperatura: temperatura,
            humedadRelativa: humedadRelativa,
            observaciones: observaciones,
            accionesCorrectivas: accionesCorrectivas
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Agregado',
                text: 'Se agregó exitosamente un registro del control de condición ambiental.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                sessionStorage.setItem('idcondicionambiental', idcondicionambiental);
                sessionStorage.setItem('detallearea', detallearea);
                sessionStorage.setItem('mes', mes);
                sessionStorage.setItem('anio', anio);
                verDetallesCondicionesAmbientales(idcondicionambiental, detallearea, mes, anio);
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
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud',
            text: 'Ocurrió un error al enviar la solicitud: ' + error,
        });
    });
}

function finalizarDetallesCondicionesAmbientales(idcondicionambiental) {
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
            fetch('/condiciones_ambientales/finalizarDetallesCA', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idcondicionambiental: idcondicionambiental
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Se finalizó',
                        text: 'El estado de la condición ambiental fue modificado a Finalizado.',
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
                Swal.fire({
                    icon: 'error',
                    title: 'Error en la solicitud',
                    text: 'Ocurrió un error al enviar la solicitud: ' + error,
                });
            });
        }
    });
}


async function descargarFormatoCA() {
    const idCA = document.getElementById('idcondicionambiental_hidden').value;
    const endpoint = `/condiciones_ambientales/descargar_formato_CA/${idCA}`;

    try {
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Error al generar el reporte");
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get("Content-Disposition");
        const fileNameMatch = contentDisposition && contentDisposition.match(/filename="?(.+)"?/);
        const fileName = fileNameMatch ? fileNameMatch[1] : "reporte_condiciones_ambientales.pdf";

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url); // Revocar la URL creada
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al generar el reporte.',
        });
    }
}

function volverListaCA() {
    // Ocultar la sección de detalles
    document.getElementById('detallesCA').style.display = 'none';

    // Mostrar la sección de detalles
    document.getElementById('llenarFormularioCA').style.display = 'none';

    // Mostrar la lista de todos los kardex
    document.getElementById('listaCA').style.display = 'block';
}

window.onload = function() {
    // Verificar si hay datos en sessionStorage
    var idcondicionambiental = sessionStorage.getItem('idcondicionambiental');
    var detallearea = sessionStorage.getItem('detallearea');
    var mes = sessionStorage.getItem('mes');
    var anio = sessionStorage.getItem('anio');

    // Si existen valores almacenados en sessionStorage, llamar a la función para mostrar los detalles
    if (idcondicionambiental && detallearea && mes && anio) {
        verDetallesCondicionesAmbientales(idcondicionambiental, detallearea, mes, anio);

        // Limpiar los datos de sessionStorage para evitar que se use de nuevo accidentalmente
        sessionStorage.removeItem('idcondicionambiental');
        sessionStorage.removeItem('detallearea');
        sessionStorage.removeItem('mes');
        sessionStorage.removeItem('anio');
    }
};

//Para filtrar kardex activos
function filterCAOpenArea() {
    let input = document.getElementById('filtrarAraeCa');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('caTableOpen');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

//Para filtrar kardex finalizados
function filterCACloseArea() {
    let input = document.getElementById('filtrarAreaCA');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('tableCloseCA');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// Filtrar la tabla de detalle del kardex por la fecha seleccionada
function filterTableDetalleCA() {
    // Obtener el valor del input de fecha
    let input = document.getElementById('filterFechaDetalleCA');
    let filter = input.value;  // El valor del input de fecha es en formato yyyy-mm-dd

    let table = document.getElementById('detalleCATable');
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


 function descargarFormatoCA() {
    var idkardex = document.getElementById('idcondicionambiental_hidden').value;
    const endpoint = `/condiciones_ambientales/descargar_formato_CA/${idkardex}`;
    fetchDownloadPDF(endpoint, 'condiciones ambientales' )
 }
 
function verDetallesCondicionesAmbientalesFinalizadas(idcondicionambiental, detalle_area, mes, anio) {
    document.getElementById('listaCA').style.display = 'none';
    document.getElementById('detallesCA').style.display = 'block';
    document.getElementById('tituloDetallesCA').innerText = `Detalles de ${detalle_area} - ${mes}/${anio}`;
    document.getElementById('idcondicionambiental_hidden').value = idcondicionambiental;
    document.getElementById('detallearea_hidden').value = detalle_area;
    document.getElementById('mesCA').value = mes;
    document.getElementById('anioCA').value = anio;

    fetch(`/condiciones_ambientales/detalles_condiciones_ambientales/${idcondicionambiental}`)
        .then(response => response.json())
        .then(data => {
            var tableBody = $('#tablaDetallesCA');
            tableBody.empty();

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(function(item) {
                    var verificacionPrevia = item.verificacion_previa;
                    var estadoColor = item.estado === "PENDIENTE" ? 'color: red;' : 'color: green;';

                    var row = `
                        <tr>
                            <td class="text-center">${item.fecha}</td>
                            <td class="text-center">${item.hora}</td>
                            <td class="text-center">${verificacionPrevia[1] ? '✅' : '❌'}</td>
                            <td class="text-center">${verificacionPrevia[2] ? '✅' : '❌'}</td>
                            <td class="text-center">${verificacionPrevia[3] ? '✅' : '❌'}</td>
                            <td class="text-center">${verificacionPrevia[4] ? '✅' : '❌'}</td>
                            <td class="text-center">${item.temperatura} °C</td>
                            <td class="text-center">${item.humedad} %</td>
                            <td class="text-center">${item.observaciones}</td>
                            <td class="text-center" style="${estadoColor}">${item.detalle_accion_correctiva}</td>
                            <td class="text-center">
                                <button type="button" class="btn d-block w-100 mb-1" style="background-color: #FF8C00; color: white;" onclick="modificarEstadoAC(${item.idaccion_correctiva})">
                                    <i class="fas fa-check-circle"></i>
                                </button>
                            </td>
                        </tr>`;
                    tableBody.append(row);
                });
            } else {
                var noDataRow = '<tr><td colspan="11" class="text-center">No hay detalles disponibles para este control de condiciones ambientales.</td></tr>';
                tableBody.append(noDataRow);
            }
        })
        .catch(error => {
            console.error("Error al cargar los detalles de control de condiciones ambientales:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar detalles',
                text: 'Ocurrió un error al cargar los detalles de control de condiciones ambientales. Inténtalo de nuevo más tarde.',
            });
        });
}
