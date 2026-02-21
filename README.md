# 최성진 (Choi Seongjin) — Fullstack Developer Portfolio

딥 퍼플 다크 그라디언트 + 네온 글로우 + 고급스러운 이커머스 감성의 풀스택 개발자 포트폴리오입니다.

## 제작 방식

- **HTML + CSS + Vanilla JS** (프레임워크 없음)
- 배포: GitHub Pages / Vercel

## 로컬 실행

```bash
# 현재 폴더를 기준으로
npx serve .
# 또는
python -m http.server 8080
```

브라우저에서 `http://localhost:3000` (또는 해당 포트)로 접속합니다.

## 폴더 구조

```
seongjin-portfolio/
├── index.html
├── assets/
│   ├── css/        # 스타일시트
│   ├── js/         # 스크립트 모듈
│   ├── images/     # 프로필, 프로젝트 썸네일, 아이콘
│   └── fonts/
├── components/     # 헤더, 푸터, 프로젝트 카드 HTML 템플릿
└── README.md
```

## 주요 기능

- 스크롤 진행률 바 및 헤더 표시/숨김
- Hero 타이핑 이펙트 및 파티클 배경
- 스킬 카테고리 탭 및 스크롤 애니메이션
- 프로젝트 상세 모달
- 숫자 카운트업 (Stats)
- 연락처 폼 UI (데모), 이메일 복사 토스트
- 접근성: aria-label, prefers-reduced-motion 대응

## 라이선스

© 2024 Choi Seongjin. Designed & Developed by 최성진.
