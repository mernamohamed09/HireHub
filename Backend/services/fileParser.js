const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx'];

// pdf-parse's bundled pdf.js clones its input via `new value.constructor(value)`.
// For a Node Buffer that re-allocates through Buffer's shared 8KB pool, so any
// file under ~4KB comes back with a non-zero byteOffset while pdf.js keeps
// reading offsets against the whole pooled ArrayBuffer - every xref offset is
// then shifted and parsing dies with "bad XRef entry". Handing it a plain
// Uint8Array keeps the clone pool-free and byteOffset 0 at any size.
const toPoolFreeBytes = (buffer) => Uint8Array.from(buffer);

/**
 * Extracts clean UTF-8 text from a resume file buffer.
 * Never throws: parse failures, unsupported types, and empty text (e.g. a
 * scanned image PDF with no text layer) are all reported via the returned
 * `reason`, so callers can react without a try/catch around a generic error.
 */
const extractTextFromFile = async (buffer, extension) => {
    const ext = (extension || '').toLowerCase();

    try {
        let rawText;

        if (ext === '.pdf') {
            const result = await pdfParse(toPoolFreeBytes(buffer));
            rawText = result.text;
        } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ buffer });
            rawText = result.value;
        } else {
            return { success: false, reason: 'UNSUPPORTED_FILE_TYPE', text: '' };
        }

        const text = (rawText || '').trim();

        if (!text) {
            return { success: false, reason: 'EMPTY_TEXT', text: '' };
        }

        return { success: true, text };
    } catch (error) {
        return { success: false, reason: 'PARSE_ERROR', text: '', error: error.message };
    }
};

module.exports = { extractTextFromFile, SUPPORTED_EXTENSIONS };
