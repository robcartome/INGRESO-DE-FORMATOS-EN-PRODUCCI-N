-- Creación de vistas para el ingreso de formatos en producción

CREATE OR REPLACE VIEW v_lavados_manos AS
SELECT
    lv.idmano,
    lv.hora,
    lv.fecha,
    CONCAT(t.nombres, ' ', SUBSTRING(t.apellidos FROM 1 FOR 1), '.') AS nombre_formateado,
    f.idformatos
FROM 
    lavadosmanos lv
JOIN 
    trabajadores t ON t.idtrabajador = lv.fk_idtrabajador
JOIN
    formatos f ON f.idformatos = lv.fk_idformatos
ORDER BY 
    lv.fecha DESC;

SELECT * FROM v_lavados_manos
