/**
 * Antigravity Deck - Core Presentation Engine
 * A modular, lightweight, high-performance HTML/CSS/JS slide framework.
 */

class PresentationEngine {
    constructor() {
        // Core elements
        this.container = document.getElementById('presentation-container');
        this.wrapper = document.getElementById('slides-wrapper');
        this.slides = Array.from(document.querySelectorAll('.slide'));
        
        // Navigation controls
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.indicatorCurrent = document.getElementById('current-slide-num');
        this.indicatorTotal = document.getElementById('total-slides-num');
        this.progressBar = document.getElementById('progress-indicator');
        
        // Overlay widgets
        this.overviewBtn = document.getElementById('overview-btn');
        this.themeBtn = document.getElementById('theme-btn');
        
        this.notesBtn = document.getElementById('notes-btn');
        this.closeNotesBtn = document.getElementById('close-notes-btn');
        this.notesDrawer = document.getElementById('speaker-notes-drawer');
        this.notesContent = document.getElementById('speaker-notes-content');
        
        this.helpBtn = document.getElementById('help-btn');
        this.closeHelpBtn = document.getElementById('close-help-btn');
        this.helpModal = document.getElementById('shortcuts-modal');

        // State Variables
        this.currentIndex = 0;
        this.isOverview = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        // Color Themes
        this.themes = ['theme-glass-dark', 'theme-cyberpunk', 'theme-warm-sunset', 'theme-minimal-light'];
        this.currentThemeIndex = 0;

        // Auto-detect total slides
        this.totalSlides = this.slides.length;
        if (this.indicatorTotal) {
            this.indicatorTotal.textContent = String(this.totalSlides).padStart(2, '0');
        }

        this.init();
    }

    init() {
        // Initialize active theme
        this.detectCurrentTheme();
        
        // Setup initial slide based on URL hash
        this.parseHashRoute();

        // Register Event Listeners
        this.setupNavigation();
        this.setupTouchGestures();
        this.setupWindowListeners();
        this.updateNotes();
    }

    /**
     * Detect starting theme based on body class list
     */
    detectCurrentTheme() {
        for (let i = 0; i < this.themes.length; i++) {
            if (document.body.classList.contains(this.themes[i])) {
                this.currentThemeIndex = i;
                break;
            }
        }
    }

    /**
     * Setup navigation click and keyboard handlers
     */
    setupNavigation() {
        // Controls click events
        this.prevBtn?.addEventListener('click', () => this.previousSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        this.overviewBtn?.addEventListener('click', () => this.toggleOverview());
        this.themeBtn?.addEventListener('click', () => this.cycleTheme());
        
        // Notes Drawer events
        this.notesBtn?.addEventListener('click', () => this.toggleNotes());
        this.closeNotesBtn?.addEventListener('click', () => this.toggleNotes(false));
        
        // Help modal events
        this.helpBtn?.addEventListener('click', () => this.toggleHelp(true));
        this.closeHelpBtn?.addEventListener('click', () => this.toggleHelp(false));
        
        // Overview click-to-select slide
        this.slides.forEach((slide, index) => {
            slide.addEventListener('click', (e) => {
                if (this.isOverview) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.goToSlide(index);
                    this.toggleOverview(false);
                }
            });
        });

        // Keypress shortcuts mapping
        document.addEventListener('keydown', (e) => {
            // Ignore keystrokes when typing inside inputs or interactive elements
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            switch(e.key.toLowerCase()) {
                // Next Navigation
                case ' ':
                case 'arrowright':
                case 'arrowdown':
                case 'pagedown':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.previousSlide();
                    } else {
                        this.nextSlide();
                    }
                    break;

                // Previous Navigation
                case 'arrowleft':
                case 'arrowup':
                case 'pageup':
                case 'backspace':
                    e.preventDefault();
                    this.previousSlide();
                    break;

                // Edge Navigation
                case 'home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'end':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    break;

                // Layout & Presets toggles
                case 'o':
                    this.toggleOverview();
                    break;
                case 't':
                    this.cycleTheme();
                    break;
                case 'n':
                    this.toggleNotes();
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
                case '?':
                case 'h':
                    this.toggleHelp();
                    break;
                case 'escape':
                    if (this.isOverview) this.toggleOverview(false);
                    this.toggleHelp(false);
                    this.toggleNotes(false);
                    break;
            }
        });
    }

    /**
     * Setup touch controls for tablets and mobile devices
     */
    setupTouchGestures() {
        this.wrapper.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.wrapper.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const threshold = 60; // minimum distance in pixels
        const diff = this.touchEndX - this.touchStartX;
        
        if (this.isOverview) return; // disable swipe during overview mode

        if (diff < -threshold) {
            // Swipe Left -> Next Slide
            this.nextSlide();
        } else if (diff > threshold) {
            // Swipe Right -> Previous Slide
            this.previousSlide();
        }
    }

    /**
     * Setup hash routing listeners
     */
    setupWindowListeners() {
        window.addEventListener('hashchange', () => {
            this.parseHashRoute();
        });
    }

    /**
     * Parse hash and navigate to specified slide (e.g. index.html#3 -> slide 3)
     */
    parseHashRoute() {
        const hash = window.location.hash;
        if (hash) {
            const slideNum = parseInt(hash.replace('#', ''), 10);
            if (!isNaN(slideNum) && slideNum >= 1 && slideNum <= this.totalSlides) {
                this.goToSlide(slideNum - 1);
                return;
            }
        }
        // Fallback to start
        this.goToSlide(0);
    }

    /**
     * Core Navigation Engine
     */
    goToSlide(index) {
        if (index < 0 || index >= this.totalSlides || index === this.currentIndex && this.slides[index].classList.contains('active-slide')) {
            return;
        }

        // Handle active/past styling states for slides transition animation trigger
        this.slides.forEach((slide, idx) => {
            slide.classList.remove('active-slide', 'past-slide');
            if (idx < index) {
                slide.classList.add('past-slide');
            }
        });

        // Set new active slide
        this.currentIndex = index;
        const activeSlide = this.slides[this.currentIndex];
        activeSlide.classList.add('active-slide');

        // Update indicators
        if (this.indicatorCurrent) {
            this.indicatorCurrent.textContent = String(this.currentIndex + 1).padStart(2, '0');
        }

        // Update URL hash without breaking history back-forward
        history.replaceState(null, null, `#${this.currentIndex + 1}`);

        // Update visual decorations
        this.updateProgressBar();
        this.updateNotes();
    }

    nextSlide() {
        if (this.currentIndex < this.totalSlides - 1) {
            this.goToSlide(this.currentIndex + 1);
        }
    }

    previousSlide() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }

    /**
     * Calculate and visually updates bottom progress status bar
     */
    updateProgressBar() {
        if (!this.progressBar) return;
        if (this.totalSlides <= 1) {
            this.progressBar.style.width = '100%';
            return;
        }
        const percentage = (this.currentIndex / (this.totalSlides - 1)) * 100;
        this.progressBar.style.width = `${percentage}%`;
    }

    /**
     * Speaker notes panel loader
     */
    updateNotes() {
        if (!this.notesContent) return;
        const currentSlide = this.slides[this.currentIndex];
        const notesEl = currentSlide?.querySelector('.notes');
        
        if (notesEl && notesEl.innerHTML.trim() !== '') {
            this.notesContent.innerHTML = notesEl.innerHTML;
            this.notesBtn?.classList.remove('disabled');
        } else {
            this.notesContent.innerHTML = '<p class="no-notes">No speaker notes provided for this slide.</p>';
            this.notesBtn?.classList.add('disabled');
        }
    }

    toggleNotes(forceState = null) {
        const state = forceState !== null ? forceState : !this.notesDrawer.classList.contains('open');
        if (state) {
            this.notesDrawer.classList.add('open');
            this.notesBtn?.classList.add('active');
        } else {
            this.notesDrawer.classList.remove('open');
            this.notesBtn?.classList.remove('active');
        }
    }

    /**
     * Switch themes cycling body styling classes
     */
    cycleTheme() {
        const oldTheme = this.themes[this.currentThemeIndex];
        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        const newTheme = this.themes[this.currentThemeIndex];

        document.body.classList.remove(oldTheme);
        document.body.classList.add(newTheme);

        // Highlight active theme button state temporarily or cycle styles
        const iconSvg = this.themeBtn?.querySelector('svg');
        if (iconSvg) {
            iconSvg.style.transform = `rotate(${this.currentThemeIndex * 90}deg)`;
        }
    }

    /**
     * Toggle overview mode showing slides grid
     */
    toggleOverview(forceState = null) {
        this.isOverview = forceState !== null ? forceState : !this.isOverview;
        
        if (this.isOverview) {
            this.container.classList.add('overview-mode');
            this.overviewBtn?.classList.add('active');
            // Close drawers and modals to clear space
            this.toggleHelp(false);
            this.toggleNotes(false);
        } else {
            this.container.classList.remove('overview-mode');
            this.overviewBtn?.classList.remove('active');
            
            // Re-center active slide scroll if grid scrolled away
            const activeSlide = this.slides[this.currentIndex];
            activeSlide?.scrollIntoView({ block: 'center', inline: 'center' });
        }
    }

    /**
     * Help Dialog Toggle
     */
    toggleHelp(forceState = null) {
        const state = forceState !== null ? forceState : !this.helpModal.classList.contains('open');
        if (state) {
            this.helpModal.classList.add('open');
            this.helpBtn?.classList.add('active');
        } else {
            this.helpModal.classList.remove('open');
            this.helpBtn?.classList.remove('active');
        }
    }

    /**
     * Fullscreen Mode Handler
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().catch(err => {
                console.warn(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Instantiate the engine on load
window.addEventListener('DOMContentLoaded', () => {
    window.deck = new PresentationEngine();
});
