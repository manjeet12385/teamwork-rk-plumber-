/**
 * TEAM RK PLUMBER - INTERACTIVE JAVASCRIPT
 * Handles FAQs, quote requests, mobile navigation, and quick contact actions
 */

document.addEventListener('DOMContentLoaded', () => {
  const hideHumanImages = () => {
    const humanPatterns = /\b(?:plumber|technician|workers?|team|people|person|man|woman|installer|on-site|worksite|site work)\b/i;

    document.querySelectorAll('img[alt]').forEach((img) => {
      const altText = (img.getAttribute('alt') || '').trim();
      const ariaLabel = (img.getAttribute('aria-label') || '').trim();

      if (!altText && !ariaLabel) return;
      if (img.closest('.brand-logo-img, .footer-logo-img') || img.src.includes('logo.png')) return;

      const signalText = `${altText} ${ariaLabel}`.toLowerCase();
      if (!humanPatterns.test(signalText)) return;
      img.dataset.personImage = 'true';

      const hideTargets = [
        img.closest('.project-team-card'),
        img.closest('.project-gallery-item'),
        img.closest('.photo-gallery-card'),
        img.closest('.home-experience-visual'),
        img.closest('.card-img-holder'),
        img.closest('figure'),
        img.closest('.gallery-item'),
        img.parentElement
      ].filter(Boolean);

      hideTargets.forEach((target) => {
        target.style.display = 'none';
      });
    });
  };

  hideHumanImages();

  // MOBILE NAVIGATION DRAWER
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    const setMenuOpen = (isOpen) => {
      navMenu.classList.toggle('open', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileToggle.setAttribute('aria-label', isOpen ? 'Close Navigation' : 'Open Navigation');

      const spans = mobileToggle.querySelectorAll('span');
      if (spans.length >= 3) {
        spans[0].style.transform = isOpen ? 'translateY(8.5px) rotate(45deg)' : 'none';
        spans[1].style.opacity = isOpen ? '0' : '1';
        spans[2].style.transform = isOpen ? 'translateY(-8.5px) rotate(-45deg)' : 'none';
      }
    };

    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', 'nav-menu');
    mobileToggle.addEventListener('click', () => {
      setMenuOpen(!navMenu.classList.contains('open'));
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      const navItem = link.closest('.nav-item');
      const dropdown = navItem && navItem.querySelector('.nav-dropdown');
      if (dropdown) link.setAttribute('aria-expanded', 'false');
    });

    navMenu.addEventListener('click', (event) => {
      const link = event.target.closest('.nav-link, .dropdown-link');
      if (!link) return;

      if (window.innerWidth <= 1024 && link.classList.contains('nav-link')) {
        const navItem = link.closest('.nav-item');
        const dropdown = navItem && navItem.querySelector('.nav-dropdown');
        if (dropdown && !navItem.classList.contains('open')) {
          event.preventDefault();
          navMenu.querySelectorAll('.nav-item.open').forEach(item => {
            item.classList.remove('open');
            const itemLink = item.querySelector('.nav-link');
            if (itemLink) itemLink.setAttribute('aria-expanded', 'false');
          });
          navItem.classList.add('open');
          link.setAttribute('aria-expanded', 'true');
          return;
        }
      }

      if (window.innerWidth <= 1024) setMenuOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navMenu.classList.contains('open')) {
        setMenuOpen(false);
        mobileToggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && navMenu.classList.contains('open')) {
        setMenuOpen(false);
      }
    });
  }

  // STICKY HEADER SCROLL EFFECT
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // FAQ ACCORDION
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (btn) {
      btn.setAttribute('aria-expanded', String(item.classList.contains('active')));
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // GALLERY PHOTO LIGHTBOX
  const photoCards = Array.from(document.querySelectorAll('.photo-gallery-card'));
  if (photoCards.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Project photo viewer');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
      <button class="gallery-lightbox-close" type="button" aria-label="Close photo viewer">Close</button>
      <button class="gallery-lightbox-nav gallery-lightbox-previous" type="button" aria-label="Previous photo">Previous</button>
      <figure class="gallery-lightbox-content">
        <img class="gallery-lightbox-image" alt="">
        <figcaption class="gallery-lightbox-caption"></figcaption>
      </figure>
      <button class="gallery-lightbox-nav gallery-lightbox-next" type="button" aria-label="Next photo">Next</button>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.gallery-lightbox-image');
    const lightboxCaption = lightbox.querySelector('.gallery-lightbox-caption');
    const closeLightboxButton = lightbox.querySelector('.gallery-lightbox-close');
    const previousPhotoButton = lightbox.querySelector('.gallery-lightbox-previous');
    const nextPhotoButton = lightbox.querySelector('.gallery-lightbox-next');
    let visiblePhotos = [];
    let activePhotoIndex = 0;
    let photoTrigger = null;
    let previousBodyOverflow = '';

    const showPhoto = (index) => {
      activePhotoIndex = (index + visiblePhotos.length) % visiblePhotos.length;
      const photo = visiblePhotos[activePhotoIndex];
      lightboxImage.src = photo.src;
      lightboxImage.alt = photo.alt;
      lightboxCaption.textContent = photo.caption;
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = previousBodyOverflow;
      if (photoTrigger) photoTrigger.focus();
    };

    const openLightbox = (card) => {
      visiblePhotos = photoCards
        .filter(photoCard => photoCard.style.display !== 'none')
        .map(photoCard => {
          const image = photoCard.querySelector('.photo-card-img');
          const title = photoCard.querySelector('.photo-card-title');
          return {
            src: image.currentSrc || image.src,
            alt: image.alt,
            caption: title ? title.textContent.trim() : image.alt
          };
        });

      const selectedImage = card.querySelector('.photo-card-img');
      photoTrigger = card;
      previousBodyOverflow = document.body.style.overflow;
      showPhoto(visiblePhotos.findIndex(photo => photo.src === (selectedImage.currentSrc || selectedImage.src)));
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeLightboxButton.focus();
    };

    photoCards.forEach(card => {
      const image = card.querySelector('.photo-card-img');
      const title = card.querySelector('.photo-card-title');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View photo: ${title ? title.textContent.trim() : image.alt}`);
      card.addEventListener('click', () => openLightbox(card));
      card.addEventListener('keydown', (event) => {
        if (event.target !== card || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        openLightbox(card);
      });
    });

    closeLightboxButton.addEventListener('click', closeLightbox);
    previousPhotoButton.addEventListener('click', () => showPhoto(activePhotoIndex - 1));
    nextPhotoButton.addEventListener('click', () => showPhoto(activePhotoIndex + 1));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const controls = [closeLightboxButton, previousPhotoButton, nextPhotoButton];
      const firstControl = controls[0];
      const lastControl = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl.focus();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showPhoto(activePhotoIndex - 1);
      if (event.key === 'ArrowRight') showPhoto(activePhotoIndex + 1);
    });
  }

  // QUOTE MODAL
  const modalBackdrop = document.getElementById('quote-modal');
  const openModalBtns = document.querySelectorAll('.open-quote-modal');
  const closeModalBtn = document.getElementById('close-quote-modal');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalBackdrop) {
        modalBackdrop.classList.add('open');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeModalBtn && modalBackdrop) {
    closeModalBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    });

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('open');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
        modalBackdrop.classList.remove('open');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      }
    });
  }

  // Open the user's enquiry in WhatsApp instead of showing a false submission success.
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const details = Array.from(form.querySelectorAll('input, select, textarea'))
        .filter(field => !['button', 'submit', 'hidden'].includes(field.type) && field.value.trim())
        .map(field => {
          const label = field.labels && field.labels.length
            ? field.labels[0].textContent
            : field.closest('.form-group')?.querySelector('.form-label')?.textContent || field.placeholder;
          return `${(label || 'Details').replace(/\s*\*\s*/g, '').trim()}: ${field.value.trim()}`;
        });
      const message = `Hello Team RK Plumber, I have an enquiry:\n${details.join('\n')}`;
      const whatsappUrl = `https://wa.me/916232988023?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      showToast('WhatsApp is opening. Review your message and tap Send.');

      if (modalBackdrop && modalBackdrop.classList.contains('open')) {
        modalBackdrop.classList.remove('open');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      }
    });
  });

  function showToast(message) {
    let toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.backgroundColor = '#292a27';
    toast.style.color = '#ffffff';
    toast.style.borderLeft = '4px solid #b96c4b';
    toast.style.padding = '1rem 1.75rem';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 12px 30px rgba(0,0,0,0.35)';
    toast.style.zIndex = '100000';
    toast.style.fontSize = '0.95rem';
    toast.style.maxWidth = '90%';
    toast.style.fontWeight = '500';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s ease';
    toast.innerText = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  const quickContactDock = document.createElement('nav');
  quickContactDock.className = 'quick-contact-dock';
  quickContactDock.setAttribute('aria-label', 'Quick contact');
  quickContactDock.innerHTML = `
    <a class="quick-contact-link quick-contact-whatsapp" href="https://wa.me/916232988023" target="_blank" rel="noopener noreferrer" aria-label="Message Team RK Plumber on WhatsApp">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      <span>WhatsApp</span>
    </a>
    <a class="quick-contact-link quick-contact-call" href="tel:6232988023" aria-label="Call Team RK Plumber at 6232988023">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      <span>6232988023</span>
    </a>
  `;
  document.body.appendChild(quickContactDock);

  const instagramPopupKey = 'team-rk-instagram-popup-seen';
  let instagramPopupSeen = false;
  try {
    instagramPopupSeen = sessionStorage.getItem(instagramPopupKey) === 'true';
  } catch (error) {
    console.error('Unable to check Instagram popup session state:', error);
  }

  if (!instagramPopupSeen) {
    const instagramPopup = document.createElement('div');
    instagramPopup.className = 'instagram-popup-backdrop';
    instagramPopup.setAttribute('role', 'presentation');
    instagramPopup.innerHTML = `
      <section class="instagram-popup-card" role="dialog" aria-modal="true" aria-labelledby="instagram-popup-title" aria-describedby="instagram-popup-description" tabindex="-1">
        <button class="instagram-popup-close" type="button" aria-label="Close Instagram popup">&times;</button>
        <span class="instagram-popup-eyebrow">TEAM RK PLUMBER</span>
        <h2 id="instagram-popup-title">See all our work on Instagram</h2>
        <p id="instagram-popup-description">Explore photos and videos of our bathroom fitting and plumbing projects.</p>
        <a class="instagram-popup-visit" href="https://www.instagram.com/team_rk_plumber_lormi_/" target="_blank" rel="noopener noreferrer">Check our work on Instagram</a>
        <button class="instagram-popup-later" type="button">Maybe later</button>
      </section>
    `;
    document.body.appendChild(instagramPopup);

    const instagramPopupCard = instagramPopup.querySelector('.instagram-popup-card');
    const closeInstagramPopupButton = instagramPopup.querySelector('.instagram-popup-close');
    const dismissInstagramPopupButtons = instagramPopup.querySelectorAll('.instagram-popup-close, .instagram-popup-later');

    const closeInstagramPopup = () => {
      instagramPopup.classList.remove('open');
      document.body.classList.remove('instagram-popup-open');
    };

    const showInstagramPopup = () => {
      if (document.body.classList.contains('modal-open') || document.body.classList.contains('nav-open')) {
        window.setTimeout(showInstagramPopup, 2000);
        return;
      }

      try {
        sessionStorage.setItem(instagramPopupKey, 'true');
      } catch (error) {
        console.error('Unable to save Instagram popup session state:', error);
      }

      instagramPopup.classList.add('open');
      document.body.classList.add('instagram-popup-open');
      closeInstagramPopupButton.focus();
    };

    dismissInstagramPopupButtons.forEach(button => {
      button.addEventListener('click', closeInstagramPopup);
    });

    instagramPopup.querySelector('.instagram-popup-visit').addEventListener('click', closeInstagramPopup);
    instagramPopup.addEventListener('click', event => {
      if (event.target === instagramPopup) closeInstagramPopup();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && instagramPopup.classList.contains('open')) {
        closeInstagramPopup();
      } else if (event.key === 'Tab' && instagramPopup.classList.contains('open')) {
        const focusableButtons = instagramPopupCard.querySelectorAll('a, button');
        const firstButton = focusableButtons[0];
        const lastButton = focusableButtons[focusableButtons.length - 1];
        if (event.shiftKey && document.activeElement === firstButton) {
          event.preventDefault();
          lastButton.focus();
        } else if (!event.shiftKey && document.activeElement === lastButton) {
          event.preventDefault();
          firstButton.focus();
        }
      }
    });

    window.setTimeout(showInstagramPopup, 8000);
  }

});
