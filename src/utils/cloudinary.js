const { cloudinary } = require('../config/cloudinary')

const uploadToCloudinary = (buffer, folder, resource_type = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

const deleteFromCloudinary = async (file_url, folder) => {
  if (!file_url) return
  const parts = file_url.split('/')
  const filename = parts[parts.length - 1].split('.')[0]
  await cloudinary.uploader.destroy(`${folder}/${filename}`)
}

module.exports = { uploadToCloudinary, deleteFromCloudinary }