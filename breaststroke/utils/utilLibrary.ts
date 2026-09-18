// utils/utilLibrary.js

export function getImageURL(image: string) {
  const config = useRuntimeConfig()
  if (!image) return '';
  image = image.includes("http") 
                    ? image 
                    : `${config.public.serverBase}${image}`;
	return image;
}

/*
{
  data: {
    id: 'Pv60ntSm',
    title: 'athletes-1-1-featured',
    url_viewer: 'https://ibb.co/Pv60ntSm',
    url: 'https://i.ibb.co/KprSkm10/athletes-1-1-featured.jpg',
    display_url: 'https://i.ibb.co/B5CFxw1z/athletes-1-1-featured.jpg',
    width: 1080,
    height: 974,
    size: 625641,
    time: 1741756424,
    expiration: 0,
    image: {
      filename: 'athletes-1-1-featured.jpg',
      name: 'athletes-1-1-featured',
      mime: 'image/jpeg',
      extension: 'jpg',
      url: 'https://i.ibb.co/KprSkm10/athletes-1-1-featured.jpg'
    },
    thumb: {
      filename: 'athletes-1-1-featured.jpg',
      name: 'athletes-1-1-featured',
      mime: 'image/jpeg',
      extension: 'jpg',
      url: 'https://i.ibb.co/Pv60ntSm/athletes-1-1-featured.jpg'
    },
    medium: {
      filename: 'athletes-1-1-featured.jpg',
      name: 'athletes-1-1-featured',
      mime: 'image/jpeg',
      extension: 'jpg',
      url: 'https://i.ibb.co/B5CFxw1z/athletes-1-1-featured.jpg'
    },
    delete_url: 'https://ibb.co/Pv60ntSm/8e40be87c9ba99f870fd5a24954b2b96'
  },
  success: true,
  status: 200
}
  {
    "_id" : ObjectId("67b446b8f95cde27d35b72c0"),
    "db" : "athletes",
    "id" : 23,
    "type" : "featured",
    "deleteURL" : "https://ibb.co/BK3ftvbn/8b9f237ba004be1cafac61575943e411",
    "display_url" : "https://i.ibb.co/cX3y1R0Y/athlete-23-featured.jpg",
    "ext" : "jpg",
    "height" : 1620,
    "imageID" : "BK3ftvbn",
    "medium" : "https://i.ibb.co/cX3y1R0Y/athlete-23-featured.jpg",
    "size" : 1629337,
    "thumb" : "https://i.ibb.co/BK3ftvbn/athlete-23-featured.jpg",
    "timeStamp" : 1739867830,
    "title" : "athlete-23-featured",
    "url" : "https://i.ibb.co/4gtF7Cz1/athlete-23-featured.jpg",
    "url_viewer" : "https://ibb.co/BK3ftvbn",
    "width" : 1080,
    "created" : ISODate("2025-02-18T11:51:01.302Z"),
    "userID" : 23
}
*/
export function makeMetaImgBB(db:string, id:number, meta:any) {
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
  console.log("makeMetaImgBB.imgBB.", meta, ", meta.", res);
  return res;
}


/**
 * 값이 단순 타입인지 확인 (string, number, boolean)
 */
function isPrimitiveType(value: any): boolean {
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean';
}

/**
 * 값이 단순 배열인지 확인 (string[], number[], boolean[])
 */
function isPrimitiveArray(value: any): boolean {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }
  // 첫 번째 요소가 기본 타입인지 확인
  return isPrimitiveType(value[0]);
}

/**
 * 값이 객체 배열인지 확인 ({}[])
 */
function isObjectArray(value: any): boolean {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }
  // 첫 번째 요소가 객체인지 확인
  return typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0]);
}
/**
 * 자동 타입 감지로 FormData 생성
 */
export function buildFormData(
  data: Record<string, any>,
  excludeFields: string[] = []
): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    // 1. 스킵 조건
    if (
      value === null ||
      value === undefined ||
      // value === '' ||
      excludeFields.includes(key)
    ) {
      return;
    }

    // 2. 기본 타입 (string, number, boolean)
    if (isPrimitiveType(value)) {
      formData.append(key, String(value));
      return;
    }

    // 3. 단순 배열 (string[], number[], boolean[])
    if (isPrimitiveArray(value)) {
      (value as Array<string | number | boolean>).forEach((item) => {
        formData.append(key, String(item));
      });
      return;
    }

    // 4. 객체 배열 ({}[])
    if (isObjectArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // 5. 빈 배열
    if (Array.isArray(value) && value.length === 0) {
      // 빈 배열은 스킵하거나 빈 문자열로 처리
      // formData.append(key, '[]'); // 선택사항
      return;
    }

    // 6. 일반 객체 ({})
    if (typeof value === 'object' && !Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // 7. 그 외 (배열 안에 다양한 타입이 섞여있는 경우 등)
    // JSON으로 처리
    formData.append(key, JSON.stringify(value));
  });

  return formData;
}