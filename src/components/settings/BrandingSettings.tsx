
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Palette, Eye, Save, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BrandColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  background: string;
  border: string;
}

const defaultColors: BrandColors = {
  primary: "#ec4899",
  primaryDark: "#be185d",
  primaryLight: "#f3e8ff",
  secondary: "#9333ea",
  accent: "#f59e0b",
  textPrimary: "#1f2937",
  background: "#ffffff",
  border: "#e5e7eb"
};

const colorSchemes = {
  "elegant-purple": {
    name: "Elegant Purple",
    colors: {
      primary: "#ec4899",
      primaryDark: "#be185d",
      primaryLight: "#f3e8ff",
      secondary: "#9333ea",
      accent: "#f59e0b",
      textPrimary: "#1f2937",
      background: "#ffffff",
      border: "#e5e7eb"
    }
  },
  "professional-blue": {
    name: "Professional Blue",
    colors: {
      primary: "#3b82f6",
      primaryDark: "#1d4ed8",
      primaryLight: "#dbeafe",
      secondary: "#1e40af",
      accent: "#06b6d4",
      textPrimary: "#1e293b",
      background: "#ffffff",
      border: "#e2e8f0"
    }
  },
  "warm-orange": {
    name: "Warm Orange",
    colors: {
      primary: "#f97316",
      primaryDark: "#ea580c",
      primaryLight: "#fed7aa",
      secondary: "#dc2626",
      accent: "#eab308",
      textPrimary: "#1f2937",
      background: "#ffffff",
      border: "#f3f4f6"
    }
  },
  "modern-green": {
    name: "Modern Green",
    colors: {
      primary: "#10b981",
      primaryDark: "#059669",
      primaryLight: "#d1fae5",
      secondary: "#047857",
      accent: "#8b5cf6",
      textPrimary: "#1f2937",
      background: "#ffffff",
      border: "#e5e7eb"
    }
  }
};

const BrandingSettings = () => {
  const [brandColors, setBrandColors] = useState<BrandColors>(defaultColors);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load brand colors from database
  useEffect(() => {
    const loadBrandColors = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('brand_colors')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading brand colors:', error);
        } else if (data?.brand_colors) {
          setBrandColors(data.brand_colors as BrandColors);
        }
      } catch (error) {
        console.error('Error loading brand colors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBrandColors();
  }, [user?.id]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (colorType: keyof BrandColors, value: string) => {
    setBrandColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const handleSchemeChange = (schemeKey: string) => {
    const scheme = colorSchemes[schemeKey as keyof typeof colorSchemes];
    if (scheme) {
      setBrandColors(scheme.colors);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ brand_colors: brandColors })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Brand colors saved successfully!",
      });
    } catch (error) {
      console.error('Error saving brand colors:', error);
      toast({
        title: "Error",
        description: "Failed to save brand colors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setBrandColors(defaultColors);
  };

  return (
    <div className="h-full">
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Branding Settings
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Customize your brand identity and visual appearance
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Logo Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-primary-600" />
                  <span>Business Logo</span>
                </CardTitle>
                <CardDescription>
                  Upload your business logo. This will appear on your public profile and booking pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="logo-upload" className="text-sm font-medium">
                      Upload Logo
                    </Label>
                    <div className="mt-2 flex items-center justify-center w-full">
                      <label 
                        htmlFor="logo-upload" 
                        className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                        <input 
                          id="logo-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </label>
                    </div>
                  </div>
                  
                  {logoPreview && (
                    <div>
                      <Label className="text-sm font-medium">Preview</Label>
                      <div className="mt-2 p-4 border-2 border-gray-200 rounded-lg bg-white">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="max-w-full max-h-32 mx-auto object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Brand Colors Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-primary-600" />
                  <span>Brand Colors</span>
                </CardTitle>
                <CardDescription>
                  Choose colors that represent your brand. These will be used across your public profile and booking pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Color Scheme Presets */}
                <div className="space-y-3">
                  <Label>Quick Color Schemes</Label>
                  <Select onValueChange={handleSchemeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a preset color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(colorSchemes).map(([key, scheme]) => (
                        <SelectItem key={key} value={key}>
                          {scheme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Primary Colors */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">Primary Colors</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="primary-color"
                          type="color"
                          value={brandColors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={brandColors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          placeholder="#ec4899"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primary-dark">Primary Dark</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="primary-dark"
                          type="color"
                          value={brandColors.primaryDark}
                          onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={brandColors.primaryDark}
                          onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                          placeholder="#be185d"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primary-light">Primary Light</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="primary-light"
                          type="color"
                          value={brandColors.primaryLight}
                          onChange={(e) => handleColorChange('primaryLight', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={brandColors.primaryLight}
                          onChange={(e) => handleColorChange('primaryLight', e.target.value)}
                          placeholder="#f3e8ff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary & Accent Colors */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">Secondary & Accent</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="secondary-color"
                          type="color"
                          value={brandColors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={brandColors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          placeholder="#9333ea"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent-color">Accent</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="accent-color"
                          type="color"
                          value={brandColors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={brandColors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          placeholder="#f59e0b"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text & Background Colors */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">Text & Background</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="text-primary">Text Primary</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="text-primary"
                          type="color"
                          value={brandColors.textPrimary}
                          onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={brandColors.textPrimary}
                          onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                          placeholder="#1f2937"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="background">Background</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="background"
                          type="color"
                          value={brandColors.background}
                          onChange={(e) => handleColorChange('background', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={brandColors.background}
                          onChange={(e) => handleColorChange('background', e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="border">Border</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="border"
                          type="color"
                          value={brandColors.border}
                          onChange={(e) => handleColorChange('border', e.target.value)}
                          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={brandColors.border}
                          onChange={(e) => handleColorChange('border', e.target.value)}
                          placeholder="#e5e7eb"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Color Preview</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white mx-auto mb-1"
                        style={{ backgroundColor: brandColors.primary }}
                        title="Primary"
                      />
                      <p className="text-xs text-gray-600">Primary</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white mx-auto mb-1"
                        style={{ backgroundColor: brandColors.primaryDark }}
                        title="Primary Dark"
                      />
                      <p className="text-xs text-gray-600">Primary Dark</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white mx-auto mb-1"
                        style={{ backgroundColor: brandColors.primaryLight }}
                        title="Primary Light"
                      />
                      <p className="text-xs text-gray-600">Primary Light</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white mx-auto mb-1"
                        style={{ backgroundColor: brandColors.secondary }}
                        title="Secondary"
                      />
                      <p className="text-xs text-gray-600">Secondary</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white mx-auto mb-1"
                        style={{ backgroundColor: brandColors.accent }}
                        title="Accent"
                      />
                      <p className="text-xs text-gray-600">Accent</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white mx-auto mb-1"
                        style={{ backgroundColor: brandColors.textPrimary }}
                        title="Text Primary"
                      />
                      <p className="text-xs text-gray-600">Text</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white mx-auto mb-1"
                        style={{ backgroundColor: brandColors.background }}
                        title="Background"
                      />
                      <p className="text-xs text-gray-600">Background</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white mx-auto mb-1"
                        style={{ backgroundColor: brandColors.border }}
                        title="Border"
                      />
                      <p className="text-xs text-gray-600">Border</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                onClick={handleSave}
                disabled={saving || loading}
                className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Branding Settings"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={saving || loading}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingSettings;
