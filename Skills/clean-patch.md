# Skill: Clean Patch
name: clean-patch
description: 추가 작업 시 코드가 어지러워지지 않게 정리. "정리", "리팩토링", "코드 정돈" 요청 시 적용.
mode: non-destructive

## Rules (필수)
- 기능/디자인 변경 없이 정리만 (동작 동일)
- 중복 CSS/JS 제거 (동일 선언/유사 클래스 병합)
- 관련 코드만 근처로 재배치(섹션 단위로 묶기)
- 새 스타일은 '섹션 블록' 하단에 추가하고, 끝나면 정렬
- CSS는 순서 고정:
  1) layout (display/position)
  2) box (margin/padding/size)
  3) typography
  4) color/background
  5) effect (shadow/transition)
- 주석은 최소: 섹션 시작에만 1줄

## Output
- diff가 큰 정리는 사용자 승인 후 진행 (기본은 작은 정리만)

## Checklist
CHK: CLEAN | NO-BEHAVIOR-CHANGE
