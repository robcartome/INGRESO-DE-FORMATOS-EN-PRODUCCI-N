//Función para generar el formato
function generarFormatoMCA() {
    const laboratorio = document.getElementById('LaboratorioRegister').value;
    const dateCreation = document.getElementById('fecha_format_creation').value;

    if (!laboratorio || !dateCreation) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Por favor, complete todos los campos.',
        });
        return;
    }

    fetch('/monitoreo_agua/generar_formato_MCA', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Especificar que se envía JSON
        },
        body: JSON.stringify({
            laboratorio: laboratorio,
            dateCreation: dateCreation,  // Usar el nombre esperado por el servidor
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Formato generado',
                    text: 'Se generó un formato de monitoreo de la calidad de agua.',
                    showConfirmButton: false,
                    timer: 500
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al generar un formato de monitoreo de la calidad de agua. Por favor, inténtelo nuevamente.',
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


function registrarFormatoCalidadAgua() {
    // Mostrar el loader
    document.getElementById('loader').style.display = 'block';

    // Obtener tabla y filas
    let table = document.getElementById('TableMCA');
    let rows = table.getElementsByTagName('tr');
    let cambios = [];

    // Iterar sobre las filas de la tabla
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let id = row.getAttribute('data-id');
        let resultado_register = row.querySelector('input[name="resultado_register"]').value;
        let observaciones_register = row.querySelector('input[name="observaciones_register"]').value;

        // Validar campos no vacíos
        if (resultado_register.trim() === "" && observaciones_register.trim() === "") {
            continue; // Saltar si ambos están vacíos
        }

        cambios.push({
            idTipo: id,
            resultado_register: resultado_register.trim(),
            observaciones_register: observaciones_register.trim()
        });
    }

    // Validar que hay cambios antes de enviar
    if (cambios.length === 0) {
        document.getElementById('loader').style.display = 'none';
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No hay cambios para guardar.',
        });
        return;
    }

    // Enviar los cambios al servidor
    fetch('/monitoreo_agua/guardar_formato_calidad_agua', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios)
    })
    .then(response => response.json())
    .then(data => {
        // Ocultar loader
        document.getElementById('loader').style.display = 'none';

        // Manejar respuesta
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: '¡Cambios guardados!',
                text: 'Los cambios se guardaron correctamente.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => location.reload());
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Hubo un error al actualizar el formato. Intente nuevamente.'
            });
        }
    })
    .catch(error => {
        console.error('Error al guardar los cambios:', error);

        // Ocultar loader
        document.getElementById('loader').style.display = 'none';

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al guardar los cambios. Intente nuevamente.'
        });
    });
}

//Para finalizar el registro 
function finalizarRegistro(){
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Una vez finalizado, no se podrán realizar cambios en el registro.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, finalizar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/monitoreo_agua/finalizar_registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro finalizado!',
                        text: 'El registro se ha finalizado correctamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => location.reload());
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un error al finalizar el registro. Intente nuevamente.'
                    });
                }
            })
            .catch(error => {
                console.error('Error al finalizar el registro:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al finalizar el registro. Intente nuevamente.'
                });
            });
        }
    });
}

function filterByDate() {
    const fechaInput = document.getElementById("filtrarCACLOSE").value;

    // Validar si la fecha tiene un valor válido
    if (!fechaInput) {
        alert("Por favor, selecciona una fecha válida.");
        return;
    }

    // Asegurar el formato correcto de la fecha
    const fecha = new Date(fechaInput).toISOString().split('T')[0]; // Formato YYYY-MM-DD

    // Obtener los parámetros actuales de la URL
    const urlParams = new URLSearchParams(window.location.search);

    // Actualizar o agregar el parámetro 'date' con la fecha seleccionada
    urlParams.set("date", fecha);

    // Redirigir con la nueva URL
    window.location.search = urlParams.toString();
}
