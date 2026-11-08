export function putFileToStorage(
  uploadUrl: string,
  file: File,
  onProgress: (loaded: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(file.size);
        resolve();
      } else reject(new Error(`Storage direct upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Network error during storage upload.'));
    xhr.upload.onprogress = (event) => onProgress(Math.min(event.loaded, file.size));
    xhr.send(file);
  });
}
