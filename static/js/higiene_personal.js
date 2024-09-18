function generarFormatoControlHigienePersonal() {
    $.post('/higiene_personal/generar_formato_higiene', function(response) {
        if (response.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Registro generado',
                text: 'Se genero un registro para el control de aseo e higiene del personal.',
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
    });
}

function registrarDetalleHigienePersonal() {

    var fecha = document.getElementById('fecha_higiene_personal').value;
    var trabajador = document.getElementById('selectTrabajador').value;

    var correctaPresentacion = document.getElementById('correctaPresentacion').checked;
    var limpiezaManos = document.getElementById('limpiezaManos').checked;
    var habitosHigiene = document.getElementById('habitosHigiene').checked;

    var observaciones = document.getElementById('observaciones').value;
    var accionesCorrectivas = document.getElementById('accionesCorrectivas').value;

    $.post('/higiene_personal/registrar_higiene_personal', {
        fecha: fecha, 
        trabajador: trabajador,

        correctaPresentacion: correctaPresentacion ? 'true' : 'false',
        limpiezaManos: limpiezaManos ? 'true' : 'false',
        habitosHigiene: habitosHigiene ? 'true' : 'false',

        observaciones: observaciones,
        accionesCorrectivas: accionesCorrectivas
    }, function(response) {
        if (response.status === 'success') {
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
                text: response.message,
            });
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud',
            text: 'Ocurrió un error al enviar la solicitud: ' + textStatus,
        });
    });
}