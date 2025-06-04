# PDF Content Extractor API

This is a FastAPI-based web application that allows users to extract text content from password-protected PDF files.

## Features

- Upload password-protected PDF files
- Extract text content accurately
- Handle encrypted PDFs with password protection
- Return extracted content in JSON format

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
uvicorn app:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### 1. Root Endpoint
- URL: `/`
- Method: `GET`
- Description: Check if the API is running

### 2. Extract PDF Content
- URL: `/extract-pdf/`
- Method: `POST`
- Form Data Parameters:
  - `file`: PDF file (multipart/form-data)
  - `password`: PDF password (if protected)
- Response: JSON containing extracted text content and number of pages

## Example Usage

Using curl:
```bash
curl -X POST "http://localhost:8000/extract-pdf/" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_pdf_file.pdf" \
  -F "password=your_password"
```

## API Documentation

Once the server is running, you can access:
- Interactive API documentation: `http://localhost:8000/docs`
- Alternative API documentation: `http://localhost:8000/redoc` 