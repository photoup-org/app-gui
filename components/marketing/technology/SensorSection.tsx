import React from 'react';
import SectionTitleComponent from '../SectionTitleComponent';
import { getFeaturedSensors } from '@/lib/api/products';
import FeaturedSensorsCarousel from './FeaturedSensorsCarousel';

const SensorSection = async () => {
    const featuredSensors = await getFeaturedSensors();

    return (
        <section className="max-w-7xl mx-auto py-24 px-4 w-full flex flex-col items-center">
            <div className="mb-16">
                <SectionTitleComponent
                    title={<h2 className='text-4xl font-bold'>Ecossistema de Sensores <span className='text-[#2DD4BF]'>Inteligentes</span></h2>}
                    subtitle='Monitorize qualquer parâmetro com a nossa gama completa de sensores industriais, perfeitamente integrados com o Edge Gateway'
                />
            </div>

            <FeaturedSensorsCarousel products={featuredSensors} />
        </section>
    );
};

export default SensorSection;