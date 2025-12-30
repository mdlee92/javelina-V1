import { useNavigate } from 'react-router-dom';
import { Zap, Brain, Calendar, ArrowRight, Activity } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Lightning-Fast Note Entry',
      description: 'Quick patient switching, timestamped notes, and intuitive workflows designed for the fast-paced ED environment.',
      color: 'orange',
    },
    {
      icon: Brain,
      title: 'AI-Powered MDM Generation',
      description: 'Automatically generate Medical Decision Making statements from your clinical notes. Reduce documentation time by up to 70%.',
      color: 'blue',
    },
    {
      icon: Calendar,
      title: 'Shift-Based Organization',
      description: 'Organize patients by shift. Track active cases, archive completed ones, and maintain perfect documentation continuity.',
      color: 'navy',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-primary-blue-500 opacity-95" />

        {/* Decorative glowing elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-blue-600/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Activity size={48} className="text-white" />
            <h1 className="text-4xl font-bold text-white">Javelina</h1>
          </div>

          {/* Main headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            AI-Powered Documentation
            <br />
            for Emergency Physicians
          </h2>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Streamline your shift with intelligent note-taking.
            Generate comprehensive MDM statements instantly.
            Spend less time charting, more time caring.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-orange-600 text-lg font-semibold rounded-xl hover:bg-neutral-50 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Launch App
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Built for the ED, Powered by AI
            </h3>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Everything you need to document patient care efficiently and accurately
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all border border-neutral-200"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center mb-6">
                  <feature.icon size={28} className="text-orange-600" />
                </div>

                {/* Title */}
                <h4 className="text-xl font-bold text-neutral-900 mb-3">
                  {feature.title}
                </h4>

                {/* Description */}
                <p className="text-body text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-neutral-900 mb-4">
            Ready to transform your documentation workflow?
          </h3>
          <p className="text-lg text-neutral-600 mb-8">
            No signup required. Start documenting smarter today.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-orange-500 text-white text-lg font-semibold rounded-xl hover:bg-orange-600 hover:shadow-lg transition-all duration-200"
          >
            Get Started
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-neutral-100 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-neutral-600 mb-2">
            <Activity size={20} className="text-orange-500" />
            <span className="text-label font-semibold">Javelina - ER Notes</span>
          </div>
          <p className="text-caption text-neutral-500">
            Intelligent documentation for emergency medicine
          </p>
        </div>
      </footer>
    </div>
  );
}
