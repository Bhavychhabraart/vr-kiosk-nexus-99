
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { useMachineSetup } from "@/hooks/useMachineSetup";
import { toast } from "@/components/ui/use-toast";

interface OwnerSetupStepProps {
  onNext: () => void;
  setupStatus: any;
}

export const OwnerSetupStep = ({ onNext, setupStatus }: OwnerSetupStepProps) => {
  const [ownerData, setOwnerData] = useState({
    business_name: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    business_address: "",
    business_city: "",
    business_state: "",
    business_pin_code: "",
    business_type: "",
    expected_hours: {
      monday: { open: "09:00", close: "21:00", closed: false },
      tuesday: { open: "09:00", close: "21:00", closed: false },
      wednesday: { open: "09:00", close: "21:00", closed: false },
      thursday: { open: "09:00", close: "21:00", closed: false },
      friday: { open: "09:00", close: "21:00", closed: false },
      saturday: { open: "10:00", close: "22:00", closed: false },
      sunday: { open: "10:00", close: "20:00", closed: false },
    }
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const { saveOwnerRegistration, updateProgress, isSaving, isUpdating } = useMachineSetup();

  const businessTypes = [
    "Gaming Arcade",
    "Entertainment Center", 
    "Mall Kiosk",
    "Shopping Center",
    "Cafe/Restaurant",
    "Hotel/Resort",
    "Corporate Office",
    "Educational Institution",
    "Other"
  ];

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const handleInputChange = (field: string, value: string) => {
    setOwnerData(prev => ({ ...prev, [field]: value }));
  };

  const simulateEmailVerification = () => {
    if (!ownerData.owner_email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address first.",
      });
      return;
    }
    
    // Simulate email verification
    setTimeout(() => {
      setEmailVerified(true);
      toast({
        title: "Email Verified",
        description: "Your email address has been verified successfully.",
      });
    }, 2000);
  };

  const simulatePhoneVerification = () => {
    if (!ownerData.owner_phone) {
      toast({
        variant: "destructive",
        title: "Phone Required",
        description: "Please enter your phone number first.",
      });
      return;
    }
    
    // Simulate phone verification
    setTimeout(() => {
      setPhoneVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully.",
      });
    }, 2000);
  };

  const handleContinue = async () => {
    // Validate required fields
    const requiredFields = [
      'business_name', 'owner_name', 'owner_email', 
      'business_city', 'business_state'
    ];
    
    const missingFields = requiredFields.filter(field => !ownerData[field as keyof typeof ownerData]);
    
    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      // Save owner registration
      await saveOwnerRegistration({
        machine_serial_number: setupStatus?.serial_number,
        ...ownerData,
        email_verified_at: emailVerified ? new Date().toISOString() : null,
        phone_verified_at: phoneVerified ? new Date().toISOString() : null,
      });

      // Update setup progress
      await updateProgress({
        serialNumber: setupStatus.serial_number,
        status: 'owner_setup',
        stepData: {
          owner: {
            ...ownerData,
            email_verified: emailVerified,
            phone_verified: phoneVerified,
            completed_at: new Date().toISOString(),
          }
        }
      });

      onNext();
    } catch (error) {
      console.error('Failed to save owner information:', error);
    }
  };

  const isFormValid = ownerData.business_name && ownerData.owner_name && 
                     ownerData.owner_email && ownerData.business_city && 
                     ownerData.business_state;

  return (
    <div className="space-y-6">
      {/* Owner Setup Introduction */}
      <div className="text-center space-y-2">
        <User className="h-12 w-12 text-vr-primary mx-auto" />
        <h3 className="text-xl font-bold text-white">Owner & Business Setup</h3>
        <p className="text-gray-300">
          Please provide your business information to complete the registration process.
        </p>
      </div>

      {/* Business Information */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-vr-primary" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_name" className="text-white">
                Business Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="business_name"
                type="text"
                placeholder="Enter your business name"
                value={ownerData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                className="bg-black/50 border-gray-600 text-white mt-2"
              />
            </div>
            <div>
              <Label htmlFor="business_type" className="text-white">Business Type</Label>
              <Select value={ownerData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                <SelectTrigger className="bg-black/50 border-gray-600 text-white mt-2">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="business_address" className="text-white">Business Address</Label>
            <Textarea
              id="business_address"
              placeholder="Enter complete business address"
              value={ownerData.business_address}
              onChange={(e) => handleInputChange('business_address', e.target.value)}
              className="bg-black/50 border-gray-600 text-white mt-2"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="business_city" className="text-white">
                City <span className="text-red-400">*</span>
              </Label>
              <Input
                id="business_city"
                type="text"
                placeholder="City"
                value={ownerData.business_city}
                onChange={(e) => handleInputChange('business_city', e.target.value)}
                className="bg-black/50 border-gray-600 text-white mt-2"
              />
            </div>
            <div>
              <Label htmlFor="business_state" className="text-white">
                State <span className="text-red-400">*</span>
              </Label>
              <Select value={ownerData.business_state} onValueChange={(value) => handleInputChange('business_state', value)}>
                <SelectTrigger className="bg-black/50 border-gray-600 text-white mt-2">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="business_pin_code" className="text-white">PIN Code</Label>
              <Input
                id="business_pin_code"
                type="text"
                placeholder="PIN Code"
                value={ownerData.business_pin_code}
                onChange={(e) => handleInputChange('business_pin_code', e.target.value)}
                className="bg-black/50 border-gray-600 text-white mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner Contact Information */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-vr-primary" />
            Owner Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="owner_name" className="text-white">
              Owner Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="owner_name"
              type="text"
              placeholder="Enter owner/manager name"
              value={ownerData.owner_name}
              onChange={(e) => handleInputChange('owner_name', e.target.value)}
              className="bg-black/50 border-gray-600 text-white mt-2"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="owner_email" className="text-white">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="owner_email"
                  type="email"
                  placeholder="Enter email address"
                  value={ownerData.owner_email}
                  onChange={(e) => handleInputChange('owner_email', e.target.value)}
                  className="bg-black/50 border-gray-600 text-white"
                />
                <Button
                  onClick={simulateEmailVerification}
                  disabled={!ownerData.owner_email || emailVerified}
                  variant={emailVerified ? "default" : "outline"}
                  className={emailVerified ? "bg-green-500 text-white" : "border-vr-primary text-vr-primary"}
                >
                  {emailVerified ? <CheckCircle className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="owner_phone" className="text-white">Phone Number</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="owner_phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={ownerData.owner_phone}
                  onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                  className="bg-black/50 border-gray-600 text-white"
                />
                <Button
                  onClick={simulatePhoneVerification}
                  disabled={!ownerData.owner_phone || phoneVerified}
                  variant={phoneVerified ? "default" : "outline"}
                  className={phoneVerified ? "bg-green-500 text-white" : "border-vr-primary text-vr-primary"}
                >
                  {phoneVerified ? <CheckCircle className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-vr-primary" />
            Expected Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            Set your typical business hours. You can modify these later in the admin panel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ownerData.expected_hours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4 p-3 bg-black/30 rounded-lg">
                <div className="w-20 text-white capitalize">{day}</div>
                <Input
                  type="time"
                  value={hours.open}
                  onChange={(e) => setOwnerData(prev => ({
                    ...prev,
                    expected_hours: {
                      ...prev.expected_hours,
                      [day]: { ...hours, open: e.target.value }
                    }
                  }))}
                  className="bg-black/50 border-gray-600 text-white w-24"
                />
                <span className="text-gray-400">to</span>
                <Input
                  type="time"
                  value={hours.close}
                  onChange={(e) => setOwnerData(prev => ({
                    ...prev,
                    expected_hours: {
                      ...prev.expected_hours,
                      [day]: { ...hours, close: e.target.value }
                    }
                  }))}
                  className="bg-black/50 border-gray-600 text-white w-24"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={!isFormValid || isSaving || isUpdating}
          className="bg-vr-primary hover:bg-vr-primary/90 text-black"
        >
          {isSaving || isUpdating ? (
            "Saving..."
          ) : (
            <>
              Continue to System Configuration
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
