/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    var count = 0;
    function HTML(config) {
        count++;
        var id = "nr-db-mb"+count;
        var jwt = require("jsonwebtoken");
        var url = config.url ? config.url : "";
        var METABASE_SECRET_KEY = config.token;
	var expire = config.expire||100;
	var title = config.title||false;
	var theme = config.theme||"";
	var border = config.border||false;
        var allow = "autoplay";
        var origin = "*";
	    
	var pl;
	if (expire != 0) {
		pl = {
		  resource: { dashboard: 1 },
		  params: {},
		  exp: Math.round(Date.now() / 1000) + (expire * 60) //  x minute expiration
	 	};
	} else {
		pl = {
		  resource: { dashboard: 1 },
		  params: {}
	 	};
	}
        
         var token = jwt.sign(pl, METABASE_SECRET_KEY);
         var iframeUrl = url + "/embed/dashboard/" + token + "#" +theme +"bordered=" + border +"&titled=" + title;
         //msg.iframeUrl = iframeUrl;
	 //node.send(msg);
	 var html = String.raw`
<style>.nr-dashboard-ui_metabase { padding:0; }</style>
<div style="width:100%; height:100%; display:inline-block;">
    <iframe id="${id}" src="${iframeUrl}" allow="${allow}" style="width:100%; height:100%; overflow:hidden; border:0; display:block">
        Failed to load Web page
    </iframe>
</div>
`;
        return html;
    }

    var ui = undefined;
    function IFrameNode(config) {
        try {
            var node = this;
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);
            var html = HTML(config);
            var done = ui.addWidget({
                node: node,
                width: config.width,
                height: config.height,
                order: config.order,
                format: html,
                templateScope: "local",
                group: config.group,
                emitOnlyNewValues: false,
                forwardInputMessages: false,
                storeFrontEndInputAsState: false,
                convertBack: function (value) {
                    return value;
                },
                beforeEmit: function(msg, value) {
                    return { msg:msg };
                },
                beforeSend: function (msg, orig) {
                    if (orig) { return orig.msg; }
                },
                initController: function($scope, events) {
                }
            });
        }
        catch (e) {
            console.log(e);
        }
        node.on("close", done);
    }
    RED.nodes.registerType('ui_metabase', IFrameNode);
};
