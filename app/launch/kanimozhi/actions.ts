'use server';

export async function launchSite(): Promise<{ success: boolean; message: string }> {
  const token = process.env.LAUNCH_VERCEL_TOKEN;
  const teamId = process.env.LAUNCH_TEAM_ID;
  const projectId = 'prj_AiWfwvWob5lWrfHZfe6RNH08WbaU';

  if (!token || !teamId) {
    return { success: false, message: 'Launch credentials not configured.' };
  }

  try {
    // Step 1: Set NEXT_PUBLIC_LAUNCHED=true on production
    const envRes = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/env?upsert=true&teamId=${teamId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'NEXT_PUBLIC_LAUNCHED',
          value: 'true',
          type: 'plain',
          target: ['production'],
        }),
      },
    );

    if (!envRes.ok) {
      const err = await envRes.text();
      return { success: false, message: `Failed to set env: ${err}` };
    }

    // Step 2: Get latest production deployment to redeploy
    const deploymentsRes = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}&target=production&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!deploymentsRes.ok) {
      return { success: false, message: 'Failed to fetch deployments.' };
    }

    const { deployments } = await deploymentsRes.json();
    if (!deployments || deployments.length === 0) {
      return { success: false, message: 'No production deployment found.' };
    }

    // Step 3: Trigger redeploy
    const redeployRes = await fetch(
      `https://api.vercel.com/v13/deployments?teamId=${teamId}&forceNew=1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'web-app',
          deploymentId: deployments[0].uid,
        }),
      },
    );

    if (!redeployRes.ok) {
      const err = await redeployRes.text();
      return { success: false, message: `Redeploy failed: ${err}` };
    }

    return { success: true, message: 'enbus.in is launching!' };
  } catch (e) {
    return { success: false, message: `Error: ${e instanceof Error ? e.message : String(e)}` };
  }
}
