const multer = require("multer");
const sharp = require("sharp");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const AppError = require("../error/AppError");


const multerStorage = multer.memoryStorage();

// Validar que solo suban imágenes
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new AppError("El archivo no es una imagen. Por favor suba solo imágenes.", 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadUserPhoto = upload.single("foto");


const resizeUserPhoto = async (req, res, next) => {
    if (!req.file) return next();

    const uploadPath = path.join(__dirname, "../uploads/perfiles");
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    let nombreArchivo;
    let rutaAbsoluta;

    do{
        const uuidUnico = crypto.randomUUID();
        nombreArchivo = `${uuidUnico}.webp`;
        rutaAbsoluta = path.join(uploadPath, nombreArchivo);
    }while(fs.existsSync(rutaAbsoluta));

    try {
        await sharp(req.file.buffer)
            .resize(400, 400)
            .toFormat("webp") 
            .webp({ quality: 80 })
            .toFile(path.join(rutaAbsoluta));
        req.file.filename = nombreArchivo; 
        next();
    } catch (error) {
        next(new AppError("Error al procesar la imagen", 500));
    }
};

module.exports = {
    uploadUserPhoto,
    resizeUserPhoto
};