/*=============== SELECT ELEMENTS ===============*/
const $ = (selector, parent = document) => parent.querySelector(selector);

const $$ = (selector, parent = document) => [
    ...parent.querySelectorAll(selector),
];

/*=============== DOM ELEMENTS ===============*/
const loader = $("#loader");
const header = $("#header");

const menuToggle = $("#menu-toggle");
const mobileNav = $("#mobile-nav");

const navLinks = $$(".nav-link");
const mobileLinks = $$(".mobile-nav a");

const previewAvatar = $("#preview-avatar");
const previewImage = $("#preview-image");

const shapeOptions = $$(".shape-option");
const fitOptions = $$(".fit-option");

const sizeSlider = $("#avatar-size");
const sizeValue = $("#size-value");

const positionSelect = $("#avatar-position");

const previewShape = $("#preview-shape");
const previewSize = $("#preview-size");

const resetButton = $("#reset-playground");

/*=============== PLAYGROUND DEFAULTS ===============*/
const defaultSettings = {
    shape: "circle",
    size: 160,
    fit: "cover",
    position: "center",
};

let currentSettings = { ...defaultSettings };

/*=============== LOADER ===============*/
function hideLoader() {
    if (!loader) return;

    loader.classList.add("is-hidden");

    // Remove the loader after its fade-out animation.
    setTimeout(() => {
        loader.remove();
    }, 700);
}

window.addEventListener("load", hideLoader);

// Fallback in case the load event already happened.
if (document.readyState === "complete") {
    hideLoader();
}

/*=============== HEADER SCROLL EFFECT ===============*/
function updateHeader() {
    if (!header) return;

    header.classList.toggle("scrolled", window.scrollY > 30);
}

window.addEventListener("scroll", updateHeader, {
    passive: true,
});

updateHeader();

/*=============== MOBILE NAVIGATION ===============*/
function openMobileMenu() {
    if (!menuToggle || !mobileNav) return;

    menuToggle.classList.add("active");
    mobileNav.classList.add("open");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
}

function closeMobileMenu() {
    if (!menuToggle || !mobileNav) return;

    menuToggle.classList.remove("active");
    mobileNav.classList.remove("open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
}

if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = mobileNav.classList.contains("open");

        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close the menu after selecting a section.
    mobileLinks.forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
    });

    // Close with Escape.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });

    // Close if the user returns to desktop width.
    window.addEventListener("resize", () => {
        if (window.innerWidth > 760) {
            closeMobileMenu();
        }
    });
}

/*=============== ACTIVE NAVIGATION ===============*/
const sections = $$("main section[id]");

const allNavLinks = [...navLinks, ...mobileLinks];

function setActiveLink(sectionId) {
    allNavLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${sectionId}`;

        link.classList.toggle("active", isActive);

        if (link.classList.contains("nav-link")) {
            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        }
    });
}

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            // Find the most visible section in the current observation.
            const visibleSections = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (visibleSections.length > 0) {
                setActiveLink(visibleSections[0].target.id);
            }
        },
        {
            root: null,
            rootMargin: "-20% 0px -60% 0px",
            threshold: [0, 0.15, 0.3, 0.5, 0.75],
        },
    );

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });
}

/*=============== PLAYGROUND: SHAPES ===============*/
const shapeStyles = {
    circle: {
        radius: "50%",
        label: "CIRCLE",
    },

    rounded: {
        radius: "22%",
        label: "ROUNDED",
    },

    square: {
        radius: "4px",
        label: "SQUARE",
    },
};

function updateShape(shape) {
    const selectedShape = shapeStyles[shape];

    if (!selectedShape || !previewAvatar) return;

    currentSettings.shape = shape;

    // Update the actual avatar container.
    previewAvatar.style.borderRadius = selectedShape.radius;

    // Update shape buttons.
    shapeOptions.forEach((button) => {
        const isActive = button.dataset.shape === shape;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    // Update the visible label.
    if (previewShape) {
        previewShape.textContent = selectedShape.label;
    }
}

shapeOptions.forEach((button) => {
    button.addEventListener("click", () => {
        updateShape(button.dataset.shape);
    });
});

/*=============== PLAYGROUND: SIZE ===============*/
function updateSize(size) {
    const value = Number(size);

    if (!Number.isFinite(value) || !previewAvatar) return;

    currentSettings.size = value;

    previewAvatar.style.width = `${value}px`;
    previewAvatar.style.height = `${value}px`;

    if (sizeSlider) {
        sizeSlider.value = value;
    }

    if (sizeValue) {
        sizeValue.textContent = `${value}px`;
    }

    if (previewSize) {
        previewSize.textContent = `${value} × ${value}`;
    }
}

if (sizeSlider) {
    sizeSlider.addEventListener("input", (event) => {
        updateSize(event.target.value);
    });
}

/*=============== PLAYGROUND: IMAGE FIT ===============*/
function updateFit(fit) {
    if (!["cover", "contain"].includes(fit) || !previewImage) {
        return;
    }

    currentSettings.fit = fit;

    previewImage.style.objectFit = fit;

    fitOptions.forEach((button) => {
        const isActive = button.dataset.fit === fit;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

fitOptions.forEach((button) => {
    button.addEventListener("click", () => {
        updateFit(button.dataset.fit);
    });
});

/*=============== PLAYGROUND: IMAGE POSITION ===============*/
function updatePosition(position) {
    const validPositions = ["center", "top", "bottom", "left", "right"];

    if (!validPositions.includes(position) || !previewImage) {
        return;
    }

    currentSettings.position = position;

    previewImage.style.objectPosition = position;

    if (positionSelect) {
        positionSelect.value = position;
    }
}

if (positionSelect) {
    positionSelect.addEventListener("change", (event) => {
        updatePosition(event.target.value);
    });
}

/*=============== RESET PLAYGROUND ===============*/
function resetPlayground() {
    currentSettings = { ...defaultSettings };

    updateShape(defaultSettings.shape);
    updateSize(defaultSettings.size);
    updateFit(defaultSettings.fit);
    updatePosition(defaultSettings.position);
}

if (resetButton) {
    resetButton.addEventListener("click", resetPlayground);
}

/*=============== INITIALIZE PLAYGROUND ===============*/
function initializePlayground() {
    resetPlayground();
}

initializePlayground();

/*=============== SCROLL REVEAL ===============*/
const revealElements = [
    ".section-heading",
    ".lesson-card",
    ".playground",
    ".practice-content",
];

const revealTargets = revealElements.flatMap((selector) => $$(selector));

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
).matches;

if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px",
        },
    );

    revealTargets.forEach((element) => {
        element.classList.add("reveal");
        revealObserver.observe(element);
    });
} else {
    revealTargets.forEach((element) => {
        element.classList.add("is-visible");
    });
}

/*=============== CURRENT YEAR / CONSOLE ===============*/
console.log(
    "%c CIRCLE STUDIO ",
    "background: #30233f; color: #d9c5fa; padding: 8px 12px; border-radius: 4px;",
);

console.log("School 011 — Circular Avatar");
console.log("Experiment with border-radius, object-fit and object-position.");
