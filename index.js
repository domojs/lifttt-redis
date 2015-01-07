var clients={};

module.exports={
    name:"redis", 
    "triggers":
    [
        {
            name:"message",
            fields:[{name:"channel", displayName:"The channel to subscribe to"}, {name:"host", displayName:"The redis host"}, {name:"port", displayName:"The redis port"}],
            when:function(fields,callback){
				var client=clients[fields.host+':'+fields.port];
				if(!client)
					clients[fields.host+':'+fields.port]=client=$('../modules/db/node_modules/redis').createClient(fields.port || 6379, fields.host || 'localhost');
                client.on('message', function(channel, message){
                    callback({channel:channel, message:message});
                });
                
                client.subscribe(fields.channel);
                
                process.on('exit', function(){
                    client.unsubscribe();
                    client.end();
                });
            }
        }
    ],
    "actions":
    [
    ]
}; 