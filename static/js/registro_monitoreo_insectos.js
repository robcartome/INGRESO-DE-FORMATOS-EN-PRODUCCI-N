function generarFormatoMonitoreoInsecto() {
    fetch('/registro_monitoreo_insectos/generar_formato_monitoreo_insecto', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respuesta del servidor:', data);
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Formato generado',
                text: 'Se generó un formato de verificación de limpieza y desinfección de equipos de medición.',
                showConfirmButton: false,
                timer: 500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al generar un formato de verificación de limpieza y desinfección de equipos de medición. Por favor, inténtelo nuevamente.',
            });
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error en la solicitud. Por favor, inténtelo nuevamente.',
        });
    });
}


function registrarDetalleMonitoreoInsectos() {
    // Obtener los valores de los elementos del formulario
    const fecha = document.getElementById('fecha_monitoreo_insectos').value;
    const hora = document.getElementById('hora_monitoreo_insectos').value;
    const observaciones = document.getElementById('observaciones').value || '-';
    const accionCorrectiva = document.getElementById('accionCorrectiva').value || '-';

    // Obtener los checkboxes marcados
    const areasSeleccionadas = Array.from(document.querySelectorAll('input[name="areas"]:checked')).map(checkbox => checkbox.value);

    // Validar que se seleccionó al menos un área
    if (areasSeleccionadas.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Por favor, selecciona al menos un área a verificar.',
        });
        return;
    }

    // Crear el cuerpo de la solicitud con los datos recolectados
    const data = {
        fecha: fecha,
        hora: hora,
        areas: areasSeleccionadas,
        observaciones: observaciones,
        accion_correctiva: accionCorrectiva
    };

    // Enviar la solicitud al backend
    fetch('/registro_monitoreo_insectos/ruta_para_guardar_monitoreo_insectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Registrado',
                text: 'El monitoreo se ha registrado exitosamente.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || 'Ocurrió un error al registrar el monitoreo. Inténtalo de nuevo más tarde.',
            });
        }
    })
    .catch(error => {
        console.error("Error al registrar el monitoreo:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al registrar el monitoreo. Inténtalo de nuevo más tarde.',
        });
    });
}

function modificarEstadoAC(idAC) {
    fetch(`/registro_monitoreo_insectos/estadoAC/${idAC}`, {
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
        console.error("Error al modificar el estado de la acción correctiva:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al modificar estado',
            text: 'Ocurrió un error al modificar el estado de la acción correctiva. Inténtalo de nuevo más tarde.',
        });
    });
}


function finalizar_monitoreo_insectos() {
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
            fetch('/registro_monitoreo_insectos/finalizar_monitoreo_insectos', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire(
                        'Finalizado',
                        'Se finalizó el registro.',
                        'success'
                    ).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire(
                        'Error',
                        data.message || 'Hubo un error al finalizar el registro. Por favor, inténtelo nuevamente.',
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