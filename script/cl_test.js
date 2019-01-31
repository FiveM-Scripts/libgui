let interface;

on("libgui:init", function(interfaceBuilder)
{
    interface = interfaceBuilder.createInterface()[0]; // TODO: Investigate why it's an array now?!?!?!
    interface.createWindow();
    interface.createWindow(400, 400, "Deja Vu", [ "<p>Ive been in this place before</p>", "<p>Higher on the street</p>" ]);
    interface.createWindow(50, 100, "New Window");
});

setTick(function()
{
    Wait(1);

    if (IsControlJustReleased(1, 166) && interface) // F5
        interface.show();
});