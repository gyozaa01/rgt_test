# 프론트엔드 사전과제(RGT) - 서교진

## 프로젝트 실행 순서

1. 프로젝트를 클론합니다.
2. 프로젝트 디렉토리로 이동합니다.
3. npm을 사용하여 필요한 모든 의존성을 설치합니다.
4. supabase 테이블 생성 및 설정합니다.

```
CREATE TABLE IF NOT EXISTS books (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  author      TEXT NOT NULL,
  detail      TEXT,
  quantity    INT DEFAULT 0
);

ALTER TABLE books
ADD COLUMN IF NOT EXISTS normalized_title  TEXT,
ADD COLUMN IF NOT EXISTS normalized_author TEXT;

UPDATE books
SET
  normalized_title  = LOWER(REGEXP_REPLACE(title,  '\s+', '', 'g')),
  normalized_author = LOWER(REGEXP_REPLACE(author, '\s+', '', 'g'));

CREATE UNIQUE INDEX IF NOT EXISTS books_normalized_title_author_key
ON books(normalized_title, normalized_author);
```

5. .env.local 작성

```
NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_PROJECT_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
```

Supabase 회원 가입 후 프로젝트를 생성한 뒤, project url과 annon key를 .env.local에 작성

6. npm run dev를 입력하여 프로젝트를 실행합니다.

## 시연 영상

[시연 영상 보기 (Google Drive)](https://drive.google.com/file/d/1h2IKkaxeCNdBZ1QTerxqePy4FqyJpbNM/view?usp=sharing)  
**배포 사이트**: [https://rgtseogyojin.vercel.app/](https://rgtseogyojin.vercel.app/)

## 개발 스택

- **Next.js**  
  : Route Handlers를 사용해, Supabase와 연동된 RESTful API를 직접 설계, 구현함으로써, 책 추가/수정/삭제/조회를 명확히 분리하고 NextRequest/NextResponse를 활용해 HTTP 요청 및 응답 처리를 유연하게 제어할 수 있도록 했습니다.
- **TypeScript**  
  : 프론트엔드와 백엔드 간 타입 안전성을 확보하기 위해 사용했습니다.
- **Tailwind CSS**  
  : 유틸리티 클래스 기반 CSS 프레임워크로, 반응형 레이아웃과 같은 일관된 디자인을 빠르고 간편하게 구성할 수 있습니다.
- **Supabase**  
  : books 테이블을 생성해 책 정보를 저장하고, RESTful API처럼 데이터베이스 연동을 쉽게 구현할 수 있습니다.
- **Tanstack Query(React Query)**  
  : 서버에서 가져온 데이터를 캐싱하고 필요한 시점에 자동 재요청을 처리하여 최적화된 데이터 흐름을 제공하여 성능 향상에 도움이 됩니다.
- **Lucide-react**  
  : 커스터마이징이 쉬운 아이콘 라이브러리로, 디자인 측면에서 깔끔하고 일관된 아이콘을 사용할 수 있게 해줍니다.
- **Vercel**  
  : Github와 연동해두면 코드를 푸시할 때마다 자동으로 배포가 진행되는 장점이 있어 Vercel을 활용하여 배포했습니다.

### +) Next.js에서 SSR 대신 Client 방식을 사용한 이유는?

상점 주인이 관리하기 위해 사용하는 관리자용 페이지에서는 일반적으로 검색 엔진에 노출될 필요가 없습니다. 또한, 검색/필터/추가/수정/삭제 등 실시간 상호작용이 많을수록, 클라이언트 렌더링이 개발과 유지보수 면에서 더 단순하고 효율적일 수 있습니다.  
따라서, SSR 대신 Client 방식을 선택하게 되었습니다.

## 코딩 스타일

- 네이밍 및 코드 컨벤션: 컴포넌트는 PascalCase, 변수와 함수는 camelCase를 사용해 명확하고 직관적인 네이밍 규칙을 따릅니다.
- 주석: 복잡한 로직이나 중요한 부분에 필요한 주석만 추가해 코드의 이해를 돕되, 불필요한 중복 주석은 피하고 코드 자체가 명확하게 의도를 전달할 수 있도록 작성합니다.
- 코드 품질 도구 활용: ESLint를 활용하여 코드 스타일과 품질을 자동으로 검사합니다.

## 개발 환경

- 운영체제: macOS
- Node.js: v20.11.1
- Next.js: 15.1.7
- 패키지 매니저: npm
- 에디터: Visual Studio Code
- 브라우저: Chrome

## 프로젝트 구조 설명

```
RGT
├── .next/
├── node_modules/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── books/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts // 상세 정보 조회, 수정, 책 삭제
│   │   │   │   ├── route.ts // 목록 조회, 책 추가
│   │   ├── components/
│   │   │   ├── AddBookModal.tsx // 새 책 추가 모달
│   │   │   ├── BookItem.tsx // 책 정보
│   │   │   ├── EditBookModal.tsx // 책 수정 모달
│   │   ├── providers/
│   │   │   ├── ReactQueryProvider.tsx // Tanstack Query 설정
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx // 루트 레이아웃 컴포넌트
│   │   ├── page.tsx // 메인 페이지 컴포넌트
│   ├── lib/
│   │   └── supabaseClient.ts // Supabase 클라이언트 초기화 및 설정 파일
├── .env.local // 프로젝트 내부에서 사용하는 환경 변수 파일
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
```

## 서비스 화면

### ➀ 메인 화면

<table>
  <tr>
    <td align="center">
      <img width="450" alt="메인 화면1" src="https://github.com/user-attachments/assets/7176100c-673c-46bf-86b0-06515b1d6aff">
      <br><b>메인 화면1</b>
    </td>
    <td align="center">
      <img width="450" alt="메인 화면2" src="https://github.com/user-attachments/assets/98a1cb0d-fe5c-484e-a519-5147cbfcbe21">
      <br><b>메인 화면2</b>
    </td>
  </tr>
</table>

### 1. 홈 화면 구성

- 헤더: 상단에 프로젝트 타이틀을 표시하고, 클릭 시 새로고침 기능을 담당
- 검색바: 검색어 입력 및 검색 타입(전체/제목/저자) 선택, 검색 버튼
- 책 목록: 검색 조건에 맞는 책들을 불러와 2열 그리드로 배치하며, 한 페이지당 10개 항목
- 플러스 버튼: 우측 하단 고정되어 있으며, 클릭 시 새 책 추가 모달을 열어줌

### 2. 페이지네이션

- 이전/다음 버튼 및 현재 페이지/총 페이지 수를 표시
- 이전/다음 버튼 클릭 시 페이지를 변경
- 검색 조건이 변경되거나 새 책을 추가했을 때, 적절한 페이지로 이동하여 목록을 갱신

---

### ➁ 검색

<table>
  <tr>
    <td align="center">
      <img width="450" alt="검색 타입 드롭다운" src="https://github.com/user-attachments/assets/d76ac77b-fec8-4bad-adf1-02522099e63d">
      <br><b>검색 타입 드롭다운</b>
    </td>
    <td align="center">
      <img width="450" alt="전체 - 키워드 검색" src="https://github.com/user-attachments/assets/61e09426-c81c-4122-b652-f9773f72e8da">
      <br><b>전체 - 키워드 검색</b>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img width="450" alt="제목 - 키워드 검색" src="https://github.com/user-attachments/assets/e4c130db-90a5-472a-8904-92f58935eabf">
      <br><b>제목 - 키워크 검색</b>
    </td>
    <td align="center">
      <img width="450" alt="저자 - 키워드 검색" src="https://github.com/user-attachments/assets/43124b4d-8841-4265-9731-98fee7143a05">
      <br><b>저자 - 키워드 검색</b>
    </td>
  </tr>
</table>

### 1. 검색바

- 검색 타입 드롭다운: 전체/제목/저자 선택 가능하며, 초기 타입은 전체로 설정
- 검색어 입력 필드: 키워드를 입력
- 검색 버튼: 클릭 시 검색 수행하며 엔터 키로도 검색 가능

### 2. 검색 로직

- 전체: 제목 또는 저자에 해당 키워드가 포함된 책을 검색
- 제목: 제목에만 키워드가 포함된 책을 검색
- 저자: 저자에만 키워드가 포함된 책을 검색
- 검색 버튼 클릭(또는 엔터 입력) 시, 검색 조건(타입, 키워드)에 따라 API를 호출하여 해당 목록을 필터링해 표시

---

### ➂ 새 책 추가

<table>
  <tr>
    <td align="center">
      <img width="450" alt="책 추가 모달" src="https://github.com/user-attachments/assets/41286317-b58b-4dab-916c-b6c76deb492c">
      <br><b>책 추가 모달</b>
    </td>
    <td align="center">
      <img width="450" alt="필수 입력 알림" src="https://github.com/user-attachments/assets/07192e30-f584-4f26-a642-a66cbe42c57c">
      <br><b>필수 입력 알림</b>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img width="450" alt="중복 여부 알림" src="https://github.com/user-attachments/assets/530f5efa-5114-41a5-bf35-452afa1884e1">
      <br><b>중복 여부 알림</b>
    </td>
    <td align="center">
      <img width="450" alt="책 추가 성공" src="https://github.com/user-attachments/assets/b49b1304-f526-44c4-82ca-336c58472858">
      <br><b>책 추가 성공</b>
    </td>
  </tr>
</table>

### 1. 책 추가 모달

- 플러스 버튼 클릭 시 책 추가 모달이 열림.
- 제목, 저자, 상세 정보 필드를 제공하며, 제목과 저자는 필수 입력값임.
- 취소 버튼 클릭 시 모달을 닫고 입력값을 초기화
- 저장 버튼 클릭 시 서버로 새 책 정보를 전송하고, 성공 시 "책 추가 성공" 알림 띄움.
- 새 책이 추가되면, 책 목록을 다시 불러와서 추가된 책이 속한 페이지를 자동으로 보여줌.

### 2. 유효성 검증 및 에러 처리

- 필수 입력: 제목과 저자를 모두 입력해야 하며, 둘 중 하나라도 비어 있으면 에러 알림이 표시
- 상세 정보: 선택 사항 -> 비어 있어도 저장 가능
- 중복 체크: DB에서 동일(공백, 대소문자 무시)한 제목과 저자를 가진 책이 이미 있는지 확인  
   ex1) "채식주의자, 한강"과 "채식 주의자, 한강"은 동일한 책으로 간주  
   ex2) “EnglishBook, Hello”와 “English BOOK, hellO” 역시 동일한 책으로 간주
- DB에서 중복 시 409 상태 코드를 반환 → 클라이언트에서 “이미 같은 제목과 저자의 책이 존재합니다.” 알림을 띄워줌.

---

### ➃ 책 정보

<table>
  <tr>
    <td align="center">
      <img width="900" alt="책 정보 구성" src="https://github.com/user-attachments/assets/1793308e-d34a-4641-a653-22954ff3b3ae">
      <br><b>책 정보 구성</b>
    </td>
  </tr>
</table>

### 1. 책 정보 구성

- 책 표지: 외부 이미지 서비스([picsum.photos](https://picsum.photos))를 사용하여, `https://picsum.photos/200/300?random=\${book.id}`형태로 랜덤 이미지 불러옴.
- 책 정보
  - 제목, 저자, 수량을 표시
  - 수량은 - 버튼으로 감소, +버튼으로 증가
- 수정/삭제 버튼
  - 연필 아이콘 클릭하면, 책 수정 모달이 열리고 상세 정보(제목/저자/상세/수량) 변경 가능
  - 휴지통 아이콘 클릭하면 해당 책이 목록에서 제거되며, DB에서도 삭제

### 2. 책 표지 이미지 최적화

- Next.js의 Image 컴포넌트를 활용하여 자동으로 이미지 최적화 수행
- next.config.ts에서 remotePatterns 옵션을 설정해 picsum.photos 도메인 이미지를 허용
- 시간 단축 효과: 이미지 로딩 시간이 약 26ms -> 약 2ms로 눈에 띄게 개선됨.
  ![Image](https://github.com/user-attachments/assets/429d362d-9117-4508-bfbe-86d5b58ea595)
  ![Image](https://github.com/user-attachments/assets/0ebdfb07-853c-4926-a6c7-b4bee26754b9)

---

### ➄ 책 수정 및 삭제

<table>
  <tr>
    <td align="center">
      <img width="300" alt="책 수정 모달" src="https://github.com/user-attachments/assets/cf5e846a-e111-4926-b7ae-9d3dc84200a0">
      <br><b>책 수정 모달</b>
    </td>
    <td align="center">
      <img width="300" alt="수량 변경" src="https://github.com/user-attachments/assets/cd88c0aa-5cb5-4d69-81be-07e01bc457ab">
      <br><b>수량 변경</b>
    </td>
    <td align="center">
      <img width="300" alt="책 삭제" src="https://github.com/user-attachments/assets/1ddef60d-8d7c-4daf-b0f6-5861f0c0ba4b">
      <br><b>책 삭제</b>
    </td>
  </tr>
</table>

### 1. 책 수정

- 연필 아이콘 클릭하면, 책 수정 모달이 열리고 상세 정보(제목/저자/상세/수량) 변경 가능
- 책 추가와 마찬가지로 유효성 검사 및 에러 처리

### 2. 책 삭제

- 휴지통 아이콘 클릭하면 해당 책이 목록에서 제거되며, DB에서도 삭제

## Supabase

### books 테이블

![Image](https://github.com/user-attachments/assets/10644f0f-2375-4eb2-88f9-88f939c008e8)

### 컬럼

![Image](https://github.com/user-attachments/assets/16502a07-63de-42a0-86ce-ce7bed22fa1b)

- id: 기본 키(자동 증가)
- title, author: 책 제목과 저자(필수)
- detail: 책 상세 정보
- quantity: 책 수량(기본 값 -> 0)
- normalize_title, normalized_autor
  - title, author에서 공백을 제거한 뒤 소문자로 변환해 저장하는 정규화 컬럼
  - 중복 체크 시 대소문자, 공백을 무시하도록 고유 인덱스 걸어둠
