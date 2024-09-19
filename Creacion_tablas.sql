-- Definición de las tablas

-- << Trabajadores >> --
-- Tabla para los sexos
CREATE TABLE IF NOT EXISTS public.Sexos(
	idSexo SERIAL PRIMARY KEY,
	Detalle_sexo VARCHAR(12) NOT NULL
);

-- Tabla para los trabajadores de producción
CREATE TABLE IF NOT EXISTS public.Trabajadores (
    idTrabajador SERIAL PRIMARY KEY,
    DNI VARCHAR(8) NOT NULL,
    Nombres VARCHAR(50) NOT NULL,
	Apellidos VARCHAR(50) NOT NULL,
	Fecha_nacimiento DATE NOT NULL,
	Direccion VARCHAR(50) NOT NULL,
	Celular VARCHAR(9) NOT NULL,
	Celular_emergencia VARCHAR(9),
	Fecha_ingreso DATE NOT NULL,
	Area VARCHAR(22) NOT NULL,
	Cargo VARCHAR(45) NOT NULL,
	fk_idSexo INT REFERENCES public.Sexos(idSexo) NOT NULL
);

-- << Formatos >> --
-- Tabla para los tipos de formatos que existen con su detalle
CREATE TABLE IF NOT EXISTS public.TiposFormatos (
	idTipoFormato SERIAL PRIMARY KEY,
	NombreFormato VARCHAR(80) NOT NULL,
	Frecuencia VARCHAR(45),
	Codigo VARCHAR(45)
);

-- Tabla para el formato de lavado de manos
CREATE TABLE IF NOT EXISTS public.LavadosManos (
	idLavadoMano SERIAL PRIMARY KEY,
	Mes VARCHAR(10) NOT NULL,
	anio VARCHAR(4) NOT NULL,
	estado VARCHAR(45) NOT NULL,
	fk_idTipoFormatos INT REFERENCES public.TiposFormatos(idTipoFormato) NOT NULL
);

-- Creación de la tabla para las medidas correctivas asignadas al observador
CREATE TABLE IF NOT EXISTS public.MedidasCorrectivasObservaciones (
	idMedidaCorrectivaOb SERIAL PRIMARY KEY,
	DetalleDeMedidaCorrectiva VARCHAR(100),
	Fecha DATE,
	fk_idLavadoMano INT REFERENCES public.LavadosManos(idLavadoMano) NOT NULL
);

-- Tabla para el detalle de lavado de manos
CREATE TABLE IF NOT EXISTS public.Detalle_lavados_manos (
	idMano SERIAL PRIMARY KEY,
	Fecha DATE NOT NULL,
	Hora TIME NOT NULL,
	medida_correctiva VARCHAR(60),
	fk_idTrabajador INT REFERENCES public.Trabajadores(idTrabajador) NOT NULL,
	fk_idLavadoMano INT REFERENCES public.LavadosManos(idLavadoMano) NOT NULL
);

-- Tabla para el formato carnet de salud
CREATE TABLE IF NOT EXISTS public.CarnetSalud (
	idCarnetSalud SERIAL PRIMARY KEY,
	Carnet_salud BYTEA NOT NULL,
	Fecha_Vencimiento DATE NOT NULL
);

-- Tabla para el formato de control general del personal
CREATE TABLE IF NOT EXISTS public.controles_generales_personal (
	idControlGeneral SERIAL PRIMARY KEY, 
	fk_idCarnetSalud INT REFERENCES public.CarnetSalud(idCarnetSalud) NOT NULL,
	fk_idTrabajador INT REFERENCES public.Trabajadores(idTrabajador) NOT NULL,
	fk_idTipoFormatos INT REFERENCES public.TiposFormatos(idTipoFormato) NOT NULL
);

-- << Proveedores >> --
-- Tabla para los representantes legales
CREATE TABLE IF NOT EXISTS public.Representantes_legales (
	idRepresentanteLegal SERIAL PRIMARY KEY,
	DNI VARCHAR(8) NOT NULL,
	RUC VARCHAR(11) NOT NULL,
	Nombres VARCHAR(45) NOT NULL,
	Apellidos VARCHAR(45) NOT NULL,
	Cargo VARCHAR(45) NOT NULL
);

-- Tabla de domicilios legales del proveedor
CREATE TABLE IF NOT EXISTS public.Domicilios_legales (
	idDomicilioLegal SERIAL PRIMARY KEY,
	Departamento VARCHAR(45) NOT NULL,
	Distrito VARCHAR(45) NOT NULL,
	Provincia VARCHAR(45) NOT NULL,
	Celular VARCHAR(9) NOT NULL,
	Calle_pas_av VARCHAR(45) NOT NULL,
	Numero_calle VARCHAR(45) NOT NULL,
	RUC VARCHAR(11) NOT NULL,
	Correo_electronico VARCHAR(45) NOT NULL
);

--Tabla general de proveedores
CREATE TABLE IF NOT EXISTS public.Proveedores (
	idProveedor SERIAL PRIMARY KEY,
	nom_empresa VARCHAR(45) NOT NULL,
	fk_idRepresentanteLegal INT REFERENCES public.Representantes_legales(idRepresentanteLegal) NOT NULL,
	fk_idDomicilioLegal INT REFERENCES public.Domicilios_legales(idDomicilioLegal) NOT NULL
);

-- Crear la tabla para registrar productos
CREATE TABLE IF NOT EXISTS public.productos (
	idproducto SERIAL PRIMARY KEY,
	descripcion_producto VARCHAR(70) NOT NULL,
	Stock INT NOT NULL
);

--Tabla para generar el formato de kardex
CREATE TABLE IF NOT EXISTS public.kardex (
	idkardex SERIAL PRIMARY KEY,
	Mes VARCHAR(10) NOT NULL,
	anio VARCHAR(4) NOT NULL,
	Estado VARCHAR(10) NOT NULL,
	fk_idproducto INT REFERENCES public.productos(idproducto) NOT NULL,
	fk_idTipoFormatos INT REFERENCES public.TiposFormatos(idTipoFormato) NOT NULL
);

-- Tabla de detalles del kardex

CREATE TABLE IF NOT EXISTS public.detalles_kardex (
	iddetallekardex SERIAL PRIMARY KEY,
	fecha DATE NOT NULL,
	lote VARCHAR(15) NOT NULL,
	saldo_inicial INT NOT NULL,
	ingreso INT NOT NULL,
	salida INT NOT NULL,
	saldo_final INT NOT NULL,
	observaciones VARCHAR(80),
	fk_idkardex INT REFERENCES public.kardex(idkardex)
);


-- << Condiciones Ambientales >> --

-- Creación de las áreas para las condiciones ambientales

CREATE TABLE IF NOT EXISTS public.areas (
	idarea SERIAL PRIMARY KEY,
	detalle_area VARCHAR(45) NOT NULL
);

-- Creación de la tabla de condición ambiental

CREATE TABLE IF NOT EXISTS public.condiciones_ambientales (
	idcondicionambiental SERIAL PRIMARY KEY,
	mes VARCHAR(11) NOT NULL,
	anio VARCHAR(4) NOT NULL,
	estado VARCHAR(10) NOT NULL,
	fk_idTipoFormatos INT REFERENCES public.TiposFormatos(idTipoFormato) NOT NULL,
	fk_idArea INT REFERENCES public.areas(idarea) NOT NULL
);

-- Creación de la tabla para las acciones correctivas

CREATE TABLE IF NOT EXISTS public.acciones_correctivas (
	idAccion_correctiva SERIAL PRIMARY KEY,
	detalle_Accion_correctiva VARCHAR(60) NOT NULL,
	estado VARCHAR(30) NOT NULL
);

-- Creación de la tabla del detalle de condiciones ambientales

CREATE TABLE IF NOT EXISTS public.detalle_condiciones_ambientales(
	idDetalle_ca SERIAL PRIMARY KEY,
	fecha DATE NOT NULL,
	Hora TIME NOT NULL,
	observaciones VARCHAR(50) NULL,
	temperatura VARCHAR(10) NOT NULL,
	humedad VARCHAR(10) NOT NULL,
	fk_idAccion_correctiva INT REFERENCES public.acciones_correctivas(idAccion_correctiva) NULL,
	fk_idCondicion_ambiental INT REFERENCES public.condiciones_ambientales(idcondicionambiental) NULL
);

-- CREACIÓN DE LA TABLA DE VERIFICACIÓN PREVIA

CREATE TABLE IF NOT EXISTS public.Verificacion_previa(
	idVerificacion_Previa SERIAL PRIMARY KEY,
	detalle_verificacion_previa VARCHAR(50) NOT NULL
);

-- RELACIÓN DE MUCHOS A MUCHOS ENTRE LA VERIFICACIÓN PREVIA Y EL DETALLE DE LA CONDICÓN AMBIENTAL

CREATE TABLE IF NOT EXISTS public.asignacion_verificacion_previa_condicion_ambiental (
	idAsignacion_verificacion_previa SERIAL PRIMARY KEY,
	fk_idDetalle_condicion_ambiental INT REFERENCES public.detalle_condiciones_ambientales(iddetalle_ca),
	fk_idVerificacion_previa INT REFERENCES public.Verificacion_previa(idVerificacion_Previa)
);


-- << REGISTRO Y CONTROL DE ENVASADOS >>

CREATE TABLE IF NOT EXISTS public.Registros_Controles_Envasados (
	id_Registro_Control_Envasados SERIAL PRIMARY KEY,
	fecha DATE NULL,
	estado VARCHAR(20) NULL,
	fk_idTipoFormato INT REFERENCES public.TiposFormatos(idTipoFormato) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.Detalles_Registros_Controles_Envasados (
	id_detalle_registro_controles_envasados SERIAL PRIMARY KEY,
	fk_idTrabajador INT REFERENCES public.trabajadores(idtrabajador) NOT NULL,
	fk_idproducto INT REFERENCES public.productos(idproducto) NOT NULL,
	cantidad_producida INT NOT NULL,
	fk_idProveedor INT REFERENCES public.proveedores(idproveedor) NOT NULL,
	Lote_proveedor VARCHAR(15) NOT NULL,
	Lote_asignado VARCHAR(15) NOT NULL,
	fecha_vencimiento DATE NOT NULL,
	Observacion VARCHAR(60) NULL, 
	fk_id_registro_control_envasado INT REFERENCES public.Registros_Controles_Envasados(id_Registro_Control_Envasados)
);

-- << CONTROL DE HIGIENE PERSONAL >> --

CREATE TABLE IF NOT EXISTS public.Controles_higiene_personal (
	id_control_higiene_personal SERIAL PRIMARY KEY,
	mes VARCHAR(11) NOT NULL,
	anio VARCHAR(4) NOT NULL,
	estado VARCHAR(30) NULL,
	fk_idTipoFormato INT REFERENCES public.TiposFormatos(idTipoFormato) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.Detalles_controles_higiene_personal (
	id_detalle_control_higiene_personal SERIAL PRIMARY KEY,
	fecha DATE NOT NULL,
	fk_idtrabajador INT REFERENCES public.trabajadores(idtrabajador) NOT NULL,
	observaciones VARCHAR(60) NULL,
	fk_idaccion_correctiva INT REFERENCES public.acciones_correctivas(idaccion_correctiva) NULL,
	fk_idControl_higiene_personal INT REFERENCES public.Controles_higiene_personal(id_control_higiene_personal) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.asignacion_verificacion_previa_higiene_personal (
	id_asignacion_verificacion_previa_higiene_personal SERIAL PRIMARY KEY,
	fk_idVerificacion_previa INT REFERENCES public.verificacion_previa(idverificacion_previa) NOT NULL,
	fk_idDetalle_control_higiene_personal INT REFERENCES public.Detalles_controles_higiene_personal(id_detalle_control_higiene_personal) NOT NULL
);
