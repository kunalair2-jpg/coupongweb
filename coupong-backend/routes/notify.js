import { Router } from 'express';

const router = Router();

const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
const WHAPI_URL = 'https://gate.whapi.cloud/messages/text';

/**
 * Normalize a phone number to international format for WhatsApp.
 * Strips spaces, dashes, brackets, leading +
 * Prepends 91 (India) if no country code detected.
 */
function normalizePhone(raw = '') {
    let num = raw.replace(/[\s\-().+]/g, '');   // strip formatting
    if (num.startsWith('0')) num = num.slice(1); // remove leading 0
    // If it's a 10-digit Indian number, prepend country code
    if (num.length === 10 && !num.startsWith('91')) {
        num = '91' + num;
    }
    return num;
}

/**
 * Format the WhatsApp confirmation message.
 */
function buildMessage({ name, orderId, items, total, payMethod, delivery }) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: 'Asia/Kolkata',
    });

    const voucherLines = items.map(item =>
        `🎟️ ${item.title}${item.qty > 1 ? ` (×${item.qty})` : ''}`
    ).join('\n');

    return `✅ *Order Confirmed! - Coupong.in*

👤 *Name:* ${name}
📦 *Order ID:* #${orderId}
${voucherLines}
💰 *Amount Paid:* ₹${Number(total).toLocaleString('en-IN')}
💳 *Payment Method:* ${(payMethod || 'Card').toUpperCase()}
📅 *Date:* ${dateStr}

Your voucher code has also been sent to your registered email address.

Thank you for shopping with *Coupong.in*! 🎉`;
}

// ── POST /api/notify/whatsapp ─────────────────────────────────────────────────
// Called by frontend after a successful payment when user chose WhatsApp delivery.
// Body: { phone, name, orderId, items: [{title, qty}], total, payMethod }
router.post('/whatsapp', async (req, res) => {
    const { phone, name, orderId, items, total, payMethod } = req.body;

    // Basic validation
    if (!phone || !name || !orderId || !items?.length) {
        return res.status(400).json({ ok: false, error: 'Missing required fields: phone, name, orderId, items' });
    }

    if (!WHAPI_TOKEN) {
        console.warn('⚠️  WHAPI_TOKEN not set — WhatsApp notification skipped');
        return res.json({ ok: false, skipped: true, reason: 'WHAPI_TOKEN not configured' });
    }

    const to = normalizePhone(phone);
    const body = buildMessage({ name, orderId, items, total, payMethod });

    try {
        const response = await fetch(WHAPI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${WHAPI_TOKEN}`,
            },
            body: JSON.stringify({ to, body }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Whapi error:', data);
            return res.status(502).json({ ok: false, error: data?.error?.message || 'Whapi API error', details: data });
        }

        console.log(`✅ WhatsApp sent to ${to} | orderId=${orderId} | msgId=${data?.sent?.id}`);
        res.json({ ok: true, messageId: data?.sent?.id || data?.id });

    } catch (err) {
        console.error('WhatsApp notification failed:', err.message);
        // Never crash the checkout — return 200 with ok:false so frontend can fall back silently
        res.json({ ok: false, error: err.message });
    }
});

export default router;
