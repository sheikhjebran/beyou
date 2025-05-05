
"use client";

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Trash2, Minus, Plus, MessageSquareText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header'; // Import Header
import { Separator } from '@/components/ui/separator'; // Import Separator

const WHATSAPP_NUMBER = "918217714675"; // Update WhatsApp number (Include country code)

export default function CheckoutPage() {
  const { items, getTotalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const totalPrice = getTotalPrice();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const generateWhatsAppMessage = () => {
    let message = "Hi BeYou! I'd like to purchase the following items:\n\n";
    items.forEach(item => {
      // Updated currency symbol to INR and format
      message += `* ${item.product.name} (x${item.quantity}) - ₹${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    // Updated currency symbol to INR and format
    message += `\n*Total: ₹${totalPrice.toFixed(2)}*`;
    // Encode the message for URL usage
    return encodeURIComponent(message);
  };

  const handleWhatsAppCheckout = () => {
     const message = generateWhatsAppMessage();
     // Construct the WhatsApp URL using wa.me
     const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
     console.log("Generated WhatsApp URL:", whatsappUrl); // Log the URL for debugging
     // Open the URL in a new tab/window
     window.open(whatsappUrl, '_blank', 'noopener,noreferrer'); // Added noopener,noreferrer for security
     // Optionally clear cart after sending to WhatsApp
     // clearCart();
   };


  return (
     <div className="flex min-h-screen flex-col">
       {/* Header without search functionality */}
       <Header />
       <main className="flex-1 p-4 md:p-6 container mx-auto"> {/* Reduced padding on mobile */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">Your Cart</h1> {/* Adjusted text size */}
        {items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Link href="/" passHref legacyBehavior>
                <Button>Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6"> {/* Remove padding on mobile for table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* Reduced width on smaller screens */}
                    <TableHead className="w-[60px] md:w-[100px] pl-2 md:pl-4">Product</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-center">Qty</TableHead> {/* Shortened Header */}
                    {/* Hide Price column on small screens */}
                    <TableHead className="text-right hidden sm:table-cell">Price (₹)</TableHead>
                    <TableHead className="text-right pr-2 md:pr-4">Total (₹)</TableHead>
                    <TableHead className="w-[40px] md:w-[50px]"></TableHead>{/* Remove action */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.product.id}>
                      <TableCell className="pl-2 md:pl-4"> {/* Reduced padding */}
                        <Image
                          src={item.product.imageUrl || 'https://picsum.photos/seed/productimg/64/64'} // Add fallback image
                          alt={item.product.name}
                          width={48} // Smaller image on mobile
                          height={48} // Smaller image on mobile
                          className="rounded-md object-cover w-12 h-12 md:w-16 md:h-16" // Responsive size
                        />
                      </TableCell>
                      {/* Allow wrapping for product name */}
                      <TableCell className="font-medium whitespace-normal break-words py-2 md:py-4">{item.product.name}</TableCell>
                      <TableCell className="text-center py-2 md:py-4">
                        <div className="flex items-center justify-center space-x-1 md:space-x-2"> {/* Reduced spacing */}
                           <Button
                             variant="outline"
                             size="icon"
                             className="h-6 w-6 md:h-7 md:w-7" // Smaller buttons on mobile
                             onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                             disabled={item.quantity <= 1}
                             aria-label="Decrease quantity"
                           >
                             <Minus className="h-3 w-3 md:h-4 md:w-4" /> {/* Smaller icon */}
                           </Button>
                           <span className="text-sm md:text-base w-4 text-center">{item.quantity}</span> {/* Ensure width for number */}
                           <Button
                             variant="outline"
                             size="icon"
                              className="h-6 w-6 md:h-7 md:w-7" // Smaller buttons on mobile
                             onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                             aria-label="Increase quantity"
                           >
                             <Plus className="h-3 w-3 md:h-4 md:w-4" /> {/* Smaller icon */}
                           </Button>
                         </div>
                      </TableCell>
                       {/* Updated currency symbol and ensured black text via text-foreground */}
                       {/* Hide Price column on small screens */}
                       <TableCell className="text-right text-foreground hidden sm:table-cell py-2 md:py-4">₹{item.product.price.toFixed(2)}</TableCell>
                       {/* Updated currency symbol and ensured black text via text-foreground */}
                      <TableCell className="text-right text-foreground pr-2 md:pr-4 py-2 md:py-4">₹{(item.product.price * item.quantity).toFixed(2)}</TableCell>
                       <TableCell className="text-right py-2 md:py-4">
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-7 w-7 md:h-8 md:w-8" // Slightly smaller remove icon
                           onClick={() => handleRemoveItem(item.product.id)}
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
                       {/* Adjusted colSpan for hidden column */}
                      <TableCell colSpan={3} className="text-right font-bold text-base md:text-lg text-foreground sm:col-span-4">Total</TableCell>
                      {/* Updated currency symbol and ensured black text via text-foreground */}
                      <TableCell className="text-right font-bold text-base md:text-lg text-foreground pr-2 md:pr-4">₹{totalPrice.toFixed(2)}</TableCell>
                      <TableCell></TableCell>{/* Empty cell for alignment */}
                    </TableRow>
                  </TableFooter>
              </Table>
            </CardContent>
             <Separator className="my-4" />
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 gap-4"> {/* Reduced padding */}
               <Link href="/" passHref legacyBehavior>
                <Button variant="outline">Continue Shopping</Button>
               </Link>
              <Button
                 onClick={handleWhatsAppCheckout}
                 disabled={items.length === 0}
                 className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
               >
                 <MessageSquareText className="mr-2 h-5 w-5" /> Buy Items via WhatsApp
               </Button>
            </CardFooter>
          </Card>
        )}
        </main>
       <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
         © {new Date().getFullYear()} BeYou. All rights reserved.
       </footer>
     </div>
  );
}
