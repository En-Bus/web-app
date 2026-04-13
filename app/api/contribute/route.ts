import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const STORAGE_BUCKET = 'timetable-photos';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export async function POST(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const photo = formData.get('photo') as File | null;
  const busStand = (formData.get('bus_stand') as string | null)?.trim();
  const district = (formData.get('district') as string | null)?.trim() ?? null;
  const submittedBy = (formData.get('submitted_by') as string | null)?.trim() ?? null;
  const phone = (formData.get('phone') as string | null)?.trim() ?? null;
  const email = (formData.get('email') as string | null)?.trim() ?? null;

  if (!photo || photo.size === 0) {
    return NextResponse.json({ error: 'Photo is required' }, { status: 400 });
  }

  if (!busStand) {
    return NextResponse.json({ error: 'Bus stand name is required' }, { status: 400 });
  }

  if (!submittedBy) {
    return NextResponse.json({ error: 'Your name is required' }, { status: 400 });
  }

  if (photo.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Photo must be under 10 MB' }, { status: 400 });
  }

  const fileType = photo.type || 'image/jpeg';
  if (!ALLOWED_TYPES.includes(fileType)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WEBP, and HEIC photos are accepted' }, { status: 400 });
  }

  const ext = fileType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storagePath = `submissions/${fileName}`;

  // Upload to Supabase Storage
  const photoBuffer = await photo.arrayBuffer();
  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': fileType,
        apikey: SUPABASE_SERVICE_KEY,
      },
      body: photoBuffer,
    },
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error('Storage upload failed:', errText);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }

  const photoUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;

  // Insert submission record
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/timetable_submissions`, {
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
      district: district || null,
      submitted_by: submittedBy || null,
      phone: phone || null,
      email: email || null,
    }),
  });

  if (!insertRes.ok) {
    const errText = await insertRes.text();
    console.error('DB insert failed:', errText);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }

  // Telegram notification (fire-and-forget — don't fail submission if this fails)
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChatId) {
    const lines = [
      `📸 *New timetable submission*`,
      `🚌 ${busStand}${district ? ` (${district})` : ''}`,
      `👤 ${submittedBy}${phone ? ` · ${phone}` : ''}${email ? ` · ${email}` : ''}`,
      `🔗 [View photo](${photoUrl})`,
    ];
    fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgChatId,
        text: lines.join('\n'),
        parse_mode: 'Markdown',
      }),
    }).catch((err) => console.error('Telegram notification failed:', err));
  }

  return NextResponse.json({ success: true });
}
