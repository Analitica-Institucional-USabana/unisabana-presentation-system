// Estructura de reporte por diapositiva, modelada literalmente sobre el
// `SlideValidation` ya definido en claude-design-system/readme.md §14
// (status: error|warning|pass; política de export: error bloquea,
// warning permite preview pero bloquea el handoff final, pass permite
// exportar como borrador — nunca como aprobación institucional definitiva).

export function createSlideReport(slideId) {
  const messages = [];
  let status = "pass";

  function add(severity, message) {
    messages.push({ severity, message });
    if (severity === "error") status = "error";
    else if (severity === "warning" && status !== "error") status = "warning";
  }

  return {
    slideId,
    add,
    finalize: () => ({ slideId, status, messages: [...messages] }),
  };
}

export function mergeSlideReports(a, b) {
  const messages = [...a.messages, ...b.messages];
  const status = messages.some((m) => m.severity === "error")
    ? "error"
    : messages.some((m) => m.severity === "warning")
    ? "warning"
    : "pass";
  return { slideId: a.slideId, status, messages };
}

export function overallVerdict(slideReports) {
  if (slideReports.some((r) => r.status === "error")) return "bloqueado para exportación";
  if (slideReports.some((r) => r.status === "warning")) return "apto solo como borrador (revisar advertencias)";
  return "aprobado como borrador del sistema (no reemplaza la aprobación institucional final)";
}
