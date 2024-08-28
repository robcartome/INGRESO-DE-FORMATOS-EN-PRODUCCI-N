$(document).ready(function() {
    $('#formControlGeneralPersona').on('submit', function(event) {
        event.preventDefault();
        var formElement = document.getElementById('formControlGeneralPersona');
        var formData = new FormData(formElement);

        $.ajax({
            url: '/control_general',
            type: 'POST',
            data: formData,
            processData: false, // Necesario para enviar FormData
            contentType: false, // Necesario para enviar FormData
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Trabajador registrado!',
                        text: 'Se registró al trabajador correctamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message || 'Hubo un error al registrar el trabajador. Por favor, inténtelo nuevamente.',
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

    // Rellenar modal con datos del trabajador
    $('#editTrabajadorModal').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget); // Botón que activó el modal
        var modal = $(this);
        
        // Extraer información de los data-* attributes
        modal.find('#editIdTrabajador').val(button.data('id'));
        modal.find('#editDniTrabajador').val(button.data('dni'));
        modal.find('#editNombresTrabajador').val(button.data('nombres'));
        modal.find('#editApellidosTrabajador').val(button.data('apellidos'));
        modal.find('#editFechaNacimiento').val(button.data('fechanacimiento'));
        modal.find('#editDireccionTrabajador').val(button.data('direccion'));
        modal.find('#editCelularTrabajador').val(button.data('celular'));
        modal.find('#editCelularEmergenciaTrabajador').val(button.data('celularemergencia'));
        modal.find('#editFechaIngreso').val(button.data('fechaingreso'));
        modal.find('#editAreaTrabajador').val(button.data('area'));
        modal.find('#editCargoTrabajador').val(button.data('cargo'));
        modal.find('#editGeneroSeleccionar').val(button.data('genero'));
    });

    // Manejar la actualización del trabajador
    $('#formEditTrabajador').on('submit', function(event) {
        event.preventDefault();
        
        var formElement = document.getElementById('formEditTrabajador');
        var formData = new FormData(formElement);

        $.ajax({
            url: '/control_general/update',  // Ruta para actualizar el trabajador
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Trabajador actualizado!',
                        text: 'La información del trabajador se actualizó correctamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        location.reload();  // Recargar la página para mostrar los cambios
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message || 'Hubo un error al actualizar el trabajador. Por favor, inténtelo nuevamente.',
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

    // Mostrar el modal con la imagen ampliada
    $('.card-img-bottom').on('click', function() {
        var src = $(this).attr('src');
        $('#modalImage').attr('src', src);
        $('#viewImageModal').modal('show');
    });
});

function eliminarTrabajador(idTrabajador) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/control_general/delete',
                type: 'POST',
                data: { idTrabajador: idTrabajador },
                success: function(response) {
                    if (response.status === 'success') {
                        Swal.fire(
                            'Eliminado',
                            'El trabajador ha sido eliminado.',
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire(
                            'Error',
                            response.message || 'Hubo un error al eliminar el trabajador. Por favor, inténtelo nuevamente.',
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
