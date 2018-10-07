'use strict';

/* Magic Mirror
 * Module: MMM-RNV
 *
 * By Stefan Krause http://yawns.de
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');

module.exports = NodeHelper.create({

	start: function() {
		this.started = false;
		this.config = null;
	},

	getData: function() {
		var self = this;
		
		var currentDate = moment().add(this.config.walkingTimeOffset, 'm').format('YYYY-MM-DD+HH:mm:ss');
		var myUrl = this.config.apiBase + this.config.requestURL + '?hafasID=' + this.config.stationID + '&time=' + currentDate;
		if(this.config.poleIDs != '') {
			myUrl += '&poles=' + this.config.poleIDs;
		}
		
		request({
			url: myUrl,
			method: 'GET',
			headers: { 'RNV_API_TOKEN': this.config.apiKey }
		}, function (error, response, body) {
			
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA", body);
			}
		});

		setTimeout(function() { self.getData(); }, this.config.refreshInterval);
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'CONFIG' && self.started == false) {
			self.config = payload;
			self.sendSocketNotification("STARTED", true);
			self.getData();
			self.started = true;
		}
	}
});
