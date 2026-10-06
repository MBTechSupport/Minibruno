/**
 * ==========================================================================
 * Mini Bruno TechSupport - Módulo Central de Roles y Permisos (RBAC)
 * Control de acceso basado en listas de correos corporativos:
 * 1. correos_Autorizados.json -> Rol ADMIN (Staff IT / Administración)
 * 2. correos_empleados.json   -> Rol EMPLEADO (Colaborador con acceso limitado)
 * ==========================================================================
 */
// Importando la conexion a Firestore
import { db } from "./firebase-init.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const ROLES = {
  ADMIN: "ADMIN",
  EMPLEADO: "EMPLEADO",
  DENEGADO: "DENEGADO"
};

// Caché en memoria para evitar peticiones redundantes
let cachedAdmins = null;
let cachedEmployees = null;

/**
 * Limpia la memoria caché de los roles para forzar una nueva lectura en Firestore
 */
export function clearRoleCache() {
  cachedAdmins = null;
  cachedEmployees = null;
  sessionStorage.removeItem('mb_user_role');
}

// Fallback preventivo por si falla la red
const FALLBACK_ADMINS = [
  "lruiz@minibruno.com",
  "lguevara@minibruno.com",
  "mrodriguez@minibruno.com",
  "jnanez@minibruno.com",
  "dnavarro@minibruno.com",
  "darwin.navarro@minibruno.com",
  "bmontilla@minibruno.com",
  "alves.neri@minibruno.com",
  "jruiz@minibruno.com",
  "rcoronado@minibruno.com",
  "ruca.luijo@gmail.com"
];

const FALLBACK_EMPLOYEES = [
  "empleado.sistemas@minibruno.com",
  "empleado.planta@minibruno.com",
  "usuario.prueba@minibruno.com",
  "empleado.test@gmail.com"
];

/**
 * Obtiene la lista de correos administradores
 */
export async function getAdminEmails() {
  if (cachedAdmins) return cachedAdmins;
  try {
    // Consulta directa a firestore: Coleccion 'config', documento 'correos_autorizados'
    const docRef = doc(db, "config", "correos_autorizados");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      cachedAdmins = (data.autorizados || []).map(e => e.toLowerCase().trim());
      return cachedAdmins;
    }

    // Si el Documento no existe en firestore. Tirara para aca de forma que no tenga que consultar a firestore en caso de emergencia.
    const res = await fetch("/js/correos_Autorizados.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    cachedAdmins = (data.autorizados || []).map(e => e.toLowerCase().trim());
  } catch (err) {
    console.warn("Usando lista fallback de administradores:", err);
    cachedAdmins = FALLBACK_ADMINS.map(e => e.toLowerCase().trim());
  }
  return cachedAdmins;
}

/**
 * Obtiene la lista de correos empleados
 */
export async function getEmployeeEmails() {
  if (cachedEmployees) return cachedEmployees;
  try {
    // Consulta directa a Firestore: colección 'config', documento 'correos_empleados'
    const docRef = doc(db, "config", "correos_empleados");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      cachedEmployees = (data.empleados || []).map(e => e.toLowerCase().trim());
      return cachedEmployees;
    }

    // Si el documento no existe en Firestore, intenta leer el JSON local
    const res = await fetch("/js/correos_empleados.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    cachedEmployees = (data.empleados || []).map(e => e.toLowerCase().trim());
  } catch (err) {
    console.warn("Usando lista fallback de empleados:", err);
    cachedEmployees = FALLBACK_EMPLOYEES.map(e => e.toLowerCase().trim());
  }
  return cachedEmployees;
}

/**
 * Determina el rol de un correo electrónico
 * @param {string} email
 * @returns {Promise<"ADMIN"|"EMPLEADO"|"DENEGADO">}
 */
export async function getUserRole(email) {
  if (!email) return ROLES.DENEGADO;
  const normalized = email.toLowerCase().trim();

  const [admins, employees] = await Promise.all([
    getAdminEmails(),
    getEmployeeEmails()
  ]);

  if (admins.includes(normalized)) {
    return ROLES.ADMIN;
  }
  if (employees.includes(normalized)) {
    return ROLES.EMPLEADO;
  }
  return ROLES.DENEGADO;
}

/**
 * Verifica si un correo tiene acceso a la plataforma (ADMIN o EMPLEADO)
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function isEmailAuthorized(email) {
  const role = await getUserRole(email);
  return role !== ROLES.DENEGADO;
}

/**
 * Reglas de permisos por rol
 */
export function canAccessAdminTickets(role) {
  return role === ROLES.ADMIN;
}

export function canAccessServices(role) {
  return role === ROLES.ADMIN;
}

export function canCreateNews(role) {
  return role === ROLES.ADMIN;
}

export function canSubmitTickets(role) {
  return role === ROLES.ADMIN || role === ROLES.EMPLEADO;
}

export function canViewMyTickets(role) {
  return role === ROLES.ADMIN || role === ROLES.EMPLEADO;
}

/**
 * Etiqueta legible para UI
 */
export function getRoleBadgeInfo(role) {
  if (role === ROLES.ADMIN) {
    return {
      label: "Staff IT",
      title: "Administrador / Staff de Sistemas",
      cssClass: "bg-blue-600/90 text-white border-blue-400"
    };
  }
  if (role === ROLES.EMPLEADO) {
    return {
      label: "Colaborador",
      title: "Empleado Corporativo Autorizado",
      cssClass: "bg-emerald-600/90 text-white border-emerald-400"
    };
  }
  return {
    label: "Invitado",
    title: "Sin permisos",
    cssClass: "bg-gray-600 text-gray-200 border-gray-500"
  };
}
