
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { School } from '../../types';

const SchoolsList: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await api.get('/schools');
        setSchools(res.data.schools || []);
      } catch (e) {
        // Mock data if backend is not ready
        setSchools([
          { id: 1, slug: 'sunrise-academy', name: 'Sunrise Academy', area: 'Downtown', category: 'International', level: 'K-12', gender_type: 'Mixed', email: 'info@sunrise.com', phone: '123456', address: '123 Main St', president_name: 'John Doe', fees_range: '$5k - $10k', curriculum: 'British' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-secondary mb-4">Find the Best School for Your Child</h1>
        <p className="text-textLight max-w-2xl mx-auto">Discover top-rated educational institutions, read verified parent reviews, and make informed decisions.</p>
        
        <div className="mt-8 max-w-xl mx-auto relative">
          <input 
            type="text"
            placeholder="Search by school name or area..."
            className="w-full pl-12 pr-4 py-4 rounded-full shadow-md border-none focus:ring-2 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textLight">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-secondary rounded-full"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map(school => (
            <div key={school.id} className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition group">
              <div className="h-48 bg-neutral-100 flex items-center justify-center p-4">
                {school.logo ? (
                  <img src={school.logo} alt={school.name} className="max-h-full object-contain" />
                ) : (
                  <div className="text-secondary opacity-10 flex flex-col items-center">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" /></svg>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-textDark group-hover:text-secondary transition">{school.name}</h3>
                  <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded font-medium">{school.level}</span>
                </div>
                <p className="text-textLight text-sm mb-4 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {school.area}
                </p>
                <div className="flex gap-2 mb-6">
                  <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{school.category}</span>
                </div>
                <Link 
                  to={`/schools/${school.slug}`}
                  className="block text-center bg-primary text-secondary font-bold py-2 rounded-md hover:bg-yellow-500 transition"
                >
                  View School
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolsList;
