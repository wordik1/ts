import { it, describe, expect } from 'vitest';
import { query } from './4lab.ts'
import type { Where, Sort, GroupBy, Group, Having, GroupTransform, Transform } from './4lab';


type User = {
    id: number;
    name: string;
    surname: string;
    age: number;
    city: string;
};

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