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

  // Some WordPress data ends up double- (or triple-) encoded, e.g.
  // "&amp;amp;" for a literal "&". Keep decoding until a pass makes no
  // further change, so any depth of encoding gets fully unwrapped.
  for (let pass = 0; pass < 5; pass++) {
    let next = result;

    for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
      next = next.split(entity).join(char);
    }

    next = next
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));

    if (next === result) break;
    result = next;
  }

  return result;
}
