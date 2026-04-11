type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};

type PickedByType<T, U> = {
    [K in keyof T as T[K] extends U ? K : never]: T[K];
};
