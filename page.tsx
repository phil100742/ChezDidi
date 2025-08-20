'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { displayCHF, midPrice } from '@/src/lib/price';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [order, setOrder] = useState({ product_id: '', product_name: '', category: '', unit_price: 0, qty: 6, pickup_date: '', notes: '', customer_name: '', customer_email: '' });
  const [payOpen, setPayOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [payUrl, setPayUrl] = useState('');

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => {
      setProducts(d.products || []);
      if ((d.products || []).length) {
        const p = d.products[0];
        setOrder(o => ({ ...o, product_id: p.id, product_name: p.name, category: p.category, unit_price: midPrice(p.price, p.price_min, p.price_max) }));
      }
    });
  }, []);

  const total = useMemo(() => Math.max(0, (order.unit_price || 0) * (order.qty || 0)), [order.unit_price, order.qty]);

  function onSelect(id: string) {
    const p = products.find((x: any) => x.id === id);
    if (!p) return;
    setOrder(o => ({ ...o, product_id: p.id, product_name: p.name, category: p.category, unit_price: midPrice(p.price, p.price_min, p.price_max) }));
  }

  async function submit() {
    const res = await fetch('/api/orders', { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    const d = await res.json();
    if (d.error) return alert(d.error);
    const created = d.order;

    const p = await fetch('/api/payrexx/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: created.id, amount: total, purpose: `Commande ${created.id}` }) }).then(r => r.json());
    if (p.error) {
      alert('Erreur Payrexx: '+(p.details || p.error));
      return;
    }

    setQrUrl(p.qrImageUrl || '');
    setPayUrl(p.paymentUrl || '');
    setPayOpen(true);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div className="rounded-full bg-[#F5E6D3] px-4 py-2 font-black text-rose-900">Chez Didi</div>
        <a className="rounded-xl border px-3 py-1 text-sm" href="/admin">Admin</a>
      </header>

      <h1 className="text-3xl font-extrabold">Pâtisseries fines & sur mesure</h1>
      <p className="mt-2 text-rose-900/80">Commandez gâteaux, macarons, tartelettes, éclairs… Retrait en boutique.</p>

      <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-white/80 p-5 shadow-sm">
            <div className="h-36 rounded-xl bg-rose-50 grid place-items-center text-5xl select-none">🧁</div>
            <div className="mt-3 font-semibold">{p.category} — {p.name}</div>
            <div className="text-sm text-rose-900/80">{p.note || p.unit || ''}</div>
            <div className="mt-2 text-sm font-bold">
              {p.price != null ? displayCHF(Number(p.price)) : `${displayCHF(Number(p.price_min))}–${displayCHF(Number(p.price_max))}`}
            </div>
            <button onClick={() => onSelect(p.id)} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 font-semibold text-white"><ShoppingCart className="size-4"/> Choisir</button>
          </div>
        ))}
      </section>

      <section id="order" className="mt-12 rounded-2xl border bg-white/80 p-6">
        <h2 className="text-xl font-bold">Passer commande</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm">Produit
            <select value={order.product_id} onChange={(e) => onSelect(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2">
              {products.map(p => <option key={p.id} value={p.id}>{`${p.category} – ${p.name}`}</option>)}
            </select>
          </label>
          <label className="text-sm">Quantité
            <input type="number" min={1} value={order.qty} onChange={e => setOrder(o => ({ ...o, qty: parseInt(e.target.value || '1') }))} className="mt-1 w-full rounded-xl border px-3 py-2"/>
          </label>
          <label className="text-sm">Date de retrait
            <input type="date" value={order.pickup_date} onChange={e => setOrder(o => ({ ...o, pickup_date: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2"/>
          </label>
          <label className="text-sm">Email
            <input type="email" value={order.customer_email} onChange={e => setOrder(o => ({ ...o, customer_email: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2"/>
          </label>
          <label className="text-sm">Nom
            <input value={order.customer_name} onChange={e => setOrder(o => ({ ...o, customer_name: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2"/>
          </label>
          <label className="text-sm md:col-span-2">Notes
            <textarea rows={3} value={order.notes} onChange={e => setOrder(o => ({ ...o, notes: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2"/>
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-rose-50 p-4">
          <div>
            <div className="text-sm text-rose-900/70">Total indicatif</div>
            <div className="text-xl font-extrabold">{displayCHF(total)}</div>
          </div>
          <button onClick={submit} className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 font-semibold text-white"><ShoppingCart className="size-4"/> Payer avec TWINT</button>
        </div>

        {payOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-5">
              <div className="text-lg font-semibold">Paiement TWINT</div>
              <p className="mt-1 text-sm text-slate-600">Scannez le QR avec l’app TWINT.</p>
              <div className="mt-4 grid place-items-center">
                {qrUrl ? <img src={qrUrl} alt="TWINT QR" className="h-48 w-48 rounded"/> : <div className="h-48 w-48 rounded bg-rose-100 grid place-items-center">QR</div>}
              </div>
              {payUrl && <a href={payUrl} target="_blank" className="mt-4 inline-block text-sm underline">Ouvrir la page de paiement</a>}
              <div className="mt-4 text-xs text-slate-500">Une fois payé, vous serez redirigé. Si besoin, fermez ce modal.</div>
              <div className="mt-4 text-right">
                <button className="rounded-xl border px-3 py-2 text-sm" onClick={() => setPayOpen(false)}>Fermer</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
