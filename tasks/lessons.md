# Lessons Learned (과거 실수와 교훈)

## Lesson 1
- 언제: [날짜/상황]
- 무엇이 문제였나: [간단 설명]
- 다음에는 어떻게 할지: [구체 규칙]

## Lesson 2 — CTA/버튼 클릭 접근성 (반복 실수)
- 무엇이 문제였나: `max-height` 애니메이션으로 숨기는 버튼 요소에 좌우 패딩만 주고 위아래 패딩을 빠뜨려 클릭 영역이 텍스트 높이(~14px)에 그쳤음.
- 근본 원인: `overflow: hidden` + `max-height: 0`으로 숨길 때 padding도 함께 사라지므로 안전하다고 착각했으나, 전역 `box-sizing: border-box` 덕분에 `max-height: 0`이 padding까지 포함해 완전히 접는다. → padding을 자유롭게 써도 숨김 동작에 문제 없음.
- 다음에는 어떻게 할지:
  1. 버튼·링크 요소에는 **항상** `padding: 8px 이상 (위아래)` 기본 부여
  2. `max-height` 값은 `padding × 2 + 콘텐츠 높이 + 여유 10px` 이상으로 설정
  3. hover·reveal 애니메이션 구현 후 "위아래 클릭되는가?" 체크 필수
  4. 좌우만 패딩 확인하고 끝내지 말 것 — 위아래가 더 자주 놓침

## Lesson 3 — FOUT (폰트 깜빡임 / Flash of Unstyled Text)

### 근본 원인 분석
브라우저 렌더링 순서:
1. HTML 파싱 → style.css 요청
2. style.css 다운로드 + 파싱 → `@font-face` URL 발견
3. 폰트 파일(woff2) 요청 시작 → 다운로드 완료까지 대기
4. 그동안 폴백 폰트(기본 serif/sans-serif)로 렌더링
5. 폰트 로드 완료 → **swap 발생 → 화면이 한 번 깜빡임**

`font-display: swap`은 이 swap을 **명시적으로 허용**하는 선언임.
`@font-face`를 외부 CSS 파일에 두면 HTML 파싱 시점에 폰트 URL을 알 수 없어 2단계 딜레이 발생.

### 해결 방법
- **로컬 폰트**: HTML `<head>`에 `<link rel="preload" as="font" href="..." crossorigin>` 추가
  → CSS 파싱 전에 병렬로 폰트 다운로드 시작 → swap 간격 대폭 단축
  → preload는 **첫 화면에 보이는 폰트(히어로·네비)**의 핵심 weight(400, 500)만 대상으로
- **CDN 폰트 (Adobe Fonts / Google Fonts)**: CDN이 preload·최적화를 자체 처리하므로 수동 preload 불필요
  → Adobe Fonts kit: `<link rel="preconnect" href="https://use.typekit.net" crossorigin>` + kit CSS 링크만 추가

### 다음에는 어떻게 할지
1. @font-face 폰트를 새로 추가할 때마다 → 해당 weight의 woff2를 `<head>`에 preload 추가
2. `font-display: swap`은 preload와 반드시 **함께** 사용 (없으면 swap이 길어짐)
3. preload 대상 선정 기준: 페이지 상단 노출 + 가장 많이 쓰이는 weight (보통 400, 500)
4. CDN 폰트(Typekit, Google Fonts)는 preload 직접 추가 금지 — CDN이 자체 캐싱/프리로드 처리

## Lesson 4 — z-index 레이어 스택 관리 (모바일 오버레이 차단)
- 무엇이 문제였나: `booking-panel(z-index:1001)`이 `mob-header(z-index:1003)` 아래에 렌더링되어, 패널 상단 닫기 버튼이 mob-header에 의해 덮여 탈출 불가 상태 발생.
- 근본 원인: 새로운 고정(fixed) 요소 추가 시 기존 z-index 레이어 스택을 확인하지 않음. 특히 모바일 전용 요소(mob-header)가 데스크탑 설계 시 고려 안 된 z-index를 점유하고 있었음.
- 다음에는 어떻게 할지:
  1. fixed/absolute 오버레이 추가 전 z-index 스택 전체 일람 확인
  2. 모달/패널류는 항상 현존하는 최고 z-index + 2 이상 부여 (backdrop은 +1, panel은 +2)
  3. mob-header, fab-pill 등 모바일 전용 fixed 요소의 z-index를 주석으로 명시

## Lesson 5 — 반응형에서 고정 길이 금지
- 무엇이 문제였나: 반응형 작업 중 `width: 340px`, `height: 560px`, `left: 184px` 등 고정값을 사용해 특정 화면 크기에서 레이아웃 깨짐 발생.
- 근본 원인: 데스크탑 값을 그대로 모바일 블록에 복사하거나 임시방편으로 px 고정.
- 다음에는 어떻게 할지:
  1. 반응형 작업 시 길이는 `%`, `vw/vh`, `min/max`, `clamp()` 우선
  2. 고정 px는 border, icon 크기, font-size 등 실제로 고정돼야 하는 값만 허용
  3. 레이아웃 크기(`width`, `height`, `top`, `left`)에 px 쓸 땐 이유를 주석으로 명시
