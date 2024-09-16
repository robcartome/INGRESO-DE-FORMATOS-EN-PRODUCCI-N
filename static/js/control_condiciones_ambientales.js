$(document).ready(function() {
    setDefaultFechaKardex();

    // Controlar el registro de kardex
    $('#formCondicionAmbiental').on('submit', function(event) {
        event.preventDefault();
        var formElement = document.getElementById('formCondicionAmbiental');
        var formData = new FormData(formElement);

        $.ajax({
            url: '/condiciones_ambientales',
            type: 'POST',
            data: formData,
            processData: false,  // Evitar que jQuery procese los datos
            contentType: false,  // Evitar que jQuery establezca el content-type
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Control creado!',
                        text: 'Se registro el control de condiciones ambientales correctamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        location.reload();  // Recargar la página tras el éxito
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message,  // Mostrar el mensaje de error enviado desde el servidor
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('Error en la solicitud AJAX:', error);
                
                // Verificar si la respuesta contiene datos en formato JSON
                var response = xhr.responseJSON;
                
                if (response && response.message) {
                    // Mostrar el mensaje de error enviado por el servidor
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message,  // Mensaje de error desde el servidor
                    });
                } else {
                    // Mostrar un mensaje genérico si no hay detalles en la respuesta
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ocurrió un error inesperado.',
                    });
                }
            }
        });
    });
});

function setDefaultFechaKardex() {
    const today = new Date().toISOString().split('T')[0];  // Obtiene la fecha actual en formato YYYY-MM-DD
    document.getElementById('fecha_CA').value = today;  // Asigna la fecha al campo de fecha
}

function verDetallesCondicionesAmbientales(idcondicionambiental, detalle_area, mes, anio) {
    // Ocultar la lista de todos los CA
    document.getElementById('listaCA').style.display = 'none';

    // Mostrar la sección de detalles
    document.getElementById('llenarFormularioCA').style.display = 'block';

    // Mostrar la sección de detalles
    document.getElementById('detallesCA').style.display = 'block';

    // Actualizar el título con la información del producto y la fecha
    document.getElementById('tituloDetallesCA').innerText = `Detalles de ${detalle_area} - ${mes}/${anio}`;

    // Asignar los valores a los inputs hidden
    document.getElementById('idcondicionambiental_hidden').value = idcondicionambiental;
    document.getElementById('detallearea_hidden').value = detalle_area;
    document.getElementById('mesCA').value = mes;
    document.getElementById('anioCA').value = anio;

    // Obtener los detalles de la condición ambiental
    $.get('/condiciones_ambientales/detalles_condiciones_ambientales/' + idcondicionambiental, function(data) {
        var tableBody = $('#tablaDetallesCA');
        tableBody.empty();
    
        // Verificar si los datos recibidos son un array y tienen contenido
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
                        <td class="text-center">${item.temperatura}</td>
                        <td class="text-center">${item.humedad}</td>
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
            // Si no hay datos, mostrar un mensaje
            var noDataRow = '<tr><td colspan="11" class="text-center">No hay detalles disponibles para este control de condiciones ambientales.</td></tr>';
            tableBody.append(noDataRow);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Error al cargar los detalles de control de condiciones ambientales:", textStatus, errorThrown);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar detalles',
            text: 'Ocurrió un error al cargar los detalles de control de condiciones ambientales. Inténtalo de nuevo más tarde.',
        });
    });
}

function verDetallesCondicionesAmbientalesFinalizadas(idcondicionambiental, detalle_area, mes, anio) {
    // Ocultar la lista de todos los CA
    document.getElementById('listaCA').style.display = 'none';

    // Mostrar la sección de detalles
    document.getElementById('detallesCA').style.display = 'block';

    // Actualizar el título con la información del producto y la fecha
    document.getElementById('tituloDetallesCA').innerText = `Detalles de ${detalle_area} - ${mes}/${anio}`;

    // Asignar los valores a los inputs hidden
    document.getElementById('idcondicionambiental_hidden').value = idcondicionambiental;
    document.getElementById('detallearea_hidden').value = detalle_area;
    document.getElementById('mesCA').value = mes;
    document.getElementById('anioCA').value = anio;

    // Obtener los detalles de la condición ambiental
    $.get('/condiciones_ambientales/detalles_condiciones_ambientales/' + idcondicionambiental, function(data) {
        var tableBody = $('#tablaDetallesCA');
        tableBody.empty();
    
        // Verificar si los datos recibidos son un array y tienen contenido
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
                        <td class="text-center">${item.temperatura}</td>
                        <td class="text-center">${item.humedad}</td>
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
            // Si no hay datos, mostrar un mensaje
            var noDataRow = '<tr><td colspan="11" class="text-center">No hay detalles disponibles para este control de condiciones ambientales.</td></tr>';
            tableBody.append(noDataRow);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Error al cargar los detalles de control de condiciones ambientales:", textStatus, errorThrown);
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
    
    $.post('/condiciones_ambientales/estadoAC/' + idAC, function(response) {
        if (response.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Registrado',
                text: 'Se registro la correción de la observación.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                // Guardar los valores en sessionStorage
                sessionStorage.setItem('idcondicionambiental', idcondicionambiental);
                sessionStorage.setItem('detallearea', detallearea);
                sessionStorage.setItem('mes', mes);
                sessionStorage.setItem('anio', anio);

                // Mostrar los detalles sin recargar la página
                verDetallesCondicionesAmbientales(idcondicionambiental, detallearea, mes, anio);
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message,
            });
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Error al modificar el estado de la acción correctiva:", textStatus, errorThrown);
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
    var limpio = document.getElementById('limpio').checked;
    var ordenado = document.getElementById('ordenado').checked;
    var paletasLimpias = document.getElementById('paletasLimpias').checked;
    var paletasBuenEstado = document.getElementById('paletasBuenEstado').checked;
    var temperatura = document.getElementById('temperatura').value;
    var humedadRelativa = document.getElementById('humedadRelativa').value;
    var observaciones = document.getElementById('observaciones').value || "-";
    var accionesCorrectivas = document.getElementById('accionesCorrectivas').value || "-";

    var detallearea = document.getElementById('detallearea_hidden').value;
    var mes = document.getElementById('mesCA').value; 
    var anio = document.getElementById('anioCA').value;

    // Validar que los campos obligatorios no estén vacíos
    if (!fecha || !hora || !temperatura || !humedadRelativa) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos obligatorios antes de enviar.',
        });
        return;
    }

    $.post('/condiciones_ambientales/registrar_condiciones_ambientales', {
        idcondicionambiental: idcondicionambiental, 
        fecha: fecha, 
        hora: hora,
        limpio: limpio ? 'true' : 'false',  // Enviar como 'true' o 'false'
        ordenado: ordenado ? 'true' : 'false',
        paletasLimpias: paletasLimpias ? 'true' : 'false',
        paletasBuenEstado: paletasBuenEstado ? 'true' : 'false',
        temperatura: temperatura,
        humedadRelativa: humedadRelativa,
        observaciones: observaciones,
        accionesCorrectivas: accionesCorrectivas
    }, function(response) {
        if (response.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Agregado',
                text: 'Se agregó exitosamente un registro del control de condición ambiental.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                // Guardar los valores en sessionStorage
                sessionStorage.setItem('idcondicionambiental', idcondicionambiental);
                sessionStorage.setItem('detallearea', detallearea);
                sessionStorage.setItem('mes', mes);
                sessionStorage.setItem('anio', anio);

                // Mostrar los detalles sin recargar la página
                verDetallesCondicionesAmbientales(idcondicionambiental, detallearea, mes, anio);
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message,
            });
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud',
            text: 'Ocurrió un error al enviar la solicitud: ' + textStatus,
        });
    });
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

function finalizarDetallesCondicionesAmbientales(idcondicionambiental) {
    $.post('/condiciones_ambientales/finalizarDetallesCA', {
        idcondicionambiental: idcondicionambiental
    }, function(response) {
        if (response.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Se finalizo',
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
                text: response.message,
            });
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud',
            text: 'Ocurrió un error al enviar la solicitud: ' + textStatus,
        });
    });
}

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
    var idCA = document.getElementById('idcondicionambiental_hidden').value;
    $.get(`/condiciones_ambientales/descargar_formato_CA/${idCA}`, function(response) {
        console.log(idkardex)
    }).fail(function() {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al generar el reporte.',
        });
    });
}