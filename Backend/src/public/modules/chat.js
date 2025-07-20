// ========================================
// MODULE CHAT EN TEMPS REEL OPTIMISE
// Gestion du chat en temps reel avec ergonomie amelioree
// ========================================

console.log("[CHAT] === MODULE CHAT CHARGE ===");
console.log("[TERMINAL] Initialisation systeme chat temps reel");
console.log("[CHAT] Timestamp de chargement:", new Date().toISOString());

// ========================================
// EXPORTATION PRECOCE POUR DETECTION
// ========================================
// Definir window.ChatModule des le debut pour eviter les problemes de timing
window.ChatModule = {
    // Fonctions temporaires pour la detection
    status: 'loading',
    version: '1.0.0',
    loaded: new Date().toISOString()
};

console.log("[CHAT] ChatModule defini de maniere precoce");
console.log("[CHAT] window.ChatModule:", window.ChatModule);
console.log("[CHAT] typeof window.ChatModule:", typeof window.ChatModule);

// ========================================
// 📋 VARIABLES GLOBALES CHAT
// ========================================
let amiChatSelectionne = null;
let timersTyping = new Map();

// ========================================
// 🔌 INITIALISATION SOCKET.IO
// ========================================
function initialiserSocket() {
    console.log("🔌 [CHAT] Initialisation Socket.IO");
    console.log("🌐 [TERMINAL] Connexion serveur chat temps réel");
    
    try {
        // Utiliser la connexion socket déjà établie dans script.js
        if (!window.socket) {
            console.error("❌ [CHAT] Socket.IO non disponible depuis script.js");
            return;
        }
        
        window.socket.on('connect', () => {
            console.log("✅ [CHAT] Socket.IO connecté avec succès");
            console.log(`🆔 [TERMINAL] ID Socket: ${window.socket.id}`);
            
            // Rejoindre la room de l'utilisateur
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user._id) {
                window.socket.emit('join-user-room', user._id);
                console.log(`🏠 [TERMINAL] Utilisateur rejoint sa room: ${user._id}`);
            }
        });
        
        window.socket.on('disconnect', () => {
            console.log("⚠️ [CHAT] Socket.IO déconnecté");
            console.log("🔌 [TERMINAL] Connexion chat interrompue");
        });
        
        window.socket.on('nouveau-message-chat', (messageData) => {
            console.log("📥 [CHAT] Nouveau message reçu en temps réel:", messageData);
            console.log("👤 [TERMINAL] De:", messageData.expediteurPrenom, messageData.expediteurNom);
            
            // Afficher le message dans l'interface
            afficherNouveauMessage(messageData);
            
            // Gérer les notifications si le message n'est pas pour la conversation active
            gererNotificationNouveauMessage(messageData);
        });
        
        window.socket.on('message-envoye-confirmation', (confirmation) => {
            console.log("✅ [CHAT] Confirmation d'envoi reçue:", confirmation);
            if (confirmation.success) {
                console.log("📤 [TERMINAL] Message livré avec succès");
                if (!confirmation.destinataireEnLigne) {
                    afficherNotificationTemporaire("Message envoyé (destinataire hors ligne)", "info");
                }
            }
        });
        
        window.socket.on('utilisateur-ecrit', (data) => {
            console.log(`✍️ [CHAT] ${data.userName} est en train d'écrire...`);
            afficherStatutFrappe(true, data.userName);
        });
        
        window.socket.on('utilisateur-arrete-ecriture', (data) => {
            console.log(`✋ [CHAT] ${data.userName} a arrêté d'écrire`);
            afficherStatutFrappe(false);
        });
        
        console.log("✅ [CHAT] Socket.IO configuré avec tous les événements");
        
    } catch (error) {
        console.error("💥 [CHAT] Erreur initialisation Socket.IO:", error.message);
        console.error("🚨 [TERMINAL] Échec connexion chat temps réel");
    }
}

// ========================================
// 👥 SÉLECTION AMI POUR CHAT
// ========================================
function selectionnerAmiPourChat() {
    const selectChat = document.getElementById('amiChatSelection');
    
    if (!selectChat) return;
    
    const amiId = selectChat.value;
    const amiText = selectChat.options[selectChat.selectedIndex].text;
    
    if (amiId) {
        amiChatSelectionne = amiId;
        console.log(`👥 [CHAT] Ami sélectionné pour chat: ${amiText} (ID: ${amiId})`);
        console.log("💬 [TERMINAL] Session chat initiée avec ami");
        
        // Charger l'historique des messages avec cet ami
        chargerMessagesChat(amiId);
        
        // Activer l'interface de chat
        activerInterfaceChat();
        
    } else {
        amiChatSelectionne = null;
        console.log("❌ [CHAT] Aucun ami sélectionné - désactivation chat");
        desactiverInterfaceChat();
    }
}

// ========================================
// 🎨 ACTIVATION/DÉSACTIVATION INTERFACE CHAT
// ========================================
function activerInterfaceChat() {
    console.log("🎨 [CHAT] Activation interface chat");
    
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (chatInput) {
        chatInput.disabled = false;
        chatInput.placeholder = "Tapez votre message... (Ctrl+Entrée ou Entrée pour envoyer)";
    }
    
    if (sendBtn) {
        sendBtn.disabled = false;
    }
    
    console.log("✅ [CHAT] Interface chat activée");
}

function desactiverInterfaceChat() {
    console.log("🎨 [CHAT] Désactivation interface chat");
    
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatInput) {
        chatInput.disabled = true;
        chatInput.placeholder = "Sélectionnez un ami pour chatter...";
        chatInput.value = "";
    }
    
    if (sendBtn) {
        sendBtn.disabled = true;
    }
    
    if (chatMessages) {
        chatMessages.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic; padding: 20px;">Sélectionnez un ami pour commencer une conversation</p>';
    }
    
    console.log("✅ [CHAT] Interface chat désactivée");
}

// ========================================
// � OBTENIR INFORMATIONS AMI
// ========================================
async function obtenirInformationsAmi(amiId) {
    console.log(`👤 [CHAT] Récupération informations ami: ${amiId}`);
    
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user._id) {
            console.error("❌ [CHAT] Utilisateur non connecté");
            return null;
        }
        
        // Récupérer la liste des amis pour trouver celui qui correspond à l'ID
        const response = await fetch(API_CONFIG.url(`/friends/amis?userId=${user._id}`));
        
        if (!response.ok) {
            console.error(`❌ [CHAT] Erreur HTTP ${response.status} lors de la récupération des amis`);
            return null;
        }
        
        const amis = await response.json();
        const ami = amis.find(a => a._id === amiId);
        
        if (!ami) {
            console.error(`❌ [CHAT] Ami avec ID ${amiId} non trouvé dans la liste des amis`);
            return null;
        }
        
        console.log(`✅ [CHAT] Informations ami récupérées: ${ami.prenom} ${ami.nom}`);
        return ami;
        
    } catch (error) {
        console.error("💥 [CHAT] Erreur récupération informations ami:", error.message);
        return null;
    }
}

// ========================================
// �📥 CHARGEMENT MESSAGES CHAT
// ========================================
async function chargerMessagesChat(amiId) {
    console.log(`📥 [CHAT] === DÉBUT CHARGEMENT MESSAGES CHAT AVEC AMI ${amiId} ===`);
    console.log("💬 [TERMINAL] Récupération historique conversation");
    
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id;
        
        if (!userId) {
            console.error("❌ [CHAT] Utilisateur non connecté");
            return;
        }
        
        console.log(`📡 [CHAT] Requête historique chat: utilisateur ${userId} avec ami ${amiId}`);
        
        const res = await fetch(API_CONFIG.url(`/api/chat/messages/${userId}/${amiId}`));
        
        if (!res.ok) {
            throw new Error(`Erreur HTTP ${res.status}`);
        }
        
        const messages = await res.json();
        console.log(`📥 [CHAT] ${messages.length} messages dans l'historique`);
        
        // Afficher les messages
        afficherMessagesChat(messages);
        
        console.log("✅ [CHAT] Historique chat chargé avec succès");
        
    } catch (error) {
        console.error('💥 [CHAT] Erreur chargement messages chat:', error.message);
        
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Erreur lors du chargement des messages</p>';
        }
    }
}

// ========================================
// 🎨 AFFICHAGE MESSAGES CHAT
// ========================================
function afficherMessagesChat(messages) {
    console.log(`🎨 [CHAT] Affichage ${messages.length} messages chat`);
    
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatMessages) {
        console.error("❌ [CHAT] Zone d'affichage messages introuvable");
        return;
    }
    
    if (messages.length === 0) {
        chatMessages.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic; padding: 20px;">Aucun message dans cette conversation. Commencez à chatter !</p>';
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id;
    
    const contenuHTML = messages.map(msg => {
        const estMonMessage = msg.expediteur === userId;
        const couleurBulle = estMonMessage ? '#007bff' : '#28a745';
        const alignement = estMonMessage ? 'flex-end' : 'flex-start';
        const dateFormatee = new Date(msg.date).toLocaleString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });
        
        return `
            <div style="display: flex; justify-content: ${alignement}; margin: 10px 0;">
                <div style="max-width: 70%; padding: 10px 15px; border-radius: 18px; background-color: ${couleurBulle}; color: white; position: relative;">
                    <div style="font-weight: bold; font-size: 0.85em; margin-bottom: 5px;">
                        ${estMonMessage ? 'Vous' : msg.expediteurNom}
                    </div>
                    <div>${msg.message}</div>
                    <div style="font-size: 0.75em; opacity: 0.8; margin-top: 5px;">
                        ${dateFormatee}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    chatMessages.innerHTML = contenuHTML;
    
    // Faire défiler vers le bas
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    console.log("✅ [CHAT] Messages affichés avec style de bulles");
}

// ========================================
// 📤 ENVOI MESSAGE CHAT
// ========================================
async function envoyerMessageChat() {
    console.log("📤 [CHAT] === DÉBUT ENVOI MESSAGE CHAT ===");
    console.log("💬 [TERMINAL] Tentative envoi message chat temps réel");
    
    const chatInput = document.getElementById('chatInput');
    const message = chatInput ? chatInput.value.trim() : '';
    
    if (!message) {
        console.log("⚠️ [CHAT] Message vide - envoi annulé");
        return;
    }
    
    if (!amiChatSelectionne) {
        console.log("⚠️ [CHAT] Aucun ami sélectionné - envoi annulé");
        alert('Veuillez sélectionner un ami pour chatter');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id;
    
    if (!userId) {
        console.log("❌ [CHAT] Utilisateur non connecté");
        alert('Erreur de session');
        return;
    }
    
    console.log(`📤 [CHAT] Envoi message: "${message.substring(0, 30)}..." vers ami ${amiChatSelectionne}`);
    
    try {
        // Récupérer les informations de l'ami destinataire
        const amiDestinataire = await obtenirInformationsAmi(amiChatSelectionne);
        
        if (!amiDestinataire) {
            console.error("❌ [CHAT] Impossible de récupérer les informations de l'ami destinataire");
            alert('Erreur: informations du destinataire introuvables');
            return;
        }
        
        // Construire les données du message avec la structure attendue par l'API
        const messageData = {
            expediteurId: userId,
            expediteurPrenom: user.prenom || '',
            expediteurNom: user.nom || '',
            destinataireId: amiChatSelectionne,
            destinatairePrenom: amiDestinataire.prenom || '',
            destinataireNom: amiDestinataire.nom || '',
            message: message,
            date: new Date().toISOString()
        };
        
        console.log("📋 [CHAT] Données du message construites:", {
            expediteur: `${messageData.expediteurPrenom} ${messageData.expediteurNom}`,
            destinataire: `${messageData.destinatairePrenom} ${messageData.destinataireNom}`,
            message: messageData.message.substring(0, 50) + '...'
        });
        
        // Envoyer via Socket.IO pour le temps réel
        if (window.socket) {
            window.socket.emit('envoyer-message-chat', messageData);
            console.log("⚡ [CHAT] Message envoyé via Socket.IO");
        }
        
        // Envoyer aussi via HTTP pour la persistance
        const res = await fetch(API_CONFIG.url('/api/chat/envoyer'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });
        
        if (res.ok) {
            console.log("✅ [CHAT] Message sauvegardé en base de données");
            
            // Vider l'input et réinitialiser l'interface
            chatInput.value = "";
            ajusterHauteurTextarea();
            mettreAJourCompteurCaracteres();
            gererEtatBoutonEnvoi();
            
            // NE PAS afficher le message ici - Socket.IO s'en chargera
            console.log("📱 [CHAT] Attente affichage via Socket.IO...");
            
        } else {
            console.error("❌ [CHAT] Erreur sauvegarde message");
        }
        
    } catch (error) {
        console.error('💥 [CHAT] Erreur envoi message chat:', error.message);
        alert('Erreur lors de l\'envoi du message');
    }
    
    console.log("🏁 [CHAT] === FIN ENVOI MESSAGE CHAT ===");
}

// ========================================
// 💬 AFFICHAGE NOUVEAU MESSAGE EN TEMPS RÉEL
// ========================================
function afficherNouveauMessage(messageData) {
    console.log("💬 [CHAT] Affichage nouveau message temps réel");
    console.log(`📥 [TERMINAL] Message reçu de ${messageData.expediteurNom || 'Ami'}`);
    
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatMessages) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id;
    
    // Vérifier si le message concerne la conversation actuelle
    const estPourConversationActuelle = 
        (messageData.expediteurId === userId && messageData.destinataireId === amiChatSelectionne) ||
        (messageData.expediteurId === amiChatSelectionne && messageData.destinataireId === userId);
    
    if (!estPourConversationActuelle) {
        console.log("📭 [CHAT] Message pour autre conversation - ignoré dans chat actuel");
        // La gestion des notifications est maintenant entièrement dans gererNotificationNouveauMessage
        return;
    }
    
    const estMonMessage = messageData.expediteurId === userId;
    const couleurBulle = estMonMessage ? '#007bff' : '#28a745';
    const alignement = estMonMessage ? 'flex-end' : 'flex-start';
    const dateFormatee = new Date(messageData.date).toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    console.log(`💬 [TERMINAL] Affichage message dans chat actuel: ${estMonMessage ? 'envoyé' : 'reçu'}`);
    
    const nouveauMessageHTML = `
        <div style="display: flex; justify-content: ${alignement}; margin: 10px 0;">
            <div style="max-width: 70%; padding: 10px 15px; border-radius: 18px; background-color: ${couleurBulle}; color: white; position: relative;">
                <div style="font-weight: bold; font-size: 0.85em; margin-bottom: 5px;">
                    ${estMonMessage ? 'Vous' : messageData.expediteurPrenom || 'Ami'}
                </div>
                <div>${messageData.message}</div>
                <div style="font-size: 0.75em; opacity: 0.8; margin-top: 5px;">
                    ${dateFormatee}
                </div>
            </div>
        </div>
    `;
    
    chatMessages.insertAdjacentHTML('beforeend', nouveauMessageHTML);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    console.log("✅ [CHAT] Nouveau message affiché en temps réel");
}

// ========================================
// ⌨️ GESTION ERGONOMIE TEXTAREA AMÉLIORÉE
// ========================================
function mettreAJourCompteurCaracteres() {
    const textarea = document.getElementById('chatInput');
    const compteur = document.getElementById('charCounter');
    
    if (!textarea || !compteur) return;
    
    const longueur = textarea.value.length;
    const maxLength = parseInt(textarea.getAttribute('maxlength')) || 500;
    const pourcentage = (longueur / maxLength) * 100;
    
    // Mise à jour du texte avec format amélioré
    compteur.textContent = `${longueur}/${maxLength} caractères`;
    
    // Gestion des classes CSS pour les couleurs
    compteur.className = 'char-counter';
    
    // Alertes visuelles progressives
    if (pourcentage >= 100) {
        compteur.classList.add('danger');
        compteur.setAttribute('aria-label', `Limite atteinte : ${longueur} caractères sur ${maxLength} maximum`);
    } else if (pourcentage >= 80) {
        compteur.classList.add('warning');
        compteur.setAttribute('aria-label', `Attention : ${longueur} caractères sur ${maxLength} maximum`);
    } else {
        compteur.setAttribute('aria-label', `${longueur} caractères saisis sur ${maxLength} maximum`);
    }
    
    // Validation du champ
    const errorDiv = document.getElementById('chatInputError');
    if (errorDiv) {
        if (longueur > maxLength) {
            errorDiv.textContent = `Votre message dépasse la limite de ${maxLength} caractères.`;
            errorDiv.classList.add('show');
            textarea.setAttribute('aria-invalid', 'true');
        } else if (longueur === 0) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('show');
            textarea.setAttribute('aria-invalid', 'false');
        } else {
            errorDiv.textContent = '';
            errorDiv.classList.remove('show');
            textarea.setAttribute('aria-invalid', 'false');
        }
    }
}

function ajusterHauteurTextarea() {
    const textarea = document.getElementById('chatInput');
    if (!textarea) return;
    
    // Réinitialiser la hauteur
    textarea.style.height = 'auto';
    
    // Calculer la nouvelle hauteur
    const hauteurScroll = textarea.scrollHeight;
    const hauteurMin = 52;
    const hauteurMax = 200;
    
    const nouvelleHauteur = Math.min(Math.max(hauteurScroll, hauteurMin), hauteurMax);
    textarea.style.height = nouvelleHauteur + 'px';
    
    // Gérer l'overflow
    if (hauteurScroll > hauteurMax) {
        textarea.style.overflowY = 'auto';
    } else {
        textarea.style.overflowY = 'hidden';
    }
}

function gererEtatBoutonEnvoi() {
    const textarea = document.getElementById('chatInput');
    const bouton = document.getElementById('sendBtn');
    
    if (!textarea || !bouton) return;
    
    const texte = textarea.value.trim();
    const longueurTexte = texte.length;
    const maxLength = parseInt(textarea.getAttribute('maxlength')) || 500;
    const aTexte = longueurTexte > 0 && longueurTexte <= maxLength;
    const aAmi = amiChatSelectionne !== null;
    
    const peutEnvoyer = aTexte && aAmi;
    
    // Mise à jour de l'état du bouton
    bouton.disabled = !peutEnvoyer;
    
    // Mise à jour des attributs d'accessibilité
    if (peutEnvoyer) {
        bouton.setAttribute('aria-label', `Envoyer le message à ${amiChatSelectionne ? 'votre ami' : ''}`);
        bouton.title = 'Cliquez pour envoyer votre message (Ctrl+Entrée)';
    } else if (!aAmi) {
        bouton.setAttribute('aria-label', 'Sélectionnez un ami pour envoyer un message');
        bouton.title = 'Veuillez d\'abord sélectionner un ami dans la liste';
    } else if (!aTexte) {
        bouton.setAttribute('aria-label', 'Écrivez un message pour l\'envoyer');
        bouton.title = 'Veuillez saisir un message avant d\'envoyer';
    } else if (longueurTexte > maxLength) {
        bouton.setAttribute('aria-label', 'Message trop long, réduisez le nombre de caractères');
        bouton.title = `Votre message dépasse la limite de ${maxLength} caractères`;
    }
}

function afficherStatutFrappe(actif, nomUtilisateur = '') {
    const statut = document.getElementById('typingStatus');
    if (!statut) return;
    
    if (actif) {
        statut.textContent = `${nomUtilisateur} est en train d'écrire...`;
        statut.classList.add('active');
    } else {
        statut.textContent = '';
        statut.classList.remove('active');
    }
}

// ========================================
// � GESTION DES NOTIFICATIONS EN TEMPS RÉEL
// ========================================
function gererNotificationNouveauMessage(messageData) {
    console.log("🔔 [CHAT] Gestion notification nouveau message");
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id;
    
    // Si c'est un message que j'ai envoyé, pas de notification
    if (messageData.expediteurId === userId) {
        console.log("📤 [CHAT] C'est mon propre message - pas de notification");
        return;
    }
    
    console.log(`📥 [CHAT] Message reçu de ${messageData.expediteurPrenom} ${messageData.expediteurNom}`);
    console.log(`🎯 [CHAT] Conversation actuelle: ${amiChatSelectionne || 'aucune'}`);
    console.log(`💬 [CHAT] Expéditeur du message: ${messageData.expediteurId}`);
    
    // Si le message est pour la conversation actuellement ouverte, pas de notification
    const conversationOuverte = (amiChatSelectionne === messageData.expediteurId);
    
    if (conversationOuverte) {
        console.log("👁️ [CHAT] Message pour conversation ouverte - pas de notification nécessaire");
        return;
    }
    
    // Sinon, afficher les notifications
    console.log("🔔 [TERMINAL] Message pour conversation différente/fermée - ajout notifications");
    
    // Incrémenter compteur de messages non lus
    incrementerMessagesNonLus(messageData.expediteurId);
    
    // Ajouter notification visuelle sur l'ami  
    ajouterNotificationVisuelleAmi(messageData.expediteurId, messageData.expediteurPrenom, messageData.expediteurNom);
    
    // Désactiver les toast notifications en faveur des cloches dans la liste
    // afficherToastNotification(messageData);
    
    // Recharger la liste des amis pour afficher les notifications visuelles
    setTimeout(() => {
        chargerListeAmisChat();
        console.log("🔄 [CHAT] Liste amis rechargée pour notifications");
    }, 200);
}

function ajouterNotificationVisuelleAmi(amiId, amiPrenom, amiNom) {
    console.log(`🎨 [CHAT] Ajout notification visuelle pour ami: ${amiPrenom} ${amiNom}`);
    
    const amiElement = document.querySelector(`[data-ami-id="${amiId}"]`);
    
    if (amiElement) {
        // Ajouter classe pour animation
        amiElement.classList.add('has-new-message');
        
        // Récupérer le nombre actuel de messages non lus
        const messagesNonLus = getMessagesNonLus(amiId);
        console.log(`📊 [CHAT] Messages non lus pour ${amiPrenom}: ${messagesNonLus}`);
        
        // Ajouter ou mettre à jour l'icône de cloche
        let badge = amiElement.querySelector('.new-message-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'new-message-badge';
            amiElement.style.position = 'relative';
            amiElement.appendChild(badge);
            console.log(`🔔 [CHAT] Cloche créée pour ami: ${amiPrenom}`);
        }
        
        // Définir l'attribut data-count pour afficher le nombre dans la cloche
        if (messagesNonLus >= 100) {
            badge.setAttribute('data-count', '99+');
            badge.classList.add('high-count');
        } else if (messagesNonLus >= 10) {
            badge.setAttribute('data-count', messagesNonLus.toString());
            badge.classList.add('high-count');
        } else {
            badge.setAttribute('data-count', messagesNonLus.toString());
            badge.classList.remove('high-count');
        }
        
        console.log(`🎯 [CHAT] Cloche mise à jour - data-count: ${badge.getAttribute('data-count')}`);
        console.log(`🎨 [CHAT] Classes CSS de la cloche:`, badge.className);
        
        // Ajouter effet de clignotement pour les nouveaux messages
        if (messagesNonLus > 3) {
            badge.classList.add('blink');
            setTimeout(() => badge.classList.remove('blink'), 3000);
        }
        
        // Ajouter alerte textuelle compacte
        let alerte = amiElement.querySelector('.new-message-alert');
        if (!alerte) {
            alerte = document.createElement('div');
            alerte.className = 'new-message-alert';
            
            // Insérer après le nom de l'ami
            const statusDiv = amiElement.querySelector('.chat-friend-status');
            if (statusDiv) {
                statusDiv.appendChild(alerte);
            } else {
                amiElement.appendChild(alerte);
            }
        }
        
        // Contenu de l'alerte selon le nombre de messages
        if (messagesNonLus === 1) {
            alerte.innerHTML = `<strong>📥 Nouveau message !</strong>`;
        } else {
            alerte.innerHTML = `<strong>📥 ${messagesNonLus} nouveaux messages !</strong>`;
        }
        
        console.log("✅ [CHAT] Notification visuelle ajoutée avec badge compteur");
    } else {
        console.warn("⚠️ [CHAT] Element ami non trouvé pour notification:", amiId);
    }
}

function afficherToastNotification(messageData) {
    console.log("🍞 [CHAT] Affichage toast notification");
    
    // Supprimer les anciennes notifications
    const anciennesNotifications = document.querySelectorAll('.chat-toast-notification');
    anciennesNotifications.forEach(notif => notif.remove());
    
    // Créer la nouvelle notification
    const toast = document.createElement('div');
    toast.className = 'chat-toast-notification';
    toast.innerHTML = `
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        <div class="toast-header">
            💬 ${messageData.expediteurPrenom} ${messageData.expediteurNom}
        </div>
        <div class="toast-message">
            ${messageData.message.length > 60 ? messageData.message.substring(0, 60) + '...' : messageData.message}
        </div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(toast);
    
    // Clic pour ouvrir la conversation
    toast.addEventListener('click', (e) => {
        if (e.target.className !== 'toast-close') {
            ouvrirChatAvecAmi(messageData.expediteurId, `${messageData.expediteurPrenom} ${messageData.expediteurNom}`);
            toast.remove();
        }
    });
    
    // Suppression automatique après 5 secondes
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }
    }, 5000);
    
    console.log("✅ [CHAT] Toast notification affichée");
}

function afficherNotificationTemporaire(message, type = 'info') {
    console.log(`🔔 [CHAT] Notification temporaire: ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `chat-toast-notification ${type}`;
    notification.innerHTML = `
        <div class="toast-header">ℹ️ Information</div>
        <div class="toast-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 400);
        }
    }, 3000);
}

function supprimerNotificationsAmi(amiId) {
    console.log(`🧹 [CHAT] Suppression notifications pour ami: ${amiId}`);
    
    const amiElement = document.querySelector(`[data-ami-id="${amiId}"]`);
    
    if (amiElement) {
        // Supprimer classe d'animation
        amiElement.classList.remove('has-new-message');
        
        // Supprimer badge
        const badge = amiElement.querySelector('.new-message-badge');
        if (badge) badge.remove();
        
        // Supprimer alerte
        const alerte = amiElement.querySelector('.new-message-alert');
        if (alerte) alerte.remove();
        
        console.log("✅ [CHAT] Notifications supprimées");
    }
    
    // Reset compteur localStorage
    resetterMessagesNonLus(amiId);
}

function incrementerMessagesNonLus(amiId) {
    let messagesNonLus = JSON.parse(localStorage.getItem('messagesNonLus') || '{}');
    messagesNonLus[amiId] = (messagesNonLus[amiId] || 0) + 1;
    localStorage.setItem('messagesNonLus', JSON.stringify(messagesNonLus));
    console.log(`📊 [CHAT] Messages non lus pour ${amiId}: ${messagesNonLus[amiId]}`);
}

function resetterMessagesNonLus(amiId) {
    let messagesNonLus = JSON.parse(localStorage.getItem('messagesNonLus') || '{}');
    if (messagesNonLus[amiId]) {
        delete messagesNonLus[amiId];
        localStorage.setItem('messagesNonLus', JSON.stringify(messagesNonLus));
        console.log(`🔄 [CHAT] Messages non lus reset pour: ${amiId}`);
    }
}

// ========================================
// �🚀 INITIALISATION MODULE CHAT
// ========================================
function initialiserChat() {
    console.log("🚀 [CHAT] === DÉBUT INITIALISATION CHAT ===");
    console.log("💬 [TERMINAL] Configuration système chat temps réel");
    
    try {
        // Initialiser Socket.IO
        initialiserSocket();
        
        // Configurer sélection ami
        const selectAmiChat = document.getElementById('amiChatSelection');
        if (selectAmiChat) {
            selectAmiChat.addEventListener('change', selectionnerAmiPourChat);
            console.log("✅ [CHAT] Sélecteur ami chat configuré");
        }
        
        // Configurer textarea et boutons
        const textarea = document.getElementById('chatInput');
        const boutonEnvoi = document.getElementById('sendBtn');
        
        if (textarea) {
            // Événements textarea
            textarea.addEventListener('input', function() {
                ajusterHauteurTextarea();
                mettreAJourCompteurCaracteres();
                gererEtatBoutonEnvoi();
                
                // Signaler que l'utilisateur écrit
                if (window.socket && amiChatSelectionne) {
                    window.socket.emit('utilisateur-ecrit', {
                        destinataire: amiChatSelectionne
                    });
                }
            });
            
            // Gestion touches spéciales
            textarea.addEventListener('keydown', function(event) {
                if (event.ctrlKey && event.key === 'Enter') {
                    event.preventDefault();
                    envoyerMessageChat();
                    return;
                }
                
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    envoyerMessageChat();
                    return;
                }
            });
            
            console.log("✅ [CHAT] Textarea chat configuré");
        }
        
        if (boutonEnvoi) {
            boutonEnvoi.addEventListener('click', envoyerMessageChat);
            console.log("✅ [CHAT] Bouton envoi chat configuré");
        }
        
        // Remplir le sélecteur avec les amis
        if (window.AmisModule) {
            setTimeout(() => {
                remplirSelecteurChatAvecAmis();
            }, 1000);
        }
        
        // Charger la liste d'amis pour le chat
        setTimeout(() => {
            chargerListeAmisChat();
        }, 1200);
        
        // Désactiver l'interface initialement
        desactiverInterfaceChat();
        
        console.log("✅ [CHAT] === CHAT INITIALISÉ AVEC SUCCÈS ===");
        console.log("🎉 [TERMINAL] Système chat temps réel opérationnel");
        
    } catch (error) {
        console.error("💥 [CHAT] ERREUR lors de l'initialisation:", error.message);
        console.error("🚨 [TERMINAL] Échec initialisation chat:", error.stack);
    }
}

// ========================================
// 👥 REMPLIR SÉLECTEUR CHAT AVEC AMIS
// ========================================
async function remplirSelecteurChatAvecAmis() {
    console.log("👥 [CHAT] Remplissage sélecteur chat avec amis");
    
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user._id) return;
        
        const res = await fetch(API_CONFIG.url(`/friends/amis?userId=${user._id}`));
        if (!res.ok) return;
        
        const amis = await res.json();
        const selectChat = document.getElementById('amiChatSelection');
        
        if (selectChat && amis.length > 0) {
            selectChat.innerHTML = '<option value="">Sélectionner un ami pour chatter...</option>';
            
            amis.forEach(ami => {
                const option = document.createElement('option');
                option.value = ami._id;
                option.textContent = `${ami.prenom} ${ami.nom} (${ami.pseudonyme})`;
                selectChat.appendChild(option);
            });
            
            console.log(`✅ [CHAT] ${amis.length} amis ajoutés au sélecteur chat`);
        }
        
    } catch (error) {
        console.error('💥 [CHAT] Erreur remplissage sélecteur:', error.message);
    }
}

// ========================================
// � GESTION LISTE D'AMIS POUR CHAT
// ========================================
async function chargerListeAmisChat() {
    console.log("👥 [CHAT] Chargement liste amis pour chat");
    console.log("📋 [TERMINAL] Récupération amis pour chat depuis serveur");
    
    const listeContainer = document.getElementById('chatAmisListe');
    
    // Afficher un indicateur de chargement
    if (listeContainer) {
        listeContainer.innerHTML = '<p style="text-align: center; color: #1565c0; font-style: italic;">⏳ Chargement des amis...</p>';
        console.log("🔄 [CHAT] Indicateur de chargement affiché");
    } else {
        console.error("❌ [CHAT] ERREUR: Element 'chatAmisListe' introuvable dans le DOM");
        return;
    }
    
    try {
        const userStorage = localStorage.getItem('user');
        console.log("💾 [CHAT] Données localStorage 'user':", userStorage);
        
        const user = JSON.parse(userStorage || '{}');
        console.log("👤 [CHAT] Utilisateur parsé:", user);
        
        if (!user._id) {
            console.warn("⚠️ [CHAT] Utilisateur non connecté - pas d'ID trouvé");
            if (listeContainer) {
                listeContainer.innerHTML = '<p style="text-align: center; color: #ff4444; font-style: italic;">❌ Utilisateur non connecté</p>';
            }
            return;
        }
        
        console.log(`📡 [CHAT] Requête amis pour chat pour utilisateur: ${user._id}`);
        console.log(`🌐 [CHAT] URL de requête:`, API_CONFIG.url(`/friends/amis?userId=${user._id}`));
        
        const response = await fetch(API_CONFIG.url(`/friends/amis?userId=${user._id}`), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📊 [CHAT] Réponse serveur: Status ${response.status} - ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [CHAT] Erreur HTTP ${response.status}:`, errorText);
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        const amis = await response.json();
        console.log(`👥 [CHAT] ${amis.length} amis disponibles pour chat trouvés`);
        console.log(`📋 [TERMINAL] Amis récupérés:`, amis.map(a => `${a.prenom} ${a.nom}`));
        console.log(`🔍 [CHAT] Données complètes des amis:`, amis);
        
        afficherListeAmisChat(amis);
        
    } catch (error) {
        console.error("💥 [CHAT] Erreur chargement amis:", error.message);
        console.error("🚨 [TERMINAL] Impossible de charger liste amis chat");
        console.error("🔍 [CHAT] Stack trace:", error.stack);
        
        // Afficher un message d'erreur dans l'interface
        if (listeContainer) {
            listeContainer.innerHTML = `<p style="text-align: center; color: #ff4444; font-style: italic;">❌ Erreur: ${error.message}</p>`;
        }
    }
}

function afficherListeAmisChat(amis) {
    console.log(`🎨 [CHAT] DÉBUT AFFICHAGE - ${amis.length} amis dans liste chat`);
    console.log("📱 [TERMINAL] Génération interface liste amis cliquable");
    console.log("🔍 [TERMINAL] Données amis reçues:", amis);
    
    const listeContainer = document.getElementById('chatAmisListe');
    
    if (!listeContainer) {
        console.error("❌ [CHAT] ERREUR CRITIQUE - Container liste amis chat introuvable dans le DOM");
        console.error("🚨 [TERMINAL] Element #chatAmisListe absent du HTML");
        return;
    }
    
    console.log("✅ [CHAT] Container trouvé:", listeContainer);
    
    if (amis.length === 0) {
        const messageAucunAmi = '<p style="text-align: center; color: #6c757d; font-style: italic;">Aucun ami confirmé pour le chat</p>';
        listeContainer.innerHTML = messageAucunAmi;
        console.log("📋 [TERMINAL] Aucun ami confirmé trouvé - Message affiché");
        console.log("🔍 [CHAT] HTML inséré:", messageAucunAmi);
        return;
    }
    
    let html = '';
    console.log("🔄 [CHAT] Génération du HTML pour chaque ami...");
    
    amis.forEach((ami, index) => {
        console.log(`👤 [CHAT] Traitement ami ${index + 1}/${amis.length}:`, ami);
        
        const amiId = ami._id;
        const amiNom = `${ami.prenom || ''} ${ami.nom || ''}`.trim();
        const amiPseudo = ami.pseudonyme || '';
        
        console.log(`📝 [CHAT] - ID: ${amiId}, Nom: ${amiNom}, Pseudo: ${amiPseudo}`);
        
        // Récupérer le nombre de messages non lus pour cet ami
        const messagesNonLus = getMessagesNonLus(amiId);
        console.log(`📊 [CHAT] - Messages non lus: ${messagesNonLus}`);
        
        // Classes CSS pour notifications
        const classeNotification = messagesNonLus > 0 ? 'has-new-message' : '';
        
        // Créer l'icône de cloche si nécessaire
        let badgeHTML = '';
        if (messagesNonLus > 0) {
            const badgeClass = messagesNonLus >= 10 ? 'new-message-badge high-count' : 'new-message-badge';
            const badgeCount = messagesNonLus >= 100 ? '99+' : messagesNonLus.toString();
            const blinkClass = messagesNonLus > 3 ? ' blink' : '';
            
            badgeHTML = `<span class="${badgeClass}${blinkClass}" data-count="${badgeCount}"></span>`;
        }
        
        // Créer l'alerte si nécessaire
        let alerteHTML = '';
        if (messagesNonLus > 0) {
            const messageTexte = messagesNonLus === 1 ? 
                '📥 Nouveau message !' : 
                `📥 ${messagesNonLus} nouveaux messages !`;
            alerteHTML = `
                <div class="new-message-alert">
                    <strong>${messageTexte}</strong>
                </div>
            `;
        }
        
        const htmlAmi = `
            <div class="chat-friend-item ${classeNotification}" data-ami-id="${amiId}" onclick="ouvrirChatAvecAmi('${amiId}', '${amiNom}')" style="position: relative;">
                ${badgeHTML}
                <div class="chat-friend-name">
                    👤 ${amiNom}
                    ${amiPseudo ? `(${amiPseudo})` : ''}
                </div>
                <div class="chat-friend-status">
                    ${alerteHTML}
                </div>
            </div>
        `;
        
        html += htmlAmi;
        console.log(`✅ [CHAT] HTML généré pour ${amiNom} avec ${messagesNonLus} messages non lus`);
    });
    
    console.log("🔧 [CHAT] Injection du HTML dans le container...");
    console.log("📄 [CHAT] HTML complet généré:", html);
    
    listeContainer.innerHTML = html;
    
    console.log("✅ [CHAT] AFFICHAGE TERMINÉ - Liste amis chat mise à jour avec succès");
    console.log("🔍 [CHAT] Contenu final du container:", listeContainer.innerHTML);
    console.log("📊 [CHAT] Nombre d'éléments .chat-friend-item:", listeContainer.querySelectorAll('.chat-friend-item').length);
}

function ouvrirChatAvecAmi(amiId, amiNom) {
    console.log(`💬 [CHAT] Ouverture chat avec ami: ${amiNom} (ID: ${amiId})`);
    console.log("📱 [TERMINAL] Démarrage session chat avec ami sélectionné");
    
    // Marquer cet ami comme sélectionné visuellement
    const tousLesAmis = document.querySelectorAll('.chat-friend-item');
    tousLesAmis.forEach(item => item.classList.remove('active'));
    
    const amiSelectionne = document.querySelector(`[data-ami-id="${amiId}"]`);
    if (amiSelectionne) {
        amiSelectionne.classList.add('active');
    }
    
    // Sauvegarder l'ami sélectionné globalement
    amiChatSelectionne = amiId;
    
    // Supprimer toutes les notifications pour cet ami
    supprimerNotificationsAmi(amiId);
    
    // Mettre à jour le select aussi (pour compatibilité)
    const selectChat = document.getElementById('amiChatSelection');
    if (selectChat) {
        selectChat.value = amiId;
    }
    
    // Charger l'historique des messages avec cet ami
    chargerMessagesChat(amiId);
    
    // Activer l'interface de chat
    activerInterfaceChat();
    
    // Marquer les messages comme lus
    marquerMessagesCommeeLus(amiId);
    
    console.log(`✅ [CHAT] Chat ouvert avec ${amiNom} - notifications supprimées`);
}

function getMessagesNonLus(amiId) {
    // Utiliser la même clé que dans les fonctions de notification
    const messagesNonLus = JSON.parse(localStorage.getItem('messagesNonLus') || '{}');
    return messagesNonLus[amiId] || 0;
}

function marquerMessagesCommeeLus(amiId) {
    console.log(`📖 [CHAT] Marquage messages comme lus pour ami ${amiId}`);
    console.log("💾 [TERMINAL] Mise à jour compteur messages non lus");
    
    // Réinitialiser le compteur dans le localStorage en utilisant le système unifié
    resetterMessagesNonLus(amiId);
    
    // Mettre à jour l'affichage
    const amiElement = document.querySelector(`[data-ami-id="${amiId}"]`);
    if (amiElement) {
        const statusDiv = amiElement.querySelector('.chat-friend-status');
        if (statusDiv) {
            statusDiv.innerHTML = '';
        }
    }
    
    console.log("✅ [CHAT] Messages marqués comme lus");
}

function incrementerMessagesNonLus(amiId) {
    console.log(`📬 [CHAT] Incrémentation messages non lus pour ami ${amiId}`);
    
    // Utiliser le système unifié
    let messagesNonLus = JSON.parse(localStorage.getItem('messagesNonLus') || '{}');
    const actuel = messagesNonLus[amiId] || 0;
    const nouveau = actuel + 1;
    
    messagesNonLus[amiId] = nouveau;
    localStorage.setItem('messagesNonLus', JSON.stringify(messagesNonLus));
    
    console.log(`📊 [TERMINAL] Compteur messages non lus: ${actuel} → ${nouveau}`);
    
    // Rafraîchir l'affichage de la liste
    chargerListeAmisChat();
}

// ========================================
// �📱 AUTO-INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 [CHAT] DOM chargé - Lancement chat");
    
    setTimeout(() => {
        initialiserChat();
    }, 800);
});

// ========================================
// 🛠️ FONCTION DE DEBUG/TEST
// ========================================
function debugListeAmisChat() {
    console.log("🔧 [DEBUG] === DIAGNOSTIC LISTE AMIS CHAT ===");
    
    // Vérifier l'élément DOM
    const container = document.getElementById('chatAmisListe');
    console.log("📱 [DEBUG] Container #chatAmisListe:", container);
    
    if (container) {
        console.log("✅ [DEBUG] Container trouvé");
        console.log("📄 [DEBUG] Contenu actuel:", container.innerHTML);
        console.log("📊 [DEBUG] Classe CSS:", container.className);
    } else {
        console.error("❌ [DEBUG] Container introuvable");
        return;
    }
    
    // Vérifier les données utilisateur
    const userStorage = localStorage.getItem('user');
    console.log("💾 [DEBUG] localStorage 'user':", userStorage);
    
    if (userStorage) {
        const user = JSON.parse(userStorage);
        console.log("👤 [DEBUG] Utilisateur parsé:", user);
        console.log("🆔 [DEBUG] ID utilisateur:", user._id);
    }
    
    // Tester la fonction de chargement
    console.log("🚀 [DEBUG] Test de chargerListeAmisChat...");
    chargerListeAmisChat();
}

// ========================================
// 🌍 EXPORTATION POUR USAGE EXTERNE (MISE À JOUR FINALE)
// ========================================
// Mettre à jour window.ChatModule avec toutes les fonctions réelles
Object.assign(window.ChatModule, {
    initialiser: initialiserChat,
    envoyerMessage: envoyerMessageChat,
    selectionnerAmi: selectionnerAmiPourChat,
    chargerMessages: chargerMessagesChat,
    afficherNouveau: afficherNouveauMessage,
    chargerListeAmis: chargerListeAmisChat,
    ouvrirChatAvecAmi: ouvrirChatAvecAmi,
    incrementerNonLus: incrementerMessagesNonLus,
    debug: debugListeAmisChat,  // Fonction de debug
    status: 'ready'  // Indiquer que le module est prêt
});

console.log("✅ [CHAT] === MODULE CHAT DÉFINI ===");
console.log("🌍 [TERMINAL] Module chat disponible globalement");

// Rendre les fonctions disponibles globalement pour les clics HTML et debug
// Mais seulement si le module est vraiment prêt
if (typeof ouvrirChatAvecAmi === 'function') {
    window.ouvrirChatAvecAmi = ouvrirChatAvecAmi;
    console.log("✅ [CHAT] ouvrirChatAvecAmi définie globalement");
} else {
    console.error("❌ [CHAT] ouvrirChatAvecAmi non disponible lors de l'exportation");
}

window.debugListeAmisChat = debugListeAmisChat;

// ========================================
// 🧪 FONCTIONS DE DEBUG ET TEST
// ========================================
function debugNotifications() {
    console.log("🧪 [DEBUG] === ÉTAT DES NOTIFICATIONS ===");
    
    const messagesNonLus = JSON.parse(localStorage.getItem('messagesNonLus') || '{}');
    console.log("📊 [DEBUG] Messages non lus:", messagesNonLus);
    
    Object.keys(messagesNonLus).forEach(amiId => {
        const count = messagesNonLus[amiId];
        const amiElement = document.querySelector(`[data-ami-id="${amiId}"]`);
        console.log(`👤 [DEBUG] Ami ${amiId}: ${count} messages, Element trouvé:`, !!amiElement);
        
        if (amiElement) {
            const badge = amiElement.querySelector('.new-message-badge');
            const alerte = amiElement.querySelector('.new-message-alert');
            console.log(`🔍 [DEBUG] - Badge présent: ${!!badge}, Alerte présente: ${!!alerte}`);
        }
    });
}

function testerNotificationPourAmi(amiId, nomAmi) {
    console.log(`🧪 [DEBUG] Test notification pour ami: ${nomAmi} (${amiId})`);
    
    // Ajouter un message non lu
    incrementerMessagesNonLus(amiId);
    
    // Recharger la liste pour voir les notifications
    chargerListeAmisChat();
    
    // Vérifier après un délai
    setTimeout(() => {
        debugNotifications();
    }, 500);
}

// Exposer les fonctions de debug globalement
window.debugChat = {
    debugNotifications,
    testerNotificationPourAmi,
    incrementerMessagesNonLus,
    resetterMessagesNonLus,
    chargerListeAmisChat,
    // Nouvelle fonction pour tester les cloches
    testerCloches: function() {
        console.log("🧪 [TEST] Test des cloches de notification");
        
        // Simuler des messages non lus pour tous les amis visibles
        const amisElements = document.querySelectorAll('[data-ami-id]');
        
        amisElements.forEach((element, index) => {
            const amiId = element.getAttribute('data-ami-id');
            const count = Math.floor(Math.random() * 15) + 1; // 1-15 messages
            
            // Ajouter des messages non lus
            let messagesNonLus = JSON.parse(localStorage.getItem('messagesNonLus') || '{}');
            messagesNonLus[amiId] = count;
            localStorage.setItem('messagesNonLus', JSON.stringify(messagesNonLus));
            
            console.log(`🔔 [TEST] Ami ${amiId}: ${count} messages simulés`);
        });
        
        // Recharger la liste pour voir les cloches
        chargerListeAmisChat();
        
        console.log("✅ [TEST] Cloches ajoutées - vérifiez la liste des amis");
    },
    
    // Fonction pour nettoyer les tests
    nettoyerTest: function() {
        localStorage.removeItem('messagesNonLus');
        chargerListeAmisChat();
        console.log("🧹 [TEST] Notifications nettoyées");
    },
    
    // Test direct avec éléments factices
    testDirectCloche: function() {
        console.log("🧪 [TEST] Test direct de cloche");
        
        // Créer un élément ami factice pour test
        const container = document.getElementById('chatAmisListe');
        if (!container) {
            console.error("❌ Container chatAmisListe introuvable");
            return;
        }
        
        // Nettoyer et créer un ami de test
        container.innerHTML = `
            <div class="chat-friend-item" data-ami-id="test123" style="position: relative; padding: 10px; border: 1px solid #ccc; margin: 5px;">
                <div class="chat-friend-name">👤 Ami Test</div>
                <div class="chat-friend-status"></div>
            </div>
        `;
        
        // Ajouter des messages non lus pour cet ami
        let messagesNonLus = JSON.parse(localStorage.getItem('messagesNonLus') || '{}');
        messagesNonLus['test123'] = 5;
        localStorage.setItem('messagesNonLus', JSON.stringify(messagesNonLus));
        
        // Appeler la fonction d'ajout de notification
        ajouterNotificationVisuelleAmi('test123', 'Ami', 'Test');
        
        console.log("✅ [TEST] Cloche ajoutée à l'ami test");
        console.log("🔍 [TEST] Vérifiez l'élément dans chatAmisListe");
    }
};
