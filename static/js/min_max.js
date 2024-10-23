// Filtros
function filterOpenProduct() {
    let input = document.getElementById('filtrarProducto');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('TableOpen');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toLowerCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}

function guardarCambios() {
    // Obtener la tabla
    let table = document.getElementById('TableOpen');
    let rows = table.getElementsByTagName('tr');

    // Crear un array para almacenar los cambios
    let cambios = [];

    // Recorrer las filas de la tabla, comenzando en la segunda fila (índice 1)
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let id = row.getAttribute('data-id');  // Obtener el id_min_max de la fila
        let minimo = row.querySelector('input[name="minimo_und"]').value;  // Obtener valor de mínimo
        let maximo = row.querySelector('input[name="maximo_und"]').value;  // Obtener valor de máximo
        let conversion = row.querySelector('input[name="conversion_und"]').value;

        // Añadir los cambios al array
        cambios.push({
            id_min_max: id,
            minimo_und: minimo,
            maximo_und: maximo,
            conversion_und: conversion
        });
    }

    // Enviar los cambios al backend
    fetch('/min_max/guardar_cambios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cambios)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: '¡Producto actualizado!',
                text: 'La mínimo o máximo del Producto se actualizó correctamente.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                location.reload();  // Recargar la página para mostrar los cambios
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Hubo un error al actualizar el Producto. Por favor, inténtelo nuevamente.',
            });
        }
    })
    .catch(error => {
        console.error('Error al guardar los cambios:', error);
    });
}
