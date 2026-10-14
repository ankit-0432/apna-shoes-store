import { doc, setDoc, getDoc, getDocs, collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase.js';
import { Order, ReturnRequest } from '../types/store.js';

/**
 * Sync placed or updated order to Firestore collection 'orders'
 */
export async function syncOrderToFirestore(order: Order): Promise<void> {
  if (!order || !order.id) return;
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      syncedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`[Firebase] Order ${order.orderNumber} (${order.id}) live synced to Firestore`);
  } catch (err) {
    console.warn('[Firebase] Failed to sync order to Firestore:', err);
  }
}

/**
 * Sync return request to Firestore collection 'returns'
 */
export async function syncReturnToFirestore(returnReq: ReturnRequest): Promise<void> {
  if (!returnReq || !returnReq.id) return;
  try {
    const returnRef = doc(db, 'returns', returnReq.id);
    await setDoc(returnRef, {
      ...returnReq,
      syncedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`[Firebase] Return ${returnReq.id} synced to Firestore`);
  } catch (err) {
    console.warn('[Firebase] Failed to sync return to Firestore:', err);
  }
}

/**
 * Listen for live real-time updates for an order in Firestore.
 * Supports listening by Order ID, Order Number (e.g. APNA-2026-7842), or AWB Code.
 * Calls onUpdate immediately whenever admin or courier updates order status or timeline.
 */
export function subscribeToLiveOrder(
  queryParam: string,
  onUpdate: (order: Order) => void,
  onError?: (err: any) => void
): () => void {
  const clean = queryParam.trim();
  if (!clean) return () => {};

  const unsubscribers: Unsubscribe[] = [];

  try {
    // 1. Direct document listener by order ID
    const directDocRef = doc(db, 'orders', clean);
    const unsubDoc = onSnapshot(
      directDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Order;
          onUpdate(data);
        }
      },
      (err) => {
        if (onError) onError(err);
      }
    );
    unsubscribers.push(unsubDoc);

    // 2. Query by orderNumber field
    const qOrderNum = query(collection(db, 'orders'), where('orderNumber', '==', clean));
    const unsubOrderNum = onSnapshot(
      qOrderNum,
      (snap) => {
        if (!snap.empty) {
          const data = snap.docs[0].data() as Order;
          onUpdate(data);
        }
      },
      (err) => {
        if (onError) onError(err);
      }
    );
    unsubscribers.push(unsubOrderNum);

    // 3. Query by shipment AWB code
    const qAwb = query(collection(db, 'orders'), where('shipment.awbCode', '==', clean));
    const unsubAwb = onSnapshot(
      qAwb,
      (snap) => {
        if (!snap.empty) {
          const data = snap.docs[0].data() as Order;
          onUpdate(data);
        }
      },
      (err) => {
        if (onError) onError(err);
      }
    );
    unsubscribers.push(unsubAwb);
  } catch (err) {
    console.warn('[Firebase] Error setting up live order snapshot:', err);
  }

  // Return composite unsubscribe
  return () => {
    unsubscribers.forEach((u) => {
      try {
        u();
      } catch (e) {}
    });
  };
}

/**
 * Fetch customer orders from Firestore by phone
 */
export async function getCustomerFirestoreOrders(phone: string): Promise<Order[]> {
  try {
    const cleanDigits = phone.replace(/\D/g, '');
    const q = query(collection(db, 'orders'));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as Order;
      if (data.customerPhone && data.customerPhone.replace(/\D/g, '').includes(cleanDigits)) {
        orders.push(data);
      }
    });
    return orders;
  } catch (err) {
    console.warn('[Firebase] Failed to fetch customer orders from Firestore:', err);
    return [];
  }
}
