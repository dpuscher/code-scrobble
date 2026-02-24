export const ANALYTICS_ID = "UA-135908212-1";

export const trackEvent = (action: string, category: string, label?: string, value?: string) => {
  (window as any).ga("send", "event", category, action, label, value);
};

export const autotrackParams = (category: string, action: string, label?: string, value?: string) => {
  if (typeof category === "undefined" || category === null || typeof action === "undefined" || action === null)
    return {};
  return {
    "data-event-category": category,
    "data-event-action": action,
    "data-event-label": label,
    "data-event-value": value,
    "data-on": "click,auxclick,contextmenu",
  };
};
