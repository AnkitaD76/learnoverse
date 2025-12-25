import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const CertificatePage = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/certificates/${certificateId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load certificate');
        }

        const data = await response.json();
        setCertificate(data.certificate);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const response = await fetch(
        `${API_BASE_URL}/certificates/${certificateId}/pdf`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${certificate.certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
            <p className="mb-6 text-gray-700">{error}</p>
            <Link
              to="/"
              className="inline-block rounded-lg bg-[#FF6A00] px-6 py-2 text-white hover:bg-[#E85D00]"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Certificate not found</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Download Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="rounded-lg bg-[#FF6A00] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#E85D00] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {downloading ? 'Generating PDF...' : 'Download Certificate'}
          </button>
        </div>

        {/* Certificate Display */}
        <div className="flex justify-center">
          <div className="relative h-[794px] w-[1123px] border-[10px] border-[#7fb7c9] bg-[#fffdf9] p-12 font-serif shadow-2xl">
            <div className="relative h-full w-full border-4 border-[#b8dbe6] p-10">
              <div className="absolute top-6 left-6 text-sm font-bold text-[#3c7f91]">
                Learnoverse
              </div>

              <div className="text-center text-[#3c7f91]">
                <h1 className="text-5xl tracking-widest">CERTIFICATE</h1>
                <h2 className="mt-2 text-2xl italic">of Completion</h2>
              </div>

              <div className="mt-12 text-center text-gray-800">
                <p className="text-lg">
                  This certificate is proudly presented to
                </p>

                <div className="mt-4 inline-block border-b-2 border-[#3c7f91] px-6 text-4xl font-bold text-[#3c7f91]">
                  {certificate.recipient.name}
                </div>

                <p className="mt-6">for successfully completing the course</p>

                <div className="mt-3 text-xl font-semibold">
                  {certificate.course.title}
                </div>

                <p className="mt-6 text-sm">Awarded on {formattedDate}</p>
              </div>

              <div className="absolute right-20 bottom-20 left-20 flex items-center justify-between text-sm">
                <div className="text-center">
                  _______________________
                  <br />
                  Instructor
                </div>

                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 font-bold text-yellow-900">
                  VERIFIED
                </div>

                <div className="text-center">
                  _______________________
                  <br />
                  Learnoverse
                </div>
              </div>

              <div className="absolute right-6 bottom-6 text-xs text-gray-600">
                Certificate ID: {certificate.certificateNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            This certificate can be verified at:{' '}
            <span className="font-mono text-[#FF6A00]">
              {window.location.href}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
