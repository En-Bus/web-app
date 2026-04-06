'use server';

const SUPABASE_URL = 'https://hopivdsbzzfklohyllut.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function launchSite(): Promise<{ success: boolean; message: string }> {
  if (!SUPABASE_SERVICE_KEY) {
    return { success: false, message: 'Launch credentials not configured.' };
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_config?key=eq.launched`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: 'true' }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      return { success: false, message: `Launch failed: ${err}` };
    }

    return { success: true, message: 'enbus.in is live!' };
  } catch (e) {
    return { success: false, message: `Error: ${e instanceof Error ? e.message : String(e)}` };
  }
}
