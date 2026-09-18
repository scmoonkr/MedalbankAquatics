
const MemoryDB 		= require('./MemoryDB');
const memoryDB		= new MemoryDB();

(async () => {
	console.log("\n\nstart load memoryDB ok\n\n");
	const memoryDB = new MemoryDB();
	await memoryDB.initialize();
	console.log("\n\nload memoryDB ok\n\n");
})();
