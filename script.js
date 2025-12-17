// ============================================
// SCROLL UTILITIES & HELPERS
// ============================================

/**
 * Check if an element is in viewport
 */
function isElementInViewport(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

/**
 * Smooth scroll to element
 */
function smoothScrollTo(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Debounce function for scroll events
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for frequent events
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// ============================================
// NAVIGATION BAR
// ============================================

const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Guard against missing elements
if (!navbar || !menuToggle || !navMenu || navLinks.length === 0) {
    console.warn('Navigation elements not found');
}

/**
 * Sticky navbar on scroll
 */
window.addEventListener('scroll', throttle(() => {
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}, 100));

/**
 * Mobile menu toggle
 */
if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar-container')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

/**
 * Smooth scroll on nav link click
 */
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Close mobile menu
        if (menuToggle && navMenu) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
        
        // Smooth scroll
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            smoothScrollTo(targetSection);
        }
    });
});

/**
 * Update active nav link on scroll
 */
window.addEventListener('scroll', throttle(() => {
    let current = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}, 100));

// ============================================
// SCROLL REVEAL ANIMATIONS (Animate On Scroll)
// ============================================

class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('[data-aos]');
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.revealElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.elements.forEach(element => {
            observer.observe(element);
        });
    }

    revealElement(element) {
        const delay = element.getAttribute('data-delay') || 0;
        setTimeout(() => {
            element.classList.add('aos-show');
        }, parseInt(delay));
    }
}

// Initialize scroll reveal
document.addEventListener('DOMContentLoaded', () => {
    new ScrollReveal();
});

// ============================================
// COUNTER ANIMATION
// ============================================

class Counter {
    constructor(element, target) {
        this.element = element;
        this.target = parseInt(target);
        this.current = 0;
        this.animated = false;
    }

    animate() {
        if (this.animated) return;

        const increment = this.target / 50;
        const timer = setInterval(() => {
            this.current += increment;
            if (this.current >= this.target) {
                this.current = this.target;
                clearInterval(timer);
            }
            this.element.textContent = Math.floor(this.current).toLocaleString();
        }, 30);

        this.animated = true;
    }
}

// Initialize counters
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.stat-number');
    
    window.addEventListener('scroll', throttle(() => {
        counters.forEach(counter => {
            if (!counter.animated && isElementInViewport(counter)) {
                const target = counter.getAttribute('data-target');
                if (target) {
                    new Counter(counter, target).animate();
                    counter.animated = true;
                }
            }
        });
    }, 100));
});

// ============================================
// PROGRESS BARS ANIMATION
// ============================================

class ProgressBar {
    constructor(element) {
        this.element = element;
        this.width = this.element.getAttribute('data-width');
        this.animated = false;
    }

    animate() {
        if (this.animated) return;

        let current = 0;
        const increment = this.width / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= this.width) {
                current = this.width;
                clearInterval(timer);
            }
            this.element.style.setProperty('--fill-width', current + '%');
            this.element.style.width = current + '%';
        }, 30);

        this.animated = true;
    }
}

// Initialize progress bars
document.addEventListener('DOMContentLoaded', () => {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    window.addEventListener('scroll', throttle(() => {
        progressBars.forEach(bar => {
            if (!bar.animated && isElementInViewport(bar)) {
                new ProgressBar(bar).animate();
                bar.animated = true;
            }
        });
    }, 100));
});

// ============================================
// GALLERY & LIGHTBOX
// ============================================

class Gallery {
    constructor() {
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.querySelector('.lightbox-image');
        this.currentIndex = 0;
        this.init();
    }

    init() {
        // Gallery item click
        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.currentIndex = index;
                this.openLightbox(index);
            });
        });

        // Lightbox close button
        document.querySelector('.lightbox-close').addEventListener('click', () => {
            this.closeLightbox();
        });

        // Lightbox navigation
        document.querySelector('.lightbox-prev').addEventListener('click', () => {
            this.previousImage();
        });

        document.querySelector('.lightbox-next').addEventListener('click', () => {
            this.nextImage();
        });

        // Close lightbox on background click
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') this.previousImage();
            if (e.key === 'ArrowRight') this.nextImage();
            if (e.key === 'Escape') this.closeLightbox();
        });
    }

    openLightbox(index) {
        const img = this.galleryItems[index].querySelector('img');
        this.lightboxImage.src = img.src;
        this.lightboxImage.alt = img.alt;
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    previousImage() {
        this.currentIndex = (this.currentIndex - 1 + this.galleryItems.length) % this.galleryItems.length;
        this.openLightbox(this.currentIndex);
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.galleryItems.length;
        this.openLightbox(this.currentIndex);
    }
}

// Initialize gallery
document.addEventListener('DOMContentLoaded', () => {
    new Gallery();
});

// ============================================
// FORM VALIDATION & SUBMISSION
// ============================================

class FormValidator {
    constructor(form) {
        this.form = form;
        this.fields = {
            name: { required: true, minLength: 2 },
            email: { required: true, type: 'email' },
            phone: { required: false, type: 'tel' },
            service: { required: true },
            message: { required: true, minLength: 10 }
        };
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();

        if (this.validateForm()) {
            this.submitForm();
        }
    }

    validateForm() {
        let isValid = true;

        for (const [fieldName, rules] of Object.entries(this.fields)) {
            const input = this.form.querySelector(`[name="${fieldName}"]`);
            const errorElement = document.getElementById(`${fieldName}Error`);
            
            if (!input || !errorElement) {
                console.warn(`Form field or error element not found: ${fieldName}`);
                continue;
            }

            const fieldGroup = input.closest('.form-group');
            if (!fieldGroup) continue;

            if (rules.required && !input.value.trim()) {
                this.showError(fieldGroup, errorElement, `${this.capitalizeField(fieldName)} is required`);
                isValid = false;
            } else if (input.value && rules.minLength && input.value.length < rules.minLength) {
                this.showError(fieldGroup, errorElement, `${this.capitalizeField(fieldName)} must be at least ${rules.minLength} characters`);
                isValid = false;
            } else if (input.value && rules.type === 'email' && !this.isValidEmail(input.value)) {
                this.showError(fieldGroup, errorElement, 'Please enter a valid email address');
                isValid = false;
            } else if (input.value && rules.type === 'tel' && !this.isValidPhone(input.value)) {
                this.showError(fieldGroup, errorElement, 'Please enter a valid phone number');
                isValid = false;
            } else {
                this.clearError(fieldGroup, errorElement);
            }
        }

        return isValid;
    }

    showError(fieldGroup, errorElement, message) {
        fieldGroup.classList.add('error');
        errorElement.textContent = message;
    }

    clearError(fieldGroup, errorElement) {
        fieldGroup.classList.remove('error');
        errorElement.textContent = '';
    }

    capitalizeField(field) {
        return field.replace(/([A-Z])/g, ' $1').trim().replace(/^./, (c) => c.toUpperCase());
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    submitForm() {
        const formMessage = document.getElementById('formMessage');
        if (!formMessage) {
            console.error('Form message element not found');
            return;
        }

        // Simulate form submission
        setTimeout(() => {
            formMessage.textContent = '✓ Message sent successfully! We\'ll get back to you soon.';
            formMessage.classList.add('success');
            formMessage.classList.remove('error');

            // Reset form
            this.form.reset();

            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.textContent = '';
                formMessage.classList.remove('success');
            }, 5000);
        }, 500);
    }
}

// Initialize form validator
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        new FormValidator(contactForm);
    }
});

// ============================================
// HERO SECTION ANIMATIONS
// ============================================

/**
 * Animate hero title words on page load
 */
window.addEventListener('load', () => {
    const words = document.querySelectorAll('.hero-title .word');
    words.forEach((word, index) => {
        word.style.animationDelay = `${0.2 + index * 0.2}s`;
    });
});

// ============================================
// BUTTON RIPPLE EFFECT
// ============================================

class RippleButton {
    constructor() {
        // Ripple effect disabled for simpler button styling
        // this.buttons = document.querySelectorAll('.btn');
        // this.init();
    }

    init() {
        // Ripple effect disabled
    }

    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        // Add ripple styles dynamically
        if (!document.querySelector('style[data-ripple]')) {
            const style = document.createElement('style');
            style.setAttribute('data-ripple', 'true');
            style.textContent = `
                .btn { position: relative; }
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    transform: scale(0);
                    animation: rippleAnimation 0.6s ease-out;
                    pointer-events: none;
                }
                @keyframes rippleAnimation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        button.appendChild(ripple);
    }
}


// Initialize ripple effect
document.addEventListener('DOMContentLoaded', () => {
    new RippleButton();
});

// ============================================
// SERVICE CARD HOVER GLOW EFFECT
// ============================================

/**
 * Add glow effect on service card hover
 */
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', x + 'px');
            card.style.setProperty('--mouse-y', y + 'px');
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        });
    });
});

// ============================================
// SMOOTH SCROLL FOR CTA BUTTONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const ctaButtons = document.querySelectorAll('.hero-buttons .btn-gradient');

    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            const text = button.textContent.toLowerCase();
            if (text.includes('book')) {
                smoothScrollTo(document.getElementById('contact'));
            } else if (text.includes('contact')) {
                smoothScrollTo(document.getElementById('contact'));
            }
        });
    });
});

// ============================================
// PAGE LOAD ANIMATIONS
// ============================================

window.addEventListener('load', () => {
    // Add animation to elements
    document.body.classList.add('loaded');
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Note: debounce and throttle functions are defined at the top of the file

// ============================================
// UTILITY: SCROLL TO TOP BUTTON (Optional)
// ============================================

/**
 * Create and manage scroll-to-top button
 */
class ScrollToTop {
    constructor() {
        this.createButton();
        this.init();
    }

    createButton() {
        const button = document.createElement('button');
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.className = 'scroll-to-top';
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            z-index: 999;
        `;

        document.body.appendChild(button);
        this.button = button;
    }

    init() {
        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > 500) {
                this.button.style.display = 'flex';
            } else {
                this.button.style.display = 'none';
            }
        }, 100));

        this.button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        this.button.addEventListener('mouseenter', () => {
            this.button.style.transform = 'scale(1.1)';
        });

        this.button.addEventListener('mouseleave', () => {
            this.button.style.transform = 'scale(1)';
        });
    }
}

// Initialize scroll to top
document.addEventListener('DOMContentLoaded', () => {
    new ScrollToTop();
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('PawsCare Website Loaded Successfully');
    
    // Log performance metrics
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page Load Time: ' + pageLoadTime + 'ms');
    }
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Global error handler for better UX
 */
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
});
