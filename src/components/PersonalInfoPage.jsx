import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import '../styles/SubPage.css';

const PersonalInfoPage = ({ onNavigate, user }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setNamaLengkap(data.nama_lengkap || '');
        setEmail(data.email || user.email || '');
        setTelepon(data.nomor_telepon || '');
        setTanggalLahir(data.tanggal_lahir || '');
        setGender(data.gender || '');
      }
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        nama_lengkap: namaLengkap,
        email,
        nomor_telepon: telepon,
        tanggal_lahir: tanggalLahir,
        gender,
        updated_at: new Date().toISOString(),
      });
    setIsLoading(false);
    if (!error) setIsEdit(false);
    else alert('Gagal menyimpan: ' + error.message);
  };

  const avatarInitial = namaLengkap.charAt(0).toUpperCase() || 'U';

  return (
    <div className="subpage">
      <div className="subpage-header">
        <button className="subpage-back" onClick={() => onNavigate('profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="subpage-title">Informasi Pribadi</span>
        <button className="subpage-edit-btn" onClick={() => isEdit ? handleSave() : setIsEdit(true)}>
          {isEdit ? (
            <span className="edit-label">✓ Simpan</span>
          ) : (
            <span className="edit-label">✏️ Edit</span>
          )}
        </button>
      </div>

      <div className="personalinfo-avatar-wrap">
        <div className="personalinfo-avatar">{avatarInitial}</div>
        {isEdit && (
          <button className="personalinfo-edit-photo">📷 Edit</button>
        )}
      </div>

      <div className="personalinfo-form">
        <div className="personalinfo-field">
          <label className="field-label">Nama Lengkap</label>
          <input
            className="field-input"
            value={namaLengkap}
            onChange={(e) => setNamaLengkap(e.target.value)}
            disabled={!isEdit}
            placeholder="Nama Lengkap"
          />
        </div>
        <div className="personalinfo-field">
          <label className="field-label">Alamat E-Mail</label>
          <input
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEdit}
            placeholder="Email"
            type="email"
          />
        </div>
        <div className="personalinfo-field">
          <label className="field-label">Nomor Telepon</label>
          <input
            className="field-input"
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
            disabled={!isEdit}
            placeholder="Nomor Telepon"
            type="tel"
          />
        </div>
        <div className="personalinfo-field">
          <label className="field-label">Tanggal Lahir</label>
          <input
            className="field-input"
            value={tanggalLahir}
            onChange={(e) => setTanggalLahir(e.target.value)}
            disabled={!isEdit}
            placeholder="Tanggal Lahir"
          />
        </div>
        <div className="personalinfo-field">
          <label className="field-label">Jenis Kelamin</label>
          <input
            className="field-input"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={!isEdit}
            placeholder="Jenis Kelamin"
          />
        </div>
      </div>

      {isEdit && (
        <div className="personalinfo-footer">
          <button
            className="btn-save-yellow"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoPage;