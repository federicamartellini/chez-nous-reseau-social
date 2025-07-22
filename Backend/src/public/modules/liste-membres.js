// ========================================
// 👥 MODULE LISTE DES MEMBRES
// Gestion de l'affichage de tous les membres inscrits
// ========================================

console.log("🚀 [LISTE-MEMBRES] Module liste des membres chargé");

// ========================================
// 📊 VARIABLES GLOBALES
// ========================================
let tousLesMembres = [];
let membresFiltres = [];

// ========================================
// 🏗️ GESTIONNAIRE PRINCIPAL
// ========================================
const ListeMembresModule = {
    status: 'loading',
    
    /**
     * Initialise le module liste des membres
     */
    init() {
        console.log("🏗️ [LISTE-MEMBRES] Initialisation du module");
        
        this.attachEventListeners();
        this.status = 'ready';
        
        console.log("✅ [LISTE-MEMBRES] Module initialisé avec succès");
    },
    
    /**
     * Attache les écouteurs d'événements
     */
    attachEventListeners() {
        // Filtre de recherche
        const filtreMembres = document.getElementById('filtreMembres');
        if (filtreMembres) {
            filtreMembres.addEventListener('input', (e) => {
                this.filtrerMembres(e.target.value);
            });
        }
        
        // Bouton actualiser
        const btnActualiser = document.getElementById('actualiserMembres');
        if (btnActualiser) {
            btnActualiser.addEventListener('click', () => {
                this.chargerMembres();
            });
        }
        
        console.log("👂 [LISTE-MEMBRES] Écouteurs d'événements attachés");
    },
    
    /**
     * Charge la liste de tous les membres
     */
    async chargerMembres() {
        console.log("📥 [LISTE-MEMBRES] Chargement des membres...");
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user._id) {
            console.error("❌ [LISTE-MEMBRES] Utilisateur non connecté");
            this.afficherErreur("Vous devez être connecté pour voir la liste des membres");
            return;
        }
        
        try {
            // Afficher le loading
            this.afficherLoading();
            
            // Charger les membres ET les relations d'amitié en parallèle
            const [responseMembres, responseAmis, responseEnvoyees, responseRecues] = await Promise.all([
                fetch(API_CONFIG.url(`/friends/membres?userId=${user._id}`)),
                fetch(API_CONFIG.url(`/friends/amis?userId=${user._id}`)),
                fetch(API_CONFIG.url(`/friends/demandes-envoyees?userId=${user._id}`)),
                fetch(API_CONFIG.url(`/friends/demandes-recues?userId=${user._id}`))
            ]);
            
            if (!responseMembres.ok) {
                throw new Error(`Erreur HTTP: ${responseMembres.status}`);
            }
            
            tousLesMembres = await responseMembres.json();
            const amisConfirmes = responseAmis.ok ? await responseAmis.json() : [];
            const demandesEnvoyees = responseEnvoyees.ok ? await responseEnvoyees.json() : [];
            const demandesRecues = responseRecues.ok ? await responseRecues.json() : [];
            
            // Stocker les relations pour l'affichage des boutons
            this.amisConfirmes = amisConfirmes;
            this.demandesEnvoyees = demandesEnvoyees;
            this.demandesRecues = demandesRecues;
            
            membresFiltres = [...tousLesMembres];
            
            console.log(`✅ [LISTE-MEMBRES] ${tousLesMembres.length} membres chargés`);
            console.log(`👥 [LISTE-MEMBRES] Relations: ${amisConfirmes.length} amis, ${demandesEnvoyees.length} envoyées, ${demandesRecues.length} reçues`);
            
            // Mettre à jour l'affichage
            this.afficherMembres();
            this.mettreAJourStats();
            
        } catch (error) {
            console.error("❌ [LISTE-MEMBRES] Erreur lors du chargement des membres:", error);
            this.afficherErreur("Erreur lors du chargement des membres");
        }
    },
    
    /**
     * Filtre les membres selon le texte de recherche
     */
    filtrerMembres(texteRecherche) {
        const recherche = texteRecherche.toLowerCase().trim();
        
        if (!recherche) {
            membresFiltres = [...tousLesMembres];
        } else {
            membresFiltres = tousLesMembres.filter(membre => 
                membre.nom.toLowerCase().includes(recherche) ||
                membre.prenom.toLowerCase().includes(recherche) ||
                membre.pseudonyme.toLowerCase().includes(recherche) ||
                (membre.region && membre.region.toLowerCase().includes(recherche))
            );
        }
        
        console.log(`🔍 [LISTE-MEMBRES] Filtrage: "${texteRecherche}" -> ${membresFiltres.length} résultats`);
        this.afficherMembres();
        this.mettreAJourStats();
    },
    
    /**
     * Affiche la liste des membres
     */
    afficherMembres() {
        const listeMembres = document.getElementById('listeMembres');
        if (!listeMembres) return;
        
        if (membresFiltres.length === 0) {
            listeMembres.innerHTML = `
                <div class="no-members" style="text-align: center; padding: 20px; color: #6c757d;">
                    <p>Aucun membre trouvé</p>
                </div>
            `;
            return;
        }
        
        const html = membresFiltres.map(membre => this.creerCarteMembre(membre)).join('');
        listeMembres.innerHTML = html;
        
        console.log(`👥 [LISTE-MEMBRES] ${membresFiltres.length} membres affichés`);
    },
    
    /**
     * Crée le HTML pour une carte membre
     */
    creerCarteMembre(membre) {
        const user = JSON.parse(localStorage.getItem('user'));
        const roleIcon = this.obtenirIconeRole(membre.role);
        const regionText = membre.region ? ` - ${membre.region}` : '';
        
        // Ne pas afficher sa propre carte
        if (membre._id === user._id) {
            return '';
        }
        
        // Déterminer l'état de la relation
        const estAmi = this.amisConfirmes && this.amisConfirmes.some(a => String(a._id) === String(membre._id));
        const demandeEnvoyee = this.demandesEnvoyees && this.demandesEnvoyees.some(d => String(d._id) === String(membre._id));
        const demandeRecue = this.demandesRecues && this.demandesRecues.some(d => String(d._id) === String(membre._id));
        
        // Générer le bouton approprié
        let boutonAction = '';
        if (estAmi) {
            boutonAction = `
                <button style="
                    padding: 4px 8px; 
                    background: #28a745; 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    font-size: 12px; 
                    cursor: default;
                    opacity: 1;
                " 
                disabled
                title="Vous êtes déjà amis">
                    ✅ Ami confirmé
                </button>
            `;
        } else if (demandeEnvoyee) {
            boutonAction = `
                <button style="
                    padding: 4px 8px; 
                    background: #ffc107; 
                    color: #333; 
                    border: none; 
                    border-radius: 4px; 
                    font-size: 12px; 
                    cursor: default;
                " 
                disabled
                title="Demande d'amitié en attente">
                    ⏳ En attente de confirmation
                </button>
            `;
        } else if (demandeRecue) {
            boutonAction = `
                <button onclick="event.stopPropagation(); ListeMembresModule.accepterDemande('${membre._id}')" 
                        style="
                            padding: 4px 8px; 
                            background: #17a2b8; 
                            color: white; 
                            border: none; 
                            border-radius: 4px; 
                            font-size: 12px; 
                            cursor: pointer;
                        "
                        title="Accepter la demande d'amitié">
                    🤝 Demande d'amitié
                </button>
            `;
        } else {
            boutonAction = `
                <button onclick="event.stopPropagation(); ListeMembresModule.ajouterAmi('${membre._id}')" 
                        style="
                            padding: 4px 8px; 
                            background: #007bff; 
                            color: white; 
                            border: none; 
                            border-radius: 4px; 
                            font-size: 12px; 
                            cursor: pointer;
                        "
                        title="Ajouter comme ami">
                    ➕ Ajouter ami
                </button>
            `;
        }
        
        return `
            <div class="membre-carte" style="
                display: flex; 
                align-items: center; 
                padding: 12px; 
                margin-bottom: 8px; 
                background: white; 
                border: 1px solid #e9ecef; 
                border-radius: 6px; 
                transition: background-color 0.2s;
                cursor: pointer;
            " 
            onmouseover="this.style.backgroundColor='#f8f9fa'" 
            onmouseout="this.style.backgroundColor='white'"
            onclick="ListeMembresModule.voirProfilMembre('${membre._id}')">
                
                <div class="membre-avatar" style="
                    width: 40px; 
                    height: 40px; 
                    background: linear-gradient(135deg, #007bff, #0056b3); 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-weight: bold; 
                    margin-right: 12px;
                    font-size: 16px;
                ">
                    ${membre.prenom.charAt(0).toUpperCase()}${membre.nom.charAt(0).toUpperCase()}
                </div>
                
                <div class="membre-info" style="flex: 1;">
                    <div class="membre-nom" style="font-weight: bold; color: #333; margin-bottom: 2px;">
                        ${roleIcon} ${membre.prenom} ${membre.nom}
                    </div>
                    <div class="membre-details" style="font-size: 13px; color: #6c757d;">
                        @${membre.pseudonyme}${regionText}
                    </div>
                </div>
                
                <div class="membre-actions" style="margin-left: 8px;">
                    ${boutonAction}
                </div>
            </div>
        `;
    },
    
    /**
     * Obtient l'icône selon le rôle du membre
     */
    obtenirIconeRole(role) {
        switch (role) {
            case 'admin': return '👑';
            case 'moderateur': return '🛡️';
            case 'membre': return '👤';
            default: return '👤';
        }
    },
    
    /**
     * Met à jour les statistiques
     */
    mettreAJourStats() {
        const totalMembres = document.getElementById('totalMembres');
        if (totalMembres) {
            const texte = membresFiltres.length !== tousLesMembres.length ? 
                `${membresFiltres.length} / ${tousLesMembres.length}` : 
                tousLesMembres.length;
            totalMembres.textContent = texte;
        }
    },
    
    /**
     * Affiche l'état de chargement
     */
    afficherLoading() {
        const listeMembres = document.getElementById('listeMembres');
        if (listeMembres) {
            listeMembres.innerHTML = `
                <div class="loading" style="text-align: center; padding: 20px;">
                    <p>🔄 Chargement des membres...</p>
                </div>
            `;
        }
    },
    
    /**
     * Affiche un message d'erreur
     */
    afficherErreur(message) {
        const listeMembres = document.getElementById('listeMembres');
        if (listeMembres) {
            listeMembres.innerHTML = `
                <div class="error" style="text-align: center; padding: 20px; color: #dc3545;">
                    <p>❌ ${message}</p>
                    <button onclick="ListeMembresModule.chargerMembres()" 
                            style="
                                padding: 8px 16px; 
                                background: #007bff; 
                                color: white; 
                                border: none; 
                                border-radius: 4px; 
                                cursor: pointer; 
                                margin-top: 10px;
                            ">
                        🔄 Réessayer
                    </button>
                </div>
            `;
        }
    },
    
    /**
     * Voir le profil d'un membre (placeholder)
     */
    voirProfilMembre(membreId) {
        console.log(`👤 [LISTE-MEMBRES] Voir profil du membre: ${membreId}`);
        alert(`Fonctionnalité "Voir le profil" à venir pour le membre ${membreId}`);
    },
    
    /**
     * Ajouter un membre comme ami
     */
    async ajouterAmi(membreId) {
        console.log(`➕ [LISTE-MEMBRES] Ajouter ami: ${membreId}`);
        
        // Vérifier si le module FriendsManager est disponible (il s'appelle FriendsManager, pas FriendsModule)
        if (window.FriendsManager && typeof window.FriendsManager.sendFriendRequest === 'function') {
            try {
                await window.FriendsManager.sendFriendRequest(membreId);
                console.log("✅ [LISTE-MEMBRES] Demande d'amitié envoyée via FriendsManager");
                
                // Actualiser la liste pour refléter le changement
                this.chargerMembres();
                
            } catch (error) {
                console.error("❌ [LISTE-MEMBRES] Erreur demande d'amitié:", error);
                
                // Vérifier si c'est une demande déjà envoyée
                if (error.message && error.message.includes('400')) {
                    alert("Cette demande d'amitié a déjà été envoyée ou vous êtes déjà amis !");
                } else {
                    alert("Erreur lors de l'envoi de la demande d'amitié");
                }
            }
        } else {
            console.warn("⚠️ [LISTE-MEMBRES] Module FriendsManager non disponible");
            
            // Solution de secours : appel direct à l'API
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user._id) {
                    alert("Vous devez être connecté pour envoyer une demande d'amitié");
                    return;
                }
                
                console.log("🔄 [LISTE-MEMBRES] Utilisation de l'API directe pour demande d'amitié");
                
                const response = await fetch(API_CONFIG.url('/friends/demander'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: user._id,
                        cibleId: membreId
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    
                    if (response.status === 400) {
                        alert(errorData.message || "Cette demande d'amitié a déjà été envoyée ou vous êtes déjà amis !");
                    } else {
                        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
                    }
                    return;
                }
                
                const result = await response.json();
                console.log("✅ [LISTE-MEMBRES] Demande d'amitié envoyée via API directe");
                alert("Demande d'amitié envoyée avec succès !");
                
                // Actualiser la liste pour refléter le changement
                this.chargerMembres();
                
            } catch (error) {
                console.error("❌ [LISTE-MEMBRES] Erreur API directe:", error);
                alert(`Erreur: ${error.message}`);
            }
        }
    },
    
    /**
     * Accepter une demande d'amitié reçue
     */
    async accepterDemande(demandeurId) {
        console.log(`🤝 [LISTE-MEMBRES] Accepter demande d'amitié de: ${demandeurId}`);
        
        // Vérifier si le module FriendsManager est disponible
        if (window.FriendsManager && typeof window.FriendsManager.acceptFriendRequest === 'function') {
            try {
                await window.FriendsManager.acceptFriendRequest(demandeurId);
                console.log("✅ [LISTE-MEMBRES] Demande d'amitié acceptée via FriendsManager");
                
                // Actualiser la liste pour refléter le changement
                this.chargerMembres();
                
            } catch (error) {
                console.error("❌ [LISTE-MEMBRES] Erreur acceptation demande:", error);
                alert("Erreur lors de l'acceptation de la demande d'amitié");
            }
        } else {
            console.warn("⚠️ [LISTE-MEMBRES] Module FriendsManager non disponible");
            
            // Solution de secours : appel direct à l'API
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user._id) {
                    alert("Vous devez être connecté pour accepter une demande d'amitié");
                    return;
                }
                
                console.log("🔄 [LISTE-MEMBRES] Utilisation de l'API directe pour accepter demande");
                
                const response = await fetch(API_CONFIG.url('/friends/accepter'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: user._id,
                        demandeurId: demandeurId
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
                }
                
                const result = await response.json();
                console.log("✅ [LISTE-MEMBRES] Demande d'amitié acceptée via API directe");
                alert("Demande d'amitié acceptée avec succès !");
                
                // Actualiser la liste pour refléter le changement
                this.chargerMembres();
                
            } catch (error) {
                console.error("❌ [LISTE-MEMBRES] Erreur API directe:", error);
                alert(`Erreur: ${error.message}`);
            }
        }
    },
    
    /**
     * Affiche/Cache la section
     */
    toggle() {
        const section = document.getElementById('listeMembresSection');
        if (!section) return;
        
        const isVisible = section.style.display !== 'none';
        
        if (isVisible) {
            section.style.display = 'none';
            console.log("🫥 [LISTE-MEMBRES] Section masquée");
        } else {
            section.style.display = 'block';
            console.log("👁️ [LISTE-MEMBRES] Section affichée");
            
            // Charger les membres si pas encore fait
            if (tousLesMembres.length === 0) {
                this.chargerMembres();
            }
        }
    }
};

// ========================================
// 🚀 INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    ListeMembresModule.init();
    
    // Charger automatiquement les membres lors de la connexion
    const checkUserAndLoad = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user._id && tousLesMembres.length === 0) {
            console.log("🎯 [LISTE-MEMBRES] Utilisateur connecté détecté, chargement automatique");
            ListeMembresModule.chargerMembres();
        }
    };
    
    // Vérifier immédiatement
    checkUserAndLoad();
    
    // Écouter les changements de localStorage pour détecter la connexion
    window.addEventListener('storage', function(e) {
        if (e.key === 'user') {
            checkUserAndLoad();
        }
    });
});

// ========================================
// 🌐 EXPORT GLOBAL
// ========================================
window.ListeMembresModule = ListeMembresModule;

console.log("✅ [LISTE-MEMBRES] Module exporté globalement");
