---
name: WON하는 만기 데모
colors:
  brand-deep-blue: '#0067AC'
  brand-light-blue: '#20C4F4'
  brand-blue: '#0083CA'
  canvas: '#FFFFFF'
  app-neutral: '#EFF2F4'
  app-sky: '#E3F2FC'
  stage: '#DFECF3'
  ink: '#303840'
  secondary: '#505A64'
  muted: '#63717E'
  action: '#0967CF'
  action-pressed: '#0754AC'
  visual-blue: '#268CF3'
  line: '#E2E7EC'
  negative: '#C8272D'
rounded:
  card: 18px
  button: 12px
  pill: 999px
typography:
  app-title:
    fontSize: 20px
    fontWeight: 700
  amount:
    fontSize: 30px
    fontWeight: 750
  body:
    fontSize: 15px
    fontWeight: 500
---

# WON하는 만기 데모

## Experience {#experience}

우리WON뱅킹 모바일 화면을 참고한 아이디어 경진대회 데모다. 앱의 홈과 전체 메뉴, 알림 및 만기 계좌에서 기존 WON하는 만기 기능으로 이동한다. 고객 선택, 자유 발화 해석, 예금·투자·상담 흐름, 자동 재예치, 수익성 시뮬레이터와 엔진 패널을 유지한다.

## Foundations {#foundations}

- CI 색상 세 가지는 [제공된 공개 웹 디자인 자료](docs/design/woori-bank-public-web.md)에서 가져왔다. 모바일 회색·하늘색 배경, 둥근 흰색 카드와 액션 파랑은 사용자가 제공한 앱 화면을 바탕으로 이 데모에서 채택한 값이다.
- 상단 중립 회색에서 하단 하늘색으로 옅게 전환한다. 저축진단은 흰색을 사용한다. 카드 명세는 선명한 파랑 그라디언트와 흰색 큰 금액으로 강조한다.
- 본문은 `ink`, 보조 정보는 `secondary`와 `muted`, 링크 및 주요 버튼은 `action`을 사용한다. 그래프와 삽화는 밝은 파랑을 쓸 수 있다.

## Typography & assets {#typography-assets}

기존 Pretendard와 한국어 시스템 대체 글꼴을 쓴다. 금액은 24–32px, 제목은 18–20px, 카드 제목은 16–17px로 두고 수치는 줄바꿈하지 않는다. Lucide 선형 아이콘에 하늘색 계열의 삽화와 원형 금융사 마크를 조합한다. 마크와 삽화는 이 데모용 재구성이다.

## Components & states {#components-states}

- 홈: 이름 아래 밑줄, 우측 상담·알림·전체 메뉴, 만기 안내와 둥근 계좌 카드. 계좌 카드의 금액을 크게 표시하고 주요 계좌에는 파란 안내 줄을 붙인다.
- 자산: 금융사 아이콘, 계좌명, 가상 계좌번호, 잔액, 작은 외곽선 버튼. 저축진단은 파란 선·영역 차트와 6/12개월 전환을 사용한다.
- 유니버설뱅킹: 밑줄로 선택한 상단 탭, 파란 명세서, 금액과 즉시결제 버튼.
- 혜택: 추천 서비스 아이콘 네 개와 흰색 생활편의 목록.
- 소비: 현황/분석 탭, 달력/예산 전환, 일요일 빨강과 선택일 파랑. 선택 날짜를 바꾸면 지출 상세를 갱신한다.
- 스마트폰 바탕화면 시연: 어두운 파랑 배경 위에 기기 상태 표시줄, 시계, 앱 아이콘을 배치한다. 잠시 뒤 밝은 만기 알림 배너를 띄우고, 탭하면 만기 요약으로 연결한다. 앱 안에서 재현하는 장면이며 브라우저 권한 없이 다시 재생할 수 있다.
- 클릭 가능한 항목은 내부 화면으로 연결하고 키보드 포커스를 표시한다. 시연 기기 알림을 누르면 기존 만기 요약을 연다. 기존 만기 거래 버튼은 기존 시뮬레이션 상태와 검증 절차를 그대로 사용한다.

## Layout & platforms {#layout-platforms}

모바일 우선. 좌우 16px 여백, 18px 카드 모서리, 16–22px 카드 간격, 44px 이상 주요 터치 영역을 사용한다. 데스크톱은 약 400px 앱 영역을 가운데에 표시한다. 앱 헤더와 하단 탐색은 고정하고 본문을 스크롤한다. 운영체제 상태 표시줄은 데스크톱 미리보기 안에만 표시한다.

## Content & locales {#content-locales}

한국어 존댓말, 원 단위와 천 단위 구분, 짧은 동작 중심 문구를 사용한다. 연결 계좌, 명세서, 소비 내역 및 생활 서비스는 데모 데이터로 표시한다. 앱 안의 시연 안내를 유지한다.

## Governance {#governance}

화면의 모양은 첨부한 모바일 앱 캡처가 우선한다. 공개 웹 자료는 CI와 출처 범위 확인에 사용한다. 공개 웹의 각진 제어 요소나 공개 웹의 글꼴 정보를 모바일 앱 규칙으로 간주하지 않는다. 화면 수정 시 이 문서와 `src/design/tokens.ts`, `src/features/banking/banking.css`를 함께 맞추고, 모바일 화면과 기존 만기 흐름을 확인한다.
