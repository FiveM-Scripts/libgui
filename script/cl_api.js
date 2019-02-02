let interfaces = [];

setImmediate(function()
{
    let interfaceBuilder =
    {
        createInterface: function()
        {
            return buildInterface();
        }
    };

    do
    {
        Wait(2000);
    }
    while (!NetworkIsSessionStarted() || GetIsLoadingScreenActive());

    emit("libgui:init", interfaceBuilder);
});

function buildInterface()
{
    let id = uuidv4();
    let interface =
    {
        show: function()
        {
            showInterface(id);
        },

        createWindow: function(height, width, title)
        {
            return buildWindow(id, height, width, title);
        }
    };

    SendNUIMessage({ createInterface: id });
    return interface;
}

function buildWindow(interfaceId, height, width, title)
{
    if (typeof height != "number")
        height = 150;
    if (typeof width != "number")
        width = 400;
    if (typeof title != "string")
        title = "";

    let id = uuidv4();
    let window =
    {
        addItemText: function(text)
        {
            return buildWindowItem(interfaceId, id, 1, { text: text });
        }
    }

    SendNUIMessage({ createWindow: id, interfaceId: interfaceId, height: height, width: width, title: title });
    return window;
}

function buildWindowItem(interfaceId, windowId, itemType, data)
{
    let id = uuidv4();
    let sendData = { addWindowItem: itemType, interfaceId: interfaceId, windowId: windowId, itemId: id };

    if (itemType == 1) // Text item
    {
        data.text = checkItemText(data.text);
        
        let itemText =
        {
            setText: function(text)
            {
                text = checkItemText(text);

                SendNUIMessage({ setItemText: text, interfaceId: interfaceId, windowId: windowId, itemId: id });
            }
        }

        sendData.text = data.text;
        SendNUIMessage(sendData);
        return itemText;
    }
}

function checkItemText(text)
{
    if (typeof text != "string")
        text = "<br></br>"; // New line by default
    
    return text;
}

function showInterface(id)
{
    SendNUIMessage({ showInterface: id });
    SetNuiFocus(true, true);
    TransitionToBlurred(200);
}

RegisterNuiCallbackType("hide")
on("__cfx_nui:hide", function()
{
	SetNuiFocus(false, false);
    TransitionFromBlurred(200);
});