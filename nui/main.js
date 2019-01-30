var rootElement;
var documentElement;
var windows;
var isDraggingWindow;
var hasDraggedWindow;
var draggingWindow;
var draggingPrevMousePos;

$(function()
{
    init();
    createWindow(-1, -1, "Hello", "I'm a Mac");
    createWindow(500, 500, "Hi", "I'm a PC");
    createWindow(200, 600, "Good Day", "My name is Clippy");
    createWindow(100, 250, "You have spam mail!", "null");
});

function init()
{
    windows = [];
    isDraggingWindow = false;
    hasDraggedWindow = false;
    rootElement = $("#root");
    documentElement = $(document);

    window.addEventListener("message", function(event)
    {
        if (event.data.show)
            focus();
    });

    documentElement.keyup(function(event)
    {
        if (event.which == 116) // F5
            unfocus();
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

    rootElement.mouseup(function()
    {
        isDraggingWindow = false;
        hasDraggedWindow = false;
    });

    unfocus();
}

function unfocus()
{
    rootElement.hide();
    sendData("hide");
}

function focus()
{
    rootElement.show();
}

function createWindow(height, width, title, content)
{
    if (height < 0)
        height = 150;
    if (width < 0)
        width = 400;
    if (!title)
        title = "null";
    if (!content)
        content = "null";

    var windowElement = $("<div class='window'></div>");
    windowElement.height(height);
    windowElement.width(width);
    rootElement.append(windowElement);
    var titleElement = $("<div class='windowtitle'></div>");
    windowElement.append(titleElement);
    var titleTextElement = $("<p class='windowtitletext'>" + title + "</p>");
    titleElement.append(titleTextElement);
    var titleCloseElement = $("<div class='windowtitleclose'></div>");
    titleElement.append(titleCloseElement);
    var titleCloseImgElement = $("<img class='windowtitlecloseimg' src='assets/close.png'></img>");
    titleCloseElement.append(titleCloseImgElement);
    var windowTitleSeperatorElement = $("<div class='windowtitleseperator'></div>");
    windowElement.append(windowTitleSeperatorElement);
    var windowContentElement = $("<div class='windowcontent'>");
    windowElement.append(windowContentElement);
    var windowContentTextElement = $("<p class='windowtext'>" + content + "</p>");
    windowContentElement.append(windowContentTextElement);

    var windowData = {
        windowElement: windowElement,
        titleElement: titleElement,
        titleTextElement: titleTextElement,
        titleCloseElement: titleCloseElement,
        titleCloseImgElement: titleCloseImgElement,
        windowTitleSeperatorElement: windowTitleSeperatorElement,
        windowContentElement: windowContentElement,
        windowContentTextElement: windowContentTextElement
    };

    windowElement.mousedown(function(event)
    {
        var currentMousePos = getMousePos();
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
        var index = windows.indexOf(windowData);
        if (index > -1)
            windows.splice(index, 1);
    });

    windows.push(windowData);
}

function resetAllWindowsZ()
{
    windows.forEach(function(window)
    {
        window.windowElement.css("z-index", 1);
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