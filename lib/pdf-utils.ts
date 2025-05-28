import { PDFDocument } from 'pdf-lib';

export async function isPDFPasswordProtected(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Load with ignoreEncryption to check if it's encrypted
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
      ignoreEncryption: true 
    });
    return pdfDoc.isEncrypted;
  } catch (error) {
    console.error('Error checking PDF encryption:', error);
    return false; // If we can't check, assume it's not encrypted to avoid blocking
  }
}

export async function decryptPDF(file: File, password: string): Promise<ArrayBuffer> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // First verify if the password is correct by attempting to load with the password
    try {
      // First load with ignoreEncryption to verify it's actually encrypted
      const checkDoc = await PDFDocument.load(arrayBuffer, { 
        ignoreEncryption: true 
      });
      
      if (!checkDoc.isEncrypted) {
        // If not encrypted, just return the original buffer
        return arrayBuffer;
      }

      // Now try to load with the password
      const pdfDoc = await PDFDocument.load(arrayBuffer, { 
        password,
        ignoreEncryption: false // Make sure we're actually checking the password
      });

      // If we get here, password was correct. Create a new unencrypted document
      const newPdfDoc = await PDFDocument.create();
      
      // Copy all pages
      const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => newPdfDoc.addPage(page));

      // Save as unencrypted
      const pdfBytes = await newPdfDoc.save({
        useObjectStreams: false
      });

      return pdfBytes.buffer;
    } catch (error) {
      console.error('Password verification failed:', error);
      // If we get here, the password was incorrect
      throw new Error('Invalid password');
    }
  } catch (error) {
    console.error('Error in decryptPDF:', error);
    if (error.message === 'Invalid password') {
      throw error; // Re-throw password errors
    }
    throw new Error('Failed to process the PDF. Please try again.');
  }
}

export async function convertPDFToBase64(arrayBuffer: ArrayBuffer): Promise<string> {
  return Buffer.from(arrayBuffer).toString('base64');
} 