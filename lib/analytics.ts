// Wrapper au-dessus du script Plausible (voir components/AnalyticsScript.tsx).
// Ne fait rien si le script n'est pas chargé (pas de consentement "mesure
// d'audience", ou NEXT_PUBLIC_ANALYTICS_DOMAIN non configuré) : safe à
// appeler depuis n'importe quel composant sans vérification préalable.

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || typeof window.plausible !== "function") {
    return;
  }
  window.plausible(eventName, props ? { props } : undefined);
}
