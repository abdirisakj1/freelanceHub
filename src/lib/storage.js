import supabase from "./supabase";

export async function uploadJobImage(file, userId) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `jobs/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("job-images")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("job-images").getPublicUrl(filePath);
  return data.publicUrl;
}
