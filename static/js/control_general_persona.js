document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('formControlGeneralPersona').addEventListener('submit', function (event) {
        event.preventDefault();
        var formElement = document.getElementById('formControlGeneralPersona');
        var formData = new FormData(formElement);

        fetch('/control_general/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
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
                    text: data.message || 'Hubo un error al registrar el trabajador. Por favor, inténtelo nuevamente.',
                });
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
            });
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
    document.getElementById('formEditTrabajador').addEventListener('submit', function (event) {
        event.preventDefault();
        
        var formElement = document.getElementById('formEditTrabajador');
        var formData = new FormData(formElement);

        fetch('/control_general/update', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
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
                    text: data.message || 'Hubo un error al actualizar el trabajador. Por favor, inténtelo nuevamente.',
                });
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
            });
        });
    });

    // Mostrar el modal con la imagen ampliada
    document.querySelectorAll('.card-img-bottom').forEach(image => {
        image.addEventListener('click', function () {
            var src = image.getAttribute('src');
            document.getElementById('modalImage').setAttribute('src', src);
            $('#viewImageModal').modal('show');
        });
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
            fetch('/control_general/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idTrabajador: idTrabajador })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
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
                        data.message || 'Hubo un error al eliminar el trabajador. Por favor, inténtelo nuevamente.',
                        'error'
                    );
                }
            })
            .catch(error => {
                Swal.fire(
                    'Error',
                    'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
                    'error'
                );
            });
        }
    });
}

function toggleStatus(trabajadorId, newStatus) {
    fetch('/control_general/toggle_status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: trabajadorId, status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log(data.message);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message
            });
        }
    })
    .catch(error => {
        console.error("Error al actualizar el estado:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar el estado. Inténtelo de nuevo más tarde.'
        });
    });
}
