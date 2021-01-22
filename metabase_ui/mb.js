
module.exports = function(RED) {
    function mb(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            
            var jwt = require("jsonwebtoken");
            var METABASE_SITE_URL = config.url;
            var METABASE_SECRET_KEY = config.token;
	    var expire = config.expire||100;
	    var theme = config.theme||"";
	    var title = config.title||false;
	    var border = config.border||false;	

            var payload = {
		  resource: { dashboard: 1 },
		  params: {},
		  exp: Math.round(Date.now() / 1000) + (expire * 60) // 100 minute expiration
	    };
            var token = jwt.sign(payload, METABASE_SECRET_KEY);

            msg.iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token + "#" +theme +"bordered=" + border +"&titled=" + title;
            
            node.send(msg);
        });
    }
    RED.nodes.registerType("mb",mb);
}
