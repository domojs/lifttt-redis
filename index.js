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
            fields:[{name:"command", displayName:"The command to run"}, {name:"args", displayName:"arguments"}, {name:"poll", displayName:"Polling interval"}, {name:"value", displayName:"Value to compare"}, {name:"host", displayName:"The redis host"}, {name:"port", displayName:"The redis port"}],
            when:function(fields, callback){
                var client=$('../modules/db/node_modules/redis').createClient(fields.port || 6379, fields.host || 'localhost');
                var checker=function(){
                    client[fields.command](fields.args, function(err, result){
                        //console.log(fields.command, fields.args, ':', result);
                        if(err)
                            console.log(err);
                        else if(result==fields.value)
                            callback({value:result});
                    })
                };
                checker();
                setInterval(checker, fields.poll);
            }
        },
        {
            name:"compare",
            fields:[{name:"command", displayName:"The command to run"}, {name:"args", displayName:"arguments"},{name:"operator", displayName:"Operator"}, {name:"poll", displayName:"Polling interval"}, {name:"value", displayName:"Value to compare"}, {name:"host", displayName:"The redis host"}, {name:"port", displayName:"The redis port"}],
            when:function(fields, callback){
                var client=$('../modules/db/node_modules/redis').createClient(fields.port || 6379, fields.host || 'localhost');
                var oldResult=false;
                var checker=function(){
                    client[fields.command](fields.args, function(err, result){
                        console.log(fields.command, fields.args, ':', result, fields.operator, fields.value);
                        if(err)
                            console.log(err);
                        else
                        {
                            switch(fields.operator)
                            {
                                case '>=':
                                    if(!oldResult && result>=fields.value)
                                    {
                                        oldResult=true;
                                        console.log('true')
                                        callback({value:result});
                                    }
                                    else if(result<fields.value)
                                        oldResult=false;
                                    break;                                    
                                case '<=':
                                    if(!oldResult && result<=fields.value)
                                    {
                                        oldResult=true;
                                        console.log('true')
                                        callback({value:result});
                                    }
                                    else if(result>fields.value)
                                        oldResult=false;
                                    break;                                    
                                case '>':
                                    if(!oldResult && result>fields.value)
                                    {
                                        oldResult=true;
                                        console.log('true')
                                        callback({value:result});
                                    }
                                    else if(result<=fields.value)
                                        oldResult=false;
                                    break;                                    
                                case '<':
                                    if(!oldResult && result<fields.value)
                                    {
                                        oldResult=true;
                                        console.log('true')
                                        callback({value:result});
                                    }
                                    else if(result>=fields.value)
                                        oldResult=false;
                                    break;                                    
                                case '!=':
                                    if(!oldResult && result!=fields.value)
                                    {
                                        oldResult=true;
                                        console.log('true')
                                        callback({value:result});
                                    }
                                    else if(result==fields.value)
                                        oldResult=false;
                                    break;                                    
                                case '=':
                                default:
                                    if(!oldResult && result==fields.value)
                                    {
                                        oldresult=true;
                                        console.log('true')
                                        callback({value:result});
                                    }
                                    else if(result!=fields.value)
                                        oldResult=false;
                                    break;                                    
                            }
                        }
                    })
                };
                checker();
                setInterval(checker, fields.poll);
            }
        }
    ],
    "actions":
    [
        {
            name:"exec",
            fields:[{name:"command", displayName:"The command to run"}, {name:"args", displayName:"arguments"}, {name:"host", displayName:"The redis host"}, {name:"port", displayName:"The redis port"}],
            when:function(fields){
                var client=$('../modules/db/node_modules/redis').createClient(fields.port || 6379, fields.host || 'localhost');
                client[fields.command](fields.args, function(err, result){
                    
                });
            }
        }
    ]
}; 