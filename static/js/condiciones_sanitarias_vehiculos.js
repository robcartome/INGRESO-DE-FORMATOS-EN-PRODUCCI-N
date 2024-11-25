$(document).ready(function() {

    setDefaultFechaKardex();

    // Controlar el registro de kardex
    $('#formCondicionesSanitariasVehiculos').on('submit', function(event) {
        event.preventDefault();
        var formElement = document.getElementById('formCondicionesSanitariasVehiculos');
        var formData = new FormData(formElement);

        fetch('/condiciones_sanitarias_vehiculos/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: '¡Control creado!',
                    text: 'Se registro el Control de las condiciones sanitarias de los vehículos de transporte para el área seleccionada.',
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


function verDetallesCSV(id_header_format, detalle_area, mes, anio) {
    console.log(detalle_area);

    document.getElementById('listaCSV').style.display = 'none';
    document.getElementById('llenarFormularioCSV').style.display = 'block';
    document.getElementById('detallesCSV').style.display = 'block';
    document.getElementById('tituloDetallesCSV').innerText = `Detalles de ${detalle_area} - ${mes}/${anio}`;
    document.getElementById('idCSV_hidden').value = id_header_format;
    document.getElementById('detallearea_hidden').value = detalle_area;
    document.getElementById('mesCSV').value = mes;
    document.getElementById('anioCSV').value = anio;

    fetch(`/condiciones_sanitarias_vehiculos/detalles_condiciones_sanitarias_vehiculos/${id_header_format}`)
        .then(response => response.json())
        .then(data => {
            var tableBody = $('#tablaDetallesCSV');
            tableBody.empty();

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(function(item) {
                    var verificacion_vehiculos = item.verificacion_vehiculos;
                    var estadoColor = item.estado_ac === "PENDIENTE" ? 'color: red;' : 'color: green;';

                    // Crear una fila HTML y dejar en blanco las celdas donde verificación previa sea None para áreas 2 o 3
                    var row = `
                        <tr>
                            <td class="text-center">${item.fecha}</td>
                            <td class="text-center">${item.detalle_motivo_vehiculo}</td>
                            <td class="text-center">${item.documento_referencia}</td>
                            <td class="text-center">${item.total_bultos}</td>
                            <td class="text-center">${item.detalle_tipo_vehiculo}</td>
                            <td class="text-center">${item.num_placa_vehiculo}</td>
                            <td class="text-center">${verificacion_vehiculos[1] === true ? '✅' : (verificacion_vehiculos[1] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[2] === true ? '✅' : (verificacion_vehiculos[2] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[3] === true ? '✅' : (verificacion_vehiculos[3] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[4] === true ? '✅' : (verificacion_vehiculos[4] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[5] === true ? '✅' : (verificacion_vehiculos[5] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[6] === true ? '✅' : (verificacion_vehiculos[6] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[7] === true ? '✅' : (verificacion_vehiculos[7] === false ? '❌' : '')}</td>
                            <td class="text-center">${item.observacion}</td>
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
                var noDataRow = '<tr><td colspan="20" class="text-center">No hay detalles disponibles para este Control de las condiciones sanitarias de los vehículos de transporte.</td></tr>';
                tableBody.append(noDataRow);
            }
        })
        .catch(error => {
            console.error("Error al cargar los detalles de Control de las condiciones sanitarias de los vehículos de transporte:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar detalles',
                text: 'Ocurrió un error al cargar los detalles de Control de las condiciones sanitarias de los vehículos de transporte. Inténtalo de nuevo más tarde.',
            });
        });
}

function setDefaultFechaKardex() {
    const today = new Date().toISOString().split('T')[0];  // Obtiene la fecha actual en formato YYYY-MM-DD
    document.getElementById('fecha_CSV').value = today;  // Asigna la fecha al campo de fecha
}

function limpiarCampos() {
    document.getElementById('idCSV_hidden').value = '';
    document.getElementById('fecha_CSV').value = '';
    document.getElementById('motivo_CSV').value = '';
    document.getElementById('documento_referencia').value = '';
    document.getElementById('cantida_bultos').value = '';
    document.getElementById('tipo_vehiculo').value = '';
    document.getElementById('num_placa').value = '';

    document.getElementById('areaCargaHermetica').checked = false;
    document.getElementById('noTransportaPersonas').checked = false;
    document.getElementById('transporteExclusivo').checked = false;
    document.getElementById('pisoTechoLimpio').checked = false;
    document.getElementById('paredesLimpias').checked = false;
    document.getElementById('libreOlores').checked = false;
    document.getElementById('productoProtegido').checked = false;

    document.getElementById('observaciones').value = '';
    document.getElementById('accionesCorrectivas').value = '';

    document.getElementById('detallearea_hidden').value = '';
    document.getElementById('mesCSV').value = '';
    document.getElementById('anioCSV').value = '';
}

function registrarDetalleCSV() {
    var idCSV_hidden = document.getElementById('idCSV_hidden').value;
    var fecha = document.getElementById('fecha_CSV').value;
    var motivo = document.getElementById('motivo_CSV').value;
    var documento_referencia = document.getElementById('documento_referencia').value;
    var cantida_bultos = document.getElementById('cantida_bultos').value;
    var tipo_vehiculo = document.getElementById('tipo_vehiculo').value;
    var num_placa = document.getElementById('num_placa').value;

    var areaCargaHermetica = document.getElementById('areaCargaHermetica').checked ? 'true' : 'false';
    var noTransportaPersonas = document.getElementById('noTransportaPersonas').checked ? 'true' : 'false';
    var transporteExclusivo = document.getElementById('transporteExclusivo').checked ? 'true' : 'false';
    var pisoTechoLimpio = document.getElementById('pisoTechoLimpio').checked ? 'true' : 'false';
    var paredesLimpias = document.getElementById('paredesLimpias').checked ? 'true' : 'false';
    var libreOlores = document.getElementById('libreOlores').checked ? 'true' : 'false';
    var productoProtegido = document.getElementById('productoProtegido').checked ? 'true' : 'false';

    var observaciones = document.getElementById('observaciones').value;
    var accionesCorrectivas = document.getElementById('accionesCorrectivas').value;

    var detallearea = document.getElementById('detallearea_hidden').value;
    var mes = document.getElementById('mesCSV').value; 
    var anio = document.getElementById('anioCSV').value;

    if (!fecha || !motivo || !documento_referencia || !cantida_bultos || !tipo_vehiculo || !num_placa) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos obligatorios antes de enviar.',
        });
        return;
    }

    fetch('/condiciones_sanitarias_vehiculos/registrar_condiciones_vehiculos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idCSV_hidden: idCSV_hidden,
            fecha: fecha,
            motivo: motivo,
            documento_referencia: documento_referencia,
            cantida_bultos: cantida_bultos,
            tipo_vehiculo: tipo_vehiculo,
            num_placa: num_placa,
            areaCargaHermetica: areaCargaHermetica,
            noTransportaPersonas: noTransportaPersonas,
            transporteExclusivo: transporteExclusivo,
            pisoTechoLimpio: pisoTechoLimpio,
            paredesLimpias: paredesLimpias,
            libreOlores: libreOlores,
            productoProtegido: productoProtegido,
            observaciones: observaciones,
            accionesCorrectivas: accionesCorrectivas,
            detallearea: detallearea,
            mes: mes,
            anio: anio
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Agregado',
                text: 'Se agregó exitosamente un registro para el control de las condiciones sanitarias de los vehículos de transporte.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                sessionStorage.setItem('idCSV_hidden', idCSV_hidden);
                sessionStorage.setItem('detallearea', detallearea);
                sessionStorage.setItem('mes', mes);
                sessionStorage.setItem('anio', anio);
                limpiarCampos();
                verDetallesCSV(idCSV_hidden, detallearea, mes, anio);
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

function volverListaCSV() {
    // Ocultar la sección de detalles
    document.getElementById('detallesCSV').style.display = 'none';

    // Mostrar la sección de detalles
    document.getElementById('llenarFormularioCSV').style.display = 'none';

    // Mostrar la lista de todos los kardex
    document.getElementById('listaCSV').style.display = 'block';
}

function modificarEstadoAC(idAC) {
    var idCSV_hidden = document.getElementById('idCSV_hidden').value;
    var detallearea = document.getElementById('detallearea_hidden').value;
    var mes = document.getElementById('mesCSV').value; 
    var anio = document.getElementById('anioCSV').value;

    fetch(`/condiciones_sanitarias_vehiculos/estadoAC/${idAC}`, {
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
                sessionStorage.setItem('idCSV_hidden', idCSV_hidden);
                sessionStorage.setItem('detallearea', detallearea);
                sessionStorage.setItem('mes', mes);
                sessionStorage.setItem('anio', anio);
                verDetallesCSV(idCSV_hidden, detallearea, mes, anio);
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

function finalizarDetallesCSV(id_header_format) {
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
            fetch('/condiciones_sanitarias_vehiculos/finalizar_Detalles_CSV', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_header_format: id_header_format
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


function verDetallesCSVFinalizadas(id_header_format, detalle_area, mes, anio) {
    console.log(detalle_area);

    document.getElementById('listaCSV').style.display = 'none';
    document.getElementById('detallesCSV').style.display = 'block';
    document.getElementById('tituloDetallesCSV').innerText = `Detalles de ${detalle_area} - ${mes}/${anio}`;
    document.getElementById('idCSV_hidden').value = id_header_format;
    document.getElementById('detallearea_hidden').value = detalle_area;
    document.getElementById('mesCSV').value = mes;
    document.getElementById('anioCSV').value = anio;

    fetch(`/condiciones_sanitarias_vehiculos/detalles_condiciones_sanitarias_vehiculos/${id_header_format}`)
        .then(response => response.json())
        .then(data => {
            var tableBody = $('#tablaDetallesCSV');
            tableBody.empty();

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(function(item) {
                    var verificacion_vehiculos = item.verificacion_vehiculos;
                    var estadoColor = item.estado_ac === "PENDIENTE" ? 'color: red;' : 'color: green;';

                    // Crear una fila HTML y dejar en blanco las celdas donde verificación previa sea None para áreas 2 o 3
                    var row = `
                        <tr>
                            <td class="text-center">${item.fecha}</td>
                            <td class="text-center">${item.detalle_motivo_vehiculo}</td>
                            <td class="text-center">${item.documento_referencia}</td>
                            <td class="text-center">${item.total_bultos}</td>
                            <td class="text-center">${item.detalle_tipo_vehiculo}</td>
                            <td class="text-center">${item.num_placa_vehiculo}</td>
                            <td class="text-center">${verificacion_vehiculos[1] === true ? '✅' : (verificacion_vehiculos[1] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[2] === true ? '✅' : (verificacion_vehiculos[2] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[3] === true ? '✅' : (verificacion_vehiculos[3] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[4] === true ? '✅' : (verificacion_vehiculos[4] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[5] === true ? '✅' : (verificacion_vehiculos[5] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[6] === true ? '✅' : (verificacion_vehiculos[6] === false ? '❌' : '')}</td>
                            <td class="text-center">${verificacion_vehiculos[7] === true ? '✅' : (verificacion_vehiculos[7] === false ? '❌' : '')}</td>
                            <td class="text-center">${item.observacion}</td>
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


//Para filtrar kardex finalizados
function filterCSVCloseArea(anio, mes) {
    // Generar el id esperado del campo de entrada
    const inputId = `filterCACloseArea_${anio}_${mes}`;

    // Obtener el campo de entrada y verificar si existe
    let input = document.getElementById(inputId);
    if (!input) {
        console.error(`No se encontró el campo de entrada con id: ${inputId}`);
        return;
    }

    // Obtener el valor de filtro y convertir a minúsculas
    let filter = input.value.toLowerCase();

    // Generar el id esperado de la tabla
    const tableId = `tableCloseCA_${anio}_${mes}`;

    // Obtener la tabla y verificar si existe
    let table = document.getElementById(tableId);
    if (!table) {
        console.error(`No se encontró la tabla con id: ${tableId}`);
        return;
    }

    // Obtener todas las filas de la tabla
    let tr = table.getElementsByTagName('tr');

    // Recorrer las filas y aplicar el filtro
    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toLowerCase().includes(filter) ? "" : "none";
        }
    }
}

function filterByDate() {
    const mes = document.getElementById("filtrarCACLOSE").value;

    if (mes) {
        const [anio, mesNum] = mes.split("-");
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const nombreMes = meses[parseInt(mesNum) - 1];

        // Redirigir a la misma ruta con los parámetros de mes y año
        window.location.href = `?mes=${nombreMes}&anio=${anio}`;
    }
}

//Para filtrar kardex activos
function filterCSVOpenArea() {
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