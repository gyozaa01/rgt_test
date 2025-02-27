import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const runtime = "nodejs";
export const revalidate = 0;

// URL에서 [id] 파라미터 추출
function getBookIdFromUrl(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/");
  return segments[segments.length - 1];
}

// BookUpdatePayload 타입
type BookUpdatePayload = {
  title?: string;
  author?: string;
  detail?: string;
  quantity?: number;
  normalized_title?: string;
  normalized_author?: string;
};

// GET /api/books/[id]
export async function GET(req: NextRequest) {
  const bookId = getBookIdFromUrl(req);
  try {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (error) throw error;
    if (!data) {
      // 데이터가 없으면 404
      return NextResponse.json(
        { error: "책을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 성공 시 200
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}

// PUT /api/books/[id]
export async function PUT(req: NextRequest) {
  const bookId = getBookIdFromUrl(req);
  try {
    const body = await req.json();
    const { title, author, detail, quantity } = body;

    // 만약 title, author가 변경될 수 있다면, 여기에서도 공백 제거 + 소문자 변환
    const updatePayload: BookUpdatePayload = { detail, quantity };

    if (title) {
      updatePayload.title = title;
      updatePayload.normalized_title = title.replace(/\s+/g, "").toLowerCase();
    }
    if (author) {
      updatePayload.author = author;
      updatePayload.normalized_author = author
        .replace(/\s+/g, "")
        .toLowerCase();
    }

    const { data, error } = await supabase
      .from("books")
      .update(updatePayload)
      .eq("id", bookId)
      .select()
      .single();

    if (error) {
      // 고유 제약 위반(duplicate key)이면 23505 코드가 발생
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "이미 같은 제목과 저자의 책이 존재합니다." },
          { status: 409 }
        );
      }
      throw error;
    }

    if (!data) {
      // 수정 대상이 없으면 404
      return NextResponse.json({ error: "수정 실패" }, { status: 404 });
    }

    // 수정 성공 시 200
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}

// DELETE /api/books/[id]
export async function DELETE(req: NextRequest) {
  const bookId = getBookIdFromUrl(req);
  try {
    const { error } = await supabase.from("books").delete().eq("id", bookId);
    if (error) throw error;

    // 204
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}
