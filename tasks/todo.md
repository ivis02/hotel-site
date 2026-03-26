# Tasks TODO

## 현재 상태 요약
2026-03-27 세션 완료.
- A11Y + 세련됨 개선 패스 (WCAG 2.1 대응)

## 입력 로그 (자동)
- 2026-02-23: 실험적 UI 변경 4종 (hero zoom, 색상통일, 객실소개, 파문)
- 2026-02-23: 예약/문의 플로팅 위젯 구현
- 2026-02-23: FAB 알약 버튼 리디자인 (예약·멤버십·TOP)
- 2026-02-23: 전체 최적화 패스
- 2026-03-27: A11Y 개선 (H1, skip-link, focus-visible, label, live-region, 도트 탭타겟, reduced-motion)
- 2026-03-27: 디자인 개선 (색상 대비 보정, 버튼 hover 마이크로인터랙션, 모바일 active 상태)

## 오늘 할 일
- [x] allday 텍스트 확대(title 36px, desc 16px), 사진 가로형(560×400px), 간격·수치 정리, 미사용 CSS 제거
- [x] GNB 메가메뉴 Option C (이미지 카드 그리드) + Hover open/close JS 구현
- [x] 히어로 줌아웃 + seamless handoff
- [x] 섹션 타이틀 컬러 통일
- [x] 객실소개 섹션 opacity crossfade
- [x] 클릭 파문 인터랙션
- [x] 예약/문의 플로팅 위젯 (FAB + 패널)
- [x] 최적화 (GPU 가속, DOM 캐싱, will-change)
- [x] 반응형 CSS 구현 (1440/1024/768/480px 브레이크포인트, 햄버거 GNB)

## 검토 섹션 (완료 후)
모든 작업 완료. 주요 변경 파일: index.html, css/style.css, js/script.js

@next-suggest
1. 예약 폼 실제 백엔드 연동 (또는 이메일 전송)
2. 로그인/문의 기능 구현
3. 모바일 반응형 (@resp) 점검
