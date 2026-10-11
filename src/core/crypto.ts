/**
 * Cryptographic helpers for verifiable agreement fingerprints and deliverable integrity.
 * Fairwork differentiator: Clear tamper-evidence and reproducible hashing.
 */

import { AgreementStructuredTerms, FileReference } from '../types/fairwork';

/**
 * SHA-256 calculation using Web Crypto API.
 */
export async function sha256(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Deterministic fallback for environments without crypto.subtle
  return simpleSha256Fallback(text);
}

/**
 * Synchronous simple hash for instant UI display or test environments.
 */
export function simpleSha256Fallback(str: string): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x597f2e1b;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 0x01000193);
    hash2 = Math.imul(hash2 ^ ch, 0x01000197);
  }
  const part1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((hash1 ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((hash1 + hash2) >>> 0).toString(16).padStart(8, '0');
  return `sim_sha256_${part1}${part2}${part3}${part4}`;
}

/**
 * Generates canonical string representation for an Agreement version.
 */
export function canonicalizeAgreement(terms: AgreementStructuredTerms, version: number): string {
  const sortedClauses = terms.customClauses
    ? [...terms.customClauses].sort((a, b) => a.title.localeCompare(b.title))
    : [];

  return JSON.stringify({
    version,
    scopeSummary: terms.scopeSummary.trim(),
    deliverablesSummary: terms.deliverablesSummary.trim(),
    ipClause: terms.intellectualPropertyClause,
    confidentiality: terms.confidentiality,
    governingLaw: terms.governingLaw ?? '',
    customClauses: sortedClauses,
  });
}

/**
 * Computes deterministic agreement fingerprint.
 */
export async function computeAgreementHash(terms: AgreementStructuredTerms, version: number): Promise<string> {
  const canonical = canonicalizeAgreement(terms, version);
  return sha256(canonical);
}

/**
 * Computes deliverable integrity hash.
 */
export async function computeDeliveryHash(
  notes: string,
  files: FileReference[],
  externalUrl?: string
): Promise<string> {
  const fileSignatures = files.map(f => `${f.name}:${f.sha256Hash}:${f.sizeBytes}`).sort().join(';');
  const payload = `NOTES:${notes.trim()}|FILES:${fileSignatures}|URL:${externalUrl ?? ''}`;
  return sha256(payload);
}
