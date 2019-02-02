let rootElement;
let documentElement;

let interfaces = {};
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

function init()
{
    isDraggingWindow = false;
    hasDraggedWindow = false;
    rootElement = $("#root");
    documentElement = $(document);

    window.addEventListener("message", function(event)
    {
        let data = event.data;

        if (data.showInterface)
        {
            showInterface(data.showInterface);
        }
        else if (data.createInterface)
        {
            interfaces[data.createInterface] = { windows: {} };
            console.log("Created interface with id " + data.createInterface);
        }
        else if (data.createWindow)
        {
            interfaces[data.interfaceId].windows[data.createWindow] =
            {
                elementData: createWindowElement(data.interfaceId, data.createWindow, data.height, data.width, data.title, data.content)
            };
            console.log("Created window with id " + data.createWindow + " (dimensions: " + data.height + " " + data.width + ")");
        }
    });

    documentElement.keyup(function(event)
    {
        if (event.which == 27) // ESC
            hideInterface();
    });

    rootElement.mouseup(function(event)
    {
        if (isDraggingWindow)
        {
            isDraggingWindow = false;
            hasDraggedWindow = false;
        }
        else if (event.target == this) // Close on click anywhere
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

function showInterface(interfaceId)
{
    hideAllVisibleWindows();

    rootElement.show();
    Object.values(interfaces[interfaceId].windows).forEach(function(window)
    {
        window.elementData.windowElement.show();
        visibleWindows.push(window);
    })
}

function hideInterface()
{
    hideAllVisibleWindows();
    
    rootElement.hide();
    sendData("hide");
}

function hideAllVisibleWindows()
{
    visibleWindows.forEach(function(window, index)
    {
        window.elementData.windowElement.hide();
        visibleWindows.splice(index, 1);
    });
}

function createWindowElement(interfaceId, windowId, height, width, title, content)
{
    if (typeof height != "number" || height < 0)
        height = 150;
    if (typeof width != "number" || width < 0)
        width = 400;
    if (typeof title != "string" || !title)
        title = "";
    if (typeof content != "object" || !content)
        content = [];

    let windowElement = $("<div class='window'></div>");
    windowElement.height(height);
    windowElement.width(width);
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
    content.forEach(function(element)
    {
        windowContentElement.append(element);
    });

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

        interfaces[interfaceId].windows[windowId] = null;
    });

    return windowData;
}

function resetAllWindowsZ()
{
    visibleWindows.forEach(function(window)
    {
        window.elementData.windowElement.css("z-index", 1);
    });
}

function focusWindow(windowElement)
{
    resetAllWindowsZ();
    windowElement.css("z-index", 2);
}

function sendData(name, data = {})
{
    $.post("http://libgui/" + name, JSON.stringify(data));
}

function getMousePos()
{
    return { x: event.pageX, y: event.pageY };
}