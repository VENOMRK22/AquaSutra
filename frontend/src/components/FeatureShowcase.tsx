
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  stats: string;
  image: string;
  ctaText: string;
}

interface FeatureShowcaseProps {
  features: Feature[];
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ features }) => {
  return (
    <section className="py-20 px-4 bg-ios-bg overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-24">
        {features.map((feature, index) => {
          const isReversed = index % 2 !== 0;

          return (
            <article 
              key={feature.id} 
              className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
            >
              {/* Visual Side */}
              <div className="w-full lg:w-1/2 relative group">
                {/* Main Image Container */}
                <div className="relative rounded-[2rem] overflow-hidden shadow-ios-lg aspect-[4/3] transform transition-transform duration-700 hover:scale-[1.02]">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Glassmorphism Stats Overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/30 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-lg flex items-center gap-4">
                      <div className="bg-wow-green/90 p-2.5 rounded-xl text-white shadow-sm">
                        <feature.icon size={24} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Impact</p>
                        <p className="text-white font-bold text-lg">{feature.stats}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Blob */}
                <div className={`absolute -z-10 w-64 h-64 bg-wow-green/10 rounded-full blur-3xl -bottom-10 ${isReversed ? '-right-10' : '-left-10'}`} />
              </div>

              {/* Text Side */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-wow-blue/10 rounded-full text-wow-blue text-xs font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-wow-blue animate-pulse"/>
                  Feature {index + 1}
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {feature.title}
                </h3>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                <div className="pt-4">
                  <button className="group flex items-center gap-2 text-wow-green font-bold text-lg hover:gap-4 transition-all duration-300">
                    {feature.ctaText}
                    <span className="bg-wow-green/10 p-2 rounded-full group-hover:bg-wow-green group-hover:text-white transition-colors">
                      <ArrowRight size={20} />
                    </span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default FeatureShowcase;
