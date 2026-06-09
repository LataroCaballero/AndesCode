---
status: complete
phase: 04-qr-pdf-and-visual-certificate
source: [04-VERIFICATION.md]
started: 2026-06-08T17:00:00Z
updated: 2026-06-08T17:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. QR code scans to correct URL on a phone camera
expected: Scanning the QR on the /certificados/:code page with any phone camera app opens the same verification URL without errors.
result: pass

### 2. REVOCADO watermark is visibly diagonal on a real device
expected: On a revoked certificate's page, the REVOCADO watermark appears clearly diagonal (≈-30°) across the certificate card, semi-transparent, red, without obscuring the underlying certificate data.
result: pass

### 3. PDF downloads without CORS errors in production and visually matches the reference design
expected: Clicking "Descargar certificado PDF" in production (or preview) downloads a file named certificado-{code}.pdf. The PDF opens correctly, shows logos (AndesCode wordmark + FCEFN), student name, all fields, and an embedded QR code matching ref/assets/certificado.png layout.
result: pass

### 4. Revoked certificate PDF contains the diagonal REVOCADO watermark
expected: Downloading the PDF for a revoked certificate produces a file with a semi-transparent red diagonal REVOCADO watermark overlaid on the content.
result: pass

### 5. Loading spinner and inline error message work on PDF generation
expected: While generating the PDF, the "Descargar certificado PDF" button shows an animate-spin spinner and "Generando PDF..." label and is disabled. If generation fails, an inline Spanish error message appears below the button row.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
