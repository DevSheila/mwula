import { PDFDocument } from 'pdf-lib';

export async function isPdfPasswordProtected(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
      ignoreEncryption: true,
      updateMetadata: false 
    });
    
    // If the document is encrypted, it means it's password protected
    return pdfDoc.isEncrypted;
  } catch (error) {
    // If there's an error loading the PDF, it might be due to encryption
    console.error('Error checking PDF protection:', error);
    return true;
  }
}

export async function loadProtectedPdf(file: File, password: string): Promise<ArrayBuffer> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
      password,
      updateMetadata: false 
    });
    
    // If we get here, the password was correct
    // Return the decrypted PDF as ArrayBuffer
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error loading protected PDF:', error);
    throw new Error('Invalid password or corrupted PDF');
  }
} 