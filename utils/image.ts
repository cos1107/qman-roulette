
export const processToSticker = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');

        // Draw Circle Mask
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2);
        ctx.clip();

        // Calculate aspect ratio for "cover" effect
        const aspect = img.width / img.height;
        let drawW, drawH, dx, dy;
        if (aspect > 1) {
          drawH = size;
          drawW = size * aspect;
          dx = -(drawW - size) / 2;
          dy = 0;
        } else {
          drawW = size;
          drawH = size / aspect;
          dx = 0;
          dy = -(drawH - size) / 2;
        }

        ctx.drawImage(img, dx, dy, drawW, drawH);

        // Reset clip for border
        ctx.restore();
        
        // Gold Border
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#FFD700';
        ctx.strokeRect(0, 0, size, size); // Simplistic border for demo, usually circle
        
        // Actually a circular border is better
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2);
        ctx.stroke();

        // Add "Fu" (福) Badge
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(size - 40, size - 40, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#D90429';
        ctx.font = 'bold 36px "Microsoft JhengHei"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('福', size - 40, size - 40);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
