import React from 'react';
import { Calendar, Clock, ArrowRight, Heart, Shield, Thermometer, Stethoscope, Eye } from 'lucide-react';
import BlogArticle from './BlogArticle';

interface BlogSectionProps {
  selectedArticle?: string;
  onArticleSelect?: (articleId: string) => void;
  onBackToBlog?: () => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({
  selectedArticle,
  onArticleSelect,
  onBackToBlog
}) => {
  if (selectedArticle && onBackToBlog) {
    return <BlogArticle articleId={selectedArticle} onBack={onBackToBlog} />;
  }

  const blogPosts = [
    {
      id: 'suivi-seniors',
      title: "L'importance du suivi médical à domicile pour les personnes âgées",
      excerpt: "Découvrez pourquoi les soins à domicile sont essentiels pour maintenir l'autonomie et le bien-être des seniors, et comment ils peuvent prévenir les hospitalisations.",
      image: "https://images.pexels.com/photos/7551667/pexels-photo-7551667.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      date: "15 Janvier 2025",
      readTime: "5 min",
      category: "Soins aux seniors",
      icon: Heart,
      views: 245,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50"
    },
    {
      id: 'prevention-infections',
      title: "Prévention des infections : bonnes pratiques d'hygiène à domicile",
      excerpt: "Les gestes essentiels pour maintenir un environnement sain lors des soins à domicile et prévenir les risques d'infection.",
      image: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      date: "10 Janvier 2025",
      readTime: "4 min",
      category: "Prévention",
      icon: Shield,
      views: 189,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50"
    },
    {
      id: 'surveillance-glycemie',
      title: "Surveillance de la glycémie : conseils pratiques pour les diabétiques",
      excerpt: "Comment bien surveiller sa glycémie à domicile, interpréter les résultats et adapter son mode de vie pour un meilleur contrôle du diabète.",
      image: "https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      date: "5 Janvier 2025",
      readTime: "6 min",
      category: "Diabète",
      icon: Thermometer,
      views: 312,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50"
    },
    {
      id: 'post-operatoire',
      title: "Post-opératoire : optimiser sa récupération à domicile",
      excerpt: "Les étapes clés pour une convalescence réussie après une intervention chirurgicale, avec des conseils pratiques pour accélérer la guérison.",
      image: "https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      date: "28 Décembre 2024",
      readTime: "7 min",
      category: "Post-opératoire",
      icon: Stethoscope,
      views: 156,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50"
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-sm font-medium mb-5">
            Conseils santé
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 font-heading leading-tight">
            Mes <span className="text-teal-700">conseils</span> et actualités
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Retrouvez mes conseils professionnels, actualités santé et bonnes pratiques pour prendre soin de vous
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className="group cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
              onClick={() => onArticleSelect && onArticleSelect(post.id)}
            >
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-1 h-full">
                {/* Image */}
                <div className="relative overflow-hidden h-48 sm:h-52">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <div className={`flex items-center ${post.iconBg} backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20`}>
                      <post.icon className={`${post.iconColor} mr-1.5`} size={14} />
                      <span className="text-xs font-medium text-gray-800">{post.category}</span>
                    </div>
                  </div>

                  {/* Views */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <Eye className="text-gray-500 mr-1" size={12} />
                      <span className="text-xs font-medium text-gray-600">{post.views}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  {/* Meta info */}
                  <div className="flex items-center text-xs text-gray-400 mb-3 gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors duration-300 line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Read more */}
                  <div className="flex items-center text-teal-600 font-semibold text-sm group-hover:text-teal-700 transition-colors duration-300">
                    Lire la suite
                    <ArrowRight size={15} className="ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
          <div className="max-w-xl mx-auto relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Restez informé de mes conseils santé
            </h3>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              Recevez mes derniers articles et conseils directement dans votre boîte mail
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
              <button type="button" className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all duration-300 whitespace-nowrap">
                S'abonner
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Pas de spam, désinscription possible à tout moment
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
