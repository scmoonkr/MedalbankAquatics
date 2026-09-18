const backupDAO = require("./backupDAO");

(async () => {

	const result = await backupDAO.backup({ collections: "all"});
	console.log("backup=", result);

})();
