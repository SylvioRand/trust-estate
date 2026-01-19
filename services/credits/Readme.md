 Règles métier importantes
Règle	Description
Solde minimum	balance ne peut jamais être négatif
Inscription	+5 crédits automatiques (non renouvelables)
Vérification avant action	Toujours vérifier balance >= coût avant de débiter
Transaction atomique	Débit + action doivent être dans la même transaction
Historique immutable	Ne jamais modifier une CreditTransaction


1. Utilisateur s'inscrit
   → CreditBalance créé avec balance = 5
   → CreditTransaction { type: bonus, reason: initial_bonus, amount: +5 }

2. Utilisateur publie une annonce
   → Vérifier balance >= 1
   → CreditBalance. balance -= 1
   → CreditTransaction { type: consume, reason: publish_listing, amount: -1 }

3. Utilisateur recharge (Pack Standard)
   → CreditBalance.balance += 12 (10 + 2 bonus)
   → CreditTransaction { type: recharge, reason: recharge_pack, amount: +10 }
   → CreditTransaction { type:  bonus, reason: recharge_bonus, amount: +2 }

4. Utilisateur réserve une visite
   → Vérifier balance >= 1
   → CreditBalance.balance -= 1
   → CreditTransaction { type: consume, reason: reserve_visit, amount: -1 }


Endpoints internes (service-to-service)
Tu auras besoin d'endpoints internes (pas exposés au public) :

POST /internal/credits/debit
HTTP
POST /internal/credits/debit
Content-Type: application/json
X-Service-Key: {internal-secret}
JSON
{
  "userId": "user-123",
  "amount": 1,
  "reason": "publish_listing",
  "listingId": "listing-456"
}
Response 200 :

JSON
{
  "success": true,
  "newBalance": 15,
  "transactionId": "tx-789"
}
Response 402 (Crédits insuffisants) :

JSON
{
  "error": "insufficient_credits",
  "message":  "payment.insufficient_credits_publish",
  "required": 1,
  "balance": 0
}
POST /internal/credits/credit
Pour les bonus ou remboursements :

HTTP
POST /internal/credits/credit
Content-Type: application/json
X-Service-Key: {internal-secret}
JSON
{
  "userId": "user-123",
  "amount": 5,
  "reason": "initial_bonus"
}
Response 200 :

JSON
{
  "success": true,
  "newBalance": 5,
  "transactionId":  "tx-001"
}
Résumé des POST
Endpoint	Public/Interne	Utilisé par
POST /credits/recharge	🌐 Public	Frontend (utilisateur)
POST /internal/credits/debit	🔒 Interne	listings-service, reservations-service
POST /internal/credits/credit	🔒 Interne	auth-service (bonus inscription)



// credits-service/src/services/credits. service.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Les packs disponibles
const PACKS = [
  { id: 'starter',  baseCredits: 5,  bonus: 0,  price: 5000  },
  { id: 'standard', baseCredits: 10, bonus: 2,  price: 10000 },
  { id: 'premium',  baseCredits: 25, bonus: 5,  price: 20000 },
  { id:  'pro',      baseCredits: 80, bonus: 20, price: 50000 },
];

interface RechargeResult {
  success: boolean;
  transactionId:  string;
  previousBalance: number;
  newBalance: number;
  pack: typeof PACKS[0];
}

async function rechargeCredits(
  userId: string,
  packId: string
): Promise<RechargeResult> {
  
  // 1. Trouver le pack
  const pack = PACKS.find(p => p.id === packId);
  if (!pack) {
    throw new Error('INVALID_PACK');
  }

  const totalCredits = pack.baseCredits + pack.bonus;

  // 2. Transaction atomique (tout ou rien)
  const result = await prisma.$transaction(async (tx) => {
    
    // 2a. Récupérer le solde actuel (ou créer si n'existe pas)
    let creditBalance = await tx.creditBalance.findUnique({
      where: { userId },
    });

    const previousBalance = creditBalance?.balance ??  0;

    if (! creditBalance) {
      // Créer le CreditBalance s'il n'existe pas
      creditBalance = await tx.creditBalance.create({
        data: {
          userId,
          balance:  0,
          totalEarned: 0,
          totalSpent: 0,
        },
      });
    }

    // 2b. Mettre à jour le solde
    const updatedBalance = await tx.creditBalance.update({
      where: { userId },
      data: {
        balance: { increment: totalCredits },
        totalEarned: { increment:  totalCredits },
        lastRechargeAt: new Date(),
      },
    });

    // 2c. Créer la transaction pour les crédits achetés
    const transaction = await tx.creditTransaction.create({
      data: {
        userId,
        amount: pack.baseCredits,
        type: 'recharge',
        reason: 'recharge_pack',
        balanceAfter: previousBalance + pack.baseCredits,
      },
    });

    // 2d. Créer la transaction pour le bonus (si > 0)
    if (pack.bonus > 0) {
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: pack.bonus,
          type: 'bonus',
          reason: 'recharge_bonus',
          balanceAfter: updatedBalance. balance,
        },
      });
    }

    return {
      transactionId: transaction.id,
      previousBalance,
      newBalance: updatedBalance.balance,
    };
  });

  return {
    success: true,
    transactionId: result.transactionId,
    previousBalance: result.previousBalance,
    newBalance: result.newBalance,
    pack,
  };
}