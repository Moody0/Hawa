import { describe, it, expect } from 'vitest';

describe('RollingNumber direction transition logic', () => {
    // Helper function reproducing the synchronous state derivation in RollingNumber
    function createRollingState(initialValue: number) {
        let state = { value: initialValue, direction: 1 };

        return {
            update(nextValue: number) {
                let direction = state.direction;
                if (nextValue !== state.value) {
                    direction = nextValue > state.value ? 1 : -1;
                    state = {
                        value: nextValue,
                        direction,
                    };
                }
                return { value: state.value, direction };
            },
            getState() {
                return state;
            }
        };
    }

    it('determines direction = 1 when increasing', () => {
        const tracker = createRollingState(1);
        const res = tracker.update(2);
        expect(res.direction).toBe(1);
        expect(res.value).toBe(2);
    });

    it('immediately sets direction = -1 on the very first decrease after increases', () => {
        const tracker = createRollingState(1);
        
        // Consecutive increases
        expect(tracker.update(2).direction).toBe(1);
        expect(tracker.update(3).direction).toBe(1);
        expect(tracker.update(4).direction).toBe(1);

        // FIRST DECREASE: Must be -1 immediately, NOT 1
        const firstDecrease = tracker.update(3);
        expect(firstDecrease.direction).toBe(-1);
        expect(firstDecrease.value).toBe(3);

        // Subsequent decrease
        const secondDecrease = tracker.update(2);
        expect(secondDecrease.direction).toBe(-1);
    });

    it('immediately sets direction = 1 on the very first increase after decreases', () => {
        const tracker = createRollingState(5);

        // Consecutive decreases
        expect(tracker.update(4).direction).toBe(-1);
        expect(tracker.update(3).direction).toBe(-1);

        // FIRST INCREASE: Must be 1 immediately, NOT -1
        const firstIncrease = tracker.update(4);
        expect(firstIncrease.direction).toBe(1);
        expect(firstIncrease.value).toBe(4);

        // Subsequent increase
        const secondIncrease = tracker.update(5);
        expect(secondIncrease.direction).toBe(1);
    });

    it('retains previous direction if value remains unchanged', () => {
        const tracker = createRollingState(3);
        tracker.update(4); // dir = 1
        expect(tracker.update(4).direction).toBe(1);

        tracker.update(2); // dir = -1
        expect(tracker.update(2).direction).toBe(-1);
    });
});
