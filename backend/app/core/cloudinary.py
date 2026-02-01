import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name = settings.CLOUDINARY_CLOUD_NAME,
    api_key = settings.CLOUDINARY_API_KEY,
    api_secret = settings.CLOUDINARY_API_SECRET,
)

def upload_profile_picture(file_file) -> str:
    if not file_file:
        return None
    
    try:
        result = cloudinary.uploader.upload(
            file_file,
            folder="chat_app_avatars",

            transformation=[
                {"width": 500, "height": 500, "crop": "limit"},
                {"quality": "auto"}
            ]
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary Error : {e}")
        return None