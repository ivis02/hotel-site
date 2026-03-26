# Skill: Accessibility Automation (Safe Mode)
name: accessibility
description: WCAG 2.2 AA 기준. "접근성", "a11y" 언급 시 적용.
mode: non-destructive

---

## Safety (필수)
- 기능 / 디자인 변경 금지
- 구조 변경 금지
- semantic HTML 우선
- ARIA는 semantic으로 해결 불가 시만 사용

---

## Must-Have Rules (실무 기준)
- Semantic HTML: button / a / input 우선 사용
- 텍스트 없는 버튼 → aria-label 필수
- 키보드 네비: tab 이동 가능 + :focus-visible 스타일
- 대비: 일반 텍스트 4.5:1 / 큰 텍스트 3:1
- 폼: label-for 연결 + error 메시지 제공

---

## ARIA 사용 기준 (필수)
ARIA 추가 조건:
1) semantic 태그로 해결 불가
2) 상태 전달 필요 (aria-expanded / aria-selected 등)

금지:
- button에 role=button 추가
- a에 role=link 추가
- 의미 없는 aria-label 추가

---

## A11Y Checklist
CHK:
- semantic correct
- keyboard access 가능
- focus visible 존재
- screen reader 문제 없음
- contrast 기준 충족
- form label 연결됨

---

## Workflow
1. semantic HTML 우선 작성
2. 키보드 이동 테스트 가정
3. contrast 확인
4. 필요 시만 ARIA 추가
5. 변경 후 기능 정상 동작 확인

---

## Example
Input: "아이콘 버튼 접근성 추가"
Output:
- aria-label 추가
- button 태그 유지
- role 추가 금지