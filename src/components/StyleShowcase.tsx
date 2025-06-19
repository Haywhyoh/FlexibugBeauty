import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const StyleShowcase = () => {
  return (
    <div className="container mx-auto p-4 space-y-8 md:p-8 md:space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-3 md:space-y-4">
        <h1 className="text-display gradient-text">FlexiBug</h1>
        <p className="text-body-large max-w-2xl mx-auto px-4">
          Your AI-powered beauty industry appointment booking platform with elegant design and intuitive user experience.
        </p>
      </div>

      {/* Color Palette */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-heading">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="space-y-2">
            <div className="h-16 md:h-20 bg-primary-500 rounded-lg"></div>
            <p className="text-body-small font-medium">Rose Gold Primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 md:h-20 bg-secondary-600 rounded-lg"></div>
            <p className="text-body-small font-medium">Deep Plum Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 md:h-20 bg-neutral-100 rounded-lg border"></div>
            <p className="text-body-small font-medium">Warm Neutral Light</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 md:h-20 bg-neutral-600 rounded-lg"></div>
            <p className="text-body-small font-medium">Warm Neutral Dark</p>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-6">
        <h2 className="text-heading">Typography</h2>
        <div className="space-y-4">
          <h1 className="text-display">Display Heading (Playfair Display)</h1>
          <h2 className="text-heading">Section Heading (Playfair Display)</h2>
          <h3 className="text-subheading">Subheading (Inter)</h3>
          <p className="text-body-large">Large body text for important content (Inter)</p>
          <p className="text-body">Regular body text for general content (Inter)</p>
          <p className="text-body-small">Small text for captions and details (Inter)</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-heading">Buttons</h2>
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-4">
          <Button className="btn-primary">Primary Button</Button>
          <Button variant="secondary" className="btn-secondary">Secondary Button</Button>
          <Button variant="outline" className="w-full md:w-auto">Outline Button</Button>
          <Button variant="ghost" className="w-full md:w-auto">Ghost Button</Button>
          <Button size="sm" className="w-full md:w-auto">Small Button</Button>
          <Button size="lg" className="w-full md:w-auto">Large Button</Button>
        </div>
      </div>

      {/* Form Elements */}
      <div className="space-y-6">
        <h2 className="text-heading">Form Elements</h2>
        <div className="max-w-md space-y-4">
          <Input 
            placeholder="Enter your email" 
            className="input-field"
          />
          <Input 
            placeholder="Enter your name" 
            className="input-field"
          />
          <textarea 
            placeholder="Tell us about your beauty services..."
            className="input-field min-h-24 resize-none"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-heading">Service Cards</h2>
        
        {/* Service Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="service-card">
            <h3 className="text-subheading mb-2">Classic Lash Set</h3>
            <p className="text-body mb-3 md:mb-4">Beautiful, natural-looking lash extensions that enhance your eyes.</p>
            <div className="flex justify-between items-center">
              <span className="service-price">$120</span>
              <span className="service-duration">2 hours</span>
            </div>
          </div>

          <div className="service-card">
            <h3 className="text-subheading mb-2">Volume Lashes</h3>
            <p className="text-body mb-3 md:mb-4">Dramatic, full lashes with multiple extensions per natural lash.</p>
            <div className="flex justify-between items-center">
              <span className="service-price">$180</span>
              <span className="service-duration">3 hours</span>
            </div>
          </div>

          <div className="service-card">
            <h3 className="text-subheading mb-2">Lash Fill</h3>
            <p className="text-body mb-3 md:mb-4">Maintain your beautiful lashes with a professional fill service.</p>
            <div className="flex justify-between items-center">
              <span className="service-price">$80</span>
              <span className="service-duration">1.5 hours</span>
            </div>
          </div>
        </div>

        {/* Portfolio Items */}
        <div className="portfolio-grid">
          <div className="portfolio-item">
            <div className="aspect-square bg-gradient-beauty rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold">Portfolio Image 1</span>
            </div>
          </div>
          <div className="portfolio-item">
            <div className="aspect-square bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold">Portfolio Image 2</span>
            </div>
          </div>
          <div className="portfolio-item">
            <div className="aspect-square bg-gradient-secondary rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold">Portfolio Image 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Preview */}
      <div className="space-y-6">
        <h2 className="text-heading">Calendar Component</h2>
        <div className="calendar max-w-md">
          <div className="calendar-header">
            <h3 className="text-xl font-semibold">December 2024</h3>
          </div>
          <div className="grid grid-cols-7 gap-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-body-small font-medium bg-neutral-50">
                {day}
              </div>
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className={`calendar-day ${i === 3 ? 'today' : ''}`}>
                <span className="text-body-small">{i + 15}</span>
                {i === 3 && (
                  <div className="calendar-appointment">
                    Lash appointment
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Preview */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-heading">Navigation</h2>
        <nav className="flex flex-col space-y-1 bg-neutral-50 p-2 rounded-lg md:flex-row md:space-y-0 md:space-x-1 max-w-md">
          <a href="#" className="nav-item active">Dashboard</a>
          <a href="#" className="nav-item">Calendar</a>
          <a href="#" className="nav-item">Clients</a>
          <a href="#" className="nav-item">Portfolio</a>
        </nav>
      </div>

      {/* Gradients & Effects */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-heading">Gradients & Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="gradient-primary h-24 md:h-32 rounded-lg md:rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-sm md:text-base">Primary Gradient</span>
          </div>
          <div className="gradient-secondary h-24 md:h-32 rounded-lg md:rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-sm md:text-base">Secondary Gradient</span>
          </div>
          <div className="gradient-beauty h-24 md:h-32 rounded-lg md:rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-sm md:text-base">Beauty Gradient</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleShowcase; 