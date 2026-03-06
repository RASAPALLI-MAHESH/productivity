// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navCenter = document.querySelector('.nav-center');
const navRight = document.querySelector('.nav-right');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        // Toggle mobile menu visibility
        if (navCenter.style.display === 'flex') {
            navCenter.style.display = 'none';
            navRight.style.display = 'none';
        } else {
            navCenter.style.display = 'flex';
            navRight.style.display = 'flex';
            navCenter.style.flexDirection = 'column';
            navCenter.style.position = 'absolute';
            navCenter.style.top = '64px';
            navCenter.style.left = '0';
            navCenter.style.right = '0';
            navCenter.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
            navCenter.style.padding = '20px';
            navCenter.style.borderBottom = '1px solid var(--border-primary)';
            
            navRight.style.flexDirection = 'column';
            navRight.style.position = 'absolute';
            navRight.style.top = '200px';
            navRight.style.left = '0';
            navRight.style.right = '0';
            navRight.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
            navRight.style.padding = '20px';
        }
    });
}

// Task checkbox interactions
document.querySelectorAll('.task-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', function() {
        const taskItem = this.closest('.task-item');
        if (this.classList.contains('checked')) {
            this.classList.remove('checked');
            taskItem.classList.remove('completed');
        } else {
            this.classList.add('checked');
            taskItem.classList.add('completed');
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add scroll-animate class to elements that should animate
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.preview-card, .feature-card, .step, .testimonial, .dashboard-preview');
    animatedElements.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
    } else {
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.8)';
    }
});

// Button hover effects
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Card hover effects
document.querySelectorAll('.preview-card, .feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Streak day hover effects
document.querySelectorAll('.day.completed').forEach(day => {
    day.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    day.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Chart bar animation on scroll
const chartBars = document.querySelectorAll('.chart-bar');
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const height = bar.style.height;
            bar.style.height = '0';
            setTimeout(() => {
                bar.style.transition = 'height 1s ease-out';
                bar.style.height = height;
            }, 100);
            chartObserver.unobserve(bar);
        }
    });
}, { threshold: 0.5 });

chartBars.forEach(bar => {
    chartObserver.observe(bar);
});

// Number counter animation
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Animate stats when visible
const statNumbers = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const text = element.textContent;
            
            if (text.includes('%')) {
                const number = parseInt(text);
                animateCounter(element, number);
                setTimeout(() => {
                    element.textContent = number + '%';
                }, 2000);
            } else {
                const number = parseInt(text);
                animateCounter(element, number);
            }
            
            statsObserver.unobserve(element);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
    statsObserver.observe(stat);
});

// Mobile menu close on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            navCenter.style.display = 'none';
            navRight.style.display = 'none';
        }
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Parallax effect for hero section (subtle)
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrolled < 800) {
        const rate = scrolled * -0.3;
        heroContent.style.transform = `translateY(${rate}px)`;
    }
});

// Form validation (for future login/signup forms)
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Add ripple effect to buttons
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple styles dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .btn-primary, .btn-secondary {
        position: relative;
        overflow: hidden;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    body {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);
