import { describe, it, expect, assert } from 'vitest';
import { expectTypeOf } from 'vitest';
import { query } from './5lab.ts';
import type { Transform, Group, GroupTransform, WhereOp, GroupByOp, HavingOp, SortOp } from './5lab.ts';

type User = {
    name: string;
    age: number;
    city: string;
    salary: number;
};

const users: User[] = [
    { name: 'Alice', age: 30, city: 'Moscow', salary: 100000 },
    { name: 'Charlie', age: 25, city: 'Moscow', salary: 80000 },
    { name: 'Bob', age: 35, city: 'SPb', salary: 120000 },
    { name: 'David', age: 28, city: 'SPb', salary: 90000 },
    { name: 'Frank', age: 32, city: 'Moscow', salary: 110000 },
];

const whereOp: WhereOp<User> = (key, value) => (data) =>
    data.filter(item => item[key] === value);

const sortOp: SortOp<User> = (key) => (data) =>
    [...data].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av < bv) return -1;
        if (av > bv) return 1;
        return 0;
    });

const groupByOp: GroupByOp<User> = (key) => (data) => {
    const map = new Map<User[typeof key], User[]>();
    for (const item of data) {
        const k = item[key];
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(item);
    }
    return Array.from(map.entries()).map(([k, items]) => ({ key: k, items }));
};

const havingOp: HavingOp<User, 'city'> = (predicate) => (groups) =>
    groups.filter(predicate);

describe('where — фильтрация строк', () => {
    it('фильтрует по одному полю', () => {
        const result = query<User>()
            .where('city', 'Moscow')
            .execute(users);

        expect(result).toEqual([
            { name: 'Alice', age: 30, city: 'Moscow', salary: 100000 },
            { name: 'Charlie', age: 25, city: 'Moscow', salary: 80000 },
            { name: 'Frank', age: 32, city: 'Moscow', salary: 110000 },
        ]);
    });

    it('цепочка where — несколько фильтров', () => {
        const result = query<User>()
            .where('city', 'SPb')
            .where('salary', 120000)
            .execute(users);

        expect(result).toEqual([
            { name: 'Bob', age: 35, city: 'SPb', salary: 120000 },
        ]);
    });

    it('возвращает пустой массив, если нет совпадений', () => {
        const result = query<User>()
            .where('city', 'Kazan')
            .execute(users);

        expect(result).toEqual([]);
    });
});

describe('groupBy — группировка', () => {
    it('группирует по городу после where', () => {
        const result = query<User>()
            .where('city', 'Moscow')
            .groupBy('city')
            .execute(users);

        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('Moscow');
        expect(result[0].items).toHaveLength(3);
    });
});

describe('having — фильтрация групп', () => {
    it('оставляет группы с количеством элементов > 1', () => {
        const result = query<User>()
            .where('city', 'Moscow')
            .groupBy('city')
            .having(group => group.items.length > 1)
            .execute(users);

        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('Moscow');
        expect(result[0].items).toHaveLength(3);
    });

    it('убирает все группы — пустой результат', () => {
        const result = query<User>()
            .where('name', 'Alice')
            .groupBy('name')
            .having(group => group.items.length > 5)
            .execute(users);

        expect(result).toEqual([]);
    });
});

describe('sort — сортировка групп', () => {
    it('сортирует группы по ключу (city) после having', () => {
        const result = query<User>()
            .where('city', 'Moscow')
            .groupBy('city')
            .having(() => true)
            .sort('city')
            .execute(users);

        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('Moscow');
    });
});

describe('полный пайплайн: where -> groupBy -> having -> sort', () => {
    it('полный пайплайн с несколькими группами', () => {
        const result = query<User>()
            .where('salary', 80000)
            .groupBy('city')
            .having(group => group.items.length > 0)
            .sort('city')
            .execute(users);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('после groupBy result — массив Group, не User', () => {
        const result = query<User>()
            .where('city', 'Moscow')
            .groupBy('city')
            .having(() => true)
            .sort('city')
            .execute(users);

        expect(result[0]).toHaveProperty('key');
        expect(result[0]).toHaveProperty('items');
        expect(Array.isArray(result[0].items)).toBe(true);
    });
});

describe('частичные пайплайны', () => {
    it('только where', () => {
        const result = query<User>()
            .where('age', 30)
            .execute(users);

        expect(result).toEqual([
            { name: 'Alice', age: 30, city: 'Moscow', salary: 100000 },
        ]);
    });

    it('where -> groupBy -> having', () => {
        const result = query<User>()
            .where('city', 'SPb')
            .groupBy('city')
            .having(group => group.items.length > 0)
            .execute(users);

        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('SPb');
    });

    it('where -> groupBy', () => {
        const result = query<User>()
            .where('city', 'Moscow')
            .groupBy('city')
            .execute(users);

        expect(result).toHaveLength(1);
    });
});