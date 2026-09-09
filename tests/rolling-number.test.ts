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

describe('RollingNumber animation variants', async () => {
    const { variants } = await import('../app/components/RollingNumber');

    it('has opacity 0 and full clearance (>130%) on exit and initial to prevent lingering tips', () => {
        const initialIncrease = variants.initial(1);
        const exitIncrease = variants.exit(1);
        const animate = variants.animate;

        expect(initialIncrease.opacity).toBe(0);
        expect(exitIncrease.opacity).toBe(0);
        expect(animate.opacity).toBe(1);
        expect(animate.y).toBe("0%");

        // Increasing: enters from bottom (+150%), exits to top (-150%)
        expect(initialIncrease.y).toBe("150%");
        expect(exitIncrease.y).toBe("-150%");

        const initialDecrease = variants.initial(-1);
        const exitDecrease = variants.exit(-1);

        // Decreasing: enters from top (-150%), exits to bottom (+150%)
        expect(initialDecrease.opacity).toBe(0);
        expect(exitDecrease.opacity).toBe(0);
        expect(initialDecrease.y).toBe("-150%");
        expect(exitDecrease.y).toBe("150%");
    });
});

