"use client";

interface AddBookModalProps {
  show: boolean;
  titleValue: string; // 제목 값
  authorValue: string; // 저자 값
  detailValue: string; // 상세 정보 값
  onChangeTitle: (value: string) => void;
  onChangeAuthor: (value: string) => void;
  onChangeDetail: (value: string) => void;
  onClose: () => void; // 모달 닫기
  onSave: () => void; // 저장 버튼 클릭 시
}

export default function AddBookModal({
  show,
  titleValue,
  authorValue,
  detailValue,
  onChangeTitle,
  onChangeAuthor,
  onChangeDetail,
  onClose,
  onSave,
}: AddBookModalProps) {
  if (!show) return null; // show가 false이면 모달 표시 안 함

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-semibold mb-4">책 추가하기</h2>

        <div className="mb-2">
          <label className="block text-sm font-medium">제목</label>
          <input
            type="text"
            className="border rounded w-full px-2 py-1"
            value={titleValue}
            onChange={(e) => onChangeTitle(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium">저자</label>
          <input
            type="text"
            className="border rounded w-full px-2 py-1"
            value={authorValue}
            onChange={(e) => onChangeAuthor(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">상세 정보</label>
          <textarea
            className="border rounded w-full px-2 py-1"
            rows={3}
            value={detailValue}
            onChange={(e) => onChangeDetail(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
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
