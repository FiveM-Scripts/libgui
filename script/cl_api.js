let nuiInitialized = false;
let visibleInterfaceId = 0;
let windows = {};

setImmediate(async function()
{
    console.log("[libgui] Initializing...");

    while (GetIsLoadingScreenActive())
        await Wait(1000);
    while (!nuiInitialized)
    {
        console.log("[libgui] Waiting for NUI ping...");
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
 * @param {(Window only) Id of parent window for sub windows to disable input until child window is closed} parentId
 * @returns New Window or Container object
 */
function buildContainer(interfaceId, windowId, height, width, title, parentId)
{
    let isWindow = windowId == -1;
    if (typeof height != "number" || height < 0)
        height = 150;
    if (typeof width != "number" || width < 0)
        width = 400;
    if (typeof title != "string")
        title = "";

    let id = uuidv4();

    if (isWindow)
        windows[id] = { items: {} };

    let container =
    {
        /* Windows only */

        setClosable: function(closable)
        {
            if (isWindow)
                SendNUIMessage({ setWindowClosable: closable, interfaceId: interfaceId, windowId: id });
        },

        setOnClose: function(onClose)
        {
            if (isWindow && typeof onClose == "function")
                windows[id].onClose = onClose;
        },

        isClosed: function()
        {
            if (isWindow)
                return windows[id] == null;
        },

        createContainer: function()
        {
            if (isWindow)
                return buildContainer(interfaceId, id, 0, 0);
        },

        createSubWindow: function(height, width, title)
        {
            if (isWindow)
                return buildContainer(interfaceId, -1, height, width, title, id);
        },

        /* Windows and Containers */

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
        },

        addItemTextField: function(height, width, type)
        {
            return buildWindowItem(interfaceId, isWindow ? id : windowId, 4, { height: height, width: width, type: type }, !isWindow ? id : null);
        }
    }

    if (isWindow)
        SendNUIMessage({ createWindow: id, interfaceId: interfaceId, height: height, width: width, title: title, parentId: parentId ? parentId : false });
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
    windows[windowId].items[id] = {};

    switch (itemType)
    {
        case 1: // Text Item
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
        
        case 2: // Button Item
        if (typeof data.height != "number" || data.height <= 0)
            data.height = 30;
        if (typeof data.width != "number" || data.width <= 0)
            data.width = 75;
        data.text = checkItemText(data.text);
        if (typeof data.onClick == "function")
            windows[windowId].items[id].onClick = data.onClick;

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

        case 3: // Seperator Item
        if (typeof data.height != "number" || data.height < 0)
            data.height = 10;
        if (typeof data.width != "number" || data.width < 0)
            data.width = 10;

        sendData.height = data.height;
        sendData.width = data.width;
        SendNUIMessage(sendData);
        break;

        case 4: // Text Field Item
        /* Types:
            0: Normal
            1: Decimals only
            2: Password (hide actual text)
        */
        if (typeof data.height != "number" || data.height <= 0)
            data.height = 30;
        if (typeof data.width != "number" || data.width <= 0)
            data.width = 150;
        if (typeof data.type != "number" || data.type <= 0)
            data.type = 0;

        let itemTextEntry =
        {

        }

        sendData.height = data.height;
        sendData.width = data.width;
        sendData.type = data.type;
        SendNUIMessage(sendData);
        return itemTextEntry;
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
    if (typeof windows[data.windowId].items[data.itemId].onClick == "function")
        windows[data.windowId].items[data.itemId].onClick();
});

/**
 * Called on window close
 */
RegisterNuiCallbackType("windowClosed")
on("__cfx_nui:windowClosed", function(data)
{
    if (typeof windows[data.windowId].onClose == "function")
        windows[data.windowId].onClose();
    delete windows[data.windowId];
});