# 최성진 (Choi Seongjin) — Web & PLC Automation Engineer Portfolio

HTML + CSS + Vanilla JS로 제작한 웹 개발 및 PLC 자동화 엔지니어 포트폴리오 웹사이트입니다.  
딥 퍼플 다크 그라디언트와 네온 글로우, 코드 에디터 감성의 이커머스급 UI를 목표로 합니다.

---

## 📁 프로젝트 구조

```
seongjin-portfolio/
├── index.html
├── assets/
│   ├── css/
│   │   ├── reset.css
│   │   ├── variables.css      # 디자인 시스템 (컬러, 간격, 글로우)
│   │   ├── global.css
│   │   ├── layout.css
│   │   ├── components.css     # 버튼, 카드, 폼, 모달, 토스트
│   │   ├── sections.css       # 섹션별 스타일
│   │   ├── animations.css
│   │   └── mobile.css
│   ├── js/
│   │   ├── main.js            # 진입점, count-up, 폼, 메뉴, TOP
│   │   ├── scroll.js          # 헤더/진행률/네비 활성화
│   │   ├── typing.js          # Hero 타이핑 이펙트
│   │   ├── skills.js         # 스킬 카드 스크롤 애니메이션
│   │   ├── components-loader.js # header/footer HTML 로드 후 주입
│   │   ├── modal.js           # 프로젝트 상세 모달
│   │   ├── tab.js             # 스킬 카테고리 탭
│   │   ├── particles.js       # Hero 배경 파티클
│   │   └── utils.js           # 디바운스, 토스트, 클립보드
│   ├── images/
│   │   ├── profile/
│   │   ├── projects/
│   │   └── icons/
│   └── fonts/
├── components/
│   ├── header.html   ← index에서 로드하여 #header-container에 주입
│   ├── footer.html  ← index에서 로드하여 #footer-container에 주입
│   └── project-card.html
└── README.md
```

---

## 🎨 디자인

- **Primary**: #7B2D8B (딥 퍼플)
- **Neon**: Violet #B06FD8, Pink #E91E8C, Cyan #00D4FF, Green #00FF94 (코드/터미널)
- **Font**: Pretendard, Noto Sans KR, JetBrains Mono
- **기타**: glassmorphism, 보라 글로우 섀도우, 스크롤 진행률 바

---

## 📱 섹션 구성

1. **Header** — CSJ. 로고, ABOUT/SKILLS/WORKS/CONTACT, 스크롤 시 숨김/표시, 상단 3px 진행률 바, 모바일 풀스크린 메뉴
2. **Hero** — 파티클 배경, 코드 워터마크, 타이핑(Web Developer / PLC Automation Engineer / Web & PLC Automation Engineer), 코드 에디터 카드, CTA
3. **Marquee** — 기술 스택 무한 스크롤
4. **About Me** — 프로필(CSJ 아바타), 소개 텍스트, 이메일 복사, 이력서 버튼
5. **Tech Stack** — 탭(Frontend/Backend/Database/DevOps/Tools), 스킬 카드 그리드
6. **Stats** — 숫자 count-up (커피, 코드 줄, 프로젝트, 기술)
7. **Works** — 프로젝트 카드 3개, 자세히 보기 모달
8. **Contact** — 연락처 링크, 문의 폼(UI만)
9. **Footer** — CSJ., 슬로건, 링크, ©

---

## 🚀 실행 및 배포

- **로컬**: `index.html` 직접 열기 또는 `npx serve .`
- **배포**: GitHub Pages 또는 Vercel에 저장소 연결 후 배포. 모든 경로는 상대 경로입니다.

---

© 2026 Choi Seongjin. Designed & Developed by 최성진.
