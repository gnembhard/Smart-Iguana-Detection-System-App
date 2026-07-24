// src/hooks/useIguanaEvents.js
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function useIguanaEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const eventsRef = collection(db, "logs"); // or "events" if you want separate collection
    const q = query(eventsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        at: new Date(doc.data().timestamp * 1000), // convert to JS Date
      }));
      setEvents(allEvents.slice(0, 50)); // keep last 50 events
    });

    return () => unsubscribe();
  }, []);

  return {
    lastEvent: events[0] || null,
    events,
  };
}
