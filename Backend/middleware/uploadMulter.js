const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        
        cb(null, 'uploads/cvs/'); 
    },
    filename: (req, file, cb) => {
       
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `cv-${req.user.id}-${uniqueSuffix}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); 
    } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
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

    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            
            if (err.code === 'FILE_TOO_LARGE') {
                return res.status(400).json({ msg: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ msg: err.message });
        } else if (err) {
            
            return res.status(400).json({ msg: err.message });
        }
        next();
    });
};

module.exports = uploadCV;