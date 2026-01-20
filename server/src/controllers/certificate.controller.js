import { StatusCodes } from 'http-status-codes';
import { Certificate, Course, Enrollment, User } from '../models/index.js';
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from '../errors/index.js';
import {
    checkCourseCompletion,
    issueCertificateIfComplete,
} from '../services/completion.service.js';

/**
 * POST /api/v1/courses/:id/lessons/:lessonId/complete
 * Mark a lesson as complete and issue certificate if course is completed
 */
export const markLessonComplete = async (req, res) => {
    const { userId } = req.user;
    const { id: courseId, lessonId } = req.params;

    // Find enrollment
    const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        status: 'enrolled',
    });

    if (!enrollment) {
        throw new BadRequestError('You are not enrolled in this course');
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Verify lesson exists
    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
        throw new NotFoundError('Lesson not found');
    }

    // Check if already completed
    const alreadyCompleted = enrollment.completedLessonIds.some(
        id => String(id) === String(lessonId)
    );

    if (!alreadyCompleted) {
        enrollment.completedLessonIds.push(lessonId);
        await enrollment.save();
    }

    // Check if course is now complete (including evaluation scores)
    const totalLessons = course.lessons.length;
    const completedLessons = enrollment.completedLessonIds.length;

    // Use the completion service to check if course is complete
    const completionStatus = await checkCourseCompletion(userId, courseId);
    const certificate = await issueCertificateIfComplete(userId, courseId);

    res.status(StatusCodes.OK).json({
        success: true,
        message: alreadyCompleted
            ? 'Lesson already marked as complete'
            : 'Lesson marked as complete',
        progress: {
            completedLessons,
            totalLessons,
            percentage:
                totalLessons > 0
                    ? Math.round((completedLessons / totalLessons) * 100)
                    : 0,
            isComplete: completionStatus.isComplete,
            reason: completionStatus.reason,
            progressDetails: completionStatus.progress,
        },
        certificate: certificate
            ? {
                  id: certificate._id,
                  certificateNumber: certificate.certificateNumber,
                  issuedAt: certificate.issuedAt,
              }
            : null,
    });
};

/**
 * GET /api/certificates/:certificateId
 * Public route - Get certificate details for rendering
 */
export const getCertificate = async (req, res) => {
    const { certificateId } = req.params;

    // Validate certificateId format
    if (!certificateId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new BadRequestError('Invalid certificate ID format');
    }

    const certificate = await Certificate.findById(certificateId)
        .populate('user', 'name email')
        .populate('course', 'title instructor')
        .populate({
            path: 'course',
            populate: {
                path: 'instructor',
                select: 'name',
            },
        });

    if (!certificate) {
        throw new NotFoundError('Certificate not found');
    }

    if (certificate.status === 'revoked') {
        throw new BadRequestError('This certificate has been revoked');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        certificate: {
            id: certificate._id,
            certificateNumber: certificate.certificateNumber,
            issuedAt: certificate.issuedAt,
            status: certificate.status,
            recipient: {
                name: certificate.user.name,
            },
            course: {
                title: certificate.course.title,
                instructor:
                    certificate.course.instructor?.name || 'Learnoverse',
            },
        },
    });
};

/**
 * POST /api/certificates/:certificateId/pdf
 * Generate and stream PDF from certificate HTML
 */
export const generateCertificatePDF = async (req, res) => {
    const { certificateId } = req.params;

    // Validate certificateId format
    if (!certificateId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new BadRequestError('Invalid certificate ID format');
    }

    const certificate = await Certificate.findById(certificateId)
        .populate('user', 'name email')
        .populate('course', 'title instructor')
        .populate({
            path: 'course',
            populate: {
                path: 'instructor',
                select: 'name',
            },
        });

    if (!certificate) {
        throw new NotFoundError('Certificate not found');
    }

    if (certificate.status === 'revoked') {
        throw new BadRequestError('This certificate has been revoked');
    }

    // Import puppeteer dynamically
    const puppeteer = await import('puppeteer');

    let browser;
    try {
        browser = await puppeteer.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    } catch (launchError) {
        console.error('Failed to launch browser:', launchError);
        throw new Error(
            'Failed to launch PDF generator. Please try again later.'
        );
    }

    try {
        const page = await browser.newPage();

        // Format date
        const formattedDate = new Date(certificate.issuedAt).toLocaleDateString(
            'en-US',
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }
        );

        // Get instructor name
        const instructorName =
            certificate.course.instructor?.name || 'Learnoverse Instructor';

        // Get base URL for verification link
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verificationUrl = `${baseUrl}/certificates/${certificate._id}`;

        // Build certificate HTML with Tailwind CDN
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - ${certificate.certificateNumber}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="m-0 p-0">
    <div class="w-[1123px] h-[794px] bg-[#fffdf9] border-[10px] border-[#7fb7c9] p-12 relative font-serif">
        <div class="border-4 border-[#b8dbe6] w-full h-full p-10 relative">
            <div class="absolute top-6 left-6 text-[#3c7f91] font-bold text-sm">
                Learnoverse
            </div>
            <div class="text-center text-[#3c7f91]">
                <h1 class="text-5xl tracking-widest">CERTIFICATE</h1>
                <h2 class="text-2xl italic mt-2">of Completion</h2>
            </div>
            <div class="text-center mt-10 text-gray-800">
                <p class="text-lg">This certificate is proudly presented to</p>
                <div class="text-4xl font-bold text-[#3c7f91] border-b-2 border-[#3c7f91] inline-block mt-4 px-6">
                    ${certificate.user.name}
                </div>
                <p class="mt-5">for successfully completing the course</p>
                <div class="text-xl font-semibold mt-2">
                    ${certificate.course.title}
                </div>
                <p class="mt-3 text-sm text-gray-600">Instructor: ${instructorName}</p>
                <p class="mt-3 text-sm">Awarded on ${formattedDate}</p>
            </div>
            <div class="absolute bottom-24 left-20 right-20 flex justify-between items-center text-sm">
                <div class="text-center">
                    <div class="font-semibold text-[#3c7f91] mb-1">${instructorName}</div>
                    _______________________<br />Instructor
                </div>
                <div class="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 flex items-center justify-center font-bold text-yellow-900">
                    VERIFIED
                </div>
                <div class="text-center">
                    _______________________<br />Learnoverse
                </div>
            </div>
            <div class="absolute bottom-6 left-6 right-6 flex justify-between items-end text-xs text-gray-600">
                <div>
                    <span class="font-semibold">Verify at:</span> <a href="${verificationUrl}" class="text-[#3c7f91] underline">${verificationUrl}</a>
                </div>
                <div>
                    Certificate ID: ${certificate.certificateNumber}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            width: '1123px',
            height: '794px',
            printBackground: true,
        });

        await browser.close();

        // Stream PDF to client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="Certificate-${certificate.certificateNumber}.pdf"`
        );
        res.send(pdfBuffer);
    } catch (error) {
        if (browser) {
            await browser.close();
        }
        console.error('PDF generation error:', error);
        throw error;
    }
};

/**
 * GET /api/v1/courses/:id/certificate
 * Get user's certificate for a specific course (authenticated)
 */
export const getMyCertificate = async (req, res) => {
    const { userId } = req.user;
    const { id: courseId } = req.params;

    const certificate = await Certificate.findOne({
        user: userId,
        course: courseId,
    });

    if (!certificate) {
        return res.status(StatusCodes.OK).json({
            success: true,
            certificate: null,
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        certificate: {
            id: certificate._id,
            certificateNumber: certificate.certificateNumber,
            issuedAt: certificate.issuedAt,
            status: certificate.status,
        },
    });
};

/**
 * GET /api/v1/certificates/my-certificates
 * Get all certificates for the authenticated user
 */
export const getMyCertificates = async (req, res) => {
    const { userId } = req.user;

    const certificates = await Certificate.find({
        user: userId,
        status: 'issued',
    })
        .populate('course', 'title category level')
        .sort('-issuedAt');

    res.status(StatusCodes.OK).json({
        success: true,
        count: certificates.length,
        certificates,
    });
};
