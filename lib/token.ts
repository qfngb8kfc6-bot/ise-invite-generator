export function decodeExhibitorToken(
  token: string
): { exhibitorId: string } | null {
  try {
    const json = atob(token);
    const parsed = JSON.parse(json);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.exhibitorId === "string" &&
      parsed.exhibitorId.trim().length > 0
    ) {
      return { exhibitorId: parsed.exhibitorId };
    }

    return null;
  } catch {
    return null;
  }
}

export function encodeExhibitorToken(exhibitorId: string) {
  return btoa(JSON.stringify({ exhibitorId }));
}