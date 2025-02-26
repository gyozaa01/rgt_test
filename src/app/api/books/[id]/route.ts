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

    const { data, error } = await supabase
      .from("books")
      .update({ title, author, detail, quantity })
      .eq("id", bookId)
      .select()
      .single();

    if (error) throw error;
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
