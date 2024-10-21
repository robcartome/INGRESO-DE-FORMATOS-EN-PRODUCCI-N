document.addEventListener('DOMContentLoaded', function () {

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
});


// Filtros
function filterOpenProduct() {
    let input = document.getElementById('filtrarProducto');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('TableOpen');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[1];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toLowerCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}