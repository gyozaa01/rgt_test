import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/books  => 책 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const searchType = searchParams.get("searchType") || "전체"; // '전체' | '제목' | '저자'
    const keyword = (searchParams.get("keyword") || "").toLowerCase();

    // 기본 쿼리
    let query = supabase
      .from("books")
      .select("*", { count: "exact" })
      .order("id", { ascending: true });

    // 검색 로직
    if (keyword) {
      if (searchType === "제목") {
        query = query.ilike("title", `%${keyword}%`);
      } else if (searchType === "저자") {
        query = query.ilike("author", `%${keyword}%`);
      } else {
        // 전체(제목 또는 저자)
        // Supabase는 or()를 사용하여 여러 컬럼 검색 가능
        query = query.or(`title.ilike.%${keyword}%,author.ilike.%${keyword}%`);
      }
    }

    // 페이지네이션
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      total: count || 0,
      page,
      pageSize,
      data: data || [],
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}

// POST /api/books => 새 책 추가
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, author, detail } = body;
    const quantity = body.quantity ?? 0;

    if (!title || !author) {
      return NextResponse.json(
        { error: "제목과 저자는 필수입니다." },
        { status: 400 }
      );
    }

    // 공백 제거 + 소문자 변환
    const normalizedTitle = title.replace(/\s+/g, "").toLowerCase();
    const normalizedAuthor = author.replace(/\s+/g, "").toLowerCase();

    // Supabase에 새 책 추가
    const { data, error } = await supabase
      .from("books")
      .insert([
        {
          title,
          author,
          detail,
          quantity,
          normalized_title: normalizedTitle,
          normalized_author: normalizedAuthor,
        },
      ])
      .select()
      .single();

    if (error) {
      // 고유 제약 위반(duplicate key)인지 확인
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "이미 같은 제목과 저자의 책이 존재합니다." },
          { status: 409 }
        );
      }
      throw error;
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}
