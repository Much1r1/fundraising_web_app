import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Smartphone, 
  Heart,
  Shield,
  Gift,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Donate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const suggestedAmounts = [500, 1000, 2500, 5000, 10000];

  const handleDonate = async (method: string) => {
    if (!amount || parseFloat(amount) < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum donation amount is KES 100",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Donation Successful!",
        description: `Thank you for your KES ${amount} donation via ${method}`,
      });
      setIsProcessing(false);
      navigate(`/campaigns/${id}`);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Make a Donation</h1>
            <p className="text-muted-foreground">Every contribution makes a difference</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Campaign Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4"></div>
                <CardTitle className="text-lg">Emergency Surgery for Sarah</CardTitle>
                <CardDescription>Help Sarah get the life-saving surgery she needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Raised</p>
                    <p className="font-semibold">KES 325,000</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Goal</p>
                    <p className="font-semibold">KES 500,000</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>2,847 donors</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Your Donation
                </CardTitle>
                <CardDescription>Choose your donation amount and payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Selection */}
                <div className="space-y-4">
                  <Label htmlFor="amount">Donation Amount (KES)</Label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {suggestedAmounts.map((suggested) => (
                      <Button
                        key={suggested}
                        variant={amount === suggested.toString() ? "default" : "outline"}
                        onClick={() => setAmount(suggested.toString())}
                        className="text-sm"
                      >
                        {suggested.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter custom amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="100"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Leave a message of support..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Donate Anonymously</Label>
                    <p className="text-sm text-muted-foreground">
                      Hide your name from public donor list
                    </p>
                  </div>
                  <Switch
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                </div>

                <Separator />

                {/* Payment Methods */}
                <div className="space-y-4">
                  <Label>Choose Payment Method</Label>
                  
                  <Tabs defaultValue="mpesa" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="mpesa" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        M-Pesa
                      </TabsTrigger>
                      <TabsTrigger value="card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Card/PayPal
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="mpesa" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">M-Pesa Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="254712345678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-green-900 dark:text-green-100">
                              Secure M-Pesa Payment
                            </p>
                            <p className="text-green-700 dark:text-green-300">
                              You'll receive an STK push to complete the payment
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleDonate("M-Pesa")} 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isProcessing || !phoneNumber}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            <Smartphone className="mr-2 h-4 w-4" />
                            Donate KES {amount || "0"} via M-Pesa
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="card" className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900 dark:text-blue-100">
                              Secure Payment Processing
                            </p>
                            <p className="text-blue-700 dark:text-blue-300">
                              Pay with credit/debit card or PayPal
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <Button 
                          onClick={() => handleDonate("PayPal")} 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </div>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Donate KES {amount || "0"} via PayPal
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          onClick={() => handleDonate("Credit Card")} 
                          variant="outline"
                          className="w-full"
                          disabled={isProcessing}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay with Credit/Debit Card
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Security Note */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">100% Secure & Transparent</p>
                      <p className="text-muted-foreground">
                        Your payment is encrypted and secure. Funds go directly to the campaign beneficiary.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}