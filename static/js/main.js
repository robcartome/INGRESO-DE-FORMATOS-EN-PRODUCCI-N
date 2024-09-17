async function fetchDownloadPDF(endpoint, nameDefault = "") {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error("Error al generar el reporte");
    }

    // Obtener el archivo blob de la respuesta
    const blob = await response.blob();
    // Obtener el nombre del archivo desde los headers
    const contentDisposition = response.headers.get("Content-Disposition");
    // Extraer el nombre del archivo si está presente en los headers
    const fileNameMatch =
      contentDisposition && contentDisposition.match(/filename="?(.+)"?/);
    const fileName = fileNameMatch
      ? fileNameMatch[1]
      : `reporte_${nameDefault}.pdf`;

    // Crear una URL para el blob y preparar la descarga
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url); // Revocar la URL creada
  } catch (error) {
    console.error("Error generating report:", error);
  }
}
