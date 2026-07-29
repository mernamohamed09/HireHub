const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileType = require('file-type');

const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname) || '.jpg';
        cb(null, `avatar-${req.user.id}-${uniqueSuffix}${extension}`);
    }
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter
});

const uploadAvatar = (req, res, next) => {
    upload.single('avatar')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ msg: 'Image too large. Maximum size is 2MB.' });
            }
            return res.status(400).json({ msg: err.message });
        } else if (err) {
            return res.status(400).json({ msg: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No image uploaded' });
        }

        // Confirm the bytes are really an image, not a renamed file.
        try {
            const detected = await fileType.fromFile(req.file.path);
            if (!detected || !ALLOWED_MIME.includes(detected.mime)) {
                fs.unlink(req.file.path, () => {});
                return res.status(400).json({ msg: 'File content is not a valid image.' });
            }
        } catch {
            fs.unlink(req.file.path, () => {});
            return res.status(400).json({ msg: 'Could not verify the uploaded image.' });
        }

        next();
    });
};

module.exports = uploadAvatar;
