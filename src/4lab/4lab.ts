type Transform<T> = (data: T[]) => T;
type Where<T, K extends keyof T> = (key: K, value: T[K]) => Transform<T>;
type Sort<T> = <K extends keyof T>(key: k) => Transform<T>;
type Group<T, K extends keyof T> = { key: T[K], items: T[] }; 