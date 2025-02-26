"use client";

import { Minus, PlusCircle } from "lucide-react";

// Book 타입 정의
type Book = {
  id: number;
  title: string;
  author: string;
  detail?: string;
  quantity: number;
};

interface EditBookModalProps {
  show: boolean;
  book: Book | null; // 현재 편집 중인 책
  onChangeBook: (updated: Book | null) => void; // 책 정보 변경 시 콜백
  onClose: () => void; // 모달 닫기
  onSave: () => void; // 저장
}

export default function EditBookModal({
  show,
  book,
  onChangeBook,
  onClose,
  onSave,
}: EditBookModalProps) {
  if (!show || !book) return null;

  // 제목 변경
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!book) return;
    onChangeBook({ ...book, title: e.target.value });
  };

  // 저자 변경
  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!book) return;
    onChangeBook({ ...book, author: e.target.value });
  };

  // 상세 정보 변경
  const handleDetailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!book) return;
    onChangeBook({ ...book, detail: e.target.value });
  };

  // 수량 감소
  const handleDecrease = () => {
    if (!book) return;
    onChangeBook({
      ...book,
      quantity: Math.max(book.quantity - 1, 0),
    });
  };

  // 수량 증가
  const handleIncrease = () => {
    if (!book) return;
    onChangeBook({
      ...book,
      quantity: book.quantity + 1,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-semibold mb-4">책 수정</h2>

        {/* 제목 */}
        <div className="mb-2">
          <label className="block text-sm font-medium">제목</label>
          <input
            type="text"
            className="border rounded w-full px-2 py-1"
            value={book.title}
            onChange={handleTitleChange}
          />
        </div>

        {/* 저자 */}
        <div className="mb-2">
          <label className="block text-sm font-medium">저자</label>
          <input
            type="text"
            className="border rounded w-full px-2 py-1"
            value={book.author}
            onChange={handleAuthorChange}
          />
        </div>

        {/* 상세 정보 */}
        <div className="mb-2">
          <label className="block text-sm font-medium">상세 정보</label>
          <textarea
            className="border rounded w-full px-2 py-1"
            rows={3}
            value={book.detail || ""}
            onChange={handleDetailChange}
          />
        </div>

        {/* 수량 */}
        <div className="mb-4">
          <label className="block text-sm font-medium">수량</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              className="p-1 border rounded hover:bg-gray-100"
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center">{book.quantity}</span>
            <button
              onClick={handleIncrease}
              className="p-1 border rounded hover:bg-gray-100"
            >
              <PlusCircle size={16} />
            </button>
          </div>
        </div>

        {/* 취소 / 저장 버튼 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              onChangeBook(null); // 편집 중인 Book을 null로
            }}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
