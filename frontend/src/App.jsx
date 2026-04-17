import React, { useState, useEffect } from 'react';

// --- Components ---

function MothCard({ moth, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="moth-card" 
      onClick={() => onClick(moth.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <div className="moth-image-container">
        {moth.image_url ? (
          <img src={moth.image_url} alt={moth.common_name} className="moth-image" />
        ) : (
          <div style={{width: '100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#000'}}>No Image</div>
        )}
      </div>
      <div className="moth-content">
        <div className="moth-family">{moth.family_name}</div>
        <h3 className="moth-title">{moth.common_name}</h3>
        <div className="moth-scientific">{moth.scientific_name}</div>
        <p className="moth-desc" style={{ marginBottom: '1.5rem' }}>{moth.description}</p>
        
        <div style={{ 
            position: 'absolute', 
            bottom: '1rem', 
            right: '1.5rem', 
            color: 'var(--accent-color)', 
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
            opacity: isHovered ? 1 : 0,
            fontSize: '1.25rem'
        }}>
          ➔
        </div>
      </div>
    </div>
  );
}

function MothList({ onSelect }) {
  const [moths, setMoths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMoths();
  }, []);

  const fetchMoths = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const url = query ? `/search?query=${encodeURIComponent(query)}` : '/moths';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setMoths(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMoths(search);
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by name or family..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', color: '#ef4444', padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Something went wrong</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && moths.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--card-border)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>🐛</div>
          <p style={{ fontSize: '1.1rem' }}>No moths found.</p>
        </div>
      )}

      {!loading && !error && moths.length > 0 && (
        <div className="grid">
          {moths.map((moth) => (
            <MothCard 
              key={moth.id} 
              moth={moth} 
              onClick={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MothForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    common_name: '',
    scientific_name: '',
    family_name: '',
    image_url: '',
    description: '',
    damage_caused: '',
    link: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/moths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          distributions: []
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to submit moth data');
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.5s ease-out' }}>
      <button 
        onClick={onCancel} 
        style={{ 
          marginBottom: '2rem', 
          background: 'var(--card-bg)', 
          color: 'var(--accent-color)', 
          border: '1px solid var(--card-border)', 
          padding: '0.6rem 1.2rem',
          borderRadius: '0.5rem',
          cursor: 'pointer', 
          fontSize: '1rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s ease',
          fontWeight: '500'
        }}
      >
        ← Back to list
      </button>

      <div style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--card-border)', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Add New Moth Entry</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', border: '1px solid #ef4444', borderRadius: '8px' }}>{error}</div>}
        <form onSubmit={handleSubmit} className="moth-form">
          <div className="form-group">
            <label>Common Name *</label>
            <input type="text" name="common_name" required value={formData.common_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Scientific Name *</label>
            <input type="text" name="scientific_name" required value={formData.scientific_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Family Name *</label>
            <input type="text" name="family_name" required value={formData.family_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Reported Damage / Impact</label>
            <textarea name="damage_caused" rows="2" value={formData.damage_caused} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Reference Link</label>
            <input type="url" name="link" value={formData.link} onChange={handleChange} />
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Submitting...' : 'Submit Entry'}
            </button>
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MothDetail({ id, onBack }) {
  const [moth, setMoth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMoth = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/moths/${id}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setMoth(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMoth();
  }, [id]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !moth) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <button onClick={onBack} style={{ marginBottom: '1rem', background: 'transparent', color: 'var(--accent-color)', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>← Back to list</button>
        <div style={{ color: '#ef4444', background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px' }}>Error loading moth details: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeUp 0.5s ease-out' }}>
      <button 
        onClick={onBack} 
        style={{ 
          marginBottom: '2rem', 
          background: 'var(--card-bg)', 
          color: 'var(--accent-color)', 
          border: '1px solid var(--card-border)', 
          padding: '0.6rem 1.2rem',
          borderRadius: '0.5rem',
          cursor: 'pointer', 
          fontSize: '1rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s ease',
          fontWeight: '500'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-color)';
          e.currentTarget.style.borderColor = 'var(--accent-color)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--card-bg)';
          e.currentTarget.style.borderColor = 'var(--card-border)';
        }}
      >
        ← Back to list
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header Profile Section */}
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 350px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--card-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            {moth.image_url ? (
              <img src={moth.image_url} alt={moth.common_name} style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)' }}>No Image Available</div>
            )}
          </div>
          <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="moth-family" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{moth.family_name}</div>
            <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: 'var(--accent-color)', lineHeight: '1.2' }}>{moth.common_name}</h2>
            <div className="moth-scientific" style={{ fontSize: '1.3rem', marginBottom: '2rem' }}>{moth.scientific_name}</div>
            
            {moth.link && (
              <a 
                href={moth.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: '#fff', 
                  background: 'var(--accent-color)', 
                  padding: '0.8rem 1.5rem', 
                  borderRadius: '0.5rem', 
                  textDecoration: 'none', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontWeight: 'bold',
                  width: 'fit-content',
                  transition: 'background 0.2s ease, transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,212,170,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                View on Moths of India ↗
              </a>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
          
          {/* Section 1: Description */}
          <div style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-color)' }}>○</span> Description
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.05rem' }}>{moth.description}</p>
          </div>

          {/* Section 2: Distribution & ImageDisplay (Placeholder for layout) */}
          <div style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-color)' }}>○</span> Distribution
            </h3>
            {moth.distributions && moth.distributions.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {moth.distributions.map((dist, idx) => (
                  <li key={idx} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: idx !== moth.distributions.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                    <div style={{ color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.6' }}>{dist.description}</div>
                    {dist.distribution_file_url && (
                      <div style={{ marginTop: '1rem' }}>
                         <a href={dist.distribution_file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--accent-color)', textDecoration: 'none', padding: '0.5rem 1rem', border: '1px dashed var(--accent-color)', borderRadius: '0.5rem', display: 'inline-block' }}>
                           📷 View Map Source
                         </a>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No distribution data available.</p>
            )}
          </div>

          {/* Section 3: Impact */}
          <div style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-color)' }}>○</span> Impact
            </h3>
            {moth.damage_caused ? (
              <div>
                <p style={{ color: '#fb923c', fontWeight: '500', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Reported Damage:</p>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.05rem' }}>{moth.damage_caused}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '100px' }}>
                 <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>No known agricultural or foliage damage reported.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---

function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <header className="sticky-header">
        <h1 
          style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} 
          onClick={() => { setSelectedId(null); setShowForm(false); }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.transform = 'scale(1.02)';
          }} 
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--accent-color)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span style={{ marginRight: '0.5rem' }}>🦋</span> 
          Moths Database
        </h1>
        <button 
          className="add-moth-btn"
          onClick={() => { setSelectedId(null); setShowForm(true); }}
        >
          + Add New Entry
        </button>
      </header>

      <main className="main-content">
        {showForm ? (
          <MothForm 
            onSuccess={() => setShowForm(false)} 
            onCancel={() => setShowForm(false)} 
          />
        ) : selectedId ? (
          <MothDetail id={selectedId} onBack={() => setSelectedId(null)} />
        ) : (
          <MothList onSelect={(id) => setSelectedId(id)} />
        )}
      </main>
    </>
  );
}

export default App;
