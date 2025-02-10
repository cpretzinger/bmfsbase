import { useState } from 'react';
import { Upload, CheckCircle, Loader } from 'lucide-react';
import { useAttendance } from '../hooks/useAttendance';

interface VerifiedAttendanceUploadProps {
  concertId: string;
}

export default function VerifiedAttendanceUpload({ concertId }: VerifiedAttendanceUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const { attendance, submitAttendance } = useAttendance(concertId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      // In a real app, you'd upload the file to storage first
      // For now, we'll just pretend we have a URL
      const fakeUrl = `https://storage.example.com/${file.name}`;
      await submitAttendance.mutateAsync({
        concertId,
        proofUrl: fakeUrl
      });
      setFile(null);
    } catch (error) {
      console.error('Error uploading attendance:', error);
    }
  };

  if (attendance) {
    return (
      <div className={`rounded-lg p-4 flex items-center space-x-3 ${
        attendance.status === 'approved' 
          ? 'bg-blue-50 border border-blue-200' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        {attendance.status === 'approved' ? (
          <CheckCircle className="w-6 h-6 text-blue-500" />
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
        )}
        <div>
          <p className={attendance.status === 'approved' ? 'text-blue-700' : 'text-gray-700'}>
            {attendance.status === 'approved' 
              ? 'Your attendance has been verified!' 
              : 'Your proof of attendance is pending verification.'}
          </p>
          <p className="text-sm mt-1 text-gray-600">
            Submitted on {new Date(attendance.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          id="proof"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="proof"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-gray-600">
            Upload ticket stub or proof of attendance
          </span>
          {file && (
            <span className="text-sm text-blue-600 font-medium">
              {file.name}
            </span>
          )}
        </label>
      </div>
      {file && (
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitAttendance.isPending}
        >
          {submitAttendance.isPending ? (
            <Loader className="animate-spin h-5 w-5" />
          ) : (
            'Submit for Verification'
          )}
        </button>
      )}
    </form>
  );
}