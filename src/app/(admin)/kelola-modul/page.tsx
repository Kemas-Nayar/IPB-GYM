"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// 1. Tipe data disesuaikan dengan skema tabel modul_latihan
type Modul = {
  id: string;
  judul: string;
  deskripsi: string;
  is_aktif: boolean;
  created_at: string;
};

const emptyModul: Omit<Modul, "id" | "created_at"> = {
  judul: "",
  deskripsi: "",
  is_aktif: true,
};

export default function KelolaModulPage() {
  const supabase = createClient();

  const [moduls, setModuls] = useState<Modul[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Modul | null>(null);
  const [form, setForm] = useState(emptyModul);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ── Fetch ────────────────────────────────────────────────────────────────
  async function fetchModuls() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("modul_latihan") // 2. Ubah nama tabel
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setModuls(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchModuls();
  }, []);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function openCreate() {
    setEditTarget(null);
    setForm(emptyModul);
    setShowModal(true);
  }

  function openEdit(m: Modul) {
    setEditTarget(m);
    setForm({ judul: m.judul, deskripsi: m.deskripsi, is_aktif: m.is_aktif });
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
  }

  // ── Save (create / update) ────────────────────────────────────────────────
  async function handleSave() {
    if (!form.judul.trim()) return;
    setSaving(true);
    setError(null);

    // Payload disesuaikan dengan kolom database
    const payload = { 
      judul: form.judul, 
      deskripsi: form.deskripsi, 
      is_aktif: form.is_aktif 
    };

    if (editTarget) {
      const { error } = await supabase
        .from("modul_latihan")
        .update(payload)
        .eq("id", editTarget.id);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase
        .from("modul_latihan")
        .insert([payload]);
      if (error) setError(error.message);
    }

    setSaving(false);
    closeModal();
    fetchModuls();
  }

  // ── Toggle aktif ─────────────────────────────────────────────────────────
  async function toggleAktif(m: Modul) {
    const { error } = await supabase
      .from("modul_latihan")
      .update({ is_aktif: !m.is_aktif })
      .eq("id", m.id);
    if (error) setError(error.message);
    else fetchModuls();
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("modul_latihan").delete().eq("id", deleteId);
    if (error) setError(error.message);
    setDeleteId(null);
    fetchModuls();
  }

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = moduls.filter(
    (m) =>
      m.judul.toLowerCase().includes(search.toLowerCase()) ||
      m.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Kelola Modul</h1>
          <p className="text-sm text-gray-500">
            Manajemen modul yang tersedia di sistem gym.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Cari modul…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-64"
          />
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Tambah Modul
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              Memuat data…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-gray-400">
              <span className="text-3xl">📦</span>
              <span>{search ? "Tidak ada hasil pencarian." : "Belum ada modul."}</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Nama Modul</th>
                  <th className="px-5 py-3 hidden md:table-cell">Deskripsi</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {m.judul}
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell max-w-xs truncate">
                      {m.deskripsi || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleAktif(m)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          m.is_aktif
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${m.is_aktif ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        {m.is_aktif ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(m)}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(m.id)}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Row count */}
        {!loading && filtered.length > 0 && (
          <p className="mt-2 text-right text-xs text-gray-400">
            {filtered.length} modul ditemukan
          </p>
        )}
      </div>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                {editTarget ? "Edit Modul" : "Tambah Modul Baru"}
              </h2>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Judul Modul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
                  placeholder="Contoh: Yoga, Zumba, Angkat Beban"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={form.deskripsi}
                  onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
                  placeholder="Deskripsi singkat tentang modul ini…"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.is_aktif}
                  onClick={() => setForm((f) => ({ ...f, is_aktif: !f.is_aktif }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    form.is_aktif ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      form.is_aktif ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {form.is_aktif ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.judul.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Menyimpan…" : editTarget ? "Simpan Perubahan" : "Tambah Modul"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="px-6 py-5">
              <h2 className="mb-2 text-base font-semibold text-gray-900">Hapus Modul?</h2>
              <p className="text-sm text-gray-500">
                Tindakan ini tidak dapat dibatalkan. Modul akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
