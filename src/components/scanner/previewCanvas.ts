/**
 * Draws every camera frame into `canvas`, cropped to fill it like
 * object-fit: cover. The video itself stays invisible: iOS Safari sometimes
 * draws a camera video letterboxed into its clipped area, ignoring both its
 * box and object-fit.
 */
export function startPreview(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  let stopped = false;

  const resize = () => {
    // Device pixels, capped: sharper buys nothing for a camera preview.
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(canvas.clientWidth * ratio);
    const height = Math.round(canvas.clientHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const nextFrame = () => {
    if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(draw);
    else requestAnimationFrame(draw);
  };
  function draw() {
    if (stopped) return;
    const { videoWidth, videoHeight } = video;
    const { width, height } = canvas;
    if (context && videoWidth && videoHeight && width && height) {
      const scale = Math.max(width / videoWidth, height / videoHeight);
      const sourceWidth = width / scale;
      const sourceHeight = height / scale;
      context.drawImage(
        video,
        (videoWidth - sourceWidth) / 2, (videoHeight - sourceHeight) / 2, sourceWidth, sourceHeight,
        0, 0, width, height,
      );
    }
    nextFrame();
  }
  nextFrame();

  return () => {
    stopped = true;
    observer.disconnect();
  };
}
