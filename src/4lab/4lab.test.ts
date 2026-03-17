import { it, describe, expect, assert } from 'vitest';
import { query } from './4lab.ts'
import type { Where, Sort, GroupBy, Group, Having, GroupTransform, Transform } from './4lab';

type User = {
    id: number;
    name: string;
    surname: string;
    age: number;
    city: string;
};

const users: User[] = [
    { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
    { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
    { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
    { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
];

const where: Where<User> = (key, value) => (data) => data.filter((item) => item[key] === value);

const sort: Sort<User> =
    (key) =>
    (data) =>
    [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
});

const search = query<User>(
    where("name", "John"),
    where("surname", "Doe"),
    sort("age"),
);

describe("поиск и сортировка", () => {
    it("test", () => {
        const result = search(users);
        const expected: User[] = [
                { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
                { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
                { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
            ]
        assert.deepEqual(result, expected);
    })
})

const groupBy: GroupBy<User> =
    (key) =>
    (data) =>
    Object.values(
    data.reduce((acc, item) => {
    const k = item[key] as unknown as string;
    (acc[k] ??= { key: item[key], items: [] }).items.push(item);
    return acc;
    }, {} as Record<string, Group<User, typeof key>>),
);

const having: Having<User> = (predicate) => (groups) => groups.filter(predicate);

const groupAndFilter = query<User>(
    groupBy("city"),
    having<User>((group) => group.items.length > 1),
);

describe("группировка и фильтрация групп", () => {
    it("должен сгруппировать по городу и оставить группы с более чем 1 элементом", () => {
        // Сначала группируем, потом фильтруем группы
        const groupTransform = groupBy("city");
        const havingTransform = having<User>((group) => group.items.length > 1);
        
        // Применяем последовательно
        const groups = groupTransform(users);
        const filteredGroups = havingTransform(groups);
        
        const expected = [
            { key: "NY", items: [
                { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
                { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" }
            ]},
            { key: "LA", items: [
                { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
                { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" }
            ]}
        ];
        
        expect(filteredGroups).toEqual(expected);
    });

    it("должен сгруппировать по городу и оставить группы с пользователями младше 35 лет", () => {
        const groupTransform = groupBy("city");
        const havingTransform = having<User>((group) => 
            group.items.some(user => user.age < 35)
        );
        
        const groups = groupTransform(users);
        const filteredGroups = havingTransform(groups);
        
        const expected = [
            { key: "NY", items: [
                { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
                { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" }
            ]}
        ];
        
        expect(filteredGroups).toEqual(expected);
    });
});