document.addEventListener('DOMContentLoaded', function () {

    $('#selectProducto').select2({
        theme: 'bootstrap4',
        placeholder: "Seleccione el producto",
        allowClear: true,
        width: '100%'
    });

    setDefaultFechaKardex();

    // Manejar los registros de productos
    document.getElementById('formRegistrarProductos').addEventListener('submit', function (event) {
        event.preventDefault();
        
        var formElement = document.getElementById('formRegistrarProductos');
        var formData = new FormData(formElement);

        fetch('/kardex/agregar_producto', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: '¡Producto Agregado!',
                    text: 'El producto se registró correctamente.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Hubo un error al registrar el producto. Por favor, inténtelo nuevamente.',
                });
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
            });
            console.error('Error en la solicitud:', error);
        });
    });

    // Controlar el registro de kardex
    document.getElementById('formAgregarKardex').addEventListener('submit', function (event) {
        event.preventDefault();
        
        var formElement = document.getElementById('formAgregarKardex');
        var formData = new FormData(formElement);

        fetch('/kardex/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: '¡Kardex creado!',
                    text: 'Se creó un kardex para este producto satisfactoriamente.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Hubo un error al crear el kardex. Por favor, inténtelo nuevamente.',
                });
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
            });
            console.error('Error en la solicitud:', error);
        });
    });
});

function setDefaultFechaKardex() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_kardex').value = today;
}

function verDetallesKardex(idKardex, descripcionProducto, mes, anio) {
    document.getElementById('listaKardex').style.display = 'none';
    document.getElementById('llenarFormularioKardex').style.display = 'block';
    document.getElementById('detallesKardex').style.display = 'block';

    document.getElementById('tituloDetallesKardex').innerText = `Detalles del Kardex para ${descripcionProducto} - ${mes}/${anio}`;
    document.getElementById('idkardex_hidden').value = idKardex;
    document.getElementById('descripcion_hidden').value = descripcionProducto;
    document.getElementById('mesKardex').value = mes;
    document.getElementById('anioKardex').value = anio;

    fetch('/kardex/get_stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idkardex: idKardex })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Asignar el saldo inicial
            document.getElementById('saldoInicial').value = data.stock;
    
            // Obtener el select de lotes
            const selectLote = document.getElementById('selectLote');
    
            // Limpiar el select actual
            selectLote.innerHTML = '';
    
            // Llenar el select con todos los lotes
            data.lotes.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote;
                option.textContent = lote;
                if (lote === data.lote) {
                    option.selected = true;  // Seleccionar el lote más reciente
                }
                selectLote.appendChild(option);
            });
        } else {
            console.error('Error al obtener el stock:', data.message);
        }
    })
    .catch(error => console.error('Error en la solicitud del stock:', error));

    fetch(`/kardex/detalle_kardex_table/${idKardex}`)
    .then(response => response.json())
    .then(data => {
        var tableBody = document.getElementById('tablaDetallesKardex');
        tableBody.innerHTML = '';

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(function(item) {
                var row = `<tr>
                    <td class="text-center">${item.fecha}</td>
                    <td class="text-center">${item.lote}</td>
                    <td class="text-center">${item.saldo_inicial}</td>
                    <td class="text-center">${item.ingreso}</td>
                    <td class="text-center">${item.salida}</td>
                    <td class="text-center">${item.saldo_final}</td>
                    <td class="text-center">${item.observaciones}</td>
                </tr>`;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        } else {
            var noDataRow = '<tr><td colspan="7" class="text-center">No hay detalles disponibles para este kardex.</td></tr>';
            tableBody.insertAdjacentHTML('beforeend', noDataRow);
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar detalles',
            text: 'Ocurrió un error al cargar los detalles del kardex. Inténtalo de nuevo más tarde.',
        });
        console.error('Error al cargar los detalles del kardex:', error);
    });
}

function registrarDetalleKardex() {
    var idkardex = document.getElementById('idkardex_hidden').value;
    var fecha = document.getElementById('fecha_kardex').value;
    var saldo_inicial = parseFloat(document.getElementById('saldoInicial').value);
    var ingreso = parseFloat(document.getElementById('ingresoKardex').value);
    var lote = document.getElementById('selectLote').value;
    var salida = parseFloat(document.getElementById('salidaKardex').value);
    var observaciones = document.getElementById('observaciones').value;
    var descripcion_producto = document.getElementById('descripcion_hidden').value;
    var mes = document.getElementById('mesKardex').value; 
    var anio = document.getElementById('anioKardex').value;

    if (!fecha || isNaN(saldo_inicial) || isNaN(salida)) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos obligatorios antes de enviar.',
        });
        return;
    }

    fetch('/kardex/registrar_lote_kardex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idkardex, fecha, ingreso, lote, saldo_inicial, salida, observaciones })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Lote agregado',
                text: 'Se agregó exitosamente este lote al kardex.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {

                // Guardar los valores en sessionStorage antes de recargar la página
                sessionStorage.setItem('idKardex', idkardex);
                sessionStorage.setItem('descripcionProducto', descripcion_producto);
                sessionStorage.setItem('mes', mes);
                sessionStorage.setItem('anio', anio);
                
                // Recargar la página
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
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud',
            text: 'Ocurrió un error al enviar la solicitud.',
        });
        console.error('Error en la solicitud:', error);
    });
}

async function descargarFormatoKardex() {
    var idkardex = document.getElementById('idkardex_hidden').value;
    const endpoint = `/kardex/descargar_formato_kardex/${idkardex}`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error("Error al generar el reporte");
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get("Content-Disposition");
        const fileNameMatch = contentDisposition && contentDisposition.match(/filename="?(.+)"?/);
        const fileName = fileNameMatch ? fileNameMatch[1] : "reporte_kardex.pdf";

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error al generar el reporte:", error);
    }
}

function finalizarKardex(idKardex) {
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
            // Solo se ejecuta el fetch si el usuario confirma la acción
            fetch('/kardex/finalizar_kardex', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idKardex: idKardex
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Se finalizó',
                        text: 'El estado del kardex fue modificado a Finalizado.',
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
                Swal.fire(
                    'Error',
                    'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.',
                    'error'
                );
            });
        }
    });
}


// Filtros
function filterKardexOpenProduct() {
    let input = document.getElementById('filtrarProductoKardex');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('kardexTableOpen');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toLowerCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}

function filterKardexCloseProduct() {
    let input = document.getElementById('filtrarProductoKardexClose');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('tableCloseKardex');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toLowerCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}


function volverListaKardex() {
    // Ocultar la sección de detalles
    document.getElementById('detallesKardex').style.display = 'none';

    // Mostrar la sección de detalles
    document.getElementById('llenarFormularioKardex').style.display = 'none';

    // Mostrar la lista de todos los kardex
    document.getElementById('listaKardex').style.display = 'block';
}

window.onload = function() {
    // Verificar si hay datos en sessionStorage
    var idKardex = sessionStorage.getItem('idKardex');
    var descripcionProducto = sessionStorage.getItem('descripcionProducto');
    var mes = sessionStorage.getItem('mes');
    var anio = sessionStorage.getItem('anio');

    if (idKardex && descripcionProducto && mes && anio) {
        // Llamar a verDetallesKardex con los valores almacenados
        verDetallesKardex(idKardex, descripcionProducto, mes, anio);

        // Limpiar los datos de sessionStorage para evitar que se use de nuevo accidentalmente
        sessionStorage.removeItem('idKardex');
        sessionStorage.removeItem('descripcionProducto');
        sessionStorage.removeItem('mes');
        sessionStorage.removeItem('anio');
    }
};

// Filtrar la tabla de detalle del kardex por la fecha seleccionada
function filterTableDetalleKardex() {
    // Obtener el valor del input de fecha
    let input = document.getElementById('filterFechaDetalleKardex');
    let filter = input.value;  // El valor del input de fecha es en formato yyyy-mm-dd

    let table = document.getElementById('detalleKardexTable');
    let tr = table.getElementsByTagName('tr');

    // Iterar sobre las filas de la tabla (excepto la cabecera)
    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];  // Obtener la primera celda (columna de fecha)

        if (td) {
            // Obtener el valor de la fecha de la celda
            let txtValue = td.textContent || td.innerText;

            // Asegurarse de que ambas fechas estén en formato yyyy-mm-dd antes de compararlas
            let formattedCellDate = formatDate(txtValue);  // Formateamos la fecha de la celda

            if (formattedCellDate === filter || filter === "") {
                // Si coinciden o no hay filtro, mostrar la fila
                tr[i].style.display = "";
            } else {
                // Si no coinciden, ocultar la fila
                tr[i].style.display = "none";
            }
        }
    }
}

// Función para convertir una fecha en formato dd/mm/yyyy o mm/dd/yyyy a yyyy-mm-dd
function formatDate(dateString) {
    // Suponiendo que la fecha de la celda está en formato dd/mm/yyyy
    let parts = dateString.split('/');
    
    // Verificar si la fecha tiene el formato esperado dd/mm/yyyy
    if (parts.length === 3) {
        let day = parts[0];
        let month = parts[1];
        let year = parts[2];

        // Retornar en formato yyyy-mm-dd
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Si el formato no es dd/mm/yyyy, devolver la fecha tal como está
    return dateString;
}


function verDetallesKardexCerrado(idKardex, descripcionProducto, mes, anio) {
    document.getElementById('listaKardex').style.display = 'none';
    document.getElementById('detallesKardex').style.display = 'block';

    document.getElementById('tituloDetallesKardex').innerText = `Detalles del Kardex para ${descripcionProducto} - ${mes}/${anio}`;
    document.getElementById('idkardex_hidden').value = idKardex;
    document.getElementById('descripcion_hidden').value = descripcionProducto;
    document.getElementById('mesKardex').value = mes;
    document.getElementById('anioKardex').value = anio;

    fetch('/kardex/get_stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idkardex: idKardex })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('saldoInicial').value = data.stock;
        } else {
            console.error('Error al obtener el stock:', data.message);
        }
    })
    .catch(error => console.error('Error en la solicitud del stock:', error));

    fetch(`/kardex/detalle_kardex_table/${idKardex}`)
    .then(response => response.json())
    .then(data => {
        var tableBody = document.getElementById('tablaDetallesKardex');
        tableBody.innerHTML = '';

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(function(item) {
                var row = `<tr>
                    <td class="text-center">${item.fecha}</td>
                    <td class="text-center">${item.lote}</td>
                    <td class="text-center">${item.saldo_inicial}</td>
                    <td class="text-center">${item.ingreso}</td>
                    <td class="text-center">${item.salida}</td>
                    <td class="text-center">${item.saldo_final}</td>
                    <td class="text-center">${item.observaciones}</td>
                </tr>`;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        } else {
            var noDataRow = '<tr><td colspan="7" class="text-center">No hay detalles disponibles para este kardex.</td></tr>';
            tableBody.insertAdjacentHTML('beforeend', noDataRow);
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar detalles',
            text: 'Ocurrió un error al cargar los detalles del kardex. Inténtalo de nuevo más tarde.',
        });
        console.error('Error al cargar los detalles del kardex:', error);
    });
}

window.onload = function() {
    // Verificar si hay datos en sessionStorage
    var idKardex = sessionStorage.getItem('idKardex');
    var descripcionProducto = sessionStorage.getItem('descripcionProducto');
    var mes = sessionStorage.getItem('mes');
    var anio = sessionStorage.getItem('anio');

    if (idKardex && descripcionProducto && mes && anio) {
        // Llamar a verDetallesKardex con los valores almacenados
        verDetallesKardex(idKardex, descripcionProducto, mes, anio);

        // Limpiar los datos de sessionStorage para evitar que se use de nuevo accidentalmente
        sessionStorage.removeItem('idKardex');
        sessionStorage.removeItem('descripcionProducto');
        sessionStorage.removeItem('mes');
        sessionStorage.removeItem('anio');
    }
};


async function descargarFormatoKardex() {
    var idkardex = document.getElementById('idkardex_hidden').value;
    const endpoint = `/kardex/descargar_formato_kardex/${idkardex}`;
    fetchDownloadPDF(endpoint, 'kardex');
  }

//Para filtrar kardex activos
function filterKardexOpenProduct() {
    let input = document.getElementById('filtrarProductoKardex');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('kardexTableOpen');
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
function filterKardexCloseProduct() {
    let input = document.getElementById('filtrarProductoKardexClose');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('tableCloseKardex');
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


// Función para agregar todos los productos al kardex
function agregarTodosPorductosKardex() {
    Swal.fire({
        title: '¿Estás seguro de agregar todos los productos?',
        text: "Se agregarán todos los productos que tengas agregados en tu inventario al kardex",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, agregar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/kardex/agregar_todos_productos_kardex', {
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
                        title: '¡Proceso completado!',
                        text: data.message,
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Crear tarjeta informativa para productos registrados correctamente
                    if (data.productos_nuevos && data.productos_nuevos.length > 0) {
                        let productosListRegister = data.productos_nuevos.map(p => `<li>${p}</li>`).join("");
                        let infoCard = `
                            <div class="alert alert-success alert-dismissible fade show" role="alert">
                                <strong>Éxito:</strong> Los siguientes productos fueron registrados correctamente:
                                <ul>${productosListRegister}</ul>
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>`;
                        
                        document.getElementById('messagesContainer').innerHTML = infoCard;
                    }

                    // Crear tarjeta informativa para productos ya existentes
                    if (data.productos_registrados && data.productos_registrados.length > 0) {
                        let productosList = data.productos_registrados.map(p => `<li>${p}</li>`).join("");
                        let infoCard = `
                            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                                <strong>Advertencia:</strong> Los siguientes productos ya tienen un kardex creado para este mes:
                                <ul>${productosList}</ul>
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>`;
                        
                        document.getElementById('messagesExito').innerHTML = infoCard;
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.'
                });
            });
        }
    });
}

function finalizarTodosPorductosKardex(){
    Swal.fire({
        title: '¿Estás seguro de finalizar todos los productos?',
        text: "Todos los productos con estado 'CREADO' serán cerrados. Procede solo si estas seguro de esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, finalizar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if(result.isConfirmed){
            fetch('/kardex/finalizar_todos_productos_kardex', {
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
                        title: '¡Proceso completado!',
                        text: data.message,
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al procesar la solicitud. Por favor, inténtelo nuevamente.'
                });
            });
        }
    })
};