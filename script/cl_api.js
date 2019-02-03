let nuiInitialized = false;
let visibleInterfaceId = 0;
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

/**
 * Creates a new interface to create windows in
 * @returns New interface
 */
function buildInterface()
{
    let id = uuidv4();
    let interface =
    {
        show: function()
        {
            showInterface(id);
        },

        isVisible: function()
        {
            return visibleInterfaceId == id;
        },

        createWindow: function(height, width, title)
        {
            return buildContainer(id, -1, height, width, title);
        }
    };

    SendNUIMessage({ createInterface: id });
    return interface;
}

/**
 * Creates either a new window or a container inside a window
 * @param {Id of interface} interfaceId
 * @param {Id of window to create container in, set to -1 to create window instead} windowId
 * @param {Specified height} height 
 * @param {Specified width} width 
 * @param {Title of new window, ignore if creating container} title
 * @returns New Window or Container object
 */
function buildContainer(interfaceId, windowId, height, width, title)
{
    let isWindow = typeof windowId == "number";
    if (typeof height != "number" || height < 0)
        height = 150;
    if (typeof width != "number" || width < 0)
        width = 400;
    if (typeof title != "string")
        title = "";

    let id = uuidv4();
    let container =
    {
        // Only for windows
        setClosable: function(closable)
        {
            if (isWindow)
                SendNUIMessage({ setWindowClosable: closable, interfaceId: interfaceId, windowId: id });
        },

        // Also only for windows
        createContainer: function()
        {
            if (isWindow)
                return buildContainer(interfaceId, id, 0, 0);
        },

        addItemText: function(text)
        {
            return buildWindowItem(interfaceId, isWindow ? id : windowId, 1, { text: text }, !isWindow ? id : null);
        },

        addItemButton: function(height, width, text, onClick)
        {
            return buildWindowItem(interfaceId, isWindow ? id : windowId, 2, { height: height, width: width, text: text, onClick: onClick }, !isWindow ? id : null);
        },

        addItemSeperator: function(height, width)
        {
            return buildWindowItem(interfaceId, isWindow ? id : windowId, 3, { height: height, width: width }, !isWindow ? id : null);
        }
    }

    if (isWindow)
        SendNUIMessage({ createWindow: id, interfaceId: interfaceId, height: height, width: width, title: title });
    else
        SendNUIMessage({ createContainer: id, interfaceId: interfaceId, windowId: windowId, height: height, width: width, title: title });
    return container;
}

/**
 * Creates a new item inside window
 * @param {Id of interface} interfaceId 
 * @param {Id of window} windowId 
 * @param {Type of item} itemType 
 * @param {Data object according to specified item type} data 
 * @param {(Optional) Specify container id to create item in, leave empty to ignore} containerId 
 * @returns Newly created item (depending on item type)
 */
function buildWindowItem(interfaceId, windowId, itemType, data, containerId)
{
    let id = uuidv4();
    let sendData = { addWindowItem: itemType, interfaceId: interfaceId, windowId: windowId, itemId: id, containerId: containerId };

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
        if (typeof data.height != "number" || data.height < 0)
            data.height = 10;
        if (typeof data.width != "number" || data.width < 0)
            data.width = 10;

        sendData.height = data.height;
        sendData.width = data.width;
        SendNUIMessage(sendData);
        break;
    }
}

/**
 * Checks if string is appropriate for item and corrects it if needed
 * @param {String to check} text
 * @returns Safe to use string
 */
function checkItemText(text)
{
    if (typeof text != "string")
        text = "";
    
    return text;
}

/**
 * Displays specified interface
 * @param {Id of interface} id 
 */
function showInterface(id)
{
    SendNUIMessage({ showInterface: id });
    SetNuiFocus(true, true);
    TransitionToBlurred(200);
    visibleInterfaceId = id;
}

/**
 * Used initially to ensure NUI side was initialized properly
 */
RegisterNuiCallbackType("ping")
on("__cfx_nui:ping", function()
{
	nuiInitialized = true;
});

/**
 * Listen to hide callback to stop focus
 */
RegisterNuiCallbackType("hide")
on("__cfx_nui:hide", function()
{
	SetNuiFocus(false, false);
    TransitionFromBlurred(200);
    visibleInterfaceId = 0;
});

/**
 * Called on click of an window item
 */
RegisterNuiCallbackType("onClick")
on("__cfx_nui:onClick", function(data)
{
	onClicks[data.itemId]();
});