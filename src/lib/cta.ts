export const CAL_COM_URL = "https://cal.com/andes-code/consulta-gratuita";
export const WHATSAPP_NUMBER = "5492644432919";

export function whatsappUrl(source: string, message?: string): string {
  const defaultMsg = `Hola, vengo desde la web (${source}) y quiero hablar de un proyecto.`;
  const text = encodeURIComponent(message ?? defaultMsg);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function trackCta(name: string, props?: Record<string, string>) {
  if (typeof window === "undefined") return;
  const plausible = (window as unknown as { plausible?: (n: string, o?: { props?: Record<string, string> }) => void }).plausible;
  if (plausible) plausible(name, props ? { props } : undefined);
}
