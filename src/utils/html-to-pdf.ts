import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const convertHtmlToPdf = async (htmlString: string): Promise<Blob> => {
  // Create temporary div to hold the HTML content
  const tempDiv: HTMLElement = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  
  // Preload all images with CORS attributes
  const imageElements = tempDiv.querySelectorAll('img');
  for (const img of Array.from(imageElements)) {
    img.crossOrigin = 'anonymous';
    // Fix the width and height - your images show width="0" height="0"
    if (img.width === 0 || img.height === 0) {
      img.width = 100; // Set a reasonable default width
      img.height = 100; // Set a reasonable default height
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    }
  }
  
  tempDiv.style.position = "fixed";
  tempDiv.style.top = "0";
  tempDiv.style.left = "0";
  tempDiv.style.visibility = "visible";
  tempDiv.style.width = "210mm";
  tempDiv.style.height = "297mm";
  tempDiv.style.backgroundColor = "white";
  
  document.body.appendChild(tempDiv);
  
  // Helper function to preload images
  const preloadImages = async () => {
    const promises = Array.from(imageElements).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(null);
        } else {
          img.onload = () => resolve(null);
          img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            resolve(null); // Resolve anyway to continue with other images
          };
        }
      });
    });
    
    return Promise.all(promises);
  };
  
  try {
    // Wait for images to load
    await preloadImages();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Longer timeout
    
    // Capture the content
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: true, // Enable logging for debugging
      backgroundColor: "#ffffff",
      width: tempDiv.offsetWidth,
      height: tempDiv.offsetHeight,
      windowWidth: tempDiv.offsetWidth,
      windowHeight: tempDiv.offsetHeight,
      allowTaint: true, // Allow tainted canvas for cross-origin images
      imageTimeout: 15000 // Increase timeout for images
    });
    
    // Optimize the image like in ExportHandler
    const optimizedImgData = optimizeImage(canvas);
    
    // Initialize PDF with compression
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add image with compression
    pdf.addImage({
      imageData: optimizedImgData,
      format: "JPEG",
      x: 0,
      y: 0,
      width: pdfWidth,
      height: pdfHeight,
      compression: "FAST",
      rotation: 0,
    });
    
    // Generate the PDF blob
    const pdfOutput = pdf.output("datauristring");
    const pdfBlob = await fetch(pdfOutput).then((res) => res.blob());
    const optimizedPdfBlob = new Blob([pdfBlob], { type: "application/pdf" });
    
    return optimizedPdfBlob;
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};

// Helper function to optimize the canvas image
const optimizeImage = (canvas: HTMLCanvasElement): string => {
  // Create a new canvas with optimal dimensions
  const optimizedCanvas = document.createElement("canvas");
  const ctx = optimizedCanvas.getContext("2d");

  // Set dimensions to A4 at 300 DPI for better quality
  optimizedCanvas.width = 2480; // A4 width at 300 DPI
  optimizedCanvas.height = 3508; // A4 height at 300 DPI

  if (ctx) {
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    // Fill with white background first
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, optimizedCanvas.width, optimizedCanvas.height);

    // Draw original canvas onto optimized canvas
    ctx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      optimizedCanvas.width,
      optimizedCanvas.height,
    );
  }

  // Convert to compressed JPEG with higher quality
  return optimizedCanvas.toDataURL("image/jpeg", 0.9);
};