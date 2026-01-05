# Différence entre TRADE et TRANSFER

## 🔄 TRADE (Swap)

Un **trade** est un **échange de tokens**. L'utilisateur donne un token et reçoit un autre token.

### Caractéristiques d'un trade:
- ✅ 2 mouvements de tokens dans **la même transaction**
- ✅ Token A sort du wallet (outgoing)
- ✅ Token B entre dans le wallet (incoming)
- ✅ Passage par un DEX (Jupiter, Raydium, Orca, Pump.fun, etc.)
- ✅ Instructions swap dans la transaction

### Exemples de trades:
1. **Acheter un memecoin**
   - OUT: 1 SOL
   - IN: 1,000,000 BONK
   - DEX: Jupiter Aggregator

2. **Vendre un token**
   - OUT: 500 USDC
   - IN: 0.5 SOL
   - DEX: Raydium

3. **Trade via bot (Axiom, Padre, etc.)**
   - OUT: 0.1 SOL
   - IN: 50,000 TOKEN
   - DEX: Pump.fun via Axiom
   - Note: Le bot appelle le DEX, c'est toujours un swap!

### Identification dans Helius:
```javascript
// Transaction avec type "SWAP"
{
  type: "SWAP",
  source: "JUPITER_V6", // ou RAYDIUM, ORCA, PUMP_FUN
  tokenTransfers: [
    { fromUserAccount: true, amount: 1000000 }, // SOL out
    { toUserAccount: true, amount: 5000000 }    // TOKEN in
  ]
}
```

---

## 📤 TRANSFER

Un **transfer** est un **envoi simple** d'un token d'un wallet à un autre. Pas d'échange.

### Caractéristiques d'un transfer:
- ✅ 1 seul mouvement de token
- ✅ Direction unique (soit IN, soit OUT)
- ✅ Pas de DEX impliqué
- ✅ Type: "TRANSFER" dans Helius

### Exemples de transfers:

1. **Envoyer des SOL à un ami**
   - OUT: 5 SOL
   - Destination: Wallet d'un ami

2. **Recevoir des tokens**
   - IN: 100 USDC
   - Source: Binance, ami, etc.

3. **Déposer sur une plateforme**
   - OUT: 10 SOL
   - Destination: Adresse de dépôt CEX

### Identification dans Helius:
```javascript
// Transaction avec type "TRANSFER"
{
  type: "TRANSFER",
  tokenTransfers: [
    { fromUserAccount: true, amount: 5000000 } // Uniquement OUT
  ]
}
```

---

## 🤖 CAS SPÉCIAUX: Bots de trading

### Axiom, Padre.app, BonkBot, etc.

**IMPORTANT**: Les bots ne font PAS de transferts, ils font des SWAPS!

Quand un utilisateur trade via un bot:
1. User envoie une commande au bot (Telegram, interface web)
2. Le bot **exécute un swap** sur un DEX
3. La transaction blockchain = SWAP standard

### Exemple concret:

**User commande via Axiom:**
```
/buy 0.5 SOL of BONK
```

**Transaction résultante sur Solana:**
```javascript
{
  type: "SWAP",
  source: "JUPITER_V6",  // Axiom utilise Jupiter
  description: "Swapped 0.5 SOL for 1.2M BONK",
  tokenTransfers: [
    { token: "SOL", fromUserAccount: true, amount: 0.5 },
    { token: "BONK", toUserAccount: true, amount: 1200000 }
  ]
}
```

**C'est un TRADE, pas un transfer!**

---

## ⚠️ Problèmes actuels dans le code

### 1. Mauvaise catégorisation

Le code actuel peut classifier certains swaps comme transfers si:
- La transaction a un seul `tokenTransfer` visible
- Le parsing Helius ne détecte pas le swap
- Les bots utilisent des instructions custom

### 2. Code à vérifier

`lib/solana-transactions.ts` ligne ~100-150:

```typescript
// PROBLÈME: Si on se base uniquement sur tokenTransfers.length
if (tokenTransfers.length === 1) {
  return "transfer"; // ❌ FAUX pour certains swaps!
}
```

### 3. Solutions

**Option A: Utiliser `type` de Helius** (recommandé)
```typescript
const txType = enrichedTx.type; // "SWAP", "TRANSFER", etc.
if (txType === "SWAP") {
  return "swap";
}
```

**Option B: Détecter les instructions DEX**
```typescript
const instructions = tx.transaction.message.instructions;
const isDexSwap = instructions.some(ix =>
  DEX_PROGRAM_IDS.includes(ix.programId)
);
```

**Option C: Vérifier les tokenTransfers bidirectionnels**
```typescript
const hasIncoming = tokenTransfers.some(t => t.toUserAccount);
const hasOutgoing = tokenTransfers.some(t => t.fromUserAccount);
if (hasIncoming && hasOutgoing) {
  return "swap"; // Échange = trade
}
```

---

## 📊 Impact fiscal

**Pourquoi c'est important?**

- **TRADE**: Événement imposable
  - Calcul du gain/perte
  - Coût de base
  - Prix de vente

- **TRANSFER**: Généralement NON imposable
  - Simple mouvement de fonds
  - Pas de gain/perte
  - Juste un déplacement

**Si on classe un TRADE comme TRANSFER:**
- ❌ Pas de calcul de taxes
- ❌ Rapport fiscal incomplet
- ❌ Problèmes avec l'administration fiscale

---

## ✅ Action items

1. [ ] Auditer `parseTransaction()` dans `solana-transactions.ts`
2. [ ] Utiliser `enrichedTx.type` de Helius comme source de vérité
3. [ ] Ajouter une liste des program IDs de DEX connus
4. [ ] Logger les transactions ambiguës pour vérification manuelle
5. [ ] Ajouter des tests avec des vraies transactions de bots
6. [ ] Vérifier spécifiquement Axiom, Padre, Pump.fun

---

## 🔍 Debug checklist

Pour chaque transaction suspecte:
```javascript
console.log({
  signature: tx.signature,
  heliusType: tx.type,           // Ce que Helius dit
  ourType: parsedTx.type,         // Ce qu'on a déterminé
  tokenTransfers: tx.tokenTransfers.length,
  hasSwapInstruction: /* vérifier */,
  source: tx.source
});
```

Si `heliusType !== ourType` → Bug à corriger!
