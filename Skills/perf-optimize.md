# Skill: Performance Optimization (Safe Mode)
name: perf-optimize
description: 순수 HTML/CSS/JS 성능 최적화. "빠르게", "최적화" 언급 시 적용.
mode: non-destructive

## Safety (필수)
- 기능 삭제 금지
- 디자인 삭제 금지
- 구조 변경(파일 분리, 대규모 리팩토링) 금지
- 변경은 작은 수정 단위만 허용
- 큰 구조 변경은 사용자 승인 후 진행

---

## Critical Rules (안전 기준)
- CSS: 미사용 CSS 제거, 선택자 단순화 우선
- JS: event delegation / throttle / debounce 우선
- 이미지: 삭제 금지 → 포맷 / 사이즈 / lazy 최적화만 허용
- 애니메이션: transform / opacity 우선
- 폰트: system-ui 우선, web-safe fallback

---

## Optimization Order (낮은 리스크 → 높은 리스크)
1. 미사용 CSS / JS 제거
2. 이미지 최적화 (lazy / width / height 명시)
3. 이벤트 최적화 (debounce / throttle / delegation)
4. layout thrashing 제거
5. 구조 변경 → 필요 시 사용자 승인 후 1회만

---

## Optimization Checklist
CHK:
- unused-code removed
- layout thrash 없음
- animation safe (transform/opacity)
- lazy loading 적용 가능 여부 확인
- 이벤트 최적화 적용 여부

---

## Workflow
1. 기본 구현 유지
2. 체크리스트 기반 미세 최적화
3. 병목 발견 시 → 제거 대신 개선 제안 우선
4. 변경 후 기능 정상 동작 확인

---

## Metrics (참고용, 강제 아님)
- 60fps 목표
- FCP 빠르게 유지 시도
- Memory / Bundle → 측정 가능 시만 보고
- 수치 맞추려고 기능 제거 금지

---

## Example
Input: "버튼 애니메이션 최적화"
Output:
- transform 기반 유지
- 기존 동작 유지
- transition 최적화만 수행