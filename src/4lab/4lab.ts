type Transform<T> = (data: T[]) => T;
type Where<T, K extends keyof T> = (key: K, value: T[K]) => Transform<T>;
type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;
type Group<T, K extends keyof T> = { key: T[K], items: T[] };
type GroupBy<T> = <K extends keyof T>(key: K) => Transform<Group<T, K>>;
type GroupTransform<T, K extends keyof T> = (groups: Group<T, K>[]) => Group<T, K>[];
type Having<T> = <T, K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => GroupTransform<T, K>;

type Step<T> = Transform<T> | GroupTransform<T, any>;