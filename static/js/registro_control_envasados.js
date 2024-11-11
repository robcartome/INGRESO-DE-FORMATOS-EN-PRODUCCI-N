function registerControlEnvasados() {
    const formElement = document.getElementById('formControlEnvasados');
    const formData = new FormData(formElement);

    // Convertir FormData a JSON
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch('/control_envasados/registro_control_envasados_reg', {
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
                text: data.message || 'Hubo un error al registrar el control de envasados.',
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
}


document.addEventListener('DOMContentLoaded', function () {
    $('#selectProducto').select2({
        theme: 'bootstrap4',
        placeholder: "Seleccione el producto",
        allowClear: true,
        width: '100%'
    });
});

function generarFormatoControlEnvasados() {
    const fechaCreacion = document.getElementById('fechaCreacion').value;

    fetch('/control_envasados/generar_formato_envasados', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fechaCreacion: fechaCreacion
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Registro generado',
                text: 'Se generó un registro para el control de envasados.',
                showConfirmButton: false,
                timer: 1500
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
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al generar el registro. Por favor, inténtelo nuevamente.',
        });
    });
}


function verDetalleHistorial(idFormatos) {
    fetch(`/control_envasados/obtener_detalle_envasados/${idFormatos}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            let detalles = `
                <div class="row mb-3">
                    <div class="col-md-6">
                        <input type="text" id="filtroResponsable" class="form-control" placeholder="Filtrar por responsable...">
                    </div>
                    <div class="col-md-6">
                        <input type="text" id="filtroProducto" class="form-control" placeholder="Filtrar por producto...">
                    </div>
                </div>
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

            // Agregar los detalles de cada fila
            data.detalles.forEach(detalle => {
                detalles += `
                    <tr>
                        <td>${detalle.responsable}</td>
                        <td>${detalle.descripcion_producto}</td>
                        <td class="text-center">${detalle.cantidad_producida}</td>
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

            $('#detalleContenido').html(detalles);

            // Función de filtro general para ambas columnas
            function filtrarTabla() {
                let filtroResponsable = $('#filtroResponsable').val().toLowerCase();
                let filtroProducto = $('#filtroProducto').val().toLowerCase();

                $('#detalleTabla tr').filter(function() {
                    let responsable = $(this).find('td:nth-child(1)').text().toLowerCase();
                    let producto = $(this).find('td:nth-child(2)').text().toLowerCase();

                    // Mostrar la fila si ambos filtros coinciden (si alguno de los campos está vacío, lo ignora en el filtrado)
                    $(this).toggle(
                        (responsable.indexOf(filtroResponsable) > -1 || !filtroResponsable) &&
                        (producto.indexOf(filtroProducto) > -1 || !filtroProducto)
                    );
                });
            }

            // Escuchar eventos en ambos campos de filtro
            $('#filtroResponsable, #filtroProducto').on('input', filtrarTabla);

            $('#registroControlEnvasados').modal('show');
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
            fetch('/control_envasados/finalizar_Control_Envasados', {
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

function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function filtrarProResRE() {
    let input = document.getElementById('filtrarProResRE');
    let filter = normalizeString(input.value); // Normalizar el texto del filtro
    let table = document.getElementById('tableRegisterCE');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        // Obtener las celdas de las columnas "Responsable" y "Producto"
        let tdResponsable = tr[i].getElementsByTagName('td')[0]; // Responsable
        let tdProducto = tr[i].getElementsByTagName('td')[1];    // Producto

        if (tdResponsable || tdProducto) {
            let txtResponsable = tdResponsable ? normalizeString(tdResponsable.textContent || tdResponsable.innerText) : '';
            let txtProducto = tdProducto ? normalizeString(tdProducto.textContent || tdProducto.innerText) : '';

            // Si alguno de los dos valores coincide con el filtro, mostrar la fila
            if (txtResponsable.indexOf(filter) > -1 || txtProducto.indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// Función para convertir una fecha en formato dd/mm/yyyy a yyyy-mm-dd
function formatDate(dateString) {
    // Si la fecha es en formato dd/mm/yyyy o mm/dd/yyyy, convertir a yyyy-mm-dd
    let parts = dateString.split('/');
    if (parts.length === 3) {
        let day = parts[0].padStart(2, '0'); // Asegurar dos dígitos para el día
        let month = parts[1].padStart(2, '0'); // Asegurar dos dígitos para el mes
        let year = parts[2];
        return `${year}-${month}-${day}`;
    }
    // Si no hay barras en la fecha (ya está en formato yyyy-mm-dd), devolver tal cual
    return dateString;
}


// Filtrar la tabla de registro y control de envasados por fecha
function filterTableFechaControlEnvasados() {
    const fecha_filtrar = document.getElementById("filterFechaCE").value;
    
    // Si la fecha está vacía, mostrar el acordeón y vaciar la tabla
    if (!fecha_filtrar) {
        document.getElementById("tablaHistorialEnvasados").innerHTML = "";
        document.getElementById("accordionFinalizados").style.display = "block";
        return;
    }

    // Enviar la solicitud AJAX con fecha en el cuerpo
    fetch(`/control_envasados/filtrar_por_fecha`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ fecha_filtrar: fecha_filtrar })
    })
    .then(response => response.text())
    .then(html => {
        // Ocultar el acordeón y mostrar solo la tabla filtrada
        document.getElementById("accordionFinalizados").style.display = "none";
        document.getElementById("tablaHistorialEnvasados").innerHTML = html;
    })
    .catch(error => console.error('Error al filtrar por fecha:', error));
}


function loadHistorialPage(page) {
    fetch(`/control_envasados/historial?page=` + page)
        .then(response => response.text())
        .then(html => {
            document.querySelector("#historialControlEnvasados .modal-body").innerHTML = html;
        })
        .catch(error => {
            console.error("Error al cargar el historial:", error);
        });
}


function downloadFormats(anio, mes) {
    // Seleccionar el loader específico para el grupo
    const loader = document.getElementById(`loaderGenerar_${anio}_${mes}`);
    
    // Mostrar el loader antes de iniciar la descarga
    if (loader) {
        loader.style.display = 'flex';
    }

    // Verificar que mes y año existan
    if (!mes || !anio) {
        console.error("Mes o año no especificados para la descarga.");
        if (loader) loader.style.display = 'none';
        return;
    }

    // Construir la URL con los parámetros mes y año
    const url = `/control_envasados/download_formats?mes=${mes}&anio=${anio}`;

    // Realizar la descarga del archivo ZIP
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Error al descargar el archivo.");
            return response.blob(); // Convertir la respuesta a blob
        })
        .then(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `Control_Envasados_${mes}_${anio}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        })
        .catch(error => {
            console.error("Error al descargar el archivo:", error);
            alert("Hubo un problema al descargar el archivo.");
        })
        .finally(() => {
            // Ocultar el loader después de completar o si ocurre un error
            if (loader) {
                loader.style.display = 'none';
            }
        });
}