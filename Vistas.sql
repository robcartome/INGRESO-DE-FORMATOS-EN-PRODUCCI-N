-- Creación de vistas para el ingreso de formatos en producción

CREATE OR REPLACE VIEW v_lavados_manos AS
SELECT
    dlv.idmano,
    dlv.hora,
    dlv.fecha,
    CONCAT(
        -- Usamos COALESCE para evitar un valor NULL si no se encuentra el espacio
        COALESCE(
            -- Si se encuentra un espacio, tomamos la subcadena
            SUBSTRING(t.nombres FROM 1 FOR NULLIF(POSITION(' ' IN t.nombres) - 1, -1)),
            -- Si no se encuentra, tomamos todo el nombre
            t.nombres
        ), 
        ' ', 
        -- Toma la inicial del apellido
        SUBSTRING(t.apellidos FROM 1 FOR 1), 
        '.'
    ) AS nombre_formateado,
    lv.idlavadomano,
    lv.fk_idtipoformatos,
    lv.estado
FROM 
    detalle_lavados_manos dlv
JOIN 
    trabajadores t ON t.idtrabajador = dlv.fk_idtrabajador
JOIN
    lavadosmanos lv ON lv.idlavadomano = dlv.fk_idlavadomano
ORDER BY 
    dlv.fecha DESC;


CREATE OR REPLACE VIEW v_historial_lavado_manos AS
SELECT
    TO_CHAR(TO_DATE(f.mes || ' ' || f.anio, 'MM YYYY'), 'TMMonth') AS mes,
    f.anio,
    f.fk_idtipoformatos,
    f.estado,
	f.idlavadomano
FROM
    lavadosmanos f
WHERE 
	f.fk_idtipoformatos = 2 AND estado = 'CERRADO'
ORDER BY
	f.idlavadomano DESC;

CREATE OR REPLACE VIEW v_kardex AS
SELECT
	kr.idkardex,
	TO_CHAR(TO_DATE(kr.mes || ' ' || kr.anio, 'MM YYYY'), 'TMMonth') AS mes,
	kr.anio,
	kr.estado,
	pr.descripcion_producto
FROM
	kardex kr
JOIN
	productos pr ON pr.idproducto = kr.fk_idproducto
ORDER BY
	kr.idkardex
DESC;


SELECT 
	c.idcontrolgeneral,t.idtrabajador, t.dni, t.nombres, t.apellidos, 
	t.fecha_nacimiento, t.direccion, t.celular, 
	t.celular_emergencia, t.fecha_ingreso, 
	t.area, t.cargo, t.fk_idsexo, cn.carnet_salud
FROM 
	trabajadores t 
JOIN 
	controles_generales_personal c ON t.idtrabajador = c.fk_idtrabajador
JOIN
	carnetsalud cn ON c.fk_idcarnetsalud = cn.idcarnetsalud;

CREATE OR REPLACE VIEW v_control_general_personal AS
SELECT
	c.idcontrolgeneral, cs.idcarnetsalud, cs.carnet_salud, t.idtrabajador, t.dni, t.nombres, t.apellidos, t.fecha_nacimiento, 
	t.direccion, t.celular, t.celular_emergencia, t.fecha_ingreso, t.area, t.cargo, t.fk_idsexo
FROM
	controles_generales_personal c
JOIN
	carnetsalud cs ON cs.idcarnetsalud = c.fk_idcarnetsalud
JOIN
	trabajadores t ON t.idtrabajador = c.fk_idtrabajador;

-- CONTROL DE CONDICIONES AMBIENTALES

CREATE OR REPLACE VIEW v_condiciones_ambientales AS
SELECT
	ca.idcondicionambiental, TO_CHAR(TO_DATE(ca.mes || ' ' || ca.anio, 'MM YYYY'), 'TMMonth') AS mes, ca.anio, ca.estado, a.idarea, a.detalle_area
FROM
	condiciones_ambientales ca
JOIN
	areas a ON a.idarea = ca.fk_idarea;


CREATE OR REPLACE VIEW v_detalle_control_CA AS
SELECT
    d.iddetalle_ca,
    d.fecha,
    d.hora,
    d.temperatura,
    d.humedad,
    d.observaciones,
    COALESCE(ac.detalle_accion_correctiva, '-') AS detalle_accion_correctiva,
	ac.idaccion_correctiva,
	ac.estado,
    ca.idcondicionambiental
FROM
    detalle_condiciones_ambientales d
LEFT JOIN
    acciones_correctivas ac ON ac.idaccion_correctiva = d.fk_idaccion_correctiva
JOIN
    condiciones_ambientales ca ON ca.idcondicionambiental = d.fk_idcondicion_ambiental;

-- REGISTRO Y CONTROL DE ENVASADOS

CREATE OR REPLACE VIEW v_historial_registros_controles_envasados AS
SELECT
    TO_CHAR(f.fecha, 'DD/MM/YYYY') AS fecha,
    f.estado,
    f.id_registro_control_envasados
FROM
    registros_controles_envasados f
WHERE 
    f.fk_idtipoformatos = 5 AND f.estado = 'CERRADO'
ORDER BY
    f.id_registro_control_envasados DESC;

SELECT * FROM v_historial_registros_controles_envasados

CREATE OR REPLACE VIEW v_registros_controles_envasados AS
SELECT
	ce.id_detalle_registro_controles_envasados,
	t.nombres || ' ' || t.apellidos AS responsable,
	p.descripcion_producto,
	ce.cantidad_producida,
	pr.nom_empresa,
	ce.lote_proveedor,
	ce.lote_asignado,
	TO_CHAR(ce.fecha_vencimiento, 'DD/MM/YYYY') AS fecha_vencimiento,
	ce.observacion,
	rce.estado,
	rce.id_registro_control_envasados
FROM
	detalles_registros_controles_envasados ce
JOIN
	trabajadores t ON t.idtrabajador = ce.fk_idtrabajador
JOIN
	productos p ON p.idproducto = ce.fk_idproducto
JOIN
	proveedores pr ON pr.idproveedor = ce.fk_idproveedor
JOIN
	registros_controles_envasados rce ON rce.id_registro_control_envasados = ce.fk_id_registro_control_envasado
ORDER BY
	ce.id_detalle_registro_controles_envasados DESC;


-- CONTROL DE ASEO E HIGIENE PERSONAL --

CREATE OR REPLACE VIEW v_historial_higiene_personal AS
SELECT
    TO_CHAR(TO_DATE(f.mes || ' ' || f.anio, 'MM YYYY'), 'TMMonth') AS mes,
    f.anio,
    f.fk_idtipoformatos,
    f.estado,
	f.id_control_higiene_personal
FROM
    controles_higiene_personal f
WHERE
	f.fk_idtipoformatos = 6 AND estado = 'CERRADO'
ORDER BY
	f.id_control_higiene_personal DESC;

DROP VIEW v_historial_higiene_personal

SELECT * FROM public.asignacion_verificacion_previa_higiene_personal

CREATE OR REPLACE VIEW v_detalle_higiene_personal AS
SELECT
    d.id_detalle_control_higiene_personal,
    d.fecha,
    t.nombres || t.apellidos AS trabajador,
    d.observaciones,
	ac.idaccion_correctiva,
    COALESCE(ac.detalle_accion_correctiva, '-') AS detalle_accion_correctiva,
	ac.estado AS estado_medida_correctiva,
    d.fk_idcontrol_higiene_personal,
	hp.estado
FROM
    detalles_controles_higiene_personal d
LEFT JOIN
    acciones_correctivas ac ON ac.idaccion_correctiva = d.fk_idaccion_correctiva
JOIN	
	trabajadores t ON t.idtrabajador = d.fk_idtrabajador
JOIN
    controles_higiene_personal hp ON hp.id_control_higiene_personal = d.fk_idcontrol_higiene_personal;

-- << PARA LIMPIEZA Y DESINFECCIÓN DE LAS ÁREAS >> --

CREATE OR REPLACE VIEW v_verificacion_limpieza_desinfeccion_areas AS
SELECT
	la.id_verificacion_limpieza_desinfeccion_area,
	a.detalle_area_produccion,
	a.id_area_produccion,
	TO_CHAR(TO_DATE(la.mes || ' ' || la.anio, 'MM YYYY'), 'TMMonth') AS mes,
	la.anio,
	la.estado
FROM
	verificacion_limpieza_desinfeccion_areas la
JOIN
	areas_produccion a ON a.id_area_produccion = la.fk_idarea_produccion;

SELECT * FROM v_verificacion_limpieza_desinfeccion_areas

CREATE OR REPLACE VIEW v_detalles_verificacion_limpieza_desinfeccion_areas AS
SELECT
	d.id_detalle_verificacion_limpieza_desinfeccion_area,
	TO_CHAR(d.fecha, 'DD/MM/YYYY') AS fecha,
	v.id_verificacion_limpieza_desinfeccion_area,
	c.id_categorias_limpieza_desinfeccion,
	c.detalles_categorias_limpieza_desinfeccion,
	c.frecuencia
FROM
	detalles_verificacion_limpieza_desinfeccion_areas d
JOIN
	verificacion_limpieza_desinfeccion_areas v ON v.id_verificacion_limpieza_desinfeccion_area = d.fk_id_verificacion_limpieza_desinfeccion_area
JOIN
	categorias_limpieza_desinfeccion c ON c.id_categorias_limpieza_desinfeccion = d.fk_id_categorias_limpieza_desinfeccion;

SELECT * FROM v_detalles_verificacion_limpieza_desinfeccion_areas
-- Creación de vista para mostrar las asignaciones de medidas correctivas para la limpieza de las áreas

CREATE OR REPLACE VIEW v_asingaciones_observaciones_acCorrec_limpieza_areas AS
SELECT DISTINCT ON (o.idmedidacorrectivaob)
    o.idmedidacorrectivaob,
    o.detalledemedidacorrectiva,
    TO_CHAR(o.fecha, 'DD/MM/YYYY') AS fecha,
    ac.idaccion_correctiva,
    ac.detalle_accion_correctiva,
    ac.estado
FROM
    asignaciones_medidas_correctivas_limpieza_areas ala
JOIN
    medidascorrectivasobservaciones o ON o.idmedidacorrectivaob = ala.fk_idmedidacorrectivaob
JOIN
    acciones_correctivas ac ON ac.idaccion_correctiva = o.fk_id_accion_correctiva
WHERE
    EXTRACT(MONTH FROM o.fecha) = EXTRACT(MONTH FROM CURRENT_DATE) AND
    EXTRACT(YEAR FROM o.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY
    o.idmedidacorrectivaob, o.fecha DESC;


SELECT 
	mes, anio, 
	json_agg(json_build_object('id_verificacion_limpieza_desinfeccion_area', id_verificacion_limpieza_desinfeccion_area, 
							   'detalle_area_produccion', detalle_area_produccion,
							   'estado', estado,
							   'id_area_produccion', id_area_produccion)) AS registros
FROM v_verificacion_limpieza_desinfeccion_areas 
WHERE estado = 'CERRADO' 
GROUP BY mes, anio
ORDER BY anio DESC, mes DESC


-- LIMPIEZA Y EQUIPOS DE MEDICIÓN

CREATE OR REPLACE VIEW v_verificaciones_equipos_medicion AS
SELECT
	em.id_verificacion_equipo_medicion,
	TO_CHAR(TO_DATE(em.mes || ' ' || em.anio, 'MM YYYY'), 'TMMonth') AS mes,
	em.anio,
	em.estado,
	em.fk_id_tipo_formato
FROM
	verificaciones_equipos_medicion em;  

SELECT * FROM detalles_verificaciones_equipos_medicion

CREATE OR REPLACE VIEW v_detalles_verificaciones_equipos_medicion AS
SELECT
    d.id_detalle_verificacion_equipos_medicion,
    TO_CHAR(d.fecha, 'DD/MM/YYYY') AS fecha,
    d.estado_verificacion,
    c.id_categorias_limpieza_desinfeccion,
    c.detalles_categorias_limpieza_desinfeccion,
    c.frecuencia,
    v.id_verificacion_equipo_medicion,
    v.mes,
    v.anio,
    v.estado,
    v.fk_id_tipo_formato
FROM
    detalles_verificaciones_equipos_medicion d
JOIN
    categorias_limpieza_desinfeccion c ON c.id_categorias_limpieza_desinfeccion = d.fk_id_categorias_limpieza_desinfeccion
JOIN
    verificaciones_equipos_medicion v ON v.id_verificacion_equipo_medicion = d.fk_id_verificacion_equipo_medicion;

select * from v_detalles_verificaciones_equipos_medicion

CREATE OR REPLACE VIEW v_observaciones_acc_correctivas AS
SELECT
	ob.idmedidacorrectivaob,
	ob.detalledemedidacorrectiva,
	ob.fecha,
	ob.fk_id_verificacion_equipo_medicion,
	ac.idaccion_correctiva,
	ac.detalle_accion_correctiva,
	ac.estado
FROM
	public.medidascorrectivasobservaciones ob
JOIN
	public.acciones_correctivas ac ON ac.idaccion_correctiva = ob.fk_id_accion_correctiva;

SELECT * FROM v_observaciones_acc_correctivas

SELECT * FROM v_detalles_verificaciones_equipos_medicion
	
SELECT id_detalle_verificacion_equipos_medicion, fecha, id_verificacion_equipo_medicion, estado_verificacion
            FROM v_detalles_verificaciones_equipos_medicion

SELECT * FROM v_verificaciones_equipos_medicion WHERE estado = 'CERRADO' ORDER BY id_verificacion_equipo_medicion DESC