
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

// Define Zod schema for address form validation
const addressFormSchema = z.object({
  name: z.string().min(5, { message: "Name must be at least 5 characters." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  landmark: z.string().optional(),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  pincode: z.string()
    .length(6, { message: "Pincode must be exactly 6 digits." })
    .regex(/^\d{6}$/, { message: "Pincode must be numeric." }),
  mobileNumber: z.string()
    .length(10, { message: "Mobile number must be exactly 10 digits." })
    .regex(/^\d{10}$/, { message: "Mobile number must be numeric." }),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

interface AddressFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: AddressFormValues) => void;
}

export function AddressFormDialog({ isOpen, onOpenChange, onSubmit: onFormSubmit }: AddressFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: '',
      address: '',
      landmark: '',
      city: '',
      pincode: '',
      mobileNumber: '',
    },
    mode: 'onChange', // Validate on change to enable/disable Next button more dynamically
  });

  useEffect(() => {
    if (!isOpen) {
        form.reset();
        setCurrentStep(1); // Reset to first step when dialog closes/reopens
    }
  }, [isOpen, form]);

  const handleNextStep = async () => {
    const step1Fields: (keyof AddressFormValues)[] = ['name', 'address'];
    // Landmark is optional, not validating explicitly here for progression
    const isValid = await form.trigger(step1Fields); // This triggers validation for name and address

    if (isValid) { // isValid here refers to the triggered fields
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit: SubmitHandler<AddressFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      onFormSubmit(data); 
    } catch (error) {
      console.error("Error submitting address form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] flex flex-col max-h-[85svh] md:max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="shrink-0 p-6 pb-4 border-b">
          <DialogTitle>Shipping Details - Step {currentStep} of 2</DialogTitle>
          <DialogDescription>
            {currentStep === 1 
              ? "Please enter your name and delivery address." 
              : "Please enter your city, pincode, and mobile number."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-4 p-6">
                {currentStep === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Ayesha Banu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Address (House No, Street, Area)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., #123, Sunshine Apartments, 4th Main, Indiranagar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="landmark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Landmark (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Near City Park" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Bengaluru" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input type="text" maxLength={6} placeholder="e.g., 560001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input type="tel" maxLength={10} placeholder="e.g., 9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </ScrollArea>
            
            <DialogFooter className="p-6 pt-4 border-t shrink-0 flex flex-col sm:flex-row sm:justify-between gap-2">
              {currentStep === 1 && (
                <>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="button" 
                    onClick={handleNextStep} 
                    className="w-full sm:w-auto"
                    disabled={!!form.formState.errors.name || !!form.formState.errors.address}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <Button type="button" variant="outline" onClick={handlePreviousStep} className="w-full sm:w-auto">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                     <DialogClose asChild>
                        <Button type="button" variant="ghost" className="w-full sm:w-auto order-last sm:order-first"> 
                           Cancel
                        </Button>
                     </DialogClose>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting || !form.formState.isValid} 
                        className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        'Place Order & Chat on WhatsApp'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
