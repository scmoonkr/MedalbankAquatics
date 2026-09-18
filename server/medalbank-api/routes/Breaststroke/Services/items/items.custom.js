
exports.field = (data) => {
	const value = {};
	
	
	if (data.itemID			) value.itemID = Number(data.itemID);
	if (data.title			) value.title = data.title.trim();
	if (data.subtitle		) value.subtitle = data.subtitle.trim();
	if (data.titleEng		) value.titleEng = data.titleEng.trim();
	if (data.type				) value.type = data.type.trim();
	if (data.brand			) value.brand = data.brand.trim();
	if (data.url				) value.url = data.url.trim();
	if (data.description) value.description = data.description.trim();
	if (data.category		) value.category = data.category.trim();
	if (data.featured		) value.featured = data.featured.trim();
	if (data.thumb			) value.thumb = data.thumb;
	if (data.images			) value.images = data.images;
	// if (data.size				) value.size = data.size;
	// if (data.price			) value.price = Number(data.price);
	// if (data.sourcePath	) value.sourcePath = data.sourcePath;	
	
	if (data.productID) value.productID = data.productID;
	if (data.check) value.check = data.check;
	if (data.isDark) value.isDark = data.isDark;
	if (data.userID) value.userID = Number(data.userID);
	if (data.model) value.model = data.model;
	if (data.gender) value.gender = data.gender;
	if (data.material) value.material = data.material;
	if (data.manufacture) value.manufacture = data.manufacture;
	if (data.options) value.options = data.options;
	if (data.tags) value.tags = data.tags;

	
	return value;
}
