---
name: woori-won-design
description: Use the repository's WON Banking mobile design rules when editing banking screens, shared UI, navigation, or WON하는 만기 demo flows.
---

# WON뱅킹 데모 디자인

- 프로젝트 루트의 [DESIGN.md](../../../DESIGN.md)를 읽고 모바일 화면의 규칙으로 적용한다. 공개 웹 자료의 범위와 앱 캡처에서 채택한 결정을 구분한다.
- Codex에 설치된 Oh My Design의 `omd-apply`를 화면 수정에 활용한다. Claude Code에 해당 번들이 없어도 이 파일과 DESIGN.md만으로 같은 규칙을 적용할 수 있다.
- 공용 토큰은 `src/design/tokens.ts`, 뱅킹 화면은 `src/features/banking/`에 있다. 기존 React Router 경로와 Zustand 상태를 활용하고, 홈과 전체 메뉴의 만기 진입점을 유지한다.
- 신규 뱅킹 화면의 예시 데이터는 시연 용도로 표시한다. 자유 발화 확인, 상품 추천, 투자 적합성·숙려, 상담, 자동 재예치의 기존 상태와 검증을 보존한다.
- 빌드와 기존 테스트를 실행하고, 브라우저를 쓸 수 있으면 390px와 좁은 모바일 화면에서 홈 → WON하는 만기, 하단 메뉴와 뒤로 가기를 검증한다.
