// ========================================
// 👥 MODULE AMIS OPTIMISÉ
// Gestion des amis, messages privés et profils d'amis
// ========================================

console.log("🚀 [AMIS] === MODULE AMIS CHARGÉ ===");
console.log("👥 [TERMINAL] Initialisation système gestion amis");

// ========================================
// 📋 VARIABLES GLOBALES AMIS
// ========================================
let listeCompleteDAmis = [];
let amiProfilSelectionne = null;

// ========================================
// 📥 CHARGEMENT LISTE DES AMIS
// ========================================
async function chargerListeAmis() {
    console.log("📥 [AMIS] === DÉBUT CHARGEMENT LISTE AMIS ===");
    console.log("👥 [TERMINAL] Récupération liste amis pour écrire dans leurs profils");
    
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id;
        
        console.log("👤 [AMIS] AUTHENTIFICATION - User ID récupéré du localStorage:", userId);
        
        if (!userId) {
            console.warn("⚠️ [AMIS] Aucun utilisateur connecté - impossible de charger amis");
            console.warn("🔐 [TERMINAL] Session utilisateur inexistante");
            return [];
        }
        
        console.log("📡 [AMIS] REQUÊTE HTTP - Appel API vers /friends/amis...");
        const res = await fetch(`http://localhost:5000/friends/amis?userId=${userId}`);
        console.log(`📊 [AMIS] RÉPONSE HTTP - Statut reçu du serveur: ${res.status}`);
        
        if (!res.ok) {
            throw new Error(`Erreur HTTP ${res.status}: ${res.statusText}`);
        }
        
        const amis = await res.json();
        console.log(`👥 [AMIS] DONNÉES REÇUES - Nombre d'amis retournés: ${amis.length} amis disponibles pour écriture`);
        console.log("📝 [AMIS] LISTE AMIS - Détails:", amis.map(a => `${a.prenom} ${a.nom} (${a.pseudonyme})`));
        
        // Stocker la liste complète pour le filtrage
        listeCompleteDAmis = amis;
        console.log("💾 [AMIS] STOCKAGE - Liste complète des amis sauvegardée en mémoire pour filtrage");
        
        // Remplir les sélecteurs
        remplirSelecteursAmis(amis);
        
        // Afficher la liste des amis
        afficherListeAmis(amis);
        
        console.log("✅ [AMIS] === CHARGEMENT LISTE AMIS TERMINÉ AVEC SUCCÈS ===");
        console.log(`🎉 [TERMINAL] ${amis.length} amis chargés et affichés`);
        
        return amis;
        
    } catch (error) {
        console.error('💥 [AMIS] ERREUR CRITIQUE - Échec lors du chargement des amis:', error.message);
        console.error('📍 [AMIS] DIAGNOSTIC ERREUR - Stack trace complète:', error.stack);
        return [];
    }
}

// ========================================
// 🎨 REMPLISSAGE DES SÉLECTEURS D'AMIS
// ========================================
function remplirSelecteursAmis(amis) {
    console.log("🎨 [AMIS] MISE À JOUR INTERFACE - Remplissage des listes déroulantes");
    console.log(`📋 [TERMINAL] ${amis.length} amis à ajouter aux sélecteurs`);
    
    const selectProfil = document.getElementById('amiSelectionProfil');
    
    // Réinitialiser le sélecteur
    if (selectProfil) {
        selectProfil.innerHTML = '<option value="">Sélectionner un ami...</option>';
    }
    
    let optionsAjoutees = 0;
    amis.forEach(ami => {
        const optionText = `${ami.prenom} ${ami.nom} (${ami.pseudonyme})`;
        
        if (selectProfil) {
            const optionProfil = document.createElement('option');
            optionProfil.value = ami._id;
            optionProfil.textContent = optionText;
            selectProfil.appendChild(optionProfil);
        }
        
        optionsAjoutees++;
        console.log(`   ✅ [TERMINAL] Option ajoutée: ${optionText}`);
    });
    
    console.log(`✅ [AMIS] SÉLECTEURS - ${optionsAjoutees} options ajoutées aux listes déroulantes`);
}

// ========================================
// 📋 AFFICHAGE LISTE DES AMIS
// ========================================
function afficherListeAmis(amis) {
    console.log("📋 [AMIS] AFFICHAGE LISTE - Génération de la liste d'amis");
    console.log(`👥 [TERMINAL] ${amis.length} amis à afficher`);
    
    const listeDiv = document.getElementById('listeAmis');
    
    if (!listeDiv) {
        console.error("❌ [AMIS] Élément listeAmis introuvable");
        return;
    }
    
    if (amis.length === 0) {
        listeDiv.innerHTML = '<p style="color: #6c757d; font-style: italic; text-align: center; padding: 20px;">Aucun ami confirmé pour le moment. Ajoutez des voisins en tant qu\'amis !</p>';
        console.log("📭 [TERMINAL] Aucun ami à afficher - message d'aide affiché");
        return;
    }
    
    const contenuHTML = amis.map(ami => {
        return `
            <div class="ami-item" style="border: 1px solid #007bff; padding: 12px; margin: 8px 0; border-radius: 8px; background-color: #f8f9fa; display: flex; justify-content: space-between; align-items: center;">
                <div class="ami-info">
                    <strong style="color: #007bff;">👤 ${ami.prenom} ${ami.nom}</strong>
                    <br>
                    <small style="color: #6c757d;">📱 @${ami.pseudonyme} | 📍 ${ami.region || 'Région non définie'}</small>
                </div>
                <div class="ami-actions">
                    <button onclick="voirProfilAmi('${ami._id}')" class="btn btn-sm" style="background-color: #28a745; color: white; margin: 2px; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">
                        👁️ Profil
                    </button>
                    <button onclick="selectionnerAmiPourProfil('${ami._id}', '${ami.prenom}', '${ami.nom}', '${ami.pseudonyme}')" class="btn btn-sm" style="background-color: #fd7e14; color: white; margin: 2px; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">
                        📝 Écrire
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    listeDiv.innerHTML = contenuHTML;
    console.log("✅ [AMIS] LISTE AFFICHÉE - Interface amis mise à jour avec succès");
}

// ========================================
//  PUBLIER MESSAGE SUR PROFIL D'AMI
// ========================================
async function publierMessageProfilAmi() {
    console.log("🚀 [AMIS] === DÉBUT PUBLICATION MESSAGE PROFIL AMI ===");
    console.log("📝 [TERMINAL] Tentative publication message sur profil d'ami");
    
    const messageTextarea = document.getElementById('messageProfilAmi');
    const amiSelect = document.getElementById('amiSelectionProfil');
    
    const message = messageTextarea ? messageTextarea.value : '';
    const profilAmiId = amiSelect ? amiSelect.value : '';
    
    console.log("📊 [AMIS] DONNÉES FORMULAIRE - Validation des champs:");
    console.log(`   💬 Message: "${message.substring(0, 50)}..."`);
    console.log(`   👥 Profil ami sélectionné (ID): ${profilAmiId}`);
    
    if (!profilAmiId) {
        console.log("❌ [AMIS] VALIDATION ÉCHEC - Aucun ami sélectionné pour son profil");
        alert('Veuillez sélectionner un ami');
        return;
    }
    
    if (!message.trim()) {
        console.log("❌ [AMIS] VALIDATION ÉCHEC - Message vide");
        alert('Veuillez saisir un message');
        return;
    }
    
    const userId = JSON.parse(localStorage.getItem('user') || '{}')._id;
    
    if (!userId) {
        console.log("❌ [AMIS] ERREUR SESSION - Utilisateur non connecté");
        alert('Erreur de session. Veuillez vous reconnecter.');
        return;
    }
    
    console.log("✅ [AMIS] VALIDATION RÉUSSIE - Préparation publication sur profil ami");
    
    try {
        const requestData = { 
            profilAmiId: profilAmiId, 
            message: message.trim(),
            userId: userId
        };
        
        console.log("📤 [AMIS] DONNÉES ENVOYÉES - Payload JSON:", requestData);
        
        const res = await fetch('http://localhost:5000/messages/profil-ami', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestData)
        });
        
        console.log(`📡 [AMIS] RÉPONSE HTTP - Statut: ${res.status} ${res.statusText}`);
        
        const data = await res.json();
        console.log("📥 [AMIS] DONNÉES REÇUES - Réponse serveur:", data);
        
        if (res.ok) {
            console.log("✅ [AMIS] SUCCÈS - Message publié sur profil ami avec succès");
            messageTextarea.value = "";
            alert("✅ Message publié sur le profil de votre ami !");
        } else {
            console.log("❌ [AMIS] ERREUR - Échec publication sur profil ami");
            alert("❌ " + (data.message || "Erreur lors de la publication"));
        }
        
    } catch (error) {
        console.error('💥 [AMIS] ERREUR CRITIQUE - Échec publication profil ami:', error.message);
        console.error('📍 [AMIS] Stack trace:', error.stack);
        alert('❌ Erreur lors de la publication du message');
    }
    
    console.log("🏁 [AMIS] === FIN PUBLICATION MESSAGE PROFIL AMI ===");
}

// ========================================
// 👁️ VOIR PROFIL D'UN AMI
// ========================================
async function voirProfilAmi(amiId) {
    console.log(`👁️ [AMIS] Demande de visualisation profil ami: ${amiId}`);
    console.log("📄 [TERMINAL] Chargement des informations profil ami");
    
    try {
        const res = await fetch(`http://localhost:5000/messages/profil-ami/${amiId}`);
        
        if (!res.ok) {
            throw new Error(`Erreur HTTP ${res.status}`);
        }
        
        const profilData = await res.json();
        console.log("📥 [AMIS] Données profil ami reçues:", profilData);
        
        // Note : Section messagesProfilAmiSection supprimée - affichage désactivé
        console.log("ℹ️ [AMIS] Affichage profil ami désactivé (section supprimée)");
        
        // Alternative : afficher une alerte ou un modal avec les informations
        const infoTexte = `
👤 Profil de ${profilData.ami.prenom} ${profilData.ami.nom}
• Pseudo: ${profilData.ami.pseudonyme}
• Région: ${profilData.ami.region || 'Non définie'}

💬 Messages sur son profil: ${profilData.messages ? profilData.messages.length : 0} message(s)
        `;
        
        alert(infoTexte);
        
        console.log("✅ [AMIS] Profil ami affiché avec succès");
        
    } catch (error) {
        console.error('💥 [AMIS] Erreur lors du chargement profil ami:', error.message);
        alert('Erreur lors du chargement du profil');
    }
}

// ========================================
// 🎯 SÉLECTION AMI POUR PROFIL
// ========================================
function selectionnerAmiPourProfil(amiId, prenom, nom, pseudonyme) {
    console.log(`🎯 [AMIS] Sélection ami pour profil: ${prenom} ${nom} (${pseudonyme})`);
    console.log(`👤 [TERMINAL] Ami sélectionné pour écriture profil: ID ${amiId}`);
    
    amiProfilSelectionne = { amiId, prenom, nom, pseudonyme };
    
    // Mettre à jour le sélecteur
    const selectProfil = document.getElementById('amiSelectionProfil');
    if (selectProfil) {
        selectProfil.value = amiId;
        console.log("✅ [AMIS] Sélecteur profil ami mis à jour");
    }
    
    // Focus sur la zone de texte
    const messageTextarea = document.getElementById('messageProfilAmi');
    if (messageTextarea) {
        messageTextarea.focus();
        messageTextarea.placeholder = `Écrivez un message pour ${prenom} ${nom}...`;
        console.log("📝 [AMIS] Focus mis sur zone de texte profil ami");
    }
}

// ========================================
// 🔍 FILTRAGE DES AMIS
// ========================================
function filtrerAmis() {
    const filtreInput = document.getElementById('filtreAmis');
    
    if (!filtreInput) return;
    
    const termeRecherche = filtreInput.value.toLowerCase();
    console.log(`🔍 [AMIS] Filtrage amis avec terme: "${termeRecherche}"`);
    
    const amisFiltres = listeCompleteDAmis.filter(ami => {
        const nomComplet = `${ami.prenom} ${ami.nom} ${ami.pseudonyme}`.toLowerCase();
        return nomComplet.includes(termeRecherche);
    });
    
    console.log(`📋 [AMIS] ${amisFiltres.length} amis correspondent au filtre`);
    
    afficherListeAmis(amisFiltres);
}

// ========================================
// 🚀 INITIALISATION MODULE AMIS
// ========================================
function initialiserAmis() {
    console.log("🚀 [AMIS] === DÉBUT INITIALISATION AMIS ===");
    console.log("👥 [TERMINAL] Configuration système gestion amis");
    
    try {
        // Configurer bouton publication profil ami
        const boutonProfilAmi = document.getElementById('publierMessageProfil');
        if (boutonProfilAmi) {
            boutonProfilAmi.addEventListener('click', publierMessageProfilAmi);
            console.log("✅ [AMIS] Bouton publication profil ami configuré");
        }
        
        // Configurer filtrage
        const filtreInput = document.getElementById('filtreAmis');
        if (filtreInput) {
            filtreInput.addEventListener('input', filtrerAmis);
            console.log("✅ [AMIS] Filtrage amis configuré");
        }
        
        // Chargement initial si utilisateur connecté
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user._id) {
            console.log("✅ [AMIS] Utilisateur connecté - chargement initial amis");
            setTimeout(() => {
                chargerListeAmis();
            }, 500);
        }
        
        console.log("✅ [AMIS] === AMIS INITIALISÉS AVEC SUCCÈS ===");
        console.log("🎉 [TERMINAL] Système amis opérationnel");
        
    } catch (error) {
        console.error("💥 [AMIS] ERREUR lors de l'initialisation:", error.message);
        console.error("🚨 [TERMINAL] Échec initialisation amis:", error.stack);
    }
}

// ========================================
// 📱 AUTO-INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 [AMIS] DOM chargé - Lancement amis");
    
    setTimeout(() => {
        initialiserAmis();
    }, 600);
});

// ========================================
// 🌍 EXPORTATION POUR USAGE EXTERNE
// ========================================
window.AmisModule = {
    initialiser: initialiserAmis,
    chargerListe: chargerListeAmis,
    publierSurProfil: publierMessageProfilAmi,
    voirProfil: voirProfilAmi,
    selectionnerPourProfil: selectionnerAmiPourProfil,
    filtrer: filtrerAmis
};

// Exposer les fonctions pour les boutons HTML
window.voirProfilAmi = voirProfilAmi;
window.selectionnerAmiPourProfil = selectionnerAmiPourProfil;

console.log("✅ [AMIS] === MODULE AMIS DÉFINI ===");
console.log("🌍 [TERMINAL] Module amis disponible globalement");
