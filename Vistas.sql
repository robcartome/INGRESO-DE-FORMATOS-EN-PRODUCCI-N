-- Creación de vistas para el ingreso de formatos en producción

CREATE OR REPLACE VIEW v_lavados_manos AS
SELECT
    dlv.idmano,
    dlv.hora,
    dlv.fecha,
    CONCAT(
        SUBSTRING(t.nombres FROM 1 FOR POSITION(' ' IN t.nombres) - 1), 
        ' ', 
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
	

SELECT * FROM v_lavados_manos
	
SELECT 
    idformatos,
    TO_CHAR(TO_DATE(mes || ' ' || anio, 'MM YYYY'), 'TMMonth') AS mes,
    anio,
    fk_idtipoformato,
    estado
FROM 
    formatos 
WHERE 
    fk_idtipoformato = 2 
    AND estado = 'CERRADO';

SELECT 
	idformatos,
	TO_CHAR(TO_DATE(mes || ' ' || anio, 'MM YYYY'), 'TMMonth') AS mes,
	anio,
	fk_idtipoformato,
	estado
FROM 
	formatos 
WHERE 
	idformatos = 2

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

SELECT * FROM public.detalle_lavados_manos

SELECT * FROM public.controles_generales_personal

SELECT * FROM public.tiposformatos

SELECT * FROM public.controles_generales_personal

SELECT * FROM trabajadores

SELECT * FROM kardex;

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

SELECT * FROM v_kardex WHERE estado = 'CREADO'
SELECT * FROM public.detalles_kardex

