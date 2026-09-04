/**
 * NON-CRYPTOGRAPHIC hash for the MOCK backend ONLY.
 * The spec forbids storing plaintext passwords; this keeps the mock honest
 * (we never persist the raw password). A real Supabase deployment performs
 * proper password hashing server-side — this is never shipped to production.
 */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode('beubaba-mock-salt::' + password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash
}
