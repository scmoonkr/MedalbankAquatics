// models/Item.ts
import { type Item, type Collection } from '@/types/items';

export class ItemModel implements Item {
  itemID: number;
  title: string;
  titleEng: string;
  subtitle: string;
  type: string;
  brand: string;
  category: string;
  size: string;
  price: number;
  url: string;
  thumb: string;
  featured: string;
  images: string[];
  description?: string;

  constructor(data: Partial<Item> = {}) {
    this.itemID = data.itemID || 0;
    this.title = data.title || '';
    this.titleEng = data.titleEng || '';
    this.subtitle = data.subtitle || '';
    this.type = data.type || '';
    this.brand = data.brand || '';
    this.category = data.category || '';
    this.size = data.size || '';
    this.price = data.price || 0;
    this.url = data.url || '';
    this.thumb = data.thumb || '';
    this.featured = data.featured || '';
    this.images = data.images || [];
    this.description = data.description || '';
  }

  // JSON에서 ItemModel 인스턴스 생성 (필드별 할당)
  static fromJSON(json: any): ItemModel {
    const item = new ItemModel();
    
    item.itemID = json.itemID || 0;
    item.title = json.title || '';
    item.titleEng = json.titleEng || '';
    item.subtitle = json.subtitle || '';
    item.type = json.type || '';
    item.brand = json.brand || '';
    item.category = json.category || '';
    item.size = json.size || '';
    item.price = json.price || 0;
    item.url = json.url || '';
    item.thumb = json.thumb ? getImageURL(json.thumb) : '';
    item.featured = json.featured ? getImageURL(json.featured) : '';
    item.images = json.images || [];
    item.description = json.description || '';
    
    return item;
  }

  // 여러 아이템을 배열로 변환
  static fromJSONArray(jsonArray: any[]): ItemModel[] {
    if (!Array.isArray(jsonArray)) {
      throw new Error('Provided data is not an array');
    }
    
    return jsonArray.map(item => ItemModel.fromJSON(item));
  }

  // JSON 직렬화
  toJSON(): Item {
    return {
      itemID: this.itemID,
      title: this.title,
      titleEng: this.titleEng,
      subtitle: this.subtitle,
      type: this.type,
      brand: this.brand,
      category: this.category,
      size: this.size,
      price: this.price,
      url: this.url,
      thumb: this.thumb,
      featured: this.featured,
      images: this.images,
      description: this.description,
    };
  }

  // 빈 ItemModel 인스턴스 생성
  static initialize(): ItemModel {
    return new ItemModel({
      itemID: 0,
      title: '',
      titleEng: '',
      subtitle: '',
      type: '',
      brand: '',
      category: '',
      size: '',
      price: 0,
      url: '',
      thumb: '',
      featured: '',
      images: [],
      description: ''
    });
  }
}

export class CollectionModel implements Collection {
  title: string;
  subtitle: string;
  slug: string;
  description?: string;
  items: ItemModel[]; // Item[] 대신 ItemModel[] 사용

  constructor(data: Partial<Collection> = {}) {
    this.title = data.title || '';
    this.subtitle = data.subtitle || '';
    this.slug = data.slug || '';
    this.description = data.description || '';
    this.items = data.items ? data.items.map(item => new ItemModel(item)) : [];
  }

  // JSON에서 CollectionModel 인스턴스 생성
  static fromJSON(json: any): CollectionModel {
    const collection = new CollectionModel();
    
    collection.title = json.title || '';
    collection.subtitle = json.subtitle || '';
    collection.slug = json.slug || '';
    collection.description = json.description || '';
    collection.items = [];
    
    if (json.items && Array.isArray(json.items)) {
      // 타입 명시로 'any' 에러 해결
      collection.items = json.items.map((item: any) => ItemModel.fromJSON(item));
    }
    
    return collection;
  }

  // 여러 포트폴리오를 배열로 변환
  static fromJSONArray(jsonArray: any[]): CollectionModel[] {
    if (!Array.isArray(jsonArray)) {
      throw new Error('Provided data is not an array');
    }
    
    return jsonArray.map((collection: any) => CollectionModel.fromJSON(collection));
  }

  // JSON 직렬화 - Collection 타입이 아닌 객체 반환
  toJSON() {
    return {
      title: this.title,
      subtitle: this.subtitle,
      slug: this.slug,
      description: this.description,
      items: this.items.map((item: ItemModel) => item.toJSON()),
    };
  }

  // 빈 CollectionModel 인스턴스 생성
  static initialize(): CollectionModel {
    return new CollectionModel({
      title: '',
      subtitle: '',
      slug: '',
      description: '',
      items: [],
    });
  }
}