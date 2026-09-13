import { describe, it, expect, vi } from 'vitest';
import { InteractionSystem, Interactable } from '../src/systems/InteractionSystem';

describe('InteractionSystem', () => {
    it('selects the highest priority target within radius', () => {
        const system = new InteractionSystem();
        const interactSpy1 = vi.fn();
        const interactSpy2 = vi.fn();

        const item1: Interactable = {
            id: '1', type: 'item', x: 10, y: 10, priority: 1,
            canInteract: () => true, onInteract: interactSpy1
        };
        const item2: Interactable = {
            id: '2', type: 'baby', x: 20, y: 20, priority: 2,
            canInteract: () => true, onInteract: interactSpy2
        };

        system.registerCandidate(item1);
        system.registerCandidate(item2);

        // Both in range, item2 has higher priority
        const target = system.update(0, 0);
        expect(target?.id).toBe('2');

        system.interact();
        expect(interactSpy2).toHaveBeenCalled();
        expect(interactSpy1).not.toHaveBeenCalled();
    });

    it('selects the closest target if priorities are equal', () => {
        const system = new InteractionSystem();
        const item1: Interactable = {
            id: '1', type: 'item', x: 10, y: 0, priority: 1,
            canInteract: () => true, onInteract: () => {}
        };
        const item2: Interactable = {
            id: '2', type: 'item', x: 20, y: 0, priority: 1,
            canInteract: () => true, onInteract: () => {}
        };

        system.registerCandidate(item1);
        system.registerCandidate(item2);

        const target = system.update(0, 0);
        expect(target?.id).toBe('1');
    });

    it('performs deterministic ranking and boundary execution cleanly (B2, B3, B4)', () => {
        const system = new InteractionSystem();
        const executionSpy = vi.fn();

        const candidate: Interactable = {
            id: 'exec_test', type: 'item', x: 5, y: 5, priority: 10,
            canInteract: () => true, onInteract: executionSpy
        };
        system.registerCandidate(candidate);

        // B2 Detection & B3 Ranking: Player nearby, candidate selected
        const detected = system.update(0, 0);
        expect(detected?.id).toBe('exec_test');

        // B4 Execution Boundary: Execution boundary handles the selected candidate cleanly
        system.interact();
        expect(executionSpy).toHaveBeenCalledOnce();
    });

    it('ignores candidates outside radius', () => {
        const system = new InteractionSystem();
        const item: Interactable = {
            id: '1', type: 'item', x: 100, y: 100, priority: 1,
            canInteract: () => true, onInteract: () => {}
        };
        system.registerCandidate(item);

        const target = system.update(0, 0);
        expect(target).toBeNull();
    });
});
