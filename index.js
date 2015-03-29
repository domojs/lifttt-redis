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
        },
        {
            name:"equals",
            fields:[{name:"command", displayName:"The command to run"},{name:"args", displayName:"arguments"}, {name:"value", displayName:"Value to compare"}, {name:"host", displayName:"The redis host"}, {name:"port", displayName:"The redis port"}],
            delegate:function(fields, callback){
                var client=$('../modules/db/node_modules/redis').createClient(fields.port || 6379, fields.host || 'localhost');
                var result=function(){
                    client[fields.command](fields.args, function(err, result){
                        if(err)
                            console.log(err);
                        else if(result==fields.value)
                            callback({value:result});
                    })
                }
                result.fields=fields;
                return result;
            }
        }
    ],
    "actions":
    [
    ]
}; 