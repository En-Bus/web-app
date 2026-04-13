import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const STORAGE_BUCKET = 'timetable-photos';
const NOTIFY_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendMessage(chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export async function POST(request: NextRequest) {
  if (!BOT_TOKEN) return NextResponse.json({ ok: true });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = body.message as Record<string, unknown> | undefined;
  if (!message) return NextResponse.json({ ok: true });

  const chat = message.chat as Record<string, unknown>;
  const chatId = chat?.id as number;
  const from = message.from as Record<string, unknown> | undefined;
  const senderName = [from?.first_name, from?.last_name].filter(Boolean).join(' ') || 'Telegram user';
  const username = from?.username ? `@${from.username}` : null;
  const photos = message.photo as Record<string, unknown>[] | undefined;
  const caption = (message.caption as string | undefined)?.trim();
  const text = (message.text as string | undefined)?.trim();

  // No photo — send instructions
  if (!photos || photos.length === 0) {
    await sendMessage(chatId,
      `Hi ${senderName}! 👋\n\nTo contribute bus timings, send a photo of the timetable board directly here.\n\nAdd the bus stand name as the photo caption (e.g. "Madurai Central Bus Stand").\n\nOr use our web form: https://enbus.in/contribute`
    );
    return NextResponse.json({ ok: true });
  }

  // Got a photo — use the largest version
  const photo = photos[photos.length - 1] as Record<string, unknown>;
  const fileId = photo.file_id as string;

  // Get file path from Telegram
  const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
  const fileData = await fileRes.json() as { ok: boolean; result?: { file_path: string } };
  if (!fileData.ok || !fileData.result?.file_path) {
    await sendMessage(chatId, 'Sorry, could not process your photo. Please try again or use https://enbus.in/contribute');
    return NextResponse.json({ ok: true });
  }

  // Download photo from Telegram
  const photoRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`);
  const photoBuffer = await photoRes.arrayBuffer();
  const ext = fileData.result.file_path.split('.').pop() ?? 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storagePath = `submissions/${fileName}`;

  // Upload to Supabase Storage
  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      apikey: SUPABASE_SERVICE_KEY,
    },
    body: photoBuffer,
  });

  if (!uploadRes.ok) {
    await sendMessage(chatId, 'Sorry, could not save your photo. Please try again or use https://enbus.in/contribute');
    return NextResponse.json({ ok: true });
  }

  const photoUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
  const busStand = caption || 'Unknown (sent via Telegram)';

  // Insert into DB
  await fetch(`${SUPABASE_URL}/rest/v1/timetable_submissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      apikey: SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      photo_url: photoUrl,
      bus_stand: busStand,
      submitted_by: senderName,
      phone: username,
    }),
  });

  // Confirm to user
  const confirmMsg = caption
    ? `✅ Got it! Photo of "${caption}" saved. Thank you ${senderName}!\n\nWe'll review and add the routes to enbus.in.`
    : `✅ Photo saved! Thank you ${senderName}.\n\nNext time, add the bus stand name as a caption when sending the photo — it helps us process it faster.`;
  await sendMessage(chatId, confirmMsg);

  // Notify admin
  if (NOTIFY_CHAT_ID && NOTIFY_CHAT_ID !== String(chatId)) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: NOTIFY_CHAT_ID,
        text: `📸 New photo via Telegram\n🚌 ${busStand}\n👤 ${senderName}${username ? ` (${username})` : ''}\n🔗 ${photoUrl}`,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
