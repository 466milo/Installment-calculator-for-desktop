import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { InstallmentPlan, NewInstallmentPlan } from '../entities';

const plans = collection(firestore, 'installment_plans');

export const planRepository = {
  async save(p: NewInstallmentPlan): Promise<string> {
    const ref = await addDoc(plans, {
      ...p,
      customerId: p.customerId ?? null,
      productId: p.productId ?? null,
      createdAt: Date.now(),
    });
    return ref.id;
  },

  async getAll(): Promise<InstallmentPlan[]> {
    const snap = await getDocs(query(plans, orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InstallmentPlan);
  },

  async getById(id: string): Promise<InstallmentPlan | null> {
    const snap = await getDoc(doc(plans, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as InstallmentPlan) : null;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(plans, id));
  },
};
