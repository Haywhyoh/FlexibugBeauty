
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Palette, Eye } from "lucide-react";

const BrandingSettings = () => {
  const [brandColors, setBrandColors] = useState({
    primary: "#ec4899",
    secondary: "#9333ea",
    accent: "#f59e0b"
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

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

  const handleColorChange = (colorType: string, value: string) => {
    setBrandColors(prev => ({
      ...prev,
      [colorType]: value
    }));
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
                  Choose colors that represent your brand. These will be used across your booking pages and profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
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
                    <Label htmlFor="secondary-color">Secondary Color</Label>
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
                    <Label htmlFor="accent-color">Accent Color</Label>
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

                {/* Color Preview */}
                <div className="mt-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Color Preview</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div 
                      className="w-16 h-16 rounded-lg shadow-sm border-2 border-white"
                      style={{ backgroundColor: brandColors.primary }}
                      title="Primary Color"
                    />
                    <div 
                      className="w-16 h-16 rounded-lg shadow-sm border-2 border-white"
                      style={{ backgroundColor: brandColors.secondary }}
                      title="Secondary Color"
                    />
                    <div 
                      className="w-16 h-16 rounded-lg shadow-sm border-2 border-white"
                      style={{ backgroundColor: brandColors.accent }}
                      title="Accent Color"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                Save Branding Settings
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
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
