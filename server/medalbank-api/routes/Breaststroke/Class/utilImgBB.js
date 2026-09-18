

const _imgBBhome = "ibb.co"
exports.makeMetaImgBBURL = (meta) => {
	const filename = `${meta.title}.${meta.ext}`;
	const url = {
    url			: `https://i.${_imgBBhome}/${meta.original}/${filename}`,
    medium	: `https://i.${_imgBBhome}/${meta.medium}/${filename}`,
    thumb		: `https://i.${_imgBBhome}/${meta.imageID}/${filename}`,
    delete	: `https://${_imgBBhome}/${meta.imageID}/${meta.hash}`,
	}
	return url;
}

exports.makeMetaImgBB = (db, id, meta) => {
  meta = meta.data;
  const deletes  = meta.delete_url.split('/'); // "deleteURL" : "https://ibb.co/BK3ftvbn/8b9f237ba004be1cafac61575943e411",
  const originals = meta.url.split("/");
  const mediums = (meta.medium.url || meta.url).split("/");
  const res = {
    db          : db, // item
    id          : id, // itemID
    imageID			: meta.id, // Pv60ntSm
    hash				: deletes[deletes.length - 1], // 8b9f237ba004be1cafac61575943e411
    original		: originals[3],
    medium      : mediums[3],
    title				: meta.title,
    filename		: meta.filename,

    ext				  : meta.thumb.extension, // jpg
    width				: meta.width,
    height			: meta.height,
    size				: meta.size,
  };
  return res;
}