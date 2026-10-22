import { supabase } from './supabase'
import { LIMITS } from '@/config/site'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || 'luvaleks'

async function callFunction(body) {
  const { data, error } = await supabase.functions.invoke('cloudinary', { body })
  if (error) throw error
  return data
}

/**
 * Uploads a file to Cloudinary using a signature from the `cloudinary` edge function.
 * @param {File} file
 * @param {(percent: number) => void} [onProgress]
 */
export async function uploadImage(file, onProgress) {
  if (!file.type.startsWith('image/')) throw new Error('Only images can be uploaded')
  if (file.size > LIMITS.maxUploadMB * 1024 * 1024) {
    throw new Error(`Image is larger than ${LIMITS.maxUploadMB} MB`)
  }

  const { signature, timestamp, apiKey, cloudName, folder } = await callFunction({
    action: 'sign',
    folder: FOLDER,
  })

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', timestamp)
  form.append('signature', signature)
  form.append('folder', folder)

  // XHR instead of fetch so we get upload progress.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText || '{}')
      if (xhr.status >= 200 && xhr.status < 300) resolve(res)
      else reject(new Error(res.error?.message || 'Upload failed'))
    }
    xhr.onerror = () => reject(new Error('Network error while uploading'))
    xhr.send(form)
  })
}

export function deleteImage(publicId) {
  return callFunction({ action: 'delete', publicId })
}

/**
 * Builds a transformed delivery URL, e.g. cldUrl(id, 'w_600,c_limit').
 * f_auto,q_auto are always applied for smaller, modern formats.
 */
export function cldUrl(publicId, transform = '') {
  const t = ['f_auto,q_auto', transform].filter(Boolean).join('/')
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t}/${publicId}`
}
