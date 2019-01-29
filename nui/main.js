var rootElement;
var documentElement;
var windowElements = [];
var isDraggingWindow = false;
var draggingWindow;
var draggingPrevMousePos;

$(function()
{
    init();
    createWindow("a", "a");
    createWindow("b", "b");
});

function init()
{
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
    });

    rootElement.mouseup(function()
    {
        isDraggingWindow = false;
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

function createWindow(title, content)
{
    var windowElement = $('<div class="window"></div>');
    rootElement.append(windowElement);
    var titleElement = $('<div class="windowtitle"></div>');
    windowElement.append(titleElement);
    titleElement.append('<p class="windowtitletext">' + title + '</p>');
    var titleCloseElement = $('<img class="windowtitleclose" src="assets/close.png"></img>');
    titleElement.append(titleCloseElement);
    var windowTitleSeperatorElement = $('<div class="windowtitleseperator"></div>');
    windowElement.append(windowTitleSeperatorElement);
    var windowContentElement = $('<div id="examplecontent" class="windowcontent">');
    windowElement.append(windowContentElement);
    windowContentElement.append('<p id="exampletext" class="windowtext">' + content + '</p>');

    windowElement.mousedown(function(event)
    {
        var currentMousePos = getMousePos();
        // Check if clicking between window top & title seperator
        if (currentMousePos.y > windowElement.position().top && currentMousePos.y < windowElement.position().top + windowTitleSeperatorElement.position().top)
        {
            isDraggingWindow = true;
            draggingWindow = windowElement;
            draggingPrevMousePos = { x: event.pageX, y: event.pageY };
        }

        focusWindow(windowElement);
    });

    windowElements.push(windowElement);
}

function resetAllWindowsZ()
{
    windowElements.forEach(function(windowElement)
    {
        windowElement.css("z-index", 1);
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