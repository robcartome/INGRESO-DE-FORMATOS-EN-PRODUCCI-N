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
                cargarDetalle(currentSolicitudIdUtil, false);
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

// <- Para entregarUtil.html ->
$(document).ready(function() {
    $('#selectTrabajador').select2({
        placeholder: "Seleccione el colaborador a registrar",
        allowClear: true,
        width: '100%'
    });
});