import React from 'react';
import { Calendar, Clock, ArrowRight, Heart, Shield, Thermometer, Stethoscope, User, Eye } from 'lucide-react';
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
  // If an article is selected, show the full article
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
      views: 245
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
      views: 189
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
      views: 312
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
      views: 156
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-medium mb-4">
            Conseils santé
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
            Mes <span className="text-gradient">conseils</span> et actualités
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Retrouvez mes conseils professionnels, actualités santé et bonnes pratiques pour prendre soin de vous
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className={`group cursor-pointer ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              onClick={() => onArticleSelect && onArticleSelect(post.id)}
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
                {/* Image */}
                <div className="relative overflow-hidden h-48 md:h-56">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <post.icon className="text-primary mr-2" size={16} />
                      <span className="text-sm font-medium text-gray-800">{post.category}</span>
                    </div>
                  </div>

                  {/* Views */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-2 py-1">
                      <Eye className="text-white mr-1" size={14} />
                      <span className="text-xs font-medium text-white">{post.views}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Meta info */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar size={16} className="mr-2" />
                    <span className="mr-4">{post.date}</span>
                    <Clock size={16} className="mr-2" />
                    <span>{post.readTime} de lecture</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Read more */}
                  <div className="flex items-center text-primary font-medium group-hover:text-blue-600 transition-colors duration-300">
                    <span className="mr-2">Lire la suite</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter signup */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <User className="mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold mb-4">
              Restez informé de mes conseils santé
            </h3>
            <p className="text-blue-100 mb-6">
              Recevez mes derniers articles et conseils directement dans votre boîte mail
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-300 whitespace-nowrap">
                S'abonner
              </button>
            </div>
            <p className="text-xs text-blue-200 mt-3">
              Pas de spam, désinscription possible à tout moment
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;