// MOCK — no Python service or Node route exists yet.
// Replace this function body once the enrollment endpoint contract is defined.
// Expected real shape: POST /api/face/enroll { images: [dataUrl] } -> { embeddingCount }
export async function enrollFace(images) {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  console.log(`[mock] would send ${images.length} frames for embedding`)
  return { embeddingCount: images.length }
}