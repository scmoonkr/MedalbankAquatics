
exports.field = (data) => {
	const value = {
		ootdID: data.ootdID || 0,
	};
	
	
	if (data.userID) value.userID = Number(data.userID);
	if (data.brands) value.brands = data.brands;
	if (data.options) value.options = data.options;
	if (data.category) value.category = data.category;
	if (data.tags) value.tags = data.tags;
	if (data.featured) value.featured = data.featured;

	
	return value;
}
