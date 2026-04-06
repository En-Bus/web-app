'use server';

export async function launchSite(): Promise<{ success: boolean; message: string }> {
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK;

  if (!deployHookUrl) {
    return { success: false, message: 'Launch credentials not configured.' };
  }

  try {
    const res = await fetch(deployHookUrl, { method: 'POST' });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, message: `Deploy failed: ${err}` };
    }

    return { success: true, message: 'enbus.in is launching!' };
  } catch (e) {
    return { success: false, message: `Error: ${e instanceof Error ? e.message : String(e)}` };
  }
}
