/* NODE-RED-CONTRIB-SNAP4CITY-USER
   Copyright (C) 2018 DISIT Lab http://www.disit.org - University of Florence

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as
   published by the Free Software Foundation, either version 3 of the
   License, or (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>. */
module.exports = function (RED) {

    function EventSearchWithinPolygon(config) {
        var s4cUtility = require("./snap4city-utility.js");
        RED.nodes.createNode(this, config);
        var node = this;
        var msgs = [{}, {}];
        node.on('input', function (msg) {
            var uri = "https://www.disit.org/superservicemap/api/v1/events/";
            var range = (msg.payload.range ? msg.payload.range : config.range);
            var polygon = (msg.payload.polygon ? msg.payload.polygon : config.polygon);
            var maxResults = (msg.payload.maxresults ? msg.payload.maxresults : config.maxresults);
            var uid = s4cUtility.retrieveAppID(RED);
            var inPayload = msg.payload;
            var accessToken = "";
            accessToken = s4cUtility.retrieveAccessToken(RED, node, config.authentication, uid);
            var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
            var xmlHttp = new XMLHttpRequest();
            console.log(encodeURI(uri + "?range=" + range + "&selection=wkt:" + polygon + "&maxResults=" + maxResults + "&format=json" + (typeof uid != "undefined" && uid != "" ? "&uid=" + uid : "") + "&appID=iotapp"));
            xmlHttp.open("GET", encodeURI(uri + "?range=" + range + "&selection=wkt:" + polygon + "&maxResults=" + maxResults + "&format=json" + (typeof uid != "undefined" && uid != "" ? "&uid=" + uid : "")  + "&appID=iotapp"), true); // false for synchronous request
            if (typeof accessToken != "undefined" && accessToken != "") {
                xmlHttp.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            }
            xmlHttp.onload = function (e) {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        if (xmlHttp.responseText != "") {
                            var response = JSON.parse(xmlHttp.responseText);
                            if (response["Event"] != null) {
                                var serviceUriArray = [];
                                for (var i = 0; i < response["Event"].features.length; i++) {
                                    serviceUriArray.push(response["Event"].features[i].properties.serviceUri);
                                }
                                msgs[0].payload = serviceUriArray;
                                msgs[1].payload = response;
                            } else {
                                msgs[0].payload = response;
                                msgs[1].payload = response;
                            }
                        } else {
                            msgs[0].payload = JSON.parse("{\"status\": \"error\"}");
                            msgs[1].payload = JSON.parse("{\"status\": \"error\"}");
                        }
                        s4cUtility.eventLog(RED, inPayload, msgs, config, "Node-Red", "ASCAPI", uri, "RX");
                        node.send(msgs);
                    } else {
                        console.error(xmlHttp.statusText);
                        node.error(xmlHttp.responseText);
                    }
                }
            };
            xmlHttp.onerror = function (e) {
                console.error(xmlHttp.statusText);
                node.error(xmlHttp.responseText);
            };
            xmlHttp.send(null);
        });
    }
    RED.nodes.registerType("event-search-within-polygon", EventSearchWithinPolygon);

    RED.httpAdmin.get('/s4c/js/*', function (req, res) {
        var options = {
            root: __dirname + '/lib/js/',
            dotfiles: 'deny'
        };

        res.sendFile(req.params[0], options);
    });

    RED.httpAdmin.get('/s4c/css/*', function (req, res) {
        var options = {
            root: __dirname + '/lib/css/',
            dotfiles: 'deny'
        };

        res.sendFile(req.params[0], options);
    });

    RED.httpAdmin.get('/s4c/json/*', function (req, res) {
        var options = {
            root: __dirname + '/lib/json/',
            dotfiles: 'deny'
        };

        res.sendFile(req.params[0], options);
    });

    RED.httpAdmin.get('/s4c/img/*', function (req, res) {
        var options = {
            root: __dirname + '/lib/img/',
            dotfiles: 'deny'
        };

        res.sendFile(req.params[0], options);
    });
}