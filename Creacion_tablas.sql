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

-- Tabla para el detalle de lavado de manos
CREATE TABLE IF NOT EXISTS public.Detalle_lavados_manos (
	idMano SERIAL PRIMARY KEY,
	Fecha DATE NOT NULL,
	Hora TIME NOT NULL,
	medida_correctiva VARCHAR(60),
	fk_idTrabajador INT REFERENCES public.Trabajadores(idTrabajador) NOT NULL,
	fk_idLavadoMano INT REFERENCES public.LavadosManos(idLavadoMano) NOT NULL
);

-- Tabla para el formato de control general del personal
CREATE TABLE IF NOT EXISTS public.controles_generales_personal (
	idControlGeneral SERIAL PRIMARY KEY,
	Carnet_salud BYTEA NOT NULL,
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
	descripcion_producto VARCHAR(70) NOT NULL
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
	observaciones VARCHAR(80) NOT NULL,
	fk_idkardex INT REFERENCES public.kardex(idkardex)
);


