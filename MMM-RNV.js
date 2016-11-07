/* global Module */

/* Magic Mirror
 * Module: MMM-RNV
 *
 * By Stefan Krause http://yawns.de
 * MIT Licensed.
 */

Module.register('MMM-RNV',{
	
	defaults: {
		apiKey: "",
		units: config.units,
		animationSpeed: 1000,
		refreshInterval: 1000 * 300,
		updateInterval: 1000 * 3600, //update every hour
		timeFormat: config.timeFormat,
		lang: config.language,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,

		apiBase: "http://rnv.the-agent-factory.de:8080/easygo2/api",				
	},
	
	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	start: function() {
		Log.info('Starting module: ' + this.name);
		this.loaded = false;
		this.sendSocketNotification('CONFIG', this.config);
	},

	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.apiKey === "") {
			wrapper.innerHTML = "Please set the correct RNV <i>apiKey</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.className = "dimmed light small";
			return wrapper;
		}		

		return wrapper;
	},

 	socketNotificationReceived: function(notification, payload) {
    		if (notification === "STARTED") {
				this.loaded = true;
				this.updateDom();
			}
			else if (notification === "DATA") {
      			//this.temperature = payload.temperature;
      			//this.humidity = payload.humidity;
				Log.error(JSON.parse(payload));
				Log.error(payload);
      			this.updateDom();
    		}
	} 	

});
