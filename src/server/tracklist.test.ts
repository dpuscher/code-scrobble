import { convertTimecode, selectTracks, type DiscogsTrack } from './tracklist';

const track = (position: string, title = position, duration = ''): DiscogsTrack => ({
  position, title, duration, type_: 'track',
});
const heading = (title: string): DiscogsTrack => ({
  position: '', title, duration: '', type_: 'heading',
});
const index = (title: string, parts: DiscogsTrack[], duration = ''): DiscogsTrack => ({
  position: '', title, duration, type_: 'index', sub_tracks: parts,
});
const titles = (tracklist: DiscogsTrack[], formats: { name: string; qty?: string }[] = []) => (
  selectTracks(tracklist, formats).map((t) => t.title)
);

describe('convertTimecode', () => {
  it.each([
    ['3:30', 210],
    ['1:02:03', 3723],
    ['123:45', 7425],
    ['3.45', 225],
    ['45', 45],
    ['', 0],
    ['x:10', 10],
    [undefined, 0],
  ])('converts %s to %i seconds', (input, expected) => {
    expect(convertTimecode(input)).toBe(expected);
  });
});

describe('selectTracks', () => {
  it('drops headings', () => {
    expect(titles([heading('Act One'), track('1'), heading('Act Two'), track('2')])).toEqual(['1', '2']);
  });

  it('converts durations', () => {
    expect(selectTracks([track('1', 'One', '3:30')])).toEqual([{ title: 'One', duration: 210 }]);
  });

  describe('index tracks', () => {
    // Pink Floyd - Atom Heart Mother: the suite is one track on side A.
    it('scrobbles a work whose parts share one track once', () => {
      const suite = index('Atom Heart Mother', [track('A.a', "Father's Shout", '2:50'), track('A.b', 'Breast Milky', '5:23')]);
      expect(selectTracks([suite, track('B1', 'If')])).toEqual([
        { title: 'Atom Heart Mother', duration: 493 },
        { title: 'If', duration: 0 },
      ]);
    });

    it.each([['A2a', 'A2b'], ['3.1', '3.2'], ['A2.a', 'A2.b'], ['A.1', 'A.2'], ['Aa', 'Ab'], ['1A', '1B'], ['', '']])('treats %s, %s as parts of one track', (a, b) => {
      expect(titles([index('Suite', [track(a, 'I'), track(b, 'II')])])).toEqual(['Suite']);
    });

    it('keeps parts of different tracks apart', () => {
      expect(titles([index('Mix', [track('1.1', 'A'), track('1.2', 'B'), track('2.1', 'C')])]))
        .toEqual(['Mix: A', 'Mix: B', 'Mix: C']);
    });

    it('prefers the duration of the work', () => {
      expect(selectTracks([index('Suite', [track('A1a', 'I', '1:00')], '10:00')])[0].duration).toBe(600);
    });

    // Brahms - Ein Deutsches Requiem: each movement is a track of its own.
    it('scrobbles parts with their own positions one by one', () => {
      expect(titles([index('Requiem', [track('1', 'Selig sind'), track('2', 'Denn alles Fleisch')])]))
        .toEqual(['Requiem: Selig sind', 'Requiem: Denn alles Fleisch']);
      expect(titles([index('Carmen Fantasie', [track('A', 'Part 1'), track('B', 'Concluded')])]))
        .toEqual(['Carmen Fantasie: Part 1', 'Carmen Fantasie: Concluded']);
    });
  });

  it('keeps tracks rolled into one, like the songs of a mix or a hidden track', () => {
    expect(titles([track('1'), track('2.1', 'A Final Song'), track('2.2', '(silence)'), track('2.3', 'The Hidden Song')]))
      .toEqual(['1', 'A Final Song', 'The Hidden Song']);
  });

  it.each(['(no audio)', '(Silence)', '[silence]', 'No Audio', 'Data Track', 'Blank Track'])('drops %s', (title) => {
    expect(titles([track('1'), track('2', title)])).toEqual(['1']);
  });

  it.each(['Silence', 'Empty', 'Enjoy The Silence', 'Blank Generation'])('keeps the song %s', (title) => {
    expect(titles([track('1', title)])).toEqual([title]);
  });

  it('keeps untitled tracks', () => {
    expect(titles([track('1', 'Untitled')])).toEqual(['Untitled']);
  });

  describe('records and tapes', () => {
    it('keeps the record that comes first', () => {
      expect(titles([track('MC-A1'), track('7"-A'), track('7"-B')])).toEqual(['MC-A1']);
      expect(titles([track('7"-A'), track('7"-B'), track('MC-A1')])).toEqual(['7"-A', '7"-B']);
    });

    it('removes a bonus CD from vinyl releases', () => {
      expect(titles([track('A1'), track('B-2'), track('CD1'), track('1'), track('1-1')])).toEqual(['A1', 'B-2']);
    });

    it.each([
      [['A1', 'A2', 'B']], // single track on side B
      [['A1a', 'A1b', 'B1']], // medley parts
      [['AA', 'AB']], // double A side
      [['AA1', 'AB1', 'B1']], // parallel grooves
      [['A1', 'A2', 'B3', 'B4']], // sequential numbering
      [['А1', 'В1']], // Cyrillic sides
      [['A0', 'A1']], // pregap
      [['A2 ', 'B1.']], // stray space and dot
      [['A.1', 'A-2', 'B 1', 'b2']], // other spellings
      [['Aa', 'Ab', 'Ba', 'Bd', 'Ca', 'Cd']], // parts as sides
      [['AI', 'AV', 'AVI', 'BI']], // Roman numbers
      [['Side A', 'Face B', 'Lado C', 'Seite D']], // spelled out
    ])('keeps every side of %j', (positions) => {
      expect(titles(positions.map((p) => track(p)))).toHaveLength(positions.length);
    });

    // Linkin Park - Hybrid Theory (20th Anniversary) box: LPs, CDs, DVDs and a cassette.
    it('scrobbles only the records of a box set', () => {
      const tracklist = [
        heading('Hybrid Theory'), track('A1'), track('B7'),
        heading('Hybrid Theory'), track('CD1-1'), track('CD2-1'),
        heading('Live'), track('DVD1-1'),
        heading('Street Team Cassette Sampler'), track('CS-A1'),
      ];
      expect(titles(tracklist)).toEqual(['A1', 'B7']);
    });
  });

  describe('discs', () => {
    it('keeps every disc of a set', () => {
      expect(titles([track('1-1'), track('1-2'), track('2-1')])).toEqual(['1-1', '1-2', '2-1']);
      expect(titles([track('CD1-1'), track('CD2-1')])).toEqual(['CD1-1', 'CD2-1']);
    });

    it('keeps the tracks of a CD that come first, not the records', () => {
      expect(titles([track('CD-1'), track('CD-2'), track('LP-A1')])).toEqual(['CD-1', 'CD-2']);
    });

    it.each(['Video 1', 'Video', 'MPG1', 'DVD1-1', 'DVD-2', 'DVDR1', 'BD-1', 'BR-1', 'UHDBD-1', 'CDV-1', 'Blu-ray 1', 'CD-ROM', 'USB-1', 'MP3-1', 'MP4-1', 'AIFF-1'])('drops %s', (position) => {
      expect(titles([track('1'), track(position)])).toEqual(['1']);
    });

    it('keeps the audio of a DVD-Audio', () => {
      expect(titles([track('DVD-Audio 1'), track('DVD-Video 1')])).toEqual(['DVD-Audio 1']);
    });

    // Nirvana - Nevermind (30th Anniversary): 5 CDs and a Blu-ray as disc 6.
    it('drops the discs that the formats list as video', () => {
      const formats = [{ name: 'Box Set' }, { name: 'CD', qty: '1' }, { name: 'DVD', qty: '1' }];
      expect(titles([track('1-1'), track('2-1')], formats)).toEqual(['1-1']);
    });

    it('does not map disc numbers to formats when the tracklist leaves an item out', () => {
      const formats = [{ name: 'VHS' }, { name: 'CD', qty: '2' }];
      expect(titles([track('1-1'), track('2-1')], formats)).toEqual(['1-1', '2-1']);
    });

    it('treats CDrs as CDs', () => {
      expect(titles([track('CD-1'), track('CDr-1')])).toEqual(['CD-1', 'CDr-1']);
    });

    it('drops sections a heading marks as video when the set has a video disc', () => {
      const tracklist = [track('1'), heading('Bonus DVD'), track('2'), heading('-'), track('3')];
      expect(titles(tracklist, [{ name: 'CD' }, { name: 'DVD' }])).toEqual(['1', '3']);
      expect(titles(tracklist, [{ name: 'CD' }])).toEqual(['1', '2', '3']);
    });

    it('drops download files of a physical release', () => {
      expect(titles([track('1'), track('DL-1')])).toEqual(['1']);
    });
  });

  it('keeps a release that only has video or files', () => {
    expect(titles([track('DVD-1'), track('DVD-2')], [{ name: 'DVD' }])).toEqual(['DVD-1', 'DVD-2']);
    expect(titles([track('1'), heading('Video Clips'), track('2')], [{ name: 'DVD' }])).toEqual(['1', '2']);
  });

  it('keeps the artists of tracks and parts', () => {
    const artists = [{ name: 'Eminem' }];
    expect(selectTracks([{ ...track('1'), artists }])[0].artists).toEqual(artists);
    expect(selectTracks([index('Suite', [{ ...track('1a'), artists }])])[0].artists).toEqual(artists);
  });
});
