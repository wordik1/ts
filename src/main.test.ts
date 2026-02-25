import { it, describe, expect } from 'vitest';
import { createUser, createBook, calculateArea, getStatusColor, upperFirst, trimSpaces, getFirstElement, findById } from './main.ts';

describe('test of functions', () =>{

    it('createUser test',
        () => {
            const result = createUser(1, "Nick", "bimbimbambam@gmail.com");
            expect(result).toBeTypeOf('object');
            expect(result.id).toBe(1);
            expect(result.name).toBe("Nick");
            expect(result.email).toBe("bimbimbambam@gmail.com");
            expect(result.isActive).toBe(true);
        }
    )

    it('circle calculateArea',
        () => {
            let result = calculateArea('circle', 3);
            expect(result).toBeCloseTo(28.274333882308138, 5);
        }
    )

    it('square calculateArea',
        () => {
            let result = calculateArea('square', 12);
            expect(result).toBe(144);
        }
    )
})