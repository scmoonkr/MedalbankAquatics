
exports.errorMSG = (service, category, action, message) => {
	const msg = `---> ${service}.${category}.${action}.${message}`;
	console.log(msg);
	return { message: msg };
}