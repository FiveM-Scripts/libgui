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
            if (typeof text != "string")
                text = "<br></br>"; // New line by default

            SendNUIMessage({ addWindowItem: 1, interfaceId: interfaceId, windowId: id, itemId: uuidv4(), text: text });
        }
    }

    SendNUIMessage({ createWindow: id, interfaceId: interfaceId, height: height, width: width, title: title });
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