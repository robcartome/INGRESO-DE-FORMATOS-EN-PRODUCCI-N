$(document).ready(function() {

    $('#formControlEnvasados').on('submit', function(event) {
        event.preventDefault();
        var formElement = document.getElementById('formControlEnvasados');
        var formData = new FormData(formElement);

        $.ajax({
            url: '/control_envasados',
            type: 'POST',
            data: formData,
            dataType: 'json',
            contentType: false,  
            processData: false,
            success: function(response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registrado!',
                        text: 'Se registró control de envasados correctamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message || 'Hubo un error al registrar el control de envasados.',
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

function generarFormatoControlEnvasados() {
    $.post('/control_envasados/generar_formato_envasados', function(response) {
        if (response.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Registro generado',
                text: 'Se genero un registro para el control de envasados.',
                showConfirmButton: false,
                timer: 500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al generar un registro para el control de envasados. Por favor, inténtelo nuevamente.',
            });
        }
    });
}

function verDetalleHistorial(idFormatos) {
    // Realiza una solicitud GET para obtener los detalles del registro
    $.get('/control_envasados/obtener_detalle_envasados/' + idFormatos, function(response) {
        if (response.status === 'success') {
            // Construye el contenido del modal con los detalles obtenidos
            let detalles = `
                <input type="text" id="filtroProducto" class="form-control mb-3" placeholder="Filtrar por producto...">
                <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-bordered">
                        <thead style="background-color: #FFC107; color: white;">
                            <tr>
                                <th class="text-center">Responsable</th>
                                <th class="text-center">Producto</th>
                                <th class="text-center">C. Producida</th>
                                <th class="text-center">Razón Social P.</th>
                                <th class="text-center">Lote P.</th>
                                <th class="text-center">Lote asignado</th>
                                <th class="text-center">F. Vcto.</th>
                                <th class="text-center">Obs.</th>
                            </tr>
                        </thead>
                        <tbody id="detalleTabla">
            `;

            // Iterar a través de los detalles y agregarlos a la tabla
            response.detalles.forEach(function(detalle) {
                detalles += `
                    <tr>
                        <td>${detalle.responsable}</td>
                        <td>${detalle.descripcion_producto}</td>
                        <td>${detalle.cantidad_producida}</td>
                        <td class="text-center">${detalle.nom_empresa}</td>
                        <td class="text-center">${detalle.lote_proveedor}</td>
                        <td class="text-center">${detalle.lote_asignado}</td>
                        <td class="text-center">${detalle.fecha_vencimiento}</td>
                        <td class="text-center">${detalle.observacion}</td>
                    </tr>
                `;
            });

            detalles += `
                        </tbody>
                    </table>
                </div>
            `;

            // Inserta los detalles en el contenido del modal
            $('#detalleContenido').html(detalles);

            // Añadir filtro de búsqueda al input
            $('#filtroProducto').on('input', function() {
                let filter = $(this).val().toLowerCase();
                $('#detalleTabla tr').filter(function() {
                    $(this).toggle($(this).find('td:nth-child(2)').text().toLowerCase().indexOf(filter) > -1);
                });
            });

            // Muestra el modal con los detalles del registro
            $('#registroControlEnvasados').modal('show');
        } else {
            // Muestra un mensaje de error si no se pudieron obtener los detalles
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron obtener los detalles del registro. Por favor, inténtelo nuevamente.',
            });
        }
    }).fail(function() {
        // Muestra un mensaje de error en caso de fallo en la solicitud
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al intentar obtener los detalles. Por favor, inténtelo nuevamente.',
        });
    });
}


function finalizarControlEnvasados() {
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
            $.ajax({
                url: '/control_envasados/finalizar_Control_Envasados',
                type: 'POST',
                success: function(response) {
                    if (response.status === 'success') {
                        Swal.fire(
                            'Finalizado',
                            'Se finalizo el registro.',
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire(
                            'Error',
                            response.message || 'Hubo un error al finalizar el registro. Por favor, inténtelo nuevamente.',
                            'error'
                        );
                    }
                },
                error: function(xhr, status, error) {
                    Swal.fire(
                        'Error',
                        'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
                        'error'
                    );
                }
            });
        }
    });
}
