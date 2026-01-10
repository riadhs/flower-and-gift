import React, { useState } from "react";
import api from "../adminApi";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErr("");

    if (!ALLOWED.includes(file.type)) {
      setErr("Only JPG, PNG, WEBP allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setErr("Max file size is 5MB.");
      return;
    }

    setUploading(true);

    try {
      // 1) get signature from backend (SIGNED upload)
      const sigRes = await api.get("/admin/cloudinary-signature");
      const { cloudName, apiKey, timestamp, signature, folder } = sigRes.data;

      // 2) upload directly to Cloudinary
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", timestamp);
      form.append("signature", signature);
      form.append("folder", folder);

      // IMPORTANT: do NOT send upload_preset for signed uploads
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const up = await fetch(uploadUrl, { method: "POST", body: form });
      const data = await up.json();

      if (!up.ok) throw new Error(data?.error?.message || "Upload failed");

      // return secure url to parent form
      onChange(data.secure_url);
    } catch (e2) {
      setErr(e2.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {value ? (
        <img
          src={value}
          alt="Uploaded"
          style={{ width: 220, height: 140, objectFit: "cover", borderRadius: 12 }}
        />
      ) : (
        <div style={{ width: 220, height: 140, border: "1px dashed #aaa", borderRadius: 12 }} />
      )}

      <input type="file" accept="image/*" onChange={handleFile} />

      {uploading && <div>Uploading...</div>}
      {err && <div style={{ color: "crimson" }}>{err}</div>}
    </div>
  );
}
