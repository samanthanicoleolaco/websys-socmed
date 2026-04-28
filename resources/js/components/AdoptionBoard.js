import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, PawPrint, Plus, X } from "@phosphor-icons/react";
import Sidebar from "./pages/Sidebar";
import "../../sass/pages/adoption.scss";

// ── Internal UI Components (matching shadcn design) ───────────────────

const Card = ({ children, className = "" }) => (
    <div className={`adopt-card ${className}`}>{children}</div>
);

const Button = ({ children, className = "", variant = "default", ...props }) => (
    <button className={`adopt-btn adopt-btn--${variant} ${className}`} {...props}>
        {children}
    </button>
);

const Badge = ({ children, className = "" }) => (
    <span className={`adopt-badge ${className}`}>{children}</span>
);

// ── Pet Data ──────────────────────────────────────────────────────────

const adoptablePets = [
    {
        id: 1,
        name: "Mochi",
        breed: "Golden Retriever",
        age: "2 years",
        description:
            "Mochi is a playful and loving golden retriever who adores cuddles and outdoor adventures. Great with kids and other pets.",
        location: "San Francisco, CA",
        image: "https://c.animaapp.com/mnucpod10UwxJn/img/ai_5.png",
        imageAlt: "dog portrait natural light",
        tags: ["Friendly", "Playful", "Good with kids"],
        saved: false,
    },
    {
        id: 2,
        name: "Luna",
        breed: "Siberian Husky",
        age: "1 year",
        description:
            "Luna is an energetic husky with striking blue eyes. She loves the outdoors and would thrive in an active home.",
        location: "Seattle, WA",
        image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&q=80",
        imageAlt: "husky dog with blue eyes",
        tags: ["Energetic", "Outdoorsy", "Loyal"],
        saved: false,
    },
    {
        id: 3,
        name: "Oliver",
        breed: "British Shorthair",
        age: "5 years",
        description:
            "Oliver is a calm and gentle cat who loves cozy spaces. Perfect for apartment living and quiet households.",
        location: "Portland, OR",
        image: "https://images.unsplash.com/photo-1573865526739-10ad626bb6de?w=600&q=80",
        imageAlt: "grey british shorthair cat",
        tags: ["Calm", "Indoor", "Independent"],
        saved: false,
    },
    {
        id: 4,
        name: "Daisy",
        breed: "Pembroke Welsh Corgi",
        age: "3 years",
        description:
            "Daisy is an adorable corgi with a big personality. She loves to play and is great with children.",
        location: "Austin, TX",
        image: "https://images.unsplash.com/photo-1612536846250-b2fb6a54bb4e?w=600&q=80",
        imageAlt: "corgi dog playing",
        tags: ["Social", "Playful", "Kid-friendly"],
        saved: false,
    },
    {
        id: 5,
        name: "Milo",
        breed: "Tabby Cat",
        age: "2 years",
        description:
            "Milo is a curious and affectionate tabby who loves attention and warm laps. Great first pet.",
        location: "Denver, CO",
        image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600&q=80",
        imageAlt: "tabby cat sitting",
        tags: ["Affectionate", "Lap cat", "Easy-going"],
        saved: false,
    },
    {
        id: 6,
        name: "Cooper",
        breed: "Beagle",
        age: "4 years",
        description:
            "Cooper is a friendly beagle who loves to explore. He gets along well with other dogs and is house-trained.",
        location: "Chicago, IL",
        image: "https://images.unsplash.com/photo-1505628346881-72b27e092310?w=600&q=80",
        imageAlt: "beagle dog outdoors",
        tags: ["Friendly", "House-trained", "Good with dogs"],
        saved: false,
    },
];

// ── Component ──────────────────────────────────────────────────────────

const AdoptionBoard = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPet, setSelectedPet] = useState(null);
    const [adoptFormPet, setAdoptFormPet] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [putForAdoptionOpen, setPutForAdoptionOpen] = useState(false);
    const [putFormSubmitted, setPutFormSubmitted] = useState(false);

    const fetchListings = async () => {
        try {
            const res = await window.axios.get('/api/adoption-listings/available');
            const data = res.data || [];
            const formattedPets = data.map(listing => ({
                id: listing.id,
                name: listing.pet?.name || 'Unknown',
                breed: listing.pet?.breed || 'Unknown',
                age: listing.pet?.age_label || listing.pet?.age || 'Unknown',
                description: listing.description || listing.pet?.bio || '',
                location: listing.location || listing.pet?.location || 'Unknown',
                image: listing.image ? `storage/${listing.image}` : (listing.pet?.photo ? `storage/${listing.pet.photo}` : null),
                imageAlt: `${listing.pet?.name || 'Pet'} for adoption`,
                tags: [],
                saved: false,
            }));
            setPets(formattedPets);
        } catch (err) {
            console.error('Failed to fetch adoption listings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const toggleSave = (id) => {
        setPets((prev) =>
            prev.map((pet) => (pet.id === id ? { ...pet, saved: !pet.saved } : pet))
        );
    };

    const handleAdoptSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.querySelector('[placeholder="Your full name"]')?.value || form.elements[0]?.value || '',
            email: form.querySelector('[type="email"]')?.value || form.elements[1]?.value || '',
            phone: form.querySelector('[type="tel"]')?.value || form.elements[2]?.value || '',
            message: form.querySelector('textarea')?.value || '',
        };
        try {
            await window.axios.post(`/api/adoption-listings/${adoptFormPet.id}/apply`, data);
            setFormSubmitted(true);
            setTimeout(() => {
                setAdoptFormPet(null);
                setFormSubmitted(false);
                setSelectedPet(null);
            }, 2000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit application.');
        }
    };

    const handlePutSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        try {
            await window.axios.post('/api/adoption-listings', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPutFormSubmitted(true);
            await fetchListings();
            setTimeout(() => {
                setPutForAdoptionOpen(false);
                setPutFormSubmitted(false);
            }, 1500);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to publish listing.');
        }
    };

    return (
        <div className="adoption-page">
            <Sidebar />

            <main className="adoption-main">
                {/* Header */}
                <div className="adoption-header">
                    <div className="adoption-header__text">
                        <h1 className="adoption-header__title">
                            <PawPrint size={32} weight="fill" className="adoption-header__icon" />
                            Find Your Perfect Companion
                        </h1>
                        <p className="adoption-header__subtitle">
                            Browse our lovable pets waiting for a forever home.
                        </p>
                    </div>
                    <Button variant="default" onClick={() => setPutForAdoptionOpen(true)}>
                        <Plus size={18} weight="bold" />
                        Pet for Adoption
                    </Button>
                </div>

                {/* Grid */}
                <div className="adoption-grid">
                    {pets.map((pet) => (
                        <motion.div
                            key={pet.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: pet.id * 0.05 }}
                        >
                            <Card className="pet-card">
                                {/* Image */}
                                <div className="pet-card__image-wrap">
                                    <img
                                        src={pet.image}
                                        alt={pet.imageAlt}
                                        className="pet-card__image"
                                    />
                                    <button
                                        className={`pet-card__save-btn ${pet.saved ? "pet-card__save-btn--saved" : ""}`}
                                        onClick={() => toggleSave(pet.id)}
                                        aria-label={pet.saved ? "Unsave pet" : "Save pet"}
                                    >
                                        <Heart
                                            size={20}
                                            weight={pet.saved ? "fill" : "regular"}
                                        />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="pet-card__content">
                                    <div className="pet-card__header">
                                        <div>
                                            <h2 className="pet-card__name">{pet.name}</h2>
                                            <p className="pet-card__breed">{pet.breed}</p>
                                        </div>
                                        <Badge className="pet-card__age">{pet.age}</Badge>
                                    </div>

                                    <p className="pet-card__description">{pet.description}</p>

                                    <div className="pet-card__location">
                                        <MapPin size={14} />
                                        <span>{pet.location}</span>
                                    </div>

                                    <div className="pet-card__tags">
                                        {pet.tags.map((tag) => (
                                            <Badge key={tag} className="pet-card__tag">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="pet-card__actions">
                                        <Button variant="outline" className="pet-card__btn" onClick={() => setSelectedPet(pet)}>
                                            Learn More
                                        </Button>
                                        <Button variant="default" className="pet-card__btn" onClick={() => setAdoptFormPet(pet)}>
                                            Adopt Me
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Learn More Modal */}
            <AnimatePresence>
                {selectedPet && (
                    <div className="adopt-modal-overlay" onClick={() => setSelectedPet(null)}>
                        <motion.div
                            className="adopt-modal"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="adopt-modal__image-wrap">
                                <img src={selectedPet.image} alt={selectedPet.imageAlt} className="adopt-modal__image" />
                                <button className="adopt-modal__close" onClick={() => setSelectedPet(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="adopt-modal__content">
                                <div className="adopt-modal__header">
                                    <h2 className="adopt-modal__name">{selectedPet.name}</h2>
                                    <Badge className="adopt-modal__age">{selectedPet.age}</Badge>
                                </div>
                                <p className="adopt-modal__breed">{selectedPet.breed}</p>
                                <div className="adopt-modal__location">
                                    <MapPin size={16} />
                                    <span>{selectedPet.location}</span>
                                </div>
                                
                                <div className="adopt-modal__section">
                                    <h3>About {selectedPet.name}</h3>
                                    <p>{selectedPet.description}</p>
                                </div>

                                <div className="adopt-modal__tags">
                                    {selectedPet.tags.map((tag) => (
                                        <Badge key={tag} className="adopt-modal__tag">{tag}</Badge>
                                    ))}
                                </div>

                                <div className="adopt-modal__actions">
                                    <Button variant="default" className="adopt-modal__btn" onClick={() => {
                                        setAdoptFormPet(selectedPet);
                                    }}>
                                        Apply to Adopt
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Adopt Form Modal */}
            <AnimatePresence>
                {adoptFormPet && (
                    <div className="adopt-modal-overlay" onClick={() => setAdoptFormPet(null)}>
                        <motion.div
                            className="adopt-modal adopt-modal--form"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="adopt-modal__header-bar">
                                <h3>Adopt {adoptFormPet.name}</h3>
                                <button className="adopt-modal__close-alt" onClick={() => setAdoptFormPet(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="adopt-modal__form-content">
                                {formSubmitted ? (
                                    <div className="adopt-modal__success">
                                        <div className="adopt-modal__success-icon"><Heart size={40} weight="fill" color="#ef4444" /></div>
                                        <h4>Application Submitted!</h4>
                                        <p>Thank you! Our team will review your application for {adoptFormPet.name} and get back to you soon.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleAdoptSubmit} className="adopt-form">
                                        <p className="adopt-form__desc">Please provide some details so we can process your adoption application for {adoptFormPet.name}.</p>
                                        
                                        <div className="adopt-form__group">
                                            <label>Full Name</label>
                                            <input type="text" required placeholder="John Doe" />
                                        </div>
                                        <div className="adopt-form__group">
                                            <label>Email Address</label>
                                            <input type="email" required placeholder="john@example.com" />
                                        </div>
                                        <div className="adopt-form__group">
                                            <label>Phone Number</label>
                                            <input type="tel" required placeholder="(555) 123-4567" />
                                        </div>
                                        <div className="adopt-form__group">
                                            <label>Why are you a good fit?</label>
                                            <textarea required placeholder={`Tell us why you'd be a great parent for ${adoptFormPet.name}...`} rows={3}></textarea>
                                        </div>
                                        
                                        <div className="adopt-form__actions">
                                            <Button variant="outline" type="button" onClick={() => setAdoptFormPet(null)}>Cancel</Button>
                                            <Button variant="default" type="submit">Submit Application</Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Put for Adoption Modal */}
            <AnimatePresence>
                {putForAdoptionOpen && (
                    <div className="adopt-modal-overlay" onClick={() => setPutForAdoptionOpen(false)}>
                        <motion.div
                            className="adopt-modal adopt-modal--form"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="adopt-modal__header-bar">
                                <h3>List Pet for Adoption</h3>
                                <button className="adopt-modal__close-alt" onClick={() => setPutForAdoptionOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="adopt-modal__form-content">
                                {putFormSubmitted ? (
                                    <div className="adopt-modal__success">
                                        <div className="adopt-modal__success-icon"><PawPrint size={40} weight="fill" color="#ef4444" /></div>
                                        <h4>Listing Created!</h4>
                                        <p>Your pet has been successfully listed for adoption. We'll help find them a loving home!</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handlePutSubmit} className="adopt-form">
                                        <p className="adopt-form__desc">Fill out the details below to list your pet for adoption. Make sure to provide accurate information.</p>
                                        
                                        <div className="adopt-form__row">
                                            <div className="adopt-form__group">
                                                <label>Pet Name</label>
                                                <input type="text" required placeholder="e.g. Buddy" />
                                            </div>
                                            <div className="adopt-form__group">
                                                <label>Pet Type/Breed</label>
                                                <input type="text" required placeholder="e.g. Golden Retriever" />
                                            </div>
                                        </div>

                                        <div className="adopt-form__row">
                                            <div className="adopt-form__group">
                                                <label>Age</label>
                                                <input type="text" required placeholder="e.g. 2 years" />
                                            </div>
                                            <div className="adopt-form__group">
                                                <label>Location</label>
                                                <input type="text" required placeholder="e.g. San Francisco, CA" />
                                            </div>
                                        </div>

                                        <div className="adopt-form__group">
                                            <label>Description</label>
                                            <textarea required placeholder="Tell potential adopters about your pet's personality, habits, and needs..." rows={4}></textarea>
                                        </div>

                                        <div className="adopt-form__group">
                                            <label>Pet Image URL</label>
                                            <input type="url" placeholder="https://example.com/pet-image.jpg" />
                                            <span className="adopt-form__hint">For now, please provide a direct link to an image.</span>
                                        </div>
                                        
                                        <div className="adopt-form__actions">
                                            <Button variant="outline" type="button" onClick={() => setPutForAdoptionOpen(null)}>Cancel</Button>
                                            <Button variant="default" type="submit">Create Listing</Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdoptionBoard;
