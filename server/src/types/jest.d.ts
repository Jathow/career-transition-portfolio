/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toContain(expected: any): R;
      toMatch(expected: string | RegExp): R;
      toThrow(expected?: string | RegExp | Error): R;
    }
  }
}

export {};