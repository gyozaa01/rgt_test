"use client";

import Image from "next/image";
import { Minus, PlusCircle, Edit, Trash2 } from "lucide-react";

type Book = {
  id: number;
  title: string;
  author: string;
  detail?: string;
  quantity: number;
};

interface BookItemProps {
  book: Book;
  onDecrease: (book: Book) => void;
  onIncrease: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (bookId: number) => void;
}

export default function BookItem({
  book,
  onDecrease,
  onIncrease,
  onEdit,
  onDelete,
}: BookItemProps) {
  return (
    <div className="border rounded bg-white shadow p-4 flex flex-col sm:flex-row gap-4">
      {/* 책 표지 */}
      <div className="w-full sm:w-1/3">
        <Image
          src={`https://picsum.photos/200/300?random=${book.id}`}
          alt="책 표지"
          width={200}
          height={300}
          className="w-full h-auto object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* 책 정보 */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold">{book.title}</h2>
          <p className="text-gray-600">저자: {book.author}</p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {/* 수량 - 버튼 */}
          <button
            onClick={() => onDecrease(book)}
            className="p-1 border rounded hover:bg-gray-100"
          >
            <Minus size={16} />
          </button>

          <span className="w-6 text-center">{book.quantity}</span>

          {/* 수량 + 버튼 */}
          <button
            onClick={() => onIncrease(book)}
            className="p-1 border rounded hover:bg-gray-100"
          >
            <PlusCircle size={16} />
          </button>

          {/* 편집 버튼 */}
          <button
            onClick={() => onEdit(book)}
            className="ml-auto text-gray-600 hover:text-blue-600"
          >
            <Edit size={18} />
          </button>

          {/* 삭제 버튼 */}
          <button
            onClick={() => onDelete(book.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
