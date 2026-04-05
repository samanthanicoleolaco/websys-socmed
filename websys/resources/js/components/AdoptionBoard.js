import React, { useState, useMemo, useEffect, useCallback } from 'react';
import '../../sass/feed.scss';
import '../../sass/adoption.scss';
import Sidebar from './Sidebar';

const Icons = {
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    Plus: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    Bell: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    Filter: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
    MapPin: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    Clock: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Heart: ({ filled }) => <svg width="20" height="20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
    Share: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
    Flag: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>,
    Shield: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    ChevronDown: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>,
    ChevronRight: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>,
    CheckSmall: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>,
    Neuter: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><line x1="5" y1="5" x2="19" y2="19" /></svg>,
    X: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    RotateCcw: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
};

async function reverseGeocode(lat, lon) {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&language=en`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        const r = data.results && data.results[0];
        if (!r) throw new Error('No location found');
        const city = r.name || '';
        const region = r.admin1 || r.country || '';
        if (city && region) return `${city}, ${region}`;
        if (city) return city;
        if (region) return region;
        return null;
    } catch (err) {
        console.error('reverseGeocode error:', err);
        return null;
    }
}

async function sharePetListing(pet) {
    const url = `${window.location.origin}/adoption#pet-${pet.id}`;
    const title = 'Share on Pawtastic';
    const text = `Meet ${pet.name} — ${pet.breed} on Pawtastic Adoption`;

    if (navigator.share) {
        try {
            await navigator.share({ title, text, url });
            return;
        } catch (e) {
            if (e.name === 'AbortError') return;
        }
    }
    try {
        await navigator.clipboard.writeText(url);
        window.alert('Link copied to clipboard.');
    } catch {
        window.prompt('Copy this link:', url);
    }
}

async function contactRescue(pet, setContactPet, e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    setContactPet(pet);
}

const urgentPets = [
    {
        id: 'u1',
        name: 'Barnaby',
        breed: 'Golden Retriever Mix',
        age: 'Young',
        distance: '2.5 mi away',
        photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80',
        vaccinated: true,
        neutered: true,
        location: 'San Francisco, CA',
        rescueEmail: 'goldenrescue@pawtastic.test'
    },
    {
        id: 'u2',
        name: 'Nova',
        breed: 'Siberian Husky',
        age: 'Young',
        distance: '5.1 mi away',
        photo: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&q=80',
        vaccinated: true,
        neutered: true,
        location: 'Oakland, CA',
        rescueEmail: 'northernbarks@pawtastic.test'
    }
];

const recommendedPets = [
    { id: 'r1', name: 'Cooper', breed: 'Beagle', age: 'Adult', distance: '3.2 mi away', location: 'San Mateo, CA', photo: 'https://images.unsplash.com/photo-1505628346881-72b27e092310?w=600&q=80', vaccinated: true, neutered: true, rescueEmail: 'cooperhounds@pawtastic.test' },
    { id: 'r2', name: 'Daisy', breed: 'Corgi', age: 'Young', distance: '4.0 mi away', location: 'Palo Alto, CA', photo: 'https://images.unsplash.com/photo-1612536846250-b2fb6a54bb4e?w=600&q=80', vaccinated: true, neutered: false, rescueEmail: 'shortlegs@pawtastic.test' },
    { id: 'r3', name: 'Milo', breed: 'Tabby Cat', age: 'Adult', distance: '1.8 mi away', location: 'Berkeley, CA', photo: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600&q=80', vaccinated: true, neutered: true, rescueEmail: 'whiskers@pawtastic.test' },
    { id: 'r4', name: 'Oliver', breed: 'British Shorthair', age: 'Senior', distance: '6.2 mi away', location: 'San Bruno, CA', photo: 'https://images.unsplash.com/photo-1573865526739-10ad626bb6de?w=600&q=80', vaccinated: true, neutered: true, rescueEmail: 'britishpaws@pawtastic.test' }
];

const AdoptionBoard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const [species, setSpecies] = useState({ dogs: true, cats: false, birds: false, others: false });
    const [ageGroup, setAgeGroup] = useState({ puppy: false, young: true, adult: false, senior: false });
    const [distance, setDistance] = useState(50);
    const [breedsOpen, setBreedsOpen] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [favorites, setFavorites] = useState({});
    const [page, setPage] = useState(1);
    const totalPages = 12;

    const [locationInput, setLocationInput] = useState('');
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    const [shelterOpen, setShelterOpen] = useState(false);
    const [shelterForm, setShelterForm] = useState({
        organization_name: '',
        contact_email: '',
        contact_phone: '',
        message: ''
    });
    const [shelterSubmitting, setShelterSubmitting] = useState(false);

    const [reportDetails, setReportDetails] = useState('');
    const [reportReason, setReportReason] = useState('misleading');
    const [reportPet, setReportPet] = useState(null);
    const [reportSubmitting, setReportSubmitting] = useState(false);

    const [contactPet, setContactPet] = useState(null);
    const [contactMessage, setContactMessage] = useState('');
    const [contactSubmitting, setContactSubmitting] = useState(false);

    const detectLocation = useCallback(async (forced = false) => {
        // Load saved location first
        const saved = localStorage.getItem('pawtastic_user_location');
        if (saved && !forced) {
            setLocationInput(saved);
            return;
        }

        setIsDetectingLocation(true);

        if (!navigator.geolocation) {
            setLocationInput('Location not supported');
            setIsDetectingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const label = await reverseGeocode(latitude, longitude);
                const finalLabel = label || 'My Location';
                setLocationInput(finalLabel);
                localStorage.setItem('pawtastic_user_location', finalLabel);
                setIsDetectingLocation(false);
            },
            (err) => {
                console.error('Geolocation error:', err.message);
                // If it's a timeout or denial, don't block the user
                if (!locationInput || locationInput === 'Locating...') {
                    setLocationInput(''); 
                }
                setIsDetectingLocation(false);
            },
            { enableHighAccuracy: false, timeout: 1500, maximumAge: 3600000 }
        );
    }, [locationInput]);

    useEffect(() => {
        // Only auto-detect if we don't have a saved one
        const saved = localStorage.getItem('pawtastic_user_location');
        if (!saved) {
            const timer = setTimeout(() => {
                detectLocation();
            }, 600);
            return () => clearTimeout(timer);
        } else {
            setLocationInput(saved);
        }
    }, [detectLocation]);

    const toggleFavorite = (id) => {
        setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSpecies({ dogs: false, cats: false, birds: false, others: false });
        setAgeGroup({ puppy: false, young: false, adult: false, senior: false });
        setDistance(100);
        setSortBy('newest');
        setLocationInput('');
    };

    const toggleSpecies = (key) => {
        setSpecies((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleAge = (key) => {
        setAgeGroup((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const pageNumbers = useMemo(() => {
        const nums = [];
        for (let i = 1; i <= totalPages; i++) nums.push(i);
        return nums;
    }, []);

    const submitShelter = async (e) => {
        e.preventDefault();
        setShelterSubmitting(true);
        try {
            await window.axios.post('/api/shelter-registration', shelterForm);
            window.alert('Thanks! Our team will email you within 2–3 business days to verify your shelter.');
            setShelterOpen(false);
            setShelterForm({ organization_name: '', contact_email: '', contact_phone: '', message: '' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Please check your details and try again.';
            window.alert(msg);
        } finally {
            setShelterSubmitting(false);
        }
    };

    const submitReport = async (e) => {
        e.preventDefault();
        if (!reportPet) return;
        setReportSubmitting(true);
        try {
            await window.axios.post('/api/adoption-reports', {
                listing_id: reportPet.id,
                pet_name: reportPet.name,
                reason: reportReason,
                details: reportDetails || null
            });
            window.alert('Thank you. Our safety team will review this listing.');
            setReportPet(null);
            setReportDetails('');
            setReportReason('misleading');
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not submit report. Try again later.';
            window.alert(msg);
        } finally {
            setReportSubmitting(false);
        }
    };
    const submitContact = async (e) => {
        e.preventDefault();
        if (!contactPet) return;
        setContactSubmitting(true);
        try {
            // Mock API call to simulate sending message
            await new Promise(r => setTimeout(r, 1000));
            window.alert(`Your message for ${contactPet.name} has been sent! The rescue team will get back to you soon.`);
            setContactPet(null);
            setContactMessage('');
        } catch (err) {
            window.alert('Failed to send message. Please try again.');
        } finally {
            setContactSubmitting(false);
        }
    };

    const PetCard = ({ pet, urgent = false, compact = false }) => (
        <article className={`pet-card ${urgent ? 'urgent-card' : ''} ${compact ? 'compact' : ''}`}>
            <div className="pet-card-image">
                <img src={pet.photo} alt={pet.name} loading="lazy" />
                {urgent && (
                    <div className="pet-card-tags">
                        <span className="tag-urgent">URGENT</span>
                        <span className="tag-distance">{pet.distance}</span>
                    </div>
                )}
                {!urgent && (
                    <div className="pet-card-tags">
                        <span className="tag-distance">{pet.distance}</span>
                    </div>
                )}
                <button
                    type="button"
                    className={`btn-favorite ${favorites[pet.id] ? 'active' : ''}`}
                    onClick={() => toggleFavorite(pet.id)}
                    aria-label="Save pet"
                >
                    <Icons.Heart filled={!!favorites[pet.id]} />
                </button>
            </div>
            <div className="pet-card-body">
                <h3>{pet.name}</h3>
                <div className="pet-meta">
                    {pet.breed} · {pet.location}
                </div>
                <div className="pet-badges-row">
                    {pet.vaccinated && (
                        <span><Icons.CheckSmall /> Vaccinated</span>
                    )}
                    {pet.neutered && (
                        <span><Icons.Neuter /> Neutered</span>
                    )}
                </div>
                <div className="pet-actions">
                    <button type="button" className="btn-contact" onClick={(e) => contactRescue(pet, setContactPet, e)}>Contact Rescue</button>
                    <button type="button" className="icon-action" aria-label="Share" onClick={() => sharePetListing(pet)}><Icons.Share /></button>
                    <button type="button" className="icon-action" aria-label="Report" onClick={() => setReportPet(pet)}><Icons.Flag /></button>
                </div>
            </div>
        </article>
    );

    return (
        <div className="pawtastic-feed">
            <Sidebar brandText="Pawtastic" />

            <main className="main-content">
                <header className="top-nav">
                    <div className={`search-bar ${searchActive ? 'active' : ''}`}>
                        <span className="search-icon"><Icons.Search /></span>
                        <input
                            type="text"
                            placeholder="Search pets ...."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchActive(true)}
                            onBlur={() => setSearchActive(false)}
                        />
                    </div>
                    <div className="header-actions">
                        <button type="button" className="icon-btn" title="Create Post"><Icons.Plus /></button>
                        <button type="button" className="icon-btn" title="Notifications"><Icons.Bell /></button>
                        <img src="/images/avatar_dog.png" alt="" className="user-avatar" />
                    </div>
                </header>

                <div className="adoption-page-scroll">
                    <div className="adoption-page">
                        <div className="adoption-hero">
                            <div className="hero-text">
                                <h1>Find Your New Best Friend</h1>
                                <p>Over 1,200 pets near you are waiting for a loving home.</p>
                            </div>
                            <div className="hero-actions">
                                <div className="location-input-wrapper">
                                    <Icons.MapPin />
                                    <input
                                        type="text"
                                        className="location-input"
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        placeholder="Enter city or zip code..."
                                    />
                                    <button
                                        type="button"
                                        className={`btn-detect-location ${isDetectingLocation ? 'loading' : ''}`}
                                        onClick={() => detectLocation(true)}
                                        disabled={isDetectingLocation}
                                        title="Auto-detect your location"
                                    >
                                        <Icons.RotateCcw />
                                    </button>
                                </div>
                                <button type="button" className="btn-shelter" onClick={() => setShelterOpen(true)}>Register as Shelter</button>
                            </div>
                        </div>

                        <div className="adoption-body">
                            <aside className="adoption-filters" aria-label="Search filters">
                                <h2 className="filters-title">
                                    <Icons.Filter />
                                    Filters
                                </h2>

                                <div className="filter-block">
                                    <h4>Species</h4>
                                    <label className="filter-check">
                                        <input type="checkbox" checked={species.dogs} onChange={() => toggleSpecies('dogs')} />
                                        Dogs
                                    </label>
                                    <label className="filter-check">
                                        <input type="checkbox" checked={species.cats} onChange={() => toggleSpecies('cats')} />
                                        Cats
                                    </label>
                                    <label className="filter-check">
                                        <input type="checkbox" checked={species.birds} onChange={() => toggleSpecies('birds')} />
                                        Birds
                                    </label>
                                    <label className="filter-check">
                                        <input type="checkbox" checked={species.others} onChange={() => toggleSpecies('others')} />
                                        Others
                                    </label>
                                </div>

                                <div className="filter-block">
                                    <h4>Age Group</h4>
                                    <label className="filter-check">
                                        <input type="checkbox" checked={ageGroup.puppy} onChange={() => toggleAge('puppy')} />
                                        Puppy / Kitten
                                    </label>
                                    <label className="filter-check">
                                        <input type="checkbox" checked={ageGroup.young} onChange={() => toggleAge('young')} />
                                        Young
                                    </label>
                                    <label className="filter-check">
                                        <input type="checkbox" checked={ageGroup.adult} onChange={() => toggleAge('adult')} />
                                        Adult
                                    </label>
                                    <label className="filter-check">
                                        <input type="checkbox" checked={ageGroup.senior} onChange={() => toggleAge('senior')} />
                                        Senior
                                    </label>
                                </div>

                                <div className="filter-block">
                                    <h4>Distance (miles)</h4>
                                    <div className="distance-slider">
                                        <div className="slider-labels">
                                            <span>0 mi</span>
                                            <span>100 mi</span>
                                        </div>
                                        <div className="distance-slider-wrap" style={{ '--pct': `${distance}%` }}>
                                            <div className="distance-slider-track" aria-hidden />
                                            <input
                                                type="range"
                                                className="distance-slider-input"
                                                min="0"
                                                max="100"
                                                value={distance}
                                                onChange={(e) => setDistance(Number(e.target.value))}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-valuenow={distance}
                                                aria-label="Maximum distance in miles"
                                            />
                                        </div>
                                        <div className="distance-value">{distance} mi</div>
                                    </div>
                                </div>

                                <div className="filter-block">
                                    <button
                                        type="button"
                                        className={`breeds-toggle ${breedsOpen ? 'open' : ''}`}
                                        onClick={() => setBreedsOpen(!breedsOpen)}
                                    >
                                        Common Breeds
                                        <Icons.ChevronDown />
                                    </button>
                                    {breedsOpen && (
                                        <div className="breeds-panel">
                                            Filter by popular breeds: Labrador, Golden Retriever, Siamese, Persian, and more — coming soon with live data.
                                        </div>
                                    )}
                                </div>

                                <button type="button" className="btn-reset-filters" onClick={resetFilters}>
                                    Reset All Filters
                                </button>
                            </aside>

                            <div className="adoption-main">
                                <section aria-labelledby="urgent-heading">
                                    <div className="section-head">
                                        <div className="section-head-left">
                                            <Icons.Clock />
                                            <h2 id="urgent-heading">Urgent Adoptions</h2>
                                        </div>
                                        <button type="button" className="section-link">
                                            View All Urgent <Icons.ChevronRight />
                                        </button>
                                    </div>
                                    <div className="urgent-grid">
                                        {urgentPets.map((pet) => (
                                            <PetCard key={pet.id} pet={pet} urgent />
                                        ))}
                                    </div>
                                </section>

                                <section aria-labelledby="recommended-heading">
                                    <div className="section-head">
                                        <h2 id="recommended-heading">Recommended for You</h2>
                                        <div className="sort-row">
                                            <span>Sort by:</span>
                                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                                <option value="newest">Newest Arrivals</option>
                                                <option value="distance">Nearest</option>
                                                <option value="name">Name</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="recommended-grid">
                                        {recommendedPets.map((pet) => (
                                            <PetCard key={pet.id} pet={pet} compact />
                                        ))}
                                    </div>
                                </section>

                                <nav className="adoption-pagination" aria-label="Pagination">
                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </button>
                                    {pageNumbers.map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            className={page === n ? 'active' : ''}
                                            onClick={() => setPage(n)}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    >
                                        Next
                                    </button>
                                </nav>

                                <div className="safety-banner">
                                    <div className="safety-left">
                                        <div className="safety-icon">
                                            <Icons.Shield />
                                        </div>
                                        <div>
                                            <h3>Safety First</h3>
                                            <p>
                                                Partner shelters and rescues on Pawtastic are verified. Always meet in a safe place and follow our
                                                guidelines when adopting.
                                            </p>
                                        </div>
                                    </div>
                                    <button type="button" className="safety-learn">Learn more</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {shelterOpen && (
                <div className="adoption-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="shelter-modal-title" onClick={() => setShelterOpen(false)}>
                    <div className="adoption-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="adoption-modal-header">
                            <h2 id="shelter-modal-title">Register as shelter</h2>
                            <button type="button" className="adoption-modal-close" onClick={() => setShelterOpen(false)} aria-label="Close"><Icons.X /></button>
                        </div>
                        <form onSubmit={submitShelter} className="adoption-modal-form">
                            <label>
                                Organization name
                                <input
                                    required
                                    type="text"
                                    value={shelterForm.organization_name}
                                    onChange={(e) => setShelterForm((f) => ({ ...f, organization_name: e.target.value }))}
                                    placeholder="e.g. Bay Area Animal Rescue"
                                />
                            </label>
                            <label>
                                Contact email
                                <input
                                    required
                                    type="email"
                                    value={shelterForm.contact_email}
                                    onChange={(e) => setShelterForm((f) => ({ ...f, contact_email: e.target.value }))}
                                    placeholder="you@shelter.org"
                                />
                            </label>
                            <label>
                                Phone (optional)
                                <input
                                    type="tel"
                                    value={shelterForm.contact_phone}
                                    onChange={(e) => setShelterForm((f) => ({ ...f, contact_phone: e.target.value }))}
                                    placeholder="+1 …"
                                />
                            </label>
                            <label>
                                Tell us about your organization
                                <textarea
                                    rows={4}
                                    value={shelterForm.message}
                                    onChange={(e) => setShelterForm((f) => ({ ...f, message: e.target.value }))}
                                    placeholder="Licensed shelter name, website, and how many pets you list."
                                />
                            </label>
                            <button type="submit" className="btn-shelter adoption-modal-submit" disabled={shelterSubmitting}>
                                {shelterSubmitting ? 'Submitting…' : 'Submit application'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {reportPet && (
                <div className="adoption-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="report-modal-title" onClick={() => setReportPet(null)}>
                    <div className="adoption-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="adoption-modal-header">
                            <h2 id="report-modal-title">Report listing</h2>
                            <button type="button" className="adoption-modal-close" onClick={() => setReportPet(null)} aria-label="Close"><Icons.X /></button>
                        </div>
                        <form onSubmit={submitReport} className="adoption-modal-form">
                            <p className="adoption-modal-pet">Report: <strong>{reportPet.name}</strong></p>
                            <label>
                                Reason
                                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                                    <option value="spam">Spam / scam</option>
                                    <option value="misleading">Misleading information</option>
                                    <option value="inappropriate">Inappropriate content</option>
                                    <option value="animal_welfare">Animal welfare concern</option>
                                    <option value="other">Other</option>
                                </select>
                            </label>
                            <label>
                                Details (optional)
                                <textarea
                                    rows={4}
                                    value={reportDetails}
                                    onChange={(e) => setReportDetails(e.target.value)}
                                    placeholder="What should we know?"
                                />
                            </label>
                            <button type="submit" className="btn-shelter adoption-modal-submit" disabled={reportSubmitting}>
                                {reportSubmitting ? 'Submitting…' : 'Submit report'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {contactPet && (
                <div className="adoption-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" onClick={() => setContactPet(null)}>
                    <div className="adoption-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="adoption-modal-header">
                            <h2 id="contact-modal-title">Inquiry: {contactPet.name}</h2>
                            <button type="button" className="adoption-modal-close" onClick={() => setContactPet(null)} aria-label="Close"><Icons.X /></button>
                        </div>
                        <form onSubmit={submitContact} className="adoption-modal-form">
                            <div className="contact-pet-summary">
                                <div className="mini-avatar" style={{ backgroundImage: `url(${contactPet.photo})` }}></div>
                                <div>
                                    <strong>{contactPet.name}</strong>
                                    <p>{contactPet.breed} · {contactPet.location}</p>
                                </div>
                            </div>
                            <label>
                                Message to Rescue
                                <textarea
                                    required
                                    rows={5}
                                    value={contactMessage}
                                    onChange={(e) => setContactMessage(e.target.value)}
                                    placeholder={`I'm interested in ${contactPet.name}! Please let me know how I can meet them...`}
                                />
                            </label>
                            <p className="contact-disclaimer">Your contact info will be shared with the shelter/rescue for this inquiry only.</p>
                            <button type="submit" className="btn-shelter adoption-modal-submit" disabled={contactSubmitting}>
                                {contactSubmitting ? 'Sending…' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdoptionBoard;
