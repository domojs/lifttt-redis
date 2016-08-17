var clients={};
var debug=$('debug')('ifttt:redis');

var checker=function(port, host)
{
    var client=$('../modules/db/node_modules/redis').createClient(port || 6379, host || 'localhost');
    return function(command, args, callback)
    {
        client[command](args, function(err, result){
            debug(command, args, ':', result);
            if(err)
                debug(err);
            else
                callback(result);
        });
    };
};

var compare=function(operator, result, value){
    switch(operator)
    {
        case '>=':
            return result>=value;
        case '<=':
            return result<=value;
        case '>':
            return result>value;
        case '<':
            return result<value;
        case '!=':
            return result!=value;
        case '=':
        default:
            return result==value;
    }
};

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
var f=checker(fields.port, fields.host);
                var oldResult=false;
                var c=function(){
                    f(fields.command, fields.args, function(result){
                        var comparison=compare('=', result, fields.value);
                        if(!oldResult && comparison)
                        {
                            oldResult=comparison;
                            debug(oldResult);
                            callback({value:result});
                        }
                        else if(!comparison)
                            oldResult=false;
                    });
                };
                c();
                setInterval(c, fields.poll);
            }
        },
        {
            name:"compare",
            fields:[{name:"command", displayName:"The command to run"}, {name:"args", displayName:"arguments"},{name:"operator", displayName:"Operator"}, {name:"poll", displayName:"Polling interval"}, {name:"value", displayName:"Value to compare"}, {name:"host", displayName:"The redis host"}, {name:"port", displayName:"The redis port"}],
            when:function(fields, callback){
                var f=checker(fields.port, fields.host);
                var oldResult=false;
                var c=function(){
                    f(fields.command, fields.args, function(result){
                        var comparison=compare(fields.operator, result, fields.value);
                        if(!oldResult && comparison)
                        {
                            oldResult=comparison;
                            debug(oldResult);
                            callback({value:result});
                        }
                        else if(!comparison)
                            oldResult=false;
                    });
                };
                c();
                setInterval(c, fields.poll);
            }
        }
    ],
    "conditions":[
    {
        name:"compare",
        fields:[{name:"command", displayName:"The command to run"}, {name:"args", displayName:"arguments"},{name:"operator", displayName:"Operator"}, {name:"poll", displayName:"Polling interval"}, {name:"value", displayName:"Value to compare"}, {name:"host", displayName:"The redis host"}, {name:"port", displayName:"The redis port"}],
        evaluate:function(fields)
        {
            var f=checker(fields.port, fields.host);
            return function(triggerFields, callback){
                f(fields.command, fields.args, function(result){
                    callback(compare(fields.operator, result, fields.value));
                });
            }
        }
    }],
    "actions":
    [
        {
            name:"exec",
            fields:[{name:"command", displayName:"The command to run"}, {name:"args", displayName:"arguments"}, {name:"host", displayName:"The redis host"}, {name:"port", displayName:"The redis port"}],
            when:function(fields){
                var client=$('../modules/db/node_modules/redis').createClient(fields.port || 6379, fields.host || 'localhost');
                client[fields.command](fields.args, function(err, result){
                    if(err)
                        debug(err);
                    else
                        debug(result);
                });
            }
        }
    ]
}; 