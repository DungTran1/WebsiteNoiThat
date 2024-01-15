import multer from 'multer'
import path from 'path'
import fs from 'fs-extra'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../public/images/upload')

        fs.mkdirp(dest, function (err) {
            if (err) cb(err, dest)
            else cb(null, dest)
        })
    },
    filename: function (req, file, cb) {
        const filePath = path.parse(file.originalname)
        cb(null, filePath.name + '-' + Date.now() + filePath.ext)
    },
})

const upload = multer({ storage: storage })
export default upload
