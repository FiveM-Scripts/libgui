function uuidv4()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
    {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

function SendNUIMessage(data)
{
    SendNuiMessage(JSON.stringify(data));
}

function Wait (ms)
{
    return new Promise(function(res)
    {
        setTimeout(res, ms)
    });
}