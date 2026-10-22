import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Window } from '@/components/ui/Window'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { Loading, ErrorState, Empty } from '@/components/ui/States'
import { usePhotosStore } from '@/stores/photosStore'
import { usePlacesStore } from '@/stores/collections'
import { cldUrl } from '@/lib/cloudinary'
import { errorMessage } from '@/lib/errors'
import { LIMITS } from '@/config/site'

function PlaceSelect({ value, onChange }) {
  const { items, fetch } = usePlacesStore()
  useEffect(() => {
    fetch()
  }, [fetch])
  return (
    <Select value={value ?? ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
      <option value="">no place</option>
      {items.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </Select>
  )
}

const parseTags = (s) => [...new Set(s.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))]

function UploadForm() {
  const upload = usePhotosStore((s) => s.upload)
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [takenOn, setTakenOn] = useState('')
  const [tags, setTags] = useState('')
  const [placeId, setPlaceId] = useState(null)
  const [progress, setProgress] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    if (!files.length) return
    let done = 0
    for (const file of files) {
      try {
        await upload(file, { caption, takenOn, tags: parseTags(tags), placeId }, (p) =>
          setProgress(`${done + 1}/${files.length} · ${p}%`),
        )
        done++
      } catch (err) {
        toast.error(`${file.name}: ${errorMessage(err)}`)
      }
    }
    setProgress(null)
    if (done) toast.success(`Uploaded ${done} photo${done > 1 ? 's' : ''}`)
    setFiles([])
    setCaption('')
    e.target.reset()
  }

  return (
    <Window title="Upload">
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Field label="Photos" hint={`Max ${LIMITS.maxUploadMB} MB each`}>
          <Input type="file" accept="image/*" multiple required onChange={(e) => setFiles([...e.target.files])} />
        </Field>
        <Field label="Caption">
          <Input maxLength={LIMITS.captionLength} value={caption} onChange={(e) => setCaption(e.target.value)} />
        </Field>
        <Field label="Taken on">
          <Input type="date" value={takenOn} onChange={(e) => setTakenOn(e.target.value)} />
        </Field>
        <Field label="Tags" hint="comma separated, e.g. date night, tbilisi">
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </Field>
        <Field label="Place" hint="shows these photos on the map pin">
          <PlaceSelect value={placeId} onChange={setPlaceId} />
        </Field>
        <div className="md:col-span-2">
          <Button type="submit" disabled={!files.length || progress !== null}>
            {progress ? `uploading ${progress}` : `upload ${files.length || ''}`}
          </Button>
        </div>
      </form>
    </Window>
  )
}

function PhotoRow({ photo }) {
  const { update, remove } = usePhotosStore()
  const [caption, setCaption] = useState(photo.caption ?? '')
  const [takenOn, setTakenOn] = useState(photo.taken_on ?? '')
  const [placeId, setPlaceId] = useState(photo.place_id ?? null)
  const dirty =
    caption !== (photo.caption ?? '') || takenOn !== (photo.taken_on ?? '') || placeId !== (photo.place_id ?? null)

  const save = () =>
    update(photo.id, { caption: caption.trim() || null, taken_on: takenOn || null, place_id: placeId })
      .then(() => toast.success('Saved'))
      .catch((e) => toast.error(errorMessage(e)))

  const del = () => {
    if (!window.confirm('Delete this photo forever?')) return
    remove(photo).catch((e) => toast.error(errorMessage(e)))
  }

  return (
    <li className="flex gap-3 border-b border-chrome py-3 last:border-0">
      <img src={cldUrl(photo.public_id, 'w_160,h_160,c_fill')} alt="" className="size-20 border border-black/10 object-cover" />
      <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_auto]">
        <Input value={caption} maxLength={LIMITS.captionLength} placeholder="caption" onChange={(e) => setCaption(e.target.value)} />
        <Input type="date" value={takenOn} onChange={(e) => setTakenOn(e.target.value)} />
        <PlaceSelect value={placeId} onChange={setPlaceId} />
        <p className="self-center text-[10px] text-chrome-dark">{photo.tags.join(', ')}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" disabled={!dirty} onClick={save}>save</Button>
        <Button variant="danger" onClick={del}>delete</Button>
      </div>
    </li>
  )
}

export default function PhotosAdmin() {
  const { photos, loading, error, fetch } = usePhotosStore()
  useEffect(() => {
    fetch()
  }, [fetch])

  return (
    <div className="space-y-6">
      <UploadForm />
      <Window title={`Library — ${photos.length}`}>
        {loading && !photos.length ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} onRetry={() => fetch({ force: true })} />
        ) : !photos.length ? (
          <Empty>Upload your first photo above.</Empty>
        ) : (
          <ul>{photos.map((p) => <PhotoRow key={p.id} photo={p} />)}</ul>
        )}
      </Window>
    </div>
  )
}
