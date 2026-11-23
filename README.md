# Reçus LinkedIn Ads — mode d'emploi

Outil d'une seule page (`index.html`), publié sur GitHub Pages : **https://eyrobinet.github.io/recus-linkedin/**.
Il lit les reçus (facturettes) LinkedIn Ads d'un dossier Google Drive, les range par client et produit statistiques,
relevés, récapitulatifs et exports. Tout est traité **dans le navigateur** : aucun serveur, aucune base de données.

**Mode d'emploi pour les utilisatrices** (français simple, captures annotées avec des données fictives) : [mode-emploi.html](mode-emploi.html), lien « Mode d'emploi » en haut de l'outil, et version PDF à imprimer ([mode-emploi.pdf](mode-emploi.pdf), 4 pages).

## Confidentialité

- Les reçus sont lus depuis Google Drive **en lecture seule** (autorisation `drive.readonly`) : l'outil ne crée,
  ne modifie, ne déplace et ne supprime jamais rien sur Drive.
- La page n'échange des données qu'avec Google (connexion, choix du dossier, API Drive). Sa politique de sécurité
  interdit toute autre destination. Les bibliothèques (pdf.js, JSZip, jsPDF, SheetJS) viennent de cdnjs et sont
  vérifiées par leur empreinte.
- Le jeton d'accès Google reste en mémoire le temps de la session : il n'est jamais enregistré. Le navigateur
  garde seulement le dossier choisi (identifiant, nom), la correspondance des comptes et le thème.
- Le dépôt GitHub ne contient que le code de l'outil, jamais de reçu ni de donnée de client.

## Utilisation

1. **Importer**
   - **Google Drive** : « Se connecter à Google Drive ». Une fenêtre Google s'ouvre : connectez-vous et acceptez
     l'accès en lecture. Choisissez ensuite le dossier des reçus, dans « Mon Drive », « Partagés avec moi » ou un
     Drive partagé. L'outil lit tous les PDF du dossier et de ses sous-dossiers, avec une barre de progression.
     Les autres fichiers sont comptés mais pas lus.
   - **Synchroniser** recharge le dossier et ne lit que les nouveaux fichiers, ou ceux qui ont été modifiés.
   - Le dossier est mémorisé : la fois suivante, « Se connecter et synchroniser » suffit.
   - **En secours**, vous pouvez déposer des PDF ou un dossier dans la zone prévue.
   - Un même reçu n'est jamais compté deux fois.
2. **Rattacher les comptes** : saisissez le client de chaque compte publicitaire. Les comptes à rattacher sont en
   orange. Exportez la correspondance (fichier JSON) pour la retrouver sur un autre poste ; elle est aussi gardée
   dans le navigateur.
3. **Filtres du haut de page** : *Client* et *Mois* (« Tous » ou un choix). Ils filtrent toute la page :
   statistiques, détail des reçus, relevés, récapitulatifs et exports. L'import, la correspondance et les contrôles
   restent complets. Les listes ne proposent que les clients et les mois qui ont des reçus.
4. **Statistiques** : période, **mois de rattachement** (*fin de la période de facturation* par défaut, ou *date de
   transaction*) et montant (*TTC* ou *HT*). Le mois de rattachement vaut pour toute la page. On y trouve le total
   par client, le graphique mensuel et le détail des reçus.
5. **Contrôles** :
   - les reçus « **À vérifier** » (illisibles, incomplets, incohérents) ne sont **pas comptés**. « Compter quand
     même » est possible après vérification du PDF ;
   - les doublons écartés et les fichiers qui ne sont pas des reçus LinkedIn sont listés.
6. **Relevés par client** : choisissez la période (mois, trimestre, année ou dates libres) et les clients.
   - Le PDF donne un fichier par client, regroupés dans un ZIP s'il y a plusieurs clients.
   - L'Excel a un onglet par client et un onglet récapitulatif.
   - Chaque relevé indique les reçus en attente de vérification.
7. **Récapitulatifs**, en *TTC*, *HT* ou *TVA*, exportables en PDF et en Excel :
   - **Annuel** : une ligne par client, une colonne par mois de l'année choisie, avec les totaux ;
   - **Depuis le début** : une ligne par client, une colonne par année, les totaux, et le mois du premier et du
     dernier reçu de chaque client.
8. **Exports** :
   - un ZIP avec un dossier par client et les PDF renommés `AAAA-MM_Client_Recu-numéro.pdf` ;
   - un fichier Excel avec une ligne par reçu, les totaux et les contrôles.

## Configuration Google (une seule fois, par l'administrateur du projet Google Cloud)

L'identifiant client et la clé API ne sont pas des secrets : ils sont visibles dans la page et ne fonctionnent
que depuis l'adresse autorisée. Ils se renseignent en haut de `index.html` (`window.RECUS_CONFIG`).

1. **API** (Google Cloud › API et services › Bibliothèque) : activez *Google Drive API* et *Google Picker API*.
2. **Écran de consentement** (Google Auth Platform) : la portée `…/auth/drive.readonly` doit être déclarée.
   Si l'application est « en test », ajoutez comme utilisateurs de test les comptes Google qui utiliseront l'outil.
3. **Identifiant client OAuth** (Identifiants › Créer des identifiants › ID client OAuth) :
   - type : **Application Web** ; nom : « Reçus LinkedIn (GitHub Pages) » ;
   - origines JavaScript autorisées : `https://eyrobinet.github.io`. Pour les essais locaux, ajoutez aussi
     `http://localhost:8799` ;
   - URI de redirection : aucun.
4. **Clé API du Picker** (Identifiants › Créer des identifiants › Clé API), puis « Modifier la clé » :
   - restriction d'application : **Sites Web**, avec `https://eyrobinet.github.io/recus-linkedin/*` (et
     `http://localhost:8799/*` pour les essais) ;
   - restriction d'API : **Google Picker API** uniquement.

La configuration contient aussi `googleAppId`, le numéro du projet Google Cloud (début de l'identifiant client), que
l'outil transmet au Google Picker.

## Dépannage

- **La fenêtre de choix du dossier (Google Picker) reste blanche.** Appuyez sur Échap pour la fermer, puis collez le
  lien du dossier dans « Ou collez le lien du dossier Drive » : l'outil vérifie le dossier par l'API Drive, puis le lit,
  sans passer par la fenêtre de choix. Cause la plus fréquente : le navigateur bloque les cookies tiers de Google, dont
  la fenêtre de choix a besoin. Si Google propose « Autoriser les cookies », acceptez. Sinon, dans Chrome, allez dans
  Paramètres › Confidentialité et sécurité › Cookies tiers › « Sites autorisés à utiliser des cookies tiers », et
  ajoutez `[*.]google.com`.
- **La page signale un blocage par sa politique de sécurité.** Le message affiché sous le panneau Google Drive donne
  la directive et le domaine concernés : transmettez-le pour corriger la page.
- **La fenêtre de choix indique que la clé n'est pas valide.** Dans Google Cloud, vérifiez la restriction « Sites
  Web » de la clé API. Si besoin, élargissez-la à `https://eyrobinet.github.io/*`.

## Publication

Le dépôt public ne contient que `index.html`, `README.md`, `.gitignore`, `verifier-publication.mjs`, le mode d'emploi
(`mode-emploi.html`, `mode-emploi.pdf`) et ses captures `aide/*.png`, faites uniquement avec des reçus fictifs.

- `node verifier-publication.mjs` contrôle, avant chaque publication, que seuls ces fichiers sont suivis par git,
  dans le dernier commit comme dans tout l'historique. Il vérifie aussi qu'aucun numéro de reçu, de transaction ou
  de carte n'y figure, ni aucun terme de la liste locale `.donnees-sensibles.txt` (jamais publiée).
- Ce contrôle est lancé automatiquement par `git push` (crochet local `pre-push`), qui est refusé en cas de
  problème.
- GitHub Pages : Settings › Pages › *Deploy from a branch*, branche `main`, dossier `/ (root)`.
