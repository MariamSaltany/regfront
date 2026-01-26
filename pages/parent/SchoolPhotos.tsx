
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Photo {
  id: number;
  url: string;
  thumb: string;
  name: string;
}

const SchoolPhotos: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await api.get(`/schools/${slug}/photos`);
        setPhotos(res.data.photos || []);
      } catch (e) {
        console.error('Failed to fetch photos', e);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [slug]);

  if (loading) {
    return <div className="text-center py-20">Loading photos...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <button onClick={() => navigate(-1)} className="text-secondary mb-2 flex items-center gap-1 hover:underline">&larr; Back to Profile</button>
          <h1 className="text-3xl font-bold text-secondary capitalize">{slug?.replace('-', ' ')} Photo Gallery</h1>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-20 text-textLight">No photos available.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map(photo => (
            <div key={photo.id} className="aspect-square bg-neutral-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group">
              <img 
                src={photo.url} 
                alt={photo.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolPhotos;
