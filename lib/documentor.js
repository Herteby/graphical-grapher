import {LinkConstants, NamedQueryStore} from 'meteor/cultofcoders:grapher'
import _ from 'lodash'
import SimpleSchema from 'simpl-schema'

export default function extract() {
    return {
        namedQueries: extractNamedQueryDocumentation(),
        collections: extractCollectionDocumentation()
    }
}

function extractNamedQueryDocumentation() {
    const namedQueries = NamedQueryStore.getAll()

    let DocumentationObject = {}

    _.each(namedQueries, namedQuery => {
        DocumentationObject[namedQuery.queryName] = {
            body: namedQuery.body,
            collection: namedQuery.collection._name,
            isExposed: namedQuery.isExposed,
        }
    })

    return DocumentationObject
}

function extractCollectionDocumentation() {
    const collections = Mongo.Collection.getAll()
    let DocumentationObject = {}

    _.each(collections, ({name, instance}) => {
        if (name === null) {
            return
        }

        if (name.substr(0, 7) == 'meteor_') {
            return
        }

        DocumentationObject[name] = {}
        var isExposed = !!instance.__isExposedForGrapher
        DocumentationObject[name]['isExposed'] = isExposed

        if (isExposed && instance.__exposure.config.body) {
            DocumentationObject[name]['exposureBody'] = _.cloneDeep(instance.__exposure.config.body)
        }

        extractSchema(DocumentationObject[name], instance)
        extractLinks(DocumentationObject[name], instance)
        extractReducers(DocumentationObject[name], instance)
    })

    return DocumentationObject
}


function extractSchema(storage, collection) {
    storage.schema = {}

    if (collection.simpleSchema && collection.simpleSchema()) {
        storage.schema = _.cloneDeep(collection.simpleSchema()._schema)

        formatSchemaType(storage.schema)
    }
}

function extractReducers(storage, collection) {
    storage.reducers = {}

    if (collection.__reducers) {
        _.each(collection.__reducers, (value, key) => {
            storage.reducers[key] = {
                body: _.cloneDeep(value.body)
            }
        })
    }
}

function formatSchemaType(schema) {
    _.each(schema, (field, key) => {
        if(!field){
            return
        }
        _.assign(field, _.omit(field.types, 'definitions'))
        field.types = field.type.definitions
        delete field.type

        _.each(field.types, (definition) => {
            if(definition.type instanceof SimpleSchema){
                definition.content = formatSchemaType(definition.type._schema)
                definition.type = 'Object'
                definition.isSchema = true
            } else {
                _.each(definition, (val, key) =>{
                    if(typeof val == 'function'){
                        definition[key] = val.name
                    }
                })
            }
        })
    })
    _.each(schema, (field, key) => {
        if(!field){
            return
        }
        schemaArray(field, key, schema)
        schemaObject(field, key, schema)
    })
    return schema
}
function schemaArray(field, key, schema){
    _.each(field.types, (definition) => {
        if(definition.type == 'Array'){
            definition.content = schema[key + '.$']
            schemaArray(definition.content, key + '.$', schema)
            schemaObject(definition.content, key + '.$', schema)
            delete schema[key + '.$']
        }
    })
}

function schemaObject(field, key, schema){
    _.each(field.types, (definition) => {
        if(definition.type == 'Object' && !definition.isSchema){
            definition.content = {}
            _.each(schema, (field2, key2) => {
                if(key2.indexOf(key) == 0 && key2 !== key && key2.indexOf('.', key.length + 1) == -1){
                    schemaArray(field2, key2, schema)
                    schemaObject(field2, key2, schema)
                    definition.content[key2.slice(key.length + 1)] = field2
                    delete schema[key2]
                }                    
            })
        }
    })
}

function extractLinks(storage, collection) {
    storage.links = {}
    const collectionLinkStorage = collection[LinkConstants.LINK_STORAGE]

    _.each(collectionLinkStorage, (linker, name) => {
        storage.links[name] = {
            collection: linker.getLinkedCollection()._name,
            strategy: linker.strategy,
            metadata: linker.linkConfig.metadata,
            isVirtual: linker.isVirtual(),
            inversedBy: linker.linkConfig.inversedBy,
            isOneResult: linker.isOneResult(),
            linkStorageField: linker.linkStorageField
        }
    })
}