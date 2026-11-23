/* Vérification avant chaque publication (lancée par le crochet git « pre-push », ou à la main :
   node verifier-publication.mjs). Le dépôt public ne doit contenir QUE le code de l'outil.

   1. Liste fermée : seuls les fichiers de PUBLIABLES peuvent être suivis par git, dans l'index, dans le dernier commit
      ET dans tout l'historique (un fichier retiré mais déjà commité serait encore visible sur GitHub).
   2. Contenu : aucun numéro de reçu, de transaction ou de carte, et aucun des termes de la liste locale
      `.donnees-sensibles.txt` (noms et numéros de comptes, entités facturées…). Cette liste n'est jamais publiée :
      elle est créée sur cet ordinateur à partir de tests/reference.json (données réelles, elles aussi jamais publiées).
   Sortie 1 (publication bloquée) au moindre problème. */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const PUBLIABLES = new Set(['index.html', 'README.md', '.gitignore', 'verifier-publication.mjs'])
const LISTE = path.join(ROOT, '.donnees-sensibles.txt')
const REFERENCE = path.join(ROOT, 'tests', 'reference.json')

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const problems = []

// Termes sensibles : liste locale (créée depuis la référence de test si besoin).
if (!fs.existsSync(LISTE) && fs.existsSync(REFERENCE)) {
  const ref = JSON.parse(fs.readFileSync(REFERENCE, 'utf8'))
  const terms = new Set()
  for (const r of ref) {
    for (const v of [r.acc, r.accId, r.entite, r.paiement, r.num, r.tx]) if (v && String(v).length >= 4) terms.add(String(v))
    const top = String(r.file).split(/[\\/]/)[0]
    if (top) terms.add(top)
  }
  fs.writeFileSync(LISTE, `# Termes interdits dans le dépôt public (fichier local, jamais publié).\n${[...terms].sort().join('\n')}\n`, 'utf8')
}
const terms = fs.existsSync(LISTE)
  ? fs.readFileSync(LISTE, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  : []
if (!terms.length) console.warn('Attention : pas de liste locale de termes sensibles (.donnees-sensibles.txt) ; seuls les contrôles génériques sont faits.')

// Motifs génériques : n° de reçu LinkedIn (78 + 10 chiffres), n° de transaction (P + 9 chiffres), carte masquée (quatre étoiles puis quatre chiffres).
const PATTERNS = [
  [/\b78\d{10}\b/, 'numéro de reçu LinkedIn'],
  [/\bP\d{9}\b/, 'numéro de transaction'],
  [/\*{4}\s?\d{4}\b/, 'numéro de carte masqué'],
]
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function checkContent(label, file, content) {
  const plain = norm(content)
  for (const t of terms) if (plain.includes(norm(t))) problems.push(`${label} « ${file} » contient un terme de la liste sensible (ligne ${terms.indexOf(t) + 2} de .donnees-sensibles.txt).`)
  for (const [re, what] of PATTERNS) if (re.test(content)) problems.push(`${label} « ${file} » contient un ${what}.`)
}

let hasHead = true
try { git('rev-parse', '--verify', 'HEAD') } catch { hasHead = false }

// 1. Fichiers suivis (index), dernier commit, historique complet.
const indexFiles = git('ls-files', '-z').split('\0').filter(Boolean)
const headFiles = hasHead ? git('ls-tree', '-r', '-z', '--name-only', 'HEAD').split('\0').filter(Boolean) : []
const everFiles = hasHead ? git('log', '--all', '--name-only', '--pretty=format:', '-z').split(/\0|\n/).map((s) => s.trim()).filter(Boolean) : []
for (const [label, files] of [['Index :', indexFiles], ['Dernier commit :', headFiles], ['Historique :', everFiles]]) {
  for (const f of new Set(files)) if (!PUBLIABLES.has(f)) problems.push(`${label} fichier non prévu pour la publication : « ${f} ».`)
}

// 2. Contenu des fichiers publiables (index et dernier commit).
for (const f of indexFiles) if (PUBLIABLES.has(f)) checkContent('Index :', f, git('show', `:${f}`))
for (const f of headFiles) if (PUBLIABLES.has(f)) checkContent('Dernier commit :', f, git('show', `HEAD:${f}`))

if (problems.length) {
  console.error(`Publication bloquée : ${problems.length} problème(s).`)
  for (const p of [...new Set(problems)]) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`Vérification réussie : ${indexFiles.length} fichier(s) publiables, aucune donnée réelle détectée (${terms.length} termes sensibles contrôlés).`)
