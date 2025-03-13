import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const convertHtmlToPdf = async (htmlString: string): Promise<Blob> => {
  // Create temporary div to hold the HTML content
  const tempDiv: HTMLElement = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  
  // Pre-process images
  const imageElements = tempDiv.querySelectorAll('img');
  for (const img of Array.from(imageElements)) {
    // Fix zero width/height images 
    if (img.width === 0 || img.height === 0) {
      img.width = 400;
      img.height = 300;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    }
    
    // Make sure image has proper loading attributes
    img.crossOrigin = 'anonymous';
    img.loading = 'eager';
  }
  
  // Create an offscreen container that's outside the viewport
  // but still rendered by the browser
  tempDiv.style.position = "absolute";
  tempDiv.style.top = "-9999px";  // Position far off-screen
  tempDiv.style.left = "-9999px"; // Position far off-screen
  tempDiv.style.width = "210mm";  // A4 width
  tempDiv.style.height = "297mm"; // A4 height
  tempDiv.style.backgroundColor = "white";
  tempDiv.style.padding = "10mm";
  
  // Append to body temporarily
  document.body.appendChild(tempDiv);
  
  try {
    // Wait for any potential image loading and layout
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Capture the content using the same settings as your ExportHandler
    const canvas = await html2canvas(tempDiv, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: tempDiv.offsetWidth,
      height: tempDiv.offsetHeight,
      windowWidth: tempDiv.offsetWidth,
      windowHeight: tempDiv.offsetHeight,
      allowTaint: true, // Allow tainted canvas to handle cross-origin issues
    });
    
    // Optimize the image using the same function from ExportHandler
    const imgData = optimizeImage(canvas);
    
    // Initialize PDF with compression - exactly as in ExportHandler
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add image with compression - using the same params as ExportHandler
    pdf.addImage({
      imageData: imgData,
      format: "JPEG",
      x: 0,
      y: 0,
      width: pdfWidth,
      height: pdfHeight,
      compression: "FAST",
      rotation: 0,
    });
    
    // Generate the PDF blob using the same approach as ExportHandler
    const pdfOutput = pdf.output("datauristring");
    const pdfBlob = await fetch(pdfOutput).then((res) => res.blob());
    const optimizedPdfBlob = new Blob([pdfBlob], { type: "application/pdf" });
    
    return optimizedPdfBlob;
  } finally {
    // Clean up
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }
};

// Use the exact same optimizeImage function from your ExportHandler
const optimizeImage = (canvas: HTMLCanvasElement): string => {
  // Create a new canvas with optimal dimensions
  const optimizedCanvas = document.createElement("canvas");
  const ctx = optimizedCanvas.getContext("2d");

  // Set dimensions to A4 at 200 DPI (same as ExportHandler)
  optimizedCanvas.width = 1654;
  optimizedCanvas.height = 2339;

  if (ctx) {
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

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

  // Convert to compressed JPEG instead of PNG - same as ExportHandler
  return optimizedCanvas.toDataURL("image/jpeg", 0.8);
};