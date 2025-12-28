export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function resolveUuidFromUsername(username: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.id ? formatUUID(data.id) : null;
  } catch (error) {
    return null;
  }
}

function formatUUID(uuid: string): string {
  if (uuid.includes('-')) {
    return uuid;
  }
  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
}

