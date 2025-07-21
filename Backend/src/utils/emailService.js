// ========================================
// 📧 SERVICE EMAIL SIMPLE - CHEZ NOUS
// ========================================

console.log("📧 [EMAIL] Module emailService.js chargé");

const nodemailer = require('nodemailer');

// Configuration simple du transporteur email
let transporter = null;

// ========================================
// 🔧 INITIALISATION TRANSPORTEUR EMAIL
// ========================================
function initialiserTransporteur() {
    console.log("🔧 [EMAIL] === DÉBUT INITIALISATION TRANSPORTEUR ===");
    console.log("⚙️ [EMAIL] Configuration du service d'envoi d'emails...");
    
    try {
        // Configuration simple avec Gmail (ou autre service)
        transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'cheznous.reseau@gmail.com',
                pass: process.env.EMAIL_PASS || 'votre_mot_de_passe_app'
            }
        });
        
        console.log("✅ [EMAIL] Transporteur configuré avec succès");
        console.log("📧 [EMAIL] Service utilisé: Gmail");
        console.log("👤 [EMAIL] Compte expéditeur:", process.env.EMAIL_USER || 'cheznous.reseau@gmail.com');
        console.log("🔐 [EMAIL] Mot de passe:", process.env.EMAIL_PASS ? 'Configuré depuis .env' : 'Valeur par défaut');
        
    } catch (error) {
        console.error("❌ [EMAIL] ERREUR lors de l'initialisation du transporteur:");
        console.error("❌ [EMAIL] Message:", error.message);
        console.error("❌ [EMAIL] Stack:", error.stack);
    }
    
    console.log("🏁 [EMAIL] === FIN INITIALISATION TRANSPORTEUR ===");
}

// ========================================
// 📨 FONCTION ENVOI EMAIL BIENVENUE
// ========================================
async function envoyerEmailBienvenue(destinataire) {
    console.log("📨 [EMAIL] === DÉBUT ENVOI EMAIL BIENVENUE ===");
    console.log("👤 [EMAIL] Destinataire:", destinataire.email);
    console.log("📝 [EMAIL] Nom complet:", destinataire.prenom, destinataire.nom);
    console.log("🕐 [EMAIL] Timestamp:", new Date().toISOString());
    
    // Vérifier que le transporteur est initialisé
    if (!transporter) {
        console.log("⚠️ [EMAIL] Transporteur non initialisé, initialisation...");
        initialiserTransporteur();
    }
    
    try {
        // Préparer le contenu de l'email
        console.log("📝 [EMAIL] Préparation du contenu de l'email...");
        
        const sujet = "Bienvenue chez Chez Nous ! 🏠";
        console.log("📋 [EMAIL] Sujet de l'email:", sujet);
        
        const contenuHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #1565c0; text-align: center;">🏠 Bienvenue chez Chez Nous !</h1>
                
                <p style="font-size: 16px; line-height: 1.5;">
                    Bonjour <strong>${destinataire.prenom} ${destinataire.nom}</strong>,
                </p>
                
                <p style="font-size: 16px; line-height: 1.5; background-color: #f0f8ff; padding: 15px; border-radius: 8px;">
                    Bonne nouvelle ! Vous êtes actuellement membre du réseau social 
                    <strong>"Chez Nous ! Le réseau social de l'immeuble"</strong>.
                </p>
                
                <p style="font-size: 16px; line-height: 1.5;">
                    <strong>Nous vous souhaitons la bienvenue !</strong> 🎉
                </p>
                
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2e7d32; margin-top: 0;">Vos informations d'inscription :</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>📧 Email :</strong> ${destinataire.email}</li>
                        <li><strong>👤 Nom :</strong> ${destinataire.nom}</li>
                        <li><strong>🙋 Prénom :</strong> ${destinataire.prenom}</li>
                        <li><strong>📅 Date d'inscription :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
                    </ul>
                </div>
                
                <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                    Cet email a été envoyé automatiquement par le système "Chez Nous".<br>
                    Merci de ne pas répondre à cet email.
                </p>
            </div>
        `;
        
        console.log("📄 [EMAIL] Contenu HTML préparé (longueur:", contenuHtml.length, "caractères)");
        
        // Configuration du message
        const messageConfig = {
            from: process.env.EMAIL_USER || 'cheznous.reseau@gmail.com',
            to: destinataire.email,
            subject: sujet,
            html: contenuHtml
        };
        
        console.log("⚙️ [EMAIL] Configuration du message:");
        console.log("   📤 Expéditeur:", messageConfig.from);
        console.log("   📥 Destinataire:", messageConfig.to);
        console.log("   📋 Sujet:", messageConfig.subject);
        console.log("   📄 Contenu HTML:", "Préparé et prêt");
        
        // Envoi de l'email
        console.log("🚀 [EMAIL] Tentative d'envoi de l'email...");
        const resultat = await transporter.sendMail(messageConfig);
        
        console.log("✅ [EMAIL] === EMAIL ENVOYÉ AVEC SUCCÈS ===");
        console.log("📧 [EMAIL] ID du message:", resultat.messageId);
        console.log("📊 [EMAIL] Statut d'envoi:", resultat.response);
        console.log("🎯 [EMAIL] Email de bienvenue livré à:", destinataire.email);
        
        return {
            success: true,
            messageId: resultat.messageId,
            destinataire: destinataire.email
        };
        
    } catch (error) {
        console.error("❌ [EMAIL] === ERREUR LORS DE L'ENVOI ===");
        console.error("❌ [EMAIL] Destinataire concerné:", destinataire.email);
        console.error("❌ [EMAIL] Type d'erreur:", error.name);
        console.error("❌ [EMAIL] Message d'erreur:", error.message);
        console.error("❌ [EMAIL] Code d'erreur:", error.code);
        console.error("❌ [EMAIL] Stack trace complète:", error.stack);
        
        return {
            success: false,
            error: error.message,
            destinataire: destinataire.email
        };
    }
    
    console.log("🏁 [EMAIL] === FIN ENVOI EMAIL BIENVENUE ===");
}

// ========================================
// 🧪 FONCTION TEST CONNEXION EMAIL
// ========================================
async function testerConnexionEmail() {
    console.log("🧪 [EMAIL] === DÉBUT TEST CONNEXION EMAIL ===");
    
    if (!transporter) {
        console.log("⚠️ [EMAIL] Transporteur non initialisé pour le test");
        initialiserTransporteur();
    }
    
    try {
        console.log("🔍 [EMAIL] Vérification de la connexion au serveur email...");
        await transporter.verify();
        
        console.log("✅ [EMAIL] Connexion email testée avec succès");
        return true;
        
    } catch (error) {
        console.error("❌ [EMAIL] ÉCHEC du test de connexion:");
        console.error("❌ [EMAIL] Erreur:", error.message);
        return false;
    }
    
    console.log("🏁 [EMAIL] === FIN TEST CONNEXION EMAIL ===");
}

// ========================================
// 🌍 EXPORT DES FONCTIONS
// ========================================
module.exports = {
    envoyerEmailBienvenue,
    testerConnexionEmail,
    initialiserTransporteur
};

console.log("✅ [EMAIL] Module emailService.js exporté avec succès");
