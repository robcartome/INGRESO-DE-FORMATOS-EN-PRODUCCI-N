$(document).ready(function() {
    setDefaultFechalimpiezaAreas();
});

//Función para pasar el area seleccionada y esperarun success
function agregarRegistroLimpiezaAreas() {
    let selectArea = document.getElementById('selectArea').value;

    if (!selectArea) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Por favor, seleccione un área antes de agregar el registro.',
        });
        return;
    }

    fetch(`/limpieza_areas/agregar_registro_limpieza_areas/${selectArea}`, {
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
                title: 'Registrado',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            }).then(() => location.reload());
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message,
            });
        }
    })
    .catch(error => {
        console.error("Error al registrar la limpieza del área:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al registrar limpieza',
            text: 'Ocurrió un error al registrar la limpieza del área. Inténtalo de nuevo más tarde.',
        });
    });
}

//Para filtrar kardex activos
function filterLAOpenArea() {
    let input = document.getElementById('filtrarAraeLA');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('LATableOpen');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

//Para filtrar kardex finalizados
function filterLACloseArea() {
    let input = document.getElementById('filtrarAraeLACLOSE');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('tableCloseLA');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function volverListaCA() {
    document.getElementById('listaLimpiezaArea').style.display = 'block';

    document.getElementById('detallesLimpiezaAreas').style.display = 'none';
}


function verDetallesVerificacionLimpiezaAreas(id_verificacion_limpieza_desinfeccion_area, id_area, detalle_area, mes, anio) {
    document.getElementById('listaLimpiezaArea').style.display = 'none';
    document.getElementById('detallesLimpiezaAreas').style.display = 'block';

    document.getElementById('tituloDetallesLa').innerText = `Detalles de ${detalle_area} - ${mes}/${anio}`;

    document.getElementById('id_limpieza_area_hidden').value = id_verificacion_limpieza_desinfeccion_area;
    document.getElementById('id_area').value = id_area;
    document.getElementById('detallearea_hidden').value = detalle_area;
    document.getElementById('mesLA').value = mes;
    document.getElementById('anioLA').value = anio;

    fetch(`/limpieza_areas/detalles_limpieza_areas/${id_verificacion_limpieza_desinfeccion_area}`)
        .then(response => response.json())
        .then(data => {
            // Limpiar todas las tablas primero
            document.querySelectorAll("[id^='tablaDetallesCA_']").forEach(tbody => tbody.innerHTML = '');

            // Rellenar las tablas con los datos recibidos
            for (const [categoriaId, detalle] of Object.entries(data)) {
                let tbody = document.getElementById(`tablaDetallesCA_${categoriaId}`);
                if (tbody) {
                    detalle.fechas.forEach(fecha => {
                        let row = `<tr><td class="text-center">${fecha}</td></tr>`;
                        tbody.innerHTML += row;
                    });
                }
            }
        })
        .catch(error => {
            console.error("Error al cargar los detalles de limpieza:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar detalles',
                text: 'Ocurrió un error al cargar los detalles de limpieza. Inténtalo de nuevo más tarde.',
            });
        });
}

// Filtro de categorías en base al texto ingresado
function filtrarPorTexto() {
    const input = document.getElementById('buscarCategoria').value.toLowerCase();
    const tarjetas = document.getElementsByClassName('tarjeta-categoria');

    // Verificar si hay texto en el campo de búsqueda
    const hayTexto = input.trim() !== '';

    Array.from(tarjetas).forEach(tarjeta => {
        const categoriaTexto = tarjeta.getAttribute('data-categoria').toLowerCase();
        
        // Mostrar la tarjeta si coincide con el texto o si no hay filtro
        if (hayTexto && categoriaTexto.includes(input)) {
            tarjeta.style.display = 'block'; // Mostrar tarjeta si coincide con el texto
        } else if (!hayTexto) {
            tarjeta.style.display = 'block'; // Mostrar todas las tarjetas si no hay filtro
        } else {
            tarjeta.style.display = 'none'; // Ocultar tarjeta si no coincide
        }
    });
}

// Filtro de categorías en base al texto ingresado
function filtrarPorTexto() {
    const input = document.getElementById('buscarCategoria').value.toLowerCase();
    const tarjetas = document.getElementsByClassName('tarjeta-categoria');
    const hayTexto = input.trim() !== '';

    Array.from(tarjetas).forEach(tarjeta => {
        const categoriaTexto = tarjeta.getAttribute('data-categoria').toLowerCase();
        
        if (hayTexto && categoriaTexto.includes(input)) {
            tarjeta.style.display = 'block'; // Mostrar tarjeta si coincide con el texto
        } else if (!hayTexto) {
            tarjeta.style.display = 'block'; // Mostrar todas las tarjetas si no hay filtro
        } else {
            tarjeta.style.display = 'none'; // Ocultar tarjeta si no coincide
        }
    });
}

function verDetallesVerificacionLimpiezaAreas(id_verificacion, id_area, detalle_area, mes, anio, estado) {
    document.getElementById('listaLimpiezaArea').style.display = 'none';
    document.getElementById('detallesLimpiezaAreas').style.display = 'block';
    document.getElementById('tituloDetallesLa').innerText = `Detalles de ${detalle_area} - ${mes}/${anio}`;

    document.getElementById('id_limpieza_area_hidden').value = id_verificacion;

    const contenedorCategorias = document.getElementById('contenedorCategorias');
    contenedorCategorias.innerHTML = '';

    fetch(`/limpieza_areas/obtener_categorias_area/${id_area}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                let cardHTML = '';

                data.categorias.forEach(categoria => {
                    let isClosed = estado === 'CERRADO';

                    // Generar acordeón para cada categoría
                    cardHTML += `
                    <div class="col-12 tarjeta-categoria" data-categoria="${categoria.detalles_categorias_limpieza_desinfeccion}">
                        <div class="card">
                            <div class="card-header bg-warning text-white" id="heading${categoria.id_categorias_limpieza_desinfeccion}">
                                <h5 class="mb-0">
                                    <button class="btn btn-link text-white" type="button" data-toggle="collapse" data-target="#collapse${categoria.id_categorias_limpieza_desinfeccion}" aria-expanded="true" aria-controls="collapse${categoria.id_categorias_limpieza_desinfeccion}">
                                        ${categoria.detalles_categorias_limpieza_desinfeccion} (Frecuencia: ${categoria.frecuencia})
                                    </button>
                                </h5>
                            </div>

                            <div id="collapse${categoria.id_categorias_limpieza_desinfeccion}" class="collapse" aria-labelledby="heading${categoria.id_categorias_limpieza_desinfeccion}" data-parent="#contenedorCategorias">
                                <div class="card-body">
                                    ${!isClosed ? `
                                    <div class="form-inline d-flex justify-content-between">
                                        <input type="date" id="fecha_${categoria.id_categorias_limpieza_desinfeccion}" class="fecha_actual form-control mb-3 mr-2" style="flex: 2;">
                                        <button class="btn btn-success btn-sm mb-3" style="flex: 1;" onclick="registrarFechaLimpieza(${categoria.id_categorias_limpieza_desinfeccion})">
                                            <i class="fas fa-calendar-plus"></i> Registrar
                                        </button>
                                    </div>
                                    ` : `
                                    <p class="text-muted">Historial de las fechas registradas:</p>
                                    `}
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th class="text-center">Fechas Registradas</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaDetallesCA_${categoria.id_categorias_limpieza_desinfeccion}">
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>`;
                });

                contenedorCategorias.innerHTML = cardHTML;

                if (estado !== 'CERRADO') {
                    setDefaultFechalimpiezaAreas();
                }

                data.categorias.forEach(categoria => {
                    cargarFechasLimpieza(id_verificacion, categoria.id_categorias_limpieza_desinfeccion);
                });

                filtrarPorTexto();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message,
                });
            }
        })
        .catch(error => {
            console.error("Error al cargar las categorías de limpieza:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al cargar las categorías de limpieza. Inténtalo de nuevo más tarde.',
            });
        });
}


function finalizarVerificacionLimpiezaAreas(id_verificacion) {
    fetch(`/limpieza_areas/finalizar_limpieza_areas/${id_verificacion}`, {
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
                title: 'Registrado',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            }).then(() => location.reload());
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message,
            });
        }
    })
    .catch(error => {
        console.error("Error al registrar la limpieza del área:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al registrar limpieza',
            text: 'Ocurrió un error al registrar la limpieza del área. Inténtalo de nuevo más tarde.',
        });
    });
}

// Función para establecer la fecha actual en los campos de fecha
function setDefaultFechalimpiezaAreas() {
    const today = new Date().toISOString().split('T')[0];  // Obtiene la fecha actual en formato YYYY-MM-DD
    
    // Selecciona todos los inputs que tienen la clase 'fecha_actual'
    document.querySelectorAll('.fecha_actual').forEach(campo => {
        campo.value = today;  // Asigna la fecha actual a cada campo
    });
}

// Función para cargar las fechas de limpieza registradas para una categoría
function cargarFechasLimpieza(id_verificacion, categoriaId) {
    fetch(`/limpieza_areas/obtener_fechas_limpieza/${id_verificacion}/${categoriaId}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const tbody = document.getElementById(`tablaDetallesCA_${categoriaId}`);
            tbody.innerHTML = ''; // Limpiar la tabla

            // Añadir cada fecha a la tabla
            data.fechas.forEach(fechas => {
                const row = `<tr><td class="text-center">${fechas.fecha}</td></tr>`;
                tbody.innerHTML += row;
            });
        }
    })
    .catch(error => {
        console.error("Error al cargar las fechas de limpieza:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar fechas',
            text: 'Ocurrió un error al cargar las fechas de limpieza. Inténtalo de nuevo más tarde.',
        });
    });
}

function registrarFechaLimpieza(categoriaId) {
    const fechaInput = document.getElementById(`fecha_${categoriaId}`);
    const fecha = fechaInput.value;
    const idVerificacion = document.getElementById('id_limpieza_area_hidden').value;

    if (!fecha) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Por favor, seleccione una fecha para registrar.',
        });
        return;
    }

    fetch('/limpieza_areas/registrar_fecha_limpieza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: fecha, categoria_id: categoriaId, id_verificacion: idVerificacion })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Registrado',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                // Limpiar el campo de fecha y recargar la tabla de fechas
                fechaInput.value = '';
                cargarFechasLimpieza(idVerificacion, categoriaId);
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
        console.error("Error al registrar la fecha de limpieza:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text: 'Ocurrió un error al registrar la fecha de limpieza. Inténtalo de nuevo más tarde.',
        });
    });
}


function verRegistrarObservacionesLimpiezaAreas() {
    var observacionLimpiezaAreas = document.getElementById('observacionLimpiezaAreas').value;
    var accionCorrectivaLimpiezaAreas = document.getElementById('accionCorrectivaLimpiezaAreas').value;

    
    if (!observacionLimpiezaAreas || !accionCorrectivaLimpiezaAreas) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos obligatorios antes de enviar.',
        });
        return;
    }

    fetch('/limpieza_areas/registrar_observaciones_limpieza_area', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            observacionLimpiezaAreas: observacionLimpiezaAreas,
            accionCorrectivaLimpiezaAreas: accionCorrectivaLimpiezaAreas
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Agregado',
                text: 'Se agregó exitosamente un registro de limpieza y desinfección de las áreas.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                cargarObservacionesLimpiezaAreas();
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
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud',
            text: 'Ocurrió un error al enviar la solicitud: ' + error,
        });
    });
}

function modificarEstadoAC(idAC) {
    fetch(`/limpieza_areas/estadoAC/${idAC}`, {
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
                cargarObservacionesLimpiezaAreas();
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


function cargarObservacionesLimpiezaAreas() {
    fetch('/limpieza_areas/get_observaciones_limpieza_areas')
    .then(response => response.json())
    .then(data => {
        // Limpia la tabla de observaciones
        var tableBody = $('#tablaDetallesObservacionesHistorial');
        tableBody.empty(); // Método jQuery para limpiar

        if (data.status === 'success' && Array.isArray(data.observaciones) && data.observaciones.length > 0) {
            // Recorre cada observación y crea una fila para la tabla
            data.observaciones.forEach(observacion => {
                let row = `
                    <tr>
                        <td class="text-center">${observacion.detalledemedidacorrectiva}</td>
                        <td class="text-center">${observacion.fecha}</td>
                        <td class="text-center ${observacion.estado === 'SOLUCIONADO' ? 'text-success' : 'text-danger'}">${observacion.detalle_accion_correctiva}</td>
                        <td class="text-center">
                            <button type="button" class="btn d-block w-100 mb-1" style="background-color: #FF8C00; color: white;" onclick="modificarEstadoAC('${observacion.idaccion_correctiva}')">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        </td>
                    </tr>`;
                // Añadir la fila a la tabla
                tableBody.append(row); // Método jQuery para añadir contenido
            });
        } else {
            let noDataRow = '<tr><td colspan="4" class="text-center">No hay observaciones disponibles para este mes.</td></tr>';
            tableBody.html(noDataRow); // Método jQuery para añadir HTML cuando no hay datos
        }
    })
    .catch(error => {
        console.error("Error al cargar las observaciones:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar observaciones',
            text: 'Ocurrió un error al cargar las observaciones. Inténtalo de nuevo más tarde.',
        });
    });
}
