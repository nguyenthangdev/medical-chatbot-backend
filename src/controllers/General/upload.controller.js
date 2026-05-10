import { StatusCodes } from 'http-status-codes';
import cloudinary from '../../config/cloudinary.js';

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Vui lòng chọn một file ảnh!' });
    }

    // Đẩy buffer ảnh trực tiếp lên Cloudinary bằng upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'medical_chatbot/avatars' },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi khi upload lên Cloudinary' });
        }
        
        res.status(StatusCodes.OK).json({ 
            message: 'Upload thành công!',
            url: result.secure_url 
        });
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống khi upload ảnh!' });
  }
};

export const uploadController = { uploadImage };