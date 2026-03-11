import { Suspense } from 'react';
import HardwareSelectionClient from './HardwareSelectionClient';

export default function HardwareSelectionPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pb-32">
            <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]">A carregar configuração...</div>}>
                <HardwareSelectionClient />
            </Suspense>
        </div>
    );
}
