import { registerFace } from './auth.service'

const AI_BASE_URL = import.meta.env.VITE_AI_SERVICE_BASE_URL || 'http://127.0.0.1:8000'

function dataUrlToBlob(dataUrl) {
  const [meta, b64] = dataUrl.split(',')
  const mimeMatch = meta.match(/data:(.*?);base64/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return new Blob([bytes], { type: mime })
}

async function requestAi(path, options = {}) {
  const response = await fetch(`${AI_BASE_URL}${path}`, options)
  const result = await response.json()

  if (!response.ok) {
    const message = result?.detail?.message || result?.detail || result?.message || 'Face API request failed'
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return result
}

export async function extractSingleFaceEmbedding(file) {
  const formData = new FormData()
  formData.append('image', file)

  const result = await requestAi('/face/embedding', {
    method: 'POST',
    body: formData,
  })

  if (!result?.success || result?.face_count !== 1) {
    throw new Error('Please provide an image with exactly one clear face')
  }

  const embedding = result.faces?.[0]?.embedding
  if (!Array.isArray(embedding) || embedding.length !== 128) {
    throw new Error('Invalid embedding returned by face service')
  }

  return embedding
}

export async function enrollFace({ images, studentId }) {
  if (!Array.isArray(images) || images.length !== 5) {
    throw new Error('Exactly 5 snapshots are required')
  }

  const formData = new FormData()
  if (studentId) {
    formData.append('student_id', studentId)
  }

  images.forEach((imageDataUrl, index) => {
    const blob = dataUrlToBlob(imageDataUrl)
    formData.append(`image${index + 1}`, blob, `snapshot_${index + 1}.jpg`)
  })

  const enrollment = await requestAi('/face/embedding/enroll-five-fields', {
    method: 'POST',
    body: formData,
  })

  const embedding = enrollment?.database_record?.embedding
  if (!Array.isArray(embedding) || embedding.length !== 128) {
    throw new Error('Enrollment API did not return a valid embedding')
  }

  await registerFace({
    embedding,
  })

  return {
    embedding,
    enrollment,
  }
}