const { MongoClient } = require('mongodb');

class MongoDBHelper {
    constructor(uri, dbName) {
        this.uri = uri;
        this.dbName = dbName;
        this.client = new MongoClient(this.uri);
        this.db = null;
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            console.log(`Connected to database: ${this.dbName}`);
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }

    async createCollection(collectionName, options = {}) {
        try {
            return await this.db.createCollection(collectionName, options);
        } catch (error) {
            console.error('Create collection failed:', error);
            throw error;
        }
    }

    async createIndex(collectionName, fields, options = {}) {
        try {
            return await this.db.collection(collectionName).createIndex(fields, options);
        } catch (error) {
            console.error('Create index failed:', error);
            throw error;
        }
    }

    async find(collectionName, query = {}, options = {}) {
        try {
            return await this.db.collection(collectionName).find(query, options).toArray();
        } catch (error) {
            console.error('Find operation failed:', error);
            throw error;
        }
    }

    async findOne(collectionName, query = {}, options = {}) {
        try {
            return await this.db.collection(collectionName).findOne(query, options);
        } catch (error) {
            console.error('FindOne operation failed:', error);
            throw error;
        }
    }

    async insertOne(collectionName, document) {
        try {
            return await this.db.collection(collectionName).insertOne(document);
        } catch (error) {
            console.error('InsertOne operation failed:', error);
            throw error;
        }
    }

    async insertMany(collectionName, documents, options = {}) {
        try {
            return await this.db.collection(collectionName).insertMany(documents, options);
        } catch (error) {
            console.error('InsertMany operation failed:', error);
            throw error;
        }
    }

    async updateOne(collectionName, filter, update, options = {}) {
        try {
            return await this.db.collection(collectionName).updateOne(filter, update, options);
        } catch (error) {
            console.error('UpdateOne operation failed:', error);
            throw error;
        }
    }

    async updateMany(collectionName, filter, update, options = {}) {
        try {
            return await this.db.collection(collectionName).updateMany(filter, update, options);
        } catch (error) {
            console.error('UpdateMany operation failed:', error);
            throw error;
        }
    }

    async deleteOne(collectionName, filter) {
        try {
            return await this.db.collection(collectionName).deleteOne(filter);
        } catch (error) {
            console.error('DeleteOne operation failed:', error);
            throw error;
        }
    }

    async deleteMany(collectionName, filter) {
        try {
            return await this.db.collection(collectionName).deleteMany(filter);
        } catch (error) {
            console.error('DeleteMany operation failed:', error);
            throw error;
        }
    }

    async aggregate(collectionName, pipeline = [], options = {}) {
        try {
            return await this.db.collection(collectionName).aggregate(pipeline, options).toArray();
        } catch (error) {
            console.error('Aggregate operation failed:', error);
            throw error;
        }
    }

    async close() {
        try {
            await this.client.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing the database connection:', error);
            throw error;
        }
    }
}

module.exports = MongoDBHelper;
