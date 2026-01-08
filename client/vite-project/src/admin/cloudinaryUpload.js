import axios from "axios";

/**
 * Uploads a file to Cloudinary (signed upload).
 * Requires admin token to call your signature endpoint.
 */
export async function uploadToCloudinary({ file, token }) {
  // 1) Get signature from your backend (admin protected)
  const sigRes = await axios.get("/api/admin/cloudinary-signature", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { timestamp, signature, cloudName, apiKey, folder } = sigRes.data;

  // 2) Upload directly to Cloudinary
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);
  form.append("folder", folder);

  const uploadRes = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const data = await uploadRes.json();

  // Cloudinary returns secure_url (CDN)
  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}
