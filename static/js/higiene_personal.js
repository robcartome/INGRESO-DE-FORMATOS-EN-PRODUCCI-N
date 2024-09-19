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
