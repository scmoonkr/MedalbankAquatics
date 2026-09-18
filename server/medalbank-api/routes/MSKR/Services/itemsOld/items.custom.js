
exports.field = (data) => {
	const value = {
		itemID: data.itemID || 0,
		title	: data.title || "",
	};
	
	
	if (data.productID) value.productID = data.productID;
	if (data.check) value.check = data.check;
	if (data.isDark) value.isDark = data.isDark;
	if (data.userID) value.userID = Number(data.userID);
	if (data.model) value.model = data.model;
	if (data.gender) value.gender = data.gender;
	if (data.material) value.material = data.material;
	if (data.type) value.type = data.type;
	if (data.brand) value.brand = data.brand;
	if (data.manufacture) value.manufacture = data.manufacture;
	if (data.price) value.price = Number(data.price);
	if (data.options) value.options = data.options;
	if (data.category) value.category = data.category;
	if (data.tags) value.tags = data.tags;
	if (data.featured) value.featured = data.featured;

	
	return value;
}
