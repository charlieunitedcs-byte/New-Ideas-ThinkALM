
import React, { useState } from 'react';
import { Bot, ArrowRight, Shield, Zap, BarChart2, Globe, Check, Play, Star, Award, Lock, Users2, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Calculate pricing based on billing period
  const getPricing = () => {
    if (billingPeriod === 'monthly') {
      return {
        perUser: { price: 49, period: '/user/mo' },
        team: { price: 299, period: '/month' },
        company: { price: 999, period: '/month' }
      };
    } else {
      // Annual pricing with 20% discount
      return {
        perUser: { price: 39, period: '/user/mo', savings: 'Save $120/year' },
        team: { price: 239, period: '/month', savings: 'Save $720/year' },
        company: { price: 799, period: '/month', savings: 'Save $2,400/year' }
      };
    }
  };

  const pricing = getPricing();

  return (
    <div className="min-h-screen bg-[#05060e] text-white overflow-x-hidden font-sans selection:bg-brand-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/5 px-6 py-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Think ABC Logo"
              className="h-40 w-auto object-contain"
            />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={onLoginClick}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all font-medium text-sm"
            >
                Login
            </button>
            <button
                onClick={onSignupClick}
                className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-all font-medium text-sm shadow-lg shadow-brand-500/20"
            >
                Sign Up Free
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-brand-600/10 rounded-full blur-[120px]"></div>
             <div className="absolute bottom-0 right-[10%] w-[40%] h-[40%] bg-accent-600/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-brand-500/30 mb-8 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                <span className="text-xs font-bold text-brand-300 tracking-wide uppercase">System v2.4 Live</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
                The AI-Powered Sales OS for <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-red-500 to-orange-500">High-Velocity Teams</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed">
                Train your team with military precision. Analyze every call, roleplay with voice-enabled agents, and dominate your market with ground-breaking intelligence.
            </p>

            {/* Social Proof Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-10 text-sm">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-900"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-slate-900"></div>
                    </div>
                    <span className="text-slate-300"><strong className="text-white">2,400+</strong> sales teams</span>
                </div>
                <div className="flex items-center gap-2">
                    <Star className="text-amber-400 fill-amber-400" size={18} />
                    <span className="text-slate-300"><strong className="text-white">4.9/5</strong> rating</span>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-emerald-400" size={18} />
                    <span className="text-slate-300"><strong className="text-white">23% avg.</strong> close rate increase</span>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={onSignupClick}
                    className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 group"
                >
                    Start Free Trial - Get 23% More Deals <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                    onClick={onLoginClick}
                    className="px-8 py-4 bg-slate-900/50 hover:bg-slate-800 text-white border border-slate-700 rounded-xl font-bold text-lg transition-all"
                >
                    See Live Demo
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-4">14-day free trial • No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-16 px-6 bg-slate-950/30">
        <div className="max-w-6xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl group cursor-pointer hover:border-brand-500/30 transition-all">
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                    <div className="relative z-10 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-600/20 border-2 border-brand-500 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:bg-brand-600/30 transition-all">
                            <Play className="text-brand-400 ml-1" size={32} fill="currentColor" />
                        </div>
                        <p className="text-slate-300 font-semibold">Watch 2-min Product Demo</p>
                        <p className="text-slate-500 text-sm mt-1">See how teams use Think ALM to close more deals</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Trust Badges & Customer Logos */}
      <section className="py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-slate-500 text-sm mb-8 uppercase tracking-wider font-semibold">Trusted by high-performing sales teams</p>

            {/* Customer Logos Placeholder */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center mb-12">
                {['TechCorp', 'SalesForce Pro', 'Growth Inc', 'RevOps Co'].map((company, i) => (
                    <div key={i} className="flex items-center justify-center p-6 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700 transition-colors">
                        <span className="text-slate-600 font-bold text-lg">{company}</span>
                    </div>
                ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/30 border border-slate-800/50">
                    <Shield className="text-emerald-400" size={18} />
                    <span className="text-slate-300">SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/30 border border-slate-800/50">
                    <Lock className="text-blue-400" size={18} />
                    <span className="text-slate-300">GDPR Ready</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/30 border border-slate-800/50">
                    <Award className="text-amber-400" size={18} />
                    <span className="text-slate-300">G2 Leader 2024</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/30 border border-slate-800/50">
                    <Users2 className="text-purple-400" size={18} />
                    <span className="text-slate-300">99.9% Uptime</span>
                </div>
            </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-slate-950/50 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-3xl bg-slate-900/20 border border-slate-800 hover:border-brand-500/30 transition-all group">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-900/20 transition-colors">
                        <Zap className="text-brand-400" size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">AI Call Intelligence</h3>
                    <p className="text-slate-400 leading-relaxed">Upload recordings and get instant, ruthless feedback on your objection handling and closing techniques.</p>
                </div>
                <div className="p-8 rounded-3xl bg-slate-900/20 border border-slate-800 hover:border-brand-500/30 transition-all group">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-900/20 transition-colors">
                        <Bot className="text-accent-400" size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">Voice Roleplay Agents</h3>
                    <p className="text-slate-400 leading-relaxed">Spar with hyper-realistic AI prospects that talk back. Practice cold calls without burning leads.</p>
                </div>
                <div className="p-8 rounded-3xl bg-slate-900/20 border border-slate-800 hover:border-brand-500/30 transition-all group">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-900/20 transition-colors">
                        <BarChart2 className="text-emerald-400" size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">Campaign Command</h3>
                    <p className="text-slate-400 leading-relaxed">Track performance across specific campaigns. Compare rep stats and optimize strategy in real-time.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Loved by Sales Leaders</h2>
                <p className="text-slate-400">See why thousands of reps choose Think ALM to level up their game.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Testimonial 1 */}
                <div className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-brand-500/30 transition-all">
                    <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="text-amber-400 fill-amber-400" size={16} />
                        ))}
                    </div>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                        "Think ALM cut our ramp time in half. New reps are hitting quota in 60 days instead of 120. The AI roleplay is a game-changer."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-500"></div>
                        <div>
                            <p className="text-white font-bold text-sm">Sarah Chen</p>
                            <p className="text-slate-500 text-xs">VP of Sales, TechCorp</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 2 */}
                <div className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-brand-500/30 transition-all">
                    <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="text-amber-400 fill-amber-400" size={16} />
                        ))}
                    </div>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                        "We analyzed 500+ calls in the first month. The insights were brutal but necessary. Team close rate jumped 23%."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"></div>
                        <div>
                            <p className="text-white font-bold text-sm">Marcus Johnson</p>
                            <p className="text-slate-500 text-xs">Director of Sales, Growth Inc</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 3 */}
                <div className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-brand-500/30 transition-all">
                    <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="text-amber-400 fill-amber-400" size={16} />
                        ))}
                    </div>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                        "Finally, a tool that doesn't just record calls but actually makes my team better. ROI paid for itself in 6 weeks."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-500"></div>
                        <div>
                            <p className="text-white font-bold text-sm">Emily Rodriguez</p>
                            <p className="text-slate-500 text-xs">Sales Manager, RevOps Co</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Transparent Pricing</h2>
                <p className="text-slate-400 mb-6">Scale your sales operations with plans built for growth.</p>
                <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-full p-1">
                    <button
                        onClick={() => setBillingPeriod('monthly')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            billingPeriod === 'monthly'
                                ? 'bg-brand-600 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingPeriod('annual')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            billingPeriod === 'annual'
                                ? 'bg-brand-600 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Annual <span className="text-emerald-400 text-xs ml-1">(Save 20%)</span>
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Per User */}
                <div className="glass-panel border border-slate-800 p-8 rounded-3xl relative overflow-hidden group hover:border-slate-600 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-2">Per User</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl font-bold text-white">${pricing.perUser.price}</span>
                        <span className="text-slate-500">{pricing.perUser.period}</span>
                    </div>
                    {billingPeriod === 'annual' && (
                        <p className="text-emerald-400 text-xs font-semibold mb-4">{pricing.perUser.savings}</p>
                    )}
                    <p className="text-slate-400 text-sm mb-8">Perfect for individual reps or small teams getting started.</p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-brand-500" /> AI Call Analysis
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-brand-500" /> AI Roleplay Training
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-brand-500" /> Content Library Access
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-brand-500" /> Performance Analytics
                        </li>
                    </ul>

                    <button
                        onClick={onLoginClick}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-700 transition-all"
                    >
                        Start Free Trial
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3">No credit card • 14 days free</p>
                </div>

                {/* Team Plan */}
                <div className="glass-panel border border-brand-500/50 p-8 rounded-3xl relative overflow-hidden transform md:-translate-y-4 shadow-2xl shadow-brand-900/20">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500"></div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                        Best Value
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">Team Plan</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl font-bold text-white">${pricing.team.price}</span>
                        <span className="text-slate-500">{pricing.team.period}</span>
                    </div>
                    {billingPeriod === 'annual' && (
                        <p className="text-emerald-400 text-xs font-semibold mb-4">{pricing.team.savings}</p>
                    )}
                    <p className="text-slate-400 text-sm mb-8">For growing teams up to 10 users. Best value per user.</p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-white">
                            <Check size={16} className="text-accent-500" /> <strong>Up to 10 Users</strong>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white">
                            <Check size={16} className="text-accent-500" /> <strong>Everything in Per User</strong>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-accent-500" /> Team Performance Dashboard
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-accent-500" /> Collaborative Features
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-accent-500" /> Priority Support
                        </li>
                    </ul>

                    <button
                        onClick={onLoginClick}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 transition-all"
                    >
                        Start Free Trial
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-3">No credit card • 14 days free</p>
                </div>

                {/* Company Unlimited */}
                <div className="glass-panel border border-slate-800 p-8 rounded-3xl relative overflow-hidden group hover:border-slate-600 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-2">Company Unlimited</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl font-bold text-white">${pricing.company.price}</span>
                        <span className="text-slate-500">{pricing.company.period}</span>
                    </div>
                    {billingPeriod === 'annual' && (
                        <p className="text-emerald-400 text-xs font-semibold mb-4">{pricing.company.savings}</p>
                    )}
                    <p className="text-slate-400 text-sm mb-8">Enterprise solution for unlimited users and custom needs.</p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-white">
                            <Check size={16} className="text-emerald-500" /> <strong>Unlimited Users</strong>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white">
                            <Check size={16} className="text-emerald-500" /> <strong>Everything in Team</strong>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-emerald-500" /> Custom Integrations
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-emerald-500" /> Dedicated Account Manager
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-emerald-500" /> SLA & Premium Support
                        </li>
                    </ul>

                    <button
                        onClick={onLoginClick}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-700 transition-all"
                    >
                        Start Free Trial
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3">No credit card • 14 days free</p>
                </div>
            </div>
            
            <p className="text-center text-slate-500 text-sm mt-12">
                Questions? Visit <a href="#" className="text-brand-400 hover:underline">thinkalmsales.abacusai.app/pricing</a> for enterprise options.
            </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-900 bg-[#020308]">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div className="col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center">
                            <Bot size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-white text-lg">Think ALM</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        AI-powered sales training and intelligence platform for high-velocity teams.
                    </p>
                </div>

                {/* Product */}
                <div>
                    <h4 className="text-white font-bold text-sm mb-4">Product</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#features" className="text-slate-500 hover:text-white transition-colors">Features</a></li>
                        <li><a href="#pricing" className="text-slate-500 hover:text-white transition-colors">Pricing</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Integrations</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-white transition-colors">API</a></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4 className="text-white font-bold text-sm mb-4">Resources</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Documentation</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Help Center</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Blog</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Community</a></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h4 className="text-white font-bold text-sm mb-4">Company</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="text-slate-500 hover:text-white transition-colors">About</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Careers</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Security</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                <p>© 2024 Think ALM Inc. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
