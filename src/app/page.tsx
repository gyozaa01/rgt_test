"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BookItem from "@/app/components/BookItem";
import AddBookModal from "@/app/components/AddBookModal";
import EditBookModal from "@/app/components/EditBookModal";
import { Search, Plus } from "lucide-react";

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
  // 페이지네이션
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
  const [showEditModal, setShowEditModal] = useState(false);

  // 새 책 입력 값
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newDetail, setNewDetail] = useState("");

  // 편집용
  const [editBook, setEditBook] = useState<Book | null>(null);

  // Tanstack Query: 목록 조회
  const fetchBooks = async (): Promise<BookListResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      searchType: appliedSearchType,
      keyword: appliedKeyword,
    });
    const res = await fetch(`/api/books?${params.toString()}`);
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "목록 조회 실패");
    }
    return res.json();
  };

  // useQuery 훅
  const {
    data: booksData,
    isLoading,
    isError,
    error,
    // refetch
  } = useQuery<BookListResponse>({
    queryKey: ["books", page, appliedSearchType, appliedKeyword],
    queryFn: fetchBooks,
  });

  // booksData가 없을 수 있으므로
  const books = booksData?.data || [];
  const total = booksData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // 검색 버튼 클릭 시
  const handleSearch = () => {
    setPage(1); // 첫 페이지로 이동
    setAppliedKeyword(searchInput);
    setAppliedSearchType(searchTypeInput);
  };

  // Tanstack Query: Mutation
  const queryClient = useQueryClient();

  // 1) 새 책 추가
  const addBookMutation = useMutation({
    mutationFn: async (newBook: {
      title: string;
      author: string;
      detail: string;
    }) => {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBook, quantity: 0 }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        switch (res.status) {
          case 400:
            // 필수값 누락 or 기타 잘못된 요청
            throw new Error(error || "잘못된 요청입니다.");
          case 409:
            // 중복 에러
            throw new Error("이미 같은 제목과 저자의 책이 존재합니다.");
          case 500:
            // 서버 내부 에러
            throw new Error(
              "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            );
          default:
            // 그 외
            throw new Error(error || "알 수 없는 오류가 발생했습니다.");
        }
      }
      return (await res.json()) as Book;
    },
    onSuccess: async (createdBook) => {
      // 모달 닫기 & 입력값 초기화
      setNewTitle("");
      setNewAuthor("");
      setNewDetail("");
      setShowAddModal(false);

      // 목록 캐시 무효화 → 자동 refetch
      await queryClient.invalidateQueries({ queryKey: ["books"] });

      // 생성된 책이 전체 목록에서 몇 번째인지 확인하기 위해,
      // 다시 전체 데이터(검색X, pageSize=999999) 불러오기
      const allRes = await fetch(
        `/api/books?searchType=전체&keyword=&pageSize=999999`
      );
      if (!allRes.ok) {
        setPage(1);
        setAppliedSearchType("전체");
        setAppliedKeyword("");
        return;
      }
      const allData: BookListResponse = await allRes.json();
      // 새 책 위치 찾기
      const index = allData.data.findIndex((b) => b.id === createdBook.id);
      if (index === -1) {
        // 못 찾으면 그냥 1페이지로
        setPage(1);
        setAppliedSearchType("전체");
        setAppliedKeyword("");
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
    },
    onError: (err) => {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    },
  });

  // 2) 책 삭제
  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: number) => {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const { error } = await res.json();
        throw new Error(error || "삭제 실패");
      }
      return bookId;
    },
    onSuccess: async () => {
      // 목록 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err) => {
      if (err instanceof Error) {
        alert(err.message);
      }
    },
  });

  // 3) 책 수정 & 수량 변경
  const updateBookMutation = useMutation({
    mutationFn: async (payload: {
      id: number;
      title?: string;
      author?: string;
      detail?: string;
      quantity?: number;
    }) => {
      const { id, ...rest } = payload;
      const res = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      });
      if (!res.ok) {
        const { error } = await res.json();
        switch (res.status) {
          case 400:
            throw new Error(error || "잘못된 요청입니다.");
          case 409:
            throw new Error("이미 같은 제목과 저자의 책이 존재합니다.");
          case 404:
            throw new Error("수정 대상 책을 찾을 수 없습니다.");
          case 500:
            throw new Error("서버 오류가 발생했습니다.");
          default:
            throw new Error(error || "알 수 없는 오류가 발생했습니다.");
        }
      }
      return (await res.json()) as Book;
    },
    onSuccess: async () => {
      // 목록 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ["books"] });

      // 만약 편집 모달에서 수정했다면, 모달 닫기
      setShowEditModal(false);
      setEditBook(null);
    },
    onError: (err) => {
      if (err instanceof Error) {
        alert(err.message);
      }
    },
  });

  const handleCloseAddModal = () => {
    // 모달을 닫기 전에 입력값을 리셋
    setNewTitle("");
    setNewAuthor("");
    setNewDetail("");
    setShowAddModal(false);
  };

  // 새 책 추가
  const handleAddBook = () => {
    if (!newTitle || !newAuthor) {
      alert("제목, 저자는 필수입니다.");
      return;
    }
    addBookMutation.mutate({
      title: newTitle,
      author: newAuthor,
      detail: newDetail,
    });
  };

  // 책 삭제
  const handleDeleteBook = (bookId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    deleteBookMutation.mutate(bookId);
  };

  // 수량 +/-
  const handleUpdateQuantity = (book: Book, newQty: number) => {
    updateBookMutation.mutate({ id: book.id, quantity: newQty });
  };

  // 책 편집(모달 열기)
  const openEditModal = (book: Book) => {
    setEditBook(book);
    setShowEditModal(true);
  };

  // 책 편집(저장)
  const handleEditBookSave = () => {
    if (!editBook) return;
    updateBookMutation.mutate({
      id: editBook.id,
      title: editBook.title,
      author: editBook.author,
      detail: editBook.detail,
      quantity: editBook.quantity,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    const errMsg = error instanceof Error ? error.message : "알 수 없는 오류";
    return (
      <div className="p-4 text-red-500">에러가 발생했습니다: {errMsg}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="p-4 bg-white shadow flex items-center justify-between">
        <h1
          className="text-xl font-bold"
          onClick={() => window.location.reload()}
        >
          RGT 서점
        </h1>
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

      {/* 책 목록 / 검색 결과 */}
      {books.length === 0 ? (
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
              <BookItem
                key={book.id}
                book={book}
                onDecrease={(b) =>
                  handleUpdateQuantity(b, Math.max(b.quantity - 1, 0))
                }
                onIncrease={(b) => handleUpdateQuantity(b, b.quantity + 1)}
                onEdit={openEditModal}
                onDelete={handleDeleteBook}
              />
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

      {/* 새 책 추가 모달 */}
      <AddBookModal
        show={showAddModal}
        titleValue={newTitle}
        authorValue={newAuthor}
        detailValue={newDetail}
        onChangeTitle={(val) => setNewTitle(val)}
        onChangeAuthor={(val) => setNewAuthor(val)}
        onChangeDetail={(val) => setNewDetail(val)}
        onClose={handleCloseAddModal}
        onSave={handleAddBook}
      />

      {/* 책 편집 모달 */}
      <EditBookModal
        show={showEditModal}
        book={editBook}
        onChangeBook={(updated) => setEditBook(updated)}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditBookSave}
      />

      {/* 오른쪽 하단 -> 새 책 추가 버튼 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
