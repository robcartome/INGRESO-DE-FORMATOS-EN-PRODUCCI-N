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


function verDetallesKardex(idKardex, descripcionProducto, mes, anio) {
    // Ocultar la lista de todos los kardex
    document.getElementById('listaKardex').style.display = 'none';
    
    // Mostrar la sección de detalles
    document.getElementById('detallesKardex').style.display = 'block';
    
    // Actualizar el título con la información del producto y la fecha
    document.getElementById('tituloDetallesKardex').innerText = `Detalles del Kardex para ${descripcionProducto} - ${mes}/${anio}`;
    
    // Aquí se haría una solicitud AJAX para obtener los detalles del kardex
    fetch(`/detalles_kardex/${idKardex}`)
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById('tablaDetallesKardex');
            tabla.innerHTML = '';  // Limpiar la tabla

            // Agregar filas a la tabla con los detalles del kardex
            data.forEach(detalle => {
                const row = tabla.insertRow();
                row.innerHTML = `
                    <td>${new Date(detalle.fecha).toLocaleDateString('es-ES')}</td>
                    <td>${detalle.lote}</td>
                    <td>${detalle.saldo_inicial}</td>
                    <td>${detalle.ingreso}</td>
                    <td>${detalle.salida}</td>
                    <td>${detalle.saldo_final}</td>
                    <td>${detalle.observaciones}</td>
                `;
            });
        })
        .catch(error => console.error('Error al cargar los detalles del kardex:', error));
}

function volverListaKardex() {
    // Ocultar la sección de detalles
    document.getElementById('detallesKardex').style.display = 'none';

    // Mostrar la lista de todos los kardex
    document.getElementById('listaKardex').style.display = 'block';
}

function finalarRegistroLavado(idKardex){
    $.post('/lavado_Manos/finalizar_lavado_manos/'  + idKardex , function(response){
        if (response.status === 'success'){
            Swal.fire({
                icon: 'success',
                title: 'Se finalizo',
                text: 'Se finalizo correctamente el formato de lavado de manos.',
                showConfirmButton: false,
                timer: 500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al generar un formato de lavado de manos. Por favor, inténtelo nuevamente.',
            });
        }
    });
}