import { openDb } from './db.js';
import {
    countByLevel,
    countByCategory,
    recentByLevel,
    latestErrorByTerm,
} from './queries.js';

const db = openDb();

console.table(countByLevel(db));
console.table(countByCategory(db));
console.table(recentByLevel(db, 'WARN'));
console.table(latestErrorByTerm(db, 'ERROR', 'timeout'));

db.close();
