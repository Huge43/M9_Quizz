/**
 * La connexion à la base. Un seul fichier SQLite, server/data/quizm9.db par
 * défaut ; la variable d'environnement DB_PATH permet de le placer ailleurs
 * (dans un conteneur, sur un volume : semaine 3).
 *
 * Le fichier n'est pas versionné : chacun a le sien, régénéré au besoin.
 * Pour repartir à neuf : arrêtez le serveur et supprimez le fichier.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = new URL('../../data/', import.meta.url);
const dbPath = process.env.DB_PATH ?? fileURLToPath(new URL('quizm9.db', dataDir));

mkdirSync(dirname(dbPath), { recursive: true });
export const db = new DatabaseSync(dbPath);

// Les lecteurs (le harnais, un autre processus) ne bloquent pas le serveur.
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

/** Crée les tables (schema.sql), puis les remplit (seed.sql) si la base est vide. */
export function initializeDatabase() {
  try {
    // 1. Lire et exécuter schema.sql
    const schemaPath = fileURLToPath(new URL('schema.sql', dataDir));
    const schema = readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    
    // 2. Vérifier si la base est vide (chercher une table quelconque)
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all();
    
    const isEmpty = tables.length === 0;
    
    
    if (isEmpty) {
      const seedPath = fileURLToPath(new URL('seed.sql', dataDir));
      const seed = readFileSync(seedPath, 'utf8');
      db.exec(seed);
      console.log('Base initialisée avec les données de seed.sql');
    } else {
      console.log(`Base initialisée : ${tables.length} table(s) présente(s)`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base :', error.message);
    throw error;
  }
}

/**
 * Enveloppe des écritures qui doivent réussir ENSEMBLE. Si fn lève une
 * erreur, tout est annulé (ROLLBACK) ; sinon tout est confirmé (COMMIT).
 */
export function withTransaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
