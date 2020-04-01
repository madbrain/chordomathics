
import * as _ from 'lodash';

export enum StringState {
    muted = "muted",
    open = "open",
    none = ""
}

export interface Finger {
    number: number;
    case: number;
    from : number;
    to?: number;
}

export interface Chord {
    name: string;
    stringTop: StringState[];
    fingers: Finger[];
}

const HEIGHTS = {
    'C': 0,
    'D': 2,
    'E': 4,
    'F': 5,
    'G': 7,
    'A': 9,
    'B': 11
};

const MINOR_THIRD_INTERVAL = 3;
const MAJOR_THIRD_INTERVAL = 4;
const FIFTH_INTERVAL = 7;
const SEVENTH_INTERVAL = 10;
const MAJOR_SEVENTH_INTERVAL = 11;

function noteName(height: number): string {
    let prev = null;
    for (let n in HEIGHTS) {
        if (HEIGHTS[n] == height) {
            return n;
        }
        if (HEIGHTS[n] > height) {
            break;
        }
        prev = n;
    }
    return prev + "#";
}

function normalizeNote(height: number): number {
    return height % 12;
}

function toBaseNote(name: string): number {
    return HEIGHTS[name[0].toUpperCase()];
}

function toNote(name: string): number {
    const base = toBaseNote(name);
    if (base != undefined && name.length > 1 && name[1] == '#') {
        return normalizeNote(base + 1);
    }
    return base;
}

export function computeNotes(chordName: string): string[] {

    if (!chordName
        || chordName.length == 0
        || toBaseNote(chordName) == undefined) {
        return [];
    }

    let index = 1;
    let isSharp = false;
    let isMinor = false;
    let hasSeventh = false;
    let hasMajorSeventh = false;
    if (chordName.length > index && chordName[index] == '#') {
        isSharp = true;
        ++index;
    }
    if (chordName.length > index && chordName[index] == 'm') {
        isMinor = true;
        ++index;
    }
    if (chordName.length > index && chordName[index] == '7') {
        hasSeventh = true;
        ++index;
    } else if (chordName.length > (index+1) && chordName.substring(index, index+2) == 'M7') {
        hasSeventh = true;
        hasMajorSeventh = true;
        ++index;
    }
    
    const root = normalizeNote(toBaseNote(chordName) + (isSharp ? 1 : 0));
    const third = normalizeNote(root + (isMinor ? MINOR_THIRD_INTERVAL : MAJOR_THIRD_INTERVAL));
    const fifth = normalizeNote(root + FIFTH_INTERVAL);

    const chord = [ noteName(root), noteName(third), noteName(fifth) ];
    if (hasSeventh) {
        chord.push(noteName(normalizeNote(root + (hasMajorSeventh ? MAJOR_SEVENTH_INTERVAL : SEVENTH_INTERVAL))));
    }
    return chord;
}

function findOnString(start: number, notes: number[]): number[] {
    const result = [];
    for (let i = 0; i < 24; ++i) {
        const current = normalizeNote(start + i);
        if (notes.indexOf(current) >= 0) {
            result.push(i);
        }
    }
    return result;
}

class PendingChord {
    chord: Chord;
    next: number;
}

function computeBaseChord(chordName: string, bassNote: number, tuning: number[]): PendingChord[] {
    const result = [];

    tuning.forEach((t, i) => {
        findOnString(t, [ bassNote ]).forEach(c => {
            const fingers = [];
            if (c != 0) {
                fingers.push({ number: 1, case: c, from: i+1 });
            }
            const stringTop = [
                StringState.none, StringState.none, StringState.none,
                StringState.none, StringState.none, StringState.none
            ];
            for (let j = 0; j < i; ++j) {
                stringTop[j] = StringState.muted;
            }
            if (c == 0) {
                stringTop[i] = StringState.open;
            }
            const chord: Chord = {
                name: chordName,
                stringTop,
                fingers
            };
            result.push({ chord, next: i + 1 });
        });
    });

    return result;
}

function fingerToNote(finger: Finger, tuning: number[]): number {
    return normalizeNote(tuning[finger.from-1] + finger.case);
}

function optimizeChord(chord: Chord) {
    const groupByCase = _.groupBy(chord.fingers, f => f.case);
    const multiple = _.sortBy(_.keys(groupByCase).filter(c => groupByCase[c].length > 1));
    const barres: Finger[] = [];
    multiple.forEach(m => {
        const fingers: Finger[] = groupByCase[m];
        let top = -1;
        for (let s = 6; s > 0; --s) {
            if (fingers.find(f => f.from == s) || chord.fingers.find(f => f.from == s && f.case > m)) {
                top = s;
            } else {
                break;
            }
        }
        // y a t'il un barré potentiel et contient t'il des notes
        if (top >= 0 && top < 6 && fingers.some(f => f.from >= top)) {
            barres.push({number: 0, case: m, from: top, to: 6});
        }
    });
    // supprimer les doigts couverts par les barrés
    const others = chord.fingers.filter(f => barres.find(b => b.case == f.case && b.from <= f.from && f.from <= b.to) == undefined);
    return { ...chord, fingers: barres.concat(others) };
}

function assignFinger(chord: Chord) {
    const groupByCase = _.groupBy(chord.fingers, f => f.case);
    let fingerNumber = 1;
    chord.fingers = [];
    _.keys(groupByCase).sort().forEach(c => {
        groupByCase[c].sort();
        groupByCase[c].forEach(f => {
            chord.fingers.push({...f, number: fingerNumber});
            ++fingerNumber;
        });
    });
}

export function computeChords(chordName: string, tuning: string[]): Chord[] {
    const notes = computeNotes(chordName).map(toNote);
    const tuningNotes = tuning.map(toNote);

    let result = [];
    let work = computeBaseChord(chordName, notes[0], tuningNotes);
    
    // Generate base chords
    while (work.length > 0) {
        const toProcess = work;
        work = [];
        toProcess.forEach(pendingChord => {
    
            if (pendingChord.next < tuningNotes.length) {
                findOnString(tuningNotes[pendingChord.next], notes).forEach(c => {
                    const fingers = [].concat(pendingChord.chord.fingers);
                    if (c != 0) {
                        const finger = _.max(fingers.map(f => f.number)) + 1;
                        fingers.push({ number: finger, case: c, from: pendingChord.next+1 });
                    }
                    const stringTop = [].concat(pendingChord.chord.stringTop);
                    if (c == 0) {
                        stringTop[pendingChord.next] = StringState.open;
                    }
                    const newChord: Chord = {...pendingChord.chord,
                        stringTop,
                        fingers
                    };
                    work.push({ chord: newChord, next: pendingChord.next + 1 });
                });
            } else {
                result.unshift(pendingChord.chord);
            }
    
        });
    }
    console.log("Step1", result.length);

    // filter by maximal span
    const MAX_SPAN = 5;
    result = result.filter(chord => {
        const cases = chord.fingers.map(f => f.case);
        return _.max(cases) - _.min(cases) + 1 <= MAX_SPAN;
    });
    console.log("Step2", result.length);

    // filter by note content
    result = result.filter(chord => {
        const chordNotes = _.uniq(chord.fingers.map(f => fingerToNote(f, tuningNotes)));
        return notes.length == chordNotes.length;
    });
    console.log("Step3", result.length);

    // optimize barré
    result = result.map(chord => optimizeChord(chord));

    // filter by maximum 4 fingers
    result = result.filter(chord => chord.fingers.length <= 4);
    console.log("Step4", result.length);

    // assign finger number
    result.forEach(chord => assignFinger(chord));

    // sort by min case
    result.sort((a, b) => _.min(a.fingers.map(f => f.case)) - _.min(b.fingers.map(f => f.case)));

    const MAX_CHORDS = 100;
    if (result.length > MAX_CHORDS) {
        return result.slice(0, MAX_CHORDS);
    }
    return result;
}
