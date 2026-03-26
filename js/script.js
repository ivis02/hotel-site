// ============================================
// HOTEL NONGSHIM - MAIN JAVASCRIPT
// ============================================

// ============================================
// 0. GLOBAL HELPERS
// ============================================
// 모션 감소 설정 감지
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ARIA Live Region - 스크린리더 동적 변경 알림
const liveRegion = document.getElementById('live-region');
function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    // 짧은 지연 후 텍스트 설정 → 같은 메시지 재발화 보장
    setTimeout(() => { liveRegion.textContent = msg; }, 50);
}

// ============================================
// 1. HEADER SCROLL BEHAVIOR (스마트 헤더)
//    - topbar: 스크롤 시 자연스럽게 사라짐 (absolute)
//    - GNB: 스크롤 다운 시 사라지고, 업 시 상단 고정으로 나타남
// ============================================
const header = document.getElementById('header');
let lastScroll = 0;
const HEADER_THRESHOLD = 64; // header의 absolute top 위치 (이 지점에서 fixed↔absolute 위치 일치)

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= HEADER_THRESHOLD) {
        if (header.classList.contains('header--sticky') && header.classList.contains('header--visible')) {
            // 고정 헤더를 절대 위치로 부드럽게 내려놓는 "밀어내는" 효과
            // compensate: fixed(y=0)와 absolute(y=THRESHOLD-scroll)가 일치하도록 음수 오프셋
            const compensate = currentScroll - HEADER_THRESHOLD; // 음수값 (e.g. scroll=30 → -34)
            header.style.transition = 'none';
            header.style.transform = `translateY(${compensate}px)`; // fixed 위치에 맞춤
            header.classList.remove('header--sticky', 'header--visible');
            void header.offsetHeight;
            // translateY(compensate→0): 헤더가 페이지 위치로 부드럽게 내려옴
            header.style.transition = prefersReducedMotion ? 'none' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
            header.style.transform = 'translateY(0)';
            setTimeout(() => {
                if (!header.classList.contains('header--sticky')) {
                    header.style.transition = '';
                    header.style.transform = '';
                }
            }, 520);
        } else if (header.classList.contains('header--sticky')) {
            // sticky 상태지만 숨겨진 경우 → 즉시 absolute로 전환
            header.style.transition = 'none';
            header.style.transform = '';
            header.classList.remove('header--sticky', 'header--visible');
            void header.offsetHeight;
            header.style.transition = '';
        }
    } else if (currentScroll < lastScroll) {
        // 스크롤 업 - 스티키 헤더 표시 (위에서 밀고 내려오는 효과)
        header.style.transition = '';
        header.style.transform = '';
        if (!header.classList.contains('header--sticky')) {
            header.style.transition = 'none';
            header.classList.add('header--sticky');
            void header.offsetHeight;
            header.style.transition = '';
            requestAnimationFrame(() => header.classList.add('header--visible'));
        } else {
            header.classList.add('header--visible');
        }
    } else {
        // 스크롤 다운 - 스티키 헤더 숨김
        header.style.transition = '';
        header.style.transform = '';
        header.classList.remove('header--visible');
    }

    lastScroll = currentScroll;
});


// ============================================
// 2. HOTEL INTRO - 화살표 슬라이더
//    - prev/next 버튼으로 이미지 crossfade
//    - since → heading → desc 순차 페이드인
// ============================================
(function () {
    const slides   = document.querySelectorAll('.hotel-intro__slide');
    const textBody = document.querySelector('.hotel-intro__text-body');
    const since    = document.querySelector('.hotel-intro__since');
    const titleEn  = document.querySelector('.hotel-intro__title-en');
    const titleKr  = document.querySelector('.hotel-intro__title-kr');
    const desc     = document.querySelector('.hotel-intro__desc');
    const prevBtn  = document.querySelector('.hotel-intro__arrow--prev');
    const nextBtn  = document.querySelector('.hotel-intro__arrow--next');

    if (!slides.length || !prevBtn) return;

    const data = [
        {
            since:   'SINCE 1979',
            titleEn: 'Urban Oasis Retreat',
            titleKr: '도심 속 오아시스',
            desc:    '1979년 개관 이래 부산 동래의 랜드마크로 자리잡은 호텔농심은 천년 역사의 동래온천과 금정산의 자연이 어우러진 도심 속 휴식처입니다.'
        },
        {
            since:   'EST. 1979',
            titleEn: 'Timeless Heritage',
            titleKr: '온천의 전통',
            desc:    '전통과 현대가 조화를 이루는 호텔농심의 내부 공간에서는 정갈하고 따뜻한 환대가 여러분의 특별한 순간을 완성합니다.'
        }
    ];

    let current = 0;

    function goTo(idx) {
        slides[current].classList.remove('is-active');
        current = idx;
        slides[current].classList.add('is-active');

        // 아웃
        textBody.classList.add('is-switching');
        textBody.classList.remove('is-entering');

        setTimeout(() => {
            // 내용 변경
            since.textContent   = data[current].since;
            titleEn.textContent = data[current].titleEn;
            titleKr.textContent = data[current].titleKr;
            desc.textContent    = data[current].desc;

            // 인 - 순차 애니메이션 트리거
            textBody.classList.remove('is-switching');
            textBody.classList.add('is-entering');
            setTimeout(() => textBody.classList.remove('is-entering'), 700);
        }, 240);
    }

    prevBtn.addEventListener('click', () => goTo((current - 1 + slides.length) % slides.length));
    nextBtn.addEventListener('click', () => goTo((current + 1) % slides.length));
}());


// ============================================
// 3. SPECIAL OFFERS - 무한 루프 캐러셀
//    - 카드 클론으로 양쪽 확장 (무한 루프)
//    - DOM 인덱스 기반 위치 계산
//    - 카드 클릭 시 중앙 활성화 (클론 포함)
//    - 드래그(스와이프)로 좌우 이동
//    - 닷 인디케이터 연동
// ============================================
const carousel = document.getElementById('offers-carousel');
const offerDots = document.querySelectorAll('.special-offers__dots .dot');
const CARD_W = 220;       // 비활성 카드 너비
const CARD_GAP = 40;      // flex gap (CSS와 동기화)
const ACTIVE_MARGIN = 40; // 활성 카드 양쪽 추가 마진 (CSS와 동기화)
const ACTIVE_W = 310;     // 활성 카드 너비
const TOTAL = 7;          // 원본 카드 수

// 카드 클론 생성 (데스크탑 전용 — 768px 이하 모바일은 클론 없이 세로 나열)
const originalCards = Array.from(carousel.querySelectorAll('.offer-card'));
const IS_DESKTOP = () => window.innerWidth > 768;

if (IS_DESKTOP()) {
    const clonesBefore = originalCards.map(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('is-clone');
        clone.classList.remove('is-active');
        return clone;
    });
    const clonesAfter = originalCards.map(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('is-clone');
        clone.classList.remove('is-active');
        return clone;
    });
    clonesBefore.reverse().forEach(clone => carousel.prepend(clone));
    clonesAfter.forEach(clone => carousel.appendChild(clone));
}

// 모든 카드 재수집: 데스크탑=[clone×7, orig×7, clone×7], 모바일=[orig×7]
const allCards = Array.from(carousel.querySelectorAll('.offer-card'));
let currentDomIdx = IS_DESKTOP() ? TOTAL + 3 : 3; // 4번째 카드 활성
let isAnimating = false;

// 캐러셀 위치 계산: DOM 인덱스 기준, 활성 카드 중심을 화면 중앙에 배치
function calculateOffset(domIdx) {
    return -(domIdx * (CARD_W + CARD_GAP) + ACTIVE_MARGIN + ACTIVE_W / 2);
}

// 카드 활성 상태 + 닷 업데이트
function updateCards() {
    allCards.forEach((card, i) => {
        card.classList.toggle('is-active', i === currentDomIdx);
    });
    const realIdx = ((currentDomIdx % TOTAL) + TOTAL) % TOTAL;
    offerDots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === realIdx);
    });
}

// 특정 DOM 인덱스로 이동 (모바일에서는 비활성)
function goTo(domIdx, animate = true) {
    if (!IS_DESKTOP()) return;
    if (isAnimating) return;
    currentDomIdx = domIdx;
    updateCards();
    void carousel.offsetHeight; // 레이아웃 강제 반영 후 offset 계산 (바운스 방지)

    if (animate) {
        carousel.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        isAnimating = true;
    } else {
        carousel.style.transition = 'none';
    }
    carousel.style.transform = `translateX(${calculateOffset(currentDomIdx)}px)`;

    if (animate) {
        setTimeout(() => {
            isAnimating = false;
            // 클론 영역이면 원본 영역으로 순간 이동 (무한 루프)
            if (currentDomIdx < TOTAL || currentDomIdx >= TOTAL * 2) {
                const realIdx = ((currentDomIdx % TOTAL) + TOTAL) % TOTAL;
                currentDomIdx = TOTAL + realIdx;
                updateCards();
                carousel.style.transition = 'none';
                carousel.style.transform = `translateX(${calculateOffset(currentDomIdx)}px)`;
            }
        }, 630);
    }
}

// 카드 클릭 (클론 포함 - 가까운 카드로 자연스럽게 이동)
allCards.forEach((card, i) => {
    card.addEventListener('click', () => {
        if (card.classList.contains('is-active') || card.classList.contains('is-dragged')) return;
        goTo(i);
    });
});

// 닷 클릭 (원본 영역 기준)
offerDots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(TOTAL + i));
});

// 드래그 기능 (데스크탑 전용)
let isDragging = false;
let dragStartX = 0;
let dragBaseOffset = 0;

if (IS_DESKTOP()) {
    carousel.addEventListener('mousedown', startDrag);
    carousel.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    if (!IS_DESKTOP()) return; // 모바일: 네이티브 스크롤에 맡김
    if (isAnimating) return;
    isDragging = true;
    dragStartX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    dragBaseOffset = calculateOffset(currentDomIdx);
    carousel.classList.add('is-dragging');
    carousel.style.transition = 'none';
}

function onDrag(e) {
    if (!isDragging) return;
    if (e.type === 'touchmove') e.preventDefault();
    const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    carousel.style.transform = `translateX(${dragBaseOffset + (x - dragStartX)}px)`;
}

function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('is-dragging');

    const endX = e.type === 'touchend'
        ? (e.changedTouches ? e.changedTouches[0].clientX : dragStartX)
        : e.clientX;
    const diff = endX - dragStartX;
    // 클릭인지 드래그인지 판별
    if (Math.abs(diff) < 5) {
        // goTo 호출 없이 위치만 복구 (isAnimating 잠금 방지 → card click 이벤트가 정상 처리)
        carousel.style.transition = 'none';
        carousel.style.transform = `translateX(${calculateOffset(currentDomIdx)}px)`;
        return;
    }

    // 드래그 후 클릭 방지 플래그
    allCards.forEach(c => {
        c.classList.add('is-dragged');
        setTimeout(() => c.classList.remove('is-dragged'), 100);
    });

    // 드래그 거리 기반으로 가장 가까운 카드로 이동
    const cardSlot = CARD_W + CARD_GAP;
    const shift = Math.round(-diff / cardSlot);
    goTo(currentDomIdx + shift);
}

// 초기 상태 설정
if (IS_DESKTOP()) {
    goTo(TOTAL + 3, false); // 데스크탑: 캐러셀 위치 세팅
} else {
    // 모바일: transform 초기화(DevTools 리사이즈 대응) + 첫 카드 활성화
    carousel.style.transform = '';
    carousel.style.transition = '';
    updateCards();
}

// DevTools 리사이즈 대응: 데스크탑→모바일 전환 시 transform 초기화
window.addEventListener('resize', () => {
    if (!IS_DESKTOP()) {
        carousel.style.transform = '';
        carousel.style.transition = '';
    }
});


// ============================================
// 3-2. SPECIAL OFFERS - 카테고리 토글 + 카드 플립
// ============================================
const categoryData = {
    package: [
        { title: '2025 F/W 스파 패키지', desc: '가을·겨울 시즌 한정, 프리미엄 스파 트리트먼트와 함께하는 특별한 투숙 경험.', date: '2025.09.01 ~ 2026.02.28', img: '' },
        { title: '봄맞이 온천 패키지', desc: '금정산 벚꽃과 천년 온천의 조화, 봄을 느끼는 힐링 스테이.', date: '2026.03.01 ~ 2026.05.31', img: '' },
        { title: '프리미엄 다이닝 패키지', desc: '셰프의 특별 코스 디너와 프리미엄 와인 페어링을 즐기는 미식 여행.', date: '2025.01.01 ~ 2025.12.31', img: '' },
        { title: '2025 농심 친환경 패키지', desc: '자연을 생각한 선물과 온천의 여유로, 지속가능한 하루를 경험해보세요.', date: '2025.03.01 ~ 2025.12.31', img: 'images/main/9b813aeef0884866d8cac719370cb8df.png' },
        { title: '허심청 온천 체험', desc: '천년 동래온천의 정수, 허심청에서 몸과 마음을 치유하는 온천 여행.', date: '2025.01.01 ~ 2025.12.31', img: '' },
        { title: '객실 & 조식 패키지', desc: '신선한 제철 식재료로 준비된 조식 뷔페와 편안한 객실의 완벽한 조합.', date: '2025.01.01 ~ 2025.12.31', img: 'images/main/main_15404627323.png' },
        { title: 'SRT 온천 여행 패키지', desc: 'SRT 이용 고객 전용, 부산역에서 호텔까지 셔틀과 온천 입장권 포함.', date: '2025.06.01 ~ 2025.12.31', img: '' }
    ],
    promotion: [
        { title: '얼리버드 30% 할인', desc: '30일 전 예약 시 전 객실 30% 특별 할인, 조식 포함 혜택.', date: '2026.01.01 ~ 2026.12.31', img: '' },
        { title: '커플 스파 프로모션', desc: '두 분이 함께하는 프리미엄 커플 스파, 샴페인 & 딸기 서비스.', date: '2026.02.14 ~ 2026.03.31', img: '' },
        { title: '가족 여름 패키지', desc: '어린이 무료 입장, 키즈풀 & 가족 연회장 우선 예약 혜택.', date: '2026.06.01 ~ 2026.08.31', img: '' },
        { title: '시니어 특별 할인', desc: '65세 이상 어르신 전용 특별 요금, 웰니스 프로그램 포함.', date: '2026.01.01 ~ 2026.12.31', img: '' },
        { title: '부산 시티 투어 패키지', desc: '부산 대표 관광지 투어와 호텔 숙박이 결합된 도심 탐방 패키지.', date: '2026.03.01 ~ 2026.11.30', img: '' },
        { title: '웨딩 애니버서리', desc: '결혼기념일 특별 패키지, 꽃 장식·케이크·스파 바우처 증정.', date: '2026.01.01 ~ 2026.12.31', img: '' },
        { title: '연말 카운트다운 프로모션', desc: '신년맞이 특별 이벤트, 루프탑 불꽃 뷰 룸 우선 배정 혜택.', date: '2025.12.24 ~ 2026.01.02', img: '' }
    ]
};

let currentCategory = 'package';

function updateCardContent(card, data) {
    const thumb = card.querySelector('.offer-card__thumb');
    if (data.img) {
        thumb.style.backgroundImage = `url('${data.img}')`;
    } else {
        thumb.style.removeProperty('background-image');
    }
    const titleEl = card.querySelector('.offer-card__info-title');
    const descEl  = card.querySelector('.offer-card__info-desc');
    const dateEl  = card.querySelector('.offer-card__info-date');
    const nameEl  = card.querySelector('.offer-card__name');
    if (titleEl) titleEl.textContent = data.title;
    if (descEl)  descEl.textContent  = data.desc;
    if (dateEl)  dateEl.textContent  = data.date;
    if (nameEl)  nameEl.textContent  = data.title;
}

function updateToggleThumb() {
    const thumb = document.querySelector('.offers-toggle__thumb');
    const activeBtn = document.querySelector('.offers-toggle__btn.is-active');
    if (!thumb || !activeBtn) return;
    thumb.style.left = activeBtn.offsetLeft + 'px';
    thumb.style.width = activeBtn.offsetWidth + 'px';
}

function flipToCategory(newCat) {
    if (newCat === currentCategory) return;
    currentCategory = newCat;
    const data = categoryData[newCat];

    // 토글 버튼 상태 + 썸 이동
    document.querySelectorAll('.offers-toggle__btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.cat === newCat);
    });
    updateToggleThumb();
    // 스크린리더 알림
    const catLabel = document.querySelector(`.offers-toggle__btn[data-cat="${newCat}"]`)?.textContent?.trim();
    if (catLabel) announce(catLabel + ' 목록으로 변경되었습니다.');

    // 21장 카드 모두 순차 플립 (중앙 먼저 → 양쪽 파급)
    allCards.forEach((card, domIdx) => {
        const dist = Math.abs(domIdx - currentDomIdx);
        const delay = dist * 100;
        const realIdx = ((domIdx % TOTAL) + TOTAL) % TOTAL;

        setTimeout(() => {
            if (prefersReducedMotion) {
                // 모션 감소: 즉시 내용 교체 (애니메이션 없음)
                updateCardContent(card, data[realIdx]);
                return;
            }
            // Phase 1: 위로 접힘 (0 → 90deg)
            card.style.transition = 'transform 0.22s ease-in';
            card.style.transform = 'perspective(1000px) rotateX(90deg)';

            setTimeout(() => {
                // 내용 교체 (카드 측면이 정면 - 보이지 않는 순간)
                updateCardContent(card, data[realIdx]);

                // Phase 2: 아래에서 펼쳐짐 (-90deg → 0deg)
                card.style.transition = 'none';
                card.style.transform = 'perspective(1000px) rotateX(-90deg)';
                void card.offsetHeight; // force reflow
                card.style.transition = 'transform 0.22s ease-out';
                card.style.transform = 'perspective(1000px) rotateX(0deg)';

                // 인라인 스타일 정리
                setTimeout(() => {
                    card.style.transition = '';
                    card.style.transform = '';
                }, 230);
            }, 220);
        }, delay);
    });
}

document.querySelectorAll('.offers-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => flipToCategory(btn.dataset.cat));
});

// 썸 초기 위치 설정
updateToggleThumb();


// ============================================
// 4. ACCOMMODATIONS - 사이드바 네비 + 서브룸 클릭
// ============================================
const navLinks = document.querySelectorAll('.accommodations__nav-list li a');
const navAccent = document.querySelector('.accommodations__nav-accent');
const panels = document.querySelectorAll('.accommodations__panel');

// 서브룸 클릭 (활성 패널 내부만) + 메인 이미지·텍스트 업데이트
function bindSubrooms(panel) {
    const subrooms   = panel.querySelectorAll('.subroom');
    const imgBg      = panel.querySelector('.accommodations__image-bg');
    const imgWrap    = panel.querySelector('.accommodations__image');
    const roomName   = panel.querySelector('.accommodations__room-name');
    const roomNameEn = panel.querySelector('.accommodations__room-name-en');
    const roomDesc   = panel.querySelector('.accommodations__room-desc');
    const specValues = panel.querySelectorAll('.spec__value');

    const infoEl = panel.querySelector('.accommodations__info');

    subrooms.forEach(room => {
        room.addEventListener('click', () => {
            if (room.classList.contains('is-active')) return;
            subrooms.forEach(r => r.classList.remove('is-active'));
            room.classList.add('is-active');

            const d = room.dataset;

            // 사진: opacity crossfade (빈 공간 없음)
            if (d.img) {
                const overlay = document.createElement('div');
                overlay.style.cssText = [
                    'position:absolute;inset:0',
                    'background-size:cover;background-position:center',
                    `background-image:url('${d.img}')`,
                    'opacity:0;transition:opacity 0.5s ease',
                    'z-index:5'
                ].join(';');
                imgWrap.insertBefore(overlay, imgWrap.querySelector('.accommodations__image-gradient'));
                overlay.offsetHeight; // reflow
                overlay.style.opacity = '1';
                setTimeout(() => {
                    imgBg.style.backgroundImage = `url('${d.img}')`;
                    overlay.remove();
                }, 520);
            }

            // 텍스트: 즉시 업데이트
            if (d.name)   roomName.textContent   = d.name;
            if (d.nameEn) roomNameEn.textContent  = d.nameEn;
            if (d.desc)   roomDesc.textContent    = d.desc;
            const vals = [d.size, d.bed, d.view, d.guest];
            specValues.forEach((el, i) => { if (vals[i]) el.textContent = vals[i]; });
        });
    });
}
panels.forEach(p => bindSubrooms(p));

// 객실 사이드바 네비게이션 클릭
navLinks.forEach((link, i) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => {
            l.classList.remove('is-active');
            l.querySelector('.nav-dot').classList.remove('is-active');
        });
        link.classList.add('is-active');
        link.querySelector('.nav-dot').classList.add('is-active');
        // 액센트 바 위치 이동 (50px 간격)
        if (navAccent) {
            navAccent.style.height = (i * 50) + 'px';
        }
        // 패널 전환 (opacity crossfade)
        const target = link.dataset.room;
        panels.forEach(p => {
            if (p.dataset.room === target) {
                p.classList.add('is-active');
            } else {
                p.classList.remove('is-active');
            }
        });
        // 스크린리더 알림
        const roomLabel = link.childNodes[0]?.textContent?.trim();
        if (roomLabel) announce(roomLabel + ' 객실 정보로 이동했습니다.');
    });
});


// 모바일 서브룸 스크롤 힌트 (4개 이상 패널에만 표시)
(function () {
    if (window.innerWidth > 768) return;
    document.querySelectorAll('.accommodations__subrooms').forEach(function (el) {
        if (el.querySelectorAll('.subroom').length <= 3) return;
        var hint = document.createElement('span');
        hint.className = 'subrooms-scroll-hint';
        hint.setAttribute('aria-hidden', 'true');
        hint.innerHTML = '<svg width="12" height="12" viewBox="0 0 18 18" fill="none" aria-hidden="true"><line x1="3.75" y1="9" x2="14.25" y2="9" stroke="currentColor" stroke-width="1.5"/><polyline points="9,3.75 14.25,9 9,14.25" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>옆으로 스크롤';
        el.parentNode.insertBefore(hint, el.nextSibling);
        el.addEventListener('scroll', function () {
            hint.style.opacity = (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) ? '0' : '1';
        }, { passive: true });
    });
}());


// ============================================
// 5. ALL DAY ALL TIME — 타임바 + 포토스테이지 전환
//    - 선 중심 타임바: 클릭/드래그 → 라인 확장 + 슬라이드 크로스페이드
//    - 5초마다 자동 진행, 수동 조작 시 타이머 리셋
//    - 키보드: ← → 방향키 지원
// ============================================
(function initAlldayNew() {
    const STEPS  = 7;
    const fill   = document.getElementById('tbFill');
    const glow   = document.getElementById('tbGlow');
    const marker = document.getElementById('tbMarker');
    const track  = document.getElementById('tbTrack');
    const btns   = Array.from(document.querySelectorAll('.allday__tb-btn'));
    const slides = Array.from(document.querySelectorAll('.allday__slide'));
    if (!fill || !btns.length) return;

    let current    = 2; // 12:00 기본 active
    let timer      = null;
    let isDragging = false;

    function activate(idx) {
        if (idx === current && !isDragging) return;
        current = idx;

        // 라인 확장 + 글로우·마커 이동
        const pct = (idx / (STEPS - 1)) * 100;

        // 가로 타임바 (모바일 포함 동일)
        fill.style.width  = pct + '%';
        fill.style.height = '';
        if (glow)   { glow.style.left  = 'calc(' + pct + '% - 20px)'; glow.style.top   = ''; }
        if (marker) { marker.style.left = pct + '%'; marker.style.top  = ''; }

        // 탭 버튼 상태
        btns.forEach((btn, i) => {
            btn.classList.toggle('is-active', i === idx);
            btn.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        });

        // 슬라이드 크로스페이드
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === idx));

        // 포토 카드 이미지 교체 (fade out → src 변경 → fade in)
        const photoImg = document.querySelector('.allday__photo-img');
        if (photoImg) {
            const newSrc = slides[idx].querySelector('.allday__slide-bg').src;
            if (prefersReducedMotion) {
                photoImg.src = newSrc;
            } else {
                photoImg.style.opacity = '0';
                setTimeout(() => {
                    photoImg.src = newSrc;
                    photoImg.style.opacity = '1';
                }, 220);
            }
        }
    }

    function resetTimer() {
        clearInterval(timer);
        timer = setInterval(() => activate((current + 1) % STEPS), 5000);
    }

    // 드래그 스크럽 헬퍼
    function getIdxFromX(clientX, rect) {
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        return Math.round((x / rect.width) * (STEPS - 1));
    }

    // 클릭 / 키보드
    btns.forEach((btn, i) => {
        btn.addEventListener('click', () => {
            activate(i);
            resetTimer();
            const label = btn.getAttribute('aria-label');
            if (label) announce(label + '로 변경되었습니다.');
        });
        btn.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') { activate((current + 1) % STEPS);         resetTimer(); }
            if (e.key === 'ArrowLeft')  { activate((current - 1 + STEPS) % STEPS); resetTimer(); }
        });
    });

    // 드래그 스크럽 (트랙 위)
    if (track) {
        track.addEventListener('mousedown', e => {
            isDragging = true;
            clearInterval(timer); // 드래그 중 자동재생 멈춤
            activate(getIdxFromX(e.clientX, track.getBoundingClientRect()));
        });
        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            activate(getIdxFromX(e.clientX, track.getBoundingClientRect()));
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) { isDragging = false; resetTimer(); }
        });

        // 모바일 터치: 트랙 전체가 터치구역
        track.addEventListener('touchstart', e => {
            e.preventDefault();
            activate(getIdxFromX(e.touches[0].clientX, track.getBoundingClientRect()));
            resetTimer();
        }, { passive: false });
        track.addEventListener('touchmove', e => {
            e.preventDefault();
            activate(getIdxFromX(e.touches[0].clientX, track.getBoundingClientRect()));
        }, { passive: false });
    }

    resetTimer();
})();


// ============================================
// 6. HERO - Gooey 인디케이터 + 슬라이드 시스템
// ============================================
const heroSlides = [
    {
        bg: 'images/main/main_1540462708.jpg',
        title: '그 곳, 호텔농심',
        subtitle: '신선한 공기와 맑은 온천수를 벗삼아 휴식을 취하는 곳'
    },
    {
        bg: 'images/main/main_1540462725.jpg',
        title: '온천의 품격',
        subtitle: '부산 동래의 깊은 역사 속에서 피어나는 따뜻한 안식'
    },
    {
        bg: 'images/main/main_1540462732.jpg',
        title: '자연과 하나되다',
        subtitle: '금정산 자락 아래, 도심 속 특별한 휴식을 경험하세요'
    }
];

const heroDots = document.querySelectorAll('.hero__dots .dot');
const heroCounter = document.querySelector('.hero__counter-current');
const heroMovingDot = document.querySelector('.hero__moving-dot');
const heroBgA = document.querySelector('.hero__bg--a');
const heroBgNext = document.querySelector('.hero__bg--next');
const heroTextWrap = document.querySelector('.hero__text');
const heroTitle = document.querySelector('.hero__title');
const heroSubtitle = document.querySelector('.hero__subtitle');

const HERO_DOT_DISTANCE = 14 + 28; // dot size(14px) + gap(28px)
const HERO_ELASTIC = 'transform 0.6s cubic-bezier(0.6, 0, 0.4, 1.4), opacity 0.3s';
const HERO_ANIM_MS = 600;
let heroCurrentIdx = 0;
let heroAutoTimer = null;
let heroDotTimer = null; // 닷 활성화 setTimeout 추적 (race condition 방지)

function heroMoveTo(targetIdx) {
    if (targetIdx === heroCurrentIdx) return;

    // 이전 setTimeout이 남아 있으면 취소 (race condition: 두 닷이 동시에 활성화되는 버그 방지)
    if (heroDotTimer !== null) {
        clearTimeout(heroDotTimer);
        heroDotTimer = null;
    }

    const numDots = heroDots.length;
    const isWrap = (heroCurrentIdx === numDots - 1) && (targetIdx === 0);
    const targetY = targetIdx * HERO_DOT_DISTANCE;
    const slide = heroSlides[targetIdx];

    // --- 닷 인디케이터 ---
    heroDots.forEach(d => d.classList.remove('is-active'));

    if (isWrap) {
        heroMovingDot.style.opacity = '0';
        heroMovingDot.style.transition = 'none';
        heroMovingDot.style.transform = `translateY(${targetY}px)`;
        heroDotTimer = setTimeout(() => {
            heroMovingDot.style.transition = HERO_ELASTIC;
            heroMovingDot.style.opacity = '1';
            heroDots[targetIdx].classList.add('is-active');
            heroDotTimer = null;
        }, 50);
    } else {
        heroMovingDot.style.opacity = '1';
        heroMovingDot.style.transition = HERO_ELASTIC;
        heroMovingDot.style.transform = `translateY(${targetY}px)`;
        heroDotTimer = setTimeout(() => {
            heroDots[targetIdx].classList.add('is-active');
            heroDotTimer = null;
        }, HERO_ANIM_MS);
    }

    // --- 배경 크로스페이드 + 줌아웃 ---
    heroBgNext.style.animation = 'none';
    heroBgNext.offsetHeight; // reflow: 애니메이션 재시작
    heroBgNext.style.animation = 'heroZoomOut 2.5s ease-out forwards';
    heroBgNext.style.backgroundImage = `url('${slide.bg}')`;
    heroBgNext.style.opacity = '1';
    setTimeout(() => {
        heroBgA.style.backgroundImage = `url('${slide.bg}')`;
        // heroBgA를 heroBgNext가 멈춘 지점(1350ms)부터 이어서 재생 → 끊김 없음
        heroBgA.style.animation = 'none';
        heroBgA.offsetHeight;
        heroBgA.style.animation = 'heroZoomOut 2.5s ease-out -1350ms both';
        heroBgNext.style.transition = 'none';
        heroBgNext.style.animation = 'none';
        heroBgNext.style.opacity = '0';
        setTimeout(() => {
            heroBgNext.style.transition = 'opacity 1.2s ease';
        }, 50);
    }, 1350);

    // --- 텍스트 교체 + 슬라이드업 ---
    heroTextWrap.classList.remove('is-animating');
    void heroTextWrap.offsetHeight; // reflow
    heroTitle.textContent = slide.title;
    heroSubtitle.textContent = slide.subtitle;
    heroTextWrap.classList.add('is-animating');

    // --- 카운터 (크로스페이드: ghost를 형제 요소로 → heroCounter opacity 건드리지 않아 깜빡임 없음) ---
    if (heroCounter) {
        // cloneNode: 같은 CSS 클래스(hero__counter-current)를 그대로 사용 → 폰트/색상 완벽 일치
        const ghost = heroCounter.cloneNode(true);
        ghost.style.cssText = 'position:absolute;top:0;left:0;opacity:1;transition:opacity 0.45s ease;pointer-events:none;';
        heroCounter.parentElement.appendChild(ghost); // 형제로 추가, heroCounter 위에 그려짐
        heroCounter.textContent = String(targetIdx + 1).padStart(2, '0'); // 즉시 교체 (ghost가 덮고 있음)
        requestAnimationFrame(() => {
            ghost.style.opacity = '0'; // ghost만 fade-out → 새 숫자 드러남
            setTimeout(() => ghost.remove(), 460);
        });
    }

    heroCurrentIdx = targetIdx;
}

// 초기 세팅 (첫번째 슬라이드)
function heroInit() {
    const slide = heroSlides[0];
    heroBgA.style.backgroundImage = `url('${slide.bg}')`;
    heroBgA.style.animation = 'heroZoomOut 2.5s ease-out forwards';
    heroTitle.textContent = slide.title;
    heroSubtitle.textContent = slide.subtitle;
    heroMovingDot.style.transform = 'translateY(0px)';
    heroDots[0].classList.add('is-active');
    if (heroCounter) heroCounter.textContent = '01';
    heroCurrentIdx = 0;
    // 첫 텍스트 애니메이션
    heroTextWrap.classList.add('is-animating');
}
heroInit();

// 클릭 이벤트
heroDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        heroMoveTo(i);
        heroResetTimer();
    });
});

// 자동 순환 (6.5초: 줌 완료 후 정지 구간 확보)
function heroResetTimer() {
    clearInterval(heroAutoTimer);
    heroAutoTimer = setInterval(() => {
        const next = (heroCurrentIdx + 1) % heroDots.length;
        heroMoveTo(next);
    }, 6500);
}
heroResetTimer();

// 좌우 화살표
const heroArrowLeft = document.querySelector('.hero__arrow--left');
const heroArrowRight = document.querySelector('.hero__arrow--right');

if (heroArrowLeft) {
    heroArrowLeft.addEventListener('click', () => {
        const idx = heroCurrentIdx <= 0 ? heroDots.length - 1 : heroCurrentIdx - 1;
        heroMoveTo(idx);
        heroResetTimer();
    });
}

if (heroArrowRight) {
    heroArrowRight.addEventListener('click', () => {
        const idx = heroCurrentIdx >= heroDots.length - 1 ? 0 : heroCurrentIdx + 1;
        heroMoveTo(idx);
        heroResetTimer();
    });
}


// ============================================
// 7. 주소 복사 기능
// ============================================
const btnCopy = document.querySelector('.btn-copy');
if (btnCopy) {
    btnCopy.addEventListener('click', () => {
        const address = '부산시 동래구 금강공원로 20번길 23';
        navigator.clipboard.writeText(address).then(() => {
            btnCopy.style.color = 'var(--teal)';
            setTimeout(() => {
                btnCopy.style.color = '';
            }, 1500);
        });
    });
}


// ============================================
// 14. WATER RIPPLE - 클릭 파문 인터랙션
// ============================================
(function initRipple() {
    function spawnRing(x, y, delay, isOuter = false) {
        setTimeout(() => {
            const ring = document.createElement('div');
            ring.className = 'ripple-ring ripple-ring--click' + (isOuter ? ' ripple-ring--outer' : '');
            ring.style.cssText = `left:${x}px;top:${y}px;width:120px;height:120px;`;
            document.body.appendChild(ring);
            ring.addEventListener('animationend', () => ring.remove(), { once: true });
        }, delay);
    }

    const bookingPanel = document.getElementById('bookingPanel');
    const fabPillEl    = document.getElementById('fabPill');
    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (bookingPanel && bookingPanel.contains(e.target)) return;
        if (fabPillEl   && fabPillEl.contains(e.target))    return;
        spawnRing(e.clientX, e.clientY, 0, true);
        spawnRing(e.clientX, e.clientY, 140);
    });
})();


// ============================================
// 15. BOOKING WIDGET - 예약/문의 플로팅 위젯
// ============================================
(function initBookingWidget() {
    const widget      = document.getElementById('bookingWidget');
    const fabPill     = document.getElementById('fabPill');
    const trigger     = document.getElementById('bookingTrigger');
    const backdrop    = document.getElementById('bookingBackdrop');
    const panel       = document.getElementById('bookingPanel');
    const closeBtn    = document.getElementById('bookingClose');
    const scrollTopBtn = document.getElementById('fabScrollTop');
    const tabs        = panel.querySelectorAll('.booking-panel__tab');

    if (!widget) return;

    // --- 열기/닫기 ---
    function openPanel() {
        widget.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (fabPill) { fabPill.classList.add('is-hidden'); fabPill.classList.remove('is-open'); }
    }
    function closePanel() {
        widget.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (fabPill) fabPill.classList.remove('is-hidden');
    }

    trigger.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    backdrop.addEventListener('click', closePanel);

    // --- 맨위로 (+ 모바일 메뉴 닫기) ---
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            if (fabPill) fabPill.classList.remove('is-open');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    // --- 멤버십 링크 클릭 시 모바일 메뉴 닫기 ---
    const fabMembership = document.getElementById('fabMembership');
    if (fabMembership && fabPill) {
        fabMembership.addEventListener('click', () => {
            fabPill.classList.remove('is-open');
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && widget.classList.contains('is-open')) closePanel();
    });

    // --- 탭 전환 (콘텐츠 요소 캐싱) ---
    const contents = Array.from(panel.querySelectorAll('.booking-content'));
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            contents.forEach(c => {
                c.id === 'tab-' + target ? c.removeAttribute('hidden') : c.setAttribute('hidden', '');
            });
        });
    });

    // --- 게스트 카운터 (표시 요소 캐싱) ---
    const guestState = { adults: 2, children: 0 };
    const guestValEls = {
        adults:   document.getElementById('adults-val'),
        children: document.getElementById('children-val')
    };

    function updateCounterBtns(target) {
        const min = target === 'adults' ? 1 : 0;
        const max = 4;
        const val = guestState[target];
        panel.querySelectorAll(`.guest-counter__btn[data-target="${target}"]`).forEach(btn => {
            if (btn.dataset.action === 'minus') btn.disabled = (val <= min);
            if (btn.dataset.action === 'plus')  btn.disabled = (val >= max);
        });
    }
    updateCounterBtns('adults');
    updateCounterBtns('children');

    function animateGuestVal(el, newVal, direction) {
        if (!el) return;
        const inClass = direction === 'up' ? 'slide-left-in' : 'slide-right-in';
        // 진행 중인 애니메이션 즉시 취소 후 값 반영
        el.classList.remove('slide-left-out', 'slide-right-out', 'slide-left-in', 'slide-right-in');
        void el.offsetWidth; // reflow
        el.textContent = newVal;
        el.classList.add(inClass);
        el.addEventListener('animationend', function onIn() {
            el.removeEventListener('animationend', onIn);
            el.classList.remove(inClass);
        }, { once: true });
    }

    let guestCooldown = false;
    panel.querySelectorAll('.guest-counter__btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (guestCooldown) return;
            guestCooldown = true;
            setTimeout(() => { guestCooldown = false; }, 300);

            const target = btn.dataset.target;
            const action = btn.dataset.action;
            const min = target === 'adults' ? 1 : 0;
            const max = 4;
            const prev = guestState[target];

            if (action === 'plus'  && prev < max) guestState[target]++;
            if (action === 'minus' && prev > min) guestState[target]--;

            if (guestState[target] !== prev) {
                animateGuestVal(guestValEls[target], guestState[target], action === 'plus' ? 'up' : 'down');
                updateCounterBtns(target);
            }
        });
    });

    // --- 커스텀 select (객실 유형) ---
    const bookingSelect = panel.querySelector('#roomTypeSelect');
    if (bookingSelect) {
        const trigger   = bookingSelect.querySelector('.booking-select__trigger');
        const valueEl   = bookingSelect.querySelector('.booking-select__value');
        const hiddenIn  = bookingSelect.querySelector('input[type="hidden"]');
        const options   = bookingSelect.querySelectorAll('.booking-select__option');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = bookingSelect.classList.toggle('is-open');
            bookingSelect.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('is-active'));
                opt.classList.add('is-active');
                valueEl.textContent = opt.textContent.trim();
                if (hiddenIn) hiddenIn.value = opt.dataset.value;
                bookingSelect.classList.remove('is-open');
                bookingSelect.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (!bookingSelect.contains(e.target)) {
                bookingSelect.classList.remove('is-open');
                bookingSelect.setAttribute('aria-expanded', 'false');
            }
        });
    }


    // --- 날짜 최솟값 설정 ---
    const today = new Date().toISOString().split('T')[0];
    const checkinEl  = document.getElementById('checkin');
    const checkoutEl = document.getElementById('checkout');
    if (checkinEl)  checkinEl.min  = today;
    if (checkoutEl) checkoutEl.min = today;

    if (checkinEl && checkoutEl) {
        checkinEl.addEventListener('change', () => {
            if (checkinEl.value) {
                checkoutEl.min = checkinEl.value;
                if (checkoutEl.value && checkoutEl.value <= checkinEl.value) {
                    checkoutEl.value = '';
                }
            }
        });
    }

    // --- 폼 제출 (더미) ---
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // TODO: 실제 예약 시스템 연동
            alert('예약 문의가 접수되었습니다.\n담당자 확인 후 연락드리겠습니다.');
        });
    }
})();

/* ── hotel-intro bento scroll reveal ── */
(function () {
    const section = document.querySelector('.hotel-intro');
    if (!section) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    io.observe(section);
}());

/* ── 섹션 스크롤 reveal ── */
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sections = document.querySelectorAll(
        '.special-offers, .accommodations, .allday, .brand-film, .location, .membership'
    );
    if (!sections.length) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });
    sections.forEach(s => io.observe(s));
}());



// ============================================
// GNB 서브메뉴 — gnb-left 시작 위치에 맞춰 left padding 동기화
// ============================================
(function () {
    function syncSubmenuPadding() {
        if (window.innerWidth <= 1024) return; // 모바일: CSS fallback 사용
        const gnbWrap = document.querySelector('.header__gnb');
        const gnbLeft = document.querySelector('.gnb-left');
        const gnbRight = document.querySelector('.gnb-right');
        if (!gnbWrap || !gnbLeft || !gnbRight) return;

        const wrapRect  = gnbWrap.getBoundingClientRect();
        const leftRect  = gnbLeft.getBoundingClientRect();
        const rightRect = gnbRight.getBoundingClientRect();
        const pl = Math.round(leftRect.left  - wrapRect.left);
        const pr = Math.round(wrapRect.right - rightRect.right);

        document.querySelectorAll('.gnb-submenu__inner').forEach(el => {
            el.style.paddingLeft  = pl + 'px';
            el.style.paddingRight = pr + 'px';
        });
    }

    // 레이아웃 확정 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncSubmenuPadding);
    } else {
        syncSubmenuPadding();
    }
    window.addEventListener('resize', syncSubmenuPadding);
}());

// ============================================
// GNB 메가메뉴 — Hover 추적 (.mega-open) + 헤더 배경 리플
// 열기/닫기는 CSS :hover가 담당
// JS는 이미지 scale 등 .mega-open 클래스 기반 효과 + 헤더 배경 리플 전용
// ============================================
(function () {
    const gnbWrap = document.querySelector('.header__gnb');
    if (!gnbWrap) return;

    // 리플 캔버스 생성 (헤더 범위 내에서 클리핑)
    const rippleCanvas = document.createElement('div');
    rippleCanvas.className = 'gnb-ripple-canvas';
    gnbWrap.insertBefore(rippleCanvas, gnbWrap.firstChild);

    const gnbItems = gnbWrap.querySelectorAll('.gnb-item');
    let activeItem = null;

    gnbItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // 이미 활성화된 항목 재진입 시 리플 스킵
            const isNewItem = item !== activeItem;
            activeItem = item;

            gnbItems.forEach(i => i.classList.remove('mega-open'));
            if (item.querySelector('.gnb-submenu')) {
                item.classList.add('mega-open');
            }

            // 다른 항목으로 이동할 때만 리플 발생
            if (!isNewItem) return;

            const itemRect = item.getBoundingClientRect();
            const canvasRect = gnbWrap.getBoundingClientRect();
            const x = itemRect.left + itemRect.width / 2 - canvasRect.left;
            const y = itemRect.top + itemRect.height / 2 - canvasRect.top;
            const ripple = document.createElement('span');
            ripple.className = 'gnb-ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            rippleCanvas.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        });
    });

    gnbWrap.addEventListener('mouseleave', () => {
        gnbItems.forEach(i => i.classList.remove('mega-open'));
        activeItem = null;
    });
}());

// ============================================
// 모바일 GNB — 햄버거 토글 + 서브메뉴 아코디언
// ============================================
(function () {
    const toggle = document.querySelector('.gnb-toggle');
    const headerEl = document.getElementById('header');
    if (!toggle || !headerEl) return;

    // has-sub 클래스 부여 (gnb-menu 내 서브메뉴 있는 아이템)
    headerEl.querySelectorAll('.gnb-menu .gnb-item').forEach(item => {
        if (item.querySelector(':scope > .gnb-submenu')) {
            item.classList.add('has-sub');
        }
    });

    // 서브메뉴 아코디언 (모바일 전용)
    headerEl.querySelectorAll('.gnb-item.has-sub > a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth > 1024) return;
            e.preventDefault();
            const item = link.closest('.gnb-item');
            const wasOpen = item.classList.contains('is-open');
            headerEl.querySelectorAll('.gnb-item.is-open').forEach(i => i.classList.remove('is-open'));
            if (!wasOpen) item.classList.add('is-open');
        });
    });

    // 서브메뉴 내 링크 클릭 시 드로어 닫기
    headerEl.querySelectorAll('.gnb-submenu a').forEach(link => {
        link.addEventListener('click', () => closeMenu());
    });

    function closeMenu() {
        headerEl.classList.remove('gnb-open');
        headerEl.querySelectorAll('.gnb-item.is-open').forEach(i => i.classList.remove('is-open'));
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '메뉴 열기');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
        const isOpen = headerEl.classList.toggle('gnb-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
        document.body.style.overflow = isOpen ? 'hidden' : '';
        if (!isOpen) {
            headerEl.querySelectorAll('.gnb-item.is-open').forEach(i => i.classList.remove('is-open'));
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) closeMenu();
    });
}());


// ============================================
// MOBILE RESPONSIVE JS
// ============================================
(function() {

    // 모바일 언어 드롭다운
    const langBtn = document.querySelector('.mob-lang__btn');
    const langMenu = document.querySelector('.mob-lang__menu');
    if (langBtn && langMenu) {
        langBtn.addEventListener('click', () => {
            const isOpen = langMenu.classList.toggle('is-open');
            langBtn.setAttribute('aria-expanded', isOpen);
        });
        document.addEventListener('click', e => {
            if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
                langMenu.classList.remove('is-open');
            }
        });
        langMenu.querySelectorAll('.mob-lang__item').forEach(item => {
            item.addEventListener('click', e => {
                langMenu.querySelectorAll('.mob-lang__item').forEach(i => i.classList.remove('is-active'));
                item.classList.add('is-active');
                langBtn.querySelector('.mob-lang__current').textContent = item.textContent;
                langMenu.classList.remove('is-open');
            });
        });
    }

    // 스페셜오퍼 모바일 드롭다운
    const offersMobBtn = document.querySelector('.offers-mob-select__btn');
    const offersMobMenu = document.querySelector('.offers-mob-select__menu');
    if (offersMobBtn && offersMobMenu) {
        offersMobBtn.addEventListener('click', () => {
            const isOpen = offersMobMenu.classList.toggle('is-open');
            offersMobBtn.setAttribute('aria-expanded', isOpen);
        });
        offersMobMenu.querySelectorAll('.offers-mob-select__item').forEach(item => {
            item.addEventListener('click', () => {
                offersMobMenu.querySelectorAll('.offers-mob-select__item').forEach(i => i.classList.remove('is-active'));
                item.classList.add('is-active');
                offersMobBtn.querySelector('.offers-mob-select__val').textContent = item.textContent;
                offersMobMenu.classList.remove('is-open');
                // 기존 flipToCategory 호출
                if (typeof flipToCategory === 'function') flipToCategory(item.dataset.cat);
            });
        });
        document.addEventListener('click', e => {
            if (!offersMobBtn.contains(e.target) && !offersMobMenu.contains(e.target)) {
                offersMobMenu.classList.remove('is-open');
            }
        });
    }

    // 객실 모바일 드롭다운
    const accMobBtn = document.querySelector('.acc-mob-select__btn');
    const accMobMenu = document.querySelector('.acc-mob-select__menu');
    if (accMobBtn && accMobMenu) {
        accMobBtn.addEventListener('click', () => {
            const isOpen = accMobMenu.classList.toggle('is-open');
            accMobBtn.setAttribute('aria-expanded', isOpen);
        });
        accMobMenu.querySelectorAll('.acc-mob-select__item').forEach(item => {
            item.addEventListener('click', () => {
                accMobMenu.querySelectorAll('.acc-mob-select__item').forEach(i => i.classList.remove('is-active'));
                item.classList.add('is-active');
                accMobBtn.querySelector('.acc-mob-select__val').textContent = item.textContent;
                accMobMenu.classList.remove('is-open');
                // 기존 navLinks click 시뮬레이션
                const target = document.querySelector(`.accommodations__nav-list li a[data-room="${item.dataset.room}"]`);
                if (target) target.click();
            });
        });
        document.addEventListener('click', e => {
            if (!accMobBtn.contains(e.target) && !accMobMenu.contains(e.target)) {
                accMobMenu.classList.remove('is-open');
            }
        });
    }

    // FAB up 버튼 — 메뉴 토글 (모바일 전용, 데스크톱은 display:none)
    const fabUpBtn   = document.getElementById('fabUpBtn');
    const fabPillMob = document.getElementById('fabPill');
    if (fabUpBtn && fabPillMob) {
        fabUpBtn.addEventListener('click', () => {
            fabPillMob.classList.toggle('is-open');
        });
        // 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (fabPillMob.classList.contains('is-open') && !fabPillMob.contains(e.target)) {
                fabPillMob.classList.remove('is-open');
            }
        });
    }

}());
