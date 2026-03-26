---
description: 
alwaysApply: true
---

# CLAUDE.md - Token Optimized

## 🎯 Session Boot (필수 3초)
1. tasks/todo.md 상태 확인
2. 오류 발생 시 lessons.md 확인
3. 아래 규칙만 따름

## 🚫 Output: Frontend production code only
Default: HTML/CSS/JS
Optional: React allowed if user explicitly requests

## ⚡ Workflow (5 rules only)
0. 사용자가 요청하면 todo.md '오늘 할 일'에 자동 기록 (1줄 요약)
1. todo.md에 계획 → 사용자 OK → 구현
2. PC코드 → responsive 스킬 적용
3. 완료시 `[x]` 체크 + 다음 제안
4. 오류는 lessons.md에 3줄 기록
5. 검증: 모바일/PC 동작 확인

## 📱 Skills (Lazy)
- 스킬은 기본 로드 금지
- 호출 시에만 해당 파일 읽고 적용
- 스킬 문서 내용은 출력 금지, 적용만 수행
- 결과에는 CHK 라벨만 출력
- responsive: 반응형 요청 시 또는 모바일 깨짐 발견 시 @resp 적용
- a11y: 접근성 요청 시 또는 폼/모달/네비 추가 시 @a11y 적용
- ui-decor: 꾸밈 요소는 pseudo(::before/::after) 우선, HTML 추가 금지
- clean-patch: 추가 작업 후 중복/정렬만 정리 (동작 변경 금지)
- frontend-design: UI 컴포넌트/페이지/레이아웃 제작 시 @fd 적용
- ui-ux-pro-max: 디자인 스타일/컬러/타이포 결정 시 @uiux 적용
- web-design-guidelines: UI 검토/감사/접근성 점검 시 @wdg 적용
- webapp-testing: 로컬 웹앱 기능 검증/디버깅 시 @test 적용
- vercel-react-best-practices: React 컴포넌트 작성/리팩토링 시 @react 적용 (자동 적용 금지)
- vercel-composition-patterns: React 컴포넌트 구조 설계 시 @comp 적용 (자동 적용 금지)
- ckmui-styling: shadcn/Tailwind UI 구현 시 @uistyle 적용
- ckmdesign-system: 디자인 토큰/CSS 변수 체계 구성 시 @ds 적용
- gsap-core: GSAP 애니메이션 기본 구현 시 @gsap 적용 (자동 적용 금지)
- gsap-scrolltrigger: 스크롤 기반 애니메이션 구현 시 @gsap-st 적용 (자동 적용 금지)
- gsap-timeline: 시퀀스/타임라인 애니메이션 시 @gsap-tl 적용 (자동 적용 금지)
- gsap-plugins: GSAP 플러그인(MorphSVG 등) 사용 시 @gsap-pl 적용 (자동 적용 금지)
- threejs-fundamentals: Three.js 씬/카메라/렌더러 구성 시 @three 적용 (자동 적용 금지)
- threejs-animation: Three.js 오브젝트 애니메이션 시 @three-anim 적용 (자동 적용 금지)
- threejs-shaders: Three.js 커스텀 셰이더/GLSL 작성 시 @three-shader 적용 (자동 적용 금지)
- review-fix-a11y: 접근성 전체 감사/수정 시 @rfa 적용 (자동 적용 금지)

## Shortcuts (토큰 절약)
- @rules = CLAUDE.md + tasks/todo.md
- @less = tasks/lessons.md (오류/회귀 때만)
- @resp = Skills/responsive.md 읽고 적용
- @a11y = Skills/accessibility.md 읽고 적용
- @perf = Skills/perf-optimize.md 읽고 적용 (자동 적용 금지)
- @decor = Skills/ui-decor.md 읽고 적용
- @clean = Skills/clean-patch.md 읽고 적용
- @fd = Skills/frontend-design.md 읽고 적용
- @uiux = Skills/ui-ux-pro-max.md 읽고 적용
- @wdg = Skills/web-design-guidelines.md 읽고 적용
- @test = Skills/webapp-testing.md 읽고 적용
- @react = Skills/vercel-react-best-practices.md 읽고 적용 (자동 적용 금지)
- @comp = Skills/vercel-composition-patterns.md 읽고 적용 (자동 적용 금지)
- @uistyle = Skills/ckmui-styling.md 읽고 적용
- @ds = Skills/ckmdesign-system.md 읽고 적용
- @gsap = Skills/gsap/gsap-core.md 읽고 적용 (자동 적용 금지)
- @gsap-st = Skills/gsap/gsap-scrolltrigger.md 읽고 적용 (자동 적용 금지)
- @gsap-tl = Skills/gsap/gsap-timeline.md 읽고 적용 (자동 적용 금지)
- @gsap-pl = Skills/gsap/gsap-plugins.md 읽고 적용 (자동 적용 금지)
- @gsap-perf = Skills/gsap/gsap-performance.md 읽고 적용 (자동 적용 금지)
- @three = Skills/threejs/threejs-fundamentals.md 읽고 적용 (자동 적용 금지)
- @three-anim = Skills/threejs/threejs-animation.md 읽고 적용 (자동 적용 금지)
- @three-geo = Skills/threejs/threejs-geometry.md 읽고 적용 (자동 적용 금지)
- @three-mat = Skills/threejs/threejs-materials.md 읽고 적용 (자동 적용 금지)
- @three-light = Skills/threejs/threejs-lighting.md 읽고 적용 (자동 적용 금지)
- @three-shader = Skills/threejs/threejs-shaders.md 읽고 적용 (자동 적용 금지)
- @three-post = Skills/threejs/threejs-postprocessing.md 읽고 적용 (자동 적용 금지)
- @rfa = Skills/review-fix-a11y.md 읽고 적용 (자동 적용 금지)


## Token Check
- @tokens: 현재 세션 토큰 사용량 보고
- @reset: 컨텍스트 리셋 (긴 대화시)

## 핵심 원칙
- 단순함 우선: 최소 코드 영향.
- 게으름 금지: 근본 원인 해결.
- 최소 영향: 필요한 부분만 변경.
- 구현 막히면 먼저 질문
- 요청 범위 외 변경 / 최적화 / 리팩토링 금지
- !important는 금지(마지막 수단). 필요 시 원인 해결(특이성/구조/순서)

## 검증 체크리스트 (항상 출력)
CHK: TODO | MOB | PC | PERF | UX | A11Y
undefined