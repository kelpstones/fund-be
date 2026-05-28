const { cloudinary } = require("../config/cloudinary");

const isImageBuffer = (buffer) => {
  if (!buffer || buffer.length < 4) return false;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return true;
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
    return true;
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46)
    return true;
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }
  return false;
};

const uploadToCloudinary = (buffer, folder, resource_type = "auto") => {
  return new Promise((resolve, reject) => {
    const options = { folder, resource_type };

    if (resource_type === "image" || isImageBuffer(buffer)) {
      options.resource_type = "image";
      options.transformation = [{ quality: "auto:best", fetch_format: "auto" }];
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (file_url, folder) => {
  if (!file_url) return;
  const parts = file_url.split("/");
  const filename = parts[parts.length - 1].split(".")[0];
  await cloudinary.uploader.destroy(`${folder}/${filename}`);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
