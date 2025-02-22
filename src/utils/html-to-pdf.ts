import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const convertHtmlToPdf = async (htmlString: string): Promise<Blob> => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv);
    document.body.removeChild(tempDiv);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    const pdfBlob = pdf.output('blob');

    return pdfBlob;
  };

