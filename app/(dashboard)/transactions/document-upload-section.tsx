import { ImageUploadButton } from "./image-upload-button";
import { PDFUploadButton } from "./pdf-upload-button";

export const DocumentUploadSection = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <ImageUploadButton />
      <PDFUploadButton />
    </div>
  );
}; 