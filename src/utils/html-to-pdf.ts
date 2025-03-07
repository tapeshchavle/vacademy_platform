import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const convertHtmlToPdf = async (htmlString: string): Promise<Blob> => {
  // Create temporary div to hold the HTML content
  const tempDiv: HTMLElement = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  tempDiv.style.position = "fixed";
  tempDiv.style.top = "0";
  tempDiv.style.left = "0";
  tempDiv.style.visibility = "visible";
  tempDiv.style.width = "210mm";
  tempDiv.style.height = "297mm";
  tempDiv.style.backgroundColor = "white";
  
  document.body.appendChild(tempDiv);
  
  // Wait for any potential reflows
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  try {
    // Capture the content
    const canvas = await html2canvas(tempDiv, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: tempDiv.offsetWidth,
      height: tempDiv.offsetHeight,
      windowWidth: tempDiv.offsetWidth,
      windowHeight: tempDiv.offsetHeight,
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

// Helper function to optimize the canvas image (copied from ExportHandler)
const optimizeImage = (canvas: HTMLCanvasElement): string => {
  // Create a new canvas with optimal dimensions
  const optimizedCanvas = document.createElement("canvas");
  const ctx = optimizedCanvas.getContext("2d");

  // Set dimensions to A4 at 200 DPI
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

  // Convert to compressed JPEG instead of PNG
  return optimizedCanvas.toDataURL("image/jpeg", 0.8);
};