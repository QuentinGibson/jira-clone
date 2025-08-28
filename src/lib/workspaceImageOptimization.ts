export async function workspaecImageOptimization(
  file: File,
  maxWidth: number = 80,
  maxHeight: number = 80,
  quality: number = 0.7,
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          const optimizedFile = new File([blob!], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        "image/jpeg",
        quality,
      );
    };

    img.src = URL.createObjectURL(file);
  });
}
