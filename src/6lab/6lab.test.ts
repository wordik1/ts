import { describe, it } from "vitest";
import { expectTypeOf } from "expect-type";
import type { DeepReadonly, PickedByType, EventHandlers } from "./6lab";

describe("DeepReadonly", () => {
  it("делает все вложенные свойства readonly", () => {
    interface Nested {
      a: number;
      b: {
        c: string;
        d: {
          e: boolean;
        };
      };
    }

    expectTypeOf<DeepReadonly<Nested>>().toEqualTypeOf<{
      readonly a: number;
      readonly b: {
        readonly c: string;
        readonly d: {
          readonly e: boolean;
        };
      };
    }>();
  });
});

describe("PickedByType", () => {
  interface User {
    name: string;
    age: number;
    active: boolean;
    email: string;
  }

  it("выбирает поля типа string", () => {
    expectTypeOf<PickedByType<User, string>>().toEqualTypeOf<{
      name: string;
      email: string;
    }>();
  });

  it("выбирает поля типа number", () => {
    expectTypeOf<PickedByType<User, number>>().toEqualTypeOf<{
      age: number;
    }>();
  });

  it("выбирает поля типа boolean", () => {
    expectTypeOf<PickedByType<User, boolean>>().toEqualTypeOf<{
      active: boolean;
    }>();
  });
});

describe("EventHandlers", () => {
  it("генерирует обработчики", () => {
    interface Events {
      click: MouseEvent;
      keydown: KeyboardEvent;
      resize: UIEvent;
    }

    expectTypeOf<EventHandlers<Events>>().toEqualTypeOf<{
      onClick: (event: MouseEvent) => void;
      onKeydown: (event: KeyboardEvent) => void;
      onResize: (event: UIEvent) => void;
    }>();
  });
});
