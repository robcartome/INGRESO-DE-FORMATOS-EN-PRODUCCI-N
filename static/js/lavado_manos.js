$(document).ready(function() {
    setDefaultFechaKardex();
    $('#formControlGeneralPersona').on('submit', function(event) {
        event.preventDefault();
        var formElement = document.getElementById('formControlGeneralPersona');
        var formData = new FormData(formElement);

        $.ajax({
            url: '/lavado_Manos',
            type: 'POST',
            data: formData,
            dataType: 'json',
            contentType: false,  // Importante para enviar FormData
            processData: false,  // Importante para enviar FormData
            success: function(response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registrado!',
                        text: 'Se registró el lavado de manos correctamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message || 'Hubo un error al registrar el lavado de manos.',
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

function setDefaultFechaKardex() {
    const today = new Date().toISOString().split('T')[0];  // Obtiene la fecha actual en formato YYYY-MM-DD
    document.getElementById('fechaLavado').value = today;  // Asigna la fecha al campo de fecha
}

function generarFormatoLavadoManos() {
    $.post('/lavado_Manos/generar_formato_lavado', function(response) {
        if (response.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Formato generado',
                text: 'Se genero un formato de lavado de manos.',
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

function finalarRegistroLavado() {
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
                url: '/lavado_Manos/finalizar_lavado_manos',
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


function historialLavadoManos(){
    $.get('/lavado_Manos/historialLavadoManos', function(data){
        var tableBody = $('#historialLavadoManosBody');
        tableBody.empty();
    });
}


function verDetalleHistorial(idFormatos) {
    // Realiza una solicitud GET para obtener los detalles del registro
    $.get('/lavado_Manos/obtener_detalle_lavado/' + idFormatos, function(response) {
        if (response.status === 'success') {
            // Construye el contenido del modal con los detalles obtenidos
            let detalles = `
                <table class="table table-bordered">
                    <thead style="background-color: #FFC107; color: white;">
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Trabajador</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // Iterar a través de los detalles y agregarlos a la tabla
            response.detalles.forEach(function(detalle) {
                detalles += `
                    <tr>
                        <td>${detalle.fecha}</td>
                        <td>${detalle.hora}</td>
                        <td>${detalle.nombre_formateado}</td>
                    </tr>
                `;
            });

            detalles += `
                    </tbody>
                </table>
            `;

            // Inserta los detalles en el contenido del modal
            $('#detalleContenido').html(detalles);
            // Muestra el modal con los detalles del registro
            $('#detalleLavadoManos').modal('show');
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



function registrarMedidasCorrectivas() {
    Swal.fire({
        title: 'Registrar Medida Correctiva',
        input: 'textarea',
        inputLabel: 'Describe la medida correctiva',
        inputPlaceholder: 'Escribe aquí la medida correctiva...',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: (medidaCorrectiva) => {
            if (!medidaCorrectiva) {
                Swal.showValidationMessage('Por favor, ingresa una medida correctiva');
                return false;
            }
            return medidaCorrectiva;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const medidaCorrectiva = result.value;
            $.ajax({
                url: '/lavado_Manos/registrar_medidas_correctivas',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    medida_correctiva: medidaCorrectiva
                }),
                success: function(response) {
                    if (response.status === 'success') {
                        Swal.fire(
                            'Guardado',
                            'La medida correctiva ha sido registrada con éxito.',
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire(
                            'Error',
                            response.message || 'Hubo un error al registrar la medida correctiva. Por favor, inténtelo nuevamente.',
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


$(document).ready(function() {
    $('#selectTrabajador').select2({
        placeholder: "Seleccione el colaborador a registrar",
        allowClear: true,
        width: '100%'
    });
});