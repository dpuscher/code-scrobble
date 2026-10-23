import { scaledSize } from './zxing.shared';

describe('scaledSize', () => {
  it.each([
    [1920, 1080, 1280, 720],
    [1080, 1920, 720, 1280],
    [640, 480, 640, 480],
  ])('scales %ix%i to %ix%i', (width, height, scaledWidth, scaledHeight) => {
    expect(scaledSize(width, height)).toEqual({ width: scaledWidth, height: scaledHeight });
  });
});
