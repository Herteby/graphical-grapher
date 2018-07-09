# Graphical Grapher
Get an overview of all your Grapher links and Collection2 schemas, and create queries just by clicking (with live results)

[Demo](https://github.com/Herteby/graphical-grapher-demo)

![screenshot](https://raw.githubusercontent.com/Herteby/graphical-grapher/master/screenshot.png)

## Installation
```bash
meteor add herteby:graphical-grapher
```
## Usage

### Server
```javascript
import {initialize} from 'meteor/herteby:graphical-grapher'
initialize() //exposes the methods "grapher.live" and "grapher.live_docs"
```
Note: although the "Bypass firewall" feature only works in development, you may want to skip initializing it in production, just so that potential attackers don't get to see your DB schema.

### Vue
```javascript
import {GraphicalGrapher} from 'meteor/herteby:graphical-grapher'
//Add the GraphicalGrapher component to a route or template
```

### React
Graphical Grapher is built in Vue, but it also includes a React wrapper that imports Vue dynamically when it's mounted. This means that your bundle size is not affected
```javascript
import {GraphicalGrapherReact} from 'meteor/herteby:graphical-grapher'
//Add the GraphicalGrapherReact component to a route or render function
```

## Props
You can pass some props to configure Graphical Grapher. This works in both Vue and React.
<table>
	<tr>
		<th>Name</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>indent</td>
		<td>tab character</td>
		<td>String used to indent resulting query. You can for example set this to a string containing 2 or 4 spaces instead.</td>
	</tr>
	<tr>
		<td>lessUsedFields</td>
		<td>['$filter','$postFilters','$postOptions']</td>
		<td>An array containing the fields which should be hidden unless "Show less used fields" is checked.</td>
	</tr>
	<tr>
		<td>hideSchemalessCollections</td>
		<td>false</td>
		<td>If set to true, it won't show collections that lack schemas and links at all, instead of just greying them out.</td>
	</tr>
	<tr>
		<td>singleResult</td>
		<td>false</td>
		<td>The initial state of "Single result"</td>
	</tr>
	<tr>
		<td>includeCreate</td>
		<td>true</td>
		<td>The initial state of "Add "Collection.createQuery""</td>
	</tr>
</table>

> **Compiling .vue files**
> 
> If you want to make changes to the .vue files in this package, you will need to recompile them to .js afterwards. Just run this in the graphical-grapher folder: `npm install; npx webpack`
