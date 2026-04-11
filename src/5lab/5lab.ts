export type Transform<T> = (data: T[]) => T[];
export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;
export type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;
export type Group<T, K extends keyof T> = { key: T[K], items: T[] };
export type GroupBy<T> = <K extends keyof T>(key: K) => Transform<Group<T, K>>;
export type GroupTransform<T, K extends keyof T> = (groups: Group<T, K>[]) => Group<T, K>[];
export type Having<T> = <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => GroupTransform<T, K>;

type Initial = 'initial';
type HasWhere = 'hasWhere';
type HasGroupBy = 'hasGroupBy';
type HasHaving = 'hasHaving';

interface QueryBuilder<T, State> {
    steps: any[];
    _state: State;
}

function query<T>(
    op1: Transform<T>,
    ...rest: any[]
): QueryBuilder<T, HasWhere>;

function query<T>(
    op1: Transform<T>,
    op2: Transform<T> | GroupBy<T>,
    ...rest: any[]
): QueryBuilder<T, HasWhere | HasGroupBy>;

function query<T>(
    op1: GroupBy<T>,
    op2: GroupTransform<T, any> | Transform<T>,
    ...rest: any[]
): QueryBuilder<T, HasGroupBy | HasHaving>;

function query<T>(
    op1: GroupTransform<T, any>,
    op2: Transform<T>,
    ...rest: any[]
): QueryBuilder<T, HasHaving>;

export function query<T>(...steps: any[]): Transform<T> {
    return (data: T[]) => {
        let result: any = data;
        
        for (const step of steps) {
            if (typeof step === 'function') {
                result = step(result);
            }
        }
        
        return result as T[];
    };
}

