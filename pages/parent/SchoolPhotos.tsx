
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SchoolPhotos: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <button onClick={() => navigate(-1)} className="text-secondary mb-2 flex items-center gap-1 hover:underline">&larr; Back to Profile</button>
          <h1 className="text-3xl font-bold text-secondary capitalize">{slug?.replace('-', ' ')} Photo Gallery</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="aspect-square bg-neutral-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group">
            <img 
              src={`https://picsum.photos/seed/${slug}${i}/800/800`} 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              alt="School environment"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolPhotos;
