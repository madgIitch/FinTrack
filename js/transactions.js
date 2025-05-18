import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { openDB } from 'idb';



// Referencia al span del header
const userNameSpan = document.getElementById('user-name');

function updateWelcomeMessage(firstName, lastName) {
  const full = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Usuario';
  userNameSpan.textContent = full;
}

// Cargar saludo inicial desde localStorage
const storedFirst = localStorage.getItem('firstName');
const storedLast  = localStorage.getItem('lastName');
if (storedFirst || storedLast) {
  updateWelcomeMessage(storedFirst, storedLast);
}



// Configuración de la API Cloud Function
const apiUrl =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// Constantes de IndexedDB
const DB_NAME    = 'fintrack-cache';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

// Inicializa o actualiza IndexedDB
async function initDB() {
  console.debug('[DEBUG] Inicializando IndexedDB...');
  const idb = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.debug('[DEBUG] Creando object store:', STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
  console.debug('[DEBUG] IndexedDB lista:', idb);
  return idb;
}

// Guarda transacciones en caché
async function cacheTransactions(idb, txs) {
  console.debug('[DEBUG] Caché → guardando transacciones:', txs.length);
  const tx = idb.transaction(STORE_NAME, 'readwrite');
  for (const t of txs) {
    console.debug('  → put id=', t.id);
    await tx.store.put(t);
  }
  await tx.done;
  console.debug('[DEBUG] Caché → terminado');
}

// Lee todas las transacciones de la caché
async function readCachedTransactions(idb) {
  const all = await idb.getAll(STORE_NAME);
  console.debug('[DEBUG] Caché → transacciones leídas:', all.length);
  return all;
}

// Agrupa transacciones por categoría
function groupByCategory(txs) {
  return txs.reduce((groups, tx) => {
    const cat = tx.category || 'Sin categoría';
    (groups[cat] = groups[cat] || []).push(tx);
    return groups;
  }, {});
}

// Mostrar / ocultar indicadores
function showOffline(msg) {
  const ind = document.getElementById('offline-indicator');
  ind.textContent = msg || 'Estás sin conexión. Mostrando datos en caché.';
  ind.hidden = false;
}
function hideOffline() { document.getElementById('offline-indicator').hidden = true; }
function showLoading() { document.getElementById('transactions-loading').hidden = false; }
function hideLoading() { document.getElementById('transactions-loading').hidden = true; }

// Fetch transacciones de Plaid
async function fetchTransactionsFromPlaid(userId) {
  console.debug('[DEBUG] Fetch → get_transactions, userId:', userId);
  const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  console.debug('[DEBUG] Fetch status:', res.status);
  if (!res.ok) throw new Error('Error obteniendo transacciones');
  const { transactions } = await res.json();
  console.debug('[DEBUG] Transacciones recibidas de Plaid:', transactions.length);
  return transactions;
}

// Fetch detalles de cuenta
async function fetchAccountDetails(accessToken) {
  console.debug('[DEBUG] Fetch detalles cuenta →', accessToken);
  const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken })
  });
  console.debug('[DEBUG] Status get_account_details:', res.status);
  if (!res.ok) throw new Error('Error obteniendo detalles de cuenta');
  const data = await res.json();
  console.debug('[DEBUG] Respuesta get_account_details:', data);
  return data;
}

// Construye mapa account_id → nombre
async function buildAccountMap(userId) {
  console.debug('[DEBUG] Construyendo mapa de cuentas para userId:', userId);
  const userDoc = await getDoc(doc(db, 'users', userId));
  const raw     = userDoc.exists() ? (userDoc.data().plaid?.accounts || []) : [];
  console.debug('[DEBUG] Cuentas Plaid vinculadas:', raw.length);

  const map = {};
  for (const { accessToken } of raw) {
    try {
      const { accounts: accs } = await fetchAccountDetails(accessToken);
      accs.forEach(acc => {
        map[acc.account_id] = acc.name || 'Cuenta sin nombre';
      });
    } catch (err) {
      console.error('[ERROR] buildAccountMap →', err);
    }
  }
  console.debug('[DEBUG] Mapa de cuentas final:', map);
  return map;
}

// Render de transacciones
function renderTransactions(groups) {
  console.debug('[DEBUG] Renderizando datos online');
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  for (const [cat, txs] of Object.entries(groups)) {
    const section = document.createElement('div');
    section.className = 'category-group';
    section.innerHTML = `<h3>${cat}</h3>`;
    txs.forEach(tx => {
      const item = document.createElement('div');
      item.className = 'transaction-item';
      item.innerHTML = `
        <span class="account-label">${tx.accountName}</span>
        <span class="date">${new Date(tx.date).toLocaleDateString()}</span>
        <div class="desc">${tx.description}</div>
        <span class="amount ${tx.amount < 0 ? 'debit' : 'credit'}">
          ${tx.amount < 0 ? '−' : '+'}${Math.abs(tx.amount).toFixed(2)} €
        </span>`;
      section.appendChild(item);
    });
    list.appendChild(section);
  }
}

// Flujo principal
async function loadTransactions(userId) {
  console.debug('[DEBUG] loadTransactions → usuario:', userId);
  const idb        = await initDB();
  const accountMap = await buildAccountMap(userId);

  // 1) Mostrar cache
  const cached = await readCachedTransactions(idb);
  if (cached.length) {
    cached.forEach(tx => {
      tx.accountName = accountMap[tx.account_id] || 'Cuenta desconocida';
    });
    renderTransactions(groupByCategory(cached));
  }

  // 2) Offline?
  if (!navigator.onLine) {
    showOffline();
    return;
  }

  // 3) Online: fetch → render → cache
  hideOffline();
  showLoading();
  try {
    const txs = await fetchTransactionsFromPlaid(userId);
    txs.forEach(tx => {
      tx.accountName = accountMap[tx.account_id] || 'Cuenta desconocida';
    });
    renderTransactions(groupByCategory(txs));
    await cacheTransactions(idb, txs);
  } catch (err) {
    console.error('[ERROR] loadTransactions →', err);
    showOffline('No se pudieron actualizar datos, mostrando caché.');
  } finally {
    hideLoading();
  }
}

// Arranque con auth (¡ahora async para saludar!)
onAuthStateChanged(auth, async (user) => {
  console.debug('[DEBUG] onAuthStateChanged →', user);
  if (user) {
    // —————— Aquí actualizamos el saludo en la cabecera ——————
    try {
      const uref = doc(db, 'users', user.uid);
      const snap = await getDoc(uref);
      if (snap.exists()) {
        const { firstName = '', lastName = '' } = snap.data();
        updateWelcomeMessage(firstName, lastName);
        localStorage.setItem('firstName', firstName);
        localStorage.setItem('lastName', lastName);
      }
    } catch (err) {
      console.error('[ERROR] cargando perfil para saludo:', err);
    }
    // —————— Luego lanzamos la carga habitual de transacciones ——————
    loadTransactions(user.uid);
  } else {
    window.location.href = '../index.html';
  }
});

// Si volvemos online, recargamos
window.addEventListener('online', () => {
  if (auth.currentUser) {
    console.debug('[DEBUG] Reconectado → recargando transacciones');
    loadTransactions(auth.currentUser.uid);
  }
});
