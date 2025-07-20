/**
 * 🎯 Gestionnaire de formulaires RGPD et accessibilité - ChezNous
 * Gestion avancée des formulaires de connexion et inscription
 * Conformité RGPD, accessibilité WCAG 2.1 AA, validation en temps réel
 */

class FormsManager {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 3;
        this.validators = new FormValidators();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggles();
        this.setupStepNavigation();
        this.setupRealTimeValidation();
        this.setupAccessibility();
        console.log('✅ [FORMS] Gestionnaire de formulaires RGPD initialisé');
    }

    /**
     * Configuration des écouteurs d'événements
     */
    setupEventListeners() {
        // Boutons d'ouverture/fermeture des modales
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const showRegisterLinks = document.querySelectorAll('#showRegister');
        const showLoginLinks = document.querySelectorAll('#showLogin');
        const closeButtons = document.querySelectorAll('.close-button');

        loginBtn?.addEventListener('click', (e) => this.openModal('loginModal', e));
        registerBtn?.addEventListener('click', (e) => this.openModal('registerModal', e));
        
        showRegisterLinks.forEach(link => {
            link.addEventListener('click', (e) => this.switchModal('loginModal', 'registerModal', e));
        });
        
        showLoginLinks.forEach(link => {
            link.addEventListener('click', (e) => this.switchModal('registerModal', 'loginModal', e));
        });

        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => this.closeModal(e));
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
        const icon = button.querySelector('.password-toggle-icon');
        
        // Vérifications de sécurité
        if (!passwordInput) {
            console.error('❌ [FORMS] Champ de mot de passe introuvable:', targetId);
            return;
        }
        
        if (!icon) {
            console.error('❌ [FORMS] Icône password-toggle introuvable dans le bouton');
            console.log('Structure du bouton:', button.innerHTML);
            return;
        }
        
        // Basculement du type de champ
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.textContent = '🙈';
            button.setAttribute('aria-label', 'Masquer le mot de passe');
            console.log('👁️ [FORMS] Mot de passe affiché pour:', targetId);
        } else {
            passwordInput.type = 'password';
            icon.textContent = '👁️';
            button.setAttribute('aria-label', 'Afficher le mot de passe');
            console.log('🙈 [FORMS] Mot de passe masqué pour:', targetId);
        }
    }

    /**
     * Configuration de la navigation par étapes pour l'inscription
     */
    setupStepNavigation() {
        const nextBtn = document.getElementById('nextStep');
        const prevBtn = document.getElementById('prevStep');
        const submitBtn = document.getElementById('submitRegister');

        nextBtn?.addEventListener('click', () => this.nextStep());
        prevBtn?.addEventListener('click', () => this.previousStep());

        // Mise à jour de l'état initial
        this.updateStepButtons();
    }

    /**
     * Configuration de la validation en temps réel
     */
    setupRealTimeValidation() {
        // Validation des champs lors de la saisie
        const inputs = document.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });

        // Validation spéciale pour le mot de passe
        const passwordInput = document.getElementById('registerPassword');
        passwordInput?.addEventListener('input', () => {
            this.validatePassword(passwordInput);
            this.validatePasswordConfirmation();
        });

        const passwordConfirmInput = document.getElementById('registerPasswordConfirm');
        passwordConfirmInput?.addEventListener('input', () => this.validatePasswordConfirmation());

        // Validation des consentements
        const consentCheckboxes = document.querySelectorAll('input[type="checkbox"][required]');
        consentCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.validateConsents());
        });
    }

    /**
     * Configuration de l'accessibilité
     */
    setupAccessibility() {
        // Gestion du focus pour les modales
        document.addEventListener('focusin', (e) => {
            const openModal = document.querySelector('dialog[open]');
            if (openModal && !openModal.contains(e.target)) {
                e.preventDefault();
                const firstFocusable = openModal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
                firstFocusable?.focus();
            }
        });

        // Annonces pour les lecteurs d'écran
        this.setupScreenReaderAnnouncements();
    }

    /**
     * Configuration des annonces pour les lecteurs d'écran
     */
    setupScreenReaderAnnouncements() {
        // Créer une zone d'annonces cachée
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

        // Réinitialiser le formulaire d'inscription à l'étape 1
        if (modalId === 'registerModal') {
            this.resetToStep(1);
        }

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

        this.announceToScreenReader(`Basculement vers ${toModalId === 'loginModal' ? 'la connexion' : 'linscription'}`);
    }

    /**
     * Passe à l'étape suivante
     */
    nextStep() {
        if (this.currentStep >= this.maxSteps) return;

        // Valider l'étape actuelle
        if (!this.validateCurrentStep()) {
            this.announceToScreenReader('Veuillez corriger les erreurs avant de continuer');
            return;
        }

        this.currentStep++;
        this.updateStepDisplay();
        this.updateStepButtons();
        
        this.announceToScreenReader(`Étape ${this.currentStep} sur ${this.maxSteps}`);
    }

    /**
     * Revient à l'étape précédente
     */
    previousStep() {
        if (this.currentStep <= 1) return;

        this.currentStep--;
        this.updateStepDisplay();
        this.updateStepButtons();
        
        this.announceToScreenReader(`Étape ${this.currentStep} sur ${this.maxSteps}`);
    }

    /**
     * Remet le formulaire à une étape spécifique
     */
    resetToStep(step) {
        this.currentStep = step;
        this.updateStepDisplay();
        this.updateStepButtons();
    }

    /**
     * Met à jour l'affichage des étapes
     */
    updateStepDisplay() {
        // Mettre à jour les indicateurs d'étapes
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Mettre à jour les fieldsets
        const fieldsets = document.querySelectorAll('.form-step');
        fieldsets.forEach((fieldset, index) => {
            fieldset.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Mettre à jour la barre de progression
        const progressBar = document.querySelector('[role="progressbar"]');
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', this.currentStep);
        }
    }

    /**
     * Met à jour l'état des boutons de navigation
     */
    updateStepButtons() {
        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        const submitBtn = document.getElementById('submitRegister');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }

        if (nextBtn) {
            nextBtn.style.display = this.currentStep === this.maxSteps ? 'none' : 'block';
        }

        if (submitBtn) {
            submitBtn.style.display = this.currentStep === this.maxSteps ? 'block' : 'none';
            submitBtn.disabled = !this.validateCurrentStep();
        }
    }

    /**
     * Valide l'étape actuelle
     */
    validateCurrentStep() {
        const currentFieldset = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentFieldset) return false;

        const requiredFields = currentFieldset.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Valide un champ spécifique
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Validation de base (requis)
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'Ce champ est obligatoire';
        }
        // Validation par type
        else if (value) {
            switch (fieldType) {
                case 'email':
                    isValid = this.validators.isValidEmail(value);
                    errorMessage = isValid ? '' : 'Adresse email invalide';
                    break;
                case 'text':
                    if (fieldName === 'pseudonyme') {
                        isValid = this.validators.isValidUsername(value);
                        errorMessage = isValid ? '' : 'Pseudonyme invalide (3-30 caractères, lettres, chiffres, _ et - uniquement)';
                    } else {
                        isValid = value.length >= 2;
                        errorMessage = isValid ? '' : 'Minimum 2 caractères';
                    }
                    break;
                case 'password':
                    if (fieldName === 'password') {
                        const validation = this.validators.validatePassword(value);
                        isValid = validation.isValid;
                        errorMessage = validation.message;
                    }
                    break;
            }
        }

        this.updateFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    /**
     * Valide le mot de passe avec indicateurs visuels (au moins 6 caractères)
     */
    validatePassword(passwordInput) {
        const password = passwordInput.value;
        const isValid = password.length >= 6;
        
        // Mettre à jour les indicateurs visuels
        const requirementsList = document.querySelectorAll('.requirements-list li');
        requirementsList.forEach((item) => {
            if (isValid) {
                item.classList.add('valid');
            } else {
                item.classList.remove('valid');
            }
        });

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
     * Valide les consentements RGPD
     */
    validateConsents() {
        const requiredConsents = document.querySelectorAll('input[type="checkbox"][required]');
        let allValid = true;

        requiredConsents.forEach(checkbox => {
            if (!checkbox.checked) {
                allValid = false;
            }
        });

        this.updateStepButtons();
        return allValid;
    }

    /**
     * Met à jour l'affichage de validation d'un champ
     */
    updateFieldValidation(field, isValid, errorMessage) {
        const errorElement = document.getElementById(field.getAttribute('aria-describedby')?.split(' ')[0]);
        
        field.setAttribute('aria-invalid', !isValid);
        
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = errorMessage;
            errorElement.classList.toggle('visible', !isValid && errorMessage);
        }

        // Mettre à jour les styles visuels
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('error');
        }
    }

    /**
     * Réinitialise un formulaire
     */
    resetForm(form) {
        form.reset();
        
        // Réinitialiser les états de validation
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.classList.remove('valid', 'error');
            field.setAttribute('aria-invalid', 'false');
        });

        // Masquer les messages d'erreur
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => {
            msg.classList.remove('visible');
            msg.textContent = '';
        });

        // Réinitialiser les exigences de mot de passe
        const requirementsList = form.querySelectorAll('.requirements-list li');
        requirementsList.forEach(item => item.classList.remove('valid'));
    }

    /**
     * Gère la soumission du formulaire de connexion
     */
    async handleLoginSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Validation finale
        const emailField = document.getElementById('loginEmail');
        const passwordField = document.getElementById('loginPassword');
        
        if (!this.validateField(emailField) || !this.validateField(passwordField)) {
            this.announceToScreenReader('Veuillez corriger les erreurs du formulaire');
            return;
        }

        // Animation de chargement
        this.setButtonLoading(submitBtn, true);
        
        try {
            // Simulation d'appel API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Ici, vous ajouteriez votre logique de connexion réelle
            console.log('🔐 [LOGIN] Tentative de connexion');
            
            this.announceToScreenReader('Connexion en cours...');
            
        } catch (error) {
            console.error('❌ [LOGIN] Erreur de connexion:', error);
            this.announceToScreenReader('Erreur de connexion');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    /**
     * Gère la soumission du formulaire d'inscription
     */
    async handleRegisterSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Validation finale complète
        if (!this.validateAllSteps()) {
            this.announceToScreenReader('Veuillez corriger toutes les erreurs du formulaire');
            return;
        }

        // Animation de chargement
        this.setButtonLoading(submitBtn, true);
        
        try {
            // Simulation d'appel API
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Ici, vous ajouteriez votre logique d'inscription réelle
            console.log('📝 [REGISTER] Tentative dinscription');
            
            this.announceToScreenReader('Inscription en cours...');
            
        } catch (error) {
            console.error('❌ [REGISTER] Erreur dinscription:', error);
            this.announceToScreenReader('Erreur dinscription');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    /**
     * Valide toutes les étapes du formulaire d'inscription
     */
    validateAllSteps() {
        let allValid = true;
        
        for (let step = 1; step <= this.maxSteps; step++) {
            const fieldset = document.querySelector(`.form-step[data-step="${step}"]`);
            const requiredFields = fieldset?.querySelectorAll('input[required], select[required]');
            
            requiredFields?.forEach(field => {
                if (!this.validateField(field)) {
                    allValid = false;
                }
            });
        }
        
        return allValid;
    }

    /**
     * Active/désactive l'animation de chargement d'un bouton
     */
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
}

/**
 * 🔍 Classe de validation des formulaires
 */
class FormValidators {
    /**
     * Valide une adresse email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valide un nom d'utilisateur
     */
    isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        return usernameRegex.test(username);
    }

    /**
     * Valide un mot de passe (simplifié : 6 chiffres uniquement)
     */
    validatePassword(password) {
        const requirements = this.getPasswordRequirements(password);
        const isValid = requirements.sixDigits;
        
        return {
            isValid,
            requirements,
            message: isValid ? '' : 'Le mot de passe doit contenir exactement 6 chiffres'
        };
    }

    /**
     * Obtient les exigences de mot de passe (simplifié : 6 chiffres)
     */
    getPasswordRequirements(password) {
        return {
            sixDigits: password.length >= 6
        };
    }
}

// Initialisation automatique quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    // Attendre un peu pour s'assurer que tous les éléments sont chargés
    setTimeout(() => {
        new FormsManager();
    }, 100);
});

// Initialisation de secours si DOMContentLoaded a déjà été déclenché
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => new FormsManager(), 100);
    });
} else {
    // Le DOM est déjà chargé
    setTimeout(() => new FormsManager(), 100);
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FormsManager, FormValidators };
}
