$(document).ready(function() {
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
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message || 'Hubo un error al registrar un kardex para este producto. Por favor, inténtelo nuevamente.',
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('Error en la solicitud AJAX:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
                });
            }
        });
    });
});

//Función para mostrar la fecha actual en la fecha
function setDefaultFechaKardex() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_kardex').value = today;
}

window.onload = setDefaultFechaKardex;

function verDetallesKardex(idKardex, descripcionProducto, mes, anio) {
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

    // Aquí pasamos el id para mostrarlo en la tabla
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



function volverListaKardex() {
    // Ocultar la sección de detalles
    document.getElementById('detallesKardex').style.display = 'none';

    // Mostrar la lista de todos los kardex
    document.getElementById('listaKardex').style.display = 'block';
}

function registrarDetalleKardex() {
    var idkardex = document.getElementById('idkardex_hidden').value;
    var descripcion_producto = document.getElementById('descripcion_hidden').value;
    var fecha = document.getElementById('fecha_kardex').value;
    var dias = document.getElementById('numeroDias').value;
    var proveedor = document.getElementById('selectProveedor').value;
    var saldo_inicial = document.getElementById('saldoInicial').value;
    var ingreso = document.getElementById('ingresoKardex').value;
    var salida = document.getElementById('salidaKardex').value;
    var observaciones = document.getElementById('observaciones').value;

    var mes = document.getElementById('mesKardex').value; 
    var anio = document.getElementById('anioKardex').value;

    // Agrega depuración para imprimir los valores obtenidos
    console.log("Valores obtenidos del formulario:");
    console.log("idkardex:", idkardex);
    console.log("descripcion_producto:", descripcion_producto);
    console.log("fecha:", fecha);
    console.log("dias:", dias);
    console.log("proveedor:", proveedor);
    console.log("saldo_inicial:", saldo_inicial);
    console.log("ingreso:", ingreso);
    console.log("salida:", salida);
    console.log("observaciones:", observaciones);
    
    // Validar que los campos obligatorios no estén vacíos
    if (!fecha || !dias || !proveedor || !saldo_inicial || !ingreso || !salida) {
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
        descripcion_producto: descripcion_producto, 
        fecha: fecha, 
        dias: dias, 
        proveedor: proveedor, 
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