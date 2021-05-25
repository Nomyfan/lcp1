import { isChormeStack, isFireFoxStack, parse, StackItem } from "../parser";

describe("Stack parser", () => {
  it("should be Chrome stack", () => {
    const chrome = [
      "at bar http://192.168.31.8:8000/c.js:2:9",
      "at <anonymous>:1:11",
      "at http://192.168.31.8:8000/a.js:22:3",
    ];

    for (const stack of chrome) {
      expect(isChormeStack(stack)).toBe(true);
      expect(isFireFoxStack(stack)).toBe(false);
    }
  });

  it("shoule not be Chrome stack", () => {
    const ff = [
      "bar@http://192.168.31.8:8000/c.js:2:9",
      "<anonymous>:1:11",
      "http://192.168.31.8:8000/a.js:22:3",
    ];

    for (const stack of ff) {
      expect(isChormeStack(stack)).toBe(false);
      expect(isFireFoxStack(stack)).toBe(true);
    }
  });

  it("should parse Chrome stack", () => {
    const fixtureStack = `TypeError: Error raised
    at bar http://192.168.31.8:8000/c.js:2:9
    at foo http://192.168.31.8:8000/b.js:4:15
    at calc http://192.168.31.8:8000/a.js:4:3
    at <anonymous>:1:11
    at http://192.168.31.8:8000/a.js:22:3
  `;

    const err = parse(fixtureStack);
    expect(err !== null).toBe(true);
    expect(err?.message).toBe("Error raised");
    expect(err?.stack.length).toBe(4);

    const expectedStack: StackItem[] = [
      { line: 2, column: 9, filename: "http://192.168.31.8:8000/c.js" },
      { line: 4, column: 15, filename: "http://192.168.31.8:8000/b.js" },
      { line: 4, column: 3, filename: "http://192.168.31.8:8000/a.js" },
      { line: 22, column: 3, filename: "http://192.168.31.8:8000/a.js" },
    ];

    expect(err?.stack).toMatchObject(expectedStack);
  });

  it("should parse FireFox stack", () => {
    const fixtureFirefoxStack = `
  bar@http://192.168.31.8:8000/c.js:2:9
  foo@http://192.168.31.8:8000/b.js:4:15
  calc@http://192.168.31.8:8000/a.js:4:3
  <anonymous>:1:11
  http://192.168.31.8:8000/a.js:22:3
`;

    const err = parse(fixtureFirefoxStack);
    expect(err !== null).toBe(true);
    expect(err?.message).toBe("");
    expect(err?.stack.length).toBe(4);

    const expectedStack: StackItem[] = [
      { line: 2, column: 9, filename: "http://192.168.31.8:8000/c.js" },
      { line: 4, column: 15, filename: "http://192.168.31.8:8000/b.js" },
      { line: 4, column: 3, filename: "http://192.168.31.8:8000/a.js" },
      { line: 22, column: 3, filename: "http://192.168.31.8:8000/a.js" },
    ];

    expect(err?.stack).toMatchObject(expectedStack);
  });

  it("shoule not be valid stack", () => {
    const stack = "";

    const err = parse(stack);
    expect(err).toBeNull();
  });
});
