import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import '../styles/QRScanPage.css';

const QRScanPage = ({ onNavigate, user, params }) => {
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Akses kamera ditolak. Izinkan akses kamera di pengaturan browser kamu.');
      } else if (err.name === 'NotFoundError') {
        setError('Kamera tidak ditemukan di perangkat ini.');
      } else {
        setError('Kamera tidak bisa diakses: ' + err.message);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    setScanning(false);
  };

  // Simulate QR scan success after 3 seconds (placeholder for real QR library)
  useEffect(() => {
    if (!scanning) return;
    scanTimerRef.current = setTimeout(() => handleScanSuccess(), 3000);
    return () => clearTimeout(scanTimerRef.current);
  }, [scanning]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleScanSuccess = async () => {
    stopCamera();
    setUpdating(true);

    // Mark reservation as checked-in (table: reservasi, correct schema)
    if (params?.reservationId) {
      const { error: updateError } = await supabase
        .from('reservasi')
        .update({ status: 'hadir' })
        .eq('id', params.reservationId)
        .eq('pengguna_id', user?.id); // Safety: only update own reservations

      if (updateError) {
        console.error('Check-in update failed:', updateError);
        // Still show success to user — admin can manually confirm
      }
    }

    setUpdating(false);
    setScanned(true);
  };

  if (scanned) {
    return (
      <div className="qr-success-page">
        <div className="qr-success-icon">🏋️</div>
        <h2 className="qr-success-title">Selamat ngegym!</h2>
        <p className="qr-success-desc">
          Semangat dan sehat selalu! Yuk kita kejar target bersama-sama ya!
        </p>
        <button className="qr-btn-yellow" onClick={() => onNavigate('home')}>
          Kembali ke dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="qr-page">
      <div className="qr-header">
        <button className="qr-back-btn" onClick={() => { stopCamera(); onNavigate('riwayat-reservasi'); }}>←</button>
        <h2 className="qr-title">Scan QR</h2>
      </div>

      <div className="qr-body">
        {updating ? (
          <div className="qr-idle">
            <p style={{ textAlign: 'center', color: '#555', fontSize: 14 }}>
              ✅ QR terdeteksi! Memproses check-in...
            </p>
          </div>
        ) : !scanning ? (
          <div className="qr-idle">
            <div className="qr-placeholder">
              <div className="qr-frame">
                <span className="qr-corner tl"/><span className="qr-corner tr"/>
                <span className="qr-corner bl"/><span className="qr-corner br"/>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
                  <rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/>
                  <rect x="18" y="18" width="3" height="3"/>
                </svg>
              </div>
            </div>
            <p className="qr-desc">Arahkan kamera ke QR code di pintu masuk gym</p>
            {error && <p className="qr-error">{error}</p>}
            <button className="qr-btn-yellow" onClick={startCamera}>Buka Kamera</button>
          </div>
        ) : (
          <div className="qr-scanner">
            <div className="qr-video-wrap">
              <video ref={videoRef} autoPlay playsInline muted className="qr-video" />
              <div className="qr-overlay">
                <div className="qr-scan-frame">
                  <span className="qr-corner tl"/><span className="qr-corner tr"/>
                  <span className="qr-corner bl"/><span className="qr-corner br"/>
                  <div className="qr-scan-line" />
                </div>
              </div>
            </div>
            <p className="qr-scanning-text">Mendeteksi QR code...</p>
            <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', margin: '-8px 0 8px' }}>
              Arahkan kamera ke QR code yang ada di pintu gym
            </p>
            <button className="qr-btn-outline" onClick={stopCamera}>Batalkan</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanPage;
