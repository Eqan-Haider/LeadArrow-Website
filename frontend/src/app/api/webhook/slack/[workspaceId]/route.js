import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/* ── Regex patterns for unstructured Slack text ── */
const FIELD_PATTERNS = {
  name: /Name:\s*(.+)/i,
  email: /Email:\s*(.+)/i,
  phone: /Phone:\s*(.+)/i,
};

function parseSlackPayload(raw) {
  const result = { name: '', email: '', phone: '' };
  for (const [key, regex] of Object.entries(FIELD_PATTERNS)) {
    const match = raw.match(regex);
    if (match) result[key] = match[1].trim();
  }
  return result;
}

/*
 * POST /api/webhook/slack/[workspaceId]
 *
 * Receives raw text from a Slack channel outgoing webhook,
 * parses prospect details, and forwards to the backend
 * routing engine for live broadcast.
 */
export async function POST(request, { params }) {
  try {
    const { workspaceId } = params;
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid text payload. Send a JSON body with a "text" field.' },
        { status: 400 }
      );
    }

    /* 1. Parse raw unstructured text */
    const parsed = parseSlackPayload(text);
    if (!parsed.name) {
      return NextResponse.json(
        {
          error:
            'Could not extract a prospect name. Ensure your Slack message includes a line like "Name: John Doe"',
        },
        { status: 400 }
      );
    }

    /* 2. Forward to the backend Express server where Socket.io
     *    and the routing engine live. This keeps real-time
     *    broadcast logic centralized. */
    const backendRes = await fetch(
      `${BACKEND_URL}/webhook/slack/${workspaceId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }
    );

    if (!backendRes.ok) {
      const errData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error || 'Backend routing failed' },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    return NextResponse.json({
      message: 'Slack lead received and routed',
      leadId: data.leadId,
      parsed,
    });
  } catch (err) {
    console.error('Slack webhook error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
