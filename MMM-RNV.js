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
		refreshInterval: 1000 * 60, //refresh every minute
		updateInterval: 1000 * 3600, //update every hour
		timeFormat: config.timeFormat,
		lang: config.language,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,

		apiBase: 'http://rnv.the-agent-factory.de:8080/easygo2/api',
		requestURL: '/regions/rnv/modules/stationmonitor/element',
		stationID: '',
		poleIDs: '',
		walkingTimeOffset: 0,
		numberOfShownDepartures: 10,
		showZeroDelay: false,

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
			wrapper.innerHTML = "No RNV <i>apiKey</i> set in config file.";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.stationID === "") {
			wrapper.innerHTML = "No RNV <i>stationID</i> set in config file.";
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
		table.id = "rnvtable";
		table.className = "small thin light";

		var row = document.createElement("tr");

		var timeHeader = document.createElement("th");
		timeHeader.innerHTML = "Abfahrt";
		timeHeader.className = "rnvheader";
		row.appendChild(timeHeader);
		var lineHeader = document.createElement("th");
		lineHeader.innerHTML = "Linie";
		lineHeader.className = "rnvheader";
		lineHeader.colSpan = 2;
		row.appendChild(lineHeader);
		var destinationHeader = document.createElement("th");
		destinationHeader.innerHTML = "Fahrtrichtung";
		destinationHeader.className = "rnvheader";
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
			} else if(currentDeparture.connectionIsLive && this.config.showZeroDelay) {
				var spanDelay = document.createElement("span");
				spanDelay.innerHTML = ' +' + currentDeparture.delay;
				spanDelay.className = "small nodelay";
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
			cellDirection.className = "destinationinfo";
			row.appendChild(cellDirection);
		}
		wrapper.appendChild(table);

		if (this.ticker) {
			var marqueeTicker = document.createElement("marquee");
			marqueeTicker.innerHTML = this.ticker;
			marqueeTicker.className = "small thin light";
			marqueeTicker.width = document.getElementsByClassName("module MMM-RNV MMM-RNV")[0].offsetWidth;
			wrapper.appendChild(marqueeTicker);
		}

		return wrapper;
	},

	processDepartures: function(data) {
		if (!data.listOfDepartures) {
			return;
		}

		this.departures = [];
		this.ticker = data.ticker;
		var iterations = 0;

		for (var i in data.listOfDepartures) {
			if(iterations == this.config.numberOfShownDepartures && this.config.numberOfShownDepartures > 0 && this.config.numberOfShownDepartures <= 10 ){
				break;
			}
			var t = data.listOfDepartures[i];
			var delay = 0; // delay of the trasportation
			var departure = 0; // departure time of the transportation
			var connectionIsLive = false;
			var now = moment();

			if((t.time).includes('+')) { // if connection already started (showing delay, could be 0 as well)
				connectionIsLive = true;
				delay = (t.time).substring((t.time).indexOf('+') + 1, (t.time).length); // parse delay
				t.time = (t.time).substring(0, (t.time).indexOf('+')); // cut off the delay
			}

			departure = moment(t.time, ["HH:mm", "DD.MM.YYYY HH:mm"]);
			d1 = departure.clone(); // workaround because if-condition changes var departure (adds the delay) for unknown reason
			if(moment.duration(d1.add(delay, 'm').diff(now)).as('minutes') <= this.config.walkingTimeOffset) {
				continue; // skip this entry if transport is not reachable in time: (departure + delay - now) <= walkingTimeOffset)
			}

			this.departures.push({
				time: departure.format('HH:mm'),
				delay: delay,
				lineLabel: t.lineLabel,
				direction: t.direction,
				status: t.status,
				statusNote: t.statusNote,
				transportation: t.transportation,
				connectionIsLive: connectionIsLive,
			});

			iterations++;
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
