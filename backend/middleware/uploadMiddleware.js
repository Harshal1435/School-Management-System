import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    if (file.fieldname === 'profileImage') uploadPath += 'profiles/';
    else if (file.fieldname === 'document' || file.fieldname === 'documents') uploadPath += 'documents/';
    else uploadPath += 'misc/';
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImages = /jpeg|jpg|png|gif|webp/;
  const allowedDocs = /pdf|doc|docx|xls|xlsx|ppt|pptx/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (file.fieldname === 'profileImage') {
    allowedImages.test(ext) ? cb(null, true) : cb(new Error('Only image files allowed for profile pictures'));
  } else if (file.fieldname === 'document' || file.fieldname === 'documents') {
    allowedDocs.test(ext) || allowedImages.test(ext) ? cb(null, true) : cb(new Error('Invalid document type'));
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;
