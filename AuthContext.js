import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Auth state changed, user logged in:", user.uid);
        const adminDoc = await getDoc(doc(db, "admin", user.uid));
        if (adminDoc.exists() && adminDoc.data().ROLE === "ADMIN") {
          console.log("User is admin");
          setUserRole("admin");
          setCurrentUser(user);
        } else {
          const customerDoc = await getDoc(doc(db, "customer_detail", user.uid));
          if (customerDoc.exists()) {
            console.log("User is customer");
            setUserRole("customer");
            setCurrentUser(user);
          } else {
            console.log("User is neither admin nor customer");
            setUserRole(null);
            setCurrentUser(null);
          }
        }
      } else {
        console.log("No user logged in");
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};