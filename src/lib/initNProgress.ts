import Router from 'next/router';
import NProgress from 'nprogress';

let progressTimeout: ReturnType<typeof setTimeout> | undefined;

const stopProgress = () => {
  clearTimeout(progressTimeout);
  NProgress.done();
};

// Shows the progress bar only for navigations that take longer than 100ms.
export default function initNProgress() {
  NProgress.configure({ showSpinner: false });
  Router.events.on('routeChangeStart', () => {
    progressTimeout = setTimeout(NProgress.start, 100);
  });
  Router.events.on('routeChangeComplete', stopProgress);
  Router.events.on('routeChangeError', stopProgress);
}
