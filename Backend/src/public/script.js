/**
 * ============================================
 * 🚀 SCRIPT PRINCIPAL OPTIMISÉ - CHEZNOUS
 * ============================================
 * 
 * Organisation du code :
 * 1. Configuration et initialisation
 * 2. Gestionnaire de modales
 * 3. Gestionnaire de formulaires
 * 4. Gestionnaire de chat et ergonomie
 * 5. Gestionnaire d'authentification
 * 6. Gestionnaire d'amis et profils
 * 7. Gestionnaire de notifications Socket.IO
 * 
 * Version optimisée - Sans doublons - Console logs détaillés
 */

// ============================================
// 1. CONFIGURATION ET INITIALISATION
// ============================================

console.log('🚀 [INIT] Démarrage de l\'application ChezNous');

// Configuration Socket.IO avec URL dynamique
const socket = io(API_CONFIG.SOCKET_URL, {
    withCredentials: false,
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000
});

// Exposer socket globalement
window.socket = socket;
console.log('🔌 [SOCKET] Configuration Socket.IO initialisée');

// Variables globales pour la gestion des amis
let membres = [];
let amisConfirmes = [];
let demandesEnvoyees = [];
let demandesRecues = [];

// Sélection des éléments DOM principaux
const elements = {
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    closeBtns: document.querySelectorAll('.close-button'),
    featuredList: document.getElementById('featuredList'),
    topicsGrid: document.querySelector('#topicsGrid ul'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    chatWindow: document.getElementById('chat-window')
};

console.log('📋 [DOM] Éléments DOM sélectionnés:', Object.keys(elements).length, 'éléments');

// ============================================
// 2. GESTIONNAIRE DE MODALES MODERNE
// ============================================

const ModalManager = {
    /**
     * Ouvre une modale avec gestion d'accessibilité
     */
    open(modal) {
        if (!modal || !modal.showModal) {
            console.error('❌ [MODAL] Modale invalide ou non supportée');
            return;
        }
        
        modal.showModal();
        document.body.classList.add('modal-open');
        
        // Charger l'email mémorisé pour la modal de connexion
        if (modal.id === 'loginModal') {
            AuthManager.loadRememberedEmail();
        }
        
        // Focus automatique sur le premier champ
        const firstInput = modal.querySelector('input[type="text"], input[type="email"]');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        console.log('✅ [MODAL] Modale ouverte:', modal.id);
    },

    /**
     * Ferme une modale avec nettoyage
     */
    close(modal) {
        if (!modal || !modal.close) {
            console.error('❌ [MODAL] Modale invalide pour fermeture');
            return;
        }
        
        modal.close();
        document.body.classList.remove('modal-open');
        
        // Réinitialiser le formulaire si présent
        const form = modal.querySelector('form');
        if (form) {
            FormManager.resetForm(form);
        }
        
        console.log('❌ [MODAL] Modale fermée:', modal.id);
    },

    /**
     * Gestion accessible du clavier
     */
    handleKeydown(event, modal) {
        if (event.key === 'Escape') {
            this.close(modal);
            return;
        }
        
        // Piégeage du focus dans la modale
        if (event.key === 'Tab') {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }
};

console.log('✅ [MODAL] Gestionnaire de modales initialisé');

// ============================================
// 3. GESTIONNAIRE DE FORMULAIRES OPTIMISÉ
// ============================================

const FormManager = {
    /**
     * Configuration de la validation en temps réel
     */
    setupRealtimeValidation() {
        // Configuration pour tous les formulaires
        document.querySelectorAll('.form-input, input').forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
                this.updateSubmitButtonState(input.form);
            });

            input.addEventListener('focus', () => {
                input.closest('.form-group')?.classList.add('focused');
                console.log('🎯 [FORM] Focus sur:', input.name || input.id || 'champ anonyme');
            });

            input.addEventListener('blur', () => {
                input.closest('.form-group')?.classList.remove('focused');
                this.updateSubmitButtonState(input.form);
            });
        });
        
        // Configuration spéciale pour les formulaires d'auth
        this.setupAuthFormValidation();
        
        console.log('✅ [FORM] Validation en temps réel configurée');
    },

    /**
     * Configuration spécialisée pour les formulaires d'authentification
     */
    setupAuthFormValidation() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            const inputs = loginForm.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('input', () => this.updateSubmitButtonState(loginForm));
                input.addEventListener('blur', () => this.updateSubmitButtonState(loginForm));
            });
            // Activer immédiatement si déjà valide
            this.updateSubmitButtonState(loginForm);
        }
        
        if (registerForm) {
            const inputs = registerForm.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('input', () => this.updateSubmitButtonState(registerForm));
                input.addEventListener('blur', () => this.updateSubmitButtonState(registerForm));
            });
            // Activer immédiatement si déjà valide
            this.updateSubmitButtonState(registerForm);
        }
        
        console.log('✅ [FORM] Validation des formulaires d\'auth configurée');
    },

    /**
     * Met à jour l'état du bouton de soumission selon la validité du formulaire
     */
    updateSubmitButtonState(form) {
        if (!form) return;
        
        const submitButton = form.querySelector('button[type="submit"], .btn-primary');
        if (!submitButton) return;
        
        const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;
        
        // Vérifier chaque champ requis - validation simplifiée
        for (const field of requiredFields) {
            const value = field.value.trim();
            
            // Validation basique : juste vérifier que le champ n'est pas vide
            if (!value) {
                isValid = false;
                break;
            }
            
            // Validation spéciale pour l'email - plus permissive
            if (field.type === 'email' && !value.includes('@')) {
                isValid = false;
                break;
            }
            
            // Validation pour mot de passe : au moins 6 caractères (lettres, chiffres et caractères spéciaux autorisés)
            if (field.type === 'password' && value.length < 6) {
                isValid = false;
                break;
            }
        }
        
        // Vérification pour la confirmation de mot de passe (seulement si présente)
        const passwordField = form.querySelector('input[name="password"]');
        const confirmField = form.querySelector('input[name="passwordConfirm"]');
        if (passwordField && confirmField && confirmField.value.length > 0) {
            if (passwordField.value !== confirmField.value) {
                isValid = false;
            }
        }

        // Mettre à jour l'état du bouton
        submitButton.disabled = !isValid;
        
        if (isValid) {
            submitButton.classList.remove('disabled');
            submitButton.setAttribute('aria-disabled', 'false');
        } else {
            submitButton.classList.add('disabled');
            submitButton.setAttribute('aria-disabled', 'true');
        }
        
        console.log('🔄 [FORM] Bouton de soumission mis à jour:', isValid ? 'activé' : 'désactivé', form.id || 'formulaire');
    },

    /**
     * Valide un champ individuel
     */
    validateField(field) {
        field.classList.remove('error', 'success');
        
        const value = field.value.trim();
        if (value && field.checkValidity()) {
            field.classList.add('success');
        } else if (value && !field.checkValidity()) {
            field.classList.add('error');
        }
    },

    /**
     * Réinitialise un formulaire
     */
    resetForm(form) {
        form.reset();
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.setAttribute('aria-invalid', 'false');
            input.classList.remove('error', 'success');
        });
        
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        
        console.log('🔄 [FORM] Formulaire réinitialisé');
    },

    /**
     * Gestion des boutons toggle mot de passe
     */
    setupPasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = toggle.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                const icon = toggle.querySelector('.password-toggle-icon, .toggle-icon');
                
                if (!passwordInput || !icon) {
                    console.error('❌ [FORM] Éléments password-toggle introuvables:', targetId);
                    return;
                }
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.textContent = '🙈';
                    toggle.setAttribute('aria-label', 'Masquer le mot de passe');
                    console.log('👁️ [FORM] Mot de passe visible pour:', targetId);
                } else {
                    passwordInput.type = 'password';
                    icon.textContent = '👁️';
                    toggle.setAttribute('aria-label', 'Afficher le mot de passe');
                    console.log('🔒 [FORM] Mot de passe masqué pour:', targetId);
                }
            });
        });
        
        console.log('✅ [FORM] Boutons toggle mot de passe configurés');
    }
};

// ============================================
// 4. GESTIONNAIRE DE CHAT ET ERGONOMIE
// ============================================

const ChatManager = {
    /**
     * Configuration de l'ergonomie du chat
     */
    setupChatErgonomics() {
        if (!elements.chatInput) {
            console.log('ℹ️ [CHAT] Pas de champ de chat trouvé');
            return;
        }
        
        // Auto-resize du textarea
        elements.chatInput.addEventListener('input', () => {
            this.autoResizeTextarea(elements.chatInput);
            this.updateCharCounter();
            this.updateSendButton();
        });
        
        // Gestion des touches spéciales
        elements.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                if (!elements.sendBtn.disabled && typeof envoyerMessageChat === 'function') {
                    envoyerMessageChat();
                }
            }
        });
        
        // Focus et placeholder dynamiques
        elements.chatInput.addEventListener('focus', function() {
            this.placeholder = '💬 Tapez votre message... (Ctrl+Entrée pour envoyer)';
        });
        
        elements.chatInput.addEventListener('blur', function() {
            this.placeholder = '💬 Tapez votre message...';
        });
        
        // Initialisation
        this.updateCharCounter();
        this.updateSendButton();
        this.autoResizeTextarea(elements.chatInput);
        
        console.log('✅ [CHAT] Ergonomie du chat configurée');
    },

    /**
     * Auto-resize du textarea
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 120;
        textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
        textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    },

    /**
     * Met à jour le compteur de caractères
     */
    updateCharCounter() {
        const charCounter = document.getElementById('charCounter');
        if (!charCounter || !elements.chatInput) return;
        
        const length = elements.chatInput.value.length;
        const maxLength = 500;
        charCounter.textContent = `${length}/${maxLength}`;
        
        charCounter.className = 'char-counter';
        if (length > maxLength * 0.9) {
            charCounter.classList.add('danger');
        } else if (length > maxLength * 0.7) {
            charCounter.classList.add('warning');
        }
        
        if (elements.sendBtn) {
            elements.sendBtn.disabled = length > maxLength;
        }
    },

    /**
     * Met à jour l'état du bouton d'envoi
     */
    updateSendButton() {
        if (!elements.sendBtn || !elements.chatInput) return;
        
        const hasText = elements.chatInput.value.trim().length > 0;
        const isNotTooLong = elements.chatInput.value.length <= 500;
        
        elements.sendBtn.disabled = !hasText || !isNotTooLong;
        elements.sendBtn.style.opacity = (hasText && isNotTooLong) ? '1' : '0.6';
        elements.sendBtn.style.transform = (hasText && isNotTooLong) ? 'scale(1)' : 'scale(0.95)';
    }
};

// ============================================
// 5. GESTIONNAIRE D'AUTHENTIFICATION
// ============================================

const AuthManager = {
    /**
     * Gestion de la connexion
     */
    async handleLogin(e) {
        e.preventDefault();
        console.log('🔑 [AUTH] === DÉBUT HANDLELOGIN ===');
        
        try {
            const emailElement = document.getElementById('loginEmail');
            const passwordElement = document.getElementById('loginPassword');
            
            if (!emailElement || !passwordElement) {
                console.error('❌ [AUTH] Éléments de formulaire introuvables');
                alert('Erreur : Éléments de formulaire introuvables');
                return;
            }
            
            const email = emailElement.value.trim();
            const password = passwordElement.value.trim();
            
            console.log('📋 [DEBUG] Valeurs récupérées:');
            console.log('  Email:', email);
            console.log('  Password:', password ? '[MASQUÉ - ' + password.length + ' caractères]' : '[VIDE]');
            
            // Validation côté client
            if (!email || !password) {
                alert('Veuillez remplir tous les champs (email et mot de passe).');
                console.log('❌ [AUTH] Champs manquants - email:', !!email, 'password:', !!password);
                return;
            }
            
            if (!email.includes('@')) {
                alert('Veuillez entrer une adresse email valide.');
                console.log('❌ [AUTH] Email invalide:', email);
                return;
            }
            
            if (password.length < 6) {
                alert('Le mot de passe doit contenir au moins 6 caractères (lettres, chiffres et caractères spéciaux comme ! sont autorisés).');
                console.log('❌ [AUTH] Mot de passe invalide - longueur:', password.length);
                return;
            }
            
            console.log('🌐 [AUTH] Envoi de la requête vers', API_CONFIG.url('/users/login'));
            
            const response = await fetch(API_CONFIG.url('/users/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            console.log('📊 [AUTH] Réponse reçue - Status:', response.status, response.statusText);
            
            const text = await response.text();
            console.log('📜 [AUTH] Texte de la réponse:', text);
            
            const result = text ? JSON.parse(text) : {};
            
            console.log('📨 [AUTH] Réponse serveur connexion:', result);
            
            if (response.ok) {
                console.log('✅ [AUTH] Connexion réussie');
                
                // Sauvegarder l'email pour les prochaines connexions
                localStorage.setItem('rememberedEmail', email);
                console.log('💾 [AUTH] Email mémorisé pour les prochaines connexions');
                
                localStorage.setItem('user', JSON.stringify({
                    _id: result._id,
                    email: result.email,
                    nom: result.nom,
                    prenom: result.prenom,
                    pseudonyme: result.pseudonyme,
                    region: result.region,
                    role: result.role
                }));
                
                ModalManager.close(elements.loginModal);
                AuthManager.updateUserInterface();
                
                // Enregistrer l'utilisateur sur le socket
                socket.emit('register user', result);
                console.log('👤 [SOCKET] Utilisateur enregistré:', result.pseudonyme || result.nom);
                
                // LOG VISIBLE CONNEXION CÔTÉ CLIENT
                console.log('');
                console.log('🟢 ================================');
                console.log('🟢 CONNEXION RÉUSSIE');
                console.log('🟢 ================================');
                console.log(`🟢 Utilisateur: ${result.nom} ${result.prenom}`);
                console.log(`🟢 Email: ${result.email}`);
                console.log(`🟢 Pseudonyme: ${result.pseudonyme || 'Non défini'}`);
                console.log(`🟢 Région: ${result.region || 'Non définie'}`);
                console.log(`🟢 Rôle: ${result.role || 'membre'}`);
                console.log(`🟢 Heure: ${new Date().toLocaleString('fr-FR')}`);
                console.log('🟢 ================================');
                console.log('');
                
                location.reload();
            } else {
                console.error('❌ [AUTH] Erreur connexion:', result.message);
                console.log('ℹ️ [AUTH] Échec de connexion - voir la console pour les détails');
            }
        } catch (error) {
            console.error('💥 [AUTH] Erreur connexion:', error);
            console.error('🔍 [DEBUG] Détails erreur:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            
            // Message d'erreur supprimé - seuls les logs console sont conservés pour le débogage
            console.log('ℹ️ [AUTH] Connexion échouée - voir les détails dans la console');
        }
    },

    /**
     * Gestion de l'inscription
     */
    async handleRegister(e) {
        e.preventDefault();
        console.log('📝 [AUTH] Tentative d\'inscription');
        
        const formData = new FormData(e.target);
        const userData = {
            nom: formData.get('nom'),
            prenom: formData.get('prenom'),
            email: formData.get('email'),
            password: formData.get('password'),
            // Ajouter les champs manquants requis par le backend
            pseudonyme: formData.get('prenom') || 'Membre', // Utiliser le prénom comme pseudonyme par défaut
            region: 'Non spécifiée' // Valeur par défaut pour la région
        };
        
        try {
            const response = await fetch(API_CONFIG.url('/users/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const text = await response.text();
            const result = text ? JSON.parse(text) : {};
            
            console.log('📨 [AUTH] Réponse serveur inscription:', result);

            if (response.ok) {
                console.log('✅ [AUTH] Inscription réussie');
                
                // Sauvegarder l'email pour les prochaines connexions
                localStorage.setItem('rememberedEmail', userData.email);
                console.log('💾 [AUTH] Email mémorisé après inscription');
                
                // Sauvegarder automatiquement l'utilisateur nouvellement inscrit
                localStorage.setItem('user', JSON.stringify({
                    _id: result._id,
                    email: result.email,
                    nom: result.nom,
                    prenom: result.prenom,
                    pseudonyme: result.pseudonyme,
                    region: result.region,
                    role: result.role || 'membre'
                }));
                
                ModalManager.close(elements.registerModal);
                
                // Connecter automatiquement l'utilisateur
                AuthManager.updateUserInterface();
                
                // Enregistrer l'utilisateur sur le socket
                socket.emit('register user', result);
                console.log('👤 [SOCKET] Nouvel utilisateur enregistré:', result.pseudonyme || result.nom);
                
                // LOG VISIBLE INSCRIPTION CÔTÉ CLIENT
                console.log('');
                console.log('🟢 ================================');
                console.log('🟢 INSCRIPTION RÉUSSIE');
                console.log('🟢 ================================');
                console.log(`🟢 Nouvel utilisateur: ${result.nom} ${result.prenom}`);
                console.log(`🟢 Email: ${result.email}`);
                console.log(`🟢 Pseudonyme: ${result.pseudonyme || 'Non défini'}`);
                console.log(`🟢 Région: ${result.region || 'Non définie'}`);
                console.log(`🟢 Rôle: ${result.role || 'membre'}`);
                console.log(`🟢 Heure: ${new Date().toLocaleString('fr-FR')}`);
                console.log('🟢 ================================');
                console.log('');
                
                alert('Inscription réussie ! Vous êtes maintenant connecté.');
                
                // Recharger la page pour afficher l'interface utilisateur connecté
                location.reload();
                
            } else {
                console.error('❌ [AUTH] Erreur inscription:', result.message);
                alert(result.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('💥 [AUTH] Erreur inscription:', error);
            console.error('🔍 [DEBUG] Détails erreur:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            
            let errorMessage = 'Erreur d\'inscription. ';
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += 'Vérifiez que le serveur est accessible sur ' + API_CONFIG.BASE_URL;
            } else if (error.name === 'SyntaxError') {
                errorMessage += 'Réponse du serveur invalide.';
            } else {
                errorMessage += 'Veuillez réessayer.';
            }
            
            alert(errorMessage);
        }
    },

    /**
     * Gestion de la déconnexion
     */
    handleLogout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            const user = JSON.parse(localStorage.getItem('user'));
            
            // LOG VISIBLE DÉCONNEXION CÔTÉ CLIENT
            if (user) {
                console.log('');
                console.log('🔴 ================================');
                console.log('🔴 DÉCONNEXION');
                console.log('🔴 ================================');
                console.log(`🔴 Utilisateur: ${user.nom} ${user.prenom}`);
                console.log(`🔴 Email: ${user.email}`);
                console.log(`🔴 Pseudonyme: ${user.pseudonyme || 'Non défini'}`);
                console.log(`🔴 Heure: ${new Date().toLocaleString('fr-FR')}`);
                console.log('🔴 ================================');
                console.log('');
            }
            
            console.log('🚪 [AUTH] Déconnexion utilisateur');
            
            // Envoyer un événement de déconnexion explicite au serveur
            if (socket && socket.connected) {
                socket.emit('manual disconnect', { user: user });
                console.log('📤 [SOCKET] Événement de déconnexion envoyé au serveur');
                
                // Attendre un peu pour que le serveur traite l'événement
                setTimeout(() => {
                    localStorage.removeItem('user');
                    location.reload();
                }, 200);
            } else {
                localStorage.removeItem('user');
                location.reload();
            }
        }
    },

    /**
     * Met à jour l'interface utilisateur selon l'état de connexion
     */
    updateUserInterface() {
        const user = JSON.parse(localStorage.getItem('user'));
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const accountBtn = document.getElementById('accountBtn');
        const userName = document.getElementById('userName');
        const profilSection = document.getElementById('profilSection');

        if (user) {
            // Ne plus modifier le bouton loginBtn car navigation.js s'en charge
            // loginBtn.textContent = 'Déconnexion'; // Supprimé pour éviter conflit
            if (registerBtn) registerBtn.style.display = 'none';
            if (accountBtn) accountBtn.style.display = '';
            if (userName) userName.textContent = user.pseudonyme || user.nom || user.email;
            
            this.displayUserProfile(user);
            if (profilSection) profilSection.style.display = 'block';
            
            // Charger les relations d'amis
            FriendsManager.loadRelations();
            
            // Afficher les sections connectées (avec vérification d'existence)
            const amisSection = document.getElementById('amisConfirmesSection');
            if (amisSection) amisSection.style.display = 'block';
            
            const membresSection = document.getElementById('membresNonAmisSection');
            if (membresSection) membresSection.style.display = 'block';
            
            // Afficher la section Liste des membres
            const listeMembresSection = document.getElementById('listeMembresSection');
            if (listeMembresSection) listeMembresSection.style.display = 'block';
            
            // Panneau admin si nécessaire (avec vérification d'existence)
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel) adminPanel.style.display = user.role === 'admin' ? 'block' : 'none';
            
            console.log('✅ [AUTH] Interface utilisateur mise à jour pour:', user.pseudonyme || user.nom);
        } else {
            // Ne plus modifier le bouton loginBtn car navigation.js s'en charge
            // loginBtn.textContent = 'Connexion'; // Supprimé pour éviter conflit
            if (registerBtn) registerBtn.style.display = '';
            if (accountBtn) accountBtn.style.display = 'none';
            if (userName) userName.textContent = '';
            if (profilSection) profilSection.style.display = 'none';
            
            // Masquer les sections nécessitant une connexion (avec vérification d'existence)
            const amisSectionDisconnect = document.getElementById('amisConfirmesSection');
            if (amisSectionDisconnect) amisSectionDisconnect.style.display = 'none';
            
            const membresSectionDisconnect = document.getElementById('membresNonAmisSection');
            if (membresSectionDisconnect) membresSectionDisconnect.style.display = 'none';
            
            // Masquer la section Liste des membres
            const listeMembresSectionDisconnect = document.getElementById('listeMembresSection');
            if (listeMembresSectionDisconnect) listeMembresSectionDisconnect.style.display = 'none';
            
            console.log('ℹ️ [AUTH] Interface en mode déconnecté');
        }
    },

    /**
     * Affiche le profil utilisateur
     */
    displayUserProfile(user) {
        if (!user) return;
        
        const profilNom = document.getElementById('profilNom');
        const profilPrenom = document.getElementById('profilPrenom');
        const profilPseudo = document.getElementById('profilPseudo');
        const profilRegion = document.getElementById('profilRegion');
        const profilEmail = document.getElementById('profilEmail');
        const profilRole = document.getElementById('profilRole');
        
        if (profilNom) profilNom.textContent = user.nom || '';
        if (profilPrenom) profilPrenom.textContent = user.prenom || '';
        if (profilPseudo) profilPseudo.textContent = user.pseudonyme || '';
        if (profilRegion) profilRegion.textContent = user.region || '';
        
        // Email masqué pour RGPD
        const email = user.email || '';
        let emailMasque = '';
        if (email) {
            const [partie1, partie2] = email.split('@');
            if (partie1 && partie2) {
                const debutMasque = partie1.length > 2 ? partie1.substring(0, 2) : partie1;
                emailMasque = debutMasque + '**@' + partie2;
            } else {
                emailMasque = 'e***@***.***';
            }
        }
        if (profilEmail) profilEmail.textContent = emailMasque;
        
        // Rôle en français
        const roleAffiche = user.role === 'admin' ? 'Administrateur' : 'Membre';
        if (profilRole) profilRole.textContent = roleAffiche;
        
        console.log('👤 [AUTH] Profil affiché pour:', user.pseudonyme || user.nom);
    },

    /**
     * Charge l'email mémorisé dans le formulaire de connexion
     */
    loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        const emailInput = document.getElementById('loginEmail');
        
        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail;
            console.log('📧 [AUTH] Email mémorisé chargé:', rememberedEmail);
            
            // Déclencher la validation du formulaire pour activer le bouton si nécessaire
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                FormManager.updateSubmitButtonState(loginForm);
            }
        }
    }
};

// ============================================
// 6. GESTIONNAIRE D'AMIS ET PROFILS
// ============================================

const FriendsManager = {
    /**
     * Charge toutes les relations (membres, amis, demandes)
     */
    async loadRelations() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user._id) {
            console.log('ℹ️ [FRIENDS] Pas d\'utilisateur connecté pour charger les relations');
            return;
        }

        try {
            // Récupérer tous les membres
            const resMembres = await fetch(API_CONFIG.url(`/friends/membres?userId=${user._id}`));
            membres = await resMembres.json();

            // Récupérer amis pour écriture dans profil
            const resAmis = await fetch(API_CONFIG.url(`/friends/amis?userId=${user._id}`));
            amisConfirmes = await resAmis.json();

            // Récupérer demandes envoyées
            const resEnv = await fetch(API_CONFIG.url(`/friends/demandes-envoyees?userId=${user._id}`));
            demandesEnvoyees = await resEnv.json();

            // Récupérer demandes reçues
            const resRec = await fetch(API_CONFIG.url(`/friends/demandes-recues?userId=${user._id}`));
            demandesRecues = await resRec.json();

            this.displayConfirmedFriends();
            this.displayNonFriendMembers();
            
            console.log('✅ [FRIENDS] Relations chargées:', {
                membres: membres.length,
                amis: amisConfirmes.length,
                envoyees: demandesEnvoyees.length,
                recues: demandesRecues.length
            });
        } catch (error) {
            console.error('❌ [FRIENDS] Erreur lors du chargement des relations:', error);
        }
    },

    /**
     * Affiche la liste des amis pour écrire dans leur profil
     */
    displayConfirmedFriends() {
        const ul = document.getElementById('listeAmisConfirmes');
        if (!ul) return;
        
        ul.innerHTML = '';
        amisConfirmes.forEach(ami => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${ami.nom} ${ami.prenom}</span>
                <button class="cta-ami" disabled>Ami confirmé</button>
            `;
            ul.appendChild(li);
        });
        
        console.log('✍️ [FRIENDS] Section "Ecrire dans le profil d\'un ami" affichée:', amisConfirmes.length);
    },

    /**
     * Affiche la liste des membres non amis
     */
    displayNonFriendMembers() {
        const user = JSON.parse(localStorage.getItem('user'));
        const ul = document.getElementById('listeMembresNonAmis');
        if (!ul) return;
        
        ul.innerHTML = '';
        membres.forEach(membre => {
            if (membre._id === user._id) return; // Ne pas s'afficher soi-même

            const estAmi = amisConfirmes.some(a => String(a._id) === String(membre._id));
            const enAttente = demandesEnvoyees.some(d => String(d._id) === String(membre._id));
            const recu = demandesRecues.some(d => String(d._id) === String(membre._id));

            if (estAmi) return; // Ne pas afficher les amis dans la liste générale (déjà dans la section d'écriture)

            let cta = '';
            if (enAttente) {
                cta = '<button class="cta-attente" disabled>En attente de confirmation</button>';
            } else if (recu) {
                cta = `<button class="cta-accepter" data-id="${membre._id}">Demande d\'amitié</button>`;
            } else {
                cta = `<button class="cta-ajouter" data-id="${membre._id}">Ajouter aux amis</button>`;
            }

            const li = document.createElement('li');
            li.innerHTML = `
                <span>${membre.nom} ${membre.prenom}</span>
                ${cta}
            `;
            ul.appendChild(li);
        });
        
        console.log('🔍 [FRIENDS] Membres non-amis affichés');
    },

    /**
     * Envoie une demande d'amitié
     */
    async sendFriendRequest(cibleId) {
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
            const response = await fetch(API_CONFIG.url('/friends/demander'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, cibleId })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }
            
            console.log('📤 [FRIENDS] Demande d\'amitié envoyée à:', cibleId);
            await this.loadRelations(); // Recharger les listes
        } catch (error) {
            console.error('❌ [FRIENDS] Erreur envoi demande d\'amitié:', error);
            throw error; // Re-lancer l'erreur pour que les modules appelants puissent la gérer
        }
    },

    /**
     * Accepte une demande d'amitié
     */
    async acceptFriendRequest(demandeurId) {
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
            const response = await fetch(API_CONFIG.url('/friends/accepter'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, demandeurId })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }
            
            console.log('✅ [FRIENDS] Demande d\'amitié acceptée de:', demandeurId);
            await this.loadRelations(); // Recharger les listes
        } catch (error) {
            console.error('❌ [FRIENDS] Erreur acceptation demande d\'amitié:', error);
            throw error; // Re-lancer l'erreur pour que les modules appelants puissent la gérer
        }
    }
};

// ============================================
// 7. GESTIONNAIRE DE NOTIFICATIONS SOCKET.IO
// ============================================

const NotificationManager = {
    /**
     * Configuration des écouteurs Socket.IO - SIMPLIFIÉ
     * Les notifications de chat sont gérées par chat.js
     */
    setupSocketListeners() {
        console.log('✅ [SOCKET] Écouteurs de notifications configurés (délégués à chat.js)');
    }
};

// ============================================
// 8. INITIALISATION ET ÉVÉNEMENTS GLOBAUX
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 [INIT] DOM chargé - Initialisation de l\'application');

    // Contenu dynamique de la page d'accueil
    if (document.querySelector("#incru")) {
        document.querySelector("#incru").innerHTML = "Les nouveautés";
        document.querySelector(".incru").innerHTML = "Chez nous";
        console.log('📝 [INIT] Contenu de page d\'accueil mis à jour');
    }

    // Messages et topics d'exemple
    const featuredMessages = [
        "Bienvenue sur le réseau social CHEZ NOUS !",
        "Apéro annuel au mois de juillet!",
        "Rejoignez nous pour jardiner ensemble"
    ];

    const topics = [
        "Jardinage", "Sorties avec les chiens", "Gestion des poubelles",
        "Où laisser les clés ?", "Donner l'eau aux plantes pendant mes vacances",
        "Sorties culturelles", "Apéro de l'année"
    ];

    // Affichage des messages et topics
    if (elements.featuredList) {
        featuredMessages.forEach(msg => {
            const li = document.createElement("li");
            li.textContent = msg;
            elements.featuredList.appendChild(li);
        });
        console.log('📋 [INIT] Messages vedettes affichés:', featuredMessages.length);
    }

    if (elements.topicsGrid) {
        topics.forEach(topic => {
            const li = document.createElement("li");
            li.textContent = topic;
            elements.topicsGrid.appendChild(li);
        });
        console.log('🏷️ [INIT] Topics affichés:', topics.length);
    }

    // Initialisation des gestionnaires
    FormManager.setupRealtimeValidation();
    FormManager.setupPasswordToggles();
    ChatManager.setupChatErgonomics();
    NotificationManager.setupSocketListeners();
    
    // Initialisation spéciale des boutons de formulaire
    setTimeout(() => {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            // Activer immédiatement le bouton de connexion pour faciliter les tests
            const loginBtn = loginForm.querySelector('button[type="submit"]');
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.classList.remove('disabled');
                console.log('✅ [INIT] Bouton de connexion activé par défaut');
            }
            FormManager.updateSubmitButtonState(loginForm);
        }
        
        if (registerForm) {
            FormManager.updateSubmitButtonState(registerForm);
            console.log('🔄 [INIT] État initial du bouton d\'inscription mis à jour');
        }
    }, 100);
    
    // Configuration des événements de modales
    elements.loginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            // Ne rien faire car le bouton loginBtn est masqué quand connecté
            // La déconnexion est gérée par logoutBtn dans navigation.js
            console.log('ℹ️ [AUTH] loginBtn cliqué mais utilisateur connecté - ignoré');
        } else {
            ModalManager.open(elements.loginModal);
        }
    });

    elements.registerBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        ModalManager.open(elements.registerModal);
    });

    // Fermeture des modales
    elements.closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = btn.closest('dialog');
            if (modal) {
                ModalManager.close(modal);
            }
        });
    });

    // Gestion clavier et backdrop
    [elements.loginModal, elements.registerModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    ModalManager.close(modal);
                }
            });

            modal.addEventListener('keydown', (e) => {
                ModalManager.handleKeydown(e, modal);
            });
        }
    });

    // Soumission des formulaires
    elements.loginForm?.addEventListener('submit', (e) => AuthManager.handleLogin(e));
    elements.registerForm?.addEventListener('submit', (e) => AuthManager.handleRegister(e));

    // Commutation entre modales
    document.querySelector('#showRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        ModalManager.close(elements.loginModal);
        setTimeout(() => ModalManager.open(elements.registerModal), 300);
    });

    document.querySelector('#showLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        ModalManager.close(elements.registerModal);
        setTimeout(() => ModalManager.open(elements.loginModal), 300);
    });

    // Gestion des CTA d'amis
    document.addEventListener('click', async (e) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        
        if (e.target.classList.contains('cta-ajouter')) {
            const id = e.target.getAttribute('data-id');
            await FriendsManager.sendFriendRequest(id);
        }
        
        if (e.target.classList.contains('cta-accepter')) {
            const id = e.target.getAttribute('data-id');
            await FriendsManager.acceptFriendRequest(id);
        }
    });

    // Fermeture par Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [elements.loginModal, elements.registerModal].forEach(modal => {
                if (modal && modal.open) {
                    ModalManager.close(modal);
                }
            });
        }
    });

    // Enregistrement de l'utilisateur connecté sur le socket
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        socket.emit('register user', user);
        console.log('👤 [SOCKET] Utilisateur enregistré sur le socket:', user.pseudonyme || user.nom);
        
        // LOG VISIBLE RECONNEXION AUTOMATIQUE
        console.log('');
        console.log('🔄 ================================');
        console.log('🔄 RECONNEXION AUTOMATIQUE');
        console.log('🔄 ================================');
        console.log(`🔄 Utilisateur: ${user.nom} ${user.prenom}`);
        console.log(`🔄 Email: ${user.email}`);
        console.log(`🔄 Pseudonyme: ${user.pseudonyme || 'Non défini'}`);
        console.log(`🔄 Heure: ${new Date().toLocaleString('fr-FR')}`);
        console.log('🔄 ================================');
        console.log('');
    }

    // Mise à jour de l'interface utilisateur
    AuthManager.updateUserInterface();
    
    console.log('✅ [INIT] Initialisation complète terminée');
});

// Exposer les gestionnaires globalement pour compatibilité
window.traiterNotificationNouveauMessage = NotificationManager.handleChatNotification.bind(NotificationManager);
window.AuthManager = AuthManager;
window.FriendsManager = FriendsManager;

console.log('🏁 [INIT] Script principal chargé et prêt');
