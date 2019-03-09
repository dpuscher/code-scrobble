export const ANALYTICS_ID = 'UA-135908212-1';

export const trackEvent = (action, category, label, value) => {
  window.ga('send', 'event', category, action, label, value);
};

export const autotrackParams = (category, action, label, value) => {
  if ((typeof category === 'undefined' || category === null) || (typeof action === 'undefined' || action === null)) return {};
  return {
    'data-event-category': category,
    'data-event-action': action,
    'data-event-label': label,
    'data-event-value': value,
    'data-on': 'click,auxclick,contextmenu',
  };
};
