export type Transform<T> = (data: T[]) => T[];
export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;
export type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;
export type Group<T, K extends keyof T> = { key: T[K], items: T[] };
export type GroupBy<T> = <K extends keyof T>(key: K) => Transform<Group<T, K>>;
export type GroupTransform<T, K extends keyof T> = (groups: Group<T, K>[]) => Group<T, K>[];
export type Having<T> = <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => GroupTransform<T, K>;

type Step<T> = Transform<T> | GroupTransform<T, any>;
export function query<T>(...steps: Step<T>[]): Transform<T>{
    return(data: T[]) => {
        let result: any = data;

        for (const step of steps){
            result = step(result);
        }

        return result as T[];
    };
}