/**
 * Gestionnaire de formulaires simplifié pour ChezNous
 * Version simple sans étapes - Inscription directe
 */
class SimpleFormsManager {
    constructor() {
        this.validators = new Validators();
        this.initializeEventListeners();
        this.setupPasswordToggles();
        this.setupScreenReaderAnnouncements();
    }

    /**
     * Initialise tous les écouteurs d'événements
     */
    initializeEventListeners() {
        // Boutons d'ouverture des modales
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        // Ouverture des modales
        loginBtn?.addEventListener('click', (e) => this.openModal('loginModal', e));
        registerBtn?.addEventListener('click', (e) => this.openModal('registerModal', e));

        // Boutons de fermeture
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e));
        });

        // Commutation entre modales
        document.querySelectorAll('[data-switch-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const [fromModal, toModal] = btn.getAttribute('data-switch-modal').split(',');
                this.switchModal(fromModal, toModal, e);
            });
        });

        // Soumission des formulaires
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegisterSubmit(e));

        // Fermeture au clic sur le backdrop
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'DIALOG') {
                this.closeModal(e);
            }
        });

        // Fermeture à l'Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCurrentModal();
            }
        });

        // Validation en temps réel pour l'inscription
        this.setupRealtimeValidation();
    }

    /**
     * Configuration des boutons de basculement de mot de passe
     */
    setupPasswordToggles() {
        // Méthode 1: Liaison directe (si les éléments existent déjà)
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handlePasswordToggle(e));
        });
        
        // Méthode 2: Délégation d'événements (pour les éléments dynamiques)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.password-toggle')) {
                this.handlePasswordToggle(e);
            }
        });
        
        console.log('✅ [FORMS] Password toggles configurés:', toggleButtons.length, 'boutons trouvés');
    }

    /**
     * Gestionnaire pour le basculement de mot de passe
     */
    handlePasswordToggle(e) {
        e.preventDefault();
        
        const button = e.target.closest('.password-toggle');
        if (!button) return;
        
        const targetId = button.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const iconElement = button.querySelector('.password-toggle-icon');
        
        if (!passwordInput || !iconElement) {
            console.error('❌ [FORMS] Éléments password-toggle introuvables:', { targetId, passwordInput, iconElement });
            return;
        }
        
        try {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                iconElement.textContent = '🙈';
                button.setAttribute('aria-label', 'Masquer le mot de passe');
                console.log('✅ [FORMS] Mot de passe affiché pour:', targetId);
            } else {
                passwordInput.type = 'password';
                iconElement.textContent = '👁️';
                button.setAttribute('aria-label', 'Afficher le mot de passe');
                console.log('✅ [FORMS] Mot de passe masqué pour:', targetId);
            }
        } catch (error) {
            console.error('❌ [FORMS] Erreur lors du basculement du mot de passe:', error);
        }
    }

    /**
     * Configuration de la validation en temps réel
     */
    setupRealtimeValidation() {
        // Validation pour l'inscription
        const passwordInput = document.getElementById('registerPassword');
        const passwordConfirmInput = document.getElementById('registerPasswordConfirm');
        
        passwordInput?.addEventListener('input', () => {
            this.validatePassword(passwordInput);
        });
        
        passwordConfirmInput?.addEventListener('input', () => this.validatePasswordConfirmation());
    }

    /**
     * Valide le mot de passe (au moins 6 caractères, lettres, chiffres et caractères spéciaux autorisés)
     */
    validatePassword(passwordInput) {
        const password = passwordInput.value;
        const isValid = password.length >= 6;
        
        this.updateFieldValidation(passwordInput, isValid, isValid ? '' : 'Le mot de passe doit contenir au moins 6 caractères (lettres, chiffres et caractères spéciaux comme ! sont autorisés)');
        
        return isValid;
    }

    /**
     * Valide la confirmation de mot de passe
     */
    validatePasswordConfirmation() {
        const passwordInput = document.getElementById('registerPassword');
        const confirmInput = document.getElementById('registerPasswordConfirm');
        
        if (!passwordInput || !confirmInput) return false;

        const isValid = passwordInput.value === confirmInput.value;
        const errorMessage = isValid ? '' : 'Les mots de passe ne correspondent pas';
        
        this.updateFieldValidation(confirmInput, isValid, errorMessage);
        return isValid;
    }

    /**
     * Met à jour l'affichage de validation d'un champ
     */
    updateFieldValidation(field, isValid, errorMessage) {
        const errorElement = document.getElementById(field.getAttribute('aria-describedby')?.split(' ')[0]);
        
        field.setAttribute('aria-invalid', !isValid);
        
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = errorMessage ? 'block' : 'none';
        }
        
        // Styles visuels
        field.classList.toggle('error', !isValid);
        field.classList.toggle('valid', isValid && field.value.length > 0);
    }

    /**
     * Configuration des annonces pour lecteurs d'écran
     */
    setupScreenReaderAnnouncements() {
        if (!document.getElementById('sr-announcements')) {
            const announcer = document.createElement('div');
            announcer.id = 'sr-announcements';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
            document.body.appendChild(announcer);
        }
    }

    /**
     * Annonce un message aux lecteurs d'écran
     */
    announceToScreenReader(message) {
        const announcer = document.getElementById('sr-announcements');
        if (announcer) {
            announcer.textContent = message;
            setTimeout(() => announcer.textContent = '', 1000);
        }
    }

    /**
     * Ouvre une modale
     */
    openModal(modalId, event) {
        event?.preventDefault();
        
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Fermer toute modale ouverte
        this.closeAllModals();

        // Ouvrir la nouvelle modale
        modal.showModal();
        document.body.classList.add('modal-open');

        // Focus sur le premier champ
        const firstInput = modal.querySelector('input:not([type="hidden"])');
        setTimeout(() => firstInput?.focus(), 100);

        this.announceToScreenReader(`Modale ${modalId === 'loginModal' ? 'de connexion' : 'dinscription'} ouverte`);
    }

    /**
     * Ferme une modale
     */
    closeModal(event) {
        event?.preventDefault();
        
        const modal = event?.target.closest('dialog') || document.querySelector('dialog[open]');
        if (!modal) return;

        modal.close();
        document.body.classList.remove('modal-open');
        
        // Réinitialiser les formulaires
        const form = modal.querySelector('form');
        if (form) {
            this.resetForm(form);
        }

        this.announceToScreenReader('Modale fermée');
    }

    /**
     * Ferme la modale actuellement ouverte
     */
    closeCurrentModal() {
        const openModal = document.querySelector('dialog[open]');
        if (openModal) {
            this.closeModal({ target: openModal });
        }
    }

    /**
     * Ferme toutes les modales
     */
    closeAllModals() {
        const modals = document.querySelectorAll('dialog[open]');
        modals.forEach(modal => modal.close());
        document.body.classList.remove('modal-open');
    }

    /**
     * Bascule entre deux modales
     */
    switchModal(fromModalId, toModalId, event) {
        event?.preventDefault();
        
        const fromModal = document.getElementById(fromModalId);
        const toModal = document.getElementById(toModalId);
        
        if (!fromModal || !toModal) return;

        fromModal.close();
        setTimeout(() => {
            toModal.showModal();
            const firstInput = toModal.querySelector('input:not([type="hidden"])');
            firstInput?.focus();
        }, 100);
    }

    /**
     * Réinitialise un formulaire
     */
    resetForm(form) {
        form.reset();
        
        // Réinitialiser les états de validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.setAttribute('aria-invalid', 'false');
            input.classList.remove('error', 'valid');
        });
        
        // Vider les messages d'erreur
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }

    /**
     * Gestion de la soumission du formulaire de connexion
     */
    handleLoginSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        console.log('🔐 [LOGIN] Tentative de connexion:', Object.fromEntries(formData));
        
        // Ici, vous ajouteriez la logique de connexion
        alert('Connexion simulée ! (Développement en cours)');
    }

    /**
     * Gestion de la soumission du formulaire d'inscription
     */
    handleRegisterSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        
        // Validation finale
        if (!this.validateForm(form)) {
            console.log('❌ [REGISTER] Validation échouée');
            return;
        }
        
        const formData = new FormData(form);
        console.log('📝 [REGISTER] Tentative d\'inscription:', Object.fromEntries(formData));
        
        // Ici, vous ajouteriez la logique d'inscription
        alert('Inscription simulée ! (Développement en cours)');
        this.closeCurrentModal();
    }

    /**
     * Valide un formulaire complet
     */
    validateForm(form) {
        let isValid = true;
        
        // Validation des champs requis
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.updateFieldValidation(field, false, 'Ce champ est obligatoire');
                isValid = false;
            }
        });
        
        // Validation spécifique du mot de passe pour l'inscription
        if (form.id === 'registerForm') {
            const passwordInput = form.querySelector('#registerPassword');
            const confirmInput = form.querySelector('#registerPasswordConfirm');
            
            if (passwordInput && !this.validatePassword(passwordInput)) {
                isValid = false;
            }
            
            if (confirmInput && !this.validatePasswordConfirmation()) {
                isValid = false;
            }
        }
        
        return isValid;
    }
}

// Classe de validation simple (version allégée)
class Validators {
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    validatePassword(password) {
        return password.length >= 6;
    }
}

// Initialisation automatique quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        new SimpleFormsManager();
    }, 100);
});

// Initialisation de secours si DOMContentLoaded a déjà été déclenché
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => new SimpleFormsManager(), 100);
    });
} else {
    setTimeout(() => new SimpleFormsManager(), 100);
}
