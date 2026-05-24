/**
 * fal.ai nano-banana-2/edit 모델 호출 클라이언트
 * VITE_FAL_KEY 환경변수 필요.
 *
 * fal.run 동기 응답과 큐(비동기) 응답을 모두 처리한다.
 * 큐 응답(request_id)인 경우 완료될 때까지 폴링한다.
 */

const FAL_ENDPOINT = "https://fal.run/fal-ai/nano-banana-2/edit";
const FAL_QUEUE_BASE = "https://queue.fal.run/fal-ai/nano-banana-2";
const POLL_INTERVAL_MS = 1500;

export interface FalTransformResult {
  imageUrl: string;
}

type FalImageData = { url: string };

function pickImageUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  // 동기 응답 형태
  if (Array.isArray(o.images) && o.images.length > 0) return (o.images[0] as FalImageData).url ?? null;
  if (o.image && typeof (o.image as FalImageData).url === "string") return (o.image as FalImageData).url;
  // output 래핑
  if (o.output) return pickImageUrl(o.output);
  return null;
}

async function pollUntilDone(requestId: string, key: string): Promise<string> {
  const statusUrl = `${FAL_QUEUE_BASE}/requests/${requestId}/status`;
  const resultUrl = `${FAL_QUEUE_BASE}/requests/${requestId}`;

  while (true) {
    // sleep-first 제거: 완료 즉시 감지, 미완료일 때만 대기
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Key ${key}` },
    });
    if (!statusRes.ok) {
      throw new Error(`FAL_POLL_ERROR: ${statusRes.status}`);
    }
    const status = await statusRes.json() as { status: string };

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(resultUrl, {
        headers: { Authorization: `Key ${key}` },
      });
      if (!resultRes.ok) throw new Error(`FAL_RESULT_ERROR: ${resultRes.status}`);
      const data = await resultRes.json() as unknown;
      const url = pickImageUrl(data);
      if (!url) throw new Error(`FAL_NO_IMAGE_URL: ${JSON.stringify(data)}`);
      return url;
    }

    if (status.status === "FAILED") {
      throw new Error("FAL_JOB_FAILED");
    }
    // IN_QUEUE / IN_PROGRESS → 대기 후 재시도
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

export async function transformWithFal(params: {
  imageUrl: string;
  prompt: string;
}): Promise<FalTransformResult> {
  const key = import.meta.env.VITE_FAL_KEY;
  if (!key) throw new Error("FAL_KEY_MISSING: VITE_FAL_KEY 환경변수를 설정하세요.");

  const response = await fetch(FAL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${key}`,
    },
    body: JSON.stringify({
      image_urls: [params.imageUrl],
      prompt: params.prompt,
      num_images: 1,
      aspect_ratio: "auto",
      output_format: "png",
      safety_tolerance: "4",
      resolution: "1K",
      limit_generations: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "(no body)");
    throw new Error(`FAL_API_ERROR: ${response.status} ${errText}`);
  }

  const data = await response.json() as Record<string, unknown>;

  // 동기 응답: 이미지 URL 바로 있음
  const directUrl = pickImageUrl(data);
  if (directUrl) return { imageUrl: directUrl };

  // 큐 응답: request_id로 폴링
  const requestId = data.request_id as string | undefined;
  if (requestId) {
    const url = await pollUntilDone(requestId, key);
    return { imageUrl: url };
  }

  throw new Error(`FAL_UNEXPECTED_RESPONSE: ${JSON.stringify(data)}`);
}
