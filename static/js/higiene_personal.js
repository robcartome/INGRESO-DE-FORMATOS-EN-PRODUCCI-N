$(document).ready(function() {
    setDefaultFechaKardex();
});

function setDefaultFechaKardex() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_higiene_personal').value = today;
}

function generarFormatoControlHigienePersonal() {
    fetch('/higiene_personal/generar_formato_higiene', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Registro generado',
                text: 'Se generó un registro para el control de aseo e higiene del personal.',
                showConfirmButton: false,
                timer: 500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al generar un registro para el control de aseo e higiene del personal. Por favor, inténtelo nuevamente.',
            });
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
        });
        console.error('Error en la solicitud:', error);
    });
}

function registrarDetalleHigienePersonal() {
    // Obtener los valores de los elementos del formulario
    const fecha = document.getElementById('fecha_higiene_personal').value;
    const trabajador = document.getElementById('selectTrabajador').value;

    const correctaPresentacion = document.getElementById('correctaPresentacion').checked;
    const limpiezaManos = document.getElementById('limpiezaManos').checked;
    const habitosHigiene = document.getElementById('habitosHigiene').checked;

    const observaciones = document.getElementById('observaciones').value || '-';  // Valor por defecto si está vacío
    const accionesCorrectivas = document.getElementById('accionesCorrectivas').value || '-'; // Valor por defecto si está vacío

    // Crear el objeto con los datos del formulario
    const data = {
        fecha: fecha,
        trabajador: trabajador,
        correctaPresentacion: correctaPresentacion ? 'true' : 'false',
        limpiezaManos: limpiezaManos ? 'true' : 'false',
        habitosHigiene: habitosHigiene ? 'true' : 'false',
        observaciones: observaciones,
        accionesCorrectivas: accionesCorrectivas
    };

    // Enviar los datos usando fetch
    fetch('/higiene_personal/registrar_higiene_personal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Agregado',
                text: 'Se agregó exitosamente un registro de control de aseo e higiene del personal.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Hubo un error al registrar el control de higiene del personal. Por favor, inténtelo nuevamente.',
            });
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud',
            text: 'Ocurrió un error al enviar la solicitud: ' + error.message,
        });
        console.error('Error en la solicitud:', error);
    });
}


function modificarEstadoAC(idAC) {
    fetch(`/higiene_personal/estadoAC/${idAC}`, {
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

function finalizarHigienePersonal() {
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
            fetch('/higiene_personal/finalizar_higiene_personal', {
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

function verDetalleHistorial(idFormatos) {
    fetch(`/higiene_personal/obtener_detalle_HP/${idFormatos}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            let detalles = `
                <div class="row mb-3">
                    <div class="col-md-6">
                        <input type="text" id="filtroTrabajador" class="form-control" placeholder="Filtrar por trabajador...">
                    </div>
                    <div class="col-md-6">
                        <input type="date" id="filtroFecha" class="form-control" placeholder="Filtrar por fecha...">
                    </div>
                </div>
                <div class="table-responsive mt-5">
                <table class="table table-bordered" id="detalleTabla">
                    <thead style="background-color: #FF8C00; color: white;">
                        <tr>
                            <th class="text-center">Fecha</th>
                            <th class="text-center">Trabajador</th>
                            <th class="text-center">PP</th>
                            <th class="text-center">LM</th>
                            <th class="text-center">HH</th>
                            <th class="text-center">Observaciones/AC</th>
                            <th class="text-center">Validar</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // Agregar los detalles de cada fila
            data.detalles.forEach(detalle => {
                let ppStatus = "NC", lmStatus = "NC", hhStatus = "NC";
                // Filtrar las verificaciones correspondientes
                let verificaciones = data.verificaciones.filter(v => v.fk_iddetalle_control_higiene_personal === detalle.id_detalle_control_higiene_personal);
                
                // Verificar los estados PP, LM y HH
                if (verificaciones.some(v => v.fk_idverificacion_previa === 5)) ppStatus = "C";
                if (verificaciones.some(v => v.fk_idverificacion_previa === 6)) lmStatus = "C";
                if (verificaciones.some(v => v.fk_idverificacion_previa === 7)) hhStatus = "C";
                
                detalles += `
                    <tr>
                        <td class="text-center">${detalle.fecha}</td>
                        <td class="text-center">${detalle.trabajador}</td>
                        <td class="text-center">${ppStatus}</td>
                        <td class="text-center">${lmStatus}</td>
                        <td class="text-center">${hhStatus}</td>
                        <td class="text-center">${detalle.observaciones}</td>
                        <td class="text-center">${detalle.estado_medida_correctiva}</td>
                    </tr>
                `;
            });

            detalles += `
                        </tbody>
                    </table>
                </div>
            `;

            $('#detalleContenido').html(detalles);

            

            // Escuchar eventos en los campos de filtro
            $('#filtroTrabajador, #filtroFecha').on('input change', filtrarTabla);

            // Mostrar el modal de detalles corregido
            $('#detalleHistorialControlHigienePersonal').modal('show');
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

// Función de filtro general para trabajador y fecha
function filtrarTabla() {
    let filtroTrabajador = $('#filtroTrabajador').val().toLowerCase();
    let filtroFecha = $('#filtroFecha').val(); // Fecha en formato yyyy-mm-dd

    // Filtrar solo las filas del cuerpo de la tabla (tbody)
    $('#detalleTabla tbody tr').filter(function() {
        let trabajador = $(this).find('td:nth-child(2)').text().toLowerCase();
        let fechaTabla = $(this).find('td:nth-child(1)').text(); // Fecha en formato dd/mm/yyyy
        let fechaComparacion = formatFechaComparacion(fechaTabla); // Convertir a yyyy-mm-dd para comparar

        // Filtrar por trabajador y fecha
        let mostrarTrabajador = trabajador.indexOf(filtroTrabajador) > -1 || !filtroTrabajador;
        let mostrarFecha = !filtroFecha || fechaComparacion === filtroFecha;

        // Mostrar la fila si coinciden los filtros
        $(this).toggle(mostrarTrabajador && mostrarFecha);
    });
}

// Función para convertir la fecha dd/mm/yyyy a yyyy-mm-dd para comparación
function formatFechaComparacion(dateString) {
    let [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
}

// Función de filtro general para trabajador y fecha
function filtrarTablaDetalles() {
    let filtroTrabajador = $('#filtroTrabajadorDetalle').val().toLowerCase();
    let filtroFecha = $('#filtroFechaDetalle').val(); // Fecha en formato yyyy-mm-dd

    // Filtrar solo las filas del cuerpo de la tabla (tbody)
    $('#detalle_table_HP tbody tr').filter(function() {
        let trabajador = $(this).find('td:nth-child(2)').text().toLowerCase();
        let fechaTabla = $(this).find('td:nth-child(1)').text(); // Fecha en formato dd/mm/yyyy
        let fechaComparacion = formatFechaComparacion(fechaTabla); // Convertir a yyyy-mm-dd para comparar

        // Filtrar por trabajador y fecha
        let mostrarTrabajador = trabajador.indexOf(filtroTrabajador) > -1 || !filtroTrabajador;
        let mostrarFecha = !filtroFecha || fechaComparacion === filtroFecha;

        // Mostrar la fila si coinciden los filtros
        $(this).toggle(mostrarTrabajador && mostrarFecha);
    });
}

// Escuchar eventos en los campos de filtro
$('#filtroTrabajadorDetalle, #filtroFechaDetalle').on('input change', filtrarTablaDetalles);



