import { StatusCodes } from 'http-status-codes';
import { Report, User, Course, Post } from '../models/index.js';
import {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} from '../errors/index.js';

/**
 * @desc    Create a new report
 * @route   POST /api/v1/reports
 * @access  Private (Any authenticated user)
 */
export const createReport = async (req, res) => {
    const { reportType, reportedEntity, reportedUser, category, description } =
        req.body;

    // Verify the reported entity exists
    let entityExists = false;
    let entityModel;

    switch (reportType) {
        case 'course':
            entityModel = Course;
            break;
        case 'post':
            entityModel = Post;
            break;
        case 'user':
            entityModel = User;
            break;
        case 'liveSession':
            entityModel = Course; // Live sessions are part of courses
            break;
        default:
            throw new BadRequestError('Invalid report type');
    }

    const entity = await entityModel.findById(reportedEntity);
    if (!entity) {
        throw new NotFoundError(
            `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} not found`
        );
    }

    // For user reports, verify the reported user exists
    if (reportType === 'user' && reportedUser) {
        const userExists = await User.findById(reportedUser);
        if (!userExists) {
            throw new NotFoundError('Reported user not found');
        }
    }

    // Prevent users from reporting themselves
    if (
        reportType === 'user' &&
        reportedEntity.toString() === req.user.userId
    ) {
        throw new BadRequestError('You cannot report yourself');
    }

    // Check for duplicate reports (same reporter, entity, and pending status)
    const existingReport = await Report.findOne({
        reporter: req.user.userId,
        reportedEntity,
        status: 'pending',
    });

    if (existingReport) {
        throw new BadRequestError(
            'You have already submitted a pending report for this item'
        );
    }

    // Create the report
    const report = await Report.create({
        reporter: req.user.userId,
        reportType,
        reportedEntity,
        reportedUser: reportType === 'user' ? reportedEntity : reportedUser,
        category,
        description,
    });

    const populatedReport = await Report.findById(report._id).populate(
        'reporter',
        'name email'
    );

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Report submitted successfully',
        report: populatedReport,
    });
};

/**
 * @desc    Get user's own reports
 * @route   GET /api/v1/reports/my-reports
 * @access  Private (Any authenticated user)
 */
export const getMyReports = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reports = await Report.find({ reporter: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reporter', 'name email')
        .populate('reviewedBy', 'name email');

    const total = await Report.countDocuments({ reporter: req.user.userId });

    res.status(StatusCodes.OK).json({
        success: true,
        reports,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
        },
    });
};

/**
 * @desc    Get all reports (Admin only)
 * @route   GET /api/v1/reports/admin/all
 * @access  Private/Admin
 */
export const getAllReports = async (req, res) => {
    const { status, reportType, category, page = 1, limit = 20 } = req.query;

    const queryObject = {};

    if (status) queryObject.status = status;
    if (reportType) queryObject.reportType = reportType;
    if (category) queryObject.category = category;

    const skip = (page - 1) * limit;

    const reports = await Report.find(queryObject)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reporter', 'name email avatar')
        .populate('reportedUser', 'name email avatar')
        .populate('reviewedBy', 'name email');

    // Populate the reported entity based on type
    for (let report of reports) {
        if (report.reportType === 'course') {
            await report.populate({
                path: 'reportedEntity',
                model: 'Course',
                select: 'title description instructor',
            });
        } else if (report.reportType === 'post') {
            await report.populate({
                path: 'reportedEntity',
                model: 'Post',
                select: 'text user createdAt',
                populate: { path: 'user', select: 'name email' },
            });
        } else if (report.reportType === 'user') {
            await report.populate({
                path: 'reportedEntity',
                model: 'User',
                select: 'name email avatar role',
            });
        }
    }

    const total = await Report.countDocuments(queryObject);

    // Get status counts for dashboard
    const statusCounts = await Report.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = {
        pending: 0,
        reviewed: 0,
        dismissed: 0,
        'action-taken': 0,
    };

    statusCounts.forEach(item => {
        stats[item._id] = item.count;
    });

    res.status(StatusCodes.OK).json({
        success: true,
        reports,
        stats,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
        },
    });
};

/**
 * @desc    Get single report details (Admin)
 * @route   GET /api/v1/reports/admin/:id
 * @access  Private/Admin
 */
export const getReportById = async (req, res) => {
    const report = await Report.findById(req.params.id)
        .populate('reporter', 'name email avatar')
        .populate('reportedUser', 'name email avatar role')
        .populate('reviewedBy', 'name email');

    if (!report) {
        throw new NotFoundError('Report not found');
    }

    // Populate the reported entity
    if (report.reportType === 'course') {
        await report.populate({
            path: 'reportedEntity',
            model: 'Course',
            select: 'title description instructor category price thumbnail',
            populate: { path: 'instructor', select: 'name email' },
        });
    } else if (report.reportType === 'post') {
        await report.populate({
            path: 'reportedEntity',
            model: 'Post',
            select: 'text user createdAt likes comments',
            populate: { path: 'user', select: 'name email avatar' },
        });
    } else if (report.reportType === 'user') {
        await report.populate({
            path: 'reportedEntity',
            model: 'User',
            select: 'name email avatar role bio createdAt',
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        report,
    });
};

/**
 * @desc    Update report status (Admin - Dismiss report)
 * @route   PATCH /api/v1/reports/admin/:id/dismiss
 * @access  Private/Admin
 */
export const dismissReport = async (req, res) => {
    const { adminNotes } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
        throw new NotFoundError('Report not found');
    }

    if (report.status !== 'pending') {
        throw new BadRequestError('Only pending reports can be dismissed');
    }

    report.status = 'dismissed';
    report.adminAction = 'dismissed';
    report.reviewedBy = req.user.userId;
    report.reviewedAt = new Date();
    if (adminNotes) report.adminNotes = adminNotes;

    await report.save();

    // Check if this reporter has too many dismissed reports (potential spam)
    await checkSpamReporter(report.reporter);

    const updatedReport = await Report.findById(report._id)
        .populate('reporter', 'name email')
        .populate('reviewedBy', 'name email');

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Report dismissed successfully',
        report: updatedReport,
    });
};

/**
 * @desc    Delete content and optionally ban user (Admin)
 * @route   PATCH /api/v1/reports/admin/:id/action
 * @access  Private/Admin
 */
export const takeActionOnReport = async (req, res) => {
    const { action, adminNotes } = req.body; // action: 'delete-content' | 'ban-user' | 'delete-and-ban'

    if (
        !action ||
        !['delete-content', 'ban-user', 'delete-and-ban'].includes(action)
    ) {
        throw new BadRequestError('Invalid action type');
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
        throw new NotFoundError('Report not found');
    }

    if (report.status !== 'pending') {
        throw new BadRequestError('Only pending reports can be actioned');
    }

    let actionTaken = '';

    // Delete content
    if (action === 'delete-content' || action === 'delete-and-ban') {
        if (report.reportType === 'course') {
            await Course.findByIdAndDelete(report.reportedEntity);
            actionTaken += 'Course deleted. ';
        } else if (report.reportType === 'post') {
            await Post.findByIdAndDelete(report.reportedEntity);
            actionTaken += 'Post deleted. ';
        }
        report.adminAction = 'content-deleted';
    }

    // Ban user
    if (action === 'ban-user' || action === 'delete-and-ban') {
        if (report.reportedUser) {
            const userToBan = await User.findById(report.reportedUser);
            if (userToBan) {
                userToBan.isActive = false;
                userToBan.isBanned = true;
                await userToBan.save();
                actionTaken += 'User banned. ';
                report.adminAction = 'user-banned';
            }
        } else if (report.reportType === 'user') {
            const userToBan = await User.findById(report.reportedEntity);
            if (userToBan) {
                userToBan.isActive = false;
                userToBan.isBanned = true;
                await userToBan.save();
                actionTaken += 'User banned. ';
                report.adminAction = 'user-banned';
            }
        }
    }

    report.status = 'action-taken';
    report.reviewedBy = req.user.userId;
    report.reviewedAt = new Date();
    if (adminNotes) report.adminNotes = adminNotes;

    await report.save();

    const updatedReport = await Report.findById(report._id)
        .populate('reporter', 'name email')
        .populate('reviewedBy', 'name email');

    res.status(StatusCodes.OK).json({
        success: true,
        message: `Action taken successfully. ${actionTaken}`,
        report: updatedReport,
    });
};

/**
 * @desc    Mark reporter as spam (Admin)
 * @route   PATCH /api/v1/reports/admin/mark-spam/:reporterId
 * @access  Private/Admin
 */
export const markReporterAsSpam = async (req, res) => {
    const { reporterId } = req.params;

    const reports = await Report.updateMany(
        { reporter: reporterId, isSpamReport: false },
        { isSpamReport: true }
    );

    res.status(StatusCodes.OK).json({
        success: true,
        message: `Marked ${reports.modifiedCount} reports as spam`,
    });
};

/**
 * Helper: Check if reporter is spamming (too many dismissed reports)
 */
const checkSpamReporter = async reporterId => {
    const totalReports = await Report.countDocuments({ reporter: reporterId });
    const dismissedReports = await Report.countDocuments({
        reporter: reporterId,
        status: 'dismissed',
    });

    // If more than 70% of reports are dismissed and user has made 5+ reports
    if (totalReports >= 5 && dismissedReports / totalReports > 0.7) {
        await Report.updateMany(
            { reporter: reporterId },
            { isSpamReport: true }
        );
    }
};

/**
 * @desc    Get report statistics (Admin Dashboard)
 * @route   GET /api/v1/reports/admin/stats
 * @access  Private/Admin
 */
export const getReportStats = async (req, res) => {
    // Status breakdown
    const statusStats = await Report.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Category breakdown
    const categoryStats = await Report.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Type breakdown
    const typeStats = await Report.aggregate([
        { $group: { _id: '$reportType', count: { $sum: 1 } } },
    ]);

    // Recent reports (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCount = await Report.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });

    res.status(StatusCodes.OK).json({
        success: true,
        stats: {
            byStatus: statusStats,
            byCategory: categoryStats,
            byType: typeStats,
            recentReports: recentCount,
        },
    });
};
