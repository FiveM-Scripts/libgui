let nuiInitialized = false;
let onClicks = {};

setImmediate(async function()
{
    while (GetIsLoadingScreenActive())
        await Wait(1000);
    while (!nuiInitialized)
    {
        SendNUIMessage({ ping: true });
        await Wait(2000);
    }

    let interfaceBuilder =
    {
        createInterface: function()
        {
            return buildInterface();
        }
    };

    emit("libgui:init", interfaceBuilder);
    console.log("Initizalized!");
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
    if (typeof height != "number" || height <= 0)
        height = 150;
    if (typeof width != "number" || width <= 0)
        width = 400;
    if (typeof title != "string")
        title = "";

    let id = uuidv4();
    let window =
    {
        setClosable: function(closable)
        {
            SendNUIMessage({ setWindowClosable: closable, interfaceId: interfaceId, windowId: id });
        },

        addItemText: function(text)
        {
            return buildWindowItem(interfaceId, id, 1, { text: text });
        },

        addItemButton: function(height, width, text, onClick)
        {
            return buildWindowItem(interfaceId, id, 2, { height: height, width: width, text: text, onClick: onClick });
        },

        addItemSeperator: function(height, width)
        {
            return buildWindowItem(interfaceId, id, 3, { height: height, width: width });
        }
    }

    SendNUIMessage({ createWindow: id, interfaceId: interfaceId, height: height, width: width, title: title });
    return window;
}

function buildWindowItem(interfaceId, windowId, itemType, data)
{
    let id = uuidv4();
    let sendData = { addWindowItem: itemType, interfaceId: interfaceId, windowId: windowId, itemId: id };

    switch (itemType)
    {
        case 1: // Text item
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
        
        case 2: // Button item
        if (typeof data.height != "number" || data.height <= 0)
            data.height = 25;
        if (typeof data.width != "number" || data.width <= 0)
            data.width = 50;
        data.text = checkItemText(data.text);
        if (typeof data.onClick != "function")
            data.onClick = function() {};

        onClicks[id] = data.onClick;

        let itemButton =
        {
            setText: function(text)
            {
                text = checkItemText(text);
                SendNUIMessage({ setItemText: text, interfaceId: interfaceId, windowId: windowId, itemId: id });
            },

            setDisabled: function(disabled)
            {
                SendNUIMessage({ setItemDisabled: disabled, interfaceId: interfaceId, windowId: windowId, itemId: id });
            }
        }

        sendData.height = data.height;
        sendData.width = data.width;
        sendData.text = data.text;
        SendNUIMessage(sendData);
        return itemButton;

        case 3: // Seperator item
        if (typeof data.height != "number" || data.height <= 0)
            data.height = 10;
        if (typeof data.width != "number" || data.width <= 0)
            data.width = 10;

        sendData.height = data.height;
        sendData.width = data.width;
        SendNUIMessage(sendData);
        break;
    }
}

function checkItemText(text)
{
    if (typeof text != "string")
        text = "";
    
    return text;
}

function showInterface(id)
{
    SendNUIMessage({ showInterface: id });
    SetNuiFocus(true, true);
    TransitionToBlurred(200);
}

RegisterNuiCallbackType("ping")
on("__cfx_nui:ping", function()
{
	nuiInitialized = true;
});

RegisterNuiCallbackType("hide")
on("__cfx_nui:hide", function()
{
	SetNuiFocus(false, false);
    TransitionFromBlurred(200);
});

RegisterNuiCallbackType("onClick")
on("__cfx_nui:onClick", function(data)
{
	onClicks[data.itemId]();
});