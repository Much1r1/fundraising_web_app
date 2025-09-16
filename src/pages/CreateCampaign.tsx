import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Camera, 
  DollarSign, 
  MapPin, 
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  "Medical", "Emergency", "Animals", "Education", 
  "Environment", "Community", "Sports", "Arts & Culture", 
  "Business", "Technology", "Travel"
];

const steps = [
  { id: 1, title: "Basic Info", description: "Title, category, and goal" },
  { id: 2, title: "Story & Media", description: "Tell your story with images and videos" },
  { id: 3, title: "Details", description: "Location, timeline, and verification" },
  { id: 4, title: "Review", description: "Review and publish your campaign" }
];

export default function CreateCampaign() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    goal: "",
    description: "",
    location: "",
    endDate: "",
    images: [] as File[],
    video: null as File | null,
    beneficiaryType: "",
    updates: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (field: string, files: FileList | null) => {
    if (files) {
      if (field === "images") {
        setFormData(prev => ({ ...prev, images: Array.from(files) }));
      } else if (field === "video") {
        setFormData(prev => ({ ...prev, video: files[0] }));
      }
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title) newErrors.title = "Campaign title is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.goal || parseInt(formData.goal) < 100) {
          newErrors.goal = "Goal must be at least $100";
        }
        break;
      case 2:
        if (!formData.description || formData.description.length < 100) {
          newErrors.description = "Description must be at least 100 characters";
        }
        if (formData.images.length === 0) {
          newErrors.images = "At least one image is required";
        }
        break;
      case 3:
        if (!formData.location) newErrors.location = "Location is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";
        if (!formData.beneficiaryType) newErrors.beneficiaryType = "Beneficiary type is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      // Here you would submit to your backend
      console.log("Submitting campaign:", formData);
      // Simulate success
      alert("Campaign created successfully! It will be reviewed before going live.");
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Create Your Campaign</h1>
          <p className="text-lg text-muted-foreground">
            Share your story and start making a difference today
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center ${step.id < steps.length ? 'flex-1' : ''}`}
              >
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {step.id < steps.length && (
                  <div className={`
                    flex-1 h-1 mx-4
                    ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <FileText className="h-5 w-5" />}
              {currentStep === 2 && <ImageIcon className="h-5 w-5" />}
              {currentStep === 3 && <MapPin className="h-5 w-5" />}
              {currentStep === 4 && <CheckCircle className="h-5 w-5" />}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a compelling title for your campaign"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="goal">Fundraising Goal *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="goal"
                      type="number"
                      placeholder="0"
                      value={formData.goal}
                      onChange={(e) => handleInputChange("goal", e.target.value)}
                      className={`pl-10 ${errors.goal ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.goal && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.goal}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Set a realistic goal. You can always adjust it later.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Story & Media */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="description">Campaign Story *</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell your story... Why are you raising funds? How will the money be used? What impact will it make?"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={`min-h-32 ${errors.description ? "border-destructive" : ""}`}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{formData.description.length} characters (minimum 100)</span>
                    {errors.description && (
                      <span className="text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Campaign Images *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload images that tell your story
                    </p>
                    <Button variant="outline" type="button" asChild>
                      <label>
                        <Camera className="h-4 w-4 mr-2" />
                        Choose Images
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("images", e.target.files)}
                        />
                      </label>
                    </Button>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="aspect-square bg-muted rounded-lg p-2">
                          <p className="text-sm truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.images && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.images}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Campaign Video (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Add a video to make your campaign more engaging
                    </p>
                    <Button variant="outline" type="button" asChild>
                      <label>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Video
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("video", e.target.files)}
                        />
                      </label>
                    </Button>
                  </div>
                  {formData.video && (
                    <Badge variant="outline" className="mt-2">
                      {formData.video.name}
                    </Badge>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Details */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="location"
                      placeholder="City, State, Country"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className={`pl-10 ${errors.location ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.location && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.location}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate">Campaign End Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      className={`pl-10 ${errors.endDate ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.endDate}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="beneficiaryType">Who are you raising funds for? *</Label>
                  <Select
                    value={formData.beneficiaryType}
                    onValueChange={(value) => handleInputChange("beneficiaryType", value)}
                  >
                    <SelectTrigger className={errors.beneficiaryType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select beneficiary type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="myself">Myself</SelectItem>
                      <SelectItem value="family">Family Member</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="organization">Organization/Charity</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.beneficiaryType && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.beneficiaryType}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Campaign Preview</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{formData.title}</h4>
                      <Badge variant="secondary">{formData.category}</Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Goal Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        ${parseInt(formData.goal || "0").toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm line-clamp-3">{formData.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p>{formData.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p>{formData.endDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Review Process
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        Your campaign will be reviewed within 24 hours before going live. 
                        We may contact you for additional verification documents.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-gradient-primary">
              Create Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}