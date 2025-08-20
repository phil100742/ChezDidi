import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const orderId = payload?.metadata?.order_id as string | undefined;
  const paid = payload?.status === 'paid' || payload?.transaction?.status === 'confirmed';
  if (!orderId) return NextResponse.json({ ok: false, error: 'missing order_id' }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status: paid ? 'paid' : 'pending' })
    .eq('id', orderId);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
