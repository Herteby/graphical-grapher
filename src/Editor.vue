<template>
	<div class="gg_editor">
		<!--========== SPECIAL FIELDS ==========-->
		<template v-if="!object">
			<div v-for="field in specialFields">
				<div class="gg_node gg_special" :class="{gg_active:node[field]}" @click="clickSpecial(field)">
					<div><div class="gg_icon">$</div>{{field}}</div>
				</div>
				<textarea v-if="node[field]" :class="{gg_error:errors[field]}" @input="setSpecial(field, $event.target.value)" :ref="field"></textarea>
			</div>
		</template>
		<!--========== FIELDS ==========-->
		<div v-for="field, key in fields">
			<div class="gg_node gg_field" :class="{gg_active:node[key]}" @click="clickField(field, key)" @contextmenu.prevent="node[key] == 1 ? $delete(node, key) : $set(node, key, 1)">
				<div><div class="gg_icon">{{icon(field)}}</div>{{key}}</div>
				<div v-if="typeof node[key] !== 'object'" class="gg_details">: {{contentType(field, true)}}</div>
				<div class="gg_hover">
					<div>
						<div>{{field.optional ? 'Optional' : 'Required'}}</div>
						<div v-for="val, key in details(field)">{{key}}:<span>{{val}}</span></div>
						<div v-if="contentType(field) == 'Object'">Right click to include all fields</div>
					</div>
				</div>
			</div>
			<Editor
				v-if="typeof node[key] == 'object'"
				:object="type(field) == 'Array' ? field.types[0].content.types[0].content : field.types[0].content"
				:node="node[key]"
				:collections="collections">
			</Editor>
		</div>
		<template v-if="!object">
			<!--========== REDUCERS ==========-->
			<div v-for="reducer, key in collection.reducers">
				<div class="gg_node gg_reducer" :class="{gg_active:node[key]}" @click="node[key] ? $delete(node, key) : $set(node, key, 1)">
					<div><div class="gg_icon">()</div>{{key}}</div>
					<div class="gg_details">: reducer</div>
					<div class="gg_hover">
						<div>
							<div>body:<span>{{Object.keys(reducer.body).join(', ')}}</span></div>
						</div>
					</div>
				</div>
			</div>
			<!--========== LINKS ==========-->
			<div v-for="link, key in collection.links">
				<div class="gg_node gg_link" :class="{gg_active:node[key]}" @click="node[key] ? $delete(node, key) : $set(node, key, {})">
					<div><div class="gg_icon">{{link.isOneResult ? '>' : '[]'}}</div>{{key}}</div>
					<div class="gg_details">: {{link.collection}}</div>
					<div class="gg_hover">
						<div>
							<div>collection: <span>{{link.collection}}</span></div>
							<div v-if="link.inversedBy">inversedBy: <span>{{link.inversedBy}}</span></div>
							<template v-else>
								<div>type:<span>{{link.strategy}}</span></div>
								<div>field:<span>{{link.linkStorageField}}</span></div>
							</template>
						</div>
					</div>
				</div>
				<Editor
					v-if="node[key]"
					:node="node[key]"
					:collection="collections[link.collection]"
					:collections="collections"
					:lessUsedFields="lessUsedFields">
				</Editor>
			</div>
		</template>
	</div>
</template>

<script>
	import _ from 'lodash'
	export default {
		name:'Editor',
		props:['collection', 'node', 'collections', 'object', 'lessUsedFields', 'showLessUsed'],
		data(){
			return {
				errors:{}
			}
		},
		computed:{
			fields(){
				if(this.object){
					return this.object
				}
				return _.omit(this.collection.schema, '_id')
			},
			specialFields(){
				const fields = ['$filters', '$options', '$filter', '$postFilters', '$postOptions']
				if(this.showLessUsed){
					return fields
				} else {
					return _.difference(fields, this.lessUsedFields)
				}
			}
		},
		methods:{
			icon(field){
				const type = this.type(field)
				if(type.includes('||')){
					return '?'
				}
				return {
					'Object':'{}',
					'Array':'[]',
					'String':'""'
				}[type] || type[0]
			},
			type(field){
				if(field.types[0].length == 1){
					return field.types[0].type
				} else {
					return field.types.map(type => type.type).join(' || ')
				}
			},
			contentType(field, forDisplay){
				if(field.types[0].type == 'Array'){
					if(forDisplay){
						return '[' + this.contentType(field.types[0].content, true) + ']'
					} else {
						return this.contentType(field.types[0].content)
					}
				} else if(field.types[0].blackbox){
					return 'Blackbox'
				} else{
					return this.type(field)
				}
			},
			details(field){
				const details = _.omit(field, 'types', 'optional')
				_.each(field.types, type => {
					Object.assign(details, _.omit(type, ['type', 'content']))
				})
				return details
			},
			clickField(field, key){
				if(this.node[key]){
					this.$delete(this.node, key)
				} else if(this.contentType(field) == 'Object') {
					this.$set(this.node, key, {})
				} else {
					this.$set(this.node, key, 1)
				}
			},
			clickSpecial(field){
				if(this.node[field]){
					this.$delete(this.node, field)
				} else {
					this.$set(this.node, field, {})
					this.$nextTick(() => this.$refs[field][0].focus())
				}
			},
			setSpecial(field, val){
				try{
					const result = new Function(`return {${val}}`)()
					this.node[field] = result
					this.$set(this.errors, field, false)
				} catch(error){
					console.dir(error)
					this.$set(this.errors, field, true)
				}
			}
		}
	}
</script>

<style lang="stylus">
+prefix-classes('gg_')
	.editor
		flex-direction column
	.node
		padding 4px
		margin 1px
		border-radius 4px
		cursor pointer
		border 1px solid #ccc
		flex-wrap nowrap
		align-items flex-start
		position relative
		background white
		&.link .icon
			background #a0a
		&.field .icon
			background #08f
		&.reducer .icon
			background #f80
		&.special .icon
			background #0a0
		&.disabled
			cursor default
			.icon
				background #888			
		&.active
			background #333
			border-color #333
			color white
			&:hover
				background #444
				border-color #444
		&:hover
			background #eee
		.details
			opacity 0.7
			white-space nowrap
		.icon
			font-family monospace
			font-weight bold
			font-size 14px
			width 18px
			height 18px
			align-items center
			justify-content center
			color white
			border-radius 4px
			margin-right 3px
		&:hover .hover
			display flex
	.hover
		position absolute
		top 0px
		right 0px
		display none
		pointer-events none
		> div
			position absolute
			top 0px
			left 0px
			background white
			color black
			box-shadow 0px 1px 5px rgba(0,0,0,0.5)
			border-radius 4px
			z-index 100
			flex-direction column
			white-space nowrap
			div
				border-bottom 1px solid #ddd
				padding 3px
		span
			opacity 0.7
			margin-left 3px
	textarea
		border 1px solid #ccc
		outline none
		border-radius 4px
		margin 1px
		&:focus
			border-color #7c7
		&.error
			border-color #f88
</style>