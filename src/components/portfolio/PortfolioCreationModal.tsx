import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Star, 
  Move, 
  Trash2,
  Plus,
  Camera,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface SelectedImage {
  file: File;
  preview: string;
  id: string;
  isPrimary: boolean;
}

interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

interface PortfolioCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    specialtyId: string;
    images: File[];
    primaryImageIndex: number;
  }) => Promise<void>;
  specialties: Specialty[];
  isSubmitting?: boolean;
}

export const PortfolioCreationModal = ({
  isOpen,
  onClose,
  onSubmit,
  specialties,
  isSubmitting = false
}: PortfolioCreationModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Validation states
  const [errors, setErrors] = useState<{
    title?: string;
    images?: string;
    specialty?: string;
  }>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${index}`,
      isPrimary: selectedImages.length === 0 && index === 0 // First image of first batch is primary
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
    setErrors(prev => ({ ...prev, images: undefined }));
  }, [selectedImages.length]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    noClick: false, // Allow clicking to open file dialog
    noKeyboard: false // Allow keyboard interaction
  });

  const removeImage = (id: string) => {
    setSelectedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // If we removed the primary image, make the first remaining image primary
      if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const setPrimaryImage = (id: string) => {
    setSelectedImages(prev => 
      prev.map(img => ({
        ...img,
        isPrimary: img.id === id
      }))
    );
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      return newImages;
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (selectedImages.length === 0) {
      newErrors.images = "At least one image is required";
    }

    if (!specialtyId) {
      newErrors.specialty = "Please select a specialty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const primaryIndex = selectedImages.findIndex(img => img.isPrimary);
    
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      specialtyId,
      images: selectedImages.map(img => img.file),
      primaryImageIndex: Math.max(0, primaryIndex)
    });

    // Reset form
    setTitle("");
    setDescription("");
    setSpecialtyId("");
    setSelectedImages([]);
    setErrors({});
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onDrop(Array.from(files));
    }
  };

  const openFileExplorer = () => {
    hiddenInputRef.current?.click();
  };

  const handleClose = () => {
    // Clean up object URLs
    selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
    
    // Reset form
    setTitle("");
    setDescription("");
    setSpecialtyId("");
    setSelectedImages([]);
    setErrors({});
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Portfolio Item</h2>
                <p className="text-gray-600 mt-1">Add images and details to showcase your work</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0">
              
              {/* Left Panel - Form */}
              <div className="lg:w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
                <div className="space-y-6">
                  
                  {/* Title */}
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                      Portfolio Title *
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
                      }}
                      placeholder="e.g., Bridal Makeup Collection"
                      className={errors.title ? "border-red-300" : ""}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Specialty */}
                  <div>
                    <Label htmlFor="specialty" className="text-sm font-medium text-gray-700 mb-2 block">
                      Category *
                    </Label>
                    <select
                      id="specialty"
                      value={specialtyId}
                      onChange={(e) => {
                        setSpecialtyId(e.target.value);
                        if (errors.specialty) setErrors(prev => ({ ...prev, specialty: undefined }));
                      }}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.specialty ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select category</option>
                      {specialties.map((specialty) => (
                        <option key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </option>
                      ))}
                    </select>
                    {errors.specialty && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.specialty}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the techniques, products used, or story behind this work..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {/* Upload Stats */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Upload Summary</span>
                    </div>
                    <div className="text-sm text-purple-700 space-y-1">
                      <p>{selectedImages.length} images selected</p>
                      {selectedImages.length > 0 && (
                        <p>Primary: {selectedImages.find(img => img.isPrimary)?.file.name || "None"}</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Panel - Images */}
              <div className="lg:w-2/3 flex flex-col min-h-0">
                
                {/* Upload Area */}
                <div className="p-6 border-b border-gray-200">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive 
                        ? "border-purple-400 bg-purple-50" 
                        : errors.images
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        {isDragActive ? (
                          <Upload className="w-6 h-6 text-purple-600" />
                        ) : (
                          <Plus className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          {isDragActive ? "Drop images here" : "Add Images"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Drag and drop or click to select multiple images
                        </p>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs">
                        JPG, PNG, GIF, WEBP supported
                      </Badge>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Try dropzone first, fallback to manual input
                          try {
                            open();
                          } catch (error) {
                            openFileExplorer();
                          }
                        }}
                        className="mt-2"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Browse Files
                      </Button>
                    </div>
                  </div>
                  
                  {errors.images && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.images}
                    </p>
                  )}
                </div>

                {/* Image Preview Grid */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {selectedImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <ImageIcon className="w-16 h-16 mb-4" />
                      <p className="text-lg">No images selected</p>
                      <p className="text-sm">Upload images to see preview</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-700">
                          Selected Images ({selectedImages.length})
                        </h3>
                        <p className="text-xs text-gray-500">
                          Drag to reorder • Click star to set primary
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedImages.map((image, index) => (
                          <div
                            key={image.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`relative group bg-gray-100 rounded-lg overflow-hidden aspect-square cursor-move transition-all duration-200 ${
                              draggedIndex === index ? "opacity-50 scale-95" : "hover:shadow-lg"
                            }`}
                          >
                            <img
                              src={image.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Primary Badge */}
                            {image.isPrimary && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-yellow-500 text-white text-xs">
                                  <Star className="w-3 h-3 mr-1 fill-current" />
                                  Primary
                                </Badge>
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200">
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setPrimaryImage(image.id)}
                                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                  disabled={image.isPrimary}
                                >
                                  <Star className={`w-3 h-3 ${image.isPrimary ? "fill-current text-yellow-500" : ""}`} />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeImage(image.id)}
                                  className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              {/* Drag Indicator */}
                              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="flex items-center gap-1 text-white text-xs bg-black/50 px-2 py-1 rounded">
                                  <Move className="w-3 h-3" />
                                  Drag to reorder
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* Footer - Always visible */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {selectedImages.length > 0 && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Ready to upload {selectedImages.length} image{selectedImages.length > 1 ? "s" : ""}
                  </>
                )}
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={selectedImages.length === 0 || !title.trim() || !specialtyId || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="hidden sm:inline">Creating Portfolio...</span>
                      <span className="sm:hidden">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Create Portfolio</span>
                      <span className="sm:hidden">Create</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Hidden file input as fallback */}
      <input
        ref={hiddenInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};