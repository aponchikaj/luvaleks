import { supabase } from '@/lib/supabase'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

const COLUMNS = 'id, public_id, url, width, height, format, caption, taken_on, tags, place_id, uploaded_by, created_at'

export async function listPhotos() {
  const { data, error } = await supabase
    .from('photos')
    .select(COLUMNS)
    .order('taken_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Uploads to Cloudinary, then records it in Supabase. Rolls back the asset if the insert fails. */
export async function createPhoto(file, { caption = '', takenOn = null, tags = [], placeId = null } = {}, onProgress) {
  const asset = await uploadImage(file, onProgress)
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('photos')
    .insert({
      public_id: asset.public_id,
      url: asset.secure_url,
      width: asset.width,
      height: asset.height,
      format: asset.format,
      caption: caption.trim() || null,
      taken_on: takenOn || null,
      tags,
      place_id: placeId || null,
      uploaded_by: user?.id ?? null,
    })
    .select(COLUMNS)
    .single()

  if (error) {
    await deleteImage(asset.public_id).catch(() => {})
    throw error
  }
  return data
}

export async function updatePhoto(id, patch) {
  const { data, error } = await supabase
    .from('photos')
    .update(patch)
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data
}

/** Deletes the row first (source of truth), then the Cloudinary asset. */
export async function removePhoto(photo) {
  const { error } = await supabase.from('photos').delete().eq('id', photo.id)
  if (error) throw error
  await deleteImage(photo.public_id).catch((e) => console.warn('Cloudinary delete failed', e))
}
