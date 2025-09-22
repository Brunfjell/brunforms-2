import React, { useState } from "react";
import supabase from "../utils/supabaseClient";

export default function FileUpload({ applicantId, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    try {
      const filePath = `${applicantId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("applicant_files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("applicant_files")
        .getPublicUrl(filePath);

      await supabase.from("applicant_files").insert({
        applicant_id: applicantId,
        file_url: data.publicUrl,
      });

      if (onUploaded) onUploaded(data.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      alert("File upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className="fieldset border border-gray-300 rounded p-4">
      <input
        type="file"
        className="file-input file-input-bordered w-full"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <label className="label text-sm text-gray-500 mt-1">
        {fileName ? `Selected: ${fileName}` : "Accepted format: PDF | Max size 3MB"}
      </label>
      {uploading && (
        <p className="text-sm text-blue-500 mt-1">Uploading...</p>
      )}
    </fieldset>
  );
}
