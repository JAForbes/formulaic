export function sanitize(expr: string): string | undefined {
  return expr
    .match(
      /([A-Z](?:[1-9]0|[1-9]{1,2})?):([A-Z](?:[1-9]0|[1-9]{1,2})?)|([A-Z](?:[1-9]0|[1-9]{1,2})?)|[1-9]0|-?\d+\.\d+|-?\d+|\+|\*|\-|\/|\s|\,|\=|\<|\>|\w+\(|\(|\)/g,
    )
    ?.join("");
}

export function transform(expr: string): string {
  if (sanitize(expr) != expr) {
    throw new Error("Input was unsafe and should not be evaluated");
  }
  return expr.replaceAll(/([A-Z](?:[1-9]0|[1-9]{1,2})?):([A-Z](?:[1-9]0|[1-9]{1,2})?)/g, 'range("$1:$2")')
    .replaceAll(/(?<!:|")([A-Z]([1-9]{1,2}|[1-9]0))/g, 'addr("$1")')
    .replaceAll(/(\w+)\(/g, "fn.$1(");
}

export function dependencies(transformed: string) {
  const { range, addr } = [
    ...transformed.matchAll(
      /fn\.addr\("(?<addr>(?:[A-Z0-9:])+)"\)|fn.range\("(?<range>(?:[A-Z0-9:])+)"\)/g,
    ),
  ].reduce((p, n) => {
    return {
      range: p.range.concat(n?.groups?.range ?? []),
      addr: p.addr.concat(n?.groups?.addr ?? []),
    };
  }, { range: [] as string[], addr: [] as string[] });

  return { range, addr }
}

export function compile(expr: string) {
  const transformed = transform(expr)
  const deps = dependencies(transformed)

  const compiled = new Function(`return (fn) => ${transformed}`)()

  return { deps, compiled, transformed }
}

export function expandRange(range: string) {
  const match = range.match(/(?<colStart>[A-Z])(?<rowStart>[1-9]{1,2}|[1-9]0)?:(?<colEnd>[A-Z])(?<rowEnd>[1-9]{1,2}|[1-9]0)?/)

  const { colStart: colStartAlpha, rowStart: rowStartAlpha, colEnd: colEndAlpha, rowEnd: rowEndAlpha } = match?.groups as Record<string, string>

  let colStart =
    colStartAlpha?.charCodeAt(0)
  let rowStart = Number(rowStartAlpha ?? 1)
  let colEnd =
    colEndAlpha?.charCodeAt(0)
  let rowEnd =
    Number(rowEndAlpha ?? 99)

  void ([rowStart, rowEnd] = rowEnd < rowStart ? [rowEnd, rowStart] : [rowStart, rowEnd])
  void ([colStart, colEnd] = colEnd < colStart ? [colEnd, colStart] : [colStart, colEnd])

  const cells = []
  for (let col = colStart; col <= colEnd; col++) {
    for (let row = rowStart; row <= rowEnd; row++) {
      cells.push(`${String.fromCharCode(col)}${row}`)
    }
  }

  return { colStart: String.fromCharCode(colStart), rowStart, colEnd: String.fromCharCode(colEnd), rowEnd, cells }
}

export const col = (col: string, from: number, to: number) =>
  Array(to - from + 1)
    .fill(0)
    .map((_, i) => `${col}${from + i}`)
