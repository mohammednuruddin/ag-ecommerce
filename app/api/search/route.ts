import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { and, or, like, gte, lte, eq, sql } from 'drizzle-orm'
import OpenAI from 'openai'

type ParsedFilters = {
  keywords?: string[]
  brands?: string[]
  models?: string[]
  maxPrice?: number
  minPrice?: number
  condition?: 'new' | 'like_new' | 'good' | 'fair'
  color?: string
  storage?: string
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'PhoneMarket',
  },
})

export async function POST(req: Request) {
  try {
    const { query } = (await req.json()) as { query?: string }
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [] })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY' }, { status: 500 })
    }

    // Ask the model to parse user intent into strict JSON
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash-lite',
      messages: [
        {
          role: 'system',
          content:
            'You convert natural language phone search queries into a strict JSON filter object for a SQL query. Only output JSON. Keys: keywords(string[]), brands(string[]), models(string[]), minPrice(number), maxPrice(number), condition(one of: new, like_new, good, fair), color(string), storage(string). Include keywords split from remaining terms.',
        },
        { role: 'user', content: query },
      ],
      temperature: 0,
    })

    let parsed: ParsedFilters = {}
    try {
      const text = completion.choices?.[0]?.message?.content ?? '{}'
      parsed = JSON.parse(text)
    } catch {
      // Best-effort fallback: search by raw keywords
      parsed = { keywords: query.split(/\s+/).filter(Boolean) }
    }

    // Build SQL conditions
    const conds: any[] = [eq(products.isActive, true)]

    if (parsed.minPrice != null) conds.push(gte(products.price, Number(parsed.minPrice)))
    if (parsed.maxPrice != null) conds.push(lte(products.price, Number(parsed.maxPrice)))
    if (parsed.condition) conds.push(eq(products.condition, parsed.condition))
    if (parsed.color) conds.push(like(sql`lower(${products.color})`, `%${parsed.color.toLowerCase()}%`))
    if (parsed.storage) conds.push(like(sql`lower(${products.storage})`, `%${parsed.storage.toLowerCase()}%`))

    const nameLike = (val: string) => like(sql`lower(${products.name})`, `%${val.toLowerCase()}%`)
    const brandLike = (val: string) => like(sql`lower(${products.brand})`, `%${val.toLowerCase()}%`)
    const modelLike = (val: string) => like(sql`lower(${products.model})`, `%${val.toLowerCase()}%`)

    const ors: any[] = []
    for (const b of parsed.brands ?? []) ors.push(brandLike(b))
    for (const m of parsed.models ?? []) ors.push(modelLike(m))
    for (const kw of parsed.keywords ?? []) ors.push(or(nameLike(kw), brandLike(kw), modelLike(kw)))

    if (ors.length > 0) conds.push(or(...ors))

    const results = await db
      .select()
      .from(products)
      .where(and(...conds))
      .limit(20)

    return NextResponse.json({ products: results, filters: parsed })
  } catch (error) {
    console.error('AI search error', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}


