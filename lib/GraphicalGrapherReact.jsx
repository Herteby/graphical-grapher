import React from 'react'
import GraphicalGrapher from './GraphicalGrapher.js'

export default class GraphicalGrapherReact extends React.Component {
	render() {
		return (<div id="GraphicalGrapher"><h1>Graphical Grapher</h1></div>)
	}
	componentDidMount(){
		import('./vue.js').then(({Vue}) => {
			this.vue = new Vue({
				el:'#GraphicalGrapher',
				propsData:this.props,
				...GraphicalGrapher
			})
		})
	}
	componentWillUnmount(){
		this.vue.$destroy()
	}
}