"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

// Definisi tipe data berdasarkan skema yang diharapkan
type SesiGym = {
  id: string;
  waktu_mulai: string;
  waktu_selesai: string;
  kapasitas: number; // Default 15
  terisi: number;
};

export default function JadwalPage() {
  const [sesi, setSesi] = useState<SesiGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [pesan, setPesan] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Mengambil data sesi gym dan jumlah reservasi yang sudah ada
const fetchSesi = async () => {
    setLoading(true);
    try {
      // Menyesuaikan nama tabel dan kolom dengan skema database Anda
      const { data, error } = await supabase
        .from('sesi_gym')
        .select(`
          id,
          nama_sesi,
          tanggal,
          jam_mulai,
          jam_selesai,
          kapasitas_max,
          reservasi (count)
        `)
        .eq('is_aktif', true) // Hanya ambil sesi yang aktif
        .order('jam_mulai', { ascending: true });

      if (error) {
        console.error("Detail error Supabase:", error);
        throw error;
      }

      // Format data untuk menyesuaikan dengan state di frontend
      const formattedSesi = data.map((item: any) => ({
        id: item.id,
        nama_sesi: item.nama_sesi, // Kita tambahkan ini agar UI lebih dinamis
        waktu_mulai: item.jam_mulai,
        waktu_selesai: item.jam_selesai,
        kapasitas: item.kapasitas_max,
        // Supabase mengembalikan array of count jika relasi one-to-many
        terisi: item.reservasi[0]?.count || 0,
      }));

      setSesi(formattedSesi);
    } catch (error) {
      console.error("Gagal mengambil data sesi:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSesi();
  }, []);

  // Fungsi untuk melakukan reservasi
  const handleReservasi = async (sesiId: string) => {
    setBookingLoading(sesiId);
    setPesan(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Anda harus login untuk melakukan reservasi.");
      }

      // Mengirim request ke API Route untuk keamanan transaksi "War Tiket"
      const res = await fetch('/api/reservasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesiId, userId: user.id }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal melakukan reservasi.");
      }

      setPesan({ text: "Reservasi berhasil! Silakan cek menu QR Code Anda.", type: "success" });
      fetchSesi(); // Refresh data kuota

    } catch (error: any) {
      setPesan({ text: error.message, type: "error" });
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat jadwal gym...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Jadwal Sesi Gym</h1>
        <p className="text-gray-600 mt-2">Pilih jadwal latihan Anda. Kuota maksimal 15 orang per sesi.</p>
      </div>

      {pesan && (
        <div className={`p-4 mb-6 rounded-lg ${pesan.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {pesan.text}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {sesi.map((s) => {
          const isPenuh = s.terisi >= s.kapasitas;

          return (
            <div key={s.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Sesi Latihan</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(`1970-01-01T${s.waktu_mulai}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(`1970-01-01T${s.waktu_selesai}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${isPenuh ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {s.terisi} / {s.kapasitas} Terisi
                  </span>
                </div>
                
                {/* Progress Bar Kuota */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className={`h-2 rounded-full ${isPenuh ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${(s.terisi / s.kapasitas) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => handleReservasi(s.id)}
                disabled={isPenuh || bookingLoading === s.id}
                className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                  isPenuh 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {bookingLoading === s.id ? 'Memproses...' : (isPenuh ? 'Kuota Penuh' : 'Reservasi Sekarang')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
