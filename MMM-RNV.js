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
		refreshInterval: 1000 * 60,
		updateInterval: 1000 * 3600, //update every hour
		timeFormat: config.timeFormat,
		lang: config.language,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,

		apiBase: 'http://rnv.the-agent-factory.de:8080/easygo2/api',		
		requestURL: '/regions/rnv/modules/stationmonitor/element',
		stationID: '5553',
		
		iconTable: {
			"KOM": "fa fa-bus",
			"STRAB": "fa fa-subway"
		},
	},
	
	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "font-awesome.css"];
	},
	
	getStyles: function() {
		return ['MMM-RNV.css'];
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
		
		if (!this.departures.length) {
			wrapper.innerHTML = "No data";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		
		var table = document.createElement("table");
		table.className = "small thin light";
		
		var row = document.createElement("tr");

		var timeHeader = document.createElement("th");
		timeHeader.innerHTML = "Abfahrt";
		row.appendChild(timeHeader);
		var lineHeader = document.createElement("th");
		lineHeader.innerHTML = "Linie";
		lineHeader.colSpan = 2;
		row.appendChild(lineHeader);
		var destinationHeader = document.createElement("th");
		destinationHeader.innerHTML = "Fahrtrichtung";
		row.appendChild(destinationHeader);		
		table.appendChild(row);
		
		for (var i in this.departures) {
			var currentDeparture = this.departures[i];
			var row = document.createElement("tr");
			table.appendChild(row);
			
			var cellDeparture = document.createElement("td");
			cellDeparture.innerHTML = currentDeparture.time;
			cellDeparture.className = "timeinfo";
			if (currentDeparture.delay > 0) {
				var spanDelay = document.createElement("span");
				spanDelay.innerHTML = ' +' + currentDeparture.delay;
				spanDelay.className = "small delay";
				cellDeparture.appendChild(spanDelay);
			}
			row.appendChild(cellDeparture);

			var cellTransport = document.createElement("td");
			cellTransport.className = "timeinfo";
			var symbolTransportation = document.createElement("span");
			symbolTransportation.className = this.config.iconTable[currentDeparture.transportation];
			cellTransport.appendChild(symbolTransportation);
			row.appendChild(cellTransport);
			
			var cellLine = document.createElement("td");
			cellLine.innerHTML = currentDeparture.lineLabel;
			cellLine.className = "lineinfo";
			row.appendChild(cellLine);
			
			var cellDirection = document.createElement("td");
			cellDirection.innerHTML = currentDeparture.direction;
			row.appendChild(cellDirection);			
		}
		wrapper.appendChild(table);
			

		return wrapper;
	},

	processDepartures: function(data) {
		if (!data.listOfDepartures) {
			return;
		}
		
		this.departures = [];
		
		for (var i in data.listOfDepartures) {
			var t = data.listOfDepartures[i];
			this.departures.push({
				time: (t.time).substring(0,5),
				delay: (((t.time).indexOf('+') > 0) ? (t.time).substring(6,(t.time).length) : 0),
				lineLabel: t.lineLabel,
				direction: t.direction,
				status: t.status,
				statusNote: t.statusNote,
				transportation: t.transportation,
			});
				
		}
		
		return;
	},
	
 	socketNotificationReceived: function(notification, payload) {
    		if (notification === "STARTED") {
				this.updateDom();
			}
			else if (notification === "DATA") {
				this.loaded = true;
				this.processDepartures(JSON.parse(payload));
				this.updateDom();
    		}
	} 	

});
