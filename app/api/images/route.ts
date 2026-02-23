import { NextRequest, NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Local fallback images mapping
const LOCAL_IMAGES: Record<string, string> = {
  'turbo': '/parts/turbo.jpg',
  'engine': '/parts/engine.jpg',
  'brake': '/parts/brake.jpg',
  'wheel bearing': '/parts/wheel-bearing.jpg',
  'suspension': '/parts/suspension.jpg',
  'transmission': '/parts/transmission.jpg',
  'alternator': '/parts/alternator.jpg',
  'battery': '/parts/battery.jpg',
  'radiator': '/parts/radiator.jpg',
  'exhaust': '/parts/exhaust.jpg',
};

async function searchWikimedia(part: string) {
  try {
    const searchQuery = `${part} automotive car`;
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=800`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );
    
    const data = await response.json();
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages) as any[];
      if (pages[0]?.imageinfo?.[0]?.thumburl) {
        return pages[0].imageinfo[0].thumburl;
      }
    }
  } catch (error) {
    console.error('Wikimedia API error:', error);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const part = searchParams.get('part')?.toLowerCase() || '';
  
  // Check if we have a local image first
  if (LOCAL_IMAGES[part]) {
    return NextResponse.json({ 
      imageUrl: LOCAL_IMAGES[part],
      source: 'local'
    });
  }
  
  // Try Wikimedia Commons first (free, no API key needed)
  const wikimediaUrl = await searchWikimedia(part);
  if (wikimediaUrl) {
    return NextResponse.json({
      imageUrl: wikimediaUrl,
      source: 'wikimedia',
      attribution: 'Wikimedia Commons'
    });
  }
  
  // Try Unsplash API as fallback
  if (UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key_here') {
    try {
      const query = `car ${part} automotive part`;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return NextResponse.json({
            imageUrl: data.results[0].urls.regular,
            source: 'unsplash',
            attribution: {
              photographer: data.results[0].user.name,
              link: data.results[0].user.links.html
            }
          });
        }
      }
    } catch (error) {
      console.error('Unsplash API error:', error);
    }
  }
  
  // Fallback to placeholder
  return NextResponse.json({
    imageUrl: '/parts/placeholder.jpg',
    source: 'placeholder'
  });
}
