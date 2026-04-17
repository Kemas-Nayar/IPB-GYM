"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { QRCodeSVG } from "qrcode.react";

type ReservasiAktif = {
  id: string;
  qr_code_token: string;
  status: string;
  sesi_gym: {
    nama_sesi: string;
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
  };
};

export default function QRCodePage() {
  const [reservasi, setReservasi] = useState<ReservasiAktif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchReservasiAktif = async () => {
      try {
        // Dapatkan user yang sedang login
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error("Pengguna tidak terautentikasi.");

        // Ambil data reservasi yang statusnya 'dikonfirmasi' untuk user tersebut
        // dan join dengan tabel sesi_gym untuk menampilkan detail jadwal
        const { data, error: fetchError } = await supabase
          .from("reservasi")
          .select(`
            id,
            qr_code_token,
            status,
            sesi_gym (
              nama_sesi,
              tanggal,
              jam_mulai,
              jam_selesai
            )
          `)
          .eq("pengguna_id", user.id)
          .eq("status", "dikonfirmasi")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        setReservasi(data as any);
      } catch (err: any) {
        setError(err.message || "Gagal memuat tiket QR Code Anda.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservasiAktif();
  }, [supabase]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat tiket Anda...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tiket Gym Anda</h1>
        <p className="text-gray-600 mt-2">
          Tunjukkan QR Code ini ke admin saat melakukan check-in di fasilitas gym.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {reservasi.length === 0 && !error ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500">Anda belum memiliki reservasi gym yang aktif.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {reservasi.map((res) => (
            <div key={res.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col">
              {/* Header Tiket */}
              <div className="bg-blue-600 text-white p-4 text-center">
                <h3 className="font-bold text-lg">{res.sesi_gym.nama_sesi}</h3>
                <p className="text-blue-100 text-sm">
                  {new Date(res.sesi_gym.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              {/* Body Tiket & QR Code */}
              <div className="p-8 flex flex-col items-center justify-center flex-grow bg-gray-50">
                <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
                  <QRCodeSVG 
                    value={res.qr_code_token} 
                    size={200}
                    level="H" // High error correction, berguna jika layar HP retak/silau
                    includeMargin={true}
                  />
                </div>
                <p className="mt-6 text-2xl font-mono font-bold tracking-widest text-gray-800">
                  {res.sesi_gym.jam_mulai.slice(0, 5)} - {res.sesi_gym.jam_selesai.slice(0, 5)}
                </p>
                <p className="mt-2 text-xs text-gray-400 font-mono break-all text-center">
                  Token: {res.qr_code_token}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
