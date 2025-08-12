
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';
import { updateUserDisplayName, updateUserPassword, updateUserProfilePicture } from '@/services/authService';
import { Loader2, UserCircle, Edit3, ShieldCheck, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';
import Image from 'next/image'; // For previewing image
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }).optional().or(z.literal('')),
  newPassword: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "New password must be at least 6 characters if provided.",
  }),
  confirmPassword: z.string().optional(),
  profileImageFile: z.instanceof(File).optional().nullable()
    .refine(file => !file || file.size <= 2 * 1024 * 1024, `Max image size is 2MB.`)
    .refine(
      file => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png, and .webp formats are supported."
    ),
}).refine(data => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      newPassword: '',
      confirmPassword: '',
      profileImageFile: null,
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        displayName: currentUser.displayName || '',
        newPassword: '',
        confirmPassword: '',
        profileImageFile: null,
      });
      if (currentUser.photoURL) {
        setImagePreviewUrl(currentUser.photoURL);
      }
    }
  }, [currentUser, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('profileImageFile', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('profileImageFile', null);
      // Revert to original photoURL if file is deselected, or clear if none
      setImagePreviewUrl(currentUser?.photoURL || null);
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();


  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "Not authenticated." });
      return;
    }
    setIsSubmitting(true);

    try {
      let changesMade = false;
      // Update display name
      if (data.displayName && data.displayName !== currentUser.displayName) {
        await updateUserDisplayName(data.displayName);
        toast({ title: "Success", description: "Display name updated." });
        changesMade = true;
      }

      // Update password
      if (data.newPassword) {
        await updateUserPassword(data.newPassword);
        toast({ title: "Success", description: "Password updated successfully." });
        form.resetField("newPassword");
        form.resetField("confirmPassword");
        changesMade = true;
      }

      // Update profile image
      if (data.profileImageFile) {
        const newPhotoURL = await updateUserProfilePicture(data.profileImageFile);
        // Firebase Auth currentUser object might not update immediately on client,
        // so we manually update preview. A hard refresh or context update would show it.
        setImagePreviewUrl(newPhotoURL); 
        toast({ title: "Success", description: "Profile picture updated." });
        form.resetField("profileImageFile"); // Clear the file input
        changesMade = true;
      }
      
      if (!changesMade) {
        toast({ title: "No Changes", description: "No new information was provided to update." });
      }

    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
       <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>Not Authenticated</AlertTitle>
         <AlertDescription>Please log in to view your profile.</AlertDescription>
       </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <UserCircle className="mx-auto h-16 w-16 text-primary mb-2" />
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground">Manage your account details.</p>
      </div>

      <Form {...form}> {/* Moved FormProvider to wrap all form-related content */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-2 border-primary shadow-md">
                {imagePreviewUrl ? (
                  <AvatarImage src={imagePreviewUrl} alt={currentUser.displayName || currentUser.email || 'User Avatar'} />
                ) : null}
                <AvatarFallback className="text-4xl">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="profileImageFile"
                render={() => (
                  <FormItem className="w-full max-w-xs">
                    <FormControl>
                      <Input
                        type="file"
                        id="profileImageFile"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                      />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={triggerFileSelect} className="w-full">
                      {imagePreviewUrl && form.getValues("profileImageFile") ? 'Change Image' : 'Upload New Image'}
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={currentUser.email || ''} readOnly disabled className="cursor-not-allowed bg-muted/50" />
                <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed here.</p>
              </FormItem>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Update Password
              </CardTitle>
              <CardDescription>Leave blank if you don't want to change your password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting || !form.formState.isDirty} className="w-full md:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
           {(!form.formState.isValid && form.formState.isSubmitted && Object.keys(form.formState.errors).length > 0) && (
             <Alert variant="destructive" className="mt-4">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Validation Errors</AlertTitle>
               <AlertDescription>
                 Please correct the errors highlighted in the form before saving.
               </AlertDescription>
             </Alert>
           )}
        </form>
      </Form>
    </div>
  );
}
