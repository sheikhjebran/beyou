
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

const WHATSAPP_NUMBER = "919945662602"; // Include country code (e.g., 91 for India)

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
      message += `* ${item.product.name} (x${item.quantity}) - $${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total: $${totalPrice.toFixed(2)}*`;
    return encodeURIComponent(message);
  };

  const handleWhatsAppCheckout = () => {
     const message = generateWhatsAppMessage();
     const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
     window.open(whatsappUrl, '_blank');
     // Optionally clear cart after sending to WhatsApp
     // clearCart();
   };


  return (
     <div className="flex min-h-screen flex-col">
       <Header />
       <main className="flex-1 p-6 container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Product</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead> {/* Remove action */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.product.id}>
                      <TableCell>
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                           <Button
                             variant="outline"
                             size="icon"
                             className="h-7 w-7"
                             onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                             disabled={item.quantity <= 1}
                             aria-label="Decrease quantity"
                           >
                             <Minus className="h-4 w-4" />
                           </Button>
                           <span>{item.quantity}</span>
                           <Button
                             variant="outline"
                             size="icon"
                              className="h-7 w-7"
                             onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                             aria-label="Increase quantity"
                           >
                             <Plus className="h-4 w-4" />
                           </Button>
                         </div>
                      </TableCell>
                       <TableCell className="text-right">${item.product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                       <TableCell className="text-right">
                         <Button
                           variant="ghost"
                           size="icon"
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
                      <TableCell colSpan={4} className="text-right font-bold text-lg">Total</TableCell>
                      <TableCell className="text-right font-bold text-lg">${totalPrice.toFixed(2)}</TableCell>
                      <TableCell></TableCell> {/* Empty cell for alignment */}
                    </TableRow>
                  </TableFooter>
              </Table>
            </CardContent>
             <Separator className="my-4" />
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 gap-4">
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
