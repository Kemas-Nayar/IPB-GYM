import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sesiId, userId } = body;

    if (!sesiId || !userId) {
      return NextResponse.json({ error: 'Data sesi atau user tidak valid.' }, { status: 400 });
    }

    // Inisialisasi Supabase Server Client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Gunakan Service Role untuk bypass RLS jika diperlukan saat insert krusial
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // 1. Generate Token QR Code Unik (ISO/IEC 18004 Standard basis)
    const qrToken = crypto.randomBytes(16).toString('hex');

    // 2. Insert Data Reservasi
    // Kita set status langsung ke 'dikonfirmasi' agar trigger validasi_kuota_reservasi langsung bekerja
    const { data, error } = await supabase
      .from('reservasi')
      .insert({
        pengguna_id: userId,
        sesi_id: sesiId,
        status: 'dikonfirmasi',
        qr_code_token: qrToken,
        waktu_konfirmasi: new Date().toISOString()
      })
      .select()
      .single();

    // 3. Tangani Error dari Trigger PostgreSQL
    if (error) {
      // Menangkap eksepsi dari RAISE EXCEPTION di PL/pgSQL
      if (error.message.includes('Sesi sudah penuh') || error.code === 'P0001') {
        return NextResponse.json({ error: 'Mohon maaf, kuota sesi ini sudah penuh.' }, { status: 409 });
      }
      // Menangkap error Unique Constraint (Satu pengguna hanya boleh 1x per sesi)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Anda sudah melakukan reservasi untuk sesi ini.' }, { status: 400 });
      }
      
      throw error;
    }

    // 4. Catat ke Activity Log (Traceability)
    await supabase.from('activity_log').insert({
      pengguna_id: userId,
      aksi: 'BUAT_RESERVASI',
      entitas: 'reservasi',
      entitas_id: data.id,
      detail: { sesi_id: sesiId, status: 'dikonfirmasi' }
    });

    return NextResponse.json({ success: true, data }, { status: 201 });

  } catch (error: any) {
    console.error('Reservasi Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memproses reservasi.' },
      { status: 500 }
    );
  }
}
