"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus } from "lucide-react";
import Image from "next/image";

type Book = {
  id: number;
  title: string;
  author: string;
  detail?: string;
  quantity: number;
};

type BookListResponse = {
  total: number;
  page: number;
  pageSize: number;
  data: Book[];
};

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // 검색 입력 상태
  const [searchInput, setSearchInput] = useState("");
  const [searchTypeInput, setSearchTypeInput] = useState<
    "전체" | "제목" | "저자"
  >("전체");

  // 실제 API 호출에 사용하는 검색 상태
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [appliedSearchType, setAppliedSearchType] = useState<
    "전체" | "제목" | "저자"
  >("전체");

  // 새 책 추가 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);

  // 새 책 입력 값
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newDetail, setNewDetail] = useState("");

  // 책 목록 불러오기
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        searchType: appliedSearchType,
        keyword: appliedKeyword,
      });
      const res = await fetch(`/api/books?${params.toString()}`);
      const json: BookListResponse = await res.json();
      setBooks(json.data);
      setTotal(json.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, appliedSearchType, appliedKeyword]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // 검색 버튼 클릭 시
  const handleSearch = () => {
    setPage(1); // 첫 페이지로 이동
    setAppliedKeyword(searchInput);
    setAppliedSearchType(searchTypeInput);
  };

  // 책 추가
  const handleAddBook = async () => {
    try {
      if (!newTitle || !newAuthor) {
        alert("제목, 저자는 필수입니다.");
        return;
      }
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          author: newAuthor,
          detail: newDetail,
          quantity: 0, // 수량은 0으로 초기화
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        alert(error || "추가 실패");
        return;
      }
      // 새 책 객체
      const createdBook: Book = await res.json();

      // 모달 닫기 & 입력 초기화
      setNewTitle("");
      setNewAuthor("");
      setNewDetail("");
      setShowAddModal(false);

      // 전체 목록 재조회(정렬된 순서로)
      const allRes = await fetch(
        `/api/books?searchType=전체&keyword=&pageSize=999999`
      );
      if (!allRes.ok) {
        const { error } = await allRes.json();
        throw new Error(error || "전체 목록 조회 실패");
      }
      const allData: BookListResponse = await allRes.json();

      // 새 책 위치 찾기
      const index = allData.data.findIndex((b) => b.id === createdBook.id);
      if (index === -1) {
        // 못 찾으면 그냥 1페이지로
        setPage(1);
        setAppliedSearchType("전체");
        setAppliedKeyword("");
        setSearchInput("");
        setSearchTypeInput("전체");
        return;
      }

      // 새 책이 속한 페이지 계산
      const newPage = Math.floor(index / pageSize) + 1;

      // 필터 전체로 변경 & 해당 페이지로 이동
      setAppliedSearchType("전체");
      setAppliedKeyword("");
      setSearchInput("");
      setSearchTypeInput("전체");
      setPage(newPage);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="p-4 bg-white shadow flex items-center justify-between">
        <h1 className="text-xl font-bold">RGT 서점</h1>
      </header>

      {/* 검색 영역 */}
      <section className="p-4 flex flex-col md:flex-row items-start md:items-center gap-2">
        <select
          className="border px-2 py-1 rounded"
          value={searchTypeInput}
          onChange={(e) =>
            setSearchTypeInput(e.target.value as "전체" | "제목" | "저자")
          }
        >
          <option value="전체">전체</option>
          <option value="제목">제목</option>
          <option value="저자">저자</option>
        </select>
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="border px-2 py-1 rounded w-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-1"
            onClick={handleSearch}
          >
            <Search size={16} />
          </button>
        </div>
      </section>

      {/* 로딩 중 */}
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : books.length === 0 ? (
        // 책이 0개일 때
        <div className="p-4 text-center text-gray-500">
          {appliedKeyword === "" && appliedSearchType === "전체"
            ? "현재 등록된 책이 없습니다."
            : "검색 결과가 없습니다."}
        </div>
      ) : (
        <>
          {/* 책 목록 */}
          <main className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="border rounded bg-white shadow p-4 flex gap-4"
              >
                {/* 책 표지 (랜덤) */}
                <div className="w-1/3">
                  <Image
                    src={`https://picsum.photos/200/300?random=${book.id}`}
                    alt="책 표지"
                    width={200}
                    height={300}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
                {/* 책 정보 */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{book.title}</h2>
                    <p className="text-gray-600">저자: {book.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </main>

          {/* 페이지네이션 */}
          <div className="flex justify-center items-center gap-4 py-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100"
            >
              이전
            </button>
            <span>
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() =>
                setPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100"
            >
              다음
            </button>
          </div>
        </>
      )}

      {/* 오른쪽 하단 -> 새 책 추가 버튼 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700"
      >
        <Plus size={24} />
      </button>

      {/* 새 책 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-80">
            <h2 className="text-xl font-semibold mb-4">책 추가하기</h2>
            <div className="mb-2">
              <label className="block text-sm font-medium">제목</label>
              <input
                type="text"
                className="border rounded w-full px-2 py-1"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium">저자</label>
              <input
                type="text"
                className="border rounded w-full px-2 py-1"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">상세 정보</label>
              <textarea
                className="border rounded w-full px-2 py-1"
                rows={3}
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setNewTitle("");
                  setNewAuthor("");
                  setNewDetail("");
                  setShowAddModal(false);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleAddBook}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
