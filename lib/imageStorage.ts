/**
 * Helpers for persisting image previews (blob URL -> base64 for sessionStorage,
 * base64 -> File for save/compress).
 */

/** Convert a blob URL to a base64 data URL for storage. */
export function blobUrlToDataUrl(blobUrl: string): Promise<string> {
  return fetch(blobUrl)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        })
    );
}

/** Convert a base64 data URL to a File (for compress/upload). */
export function dataUrlToFile(dataUrl: string, filename: string = "preview.webp"): Promise<File> {
  return fetch(dataUrl)
    .then((r) => r.blob())
    .then((blob) => new File([blob], filename, { type: blob.type || "image/webp" }));
}
