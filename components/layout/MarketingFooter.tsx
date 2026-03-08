import Link from 'next/link';
import Image from 'next/image';
import { BrandLogo } from '@/components/resources/logos';

// PHASE 1: TYPES & DATA STRUCTURE
interface FooterLink {
    label: string;
    href: string;
    isEmail?: boolean;
}

interface FooterSectionData {
    title: string;
    links: FooterLink[];
}

interface PartnerLogoType {
    name: string;
    url: string;
}

const footerSections: FooterSectionData[] = [
    {
        title: 'Navegação',
        links: [
            { label: 'Home', href: '/' },
            { label: 'A Nossa Tecnologia', href: '#tecnologia' },
            { label: 'As Nossas Soluções', href: '#solucoes' },
            { label: 'Planos', href: '/pricing' },
        ],
    },
    {
        title: 'Produtos',
        links: [
            { label: 'Sensores Laboratoriais', href: '#laboratoriais' },
            { label: 'Sensores Industriais', href: '#industriais' },
        ],
    },
    {
        title: 'A Empresa',
        links: [
            { label: 'Website', href: 'https://www.photoup.pt' },
            { label: 'Sobre Nós', href: 'https://www.photoup.pt/sobre-nos' },
            { label: 'Serviços', href: 'https://www.photoup.pt/servicos' },
        ],
    },
    {
        title: 'Contactos',
        links: [
            { label: 'Tecminho Ed 11', href: '#' },
            { label: 'Campus Azurém', href: '#' },
            { label: '4800-058 Guimarães', href: '#' },
            { label: 'info@photoup.pt', href: 'info@photoup.pt', isEmail: true },
        ],
    },
];

const partnerLogos: PartnerLogoType[] = [
    { name: 'Tecminho', url: 'https://www.photoup.pt/assets/tecminho.png' },
    { name: 'Cesae', url: 'https://www.photoup.pt/assets/cesae.png' },
    { name: 'BlueBioalliance', url: 'https://www.photoup.pt/assets/bba.png' },
    { name: 'UM Spinoff', url: 'https://www.photoup.pt/assets/spinoff.png' },
];

const legalLinks: FooterLink[] = [
    { label: 'Política de Privacidade', href: '#' },
    { label: 'Termos de Utilização', href: '#' },
    { label: 'Política de Aluguer de Equipamento', href: '#' },
];

// PHASE 2: INTERNAL REUSABLE COMPONENTS
const FooterColumn = ({ section }: { section: FooterSectionData }) => {
    return (
        <div className="flex flex-col">
            <h3 className="text-xl font-bold text-[#2DD4BF] mb-6">{section.title}</h3>
            <ul className="flex flex-col gap-3 text-gray-600 font-medium">
                {section.links.map((link, index) => (
                    <li key={index}>
                        {link.isEmail ? (
                            <a href={`mailto:${link.href}`} className="text-[#2DD4BF] hover:underline transition-colors">
                                {link.label}
                            </a>
                        ) : (
                            <Link href={link.href} className="hover:text-[#2DD4BF] transition-colors">
                                {link.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const PartnerLogos = ({ logos }: { logos: PartnerLogoType[] }) => {
    return (
        <div className="flex flex-wrap justify-center items-center gap-8 mt-16">
            {logos.map((logo, index) => (
                <Image
                    key={index}
                    src={logo.url}
                    alt={logo.name}
                    width={120}
                    height={40}
                    className="h-8 md:h-10 w-auto object-contain transition-all duration-300 filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 dark:brightness-200 dark:opacity-40 dark:hover:brightness-100 dark:hover:opacity-100"
                />
            ))}
        </div>
    );
};

// PHASE 3: MAIN LAYOUT ARCHITECTURE
const MarketingFooter = () => {
    return (
        <footer className="container mx-auto flex flex-col py-20 px-4 w-full">
            {/* Layer 1: Brand Header */}
            <div className="mb-6 flex items-start">
                <BrandLogo width={160} height={37} />
            </div>

            {/* Layer 2: The Main Outlined Card */}
            <div className="border border-custom rounded-[2rem] p-8 lg:p-12 mb-8 bg-white ">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {footerSections.map((section, index) => (
                        <FooterColumn key={index} section={section} />
                    ))}
                </div>
                <PartnerLogos logos={partnerLogos} />
            </div>

            {/* Layer 3: The Sub-Footer (Legal) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
                <div>&copy; Copyright da PhotoUP. Todos os direitos reservados.</div>
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {legalLinks.map((link, index) => (
                        <Link key={index} href={link.href} className="hover:text-gray-900 transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default MarketingFooter;