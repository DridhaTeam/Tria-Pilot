import { createServiceClient } from '@/lib/auth'

export async function saveUpload(
  file: Buffer | string,
  path: string,
  bucket: string = 'uploads',
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    // Use service client to bypass RLS policies for server-side uploads
    const supabase = createServiceClient()

    // If file is base64 string, convert to buffer
    let fileBuffer: Buffer
    if (typeof file === 'string') {
      // Remove data URL prefix if present
      const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
      fileBuffer = Buffer.from(base64Data, 'base64')
    } else {
      fileBuffer = file
    }

    const { data, error } = await supabase.storage.from(bucket).upload(path, fileBuffer, {
      contentType,
      upsert: true,
    })

    if (error) {
      throw error
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Storage upload error:', error)
    throw error
  }
}

export async function getUploadUrl(path: string, bucket: string = 'uploads'): Promise<string> {
  try {
    // Use service client for server-side operations
    const supabase = createServiceClient()
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)

    return publicUrl
  } catch (error) {
    console.error('Get upload URL error:', error)
    throw error
  }
}

export async function deleteUpload(path: string, bucket: string = 'uploads'): Promise<void> {
  try {
    // Use service client for server-side operations
    const supabase = createServiceClient()
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Delete upload error:', error)
    throw error
  }
}

