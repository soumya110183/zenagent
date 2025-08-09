import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  Bot,
  Activity,
  Settings,
  Camera,
  Edit,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user } = useAuth() as { user: User | undefined };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || ""
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string }) => {
      return await apiRequest("PATCH", "/api/auth/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Profile image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profileImage", file);
      return await apiRequest("POST", "/api/auth/upload-avatar", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      uploadImageMutation.mutate(file);
    }
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || ""
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading user information...</p>
        </div>
      </Layout>
    );
  }

  const accessibleAgents = [
    {
      name: "Java Agent",
      description: "Spring Boot & enterprise patterns analysis",
      status: "active",
      lastUsed: "2025-01-08"
    },
    {
      name: "PySpark Agent", 
      description: "Big data processing pipeline analysis",
      status: "active",
      lastUsed: "2025-01-07"
    },
    {
      name: "Mainframe Agent",
      description: "COBOL programs & JCL job analysis", 
      status: "active",
      lastUsed: "2025-01-05"
    },
    {
      name: "Python Agent",
      description: "Django/Flask framework analysis",
      status: "active", 
      lastUsed: "2025-01-06"
    },
    {
      name: "Code Lens Agent",
      description: "Demographic field & integration analysis",
      status: "active",
      lastUsed: "2025-01-08"
    },
    {
      name: "Match Lens Agent", 
      description: "Field matching with C360 data",
      status: "active",
      lastUsed: "2025-01-07"
    },
    {
      name: "Validator Agent",
      description: "Security & privacy compliance validation",
      status: "active",
      lastUsed: "2025-01-08"
    },
    {
      name: "Responsible Agent",
      description: "AI/ML safety & governance framework",
      status: "active",
      lastUsed: "2025-01-06"
    }
  ];

  const sessionInfo = {
    loginTime: new Date(),
    ipAddress: "192.168.1.100",
    browser: "Chrome 120.0",
    location: "Mumbai, India",
    sessionDuration: "2h 15m"
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  {profileImage || user.profileImageUrl ? (
                    <img 
                      src={profileImage || user.profileImageUrl} 
                      alt={user.username}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadImageMutation.isPending}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {uploadImageMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
                <CardTitle className="text-xl">{user.username}</CardTitle>
                <CardDescription>{user.email || "No email provided"}</CardDescription>
                <Badge variant="secondary" className="w-fit mx-auto mt-2">
                  <Shield className="w-3 h-3 mr-1" />
                  Active User
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Member since</p>
                    <p className="text-gray-600">{format(new Date(user.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Last updated</p>
                    <p className="text-gray-600">{format(new Date(user.updatedAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Current Session</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Login time:</span>
                  <span className="font-medium">{format(sessionInfo.loginTime, "MMM dd, HH:mm")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{sessionInfo.sessionDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IP Address:</span>
                  <span className="font-medium">{sessionInfo.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Browser:</span>
                  <span className="font-medium">{sessionInfo.browser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{sessionInfo.location}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details & Agents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Personal Details</span>
                  </div>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>Your account information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                    <div className="p-3 bg-gray-50 rounded-lg border mt-1">
                      <p className="text-sm text-gray-500">{user.username} (Cannot be changed)</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border mt-1">
                        <p className="text-sm">{user.email || "Not provided"}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="mt-1"
                        placeholder="Enter your first name"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border mt-1">
                        <p className="text-sm">{user.firstName || "Not provided"}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="mt-1"
                        placeholder="Enter your last name"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border mt-1">
                        <p className="text-sm">{user.lastName || "Not provided"}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessible Agents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Accessible AI Agents</span>
                </CardTitle>
                <CardDescription>AI agents available for your analysis projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accessibleAgents.map((agent, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{agent.name}</h4>
                        <Badge 
                          variant={agent.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{agent.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Last used: {agent.lastUsed}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}