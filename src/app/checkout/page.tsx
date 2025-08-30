
"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Trash2, Minus, Plus, ShoppingBag, StickyNote, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Separator } from '@/components/ui/separator';
import { AddressFormDialog, type AddressFormValues } from '@/components/address-form-dialog';

const WHATSAPP_NUMBER = "918088374457";

export default function CheckoutPage() {
  const { items, getTotalPrice, updateQuantity, removeFromCart } = useCart();
  const totalPrice = getTotalPrice();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  useEffect(() => {
    document.title = "Checkout - Your Cart | BeYou";
  }, []);

  const handleQuantityChange = (productId: string, newQuantity: number, note?: string) => {
    updateQuantity(productId, newQuantity, note);
  };

  const handleRemoveItem = (productId: string, note?: string) => {
    removeFromCart(productId, note);
  };

  const generateWhatsAppMessage = (addressDetails?: AddressFormValues) => {
    let message = "Hi BeYou! I'd like to purchase the following items:\n\n";
    items.forEach(item => {
      message += `* ${item.product.name} (x${item.quantity}) - ₹${(item.product.price * item.quantity).toFixed(2)}\n`;
      if (item.note) {
        message += `  (Note: ${item.note})\n`;
      }
    });
    message += `\n*Total: ₹${totalPrice.toFixed(2)}*\n\n`;

    if (addressDetails) {
      message += "*Shipping Details:*\n";
      message += `Name: ${addressDetails.name}\n`;
      message += `Address: ${addressDetails.address}\n`;
      if (addressDetails.landmark) {
        message += `Landmark: ${addressDetails.landmark}\n`;
      }
      message += `City: ${addressDetails.city}\n`;
      message += `Pincode: ${addressDetails.pincode}\n`;
      message += `Mobile: ${addressDetails.mobileNumber}\n`;
    }
    return encodeURIComponent(message);
  };

  const handleProceedToWhatsApp = (addressData: AddressFormValues) => {
    const message = generateWhatsAppMessage(addressData);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    console.log("Generated WhatsApp URL:", whatsappUrl);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsAddressDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6 container mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">Your Cart</h1>
        {items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Button asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px] md:w-[100px] pl-2 md:pl-4">Product</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Price (₹)</TableHead>
                        <TableHead className="text-right pr-2 md:pr-4">Total (₹)</TableHead>
                        <TableHead className="w-[40px] md:w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={`${item.product.id}-${item.note || index}`}>
                          <TableCell className="pl-2 md:pl-4">
                            <div className="relative w-12 h-12 md:w-16 md:h-16">
                              <Image
                                src={item.product.primaryImageUrl || 'https://placehold.co/64x64.png'}
                                alt={item.product.name}
                                fill // Use fill for responsive fixed size containers
                                sizes="64px" // Provide an accurate size
                                className="rounded-md object-cover"
                                data-ai-hint="product item"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium whitespace-normal break-words py-2 md:py-4 min-w-[100px] sm:min-w-[150px]">
                            {item.product.name}
                            {item.note && (
                              <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                                <StickyNote className="h-3 w-3 mt-0.5 shrink-0" />
                                <p className="whitespace-pre-wrap break-words">Note: {item.note}</p>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center py-2 md:py-4">
                            <div className="flex items-center justify-center space-x-1 md:space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 md:h-7 md:w-7"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1, item.note)}
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                              <span className="text-sm md:text-base w-4 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 md:h-7 md:w-7"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1, item.note)}
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-foreground hidden sm:table-cell py-2 md:py-4">₹{item.product.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-foreground pr-2 md:pr-4 py-2 md:py-4">₹{(item.product.price * item.quantity).toFixed(2)}</TableCell>
                          <TableCell className="text-right py-2 md:py-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 md:h-8 md:w-8"
                              onClick={() => handleRemoveItem(item.product.id, item.note)}
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium text-sm md:text-base text-foreground">Total</TableCell>
                        <TableCell className="text-right font-medium text-sm md:text-base text-foreground pr-2 md:pr-4">₹{totalPrice.toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
              <Separator className="my-4" />
              <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                  <Link 
                    href="/exchange-refund-policy" 
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    Exchange & Refund Policy
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <Button
                  onClick={() => setIsAddressDialogOpen(true)}
                  disabled={items.length === 0}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" /> Checkout
                </Button>
              </CardFooter>
            </Card>
            <AddressFormDialog
              isOpen={isAddressDialogOpen}
              onOpenChange={setIsAddressDialogOpen}
              onSubmit={handleProceedToWhatsApp}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
