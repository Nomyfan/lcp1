export const ChromeStackReg =
  /at(\s(?<func>[^\s]+))?(\s(?<file>[^\s]+)):(?<line>\d+):(?<col>\d+)/;

export const FfStackReg =
  /((?<func>[^\s]+)@)?(?<file>[^\s]+):(?<line>\d+):(?<col>\d+)/;

export const MsgReg = /([^\s]+:\s)(?<msg>.+)/;

export type StackItem = {
  line: number;
  column: number;
  filename: string;
};

export interface ErrorMessage {
  message: string;
  stack: Array<StackItem>;
}

/**
 * 是否为Chrome的栈信息
 * @param stackLine
 * @returns
 */
export function isChormeStack(stackLine: string): boolean {
  return /^\s*at\s/.test(stackLine);
}

/**
 * 是否为FireFox的栈信息
 * @param stackLine
 * @returns
 */
export function isFireFoxStack(stackLine: string): boolean {
  return !isChormeStack(stackLine);
}

function parseInternal(
  rawStack: string[],
  toStackItem: (raw: string) => StackItem | null,
): StackItem[] {
  const stack: StackItem[] = [];
  for (const raw of rawStack) {
    const item = toStackItem(raw);
    if (item !== null && item.filename !== "<anonymous>") {
      stack.push(item);
    }
  }

  return stack;
}

function regMapper(reg: RegExp): (raw: string) => StackItem | null {
  return (raw: string) => {
    const match = raw.match(reg);
    if (match && match.groups) {
      const { file, line, col } = match.groups;
      return {
        filename: file,
        line: parseInt(line),
        column: parseInt(col),
      };
    }

    return null;
  };
}

function parseChrome(stack: string[]): StackItem[] {
  return parseInternal(stack, regMapper(ChromeStackReg));
}

function parseFireFox(stack: string[]): StackItem[] {
  return parseInternal(stack, regMapper(FfStackReg));
}

function parseErrorMessage(msg: string): string {
  const match = msg.match(MsgReg);
  if (!match || !match.groups) {
    return "";
  }

  return match.groups["msg"];
}

export function parse(stackStr: string): ErrorMessage | null {
  const [error, ...rawStack] = stackStr.split("\n");
  if (!rawStack.length) {
    return null;
  }

  const message = parseErrorMessage(error);

  const isChrome = isChormeStack(rawStack[0]);
  const stack = isChrome ? parseChrome(rawStack) : parseFireFox(rawStack);

  return {
    message,
    stack,
  };
}
