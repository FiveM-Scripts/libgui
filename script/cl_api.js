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
        Wait(1000);
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

        createWindow: function(height, width, title, content)
        {
            return buildWindow(id, height, width, title, content);
        }
    };

    SendNUIMessage({ createInterface: id });
    return interface;
}

function buildWindow(interfaceId, height, width, title, content)
{
    if (typeof height != "number")
        height = 150;
    if (typeof width != "number")
        width = 400;
    if (typeof title != "string")
        title = "";
    if (typeof content != "object")
        content = [];

    let id = uuidv4();
    let window =
    {
        
    }

    SendNUIMessage({ createWindow: id, interfaceId: interfaceId, height: height, width: width, title: title, content: content });
    return window;
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