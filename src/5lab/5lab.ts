export type Transform<T> = (data: T[]) => T[];
export type Group<T, K extends keyof T> = { key: T[K]; items: T[] };
export type GroupTransform<T, K extends keyof T> = (groups: Group<T, K>[]) => Group<T, K>[];
export type WhereOp<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;
export type GroupByOp<T> = <K extends keyof T>(key: K) => (data: T[]) => Group<T, K>[];
export type HavingOp<T, K extends keyof T> = (predicate: (group: Group<T, K>) => boolean) => GroupTransform<T, K>;
export type SortOp<T> = <K extends keyof T>(key: K) => Transform<T>;

type NoOps = { where: false; groupBy: false; having: false; sort: false };
type HasWhere = { where: true; groupBy: false; having: false; sort: false };
type HasGroupBy = { where: true; groupBy: true; having: false; sort: false };
type HasHaving = { where: true; groupBy: true; having: true; sort: false };
type HasSort = { where: true; groupBy: true; having: true; sort: true };

interface QueryBuilder<T, S, ItemType> {
    where: S extends NoOps | HasWhere
        ? <K extends keyof T>(key: K, value: T[K]) => QueryBuilder<T, HasWhere, T>
        : never;

    groupBy: S extends HasWhere
        ? <K extends keyof T>(key: K) => QueryBuilder<T, HasGroupBy, Group<T, K>>
        : never;

    having: S extends HasGroupBy
        ? <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => QueryBuilder<T, HasHaving, Group<T, K>>
        : never;

    sort: S extends HasHaving
        ? <K extends keyof T>(key: K) => QueryBuilder<T, HasSort, ItemType>
        : never;

    execute: (data: T[]) => ItemType[];
}

function makeWhere<T>(key: keyof T, value: T[keyof T]): Transform<T> {
    return (data: T[]) => data.filter(item => item[key] === value);
}

function makeGroupBy<T, K extends keyof T>(key: K): (data: T[]) => Group<T, K>[] {
    return (data: T[]) => {
        const map = new Map<T[K], T[]>();
        for (const item of data) {
            const k = item[key];
            if (!map.has(k)) map.set(k, []);
            map.get(k)!.push(item);
        }
        return Array.from(map.entries()).map(([k, items]) => ({ key: k, items }));
    };
}

function makeHaving<T, K extends keyof T>(
    predicate: (group: Group<T, K>) => boolean
): GroupTransform<T, K> {
    return (groups: Group<T, K>[]) => groups.filter(predicate);
}

function makeSortGroup<T, K extends keyof T>(key: K): GroupTransform<T, K> {
    return (groups: Group<T, K>[]) =>
        [...groups].sort((a, b) => {
            const va = a.key;
            const vb = b.key;
            if (va < vb) return -1;
            if (va > vb) return 1;
            return 0;
        });
}

type StoredStep =
    | { kind: 'row'; fn: Transform<any> }
    | { kind: 'rowToGroup'; fn: (data: any[]) => any[] }
    | { kind: 'group'; fn: GroupTransform<any, any> };

export function query<T>(): QueryBuilder<T, NoOps, T> {
    const steps: StoredStep[] = [];

    const builder: any = {
        where<K extends keyof T>(key: K, value: T[K]) {
            steps.push({ kind: 'row', fn: makeWhere(key, value) });
            return builder;
        },

        groupBy<K extends keyof T>(key: K) {
            steps.push({ kind: 'rowToGroup', fn: makeGroupBy(key) });
            return builder;
        },

        having<K extends keyof T>(predicate: (group: Group<T, K>) => boolean) {
            steps.push({ kind: 'group', fn: makeHaving<T, K>(predicate) });
            return builder;
        },

        sort<K extends keyof T>(key: K) {
            steps.push({ kind: 'group', fn: makeSortGroup(key) });
            return builder;
        },

        execute(data: T[]): any[] {
            let result: any = data;
            for (const step of steps) {
                result = step.fn(result);
            }
            return result;
        },
    };

    return builder;
}

interface User {
    name: string;
    age: number;
    city: string;
    salary: number;
}

const users: User[] = [
    { name: 'Alice', age: 30, city: 'Moscow', salary: 100000 },
    { name: 'Charlie', age: 25, city: 'Moscow', salary: 80000 },
    { name: 'Bob', age: 35, city: 'SPb', salary: 120000 },
    { name: 'David', age: 28, city: 'SPb', salary: 90000 },
    { name: 'Frank', age: 32, city: 'Moscow', salary: 110000 },
];

const result1 = query<User>()
    .where('city', 'Moscow')
    .groupBy('city')
    .having(group => group.items.length > 0)
    .sort('city')
    .execute(users);

const result2 = query<User>()
    .where('age', 30)
    .execute(users);

const result3 = query<User>()
    .where('salary', 100000)
    .groupBy('city')
    .having(group => group.items.length >= 1)
    .execute(users);