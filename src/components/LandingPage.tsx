
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, User, Star, Clock, Sparkles, Zap, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen beauty-gradient-primary">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-white font-bold text-xl">Botglam</span>
        </div>
        <div className="space-x-4">
          <Button asChild variant="ghost" className="text-white hover:bg-white/20">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="bg-white text-primary hover:bg-gray-100">
            <Link to="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your Beauty Business,
            <span className="beauty-text-gradient"> Automated</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
            Botglam helps lash techs, makeup artists, and beauty professionals automate bookings, 
            showcase portfolios, and grow their business with AI-powered tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="beauty-gradient-cta text-primary-foreground hover:opacity-90 px-8 py-4 text-lg border-0">
              <Link to="/signup">Create Your Portfolio</Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              <Link to="/signup">Book a Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
          <div>
            <div className="text-4xl font-bold mb-2">10,000+</div>
            <div className="text-white/80">Beauty Professionals</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">500K+</div>
            <div className="text-white/80">Appointments Booked</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">98%</div>
            <div className="text-white/80">Client Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white/10 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Everything You Need to Grow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300">
              <CardHeader>
                <Calendar className="w-10 h-10 mb-4 text-beauty-gold" />
                <CardTitle className="text-white">Smart Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  24/7 automated booking system that syncs with your calendar and sends reminders.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300">
              <CardHeader>
                <Zap className="w-10 h-10 mb-4 text-beauty-gold" />
                <CardTitle className="text-white">AI Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Automate client follow-ups, appointment reminders, and lead nurturing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300">
              <CardHeader>
                <Heart className="w-10 h-10 mb-4 text-beauty-gold" />
                <CardTitle className="text-white">Portfolio Showcase</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Beautiful portfolio pages that convert visitors into booked clients.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-white mb-16">
          Loved by Beauty Professionals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-beauty-gold fill-current" />
                ))}
              </div>
              <p className="text-white/90 mb-4">
                "Botglam transformed my lash business! I went from manually scheduling to having 
                clients book themselves 24/7. My revenue increased by 40% in just 3 months."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 beauty-gradient-secondary rounded-full mr-3"></div>
                <div>
                  <div className="text-white font-semibold">Sarah Chen</div>
                  <div className="text-white/70">Lash Artist, Miami</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-beauty-gold fill-current" />
                ))}
              </div>
              <p className="text-white/90 mb-4">
                "The AI automation is incredible. It handles all my client communications 
                while I focus on what I love - creating beautiful makeup looks."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 beauty-gradient-cta rounded-full mr-3"></div>
                <div>
                  <div className="text-white font-semibold">Maya Rodriguez</div>
                  <div className="text-white/70">Makeup Artist, LA</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Transform Your Beauty Business?
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Join thousands of beauty professionals who've automated their success with Botglam
        </p>
        <Button asChild size="lg" className="beauty-gradient-cta text-primary-foreground hover:opacity-90 px-8 py-4 text-lg border-0">
          <Link to="/signup">Start Your Free Trial Today</Link>
        </Button>
      </section>
    </div>
  );
};

export { LandingPage };
