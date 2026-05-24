/**
 * 동물의 숲 스타일 이미지 변환 - fal.ai nanobanana2 사용.
 * VITE_FAL_KEY 미설정 시: 2.2초 지연 후 원본 이미지를 그대로 반환(mock).
 *
 * fal.ai는 공개 URL이 필요하므로, blob URL인 경우 Supabase storage에
 * 임시 업로드 후 공개 URL을 취득하여 전달한다.
 */

import { transformWithFal } from "./falClient";
import { getSupabase } from "./supabaseClient";

const AC_PROMPT =
  "입력된 인물 사진을 기반으로, 사진속 모든 인물들을 닌텐도 게임 '동물의 숲' 스타일의 캐릭터로 재해석하여 하나의 장면으로 생성해주세요.\n\n[캐릭터 변환 규칙]\n- 모든 인물은 동물의 숲 플레이어 캐릭터 스타일로 변환\n- 얼굴 비율은 크게, 눈은 둥글고 반짝이는 형태\n- 코와 입은 단순화하고 귀엽게 표현\n- 피부 질감은 매끈하고 플라스틱 같은 게임 그래픽 느낌\n- 머리 스타일과 얼굴 특징은 원본 인물의 특징을 유지\n- 의상은 원본을 참고하되 파스텔톤, 체크무늬, 니트 등 동물의 숲 감성으로 재해석\n\n[장면 연출]\n- 모든 캐릭터가 함께 교감하는 장면 (대화, 선물 주기, 산책 등)\n- 밝고 따뜻한 분위기\n- 자연광, 부드러운 그림자\n- 꽃, 나무, 울타리, 가로등 등 동물의 숲 특유의 마을 배경\n\n[배경 스타일]\n- 낮 시간대, 따뜻한 햇빛\n- 포화도 높은 파스텔 컬러\n- 꽃밭, 잔디, 나무, 목재 울타리 포함\n- 게임 속 렌더링처럼 깔끔한 3D 스타일\n\n[렌더링 스타일]\n- 닌텐도 스타일 3D 렌더\n- 부드러운 라이팅\n- 노이즈 없음\n- 귀엽고 따뜻한 감성 강조\n\n[카메라 구도]\n- 모든 캐릭터가 담기는 미디엄 샷\n- 약간 낮은 시점 또는 눈높이 시점\n- 모든 캐릭터의 표정이 잘 보이도록\n\n[감정 톤]\n- 행복함, 편안함, 친근함\n- 힐링 느낌";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** blob: URL → Supabase storage 임시 업로드 → 공개 URL 반환 */
async function uploadBlobForFal(blobUrl: string): Promise<string> {
  const blob = await fetch(blobUrl).then((r) => r.blob());
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  const path = `ac-inputs/${crypto.randomUUID()}.png`;
  const { error } = await supabase.storage
    .from("photos")
    .upload(path, blob, { contentType: "image/png", upsert: false });
  if (error) {
    throw new Error(`AC_UPLOAD_FAILED: ${error.message}`);
  }
  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * @param previewUrl 선택된 썸네일 (blob: 또는 https)
 * @returns 변환 결과 이미지 URL
 */
export async function transformAnimalCrossingImage(previewUrl: string): Promise<string> {
  if (!import.meta.env.VITE_FAL_KEY) {
    await sleep(2200);
    const blob = await fetch(previewUrl).then((r) => r.blob());
    return URL.createObjectURL(blob);
  }

  const publicUrl = previewUrl.startsWith("blob:")
    ? await uploadBlobForFal(previewUrl)
    : previewUrl;

  const result = await transformWithFal({
    imageUrl: publicUrl,
    prompt: AC_PROMPT,
  });

  return result.imageUrl;
}
