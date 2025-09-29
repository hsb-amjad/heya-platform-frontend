import { useState } from "react";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type Props = { token: string };

export default function CvUploader({ token }: Props) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // (optional) client-side guardrails
    const maxMB = 15;
    if (file.size > maxMB * 1024 * 1024) {
      setErrMsg(`File too large. Max ${maxMB} MB.`);
      return;
    }

    setBusy(true);
    setErrMsg(null);

    try {
      // 1) upload to Cloudinary
      const secureUrl = await uploadToCloudinary(file);
      setUrl(secureUrl);

      // 2) send URL to backend /step5
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup/step5`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cv_file: secureUrl }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Backend step5 failed (${res.status})`);
      }

      alert("CV saved ✅");
    } catch (err: any) {
      console.error(err);
      setErrMsg(err?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFile}
        disabled={busy}
      />
      {busy && <p>Uploading…</p>}
      {url && (
        <p>
          Uploaded: <a href={url} target="_blank" rel="noreferrer">{url}</a>
        </p>
      )}
      {errMsg && <p style={{ color: "crimson" }}>{errMsg}</p>}
    </div>
  );
}
