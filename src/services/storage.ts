import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";
export async function uploadIdeaPhoto(spaceId: string, ideaId: string, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Images must be smaller than 10 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const snapshot = await uploadBytes(ref(storage, `spaces/${spaceId}/ideas/${ideaId}/cover.${extension}`), file, { contentType: file.type });
  return getDownloadURL(snapshot.ref);
}

