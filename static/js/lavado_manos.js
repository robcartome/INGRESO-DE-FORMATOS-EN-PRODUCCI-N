document.addEventListener('DOMContentLoaded', function () {
    setDefaultFechaKardex();

    document.getElementById('formControlGeneralPersona').addEventListener('submit', function (event) {
        event.preventDefault();
        var formElement = document.getElementById('formControlGeneralPersona');
        var formData = new FormData(formElement);

        fetch('/lavado_Manos/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
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
                    text: data.message || 'Hubo un error al registrar el lavado de manos.',
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
});

function setDefaultFechaKardex() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fechaLavado').value = today;
}

function generarFormatoLavadoManos() {
    fetch('/lavado_Manos/generar_formato_lavado', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Formato generado',
                text: 'Se generó un formato de lavado de manos.',
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
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error en la solicitud. Por favor, inténtelo nuevamente.',
        });
    });
}

function finalizarRegistroLavado() {
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
            fetch('/lavado_Manos/finalizar_lavado_manos', {
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

function historialLavadoManos() {
    fetch('/lavado_Manos/historialLavadoManos')
    .then(response => response.json())
    .then(data => {
        var tableBody = document.getElementById('historialLavadoManosBody');
        tableBody.innerHTML = '';  // Limpiar el contenido del cuerpo de la tabla
        // Aquí puedes agregar el código para mostrar los datos en la tabla
    })
    .catch(error => {
        console.error('Error al obtener el historial:', error);
    });
}

function verDetalleHistorial(idFormatos) {
    fetch(`/lavado_Manos/obtener_detalle_lavado/${idFormatos}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
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

            data.detalles.forEach(detalle => {
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

            document.getElementById('detalleContenido').innerHTML = detalles;
            $('#detalleLavadoManos').modal('show');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron obtener los detalles del registro. Por favor, inténtelo nuevamente.',
            });
        }
    })
    .catch(error => {
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
            fetch('/lavado_Manos/registrar_medidas_correctivas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    medida_correctiva: medidaCorrectiva
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
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
                        data.message || 'Hubo un error al registrar la medida correctiva. Por favor, inténtelo nuevamente.',
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

document.addEventListener('DOMContentLoaded', function () {
    $('#selectTrabajador').select2({
        placeholder: "Seleccione el colaborador a registrar",
        allowClear: true,
        width: '100%'
    });
});


// Filtrar la tabla de detalle del kardex por la fecha seleccionada
function filterTableDetalleLavadoMano() {
    // Obtener el valor del input de fecha
    let input = document.getElementById('filterFechaDetalleCA');
    let filter = input.value;  // El valor del input de fecha es en formato yyyy-mm-dd

    let table = document.getElementById('detalleLavadoManoTable');
    let tr = table.getElementsByTagName('tr');

    // Iterar sobre las filas de la tabla (excepto la cabecera)
    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[2];  // Obtener la tercera celda (columna de fecha)

        if (td) {
            // Obtener el valor de la fecha de la celda
            let txtValue = td.textContent || td.innerText;

            // Si coinciden o no hay filtro, mostrar la fila
            if (txtValue === filter || filter === "") {
                tr[i].style.display = "";
            } else {
                // Si no coinciden, ocultar la fila
                tr[i].style.display = "none";
            }
        }
    }
}

