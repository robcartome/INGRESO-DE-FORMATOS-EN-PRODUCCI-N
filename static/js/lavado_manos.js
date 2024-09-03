$(document).ready(function() {
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

function finalarRegistroLavado(){
    $.post('/lavado_Manos/finalizar_lavado_manos', function(response){
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
            const detalles = `
                <p><strong>Fecha:</strong> ${response.detalle.fecha}</p>
                <p><strong>Hora:</strong> ${response.detalle.hora}</p>
                <p><strong>Trabajador:</strong> ${response.detalle.fk_idtrabajador}</p>
                <p><strong>ID Formato:</strong> ${response.detalle.fk_idformatos}</p>
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


// <- Para entregarUtil.html ->
$(document).ready(function() {
    $('#selectTrabajador').select2({
        placeholder: "Seleccione el colaborador a registrar",
        allowClear: true,
        width: '100%'
    });
});