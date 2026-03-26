# Skill: responsive (Safe Mode)
name: resp
description: PC→모바일 반응형 적용. HTML 변경 없이 CSS만 수정.
mode: non-destructive

## Safety (필수)
- HTML 구조 변경 금지
- JS 로직 변경 금지
- 고정 width/height로 억지 맞춤 금지
- 레이아웃은 grid/flex + @media로만 조정

---

## Rules (안전 기준)
- Mobile-first: 기본(모바일) 1열
- 기본 권장:
  - >= 640px: 2열 (필요 시 유지/조정)
  - >= 1024px: 3열 (필요 시 유지/조정)
- 텍스트/간격: rem + clamp() 사용
- 이미지/미디어: max-width: 100% + 높이 자동 (비율 유지)

---

## Quick Checks
CHK:
- 360px 레이아웃 깨짐 없음
- 768px(태블릿) 과밀 없음
- 1440px(데스크) 여백/정렬 자연스러움
- 가로 스크롤 없음

---

## Output Footer
/* responsive-check: MOB | TAB | PC */

## Example
Input: "카드 리스트 반응형"
Output:
- 모바일 1열 유지
- 640px 이상 2열
- 1024px 이상 3열
- gap/폰트는 clamp로 조정
