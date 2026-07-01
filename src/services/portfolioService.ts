import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Asset, Operation, AssetType, OperationType } from '../types';

function toAsset(id: string, data: Record<string, unknown>): Asset {
  return {
    id,
    ticker: data.ticker as string,
    name: data.name as string,
    type: data.type as AssetType,
    quantity: data.quantity as number,
    averagePrice: data.averagePrice as number,
    totalInvested: data.totalInvested as number,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  };
}

function toOperation(id: string, data: Record<string, unknown>): Operation {
  return {
    id,
    ticker: data.ticker as string,
    assetType: data.assetType as AssetType,
    type: data.type as OperationType,
    quantity: data.quantity as number,
    price: data.price as number,
    date: (data.date as Timestamp).toDate(),
    totalValue: data.totalValue as number,
    notes: data.notes as string | undefined,
  };
}

export async function getAssets(userId: string): Promise<Asset[]> {
  const ref = collection(db, 'users', userId, 'assets');
  const q = query(ref, orderBy('ticker'));
  const snap = await getDocs(q);
  return snap.docs.map(d => toAsset(d.id, d.data() as Record<string, unknown>));
}

export async function getOperations(userId: string): Promise<Operation[]> {
  const ref = collection(db, 'users', userId, 'operations');
  const q = query(ref, orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => toOperation(d.id, d.data() as Record<string, unknown>));
}

export async function addOperation(
  userId: string,
  op: Omit<Operation, 'id'>
): Promise<string> {
  const opRef = collection(db, 'users', userId, 'operations');
  const docData: Record<string, unknown> = {
    ticker: op.ticker,
    assetType: op.assetType,
    type: op.type,
    quantity: op.quantity,
    price: op.price,
    date: Timestamp.fromDate(op.date),
    totalValue: op.totalValue,
  };
  if (op.notes !== undefined) docData.notes = op.notes;

  const docRef = await addDoc(opRef, docData);

  await recalculateAsset(userId, op.ticker, op.assetType);
  return docRef.id;
}

export async function deleteOperation(userId: string, operationId: string, ticker: string, assetType: AssetType): Promise<void> {
  const ref = doc(db, 'users', userId, 'operations', operationId);
  await deleteDoc(ref);
  await recalculateAsset(userId, ticker, assetType);
}

async function recalculateAsset(userId: string, ticker: string, assetType: AssetType): Promise<void> {
  const opsRef = collection(db, 'users', userId, 'operations');
  const snap = await getDocs(opsRef);
  const ops = snap.docs
    .map(d => toOperation(d.id, d.data() as Record<string, unknown>))
    .filter(o => o.ticker === ticker)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let quantity = 0;
  let totalCost = 0;

  for (const op of ops) {
    if (op.type === 'compra') {
      totalCost += op.quantity * op.price;
      quantity += op.quantity;
    } else {
      const sellRatio = op.quantity / quantity;
      totalCost -= totalCost * sellRatio;
      quantity -= op.quantity;
    }
  }

  quantity = Math.max(0, quantity);
  totalCost = Math.max(0, totalCost);
  const averagePrice = quantity > 0 ? totalCost / quantity : 0;

  const assetsRef = collection(db, 'users', userId, 'assets');
  const assetsSnap = await getDocs(assetsRef);
  const existingDoc = assetsSnap.docs.find(d => (d.data() as Record<string, unknown>).ticker === ticker);

  if (quantity === 0) {
    if (existingDoc) await deleteDoc(existingDoc.ref);
    return;
  }

  const assetData = {
    ticker,
    name: ticker,
    type: assetType,
    quantity,
    averagePrice,
    totalInvested: totalCost,
    updatedAt: Timestamp.now(),
  };

  if (existingDoc) {
    await updateDoc(existingDoc.ref, assetData);
  } else {
    await addDoc(assetsRef, { ...assetData, createdAt: Timestamp.now() });
  }
}

export async function deleteAsset(userId: string, assetId: string): Promise<void> {
  const ref = doc(db, 'users', userId, 'assets', assetId);
  await deleteDoc(ref);
}
