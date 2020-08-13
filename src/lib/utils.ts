export function formatDateYMDHS(date: Date): string {
  const yyyy = date.getFullYear().toString();
  const MM = pad(date.getMonth() + 1, 2);
  const dd = pad(date.getDate(), 2);
  const hh = pad(date.getHours(), 2);
  const mm = pad(date.getMinutes(), 2);
  const ss = pad(date.getSeconds(), 2);

  return yyyy + MM + dd + hh + mm + ss;
}

export function pad(arg: any, length: number, symbol = "0", side = "left"): string {
  let str = "" + arg;
  while (str.length < length) {
    side === "left" ? str = symbol + str : str = str + symbol
  }

  return str;
}
