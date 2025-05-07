import { ImageUploadButton } from "./image-upload-button";
import { PDFUploadButton } from "./pdf-upload-button";

type DocumentUploadSectionProps = {
  onClose: () => void;
};

export const DocumentUploadSection = ({ onClose }: DocumentUploadSectionProps) => {
  return (
    <>
      <ImageUploadButton onClose={onClose} />
      <PDFUploadButton onClose={onClose} />
    </>
  );
}; 