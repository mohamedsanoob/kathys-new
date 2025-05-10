import { useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/config';

interface ViewData {
  timestamp: any;
  date: string; // YYYY-MM-DD format
  path: string;
  userAgent: string;
  referrer: string;
  screenWidth: number;
  userId?: string;
  isAuthenticated: boolean;
  sessionId?: string;
}

export default function useTrackView(): void {
  const { currentUser } = useAuth();

  useEffect(() => {
    const trackView = async (): Promise<void> => {
      // 1. Create session ID for this visit
      const sessionId = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      
      // 2. Check if we've already tracked this session
      const today = new Date().toISOString().split('T')[0];
      const sessionKey = `viewTracked_${today}_${sessionId}`;
      
      if (sessionStorage.getItem(sessionKey)) {
        return; // Already tracked this session today
      }

      // 3. Check Firestore for existing views from this session today
      try {
        const viewsRef = collection(db, 'storeViews');
        const q = query(
          viewsRef,
          where('date', '==', today),
          where('sessionId', '==', sessionId)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          return; // Already tracked this session
        }

        // 4. Prepare view data
        const viewData: ViewData = {
          timestamp: serverTimestamp(),
          date: today,
          path: window.location.pathname,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          screenWidth: window.screen.width,
          isAuthenticated: !!currentUser,
          sessionId
        };

        if (currentUser) {
          viewData.userId = currentUser.uid;
        }

        // 5. Store in Firestore and mark as tracked
        await addDoc(viewsRef, viewData);
        sessionStorage.setItem(sessionKey, 'true');
        
        // 6. Cleanup old sessionStorage entries (optional)
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('viewTracked_') && !key.includes(today)) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    // Only track on client side
    if (typeof window !== 'undefined') {
      trackView().catch(console.error);
    }
  }, [currentUser]);
}