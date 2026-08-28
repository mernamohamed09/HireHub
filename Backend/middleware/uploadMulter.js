const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileType = require('file-type');

// The claimed mimetype comes from the client and can be forged (rename an .exe
// to .pdf). After the file lands on disk, confirm its real signature. PDFs start
// with %PDF; .docx is a ZIP container, so file-type reports it as application/zip
// (or the docx-specific type on newer versions).
const ACCEPTED_SIGNATURES = new Set([
    'application/pdf',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const verifyFileSignature = async (filePath) => {
    const detected = await fileType.fromFile(filePath);
    return detected && ACCEPTED_SIGNATURES.has(detected.mime);
};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Absolute, like app.js: a CWD-relative path silently writes uploads to
        // the wrong place whenever the server is started from another directory.
        cb(null, path.join(__dirname, '..', 'uploads', 'cvs'));
    },
    filename: (req, file, cb) => {
       
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `cv-${req.user.id}-${uniqueSuffix}${extension}`);
    }
});

// Kept in step with fileParser.js's SUPPORTED_EXTENSIONS. Legacy .doc
// (application/msword) is deliberately absent: mammoth only reads .docx, so
// accepting .doc produced uploads that always failed AI analysis silently.
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
});


const uploadCV = (req, res, next) => {
    const uploadSingle = upload.single('cv'); 

    uploadSingle(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            // multer's code is LIMIT_FILE_SIZE; the old FILE_TOO_LARGE check
            // never matched, so users got the raw multer string instead.
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ msg: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ msg: err.message });
        } else if (err) {

            return res.status(400).json({ msg: err.message });
        }

        // Confirm the bytes match the claimed type; delete and reject on mismatch.
        if (req.file) {
            try {
                const signatureOk = await verifyFileSignature(req.file.path);
                if (!signatureOk) {
                    fs.unlink(req.file.path, () => {});
                    return res.status(400).json({ msg: 'File content does not match a valid PDF or DOCX.' });
                }
            } catch {
                fs.unlink(req.file.path, () => {});
                return res.status(400).json({ msg: 'Could not verify the uploaded file.' });
            }
        }

        next();
    });
};

module.exports = uploadCV;