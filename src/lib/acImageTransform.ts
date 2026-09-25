/**
 * 동물의 숲 스타일 이미지 변환 - fal.ai nanobanana2 사용.
 * VITE_FAL_KEY 미설정 시: 2.2초 지연 후 원본 이미지를 그대로 반환(mock).
 *
 * fal.ai는 공개 URL이 필요하므로, blob URL인 경우 Supabase storage에
 * 임시 업로드 후 공개 URL을 취득하여 전달한다.
 */

import { transformWithFal } from "./falClient";
import { getSupabase } from "./supabaseClient";

const CHIIKAWA_PROMPT = `입력된 인물 사진을 기반으로, 일본 캐릭터 작품 「먼작귀(치이카와)」 스타일의 작고 귀여운 캐릭터로 재해석하여 하나의 따뜻한 장면으로 생성해주세요.

[캐릭터 변환 규칙]

- 입력된 인물들을 먼작귀(치이카와) 세계관에 등장할 것 같은 작고 둥근 SD 캐릭터 스타일로 변환
- 전체적인 신체 비율은 머리가 크고 몸이 매우 작은 약 1.5~2등신 비율
- 얼굴은 크고 둥글며 볼 부분이 통통하고 부드러운 형태
- 눈은 작고 둥근 검은색 점 형태를 기본으로 하되, 감정이 잘 전달되도록 표현
- 코는 거의 생략하거나 아주 작은 점 형태로 단순화
- 입은 작은 곡선이나 단순한 선으로 표현하여 귀여운 인상을 강조
- 손과 발은 매우 짧고 둥글며 단순한 형태
- 전체 실루엣은 동글동글하고 말랑한 봉제인형처럼 표현
- 원본 인물의 헤어스타일, 앞머리, 머리색, 안경이나 액세서리 등 핵심적인 외형 특징은 알아볼 수 있도록 유지
- 실제 사람의 얼굴을 그대로 축소하기보다는, 원본 인물을 먼작귀 세계관의 캐릭터로 재해석한 느낌
- 두 인물이 서로 구분될 수 있도록 각각의 헤어스타일, 의상 색상, 액세서리 특징을 유지
- 의상은 원본 사진을 참고하되 단순화하여 귀여운 캐릭터 의상으로 재해석
- 파스텔 컬러의 니트, 작은 가방, 모자, 머플러 등 아기자기한 요소를 자연스럽게 활용

[장면 연출]

- 두 캐릭터가 서로 친근하게 교감하고 있는 순간
- 나란히 걷기, 작은 선물 건네기, 간식 나눠 먹기, 꽃 구경하기 등 소소한 일상의 한 장면
- 두 캐릭터의 관계가 친밀하고 편안하게 느껴지는 자연스러운 포즈
- 과장된 액션보다 작고 귀여운 몸짓과 표정 중심
- 소소하지만 행복한 일상의 순간처럼 연출
- 캐릭터 주변에 작은 꽃, 풀잎, 나비, 간식, 작은 소품 등을 배치

[배경 스타일]

- 따뜻하고 평화로운 낮 시간대
- 크림색, 연노랑, 연분홍, 연두색, 하늘색 등 부드러운 파스텔 컬러 팔레트
- 작은 꽃밭, 풀밭, 낮은 언덕, 작은 나무와 덤불이 있는 아기자기한 자연 배경
- 배경 요소는 지나치게 사실적으로 표현하지 않고 단순하고 귀여운 형태로 표현
- 넓은 여백과 단순한 구성을 활용하여 캐릭터가 가장 돋보이도록 구성
- 동화책의 한 페이지 같은 평화롭고 포근한 분위기

[일러스트 스타일]

- 먼작귀(치이카와)를 연상시키는 귀엽고 단순한 일본 캐릭터 일러스트 감성
- 깔끔하고 얇은 외곽선
- 둥글고 부드러운 형태
- 복잡한 명암이나 사실적인 질감 최소화
- 평면적인 2D 셀 일러스트 표현
- 부드러운 파스텔 컬러
- 그림자는 매우 약하고 단순하게 표현
- 전체적으로 깨끗하고 포근하며 말랑한 느낌
- 작은 그림책이나 캐릭터 굿즈 일러스트처럼 완성도 높은 표현

[카메라 구도]

- 두 캐릭터가 모두 잘 보이는 미디엄 또는 풀 샷
- 캐릭터 중심의 단순한 화면 구성
- 눈높이에 가까운 정면 또는 살짝 내려다보는 시점
- 두 캐릭터의 표정과 작은 몸짓이 명확하게 보이도록 구성
- 주변에 적당한 여백을 두어 아기자기한 분위기 강조

[감정 톤]

- 행복함
- 편안함
- 친근함
- 소소한 일상의 즐거움
- 따뜻하고 포근한 힐링 감성
- 보고 있으면 자연스럽게 미소가 나는 귀여운 분위기

[중요]
원본 인물의 정체성을 알아볼 수 있는 핵심 특징은 유지하되, 얼굴과 신체를 사실적으로 묘사하지 말고 먼작귀 특유의 극도로 단순하고 둥근 캐릭터 디자인으로 적극적으로 재해석해주세요. 두 캐릭터 모두 동일한 세계관과 그림체를 공유하도록 표현해주세요.`;

const AC_PROMPT =
  "입력된 인물 사진을 기반으로, 사진속 모든 인물들을 닌텐도 게임 '동물의 숲' 스타일의 캐릭터로 재해석하여 하나의 장면으로 생성해주세요.\n\n[캐릭터 변환 규칙]\n- 모든 인물은 동물의 숲 플레이어 캐릭터 스타일로 변환\n- 얼굴 비율은 크게, 눈은 둥글고 반짝이는 형태\n- 코와 입은 단순화하고 귀엽게 표현\n- 피부 질감은 매끈하고 플라스틱 같은 게임 그래픽 느낌\n- 머리 스타일과 얼굴 특징은 원본 인물의 특징을 유지\n- 의상은 원본을 참고하되 파스텔톤, 체크무늬, 니트 등 동물의 숲 감성으로 재해석\n\n[장면 연출]\n- 모든 캐릭터가 함께 교감하는 장면 (대화, 선물 주기, 산책 등)\n- 밝고 따뜻한 분위기\n- 자연광, 부드러운 그림자\n- 꽃, 나무, 울타리, 가로등 등 동물의 숲 특유의 마을 배경\n\n[배경 스타일]\n- 낮 시간대, 따뜻한 햇빛\n- 포화도 높은 파스텔 컬러\n- 꽃밭, 잔디, 나무, 목재 울타리 포함\n- 게임 속 렌더링처럼 깔끔한 3D 스타일\n\n[렌더링 스타일]\n- 닌텐도 스타일 3D 렌더\n- 부드러운 라이팅\n- 노이즈 없음\n- 귀엽고 따뜻한 감성 강조\n\n[카메라 구도]\n- 모든 캐릭터가 담기는 미디엄 샷\n- 약간 낮은 시점 또는 눈높이 시점\n- 모든 캐릭터의 표정이 잘 보이도록\n\n[감정 톤]\n- 행복함, 편안함, 친근함\n- 힐링 느낌";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** blob: URL → Supabase storage 임시 업로드 → 공개 URL 반환 */
async function uploadBlobForFal(blobUrl: string, style: string): Promise<string> {
  const blob = await fetch(blobUrl).then((r) => r.blob());
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  const path = `${style}-inputs/${crypto.randomUUID()}.png`;
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
export async function transformAnimalCrossingImage(previewUrl: string, style: "ac" | "chiikawa" = "ac"): Promise<string> {
  if (!import.meta.env.VITE_FAL_KEY) {
    await sleep(2200);
    const blob = await fetch(previewUrl).then((r) => r.blob());
    return URL.createObjectURL(blob);
  }

  const publicUrl = previewUrl.startsWith("blob:")
    ? await uploadBlobForFal(previewUrl, style)
    : previewUrl;

  const result = await transformWithFal({
    imageUrl: publicUrl,
    prompt: style === "chiikawa" ? CHIIKAWA_PROMPT : AC_PROMPT,
  });

  return result.imageUrl;
}
