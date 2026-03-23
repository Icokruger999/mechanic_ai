import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/chat/', '/admin/', '/usage/'] },
    sitemap: 'https://mechanic.codingeverest.com/sitemap.xml',
  };
}
