
exports.customizing = (data) => {
  data = Object.keys(data).reduce((obj, key) => {
                            if (data[key] != null) {
                              obj[key] = data[key];
                            }
                            return obj;
                          }, {});
	const value = {};
	if (data._id				) {
		if (data._id.dbType	) value.dbType = data._id.dbType;
		if (data._id.dbID 	) value.dbID = data._id.dbID;
		if (data._id.userID	) value.userID = data._id.userID;
	}
	if (data.likes      ) value.likes				= Number(data.likes);
	if (data.dislikes		) value.dislikes		= Number(data.dislikes);
	if (data.blinds			) value.blinds			= Number(data.blinds);
	if (data.pins				) value.pins				= Number(data.pins);
	if (data.captures		) value.captures		= Number(data.captures);
	if (data.shares			) value.shares			= Number(data.shares);
	if (data.views			) value.views				= Number(data.views);
	if (data.follows		) value.follows			= Number(data.follows);
	if (data.followedBys) value.followedBys	= Number(data.followedBys);
	if (data.ratings		) value.ratings			= parseFloat(data.ratings);
	if (data.pizzas			) value.pizzas			= parseFloat(data.pizzas);

	return value;
}

exports.field = (data) => {
  const fields = Array.isArray(data) ? data : [data];
  let value = {}
  for (const field of fields) {
    const data = this.customizing(field);

    const cust = Object.keys(data).reduce((obj, key) => {
                                    if (!value[key]) value[key] = typeof data[key] == 'string' ? '' : 0;
                                    value[key] += data[key];
                                    return obj;
                                  }, value);
  }
  if (value.rating) value.rating = value.rating / Object.keys(value).length;
  if (value.pizzas) value.pizzas = value.pizzas / Object.keys(value).length;

	return value;
}