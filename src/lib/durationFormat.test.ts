import durationFormat from './durationFormat';

describe('durationFormat', () => {
  it.each([
    [0, ''], [-5, ''], [5, '0:05'], [65, '1:05'], [600, '10:00'], [3723, '1:02:03'],
  ])('formats %i seconds as "%s"', (seconds, expected) => {
    expect(durationFormat(seconds)).toBe(expected);
  });
});
