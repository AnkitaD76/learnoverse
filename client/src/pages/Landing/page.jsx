import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

const LandingPage = () => {
    const features = [
        {
            icon: '📚',
            title: 'Create & Sell Courses',
            description:
                'Design beautiful courses with our intuitive editor. Set your own pricing and reach millions of learners worldwide.',
        },
        {
            icon: '🛠️',
            title: 'Offer Services',
            description:
                'Provide tutoring, consulting, or mentorship services. Connect directly with students and professionals.',
        },
        {
            icon: '🤝',
            title: 'Marketplace Trading',
            description:
                'Buy, sell, or trade educational resources, templates, and premium content in our secure marketplace.',
        },
        {
            icon: '💰',
            title: 'Flexible Monetization',
            description:
                'Multiple revenue streams including one-time purchases, subscriptions, and commission-based sales.',
        },
        {
            icon: '📊',
            title: 'Analytics Dashboard',
            description:
                'Track your earnings, student progress, and engagement with powerful analytics tools.',
        },
        {
            icon: '🔒',
            title: 'Secure Payments',
            description:
                'Industry-leading security with instant payouts and multiple payment methods supported.',
        },
    ];

    const stats = [
        { value: '50K+', label: 'Active Learners' },
        { value: '2K+', label: 'Expert Instructors' },
        { value: '10K+', label: 'Courses Available' },
        { value: '95%', label: 'Satisfaction Rate' },
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Web Development Instructor',
            avatar: '👩‍💻',
            text: "Learnoverse transformed my teaching career. I've earned over $100K in my first year and reached students from 50+ countries.",
        },
        {
            name: 'Michael Chen',
            role: 'Data Science Consultant',
            avatar: '👨‍🔬',
            text: 'The platform makes it incredibly easy to offer both courses and consulting services. My students love the integrated experience.',
        },
        {
            name: 'Emily Rodriguez',
            role: 'Graphic Design Expert',
            avatar: '🎨',
            text: 'I sell design templates and courses on Learnoverse. The marketplace feature has opened up entirely new revenue streams for me.',
        },
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#FF6A00] via-[#E55F00] to-[#043F7B] py-20 sm:py-32">
                <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
                        <div className="text-white">
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                                Empower Your
                                <span className="block text-yellow-300">
                                    Teaching Journey
                                </span>
                            </h1>
                            <p className="mt-6 text-xl text-white opacity-90">
                                Join the world's leading edtech marketplace.
                                Create courses, offer services, and trade
                                educational resources with millions of learners
                                worldwide.
                            </p>
                            <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                                <Link to="/register">
                                    <Button
                                        size="lg"
                                        className="w-full bg-white !text-[#FF6A00] hover:bg-gray-100 sm:w-auto"
                                    >
                                        Start Teaching Today
                                    </Button>
                                </Link>
                                <Link to="/courses">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full border-white text-white hover:bg-white hover:text-[#FF6A00] sm:w-auto"
                                    >
                                        Browse Courses
                                    </Button>
                                </Link>
                            </div>
                            <div className="mt-8 flex items-center space-x-6 text-sm">
                                <div className="flex items-center">
                                    <span className="text-yellow-300">
                                        ⭐⭐⭐⭐⭐
                                    </span>
                                    <span className="ml-2">
                                        4.9/5 from 10K+ reviews
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image/Illustration */}
                        <div className="relative">
                            <div className="relative rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500" />
                                        <div className="flex-1">
                                            <div className="h-4 w-32 rounded bg-white/60" />
                                            <div className="mt-2 h-3 w-24 rounded bg-white/40" />
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-white/20 p-4">
                                        <div className="h-40 rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#043F7B]" />
                                        <div className="mt-3 h-3 w-full rounded bg-white/40" />
                                        <div className="mt-2 h-3 w-3/4 rounded bg-white/30" />
                                    </div>
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className="h-16 flex-1 rounded-lg bg-white/30"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-[#FF6A00] opacity-20 blur-3xl" />
                            <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-[#1EB5A6] opacity-20 blur-3xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-y border-gray-200 bg-gray-50 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-[#FF6A00]">
                                    {stat.value}
                                </div>
                                <div className="mt-2 text-sm text-[#4A4A4A]">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
                            Everything You Need to Succeed
                        </h2>
                        <p className="mt-4 text-lg text-[#4A4A4A]">
                            Powerful tools and features designed for educators
                            and learners
                        </p>
                    </div>

                    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="mb-4 text-5xl">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-gradient-to-br from-orange-50 to-blue-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
                            Start Earning in 3 Simple Steps
                        </h2>
                        <p className="mt-4 text-lg text-[#4A4A4A]">
                            Join thousands of successful instructors
                        </p>
                    </div>

                    <div className="mt-16 grid gap-8 md:grid-cols-3">
                        <div className="relative">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6A00] text-2xl font-bold text-white">
                                1
                            </div>
                            <h3 className="mt-6 text-xl font-semibold text-[#1A1A1A]">
                                Sign Up Free
                            </h3>
                            <p className="mt-2 text-[#4A4A4A]">
                                Create your instructor account in minutes. No
                                credit card required.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E55F00] text-2xl font-bold text-white">
                                2
                            </div>
                            <h3 className="mt-6 text-xl font-semibold text-[#1A1A1A]">
                                Create Content
                            </h3>
                            <p className="mt-2 text-[#4A4A4A]">
                                Upload your courses, set up services, or list
                                marketplace items.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#043F7B] text-2xl font-bold text-white">
                                3
                            </div>
                            <h3 className="mt-6 text-xl font-semibold text-[#1A1A1A]">
                                Earn & Grow
                            </h3>
                            <p className="mt-2 text-[#4A4A4A]">
                                Receive instant payouts as students enroll in
                                your offerings.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link to="/register">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-[#FF6A00] to-[#043F7B] hover:from-[#E55F00] hover:to-[#032D5A]"
                            >
                                Become an Instructor
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
                            Success Stories
                        </h2>
                        <p className="mt-4 text-lg text-[#4A4A4A]">
                            See what our instructors are saying
                        </p>
                    </div>

                    <div className="mt-16 grid gap-8 md:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="text-4xl">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#1A1A1A]">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-sm text-[#4A4A4A]">
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-[#4A4A4A] italic">
                                    "{testimonial.text}"
                                </p>
                                <div className="mt-4 flex text-yellow-400">
                                    ⭐⭐⭐⭐⭐
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-[#FF6A00] to-[#043F7B] py-20">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                        Ready to Transform Your Teaching Career?
                    </h2>
                    <p className="mt-4 text-xl text-orange-100">
                        Join Learnoverse today and start earning from your
                        expertise
                    </p>
                    <div className="mt-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                        <Link to="/register">
                            <Button
                                size="lg"
                                className="w-full bg-white !text-[#FF6A00] hover:bg-gray-100 sm:w-auto"
                            >
                                Get Started Free
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full border-white text-white hover:bg-white hover:text-[#FF6A00] sm:w-auto"
                            >
                                Contact Sales
                            </Button>
                        </Link>
                    </div>
                    <p className="mt-4 text-sm text-orange-100">
                        No credit card required • 14-day money-back guarantee
                    </p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
