
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result is a data URL like "data:image/png;base64,iVBORw0KGgo...".
      // We need to strip the prefix "data:image/png;base64," to get just the base64 string.
      const base64String = result.split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error("Failed to extract Base64 string from file."));
      }
    };
    reader.onerror = (error) => reject(error);
  });

export const base64ToFile = (base64: string, filename: string, mimeType: string): Promise<File> => {
  const dataUrl = `data:${mimeType};base64,${base64}`;
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => new File([blob], filename, { type: mimeType }));
};

export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      // The result is a data URL like "data:video/mp4;base64,AAAAFGZ0eX...".
      // We need to return the full data URL for videos to be playable in the workspace and lightbox.
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
  });

// FIX: Add missing fileToImage utility function.
export const fileToImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error("Could not read file."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
