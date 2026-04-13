import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request: NextRequest) {
  if (!BOT_TOKEN) return NextResponse.json({ ok: true });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = (body.message ?? body.channel_post) as Record<string, unknown> | undefined;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = (message.chat as Record<string, unknown>)?.id;
  if (!chatId) return NextResponse.json({ ok: true });

  const reply = `Hi! 👋

Thanks for reaching out to enbus.in.

To report a missing or incorrect bus route, visit:
👉 https://enbus.in/contribute

You can submit a photo of the timetable board at your bus stand and we'll add it.

For anything else, reply here and we'll get back to you.`;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: reply }),
  });

  return NextResponse.json({ ok: true });
}
