"use client";

import { setLabProfile } from "@/actions/onboarding";
import { LabProfile } from "@prisma/client";
import { useState } from "react";
import { BrandLogo } from "../resources/logos";
import { Factory, Microscope } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export function WelcomeScreen() {
    const [isPending, setIsPending] = useState(false);

    const handleSelect = async (profile: LabProfile) => {
        setIsPending(true);
        try {
            await setLabProfile(profile);
        } catch (error) {
            console.error("Failed to set lab profile:", error);
            setIsPending(false);
        }
    };

    return (<div className="flex flex-col items-center py-10 px-24">
        <BrandLogo className="shrink-0" width={215} height={50} />
        <div className="flex flex-col items-center space-y-8 mt-15">
            <h1 className="text-2xl md:text-5xl font-bold text-center">🚀 Bem-vindo à PhotoUP</h1>
            <h5 className="text-sm md:text-lg max-w-2xl text-center text-muted-foreground/50">Obrigado por nos escolher. Estamos entusiasmados por ajudá-lo a modernizar os seus processos. O seu equipamento está a ser preparado. Vamos usar este tempo para definir o seu primeiro ambiente de monitorização.</h5>
            <div className="space-y-3 text-center">
                <h5 className="text-md md:text-lg max-w-2xl text-center font-bold">Como planeia utilizar a nossa plataforma?</h5>
                <p className="text-sm md:text-md text-muted-foreground/50">Escolha uma opção para prosseguir</p>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-5 md:space-y-0 md:space-x-10 w-full">
                <ProfileTypeCard
                    icon={<Factory />}
                    title="Monitorização Contínua"
                    features={[
                        {
                            title: "Monitorização 24/7",
                            description: "Visualização de dados ininterrupta para processos que nunca param"
                        },
                        {
                            title: "Estabilidade Global",
                            description: "Métricas desenhadas para avaliar a \"saúde\" geral de toda a instalação."
                        },
                        {
                            title: "Encaminhamento de Alertas",
                            description: "Direcione notificações críticas de forma inteligente."
                        }
                    ]}
                    onClick={() => { handleSelect("CONTINUOUS") }}
                    textColor="text-primary"
                    bgColor="bg-primary-bg"
                />
                <ProfileTypeCard
                    icon={<Microscope />}
                    title="Projetos e Experiências"
                    features={[
                        {
                            title: "Controlo Orientado a Projetos",
                            description: "Experiências isoladas com controlo total sobre a recolha de dados."
                        },
                        {
                            title: "Acesso a Logs Completos",
                            description: "Registo imutável de todas as intervenções e anomalias ocorridas."
                        },
                        {
                            title: "Anotações Colaborativas",
                            description: "Permita que vários investigadores registem observações e intervenções."
                        }
                    ]}
                    onClick={() => { handleSelect("PROJECTS") }}
                    textColor="text-info"
                    bgColor="bg-info-bg"
                />
            </div>
            <p className="text-muted-foreground/50 max-w-3xl text-center">Não se preocupe, pode sempre adicionar monitorizações contínuas ou projetos à sua conta, independentemente do perfil que escolhe agora.</p>
        </div>
    </div>
    );
}

type TProfielFeatures = {
    title: string;
    description: string;
}

type TProfileTypeCardProps = {
    icon: React.ReactNode;
    title: string;
    features: TProfielFeatures[];
    onClick: () => void;
    textColor: "text-primary" | "text-info"
    bgColor: "bg-primary-bg" | "bg-info-bg"

}

const ProfileTypeCard = ({ icon, title, features, onClick, textColor, bgColor }: TProfileTypeCardProps) => {
    return (
        <div onClick={onClick} className="w-72 flex flex-col gap-3 border border-border rounded-xl p-4 cursor-pointer">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", bgColor)}>
                {icon}
            </div>
            <h3 className="font-bold text-lg">{title}</h3>
            {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                    <div className="bg-primary w-2 h-2 mt-2 shrink-0 rounded-full"></div>
                    <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-bold">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground/70">{feature.description}</p>
                    </div>
                </div>
            ))}
            <Button onClick={onClick} className={cn("mt-5 w-full", bgColor, textColor)}>Selecionar Perfil</Button>
        </div>
    )
}
