"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Inisialisasi Supabase Client untuk sisi browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Proses Autentikasi dengan Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Mengambil Role dari tabel 'pengguna' dan 'roles' (Sesuai Skema Anda)
      // Gunakan relasi untuk mendapatkan nama_role
      const { data: userData, error: userError } = await supabase
        .from("pengguna")
        .select(`
          role_id,
          roles (
            nama_role
          )
        `)
        // TIPS TESTING: Kita cocokkan berdasarkan email agar lebih aman 
        // jika UUID di auth.users berbeda dengan dummy data Anda
        .eq("email", email) 
        .single();

      if (userError) {
        console.error("Gagal fetch data pengguna:", userError);
        throw new Error("Data profil tidak ditemukan di database.");
      }

      // 3. Role-Based Routing (RBAC)
      // Karena Supabase mengembalikan relasi dalam bentuk array/object tergantung setup
      const roleName = Array.isArray(userData.roles) 
        ? userData.roles[0]?.nama_role 
        : userData.roles?.nama_role;

      if (roleName === "admin") {
        router.push("/dashboard"); // Arahkan ke dashboard admin
      } else {
        router.push("/jadwal"); // Arahkan ke jadwal mahasiswa
      }
      
    } catch (err: any) {
      setError(err.message || "Gagal melakukan login. Periksa kembali kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Login Wellness Hub</h1>
          <p className="text-gray-500 text-sm mt-2">Masuk menggunakan akun SSO IPB / Email Anda</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email / NIM
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="nim@apps.ipb.ac.id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
