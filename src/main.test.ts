import { it, describe, expect } from 'vitest';
import { createUser, createBook, calculateArea, getStatusColor, upperFirst, trimSpaces, getFirstElement, findById, type Book, type Status } from './main.ts';

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

    it('createBook test', 
        () => {
            const book: Book = {
                title: "Биба",
                author: "Боба",
                year: 1488,
                genre: 'non-fiction'
            };
            const result = createBook(book);
            expect(result).toBeTypeOf('object');
            expect(result.title).toBe("Биба");
            expect(result.author).toBe("Боба");
            expect(result.year).toBe(1488);
            expect(result.genre).toBe('non-fiction');
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

    it('getStatusColor test',
        () => {
            const activeColor: Status = 'active';
            expect(getStatusColor(activeColor)).toBe('green');
            const inactiveColor: Status = 'inactive';
            expect(getStatusColor(inactiveColor)).toBe('gray');
            const newColor: Status = 'new';
            expect(getStatusColor(newColor)).toBe('blue');
        }
    )
})