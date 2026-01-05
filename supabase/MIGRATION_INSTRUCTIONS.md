# Instructions de Migration - Système de Plans

## 📋 Étapes pour appliquer la migration

### 1. Accéder à Supabase Dashboard

1. Va sur [supabase.com](https://supabase.com)
2. Connecte-toi à ton compte
3. Sélectionne le projet: `nxphnksrsjdoydnojggj`

### 2. Ouvrir le SQL Editor

1. Dans le menu latéral, clique sur **SQL Editor**
2. Clique sur **New Query**

### 3. Exécuter la migration

1. Ouvre le fichier: `supabase/migrations/002_plans_system_clean.sql`
2. Copie **tout** le contenu du fichier
3. Colle dans l'éditeur SQL de Supabase
4. Clique sur **Run** (ou appuie sur `Ctrl + Enter` / `Cmd + Enter`)

### 4. Vérifier que tout fonctionne

Exécute ces requêtes une par une pour vérifier:

```sql
-- Vérifie que les 3 plans existent
SELECT * FROM plans;
```

Résultat attendu: 3 lignes (free, pro, trenchor)

```sql
-- Vérifie que les profiles ont un plan_id
SELECT id, wallet_address, plan_id FROM profiles;
```

Résultat attendu: Tous les profiles ont un plan_id (UUID)

```sql
-- Vérifie les plans assignés aux wallets
SELECT
  p.wallet_address,
  pl.name as plan_name,
  pl.limits
FROM profiles p
JOIN plans pl ON p.plan_id = pl.id;
```

Résultat attendu: Chaque wallet est lié à un plan avec ses limites

## 🎯 Après la migration

### Tester avec les wallets de dev

1. **Redémarre le serveur Next.js** si il tourne:
   ```bash
   # Ctrl+C pour arrêter
   npm run dev
   ```

2. **Connecte chaque wallet de test**:
   - Free: `DZ1mwdxWHPex57YjQWe9VAexVH8g9NHD8FyEGxF4f1Cf`
   - Pro: `4bciSXpEGKJv8e6oQ8LYe7iGRRUeomt9a9amaepenr8G`
   - Trenchor: `BFdXstBBfG4S8t6GAkV4iVJdCyCnhtwqdJbaeEmxTqen`

3. **Vérifie dans la navbar**:
   - Free wallet → Badge "Free Plan" (gris)
   - Pro wallet → Badge "Pro Plan" (orange)
   - Trenchor wallet → Badge "Trenchor Plan" (violet)

4. **Vérifie les limites d'historique**:
   - Free: "Your free plan includes 6 months of transaction history"
   - Pro/Trenchor: "Your pro/trenchor plan includes 12 months of transaction history"

## ⚠️ En cas de problème

### Erreur: "relation already exists"
La migration clean version gère ça automatiquement avec `DROP TABLE IF EXISTS`.

### Erreur: "column does not exist"
Exécute d'abord cette commande pour nettoyer:
```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS plan;
ALTER TABLE profiles DROP COLUMN IF EXISTS plan_id;
```
Puis réexécute la migration complète.

### Les wallets ont tous "Free Plan"
C'est normal! En développement, l'API `/api/profile` détecte automatiquement le wallet et assigne le bon plan. Déconnecte-toi et reconnecte-toi avec chaque wallet pour que l'assignation se fasse.

## 📊 Structure créée

### Table `plans`
- `id` (UUID)
- `name` (free | pro | trenchor)
- `features` (JSONB array)
- `limits` (JSONB object)

### Limits par plan
- **Free**: 6 mois, 1 wallet, 5 exports/mois
- **Pro**: 12 mois, 5 wallets, 100 exports/mois
- **Trenchor**: 12 mois, illimité wallets, illimité exports

### Table `profiles` (modifiée)
- Ajout de: `plan_id` (UUID, FK → plans.id)
- Suppression de: `plan` (TEXT)
