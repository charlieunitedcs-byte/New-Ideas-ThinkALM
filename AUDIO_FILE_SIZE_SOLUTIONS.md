# Audio File Size Solutions

## The Problem

Vercel serverless functions have a **4.5MB payload limit**. When audio files are converted to base64:
- File size increases by ~33%
- A 3MB audio file becomes 4MB+ in base64
- This exceeds the serverless function limit
- Result: "Request Entity Too Large" error

## Current Quick Fix (Implemented)

✅ **File size limit of 3MB**
- Frontend validates file size before upload
- Shows clear error message if too large
- Suggests using transcript instead
- **This prevents the error but limits functionality**

---

## Permanent Solutions (Choose One)

### Option 1: File Storage + URL Passing (RECOMMENDED)
**Best for production, most reliable**

#### How it works:
1. User uploads audio to **Supabase Storage** (or AWS S3)
2. Get back a temporary URL
3. Pass URL to backend API (not the file itself)
4. Backend downloads audio from URL and sends to Gemini
5. Delete temporary file after analysis

#### Pros:
- ✅ No file size limits (can handle 100MB+ files)
- ✅ Faster uploads (direct to CDN)
- ✅ More reliable
- ✅ Can save audio files for later review

#### Cons:
- Requires Supabase setup
- Slightly more complex

#### Implementation:
```typescript
// 1. Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('call-recordings')
  .upload(`temp/${Date.now()}.mp3`, audioFile);

// 2. Get public URL (with expiration)
const { data: { publicUrl } } = supabase.storage
  .from('call-recordings')
  .createSignedUrl(filePath, 3600); // 1 hour expiry

// 3. Send URL to backend
const response = await fetch('/api/analyze-call', {
  method: 'POST',
  body: JSON.stringify({ audioUrl: publicUrl })
});

// 4. Backend fetches and analyzes
const audioResponse = await fetch(audioUrl);
const audioBuffer = await audioResponse.arrayBuffer();
const base64Audio = Buffer.from(audioBuffer).toString('base64');
// Send to Gemini
```

**Cost**: FREE for Supabase (1GB storage included)

---

### Option 2: Direct Gemini Upload (Files API)
**Simplest but requires newer Gemini API**

#### How it works:
1. Upload audio directly to Gemini's File API
2. Get back a file URI
3. Use that URI in analysis request
4. Gemini handles the file storage

#### Pros:
- ✅ No extra infrastructure needed
- ✅ No file size conversion
- ✅ Simple implementation

#### Cons:
- May require different Gemini API endpoint
- Files are stored on Google's servers temporarily

#### Implementation:
```typescript
// Upload to Gemini File API
const uploadResponse = await fetch(
  `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
  {
    method: 'POST',
    body: audioFile,
    headers: { 'Content-Type': audioFile.type }
  }
);
const { file } = await uploadResponse.json();

// Use file URI in analysis
const analysisResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Analyze this call..." },
          { fileData: { fileUri: file.uri, mimeType: file.mimeType } }
        ]
      }]
    })
  }
);
```

---

### Option 3: Multipart Upload with Streaming
**Technical solution, avoids base64**

#### How it works:
1. Send audio as `multipart/form-data` (not JSON)
2. Backend streams file without loading into memory
3. Convert to base64 in chunks
4. Send to Gemini

#### Pros:
- ✅ No base64 overhead in transit
- ✅ Can handle slightly larger files (~5-6MB)

#### Cons:
- Still limited by Vercel function limits
- More complex code
- Doesn't fully solve the problem

---

### Option 4: Audio Compression
**Reduce file size before upload**

#### How it works:
1. Compress audio in browser before upload
2. Convert to lower bitrate (e.g., 64kbps)
3. Reduce quality but keep speech intelligible

#### Pros:
- ✅ No infrastructure changes
- ✅ Works with current setup

#### Cons:
- Quality loss
- Still has limits
- Browser compression is slow

---

## Recommendation

**For MVP/Testing:**
- Keep current 3MB limit ✅ (Already implemented)
- Most sales calls under 5 minutes are <3MB
- Show helpful error message

**For Production:**
- Use **Option 1: Supabase Storage** 🏆
- It's free, scalable, and future-proof
- Takes ~30 minutes to implement
- Enables other features (saving recordings, playback)

**Quick Win:**
- Use **Option 2: Gemini File API** if available
- No extra infrastructure
- Just API changes

---

## Implementation Priority

1. **NOW** ✅: File size validation (done)
2. **Next Week**: Add Supabase Storage for audio files
3. **Future**: Save analyzed calls to database with audio playback

---

## Testing

With current 3MB limit, you can handle:
- ✅ MP3 at 128kbps: ~3 minutes of audio
- ✅ MP3 at 64kbps: ~6 minutes of audio
- ✅ Most sales discovery calls (2-5 minutes)

**For longer calls:** Users should paste the transcript instead.
