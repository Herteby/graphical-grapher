import getDocumentationObject from './documentor'
import {createQuery} from 'meteor/cultofcoders:grapher'

export default initializer = () => {
    Meteor.methods({
        'grapher.live_docs'() {
            return getDocumentationObject()
        },

        'grapher.live'({body, params, checkUser = false}) {
            const query = createQuery(body, {
                params,
            })

            if ((Meteor.isProduction || checkUser) && !query.collection.__isExposedForGrapher) {
                throw new Meteor.Error('not-allowed', `You are trying to retrieve the data from a non-exposed collection: ${query.collection._name}`)
            }

            const userId = checkUser ? this.userId : undefined

            const start = new Date()
            const data = query.fetch({userId})
            const end = new Date()

            return {
                timeElapsedMs: end.getTime() - start.getTime(),
                data: data
            }
        }
    })
}
