var rootElement;
var documentElement;
const windows = [];
var isDraggingWindow;
var hasDraggedWindow;
var draggingWindow;
var draggingPrevMousePos;

$(function()
{
    init();
    unfocus();
    createWindow(-1, -1, null, [ "<p>Hi Dorifto</p>", "<p>Bye Dorifto</p>" ]);
    /*createWindow(500, 500, "Hi", "I'm a PC");
    createWindow(200, 600, "Good Day", "My name is Clippy");
    createWindow(100, 250, "You have spam mail!", "null");*/
});

function init()
{
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
        if (event.which == 27) // ESC
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

    rootElement.mouseup(function(event)
    {
        if (isDraggingWindow)
        {
            isDraggingWindow = false;
            hasDraggedWindow = false;
        }
        else if (event.target == this) // Close on click anywhere
            unfocus();
    });
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
        title = "";
    if (!content)
        content = [];

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
    content.forEach(function(element)
    {
        windowContentElement.append(element);
    });

    var windowData = {
        windowElement: windowElement,
        titleElement: titleElement,
        titleTextElement: titleTextElement,
        titleCloseElement: titleCloseElement,
        titleCloseImgElement: titleCloseImgElement,
        windowTitleSeperatorElement: windowTitleSeperatorElement,
        windowContentElement: windowContentElement,
        windowContentItems: content
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