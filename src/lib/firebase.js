import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  collectionGroup,
  query,
  where
} from "firebase/firestore";
import * as mockDb from "./mockData";

// Configurações do Firebase vindas de variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Verifica se todas as variáveis obrigatórias foram fornecidas para habilitar o Firebase
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.authDomain;

let app;
let auth;
let firestore;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
    console.log("🔥 Firebase inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Falha ao inicializar o Firebase. Usando Mock Data.", error);
  }
} else {
  console.log("ℹ️ Variáveis do Firebase ausentes. Rodando em MODO DEMO com localStorage.");
}

const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("localStorage is not accessible:", e);
    }
    return null;
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn("localStorage is not accessible:", e);
    }
    return false;
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return true;
      }
    } catch (e) {
      console.warn("localStorage is not accessible:", e);
    }
    return false;
  }
};

// ==========================================
// UNIFIED DB SERVICE (Firebase ou Mock)
// ==========================================

export const dbService = {
  isFirebase: !!(firestore && auth),

  // Autenticação
  login: async (email, password) => {
    if (dbService.isFirebase) {
      try {
        const emailLower = email.trim().toLowerCase();
        
        // 1. Verificar se é admin padrão ou cadastrado no Firestore
        const defaultAdmins = {
          "comercial1.emphasis@gmail.com": "12Rod34#",
          "mesocialmedia16@gmail.com": "Casa920125#"
        };
        
        let isAdmin = false;
        if (defaultAdmins[emailLower] && defaultAdmins[emailLower] === password) {
          isAdmin = true;
        } else {
          // Checar na coleção administradores do Firestore
          const qAdmin = query(collection(firestore, "administradores"), where("email", "==", emailLower));
          const adminSnapshot = await getDocs(qAdmin);
          if (!adminSnapshot.empty) {
            const adminData = adminSnapshot.docs[0].data();
            if (adminData.senha === password) {
              isAdmin = true;
            }
          }
        }
        
        if (isAdmin) {
          try {
            // Tenta efetuar o login de Auth
            const userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
            const adminDocRef = doc(firestore, "administradores", userCredential.user.uid);
            await setDoc(adminDocRef, { email: emailLower, role: "admin", senha: password }, { merge: true });
            return { uid: userCredential.user.uid, email: emailLower, role: "admin" };
          } catch (authErr) {
            if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/invalid-email') {
              // Registra/cria no Firebase Auth automaticamente (self-healing)
              const userCredential = await createUserWithEmailAndPassword(auth, emailLower, password);
              const adminDocRef = doc(firestore, "administradores", userCredential.user.uid);
              await setDoc(adminDocRef, { email: emailLower, role: "admin", senha: password }, { merge: true });
              return { uid: userCredential.user.uid, email: emailLower, role: "admin" };
            }
            throw authErr;
          }
        }
        
        // Caso contrário, é cliente
        const userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
        // Buscar no Firestore o documento correspondente por email para obter o clientId correto
        const qClient = query(collection(firestore, "clientes"), where("email", "==", emailLower));
        const clientSnapshot = await getDocs(qClient);
        
        if (!clientSnapshot.empty) {
          const clientDoc = clientSnapshot.docs[0];
          const clientData = clientDoc.data();
          if (clientData.status === "inativo") {
            await signOut(auth);
            throw new Error("Sua conta está desativada. Fale com o administrador.");
          }
          return { uid: userCredential.user.uid, email: emailLower, role: "client", clientId: clientDoc.id };
        } else {
          // Se logou com sucesso no Auth mas não é cliente, pode ser admin registrado no Auth pelo admin panel
          const adminDocRef = doc(firestore, "administradores", userCredential.user.uid);
          const adminSnap = await getDoc(adminDocRef);
          if (adminSnap.exists()) {
            return { uid: userCredential.user.uid, email: emailLower, role: "admin" };
          }
          // Se não for nenhum dos dois, desloga por segurança
          await signOut(auth);
        }
        
        throw new Error("Permissão insuficiente ou cadastro inexistente.");
      } catch (authError) {
        const emailLower = email.trim().toLowerCase();
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
          // Buscar no Firestore se o cliente tem senha local cadastrada e criar no Auth
          const q = query(collection(firestore, "clientes"), where("email", "==", emailLower));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const clientData = docSnap.data();
            
            if (clientData.senha === password) {
              try {
                const userCredential = await createUserWithEmailAndPassword(auth, emailLower, password);
                return {
                  uid: userCredential.user.uid,
                  email: emailLower,
                  role: "client",
                  clientId: docSnap.id
                };
              } catch (regError) {
                console.error("Erro na auto-sincronização do Auth:", regError);
              }
            }
          }
        }
        throw authError;
      }
    } else {
      // Simulação simples de login
      const admins = mockDb.getMockAdmins();
      const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (admin && admin.senha === password) {
        const user = { uid: `admin-${admin.email}`, email: admin.email, role: "admin", nome: admin.nome };
        safeLocalStorage.setItem("portal_session", JSON.stringify(user));
        return user;
      }
      
      const clients = mockDb.getMockClients();
      const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (client && (client.senha === password || (client.primeiroAcesso && password === "123456"))) {
        const user = { uid: client.id, email, role: "client", clientId: client.id };
        safeLocalStorage.setItem("portal_session", JSON.stringify(user));
        return user;
      }

      throw new Error("E-mail ou senha incorretos.");
    }
  },

  logout: async () => {
    if (dbService.isFirebase) {
      await signOut(auth);
    } else {
      safeLocalStorage.removeItem("portal_session");
    }
  },

  getCurrentUser: (callback) => {
    if (dbService.isFirebase) {
      return onAuthStateChanged(auth, async (user) => {
        if (user) {
          const defaultAdmins = ["comercial1.emphasis@gmail.com", "mesocialmedia16@gmail.com"];
          let role = "client";
          const userEmail = user.email?.toLowerCase() || "";
          let clientId = null;
          
          if (userEmail && defaultAdmins.includes(userEmail)) {
            role = "admin";
          } else if (userEmail) {
            try {
              const q = query(collection(firestore, "administradores"), where("email", "==", userEmail));
              const snap = await getDocs(q);
              if (!snap.empty) {
                role = "admin";
              } else {
                // É cliente. Vamos buscar o id real do documento do Firestore
                const qClient = query(collection(firestore, "clientes"), where("email", "==", userEmail));
                const snapClient = await getDocs(qClient);
                if (!snapClient.empty) {
                  clientId = snapClient.docs[0].id;
                }
              }
            } catch (err) {
              console.error("Erro ao checar no Firestore:", err);
            }
          }
          
          callback({
            uid: user.uid,
            email: user.email,
            role: role,
            clientId: clientId
          });
        } else {
          callback(null);
        }
      });
    } else {
      if (typeof window !== "undefined") {
        try {
          const session = safeLocalStorage.getItem("portal_session");
          callback(session ? JSON.parse(session) : null);
        } catch (e) {
          console.error("Erro ao ler portal_session do localStorage:", e);
          callback(null);
        }
      } else {
        callback(null);
      }
      // Retorna uma função dummy para unsubscribe
      return () => {};
    }
  },

  checkEmailStatus: async (email) => {
    const emailLower = email.trim().toLowerCase();
    const defaultAdmins = ["comercial1.emphasis@gmail.com", "mesocialmedia16@gmail.com"];
    
    if (defaultAdmins.includes(emailLower)) {
      return { exists: true, role: "admin", primeiroAcesso: false };
    }

    if (dbService.isFirebase) {
      try {
        // 1. Checar na coleção de administradores
        const qAdmin = query(collection(firestore, "administradores"), where("email", "==", emailLower));
        const adminSnapshot = await getDocs(qAdmin);
        if (!adminSnapshot.empty) {
          return { exists: true, role: "admin", primeiroAcesso: false };
        }
        
        // 2. Checar na coleção de clientes
        const q = query(collection(firestore, "clientes"), where("email", "==", emailLower));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          return { exists: true, role: "client", primeiroAcesso: data.primeiroAcesso !== false };
        }
        return { exists: false };
      } catch (error) {
        console.error("Erro ao verificar e-mail no Firestore:", error);
        return mockDb.checkMockEmailStatus(emailLower);
      }
    } else {
      return mockDb.checkMockEmailStatus(emailLower);
    }
  },

  registerFirstAccess: async (email, password) => {
    if (dbService.isFirebase) {
      try {
        // 1. Criar usuário no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 2. Localizar o documento do Firestore correspondente e atualizar
        const q = query(collection(firestore, "clientes"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, {
            id: uid, // Vincula o id do documento ao UID do Firebase Auth
            senha: password, // Salva em texto claro para visualização do admin
            primeiroAcesso: false
          });
        }
        
        return { uid, email, role: "client", clientId: querySnapshot.empty ? uid : querySnapshot.docs[0].id };
      } catch (error) {
        console.error("Erro no primeiro acesso do Firebase:", error);
        throw error;
      }
    } else {
      return mockDb.registerMockFirstAccess(email, password);
    }
  },

  // CRUD de Clientes
  getClients: async () => {
    if (dbService.isFirebase) {
      try {
        const querySnapshot = await getDocs(collection(firestore, "clientes"));
        const clients = [];
        for (const docSnap of querySnapshot.docs) {
          const clientData = docSnap.data();
          
          // Buscar subcoleções no Firestore
          const passosSnap = await getDocs(collection(firestore, `clientes/${docSnap.id}/passos`));
          const financeiroSnap = await getDocs(collection(firestore, `clientes/${docSnap.id}/financeiro`));
          const relatoriosSnap = await getDocs(collection(firestore, `clientes/${docSnap.id}/relatorios`));

          clients.push({
            ...clientData,
            id: docSnap.id,
            passos: passosSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.ordem - b.ordem),
            financeiro: financeiroSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            relatorios: relatoriosSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          });
        }
        return clients;
      } catch (error) {
        console.error("Erro ao ler clientes do Firestore:", error);
        return mockDb.getMockClients();
      }
    } else {
      return mockDb.getMockClients();
    }
  },

  createClient: async (clientData) => {
    if (dbService.isFirebase) {
      try {
        const { passos, financeiro, relatorios, ...profile } = clientData;
        const newClientDocRef = doc(collection(firestore, "clientes"));
        const clientId = newClientDocRef.id;
        const hasPassword = profile.senha && profile.senha.trim() !== "";

        // Salvar perfil do cliente
        await setDoc(newClientDocRef, {
          ...profile,
          id: clientId,
          senha: hasPassword ? profile.senha : "",
          primeiroAcesso: !hasPassword,
          dataCriacao: new Date().toISOString()
        });

        // Salvar subcoleção de passos iniciais padrão
        const initialSteps = passos || [
          { id: "p1", macro: "Setup Inicial", titulo: "Reunião de Kickoff", descricao: "Alinhamento com a equipe.", status: "Pendente", linkAcao: "", textoBotao: "", ordem: 1 },
          { id: "p2", macro: "Identidade Visual", titulo: "Envio de Fotos do Menu", descricao: "Fazer upload do portfólio visual.", status: "Pendente", linkAcao: "", textoBotao: "", ordem: 2 },
          { id: "p3", macro: "Configuração Técnica", titulo: "Acesso às Contas de Anúncio", descricao: "Liberar acesso no Meta Ads.", status: "Pendente", linkAcao: "", textoBotao: "", ordem: 3 }
        ];

        for (const step of initialSteps) {
          const stepDocRef = doc(collection(firestore, `clientes/${clientId}/passos`), step.id);
          await setDoc(stepDocRef, step);
        }

        return { ...clientData, id: clientId, passos: initialSteps, financeiro: [], relatorios: [] };
      } catch (error) {
        console.error("Erro ao criar cliente no Firestore:", error);
        return mockDb.createMockClient(clientData);
      }
    } else {
      return mockDb.createMockClient(clientData);
    }
  },

  updateClient: async (clientId, updatedFields) => {
    if (dbService.isFirebase) {
      try {
        const clientDocRef = doc(firestore, "clientes", clientId);
        // Exclui subcoleções dos campos a serem atualizados diretamente no documento principal
        const { passos, financeiro, relatorios, ...profileFields } = updatedFields;
        const hasPassword = profileFields.senha && profileFields.senha.trim() !== "";
        
        await updateDoc(clientDocRef, {
          ...profileFields,
          ...(hasPassword ? { primeiroAcesso: false } : {})
        });
        return { id: clientId, ...updatedFields };
      } catch (error) {
        console.error("Erro ao atualizar cliente no Firestore:", error);
        return mockDb.updateMockClient(clientId, updatedFields);
      }
    } else {
      return mockDb.updateMockClient(clientId, updatedFields);
    }
  },

  deleteClient: async (clientId) => {
    if (dbService.isFirebase) {
      try {
        await deleteDoc(doc(firestore, "clientes", clientId));
        return true;
      } catch (error) {
        console.error("Erro ao deletar cliente no Firestore:", error);
        return mockDb.deleteMockClient(clientId);
      }
    } else {
      return mockDb.deleteMockClient(clientId);
    }
  },

  // Toggle de Status dos Passos (Pendente/Concluido)
  toggleStepStatus: async (clientId, stepId, currentStatus) => {
    const nextStatus = currentStatus === "Concluido" ? "Pendente" : "Concluido";
    if (dbService.isFirebase) {
      try {
        const stepDocRef = doc(firestore, `clientes/${clientId}/passos`, stepId);
        await updateDoc(stepDocRef, { status: nextStatus });
      } catch (error) {
        console.error("Erro ao atualizar status do passo no Firestore:", error);
        mockDb.toggleMockStepStatus(clientId, stepId);
      }
    } else {
      mockDb.toggleMockStepStatus(clientId, stepId);
    }
  },

  // Salvar Lista Completa de Passos (Board)
  saveSteps: async (clientId, steps) => {
    if (dbService.isFirebase) {
      try {
        // 1. Buscar todos os passos atuais no Firestore
        const passosColRef = collection(firestore, `clientes/${clientId}/passos`);
        const querySnapshot = await getDocs(passosColRef);
        
        // 2. Excluir etapas que não estão no novo array
        const stepIds = steps.map(s => s.id);
        for (const docSnap of querySnapshot.docs) {
          if (!stepIds.includes(docSnap.id)) {
            await deleteDoc(doc(firestore, `clientes/${clientId}/passos`, docSnap.id));
          }
        }

        // 3. Criar ou atualizar os passos restantes
        for (const step of steps) {
          const stepDocRef = doc(firestore, `clientes/${clientId}/passos`, step.id);
          await setDoc(stepDocRef, step);
        }
      } catch (error) {
        console.error("Erro ao salvar passos no Firestore:", error);
        mockDb.saveMockSteps(clientId, steps);
      }
    } else {
      mockDb.saveMockSteps(clientId, steps);
    }
  },

  // Gestão Financeira
  addInvoice: async (clientId, invoice) => {
    if (dbService.isFirebase) {
      try {
        const invoiceId = `fat-${Math.random().toString(36).substr(2, 9)}`;
        const invoiceDocRef = doc(firestore, `clientes/${clientId}/financeiro`, invoiceId);
        const newInvoice = { ...invoice, id: invoiceId };
        await setDoc(invoiceDocRef, newInvoice);
        return newInvoice;
      } catch (error) {
        console.error("Erro ao adicionar fatura no Firestore:", error);
        return mockDb.addMockInvoice(clientId, invoice);
      }
    } else {
      return mockDb.addMockInvoice(clientId, invoice);
    }
  },

  deleteInvoice: async (clientId, invoiceId) => {
    if (dbService.isFirebase) {
      try {
        const invoiceDocRef = doc(firestore, `clientes/${clientId}/financeiro`, invoiceId);
        await deleteDoc(invoiceDocRef);
      } catch (error) {
        console.error("Erro ao excluir fatura do Firestore:", error);
        mockDb.deleteMockInvoice(clientId, invoiceId);
      }
    } else {
      mockDb.deleteMockInvoice(clientId, invoiceId);
    }
  },

  // Gestão de Relatórios
  addReport: async (clientId, report) => {
    if (dbService.isFirebase) {
      try {
        const reportId = `rel-${Math.random().toString(36).substr(2, 9)}`;
        const reportDocRef = doc(firestore, `clientes/${clientId}/relatorios`, reportId);
        const newReport = { 
          ...report, 
          id: reportId, 
          dataUpload: new Date().toISOString() 
        };
        await setDoc(reportDocRef, newReport);
        return newReport;
      } catch (error) {
        console.error("Erro ao adicionar relatório no Firestore:", error);
        return mockDb.addMockReport(clientId, report);
      }
    } else {
      return mockDb.addMockReport(clientId, report);
    }
  },

  deleteReport: async (clientId, reportId) => {
    if (dbService.isFirebase) {
      try {
        const reportDocRef = doc(firestore, `clientes/${clientId}/relatorios`, reportId);
        await deleteDoc(reportDocRef);
      } catch (error) {
        console.error("Erro ao deletar relatório no Firestore:", error);
        mockDb.deleteMockReport(clientId, reportId);
      }
    } else {
      mockDb.deleteMockReport(clientId, reportId);
    }
  },

  // Gestão de Administradores
  getAdmins: async () => {
    if (dbService.isFirebase) {
      try {
        const snap = await getDocs(collection(firestore, "administradores"));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.error("Erro ao buscar administradores do Firestore:", err);
        return mockDb.getMockAdmins();
      }
    } else {
      return mockDb.getMockAdmins();
    }
  },

  createAdmin: async (adminData) => {
    if (dbService.isFirebase) {
      try {
        const newAdminDocRef = doc(collection(firestore, "administradores"));
        const adminId = newAdminDocRef.id;
        const newAdmin = {
          ...adminData,
          id: adminId,
          email: adminData.email.toLowerCase().trim(),
          role: "admin",
          dataCriacao: new Date().toISOString()
        };
        await setDoc(newAdminDocRef, newAdmin);
        return newAdmin;
      } catch (error) {
        console.error("Erro ao criar admin no Firestore:", error);
        return mockDb.createMockAdmin(adminData);
      }
    } else {
      return mockDb.createMockAdmin(adminData);
    }
  },

  deleteAdmin: async (adminId) => {
    if (dbService.isFirebase) {
      try {
        const adminDocRef = doc(firestore, "administradores", adminId);
        const docSnap = await getDoc(adminDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const emailLower = data.email?.toLowerCase().trim();
          const defaultEmails = ["comercial1.emphasis@gmail.com", "mesocialmedia16@gmail.com"];
          if (defaultEmails.includes(emailLower)) {
            throw new Error("Não é possível excluir um administrador padrão.");
          }
        }
        await deleteDoc(adminDocRef);
        return true;
      } catch (error) {
        console.error("Erro ao deletar admin no Firestore:", error);
        // Tenta também deletar pelo ID/Email no mock local
        return mockDb.deleteMockAdmin(adminId);
      }
    } else {
      return mockDb.deleteMockAdmin(adminId);
    }
  }
};
