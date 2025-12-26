const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const createDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

createDir('public/uploads/profiles');
createDir('public/uploads/cvs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'profilePicture') {
            cb(null, 'public/uploads/profiles');
        } else if (file.fieldname === 'cv') {
            cb(null, 'public/uploads/cvs');
        } else {
            cb(null, 'public/uploads/others');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
    } else if (file.fieldname === 'cv') {
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
            return cb(new Error('Only PDF and Word documents are allowed!'), false);
        }
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
