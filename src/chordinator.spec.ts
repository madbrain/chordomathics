
import {computeNotes} from './chordinator';

describe('Test chordinator', () => {

    test('should compute notes of E', () => {
        expect(computeNotes("E")).toEqual(["E", "G#", "B"]);
    });

    test('should compute notes of C#', () => {
        expect(computeNotes("C#")).toEqual(["C#", "F", "G#"]);
    });

    test('should compute notes of Am', () => {
        expect(computeNotes("Am")).toEqual(["A", "C", "E"]);
    });

    test('should compute notes of D#m7', () => {
        expect(computeNotes("D#m7")).toEqual(["D#", "F#", "A#", "C#"]);
    });

    test('should compute notes of FM7', () => {
        expect(computeNotes("FM7")).toEqual(["F", "A", "C", "E"]);
    });

    test('should compute notes of G6', () => {
        expect(computeNotes("G6")).toEqual(["G", "B", "D", "E"]);
    });

    test('should not compute notes on empty input', () => {
        expect(computeNotes("")).toEqual([]);
    });

    test('should not compute notes on invalid input', () => {
        expect(computeNotes("T")).toEqual([]);
    });
});