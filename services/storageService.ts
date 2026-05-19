import { supabase } from "@/lib/supabaseClient";

export const storageService = {
  async uploadDocument(file: File): Promise<string> {
    // 1. Validate File Size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("File size exceeds 5MB limit.");
    }

    // 2. Validate MIME Type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only PDF, JPG, and PNG are allowed.");
    }

    // 3. Generate Secure Unique Filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `applications/${fileName}`;

    // 4. Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("rti-files")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) {
      throw new Error(error.message || "Failed to upload document.");
    }

    // 5. Return Public URL
    const { data } = supabase.storage.from("rti-files").getPublicUrl(filePath);
    return data.publicUrl;
  }
};
