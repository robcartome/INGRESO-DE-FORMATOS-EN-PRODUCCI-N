$(document).ready(function() {
    setDefaultFechaKardex();
    // Manejar los registros de productos 
    $('#formRegistrarProductos').on('submit', function(event) {
        event.preventDefault();
        
        var formElement = document.getElementById('formRegistrarProductos');
        var formData = new FormData(formElement);

        $.ajax({
            url: '/kardex/agregar_producto',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Producto Agregado!',
                        text: 'El producto se registro correctamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        location.reload();  // Recargar la página para mostrar los cambios
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message || 'Hubo un error al registrar el producto. Por favor, inténtelo nuevamente.',
                    });
                }
            },
            error: function(xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
                });
            }
        });
    });

    // Controlar el registro de kardex
    $('#formAgregarKardex').on('submit', function(event) {
        event.preventDefault();
        var formElement = document.getElementById('formAgregarKardex');
        var formData = new FormData(formElement);

        $.ajax({
            url: '/kardex',
            type: 'POST',
            data: formData,
            processData: false,  // Evitar que jQuery procese los datos
            contentType: false,  // Evitar que jQuery establezca el content-type
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Kardex creado!',
                        text: 'Se creó un kardex para este producto satisfactoriamente.',
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
    document.getElementById('fecha_kardex').value = today;  // Asigna la fecha al campo de fecha
}

function verDetallesKardexCerrado(idKardex, descripcionProducto, mes, anio) {
    // Ocultar la lista de todos los kardex
    document.getElementById('listaKardex').style.display = 'none';

    // Mostrar la sección de detalles
    document.getElementById('detallesKardex').style.display = 'block';

    // Actualizar el título con la información del producto y la fecha
    document.getElementById('tituloDetallesKardex').innerText = `Detalles del Kardex para ${descripcionProducto} - ${mes}/${anio}`;

    // Asignar el idKardex al input hidden
    document.getElementById('idkardex_hidden').value = idKardex;

    // Asignar la descripcion_producto al input hidden
    document.getElementById('descripcion_hidden').value = descripcionProducto;

    // Asignar el idKardex al input hidden
    document.getElementById('mesKardex').value = mes;

    // Asignar la descripcion_producto al input hidden
    document.getElementById('anioKardex').value = anio;

    // Aquí pasamos el id para mostrarlo en la tabla de detalles del Kardex
    $.get('/kardex/detalle_kardex_table/' + idKardex, function(data) {
        var tableBody = $('#tablaDetallesKardex');
        tableBody.empty();

        // Verificar si los datos recibidos son un array y tienen contenido
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(function(item) {
                var row = '<tr>' +
                    '<td class="text-center">' + item.fecha + '</td>' +
                    '<td class="text-center">' + item.lote + '</td>' +
                    '<td class="text-center">' + item.saldo_inicial + '</td>' +
                    '<td class="text-center">' + item.ingreso + '</td>' +
                    '<td class="text-center">' + item.salida + '</td>' +
                    '<td class="text-center">' + item.saldo_final + '</td>' +
                    '<td class="text-center">' + item.observaciones + '</td>' +
                    '</tr>';
                tableBody.append(row);
            });
        } else {
            // Si no hay datos, mostrar un mensaje
            var noDataRow = '<tr><td colspan="7" class="text-center">No hay detalles disponibles para este kardex.</td></tr>';
            tableBody.append(noDataRow);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Error al cargar los detalles del kardex:", textStatus, errorThrown);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar detalles',
            text: 'Ocurrió un error al cargar los detalles del kardex. Inténtalo de nuevo más tarde.',
        });
    });
}


function verDetallesKardex(idKardex, descripcionProducto, mes, anio) {
    // Ocultar la lista de todos los kardex
    document.getElementById('listaKardex').style.display = 'none';

    // Mostrar la sección de detalles
    document.getElementById('llenarFormularioKardex').style.display = 'block';

    // Mostrar la sección de detalles
    document.getElementById('detallesKardex').style.display = 'block';

    // Actualizar el título con la información del producto y la fecha
    document.getElementById('tituloDetallesKardex').innerText = `Detalles del Kardex para ${descripcionProducto} - ${mes}/${anio}`;

    // Asignar el idKardex al input hidden
    document.getElementById('idkardex_hidden').value = idKardex;

    // Asignar la descripcion_producto al input hidden
    document.getElementById('descripcion_hidden').value = descripcionProducto;

    // Asignar el mes al input hidden
    document.getElementById('mesKardex').value = mes;

    // Asignar el año al input hidden
    document.getElementById('anioKardex').value = anio;

    // Hacer una solicitud AJAX para obtener el stock (saldoInicial) usando el idKardex
    fetch('/kardex/get_stock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idkardex: idKardex })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Colocar el valor del stock en el campo saldoInicial
            document.getElementById('saldoInicial').value = data.stock;
        } else {
            console.error('Error al obtener el stock:', data.message);
        }
    })
    .catch(error => console.error('Error en la solicitud del stock:', error));

    // Aquí pasamos el id para mostrarlo en la tabla de detalles del Kardex
    $.get('/kardex/detalle_kardex_table/' + idKardex, function(data) {
        var tableBody = $('#tablaDetallesKardex');
        tableBody.empty();

        // Verificar si los datos recibidos son un array y tienen contenido
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(function(item) {
                var row = '<tr>' +
                    '<td class="text-center">' + item.fecha + '</td>' +
                    '<td class="text-center">' + item.lote + '</td>' +
                    '<td class="text-center">' + item.saldo_inicial + '</td>' +
                    '<td class="text-center">' + item.ingreso + '</td>' +
                    '<td class="text-center">' + item.salida + '</td>' +
                    '<td class="text-center">' + item.saldo_final + '</td>' +
                    '<td class="text-center">' + item.observaciones + '</td>' +
                    '</tr>';
                tableBody.append(row);
            });
        } else {
            // Si no hay datos, mostrar un mensaje
            var noDataRow = '<tr><td colspan="7" class="text-center">No hay detalles disponibles para este kardex.</td></tr>';
            tableBody.append(noDataRow);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Error al cargar los detalles del kardex:", textStatus, errorThrown);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar detalles',
            text: 'Ocurrió un error al cargar los detalles del kardex. Inténtalo de nuevo más tarde.',
        });
    });
}

// Filtrar la tabla de detalle del kardex por la fecha seleccionada
function filterTableDetalleKardex() {
    // Obtener el valor del input de fecha
    let input = document.getElementById('filterFechaDetalleKardex');
    let filter = input.value;  // El valor del input de fecha es en formato yyyy-mm-dd

    let table = document.getElementById('detalleKardexTable');
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



function volverListaKardex() {
    // Ocultar la sección de detalles
    document.getElementById('detallesKardex').style.display = 'none';

    // Mostrar la sección de detalles
    document.getElementById('llenarFormularioKardex').style.display = 'none';

    // Mostrar la lista de todos los kardex
    document.getElementById('listaKardex').style.display = 'block';
}

function registrarDetalleKardex() {
    var idkardex = document.getElementById('idkardex_hidden').value;
    var fecha = document.getElementById('fecha_kardex').value;
    var lote = document.getElementById('loteKardex').value;
    var saldo_inicial = document.getElementById('saldoInicial').value;
    var ingreso = document.getElementById('ingresoKardex').value;
    var salida = document.getElementById('salidaKardex').value;
    var observaciones = document.getElementById('observaciones').value;

    var descripcion_producto = document.getElementById('descripcion_hidden').value;
    var mes = document.getElementById('mesKardex').value; 
    var anio = document.getElementById('anioKardex').value;

    
    // Validar que los campos obligatorios no estén vacíos
    if (!fecha || !lote || !saldo_inicial || !ingreso || !salida) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos obligatorios antes de enviar.',
        });
        return;
    }

    // Convertir valores a números si es necesario
    saldo_inicial = parseFloat(saldo_inicial);
    ingreso = parseFloat(ingreso);
    salida = parseFloat(salida);

    // Verificar si los valores numéricos son válidos
    if (isNaN(saldo_inicial) || isNaN(ingreso) || isNaN(salida)) {
        Swal.fire({
            icon: 'warning',
            title: 'Valores numéricos inválidos',
            text: 'Saldo inicial, ingreso y salida deben ser números válidos.',
        });
        return;
    }

    $.post('/kardex/registrar_lote_kardex', {
        idkardex: idkardex, 
        fecha: fecha, 
        lote: lote,
        saldo_inicial: saldo_inicial, 
        ingreso: ingreso, 
        salida: salida, 
        observaciones: observaciones
    }, function(response) {
        if (response.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Lote agregado',
                text: 'Se agregó exitosamente este lote al kardex.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                // Guardar los valores en sessionStorage antes de recargar la página
                sessionStorage.setItem('idKardex', idkardex);
                sessionStorage.setItem('descripcionProducto', descripcion_producto);
                sessionStorage.setItem('mes', mes);
                sessionStorage.setItem('anio', anio);

                // Recargar la página
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

window.onload = function() {
    // Verificar si hay datos en sessionStorage
    var idKardex = sessionStorage.getItem('idKardex');
    var descripcionProducto = sessionStorage.getItem('descripcionProducto');
    var mes = sessionStorage.getItem('mes');
    var anio = sessionStorage.getItem('anio');

    if (idKardex && descripcionProducto && mes && anio) {
        // Llamar a verDetallesKardex con los valores almacenados
        verDetallesKardex(idKardex, descripcionProducto, mes, anio);

        // Limpiar los datos de sessionStorage para evitar que se use de nuevo accidentalmente
        sessionStorage.removeItem('idKardex');
        sessionStorage.removeItem('descripcionProducto');
        sessionStorage.removeItem('mes');
        sessionStorage.removeItem('anio');
    }
};

function descargarFormatoKardex() {
    var idkardex = document.getElementById('idkardex_hidden').value;
    $.get(`/kardex/descargar_formato_kardex/${idkardex}`, function(response) {
        console.log(idkardex)
    }).fail(function() {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al generar el reporte.',
        });
    });
}

function finalizarKardex(idKardex) {
    $.post('/kardex/finalizar_kardex', {
        idKardex: idKardex
    }, function(response) {
        if (response.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Se finalizo',
                text: 'el estado del kardex fue modificado a Finalizado.',
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
function filterKardexOpenProduct() {
    let input = document.getElementById('filtrarProductoKardex');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('kardexTableOpen');
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
function filterKardexCloseProduct() {
    let input = document.getElementById('filtrarProductoKardexClose');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('tableCloseKardex');
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