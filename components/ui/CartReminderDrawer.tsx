"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';

export function CartReminderDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  // Ensure we safely pull isLoading if it exists in the extended context 
  const { state, clearCart, isLoading } = useCart() as any;
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if we are on the Plans/Pricing page robustly
  const isPricingPage = pathname?.includes('/pricing') ?? false;

  // Calculate if cart is empty
  const isCartEmpty = !state.selectedPlan && (!state.items || state.items.length === 0);

  useEffect(() => {
    // Only trigger drawer logic if cart context is mounted, hydrated, and loaded
    if (isMounted && !isLoading && isPricingPage && !isCartEmpty) {

      const openDrawerWhenReady = () => {
        setIsOpen(true);
      };

      if (document.readyState === 'complete') {
        openDrawerWhenReady();
      } else {
        window.addEventListener('load', openDrawerWhenReady);
        return () => window.removeEventListener('load', openDrawerWhenReady);
      }

    } else if (isMounted && (!isPricingPage || isCartEmpty)) {
      setIsOpen(false);
    }
  }, [isMounted, isLoading, isPricingPage, isCartEmpty]);

  if (!isMounted || isLoading) {
    return null;
  }

  const handleResume = () => {
    if (state.selectedPlan?.stripeProductId) {
      router.push(`/checkout/hardware?product_id=${state.selectedPlan.stripeProductId}`);
    } else {
      router.push('/checkout/hardware');
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    clearCart();
    setIsOpen(false);
  };

  let summaryText = "";
  if (state.selectedPlan) {
    summaryText = `Plano ${state.selectedPlan.name}`;
    if (state.items && state.items.length > 0) {
      const itemCount = state.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
      summaryText += ` + ${itemCount} ${itemCount === 1 ? 'Produto' : 'Produtos'}`;
    }
  } else if (state.items && state.items.length > 0) {
    const itemCount = state.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    summaryText += `${itemCount} ${itemCount === 1 ? 'Produto' : 'Produtos'}`;
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerContent className="sm:max-w-[425px]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Carrinho Ativo
          </DrawerTitle>
          <DrawerDescription className="pt-2 text-base">
            Você tem itens não finalizados no seu carrinho. Deseja retomar a compra?
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 pb-0">
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="font-medium text-sm text-muted-foreground">Resumo:</p>
            <p className="text-primary mt-1 font-medium">{summaryText}</p>
          </div>
        </div>

        <DrawerFooter className="pt-6">
          <Button onClick={handleResume} size="lg" className="w-full">
            Retomar Compra
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            size="lg"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive"
          >
            Limpar Carrinho
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
