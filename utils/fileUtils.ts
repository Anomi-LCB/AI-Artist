
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
