<template>
	<div class="gg_main" v-if="collections">
		<h1>Graphical Grapher</h1>
		<div class="gg_collections">
			<div v-for="collection, name in collections" 
			@click="currentCollection = name" 
			:class="{gg_active:currentCollection == name, gg_noStuff:collection.noStuff}">
				{{name}}
			</div>
		</div>
		<div class="gg_options">
			<label v-if="dev"><input type="checkbox" v-model="bypassFirewall">Bypass firewall<span> (not available in production)</span></label>
			<label><input type="checkbox" v-model="single">Single result</label>
			<label><input type="checkbox" v-model="includeCreate_">Add "Collection.createQuery"</label>
			<label><input type="checkbox" v-model="showLessUsed">Show less used fields</label>
			</div>
		<div v-if="currentCollection" class="gg_columns">
			<div>
				<h2>Editor</h2>
				<Editor
					:collection="collections[currentCollection]"
					:node="query"
					:collections="collections"
					:lessUsedFields="lessUsedFields"
					:showLessUsed="showLessUsed">
				</Editor>
			</div>			
			<div>
				<h2>Query</h2>
				<textarea readonly v-model="jsonQuery" class="gg_query" @click="$event.target.select()"></textarea>
			</div>
			<div>
				<h2>Result <span v-if="result.data">{{result.data.length}} documents - {{result.timeElapsedMs}}ms</span></h2>
				<div v-if="result.error" style="color:red">{{result.message}}</div>
				<div v-else class="gg_result">{{jsonResult}}</div>
			</div>
		</div>
		<h1 v-else style="color:#888">Choose a collection</h1>
	</div>
</template>

<script>
	import _ from 'lodash'
	import Editor from './Editor.vue'
	export default {
		components:{Editor},
		props:{
			indent:{
				type:String,
				default:'	'
			},
			singleResult:{
				type:Boolean,
				default:false
			},
			includeCreate:{
				type:Boolean,
				default:true
			},
			lessUsedFields:{
				type:Array,
				default(){
					return ['$filter','$postFilters','$postOptions']
				}
			}
		},
		data(){
			return {
				collections:undefined,
				namedQueries:undefined,
				currentCollection:undefined,
				queries:{},
				badQuery:false,
				single:this.singleResult,
				bypassFirewall:false,
				includeCreate_:this.includeCreate,
				showLessUsed:false,
				result:{},
			}
		},
		created(){
			Meteor.call('grapher.live_docs', (err, res) => {
				if(err){
					throw err
				}
				let collections = res.collections
				//make collections with no links or schema grey and display them last in the menu
				_.each(collections, collection => {
					if(!_.size(collection.schema) && !_.size(collection.links) && !_.size(collection.reducers)){
						collection.noStuff = true
					}
				})
				this.collections = _.pickBy(collections, coll => !coll.noStuff)
				_.each(_.pickBy(collections, coll => coll.noStuff), (val, key) => this.$set(this.collections, key, val))
				this.namedQueries = res.namedQueries
			})
			this.$watch(()=>[this.currentCollection, this.query, this.single, this.bypassFirewall],
				([collection, query, single, bypass]) => {
					if(collection){
						const body = {[collection]:_.cloneDeep(query)}
						if(single){
							_.set(body[collection], '$options.limit', 1)
						}
						Meteor.call('grapher.live', {
							body:body,
							params:undefined,
							checkUser:!this.bypassFirewall
						},
						(err, res) => this.result = res || err)
					}
				}, {deep:true})
		},
		computed:{
			query(){
				if(!this.queries[this.currentCollection]){
					this.$set(this.queries, this.currentCollection, {})
				}
				return this.queries[this.currentCollection]
			},
			jsonQuery(){
				let query = JSON.stringify(this.query, null, this.indent)
				if(this.includeCreate_){
					query = _.upperFirst(this.currentCollection) + '.createQuery(' + query + ')'
				}
				return query
			},
			dev(){
				return Meteor.isDevelopment
			},
			jsonResult(){
				return JSON.stringify(this.result.data, null, '  ')
			}
		}
	}
</script>

<style lang="stylus">
+prefix-classes('gg_')
	.main
		font-family sans-serif
		flex-direction column
		*
			display flex
			user-select none
	.collections
		border-radius 8px
		overflow hidden
		flex-wrap wrap
		div
			cursor pointer
			padding 10px
			flex-grow 1
			background #333
			color white
			justify-content center
			&:hover
				background #444
			&.noStuff
				color #aaa
			&.active
				background #0a0
				color #fff			
	.options
		@media (max-width 750px)
			flex-wrap wrap
		label
			padding 5px
			margin 5px
			cursor pointer
			align-items center
			&:hover
				background #eee
			span
				opacity 0.5
				margin-left 5px
				font-size 12px
		input
			height 20px
			width 20px
			flex-shrink 0
	.columns
		> div
			flex-direction column
			flex-basis 33%
			flex-grow 1
			flex-shrink 1
			padding 10px
		h2
			margin-top 0
			span
				margin-left auto
				opacity 0.5
				font-weight normal
	.query, .result
		white-space pre-wrap
		flex-grow 1
		user-select all
		cursor text
	.query
		border none
		outline none
		resize none
		tab-size 2
		background none
</style>