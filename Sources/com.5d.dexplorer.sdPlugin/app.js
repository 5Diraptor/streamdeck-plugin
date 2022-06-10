/* global $CC, Utils, $SD */

/**
 * Here are a couple of wrappers we created to help you quickly setup
 * your plugin and subscribe to events sent by Stream Deck to your plugin.
 */

/**
 * The 'connected' event is sent to your plugin, after the plugin's instance
 * is registered with Stream Deck software. It carries the current websocket
 * and other information about the current environmet in a JSON object
 * You can use it to subscribe to events you want to use in your plugin.
 */
 
 
/* DEBUG */

const app_debug = true;
const dbg = app_debug ? console.log.bind(window.console, "[app.js]") : () => { };

/* END DEBUG */


$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
	// action UUID:
		// com.5d.dexplorer.tile
		// com.5d.dexplorer.home
		// com.5d.dexplorer.prev
		// com.5d.dexplorer.next
	
	let tiles = ['tile', 'home', 'prev', 'next'];
	
	for  (let i=0; i<tiles.length; i++) {
	
		$SD.on('com.5d.dexplorer.'+tiles[i]+'.willAppear', (jsonObj) => action.onWillAppear(jsonObj, tiles[i]));
		$SD.on('com.5d.dexplorer.'+tiles[i]+'.WillDisappear', (jsonObj) => action.onWillDisappear(jsonObj));
		
		$SD.on('com.5d.dexplorer.'+tiles[i]+'.keyUp', (jsonObj) => action.onKeyUp(jsonObj,tiles[i]));
		$SD.on('com.5d.dexplorer.'+tiles[i]+'.keyDown', (jsonObj) => action.onKeyDown(jsonObj, tiles[i]));
		$SD.on('com.5d.dexplorer.'+tiles[i]+'.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
		$SD.on('com.5d.dexplorer.'+tiles[i]+'.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
	
	
	
		// Activate the property inspector - view here: http://localhost:23654
		$SD.on('com.5d.dexplorer.'+tiles[i]+'.propertyInspectorDidAppear', (jsonObj) => {
			console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
		});
		$SD.on('com.5d.dexplorer.'+tiles[i]+'.propertyInspectorDidDisappear', (jsonObj) => {
			console.log('%c%s', 'color: white; background: red; font-size: 13px;', '[app.js]propertyInspectorDidDisappear:');
		});
	};
	
};

// ACTIONS

const action = {
	settings:{},
	onDidReceiveSettings: function(jsn) {
		console.log('%c%s', 'color: white; background: red; font-size: 15px;', '[app.js]onDidReceiveSettings:');

		this.settings = Utils.getProp(jsn, 'payload.settings', {});
		this.doSomeThing(this.settings, 'onDidReceiveSettings', 'orange');

		/**
		 * In this example we put a HTML-input element with id='mynameinput'
		 * into the Property Inspector's DOM. If you enter some data into that
		 * input-field it get's saved to Stream Deck persistently and the plugin
		 * will receive the updated 'didReceiveSettings' event.
		 * Here we look for this setting and use it to change the title of
		 * the key.
		 */

		 this.setTitle(jsn);
	},

	/** 
	 * The 'willAppear' event is the first event a key will receive, right before it gets
	 * shown on your Stream Deck and/or in Stream Deck software.
	 * This event is a good place to setup your plugin and look at current settings (if any),
	 * which are embedded in the events payload.
	 */

	onWillAppear: function (jsn, tile) {
		console.log("You can cache your settings in 'onWillAppear'", jsn.payload.settings);
		/**
		 * The willAppear event carries your saved settings (if any). You can use these settings
		 * to setup your plugin or save the settings for later use. 
		 * If you want to request settings at a later time, you can do so using the
		 * 'getSettings' event, which will tell Stream Deck to send your data 
		 * (in the 'didReceiveSettings above)
		 * 
		 * $SD.api.getSettings(jsn.context);
		*/
		this.settings = jsn.payload.settings;
		let pos = jsn.payload.coordinates.column+'/'+jsn.payload.coordinates.row;

		// Nothing in the settings pre-fill, just something for demonstration purposes
		if (!this.settings || Object.keys(this.settings).length === 0) {
			this.settings.mynameinput = tile+': '+pos;
		}
		this.setTitle(jsn);
	},
	
	onWillDisappear: function (jsn) {
		console.log("You can cache your settings in 'onWillDisappear'", jsn.payload.settings);
		/**
		 * The onWillDisappear event carries your saved settings (if any). You can use these settings
		 * to setup your plugin or save the settings for later use. 
		 * If you want to request settings at a later time, you can do so using the
		 * 'getSettings' event, which will tell Stream Deck to send your data 
		 * (in the 'didReceiveSettings above)
		 * 
		 * $SD.api.getSettings(jsn.context);
		*/
		this.settings = jsn.payload.settings;

		// Nothing in the settings pre-fill, just something for demonstration purposes
		if (!this.settings || Object.keys(this.settings).length === 0) {
			this.settings.mynameinput = 'gone now';
		}
		this.setTitle(jsn);
	},

	onKeyUp: function (jsn, action) {
		this.doSomeThing(jsn, 'onKeyUp: '+action, 'green');
	},
	
	 onKeyDown: function (jsn, action) {
		this.doSomeThing(jsn, 'onKeyDown: '+action, 'purple');
	},

	onSendToPlugin: function (jsn) {
		/**
		 * This is a message sent directly from the Property Inspector 
		 * (e.g. some value, which is not saved to settings) 
		 * You can send this event from Property Inspector (see there for an example)
		 */ 

		const sdpi_collection = Utils.getProp(jsn, 'payload.sdpi_collection', {});
		if (sdpi_collection.value && sdpi_collection.value !== undefined) {
			this.doSomeThing({ [sdpi_collection.key] : sdpi_collection.value }, 'onSendToPlugin', 'fuchsia');			
		}
	},

	/**
	 * This snippet shows how you could save settings persistantly to Stream Deck software.
	 * It is not used in this example plugin.
	 */

	saveSettings: function (jsn, sdpi_collection) {
		console.log('saveSettings:', jsn);
		if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
			if (sdpi_collection.value && sdpi_collection.value !== undefined) {
				this.settings[sdpi_collection.key] = sdpi_collection.value;
				console.log('setSettings....', this.settings);
				$SD.api.setSettings(jsn.context, this.settings);
			}
		}
	},

	/**
	 * Here's a quick demo-wrapper to show how you could change a key's title based on what you
	 * stored in settings.
		  * If you enter something into Property Inspector's name field (in this demo),
	 * it will get the title of your key.
	 * 
	 * @param {JSON} jsn // The JSON object passed from Stream Deck to the plugin, which contains the plugin's context
	 * 
	 */

	setTitle: function(jsn) {
		if (this.settings && this.settings.hasOwnProperty('mynameinput')) {
			console.log("watch the key on your StreamDeck - it got a new title...", this.settings.mynameinput);
			$SD.api.setTitle(jsn.context, this.settings.mynameinput);
		}
	},

	/**
	 * Finally here's a method which gets called from various events above.
	 * This is just an idea on how you can act on receiving some interesting message
	 * from Stream Deck.
	 */

	doSomeThing: function(inJsonData, caller, tagColor) {
		let pos = inJsonData.payload.coordinates.column+'/'+inJsonData.payload.coordinates.row;
		console.log('%c%s', `color: white; background: ${tagColor || 'grey'}; font-size: 15px;`, `[app.js]doSomeThing from: ${caller} : ${pos} `);
		
		console.log('%c%s', `color: white; background: ${tagColor || 'grey'}; font-size: 15px;`, `[app.js]the context: ${inJsonData.context}  `);
		// console.log(inJsonData);
	}, 


};

