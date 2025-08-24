
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Handles incoming webhook requests from Digiflazz.
 * 
 * To-do:
 * 1. Implement signature verification logic.
 * 2. Process the webhook data (e.g., update transaction status in the database).
 * 3. Securely store and retrieve the webhook secret key from environment variables.
 */

// This should be stored securely in your environment variables
const WEBHOOK_SECRET_KEY = process.env.DIGIFLAZZ_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!WEBHOOK_SECRET_KEY) {
      console.error("Digiflazz webhook secret key is not set.");
      return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature');

    if (!signature) {
      return NextResponse.json({ success: false, message: 'No signature provided.' }, { status: 400 });
    }

    // Verify the signature
    const expectedSignature = `sha1=${crypto.createHmac('sha1', WEBHOOK_SECRET_KEY).update(rawBody, 'utf-8').digest('hex')}`;
    
    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, message: 'Invalid signature.' }, { status: 403 });
    }
    
    // Parse the JSON body after validation
    const data = JSON.parse(rawBody);

    // Process the webhook data here
    console.log('Received valid webhook from Digiflazz:', data);
    
    // Example: Update transaction status based on `data.data.status`

    // Respond to Digiflazz
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Digiflazz webhook:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
