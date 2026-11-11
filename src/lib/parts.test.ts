import {
  defaultSelection, describeSelection, inSentence, nextParts, preferenceKey, preferredSelection, scopeOf,
  selectedTracks, toSelection,
} from './parts';
import type { Part } from './types';

const side = (name: string, item: string, extra: Partial<Part> = {}): Part => ({
  id: name, name, kind: 'side', item, medium: 'record', ...extra,
});
const disc = (n: number, extra: Partial<Part> = {}): Part => ({
  id: `D${n}`, name: `CD ${n}`, kind: 'disc', item: `D${n}`, medium: 'CD', ...extra,
});

// A double LP with a bonus CD.
const doubleLp = [side('A', '~1'), side('B', '~1'), side('C', '~2'), side('D', '~2'), disc(1, { name: 'CD', bonus: true })];

describe('toSelection', () => {
  it('keeps known ids in release order', () => {
    expect(toSelection(doubleLp, ['C', 'A', 'X'])).toEqual(['A', 'C']);
  });

  it('is null for the default selection and releases without parts', () => {
    expect(toSelection(doubleLp, ['A', 'B', 'C', 'D'])).toBeNull();
    expect(toSelection(doubleLp, undefined)).toBeNull();
    expect(toSelection([], ['A'])).toBeNull();
  });

  it('can be empty', () => {
    expect(toSelection(doubleLp, ['X'])).toEqual([]);
  });
});

describe('selectedTracks', () => {
  const tracks = ['A', 'B', 'C', 'D', 'D1'].map((part) => ({ part }));

  it('leaves out bonus parts by default', () => {
    expect(defaultSelection(doubleLp)).toEqual(['A', 'B', 'C', 'D']);
    expect(selectedTracks(tracks, doubleLp, null).map(({ part }) => part)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('picks the selected parts', () => {
    expect(selectedTracks(tracks, doubleLp, ['B', 'D1']).map(({ part }) => part)).toEqual(['B', 'D1']);
  });

  it('takes all tracks of releases without parts', () => {
    expect(selectedTracks([{}, {}], [], null)).toHaveLength(2);
  });
});

describe('describeSelection', () => {
  it.each([
    [null, null],
    [['A'], 'Side A'],
    [['C', 'D'], 'Sides C and D'],
    [['A', 'B', 'C'], 'Sides A, B and C'],
    [['D1'], 'CD'],
    [['A', 'D1'], 'Side A + CD'],
  ])('describes %j as %s', (selection, description) => {
    expect(describeSelection(doubleLp, selection)).toBe(description);
  });

  it('lowercases words inside a sentence', () => {
    expect(inSentence('Sides C and D')).toBe('sides C and D');
    expect(inSentence('CD 2')).toBe('CD 2');
  });
});

describe('nextParts', () => {
  it('offers the next side after a side', () => {
    expect(nextParts(doubleLp, ['A'])).toEqual({
      unit: 'side', selection: ['B'], description: 'Side B', label: 'Next side (B)',
    });
    expect(nextParts(doubleLp, ['B'])).toMatchObject({ unit: 'side', selection: ['C'] });
  });

  it('offers the next record after both sides of one', () => {
    expect(nextParts(doubleLp, ['A', 'B'])).toEqual({
      unit: 'record', selection: ['C', 'D'], description: 'Sides C and D', label: 'Next record (C/D)',
    });
  });

  it('offers the next CD after a CD', () => {
    const cds = [disc(1), disc(2), disc(3)];
    expect(nextParts(cds, ['D2'])).toEqual({
      unit: 'CD', selection: ['D3'], description: 'CD 3', label: 'Next CD (3)',
    });
  });

  it('offers nothing after the last part or the whole record', () => {
    expect(nextParts(doubleLp, ['D'])).toBeUndefined();
    expect(nextParts(doubleLp, ['C', 'D'])).toBeUndefined();
    expect(nextParts(doubleLp, null)).toBeUndefined();
    expect(nextParts([], null)).toBeUndefined();
  });

  it('does not move from the main parts to bonus parts', () => {
    const withBonusSides = [disc(1), side('A', '~1', { bonus: true }), side('B', '~1', { bonus: true })];
    expect(nextParts(withBonusSides, null)).toBeUndefined();
    expect(nextParts(withBonusSides, ['A'])).toMatchObject({ selection: ['B'] });
  });
});

describe('scopes', () => {
  const twoCds = [disc(1), disc(2)];

  it('reads the scope of a selection', () => {
    expect(scopeOf(doubleLp, ['A'])).toBe('first-part');
    expect(scopeOf(doubleLp, ['A', 'B'])).toBe('first-item');
    expect(scopeOf(doubleLp, null)).toBe('all');
    expect(scopeOf(doubleLp, ['B'])).toBeUndefined();
    expect(scopeOf(twoCds, ['D1'])).toBe('first-item');
    expect(scopeOf([side('A', '~1'), disc(1, { bonus: true })], null)).toBeUndefined();
  });

  it('preselects the same scope, separately for sides and discs', () => {
    const preference = { sides: 'first-part', discs: 'all' } as const;
    expect(preferenceKey(doubleLp)).toBe('sides');
    expect(preferredSelection(doubleLp, preference)).toEqual(['A']);
    expect(preferredSelection(doubleLp, { sides: 'first-item' })).toEqual(['A', 'B']);
    expect(preferredSelection(twoCds, preference)).toBeNull();
    expect(preferredSelection(twoCds, { discs: 'first-item' })).toEqual(['D1']);
    expect(preferredSelection(doubleLp, null)).toBeNull();
  });

  it('preselects the whole record when its first record is all of it', () => {
    expect(preferredSelection(doubleLp.slice(0, 2), { sides: 'first-item' })).toBeNull();
  });
});
