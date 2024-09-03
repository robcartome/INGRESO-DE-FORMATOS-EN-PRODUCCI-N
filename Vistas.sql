-- Creación de vistas para el ingreso de formatos en producción

CREATE OR REPLACE VIEW v_lavados_manos AS
SELECT
    lv.idmano,
    lv.hora,
    lv.fecha,
    CONCAT(
        SUBSTRING(t.nombres FROM 1 FOR POSITION(' ' IN t.nombres) - 1), 
        ' ', 
        SUBSTRING(t.apellidos FROM 1 FOR 1), 
        '.'
    ) AS nombre_formateado,
    f.idformatos,
	f.fk_idtipoformato,
	f.estado
FROM 
    lavadosmanos lv
JOIN 
    trabajadores t ON t.idtrabajador = lv.fk_idtrabajador
JOIN
    formatos f ON f.idformatos = lv.fk_idformatos
ORDER BY 
    lv.fecha DESC;

SELECT * FROM v_lavados_manos
SELECT estado FROM formatos WHERE fk_idtipoformato = 2 AND estado = 'CERRADO'
SELECT * FROM v_lavados_manos WHERE estado = 'CERRADO' ORDER BY idmano DESC
	
SELECT idtrabajador, CONCAT(nombres, ' ', apellidos) AS nombres FROM trabajadores

SELECT * FROM public.formatos

SELECT estado FROM formatos WHERE fk_idtipoformato = 2 AND estado = 'CREADO'
	
SELECT * FROM public.tiposformatos

SELECT * FROM public.formatos

SELECT idtipoformato FROM tiposformatos WHERE nombreformato = 'REPORTE DE LAVADO DE MANOS'

SELECT * FROM formatos WHERE fk_idtipoformato = 2 AND estado = 'CREADO'

SELECT * FROM public.lavadosmanos

INSERT INTO lavadosmanos (fecha, hora, fk_idtrabajador, fk_idformatos) 
                    VALUES ('2024-08-29', '15:39', 5, 2);

SELECT * FROM public.formatos

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
    f.fk_idtipoformato,
    f.estado,
	f.idformatos
FROM
    formatos f
WHERE 
	f.fk_idtipoformato = 2 AND estado = 'CERRADO'
ORDER BY
	f.idformatos DESC;

DROP VIEW v_historial_lavado_manos

SELECT * FROM v_lavados_manos WHERE idformatos=11

SELECT * FROM v_historial_lavado_manos

SELECT * FROM lavadosmanos WHERE fk_idtrabajador = 5

SELECT * FROM trabajadores
