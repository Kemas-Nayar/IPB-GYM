import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigasi Bar Sederhana */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* Anda bisa mengganti ini dengan tag <img src="/logo-ipb.png" /> nantinya */}
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="text-xl font-bold text-gray-800">IPB Wellness Hub</span>
        </div>
        <Link 
          href="/login" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
        >
          Masuk
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-3xl">
          Pusat Layanan Kebugaran & Kesehatan <span className="text-blue-600">Digital Terpadu</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl">
          Platform resmi untuk melakukan reservasi fasilitas gym, memantau indeks kesehatan fisik, dan berkonsultasi dengan asisten kesehatan cerdas di lingkungan kampus.
        </p>
        
        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1"
          >
            Mulai Reservasi
          </Link>
          <a 
            href="#fitur" 
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Pelajari Fitur
          </a>
        </div>
      </main>

      {/* Fitur Utama Section (Berdasarkan Arsitektur Logis) */}
      <section id="fitur" className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Fitur Utama Sistem</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Fitur 1: Reservasi */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-xl font-bold">
                📅
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Reservasi & Jadwal</h3>
              <p className="text-gray-600">
                Sistem booking otomatis untuk sesi gym. Bebas antre fisik dengan kepastian kuota maksimal 15 orang per sesi.
              </p>
            </div>

            {/* Fitur 2: Verifikasi QR */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-xl font-bold">
                📱
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">QR Code Check-in</h3>
              <p className="text-gray-600">
                Validasi kehadiran yang cepat dan akurat menggunakan QR Code unik untuk setiap reservasi Anda.
              </p>
            </div>

            {/* Fitur 3: AI Assistant & Tracking */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-xl font-bold">
                🤖
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI Health Assistant</h3>
              <p className="text-gray-600">
                Pantau perkembangan Indeks Massa Tubuh (IMT) dan konsultasikan rutinitas latihan Anda dengan asisten cerdas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Kelompok 5 - Rekayasa Perangkat Lunak.</p>
        <p className="mt-1">Ditenagai oleh Next.js & Supabase</p>
      </footer>
    </div>
  );
}
