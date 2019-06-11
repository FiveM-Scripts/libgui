let rootElement;
let documentElement;

let interfaces = {};
let visibleInterfaceId = 0;
let visibleWindows = [];

let isDraggingWindow;
let hasDraggedWindow;
let draggingWindow;
let draggingPrevMousePos;

$(function()
{
    init();
    hideInterface();
});

/**
 * Sets everything up
 */
function init()
{
    isDraggingWindow = false;
    hasDraggedWindow = false;
    rootElement = $("#root");
    documentElement = $(document);

    window.addEventListener("message", function(event)
    {
        let data = event.data;

        if (data.ping)
            sendData("ping");
        if (data.showInterface)
            showInterface(data.showInterface);
        else if (data.createInterface)
        {
            interfaces[data.createInterface] = { windows: {}, closable: true };
            console.log("Created interface with id " + data.createInterface);
        }
        else if (data.setInterfaceClosable)
            interfaces[data.interfaceId].closable = data.state;
        else if (data.createWindow)
        {
            interfaces[data.interfaceId].windows[data.createWindow] =
            {
                elementData: createWindowElement(data.interfaceId, data.createWindow, data.width, data.height, data.title, data.parentId),
                items: {},
                containers: {}
            };
            console.log("Created window with id " + data.createWindow + " (dimensions: " + data.width + " " + data.height + ")");
        }
        else if (data.createContainer)
        {
            let window = interfaces[data.interfaceId].windows[data.windowId];
            if (!window)
                return;

            let containerElement = $("<div class='windowitemcontainer'></div>");
            window.elementData.windowContentElement.append(containerElement);
            window.containers[data.createContainer] = containerElement;
            console.log("Created container with id " + data.createContainer + " inside window with id " + data.windowId);
        }
        else if (data.addWindowItem)
            createWindowItem(data);
        else if (data.setItemText)
        {
            let window = interfaces[data.interfaceId].windows[data.windowId];
            if (window)
            {
                if (data.isTextField)
                    window.items[data.itemId].val(data.setItemText);
                else
                    window.items[data.itemId].text(data.setItemText);
            }
        }
        else if (data.setWindowClosable != null) // false shoud be allowed too
        {
            let window = interfaces[data.interfaceId].windows[data.windowId];
            if (!window)
                return;
            
            let closeElement = window.elementData.titleCloseElement;
            data.setWindowClosable ? closeElement.show() : closeElement.hide();
        }
        else if (data.setItemDisabled != null)
        {
            let window = interfaces[data.interfaceId].windows[data.windowId];
            if (window)
                window.items[data.itemId].prop("disabled", data.setItemDisabled);
        }
    });

    documentElement.keyup(function(event)
    {
        if (event.which == 27 && interfaces[visibleInterfaceId].closable) // ESC
            hideInterface();
    });

    rootElement.mouseup(function(event)
    {
        if (isDraggingWindow)
        {
            isDraggingWindow = false;
            hasDraggedWindow = false;
        }
        else if (event.target == this && interfaces[visibleInterfaceId].closable) // Close on click anywhere
            hideInterface();
    });

    rootElement.mousemove(function(event)
    {
        if (!isDraggingWindow)
            return;

        var currentMousePos = getMousePos();
        var currentWindowPos = draggingWindow.position();
        
        draggingWindow.css({ left: currentWindowPos.left + (currentMousePos.x - draggingPrevMousePos.x),
            top: currentWindowPos.top + (currentMousePos.y - draggingPrevMousePos.y) });
        
        draggingPrevMousePos = currentMousePos;
        hasDraggedWindow = true;
    });
}

/**
 * Takes care of appending a created item element to window correctly (also takes containers in consideration)
 * @param {Item element to append} itemElement 
 * @param {Passed data object} data 
 */
function appendItemToWindow(itemElement, data)
{
    let window = interfaces[data.interfaceId].windows[data.windowId];
    if (!window)
        return;
    
    if (data.containerId)
        window.containers[data.containerId].append(itemElement);
    else
        window.elementData.windowContentElement.append(itemElement);
    
    window.items[data.itemId] = itemElement;
}

/**
 * Displays an interface
 * @param {Id of interface} interfaceId 
 */
function showInterface(interfaceId)
{
    hideAllVisibleWindows();

    rootElement.show();
    visibleInterfaceId = interfaceId;
    Object.values(interfaces[interfaceId].windows).forEach(function(window)
    {
        window.elementData.windowElement.show();
        visibleWindows.push(window);
    })
}

/**
 * Hides currently active interface
 */
function hideInterface()
{
    hideAllVisibleWindows();
    
    rootElement.hide();
    sendData("hide");
}

/**
 * Hides all windows inside active interface
 */
function hideAllVisibleWindows()
{
    visibleInterfaceId = 0;
    visibleWindows.forEach(function(window, index)
    {
        window.elementData.windowElement.hide();
        visibleWindows.splice(index, 1);
    });
}

/**
 * Creates a new window element
 * @param {Id of interface} interfaceId 
 * @param {Id to use for window} windowId 
 * @param {Width of window} width 
 * @param {Height of window} height 
 * @param {Title of window} title 
 * @param {Id of parent window for sub windows} parentId 
 * @returns Object containing window element data
 */
function createWindowElement(interfaceId, windowId, width, height, title, parentId)
{
    if (typeof width != "number" || width < 0)
        width = 400;
    if (typeof height != "number" || height < 0)
        height = 150;
    if (typeof title != "string" || !title)
        title = "";

    let windowElement = $("<div class='window'></div>");
    windowElement.width(width);
    windowElement.height(height);
    rootElement.append(windowElement);
    let titleElement = $("<div class='windowtitle'></div>");
    windowElement.append(titleElement);
    let titleTextElement = $("<p class='windowtitletext'>" + title + "</p>");
    titleElement.append(titleTextElement);
    let titleCloseElement = $("<div class='windowtitleclose'></div>");
    titleElement.append(titleCloseElement);
    let titleCloseImgElement = $("<img class='windowtitlecloseimg' src='assets/close.png'></img>");
    titleCloseElement.append(titleCloseImgElement);
    let windowTitleSeperatorElement = $("<div class='windowtitleseperator'></div>");
    windowElement.append(windowTitleSeperatorElement);
    let windowContentElement = $("<div class='windowcontent'>");
    windowElement.append(windowContentElement);

    let windowData =
    {
        windowElement: windowElement,
        titleElement: titleElement,
        titleTextElement: titleTextElement,
        titleCloseElement: titleCloseElement,
        titleCloseImgElement: titleCloseImgElement,
        windowTitleSeperatorElement: windowTitleSeperatorElement,
        windowContentElement: windowContentElement,
    };

    windowElement.mousedown(function(event)
    {
        let currentMousePos = getMousePos();
        // Check if clicking between window top & title seperator
        if (currentMousePos.y > windowElement.position().top && currentMousePos.y < windowElement.position().top + windowTitleSeperatorElement.position().top)
        {
            isDraggingWindow = true;
            hasDraggedWindow = false;
            draggingWindow = windowElement;
            draggingPrevMousePos = { x: event.pageX, y: event.pageY };
        }

        focusWindow(windowElement);
    });

    titleCloseElement.mouseup(function(event)
    {
        if (hasDraggedWindow || event.which != 1 /* Left click only */)
            return;

        windowElement.fadeOut(250, function()
        {
            windowElement.remove();
        });

        if (parentId)
            interfaces[interfaceId].windows[parentId].elementData.windowElement.attr("disabled", false);

        sendData("windowClosed", { interfaceId: interfaceId, windowId: windowId });

        // Remove from visibleWindows array by finding window object first
        if (visibleWindows.length == 1)
            visibleWindows.splice(0, 1);
        else
            visibleWindows.forEach(function(window, index)
            {
                if (interfaces[interfaceId].windows[windowId].windowData == window.windowData)
                    visibleWindows.splice(index, 1);
            });

        delete interfaces[interfaceId].windows[windowId];

        console.log("Closed window with id " + windowId);

        if (visibleWindows.length == 0)
            hideInterface();
    });

    let windowSize = { width: windowElement.width(), height: windowElement.height() };

    // Automatic window placement
    let finalPos = {};
    if (parentId)
    {
        let parentWindowElement = interfaces[interfaceId].windows[parentId].elementData.windowElement;
        parentWindowElement.attr("disabled", true);
        
        let parentWindowPos = parentWindowElement.position();
        let parentWindowSize = { width: parentWindowElement.width(), height: parentWindowElement.height() };
        finalPos =
        {
            x: (parentWindowPos.left + parentWindowSize.width / 2) - windowSize.width / 2,
            y: (parentWindowPos.top + parentWindowSize.height / 2) - windowSize.height / 2
        };
    }
    else
    {
        let rootElementSize = { width: rootElement.width(), height: rootElement.height() };
        let rootCenterPos = { x: rootElementSize.width / 2 - windowSize.width / 2, y: rootElementSize.height / 2 - windowSize.height / 2 };
        let maxOffset = { x: rootElementSize.width / 5, y: rootElementSize.height / 5 };
        finalPos =
        {
            x: rootCenterPos.x + randInt(-maxOffset.x, maxOffset.x),
            y: rootCenterPos.y + randInt(-maxOffset.y, maxOffset.y)
        };
    }
    windowElement.css("left", finalPos.x);
    windowElement.css("top", finalPos.y);

    if (interfaceId == visibleInterfaceId)
        focusWindow(windowElement);
    else
        windowElement.hide();
    
    return windowData;
}

/**
 * Creates a new item inside a window
 * @param {*} data 
 */
function createWindowItem(data)
{
    let window = interfaces[data.interfaceId].windows[data.windowId];
    if (!window)
        return;

    switch (data.addWindowItem)
    {
    case 1: // Text Item
    let textItemElement = $("<p>" + data.text + "</p>");
    if (data.textSize)
        textItemElement.css("font-size", data.textSize + "px");
    appendItemToWindow(textItemElement, data);
    console.log("Added text item with id " + data.itemId + " to window with id " + data.windowId);
    break;

    case 2: // Button Item
    let buttonItemElement = $("<button>" + data.text + "</button>");
    buttonItemElement.width(data.width);
    buttonItemElement.height(data.height);
    buttonItemElement.click(function()
    {
        console.log("Clicked button id " + data.itemId);
        sendData("onClick", { windowId: data.windowId, itemId: data.itemId });
    });
    appendItemToWindow(buttonItemElement, data);
    console.log("Added button item with id " + data.itemId + " to window with id " + data.windowId);
    break;

    case 3: // Seperator Item
    let seperatorItemElement = $("<div></div>");
    seperatorItemElement.width(data.width);
    seperatorItemElement.height(data.height);
    appendItemToWindow(seperatorItemElement, data);
    console.log("Added seperator item with id " + data.itemId + " to window with id " + data.windowId);
    break;

    case 4: // Text Field Item
    let inputItemElementBuilder = "<input spellcheck='false' ";
    if (data.type == 1)
        inputItemElementBuilder += "type='number'";
    else if (data.type == 2)
        inputItemElementBuilder += "type='password'";
    let inputItemElement = $(inputItemElementBuilder + "></input>");
    inputItemElement.width(data.width);
    inputItemElement.height(data.height);
    inputItemElement.change(function()
    {
        sendData("textFieldEvent", { event: 1, windowId: data.windowId, itemId: data.itemId, text: inputItemElement.val().trim() });
    });
    inputItemElement.keypress(function(event)
    {
        if (event.which == 13) // Enter
            sendData("textFieldEvent", { event: 2, windowId: data.windowId, itemId: data.itemId });
    });
    appendItemToWindow(inputItemElement, data);
    console.log("Added text field item with id " + data.itemId + " to window with id " + data.windowId);
    }
}

/**
 * Sets z-index of all active windows to 1
 */
function resetAllWindowsZ()
{
    visibleWindows.forEach(function(window)
    {
        window.elementData.windowElement.css("z-index", 1);
    });
}

/**
 * Focuses a specific window by setting its z-index to 2
 * @param {Window element to focus} windowElement 
 */
function focusWindow(windowElement)
{
    resetAllWindowsZ();
    windowElement.css("z-index", 2);
}

/**
 * Sends data back to script
 * @param {Name of post} name 
 * @param {Data to send} data 
 */
function sendData(name, data = {})
{
    $.post("http://libgui/" + name, JSON.stringify(data));
}

/**
 * Retrieves current position of mouse cursor
 * @returns Object containing x and y coordinates of mouse cursor
 */
function getMousePos()
{
    return { x: event.pageX, y: event.pageY };
}

/**
 * Returns a random integer between min and max (both inclusive)
 * @param {*} min 
 * @param {*} max
 */
function randInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}