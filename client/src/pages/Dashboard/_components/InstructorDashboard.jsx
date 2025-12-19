import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Link } from 'react-router-dom';

export const InstructorDashboard = () => {
    // Mock data - replace with actual API calls
    const courses = [
        // { id: 1, title: 'React Masterclass', students: 150, revenue: 4500, rating: 4.8 },
    ];

    const recentSales = [
        // { id: 1, course: 'React Masterclass', student: 'John Doe', amount: 49.99, date: '2 hours ago' },
    ];

    const recentActivity = [
        // { id: 1, action: 'New enrollment', course: 'React Masterclass', time: '1 hour ago' },
    ];

    const totalRevenue = courses.reduce(
        (sum, course) => sum + (course.revenue || 0),
        0
    );
    const totalStudents = courses.reduce(
        (sum, course) => sum + (course.students || 0),
        0
    );

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card className="p-6">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-[#FF6A00]">
                            {courses.length}
                        </p>
                        <p className="mt-2 text-sm text-[#4A4A4A]">
                            Total Courses
                        </p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-[#1EB5A6]">
                            {totalStudents}
                        </p>
                        <p className="mt-2 text-sm text-[#4A4A4A]">
                            Total Students
                        </p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-[#043F7B]">
                            ${totalRevenue.toFixed(2)}
                        </p>
                        <p className="mt-2 text-sm text-[#4A4A4A]">
                            Total Revenue
                        </p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-[#FF6A00]">0</p>
                        <p className="mt-2 text-sm text-[#4A4A4A]">
                            Pending Reviews
                        </p>
                    </div>
                </Card>
            </div>

            {/* My Courses */}
            <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">
                        My Courses
                    </h3>
                    <Button size="sm">Create New Course</Button>
                </div>

                {courses.length === 0 ? (
                    <div className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <span className="text-3xl">🎓</span>
                        </div>
                        <p className="mb-2 text-[#4A4A4A]">
                            You haven't created any courses yet.
                        </p>
                        <p className="mb-4 text-sm text-[#4A4A4A]">
                            Start sharing your knowledge with students
                            worldwide.
                        </p>
                        <Button>Create Your First Course</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {courses.map(course => (
                            <div
                                key={course.id}
                                className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#FF6A00]"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[#1A1A1A]">
                                            {course.title}
                                        </h4>
                                        <div className="mt-2 flex items-center gap-4 text-sm text-[#4A4A4A]">
                                            <span>
                                                👥 {course.students} students
                                            </span>
                                            <span>⭐ {course.rating}</span>
                                            <span>💰 ${course.revenue}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            View
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Recent Sales */}
            <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-[#1A1A1A]">
                    Recent Sales
                </h3>

                {recentSales.length === 0 ? (
                    <div className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <span className="text-3xl">💳</span>
                        </div>
                        <p className="text-[#4A4A4A]">No sales yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-200">
                                <tr className="text-left">
                                    <th className="pb-3 font-semibold text-[#1A1A1A]">
                                        Course
                                    </th>
                                    <th className="pb-3 font-semibold text-[#1A1A1A]">
                                        Student
                                    </th>
                                    <th className="pb-3 font-semibold text-[#1A1A1A]">
                                        Amount
                                    </th>
                                    <th className="pb-3 font-semibold text-[#1A1A1A]">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.map(sale => (
                                    <tr
                                        key={sale.id}
                                        className="border-b border-gray-100 last:border-0"
                                    >
                                        <td className="py-3 text-[#1A1A1A]">
                                            {sale.course}
                                        </td>
                                        <td className="py-3 text-[#4A4A4A]">
                                            {sale.student}
                                        </td>
                                        <td className="py-3 font-semibold text-[#1EB5A6]">
                                            ${sale.amount}
                                        </td>
                                        <td className="py-3 text-[#4A4A4A]">
                                            {sale.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-[#1A1A1A]">
                    Recent Activity
                </h3>

                {recentActivity.length === 0 ? (
                    <div className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <span className="text-3xl">📊</span>
                        </div>
                        <p className="text-[#4A4A4A]">
                            No recent activity to display.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentActivity.map(activity => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                            >
                                <div>
                                    <p className="text-sm font-medium text-[#1A1A1A]">
                                        {activity.action}
                                    </p>
                                    <p className="text-xs text-[#4A4A4A]">
                                        {activity.course}
                                    </p>
                                </div>
                                <span className="text-xs text-[#4A4A4A]">
                                    {activity.time}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
