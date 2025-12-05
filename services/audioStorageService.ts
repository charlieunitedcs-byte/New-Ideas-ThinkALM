import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Upload audio file to Supabase Storage and return a temporary signed URL
 * Falls back to base64 conversion if Supabase is not configured
 */
export const uploadAudioFile = async (file: File): Promise<{ url?: string; base64?: string; mimeType: string }> => {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, falling back to base64 upload');

    // Fallback: Convert to base64 (old method with size limits)
    const base64 = await fileToBase64(file);
    return {
      base64: base64,
      mimeType: file.type
    };
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop();
    const fileName = `temp/${timestamp}-${randomId}.${fileExt}`;

    console.log('📤 Uploading audio to Supabase Storage...');

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('CALL_RECORDINGS')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('✅ Audio uploaded to Supabase:', uploadData.path);

    // Create a signed URL that expires in 1 hour
    const { data: urlData, error: urlError } = await supabase.storage
      .from('CALL_RECORDINGS')
      .createSignedUrl(uploadData.path, 3600); // 1 hour expiry

    if (urlError) {
      console.error('Supabase URL error:', urlError);
      throw new Error(`Failed to create signed URL: ${urlError.message}`);
    }

    console.log('✅ Got signed URL from Supabase');

    return {
      url: urlData.signedUrl,
      mimeType: file.type
    };

  } catch (error: any) {
    console.error('Audio upload error:', error);

    // If upload fails, fall back to base64 (with size limit warning)
    console.warn('Falling back to base64 due to upload error');
    const base64 = await fileToBase64(file);
    return {
      base64: base64,
      mimeType: file.type
    };
  }
};

/**
 * Delete temporary audio file from Supabase Storage
 */
export const deleteAudioFile = async (url: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  try {
    // Extract file path from signed URL
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/CALL_RECORDINGS\/(.+)\?/);

    if (!pathMatch) return;

    const filePath = pathMatch[1];

    const { error } = await supabase.storage
      .from('CALL_RECORDINGS')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting temp audio file:', error);
    } else {
      console.log('🗑️ Deleted temp audio file from Supabase');
    }
  } catch (error) {
    console.error('Error in deleteAudioFile:', error);
  }
};

// Helper function to convert File to base64 (fallback)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = error => reject(error);
  });
};
