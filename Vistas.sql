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

DROP VIEW v_detalle_higiene_personal
	
SELECT * FROM v_detalle_higiene_personal

SELECT * FROM public.asignacion_verificacion_previa_higiene_personal

SELECT * FROM public.controles_higiene_personal

SELECT * FROM v_historial_higiene_personal