import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Upload, Video, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  story: z.string().min(50, "Story must be at least 50 characters").max(5000, "Story must be less than 5000 characters"),
  goalAmount: z.string().min(1, "Goal amount is required"),
  fundUsage: z.string().min(20, "Please explain how funds will be used (at least 20 characters)"),
  category: z.string().min(1, "Please select a category"),
  endDate: z.string().min(1, "Please select an end date"),
  organizer: z.string().min(2, "Organizer name is required"),
  tagline: z.string().max(100, "Tagline must be less than 100 characters").optional(),
  location: z.string().optional(),
  videoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      story: "",
      goalAmount: "",
      fundUsage: "",
      category: "",
      endDate: "",
      organizer: "",
      tagline: "",
      location: "",
      videoUrl: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Auth error:", authError);
        toast({
          title: "Authentication required",
          description: "Please sign in to create a campaign",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      console.log("Creating campaign with data:", {
        title: values.title,
        goal_amount: parseFloat(values.goalAmount),
        category: values.category,
        user_id: user.id,
      });

      const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert({
          title: values.title,
          story: values.story,
          description: values.tagline || values.title,
          goal_amount: parseFloat(values.goalAmount),
          category: values.category,
          end_date: values.endDate,
          location: values.location,
          video_url: values.videoUrl || null,
          campaign_organizers: values.organizer,
          user_id: user.id,
          campaign_status: "draft",
          visibility: "private",
          approval_status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Database error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Error",
          description: error.message || "Failed to create campaign. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Campaign created successfully:", campaign);

      toast({
        title: "Campaign Submitted Successfully!",
        description: "You'll be notified when the admin approves your campaign.",
      });

      navigate(`/campaigns`);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      const errorMessage = error?.message || "Failed to create campaign. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <Heart className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Create Your Campaign
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your story with the world and make a difference. Every great change starts with a single step.
          </p>
        </div>

        <Card className="shadow-lg animate-slide-up">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Fill in the information below to create your fundraising campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Question 1: Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        1. What's the title of your campaign? *
                      </FormLabel>
                      <FormDescription>
                        Give your story a name that will grab hearts and attention.
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="e.g., Help Build a School in Rural Kenya"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question 2: Story */}
                <FormField
                  control={form.control}
                  name="story"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        2. Tell us your story. *
                      </FormLabel>
                      <FormDescription>
                        Share what inspired you to start this campaign. What's happening, who's involved, and why does it matter?
                        ✨ Be honest, emotional, and real — that's what connects people.
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="Tell your story here..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question 3: Photos */}
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    3. Add photos that bring your story to life
                  </FormLabel>
                  <FormDescription>
                    📷 Upload images that show your cause, your team, or the people you're helping. (Max 5 images)
                  </FormDescription>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Images
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <span className="text-sm text-muted-foreground">
                        {imageFiles.length} / 5 images selected
                      </span>
                    </div>
                    {imageFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormItem>

                {/* Question 4: Video */}
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        4. Would you like to add a video? (Optional)
                      </FormLabel>
                      <FormDescription>
                        🎥 A short video can help people see and feel your mission. Paste a YouTube or Vimeo link.
                      </FormDescription>
                      <FormControl>
                        <div className="flex gap-2">
                          <Video className="h-10 w-10 text-muted-foreground" />
                          <Input
                            placeholder="https://youtube.com/watch?v=..."
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question 5: Goal Amount */}
                <FormField
                  control={form.control}
                  name="goalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        5. How much are you hoping to raise? *
                      </FormLabel>
                      <FormDescription>
                        Set a clear goal so donors know how their contribution will make a difference.
                      </FormDescription>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            KSh
                          </span>
                          <Input
                            type="number"
                            placeholder="50000"
                            className="pl-12"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question 6: Fund Usage */}
                <FormField
                  control={form.control}
                  name="fundUsage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        6. How will the funds be used? *
                      </FormLabel>
                      <FormDescription>
                        Break it down — where will the money go, and how will it create real impact?
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., KSh 30,000 for materials, KSh 15,000 for labor, KSh 5,000 for permits..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question 7: Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        7. Choose a campaign category *
                      </FormLabel>
                      <FormDescription>
                        Select the area that best fits your cause
                      </FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="health">Health & Medical</SelectItem>
                          <SelectItem value="community">Community Development</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                          <SelectItem value="emergency">Emergency Relief</SelectItem>
                          <SelectItem value="arts">Arts & Culture</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question 8: End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        8. How long should your campaign run? *
                      </FormLabel>
                      <FormDescription>
                        Pick an end date — it helps create momentum.
                      </FormDescription>
                      <FormControl>
                        <div className="flex gap-2">
                          <Calendar className="h-10 w-10 text-muted-foreground" />
                          <Input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question 9: Organizer */}
                <FormField
                  control={form.control}
                  name="organizer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        9. Who's organizing this campaign? *
                      </FormLabel>
                      <FormDescription>
                        Tell supporters who's behind the effort (you, your team, or an organization)
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="e.g., John Doe, Hope Foundation Kenya"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question 10: Tagline */}
                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        10. Add a short tagline or slogan (Optional)
                      </FormLabel>
                      <FormDescription>
                        Something memorable, like "Hope for Tomorrow" or "Clean Water for Every Child"
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="Your memorable tagline..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Optional Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Location (Optional)
                      </FormLabel>
                      <FormDescription>
                        Where is this campaign located?
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="e.g., Nairobi, Kenya"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/campaigns")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCampaign;
