const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&#038;": "&",
  "&#38;": "&",
  "&rsquo;": "'",
  "&#8217;": "'",
  "&lsquo;": "'",
  "&#8216;": "'",
  "&ldquo;": '"',
  "&#8220;": '"',
  "&rdquo;": '"',
  "&#8221;": '"',
  "&ndash;": "-",
  "&#8211;": "-",
  "&mdash;": "—",
  "&#8212;": "—",
  "&nbsp;": " ",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
  "&apos;": "'",
};

export function decodeEntities(text: string | undefined | null): string {
  if (!text) return "";

  let result = text;
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    result = result.split(entity).join(char);
  }

  result = result
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));

  return result;
}
