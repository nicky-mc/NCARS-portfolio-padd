import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

export interface CaptainLog {
  id?: string;
  title: string;
  content: string; // Lexical JSON string
  authorId: string;
  stardate: string;
  createdAt: any;
  updatedAt?: any;
}

/**
 * Saves a new Captain's Log to Firestore.
 */
export async function saveCaptainLog(editorStateJSON: string, title: string, authorId: string) {
  try {
    const stardate = (80000 + (Date.now() / 10000000) % 10000).toFixed(3);
    
    const docRef = await addDoc(collection(db, 'captains_logs'), {
      title,
      content: editorStateJSON,
      authorId,
      stardate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving captain's log:", error);
    throw error;
  }
}

/**
 * Updates an existing Captain's Log in Firestore.
 */
export async function updateCaptainLog(id: string, editorStateJSON: string, title: string) {
  try {
    const docRef = doc(db, 'captains_logs', id);
    await updateDoc(docRef, {
      title,
      content: editorStateJSON,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating captain's log:", error);
    throw error;
  }
}

/**
 * Fetches all Captain's Logs from Firestore.
 */
export async function getCaptainLogs() {
  try {
    const q = query(collection(db, 'captains_logs'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CaptainLog[];
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
}

/**
 * Fetches a single Captain's Log by ID.
 */
export async function getCaptainLog(id: string) {
  try {
    const docRef = doc(db, 'captains_logs', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CaptainLog;
    }
    return null;
  } catch (error) {
    console.error("Error fetching log:", error);
    throw error;
  }
}
