import { supabase, isSupabaseConfigured } from './supabase';
import { FileReference } from '../types/fairwork';

export interface UploadOptions {
  bucket: 'deliverables' | 'evidence';
  projectId: string;
  milestoneId: string;
  file: File;
}

export const storageService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  /**
   * Upload file to private access-controlled bucket.
   * If real Supabase is unconfigured, computes client SHA-256 and creates simulated secure reference.
   */
  async uploadPrivateFile(options: UploadOptions): Promise<{ fileRef: FileReference | null; error?: string }> {
    const { bucket, projectId, milestoneId, file } = options;

    // Compute browser SHA-256 hash
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256Hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    if (!isSupabaseConfigured || !supabase) {
      // Local simulated secure storage
      const fileRef: FileReference = {
        name: file.name,
        url: `https://storage.fairwork.sim/${bucket}/${projectId}/${milestoneId}/${encodeURIComponent(file.name)}`,
        sizeBytes: file.size,
        mimeType: file.type || 'application/octet-stream',
        sha256Hash,
        isSimulated: true,
      };
      return { fileRef };
    }

    try {
      const storagePath = `${projectId}/${milestoneId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from(bucket).upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) return { fileRef: null, error: error.message };

      // Return private storage path reference
      const fileRef: FileReference = {
        name: file.name,
        url: data.path, // Private relative path in bucket
        sizeBytes: file.size,
        mimeType: file.type || 'application/octet-stream',
        sha256Hash,
        isSimulated: false,
      };

      return { fileRef };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Storage upload exception';
      return { fileRef: null, error: msg };
    }
  },

  /**
   * Generate short-lived signed URL (e.g. 15 minutes) for authorized viewing
   */
  async getSignedUrl(bucket: 'deliverables' | 'evidence', storagePath: string, expiresInSeconds: number = 900): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      return `https://storage.fairwork.sim/${bucket}/${storagePath}`;
    }

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, expiresInSeconds);
    if (error || !data) {
      throw new Error(error?.message || 'Failed to create signed access URL');
    }

    return data.signedUrl;
  },
};
