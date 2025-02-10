import { useState } from 'react';
import { Camera, Loader } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useUpdateProfile } from '../hooks/useProfile';

interface ProfilePictureUploadProps {
  currentUrl?: string;
  username: string;
}

export default function ProfilePictureUpload({ currentUrl, username }: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const updateProfile = useUpdateProfile();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);

      // If there's an existing profile picture, delete it
      if (currentUrl) {
        await storageService.deleteProfilePicture(currentUrl);
      }

      // Upload new profile picture
      const newUrl = await storageService.uploadProfilePicture(file);

      // Update user profile with new avatar URL
      await updateProfile.mutateAsync({
        avatar_url: newUrl
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <div className="w-32 h-32 rounded-full bg-white p-1">
        <img
          src={currentUrl || `https://ui-avatars.com/api/?name=${username}`}
          alt={username}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <label
        htmlFor="profile-picture"
        className={`absolute bottom-0 right-0 p-2 rounded-full text-white cursor-pointer transition-colors ${
          isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
        <input
          type="file"
          id="profile-picture"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  );
}