import { ShoppingCart } from 'lucide-react'

const IncludedFeaturesSummary = ({ totalBaseSelected, includedSensors, maxSensors }: { totalBaseSelected: number, includedSensors: number, maxSensors: number }) => {

    return (
        <div className="flex gap-2 shrink-0 w-full border border-border rounded-2xl px-7 p-6 justify-between">
            <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold">
                    O que já está incluído no seu plano
                </p>
                <ul className="marker:text-primary">
                    <li className='list-disc ml-5 text-muted-foreground'>1x Gateway Teltonika TRB142 (GW-TRB142)</li>
                    <li className='list-disc ml-5 text-muted-foreground'> {includedSensors}x Sensores-Base incluídos</li>
                </ul>
            </div>
            <div className="flex flex-col gap-2">
                <div className="border border-border p-5 rounded-3xl flex items-center gap-4 ">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <ShoppingCart size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Sensores-Base Atribuídos</p>
                        <p className="text-3xl text-foreground font-bold leading-none">
                            <span className={totalBaseSelected > includedSensors ? "text-destructive" : ""}>{totalBaseSelected}</span>
                            <span className="text-muted-foreground text-xl font-medium"> / {includedSensors}</span>
                        </p>
                    </div>
                </div>
                {maxSensors < Infinity && (
                    <div className="text-sm font-medium text-destructive text-right pr-2">
                        Limite global de {maxSensors} sensores.
                    </div>
                )}
            </div>
        </div>
    )
}

export default IncludedFeaturesSummary