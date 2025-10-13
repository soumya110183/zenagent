import html2pdf from 'html2pdf.js';

export class HTMLExportService {
  async exportToPDF(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Export element not found');
    }

    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to export PDF');
    }
  }

  async exportToDOCX(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Export element not found');
    }

    try {
      // Create Word-compatible HTML with proper XML namespaces
      const htmlContent = element.innerHTML;
      
      const wordDocument = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Document</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 8.5in 11in;
              margin: 1in;
            }
            body {
              font-family: Calibri, Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              color: #000000;
            }
            h1 {
              font-size: 24pt;
              font-weight: bold;
              margin-top: 12pt;
              margin-bottom: 12pt;
              color: #1a1a1a;
            }
            h2 {
              font-size: 18pt;
              font-weight: bold;
              margin-top: 10pt;
              margin-bottom: 8pt;
              color: #1a1a1a;
            }
            h3 {
              font-size: 14pt;
              font-weight: bold;
              margin-top: 8pt;
              margin-bottom: 6pt;
              color: #1a1a1a;
            }
            p {
              margin-top: 6pt;
              margin-bottom: 6pt;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 10pt 0;
            }
            th, td {
              border: 1pt solid #cccccc;
              padding: 8pt;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            ul, ol {
              margin-left: 20pt;
            }
            li {
              margin-bottom: 4pt;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      // Create blob with proper MIME type for Word
      const blob = new Blob(['\ufeff', wordDocument], {
        type: 'application/vnd.ms-word'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('DOCX export error:', error);
      throw new Error('Failed to export DOCX');
    }
  }
}

export const htmlExportService = new HTMLExportService();
