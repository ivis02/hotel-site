# Skill: UI Decoration (Pseudo-elements)
name: ui-decor
description: 꾸밈요소는 HTML 추가 없이 ::before/::after로 구현. "꾸밈", "장식", "데코" 요청 시 적용.
mode: non-destructive

## Rules (필수)
- 장식 목적 요소는 HTML 태그 추가 금지 (div/span 금지)
- 가능한 경우 ::before/::after로만 구현
- 장식 요소는 pointer-events: none
- 장식 요소는 content: "" 필수
- 위치는 position: absolute; 부모는 position: relative
- z-index는 콘텐츠를 가리지 않게(보통 음수 또는 낮은 값)
- 접근성: 장식 이미지는 alt 개념 없음(HTML을 안 늘리므로 a11y에 영향 최소)

## Checklist
CHK: DECOR-PSEUDO | NO-HTML-ADD
